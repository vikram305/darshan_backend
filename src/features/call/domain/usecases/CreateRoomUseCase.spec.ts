import 'reflect-metadata';
import { CreateRoomUseCase } from './CreateRoomUseCase';
import { RoomRepository } from '../repositories/RoomRepository';
import { Room } from '../entities/Room';
import { ERROR_MESSAGES } from '../../../../core/constants/error_messages';

describe('CreateRoomUseCase', () => {
  let createRoomUseCase: CreateRoomUseCase;
  let mockRoomRepository: jest.Mocked<RoomRepository>;

  beforeEach(() => {
    mockRoomRepository = {
      save: jest.fn(),
      findByCode: jest.fn(),
      deleteByCode: jest.fn(),
    };
    createRoomUseCase = new CreateRoomUseCase(mockRoomRepository);
  });

  it('should successfully create a room and save it', async () => {
    mockRoomRepository.save.mockResolvedValue();

    const result = await createRoomUseCase.execute();

    expect(result.isRight()).toBe(true);
    const room = result.value as Room;
    expect(room.code).toBeDefined();
    expect(room.code.length).toBe(6);
    expect(mockRoomRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRoomRepository.save).toHaveBeenCalledWith(room);
  });

  it('should return ServerFailure if repository throws an error', async () => {
    mockRoomRepository.save.mockRejectedValue(new Error('DB Error'));

    const result = await createRoomUseCase.execute();

    expect(result.isLeft()).toBe(true);
    expect((result.value as any).message).toBe(ERROR_MESSAGES.ROOM_CREATION_FAILED);
  });
});
