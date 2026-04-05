import { inject, injectable } from 'tsyringe';
import { Either, right } from '../../../../core/error/Either';
import { Failure } from '../../../../core/error/Failure';
import { WebRtcRepository, WEBRTC_REPOSITORY_INJECTION_TOKEN } from '../repositories/WebRtcRepository';
import { RoomRepository, ROOM_REPOSITORY_INJECTION_TOKEN } from '../repositories/RoomRepository';

export interface LeaveRoomParams {
  roomId: string;
  peerId: string;
}

@injectable()
export class LeaveRoomUseCase {
  constructor(
    @inject(WEBRTC_REPOSITORY_INJECTION_TOKEN) private readonly webRtcRepository: WebRtcRepository,
    @inject(ROOM_REPOSITORY_INJECTION_TOKEN) private readonly roomRepository: RoomRepository
  ) {}

  async execute(params: LeaveRoomParams): Promise<Either<Failure, void>> {
    // Clean up WebRTC resources for this peer
    await this.webRtcRepository.leaveRoom(params.roomId, params.peerId);

    // Remove peer from the domain room
    const room = await this.roomRepository.findByCode(params.roomId);
    if (room) {
      room.removePeer(params.peerId);
      await this.roomRepository.save(room);
    }

    return right(undefined);
  }
}
