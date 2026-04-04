import { inject, injectable } from 'tsyringe';
import { Room } from '../../domain/entities/Room';
import { RoomRepository } from '../../domain/repositories/RoomRepository';
import { RoomDataSource, ROOM_DATA_SOURCE_INJECTION_TOKEN } from '../datasources/RoomDataSource';

@injectable()
export class RoomRepositoryImpl implements RoomRepository {
  constructor(
    @inject(ROOM_DATA_SOURCE_INJECTION_TOKEN) private dataSource: RoomDataSource
  ) {}

  async save(room: Room): Promise<void> {
    await this.dataSource.save(room);
  }

  async findByCode(code: string): Promise<Room | null> {
    return await this.dataSource.findByCode(code);
  }

  async deleteByCode(code: string): Promise<void> {
    await this.dataSource.deleteByCode(code);
  }
}
