import { injectable } from 'tsyringe';
import * as mediasoup from 'mediasoup';
import { types } from 'mediasoup';
import { config } from '../../../../core/config';

@injectable()
export class MediasoupDataSource {
  private worker!: types.Worker;

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

  public async createRouter(): Promise<types.Router> {
    if (!this.worker) {
      throw new Error('Mediasoup worker not initialized');
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
        mimeType: 'video/VP9',
        clockRate: 90000,
        preferredPayloadType: 98,
        parameters: {
          'profile-id': 2,
        },
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

    return await this.worker.createRouter({ mediaCodecs });
  }
}
