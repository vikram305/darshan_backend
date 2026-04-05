import { inject, injectable } from 'tsyringe';
import { Either } from '../../../../core/error/Either';
import { Failure } from '../../../../core/error/Failure';
import { WebRtcRepository, WEBRTC_REPOSITORY_INJECTION_TOKEN } from '../repositories/WebRtcRepository';

export interface ResumeConsumerParams {
  roomId: string;
  peerId: string;
  consumerId: string;
}

@injectable()
export class ResumeConsumerUseCase {
  constructor(
    @inject(WEBRTC_REPOSITORY_INJECTION_TOKEN) private readonly webRtcRepository: WebRtcRepository
  ) {}

  execute(params: ResumeConsumerParams): Promise<Either<Failure, void>> {
    return this.webRtcRepository.resumeConsumer(params.roomId, params.peerId, params.consumerId);
  }
}
