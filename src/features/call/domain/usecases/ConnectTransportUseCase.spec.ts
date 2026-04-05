import { ConnectTransportUseCase } from './ConnectTransportUseCase';
import { WebRtcRepository } from '../repositories/WebRtcRepository';
import { right, left } from '../../../../core/error/Either';
import { Failure } from '../../../../core/error/Failure';
import { DtlsParameters } from '../entities/WebRtcTypes';

class TestFailure extends Failure {}

describe('ConnectTransportUseCase', () => {
  let useCase: ConnectTransportUseCase;
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
    useCase = new ConnectTransportUseCase(mockWebRtcRepo);
  });

  it('should return void on right (success)', async () => {
    const mockDtlsParameters: DtlsParameters = {
      role: 'client',
      fingerprints: [
        {
          algorithm: 'sha-256',
          value: '00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00'
        }
      ]
    };
    mockWebRtcRepo.connectTransport.mockResolvedValue(right(undefined) as any);
    const result = await useCase.execute({ roomId: 'r1', peerId: 'p1', transportId: 't1', dtlsParameters: mockDtlsParameters });
    
    expect(result.isRight()).toBe(true);
    expect(mockWebRtcRepo.connectTransport).toHaveBeenCalledWith('r1', 'p1', 't1', mockDtlsParameters);
  });

  it('should return Failure on left (fail)', async () => {
    mockWebRtcRepo.connectTransport.mockResolvedValue(left(new TestFailure('Error')) as any);
    const result = await useCase.execute({ roomId: 'r1', peerId: 'p1', transportId: 't1', dtlsParameters: {} as any });
    
    expect(result.isLeft()).toBe(true);
  });
});
