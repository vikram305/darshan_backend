import { inject, injectable } from 'tsyringe';
import { Either, left, right } from '../../../../core/error/Either';
import { ServerFailure } from '../../../../core/error/Failure';
import { ERROR_MESSAGES } from '../../../../core/constants/error_messages';
import { Room } from '../entities/Room';
import { RoomRepository, ROOM_REPOSITORY_INJECTION_TOKEN } from '../repositories/RoomRepository';

// We dynamically generate a 6-digit code for the room
function generateRoomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@injectable()
export class CreateRoomUseCase {
  constructor(
    @inject(ROOM_REPOSITORY_INJECTION_TOKEN) private roomRepository: RoomRepository
  ) {}

  async execute(): Promise<Either<ServerFailure, Room>> {
    try {
      const code = generateRoomCode();
      const room = new Room(code);
      await this.roomRepository.save(room);
      return right(room);
    } catch (e) {
      return left(new ServerFailure(ERROR_MESSAGES.ROOM_CREATION_FAILED));
    }
  }
}
