import { inject, injectable } from 'tsyringe';
import { Either } from '../../../../core/error/Either';
import { Failure } from '../../../../core/error/Failure';
import { WebRtcRepository, WEBRTC_REPOSITORY_INJECTION_TOKEN } from '../repositories/WebRtcRepository';
import { RtpCapabilities } from '../entities/WebRtcTypes';

export interface GetRouterCapabilitiesParams {
  roomId: string;
}

@injectable()
export class GetRouterCapabilitiesUseCase {
  constructor(
    @inject(WEBRTC_REPOSITORY_INJECTION_TOKEN) private readonly webRtcRepository: WebRtcRepository
  ) {}

  execute(params: GetRouterCapabilitiesParams): Promise<Either<Failure, RtpCapabilities>> {
    return this.webRtcRepository.getRouterCapabilities(params.roomId);
  }
}
