import { inject, injectable } from 'tsyringe';
import { Either } from '../../../../core/error/Either';
import { Failure } from '../../../../core/error/Failure';
import { WebRtcRepository, WEBRTC_REPOSITORY_INJECTION_TOKEN } from '../repositories/WebRtcRepository';
import { DtlsParameters } from '../entities/WebRtcTypes';

export interface ConnectTransportParams {
  roomId: string;
  peerId: string;
  transportId: string;
  dtlsParameters: DtlsParameters;
}

@injectable()
export class ConnectTransportUseCase {
  constructor(
    @inject(WEBRTC_REPOSITORY_INJECTION_TOKEN) private readonly webRtcRepository: WebRtcRepository
  ) {}

  execute(params: ConnectTransportParams): Promise<Either<Failure, void>> {
    return this.webRtcRepository.connectTransport(params.roomId, params.peerId, params.transportId, params.dtlsParameters);
  }
}
