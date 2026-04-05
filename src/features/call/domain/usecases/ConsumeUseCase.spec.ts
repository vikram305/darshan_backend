import { ConsumeUseCase } from './ConsumeUseCase';
import { WebRtcRepository, ConsumerOptions } from '../repositories/WebRtcRepository';
import { right, left } from '../../../../core/error/Either';
import { Failure } from '../../../../core/error/Failure';
import { RtpCapabilities } from '../entities/WebRtcTypes';

class TestFailure extends Failure {}

describe('ConsumeUseCase', () => {
  let useCase: ConsumeUseCase;
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
    useCase = new ConsumeUseCase(mockWebRtcRepo);
  });

  it('should return consumer options on right (success)', async () => {
    const mockRtpCapabilities: RtpCapabilities = {
      codecs: [
        {
          kind: 'video',
          mimeType: 'video/VP9',
          clockRate: 90000,
          preferredPayloadType: 98,
        }
      ]
    };
    const mockOptions: ConsumerOptions = {
        id: 'c1',
        producerId: 'prod1',
        kind: 'video',
        rtpParameters: {
            codecs: [
                {
                    mimeType: 'video/VP9',
                    payloadType: 98,
                    clockRate: 90000,
                }
            ]
        }
    };
    mockWebRtcRepo.consume.mockResolvedValue(right(mockOptions) as any);
    const result = await useCase.execute({ roomId: 'r1', peerId: 'p1', producerId: 'prod1', rtpCapabilities: mockRtpCapabilities });
    
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toEqual(mockOptions);
    }
    expect(mockWebRtcRepo.consume).toHaveBeenCalledWith('r1', 'p1', 'prod1', mockRtpCapabilities);
  });

  it('should return Failure on left (fail)', async () => {
    mockWebRtcRepo.consume.mockResolvedValue(left(new TestFailure('Error')) as any);
    const result = await useCase.execute({ roomId: 'r1', peerId: 'p1', producerId: 'prod1', rtpCapabilities: {} as any });
    
    expect(result.isLeft()).toBe(true);
  });
});
