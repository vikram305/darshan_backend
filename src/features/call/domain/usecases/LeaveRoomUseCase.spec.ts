import { LeaveRoomUseCase } from './LeaveRoomUseCase';
import { WebRtcRepository } from '../repositories/WebRtcRepository';
import { RoomRepository } from '../repositories/RoomRepository';
import { Room } from '../entities/Room';
import { Peer } from '../entities/Peer';
import { right } from '../../../../core/error/Either';

describe('LeaveRoomUseCase', () => {
  let useCase: LeaveRoomUseCase;
  let mockWebRtcRepo: jest.Mocked<WebRtcRepository>;
  let mockRoomRepo: jest.Mocked<RoomRepository>;

  beforeEach(() => {
    mockWebRtcRepo = {
      getRouterCapabilities: jest.fn(),
      createTransport: jest.fn(),
      connectTransport: jest.fn(),
      produce: jest.fn(),
      consume: jest.fn(),
      resumeConsumer: jest.fn(),
      leaveRoom: jest.fn(),
    };
    mockRoomRepo = {
      save: jest.fn(),
      findByCode: jest.fn(),
      deleteByCode: jest.fn(),
    };
    useCase = new LeaveRoomUseCase(mockWebRtcRepo, mockRoomRepo);
  });

  it('should call webRtcRepository.leaveRoom and remove peer from room', async () => {
    mockWebRtcRepo.leaveRoom.mockResolvedValue(right(undefined));
    
    const mockRoom = new Room('123456', new Date());
    const mockPeer = new Peer('p1', 'Alice');
    mockRoom.addPeer(mockPeer);
    mockRoomRepo.findByCode.mockResolvedValue(mockRoom);
    mockRoomRepo.save.mockResolvedValue();

    const result = await useCase.execute({ roomId: '123456', peerId: 'p1' });
    
    expect(result.isRight()).toBe(true);
    expect(mockWebRtcRepo.leaveRoom).toHaveBeenCalledWith('123456', 'p1');
    expect(mockRoom.getPeers().length).toBe(0);
    expect(mockRoomRepo.save).toHaveBeenCalledWith(mockRoom);
  });
});
