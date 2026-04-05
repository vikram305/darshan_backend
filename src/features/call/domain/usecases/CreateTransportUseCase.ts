import { inject, injectable } from 'tsyringe';
import { Either } from '../../../../core/error/Either';
import { Failure } from '../../../../core/error/Failure';
import { WebRtcRepository, WEBRTC_REPOSITORY_INJECTION_TOKEN, TransportOptions } from '../repositories/WebRtcRepository';

export interface CreateTransportParams {
  roomId: string;
  peerId: string;
  direction: 'send' | 'recv';
}

@injectable()
export class CreateTransportUseCase {
  constructor(
    @inject(WEBRTC_REPOSITORY_INJECTION_TOKEN) private readonly webRtcRepository: WebRtcRepository
  ) {}

  execute(params: CreateTransportParams): Promise<Either<Failure, TransportOptions>> {
    return this.webRtcRepository.createTransport(params.roomId, params.peerId, params.direction);
  }
}
