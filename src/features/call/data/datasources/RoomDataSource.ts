import { Room } from '../../domain/entities/Room';

export interface RoomDataSource {
  save(room: Room): Promise<void>;
  findByCode(code: string): Promise<Room | null>;
  deleteByCode(code: string): Promise<void>;
}

export const ROOM_DATA_SOURCE_INJECTION_TOKEN = 'RoomDataSource';
