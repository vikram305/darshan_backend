import { injectable } from 'tsyringe';
import { Room } from '../../domain/entities/Room';
import { RoomDataSource } from './RoomDataSource';

@injectable()
export class InMemoryRoomDataSource implements RoomDataSource {
  // Keyed by room code
  private rooms: Map<string, Room> = new Map();

  async save(room: Room): Promise<void> {
    this.rooms.set(room.code, room);
  }

  async findByCode(code: string): Promise<Room | null> {
    return this.rooms.get(code) || null;
  }

  async deleteByCode(code: string): Promise<void> {
    this.rooms.delete(code);
  }
}
