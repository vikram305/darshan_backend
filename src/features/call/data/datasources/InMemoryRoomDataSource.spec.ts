import 'reflect-metadata';
import { InMemoryRoomDataSource } from './InMemoryRoomDataSource';
import { Room } from '../../domain/entities/Room';

describe('InMemoryRoomDataSource', () => {
  let dataSource: InMemoryRoomDataSource;

  beforeEach(() => {
    dataSource = new InMemoryRoomDataSource();
  });

  it('should save and retrieve a room', async () => {
    const room = new Room('111111');
    await dataSource.save(room);

    const retrieved = await dataSource.findByCode('111111');
    expect(retrieved).toBe(room);
  });

  it('should return null for non-existent room', async () => {
    const retrieved = await dataSource.findByCode('999999');
    expect(retrieved).toBeNull();
  });

  it('should delete a room', async () => {
    const room = new Room('222222');
    await dataSource.save(room);
    await dataSource.deleteByCode('222222');

    const retrieved = await dataSource.findByCode('222222');
    expect(retrieved).toBeNull();
  });
});
