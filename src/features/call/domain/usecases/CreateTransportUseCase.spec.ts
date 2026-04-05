import { CreateTransportUseCase } from './CreateTransportUseCase';
import { WebRtcRepository, TransportOptions } from '../repositories/WebRtcRepository';
import { right, left } from '../../../../core/error/Either';
import { Failure } from '../../../../core/error/Failure';

class TestFailure extends Failure {}

describe('CreateTransportUseCase', () => {
  let useCase: CreateTransportUseCase;
  let mockWebRtcRepo: jest.Mocked<WebRtcRepository>;

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
    useCase = new CreateTransportUseCase(mockWebRtcRepo);
  });

  it('should return transport options on right (success)', async () => {
    const mockOptions: TransportOptions = { 
      id: 't1', 
      iceParameters: { usernameFragment: 'u', password: 'p' }, 
      iceCandidates: [], 
      dtlsParameters: { fingerprints: [] } 
    };
    mockWebRtcRepo.createTransport.mockResolvedValue(right(mockOptions) as any);
    const result = await useCase.execute({ roomId: 'r1', peerId: 'p1', direction: 'send' });
    
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toEqual(mockOptions);
    }
    expect(mockWebRtcRepo.createTransport).toHaveBeenCalledWith('r1', 'p1', 'send');
  });

  it('should return Failure on left (fail)', async () => {
    mockWebRtcRepo.createTransport.mockResolvedValue(left(new TestFailure('Error')) as any);
    const result = await useCase.execute({ roomId: 'r1', peerId: 'p1', direction: 'recv' });
    
    expect(result.isLeft()).toBe(true);
  });
});
