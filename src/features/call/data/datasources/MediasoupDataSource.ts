import { injectable } from 'tsyringe';
import * as mediasoup from 'mediasoup';
import { types } from 'mediasoup';
import { config } from '../../../../core/config';

@injectable()
export class MediasoupDataSource {
  private worker!: types.Worker;
  private routers: Map<string, types.Router> = new Map();
  // peerId -> Map<string(transportId), Transport>
  private transports: Map<string, Map<string, types.Transport>> = new Map();
  // peerId -> Map<string(producerId), Producer>
  private producers: Map<string, Map<string, types.Producer>> = new Map();
  // peerId -> Map<string(consumerId), Consumer>
  private consumers: Map<string, Map<string, types.Consumer>> = new Map();

  public async initialize(): Promise<void> {
    this.worker = await mediasoup.createWorker({
      logLevel: 'warn',
      logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp'],
      rtcMinPort: config.MEDIASOUP_MIN_PORT,
      rtcMaxPort: config.MEDIASOUP_MAX_PORT,
    });

    this.worker.on('died', () => {
      console.error('Mediasoup Worker died, exiting in 2 seconds...');
      setTimeout(() => process.exit(1), 2000);
    });

    console.log('✅ Mediasoup Worker Initialized');
  }

  public async getOrCreateRouter(roomId: string): Promise<types.Router> {
    if (!this.worker) throw new Error('Mediasoup worker not initialized');

    if (this.routers.has(roomId)) {
      return this.routers.get(roomId)!;
    }

    const mediaCodecs: types.RtpCodecCapability[] = [
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
        preferredPayloadType: 111,
      },
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        preferredPayloadType: 96,
      },
      {
        kind: 'video',
        mimeType: 'video/VP9',
        clockRate: 90000,
        preferredPayloadType: 98,
        parameters: { 'profile-id': 2 },
      },
      {
        kind: 'video',
        mimeType: 'video/H264',
        clockRate: 90000,
        preferredPayloadType: 102,
        parameters: {
          'packetization-mode': 1,
          'profile-level-id': '42e01f',
          'level-asymmetry-allowed': 1,
        },
      },
    ];

    const router = await this.worker.createRouter({ mediaCodecs });
    this.routers.set(roomId, router);
    return router;
  }

  public async createWebRtcTransport(roomId: string, peerId: string, direction: 'send' | 'recv'): Promise<types.WebRtcTransport> {
    const router = await this.getOrCreateRouter(roomId);

    const transport = await router.createWebRtcTransport({
      listenIps: [
        {
          ip: '0.0.0.0',
          announcedIp: config.MEDIASOUP_ANNOUNCED_IP,
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      appData: { direction }
    });

    if (!this.transports.has(peerId)) {
      this.transports.set(peerId, new Map());
    }
    this.transports.get(peerId)!.set(transport.id, transport);

    transport.on('dtlsstatechange', (dtlsState) => {
      if (dtlsState === 'closed' || dtlsState === 'failed') {
        transport.close();
      }
    });

    return transport;
  }

  public async connectTransport(peerId: string, transportId: string, dtlsParameters: types.DtlsParameters): Promise<void> {
    const transportMap = this.transports.get(peerId);
    if (!transportMap) throw new Error('Peer transports not found');
    const transport = transportMap.get(transportId);
    if (!transport) throw new Error('Transport not found');

    await transport.connect({ dtlsParameters });
  }

  public async produce(peerId: string, transportId: string, kind: types.MediaKind, rtpParameters: types.RtpParameters): Promise<types.Producer> {
    const transportMap = this.transports.get(peerId);
    if (!transportMap) throw new Error('Peer transports not found');
    const transport = transportMap.get(transportId);
    if (!transport) throw new Error('Transport not found');

    const producer = await transport.produce({ kind, rtpParameters });

    if (!this.producers.has(peerId)) {
      this.producers.set(peerId, new Map());
    }
    this.producers.get(peerId)!.set(producer.id, producer);

    return producer;
  }

  public async consume(peerId: string, roomId: string, producerId: string, rtpCapabilities: types.RtpCapabilities): Promise<types.Consumer> {
    const router = this.routers.get(roomId);
    if (!router) throw new Error('Router not found');

    if (!router.canConsume({ producerId, rtpCapabilities })) {
      throw new Error(`Client cannot consume producer ${producerId}`);
    }

    // Find the transport for consuming
    const transportMap = this.transports.get(peerId);
    if (!transportMap) throw new Error('Peer transports not found');
    const transport = Array.from(transportMap.values()).find(t => t.appData.direction === 'recv') || Array.from(transportMap.values())[0];
    if (!transport) throw new Error('Transport for consuming not found');

    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused: true, // Automatically start paused so client can request resume to avoid dropping keyframes
    });

    if (!this.consumers.has(peerId)) {
      this.consumers.set(peerId, new Map());
    }
    this.consumers.get(peerId)!.set(consumer.id, consumer);

    return consumer;
  }

  public async resumeConsumer(peerId: string, consumerId: string): Promise<void> {
    const consumerMap = this.consumers.get(peerId);
    if (!consumerMap) throw new Error('Peer consumers not found');
    const consumer = consumerMap.get(consumerId);
    if (!consumer) throw new Error('Consumer not found');

    await consumer.resume();
  }

  public async leaveRoom(roomId: string, peerId: string): Promise<void> {
    const transports = this.transports.get(peerId);
    if (transports) {
      for (const transport of transports.values()) {
        transport.close();
      }
      this.transports.delete(peerId);
    }
    this.producers.delete(peerId);
    this.consumers.delete(peerId);

    // If room is empty, clear router (garbage collection)
    // To do this simply, we assume leaving a peer decreases peer count. We need a way to check if peers are empty but Domain Room manages this.
    // For now, we will expose a clearRoom() method that gets called fully if no peers exist.
  }

  public async clearRoom(roomId: string): Promise<void> {
    const router = this.routers.get(roomId);
    if (router) {
      router.close();
      this.routers.delete(roomId);
    }
  }

  public getRouter(roomId: string): types.Router | undefined {
    return this.routers.get(roomId);
  }
}
