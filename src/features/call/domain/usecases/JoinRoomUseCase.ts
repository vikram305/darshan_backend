import { inject, injectable } from 'tsyringe';
import { Either, left, right } from '../../../../core/error/Either';
import { NotFoundFailure, ServerFailure, Failure } from '../../../../core/error/Failure';
import { ERROR_MESSAGES } from '../../../../core/constants/error_messages';
import { Room } from '../entities/Room';
import { RoomRepository, ROOM_REPOSITORY_INJECTION_TOKEN } from '../repositories/RoomRepository';
import { Peer } from '../entities/Peer';
import { randomUUID } from 'crypto';

export interface JoinRoomParams {
  code: string;
  peerName: string;
}

@injectable()
export class JoinRoomUseCase {
  constructor(
    @inject(ROOM_REPOSITORY_INJECTION_TOKEN) private roomRepository: RoomRepository
  ) {}

  async execute(params: JoinRoomParams): Promise<Either<Failure, { room: Room; newPeer: Peer }>> {
    try {
      const room = await this.roomRepository.findByCode(params.code);
      
      if (!room) {
        return left(new NotFoundFailure(ERROR_MESSAGES.ROOM_NOT_FOUND));
      }

      const newPeerId = randomUUID();
      const newPeer = new Peer(newPeerId, params.peerName);
      
      room.addPeer(newPeer);
      await this.roomRepository.save(room); // Update room with new peer

      return right({ room, newPeer });
    } catch (e) {
      return left(new ServerFailure(ERROR_MESSAGES.ROOM_JOIN_FAILED));
    }
  }
}
