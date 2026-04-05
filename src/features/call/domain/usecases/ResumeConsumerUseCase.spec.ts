import { ResumeConsumerUseCase } from './ResumeConsumerUseCase';
import { WebRtcRepository } from '../repositories/WebRtcRepository';
import { right, left } from '../../../../core/error/Either';
import { Failure } from '../../../../core/error/Failure';

class TestFailure extends Failure {}

describe('ResumeConsumerUseCase', () => {
  let useCase: ResumeConsumerUseCase;
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
    useCase = new ResumeConsumerUseCase(mockWebRtcRepo);
  });

  it('should return void on right (success)', async () => {
    mockWebRtcRepo.resumeConsumer.mockResolvedValue(right(undefined) as any);
    const result = await useCase.execute({ roomId: 'r1', peerId: 'p1', consumerId: 'c1' });
    
    expect(result.isRight()).toBe(true);
    expect(mockWebRtcRepo.resumeConsumer).toHaveBeenCalledWith('r1', 'p1', 'c1');
  });

  it('should return Failure on left (fail)', async () => {
    mockWebRtcRepo.resumeConsumer.mockResolvedValue(left(new TestFailure('Error')) as any);
    const result = await useCase.execute({ roomId: 'r1', peerId: 'p1', consumerId: 'c1' });
    
    expect(result.isLeft()).toBe(true);
  });
});
