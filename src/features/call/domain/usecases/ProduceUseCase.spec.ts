import { ProduceUseCase } from './ProduceUseCase';
import { WebRtcRepository } from '../repositories/WebRtcRepository';
import { right, left } from '../../../../core/error/Either';
import { Failure } from '../../../../core/error/Failure';
import { RtpParameters } from '../entities/WebRtcTypes';

class TestFailure extends Failure {}

describe('ProduceUseCase', () => {
  let useCase: ProduceUseCase;
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
    useCase = new ProduceUseCase(mockWebRtcRepo);
  });

  it('should return string on right (success)', async () => {
    const mockRtpParameters: RtpParameters = {
      codecs: [
        {
          mimeType: 'audio/opus',
          payloadType: 111,
          clockRate: 48000,
          channels: 2
        }
      ]
    };
    mockWebRtcRepo.produce.mockResolvedValue(right('producer123'));
    const result = await useCase.execute({ roomId: 'r1', peerId: 'p1', transportId: 't1', kind: 'audio', rtpParameters: mockRtpParameters });
    
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toBe('producer123');
    }
    expect(mockWebRtcRepo.produce).toHaveBeenCalledWith('r1', 'p1', 't1', 'audio', mockRtpParameters);
  });

  it('should return Failure on left (fail)', async () => {
    mockWebRtcRepo.produce.mockResolvedValue(left(new TestFailure('Error')));
    const result = await useCase.execute({ roomId: 'r1', peerId: 'p1', transportId: 't1', kind: 'video', rtpParameters: {} as any });
    
    expect(result.isLeft()).toBe(true);
  });
});
