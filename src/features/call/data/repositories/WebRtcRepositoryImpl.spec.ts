import { WebRtcRepositoryImpl } from './WebRtcRepositoryImpl';
import { MediasoupDataSource } from '../datasources/MediasoupDataSource';
import { RoomRepository } from '../../domain/repositories/RoomRepository';
import { Room } from '../../domain/entities/Room';

describe('WebRtcRepositoryImpl', () => {
  let repo: WebRtcRepositoryImpl;
  let mockMediasoupDS: jest.Mocked<MediasoupDataSource>;
  let mockRoomRepo: jest.Mocked<RoomRepository>;

  beforeEach(() => {
    mockMediasoupDS = {
      initialize: jest.fn(),
      getOrCreateRouter: jest.fn(),
      createWebRtcTransport: jest.fn(),
      connectTransport: jest.fn(),
      produce: jest.fn(),
      consume: jest.fn(),
      resumeConsumer: jest.fn(),
      leaveRoom: jest.fn(),
      clearRoom: jest.fn(),
      getRouter: jest.fn(),
    } as unknown as jest.Mocked<MediasoupDataSource>;

    mockRoomRepo = {
      save: jest.fn(),
      findByCode: jest.fn(),
      deleteByCode: jest.fn(),
    };

    repo = new WebRtcRepositoryImpl(mockMediasoupDS, mockRoomRepo);
  });

  it('should get router capabilities', async () => {
    mockMediasoupDS.getOrCreateRouter.mockResolvedValue({ rtpCapabilities: { codecs: [] } } as any);
    const result = await repo.getRouterCapabilities('room1');
    expect(result.isRight()).toBe(true);
  });

  it('should create transport', async () => {
    mockMediasoupDS.createWebRtcTransport.mockResolvedValue({ 
      id: 't1', 
      iceParameters: { usernameFragment: 'u', password: 'p' }, 
      iceCandidates: [], 
      dtlsParameters: { fingerprints: [] }, 
      appData: {} 
    } as any);
    const result = await repo.createTransport('room1', 'peer1', 'send');
    expect(result.isRight()).toBe(true);
  });

  it('should connect transport', async () => {
    mockMediasoupDS.connectTransport.mockResolvedValue();
    const result = await repo.connectTransport('room1', 'peer1', 't1', { fingerprints: [] });
    expect(result.isRight()).toBe(true);
  });
  
  it('should leave room and check for GC', async () => {
    mockMediasoupDS.leaveRoom.mockResolvedValue();
    const mockRoom = new Room('123456', new Date()); // 0 peers
    mockRoomRepo.findByCode.mockResolvedValue(mockRoom);
    mockMediasoupDS.clearRoom.mockResolvedValue();

    const result = await repo.leaveRoom('123456', 'p1');
    
    expect(result.isRight()).toBe(true);
    expect(mockMediasoupDS.leaveRoom).toHaveBeenCalledWith('123456', 'p1');
    expect(mockRoomRepo.findByCode).toHaveBeenCalledWith('123456');
    expect(mockMediasoupDS.clearRoom).toHaveBeenCalledWith('123456');
  });
});
