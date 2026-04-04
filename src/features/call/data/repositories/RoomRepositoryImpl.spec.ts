import 'reflect-metadata';
import { RoomRepositoryImpl } from './RoomRepositoryImpl';
import { RoomDataSource } from '../datasources/RoomDataSource';
import { Room } from '../../domain/entities/Room';

describe('RoomRepositoryImpl', () => {
  let repository: RoomRepositoryImpl;
  let mockDataSource: jest.Mocked<RoomDataSource>;

  beforeEach(() => {
    mockDataSource = {
      save: jest.fn(),
      findByCode: jest.fn(),
      deleteByCode: jest.fn(),
    };
    repository = new RoomRepositoryImpl(mockDataSource);
  });

  it('should delegate save to data source', async () => {
    const room = new Room('123456');
    mockDataSource.save.mockResolvedValue();

    await repository.save(room);
    expect(mockDataSource.save).toHaveBeenCalledWith(room);
  });

  it('should delegate findByCode to data source', async () => {
    const room = new Room('123456');
    mockDataSource.findByCode.mockResolvedValue(room);

    const result = await repository.findByCode('123456');
    expect(mockDataSource.findByCode).toHaveBeenCalledWith('123456');
    expect(result).toBe(room);
  });

  it('should delegate deleteByCode to data source', async () => {
    mockDataSource.deleteByCode.mockResolvedValue();

    await repository.deleteByCode('123456');
    expect(mockDataSource.deleteByCode).toHaveBeenCalledWith('123456');
  });
});
