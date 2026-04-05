import { GetRouterCapabilitiesUseCase } from './GetRouterCapabilitiesUseCase';
import { WebRtcRepository } from '../repositories/WebRtcRepository';
import { right, left } from '../../../../core/error/Either';
import { Failure } from '../../../../core/error/Failure';
import { RtpCapabilities } from '../entities/WebRtcTypes';

class TestFailure extends Failure {}

describe('GetRouterCapabilitiesUseCase', () => {
  let useCase: GetRouterCapabilitiesUseCase;
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
    useCase = new GetRouterCapabilitiesUseCase(mockWebRtcRepo);
  });

  it('should return router capabilities on right (success)', async () => {
    const mockCapabilities: RtpCapabilities = {
      codecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2,
          preferredPayloadType: 111,
        }
      ]
    };
    mockWebRtcRepo.getRouterCapabilities.mockResolvedValue(right(mockCapabilities));
    const result = await useCase.execute({ roomId: '123' });
    
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toEqual(mockCapabilities);
    }
    expect(mockWebRtcRepo.getRouterCapabilities).toHaveBeenCalledWith('123');
  });

  it('should return Failure on left (fail)', async () => {
    mockWebRtcRepo.getRouterCapabilities.mockResolvedValue(left(new TestFailure('Not found')) as any);
    const result = await useCase.execute({ roomId: '123' });
    
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value.message).toBe('Not found');
    }
  });
});
