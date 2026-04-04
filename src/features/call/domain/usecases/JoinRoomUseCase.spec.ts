import 'reflect-metadata';
import { JoinRoomUseCase } from './JoinRoomUseCase';
import { RoomRepository } from '../repositories/RoomRepository';
import { Room } from '../entities/Room';
import { ERROR_MESSAGES } from '../../../../core/constants/error_messages';

describe('JoinRoomUseCase', () => {
  let joinRoomUseCase: JoinRoomUseCase;
  let mockRoomRepository: jest.Mocked<RoomRepository>;

  beforeEach(() => {
    mockRoomRepository = {
      save: jest.fn(),
      findByCode: jest.fn(),
      deleteByCode: jest.fn(),
    };
    joinRoomUseCase = new JoinRoomUseCase(mockRoomRepository);
  });

  it('should successfully join a room and add a peer', async () => {
    const room = new Room('123456');
    mockRoomRepository.findByCode.mockResolvedValue(room);
    mockRoomRepository.save.mockResolvedValue();

    const result = await joinRoomUseCase.execute({ code: '123456', peerName: 'Alice' });

    expect(result.isRight()).toBe(true);
    const { room: updatedRoom, newPeer } = (result as any).value;
    
    expect(updatedRoom.code).toBe('123456');
    expect(newPeer.name).toBe('Alice');
    expect(updatedRoom.getPeers().length).toBe(1);
    expect(mockRoomRepository.save).toHaveBeenCalledWith(updatedRoom);
  });

  it('should return NotFoundFailure if room code does not exist', async () => {
    mockRoomRepository.findByCode.mockResolvedValue(null);

    const result = await joinRoomUseCase.execute({ code: '000000', peerName: 'Bob' });

    expect(result.isLeft()).toBe(true);
    expect((result as any).value.message).toBe(ERROR_MESSAGES.ROOM_NOT_FOUND);
  });
});
