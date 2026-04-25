import { inject, injectable } from 'tsyringe';
import { WebRtcRepository, TransportOptions, ConsumerOptions } from '../../domain/repositories/WebRtcRepository';
import { Either, right, left } from '../../../../core/error/Either';
import { ServerFailure, Failure } from '../../../../core/error/Failure';
import { MediasoupDataSource } from '../datasources/MediasoupDataSource';
import { ERROR_MESSAGES } from '../../../../core/constants/error_messages';
import { RoomRepository, ROOM_REPOSITORY_INJECTION_TOKEN } from '../../domain/repositories/RoomRepository';
import { DtlsParameters, RtpParameters, RtpCapabilities } from '../../domain/entities/WebRtcTypes';
import { types } from 'mediasoup';

@injectable()
export class WebRtcRepositoryImpl implements WebRtcRepository {
  constructor(
    @inject(MediasoupDataSource) private readonly mediasoupDataSource: MediasoupDataSource,
    @inject(ROOM_REPOSITORY_INJECTION_TOKEN) private readonly roomRepository: RoomRepository
  ) {}

  async getRouterCapabilities(roomId: string): Promise<Either<Failure, RtpCapabilities>> {
    try {
      const router = await this.mediasoupDataSource.getOrCreateRouter(roomId);
      return right(router.rtpCapabilities as RtpCapabilities);
    } catch (e) {
      return left(new ServerFailure(ERROR_MESSAGES.WEBRTC_ERROR));
    }
  }

  async createTransport(roomId: string, peerId: string, direction: 'send' | 'recv'): Promise<Either<Failure, TransportOptions>> {
    try {
      const transport = await this.mediasoupDataSource.createWebRtcTransport(roomId, peerId, direction);
      return right({
        id: transport.id,
        iceParameters: transport.iceParameters as any,
        iceCandidates: transport.iceCandidates as any,
        dtlsParameters: transport.dtlsParameters as any,
      });
    } catch (e) {
      return left(new ServerFailure(ERROR_MESSAGES.WEBRTC_ERROR));
    }
  }

  async connectTransport(roomId: string, peerId: string, transportId: string, dtlsParameters: DtlsParameters): Promise<Either<Failure, void>> {
    try {
      await this.mediasoupDataSource.connectTransport(peerId, transportId, dtlsParameters as types.DtlsParameters);
      return right(undefined);
    } catch (e) {
      return left(new ServerFailure((e as Error).message || ERROR_MESSAGES.WEBRTC_ERROR));
    }
  }

  async produce(roomId: string, peerId: string, transportId: string, kind: 'audio' | 'video', rtpParameters: RtpParameters): Promise<Either<Failure, string>> {
    try {
      const producer = await this.mediasoupDataSource.produce(peerId, transportId, kind as types.MediaKind, rtpParameters as types.RtpParameters);
      return right(producer.id);
    } catch (e) {
      return left(new ServerFailure((e as Error).message || ERROR_MESSAGES.WEBRTC_ERROR));
    }
  }

  async consume(roomId: string, peerId: string, producerId: string, rtpCapabilities: RtpCapabilities): Promise<Either<Failure, ConsumerOptions>> {
    try {
      const consumer = await this.mediasoupDataSource.consume(peerId, roomId, producerId, rtpCapabilities as types.RtpCapabilities);
      return right({
        id: consumer.id,
        producerId: consumer.producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters as RtpParameters,
      });
    } catch (e) {
      return left(new ServerFailure((e as Error).message || ERROR_MESSAGES.WEBRTC_ERROR));
    }
  }

  async resumeConsumer(roomId: string, peerId: string, consumerId: string): Promise<Either<Failure, void>> {
    try {
      await this.mediasoupDataSource.resumeConsumer(peerId, consumerId);
      return right(undefined);
    } catch (e) {
      return left(new ServerFailure((e as Error).message || ERROR_MESSAGES.WEBRTC_ERROR));
    }
  }

  async leaveRoom(roomId: string, peerId: string): Promise<Either<Failure, void>> {
    try {
      await this.mediasoupDataSource.leaveRoom(roomId, peerId);
      const room = await this.roomRepository.findByCode(roomId);
      if (room && room.getPeers().length <= 1) {
        await this.mediasoupDataSource.clearRoom(roomId);
      }
      return right(undefined);
    } catch (e) {
      return left(new ServerFailure((e as Error).message || ERROR_MESSAGES.WEBRTC_ERROR));
    }
  }
}
