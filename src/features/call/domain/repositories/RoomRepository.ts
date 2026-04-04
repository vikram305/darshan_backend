import { Room } from '../entities/Room';

export interface RoomRepository {
  save(room: Room): Promise<void>;
  findByCode(code: string): Promise<Room | null>;
  deleteByCode(code: string): Promise<void>;
}

export const ROOM_REPOSITORY_INJECTION_TOKEN = 'RoomRepository';
