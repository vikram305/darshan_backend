import { inject, injectable } from 'tsyringe';
import { Either } from '../../../../core/error/Either';
import { Failure } from '../../../../core/error/Failure';
import { WebRtcRepository, WEBRTC_REPOSITORY_INJECTION_TOKEN, ConsumerOptions } from '../repositories/WebRtcRepository';
import { RtpCapabilities } from '../entities/WebRtcTypes';

export interface ConsumeParams {
  roomId: string;
  peerId: string;
  producerId: string;
  rtpCapabilities: RtpCapabilities;
}

@injectable()
export class ConsumeUseCase {
  constructor(
    @inject(WEBRTC_REPOSITORY_INJECTION_TOKEN) private readonly webRtcRepository: WebRtcRepository
  ) {}

  execute(params: ConsumeParams): Promise<Either<Failure, ConsumerOptions>> {
    return this.webRtcRepository.consume(params.roomId, params.peerId, params.producerId, params.rtpCapabilities);
  }
}
