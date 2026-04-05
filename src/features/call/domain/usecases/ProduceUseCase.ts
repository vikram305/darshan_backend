import { inject, injectable } from 'tsyringe';
import { Either } from '../../../../core/error/Either';
import { Failure } from '../../../../core/error/Failure';
import { WebRtcRepository, WEBRTC_REPOSITORY_INJECTION_TOKEN } from '../repositories/WebRtcRepository';
import { RtpParameters } from '../entities/WebRtcTypes';

export interface ProduceParams {
  roomId: string;
  peerId: string;
  transportId: string;
  kind: 'audio' | 'video';
  rtpParameters: RtpParameters;
}

@injectable()
export class ProduceUseCase {
  constructor(
    @inject(WEBRTC_REPOSITORY_INJECTION_TOKEN) private readonly webRtcRepository: WebRtcRepository
  ) {}

  execute(params: ProduceParams): Promise<Either<Failure, string>> {
    return this.webRtcRepository.produce(params.roomId, params.peerId, params.transportId, params.kind, params.rtpParameters);
  }
}
