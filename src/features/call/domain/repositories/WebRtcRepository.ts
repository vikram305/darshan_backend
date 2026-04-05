import { Either } from '../../../../core/error/Either';
import { Failure } from '../../../../core/error/Failure';
import { 
  IceParameters, 
  IceCandidate, 
  DtlsParameters, 
  RtpParameters, 
  RtpCapabilities 
} from '../entities/WebRtcTypes';

export interface TransportOptions {
  id: string;
  iceParameters: IceParameters;
  iceCandidates: IceCandidate[];
  dtlsParameters: DtlsParameters;
}

export interface ConsumerOptions {
  id: string;
  producerId: string;
  kind: string;
  rtpParameters: RtpParameters;
}

export interface WebRtcRepository {
  getRouterCapabilities(roomId: string): Promise<Either<Failure, RtpCapabilities>>;
  createTransport(roomId: string, peerId: string, direction: 'send' | 'recv'): Promise<Either<Failure, TransportOptions>>;
  connectTransport(roomId: string, peerId: string, transportId: string, dtlsParameters: DtlsParameters): Promise<Either<Failure, void>>;
  produce(roomId: string, peerId: string, transportId: string, kind: 'audio' | 'video', rtpParameters: RtpParameters): Promise<Either<Failure, string>>;
  consume(roomId: string, peerId: string, producerId: string, rtpCapabilities: RtpCapabilities): Promise<Either<Failure, ConsumerOptions>>;
  resumeConsumer(roomId: string, peerId: string, consumerId: string): Promise<Either<Failure, void>>;
  leaveRoom(roomId: string, peerId: string): Promise<Either<Failure, void>>;
}

export const WEBRTC_REPOSITORY_INJECTION_TOKEN = 'WebRtcRepository';
