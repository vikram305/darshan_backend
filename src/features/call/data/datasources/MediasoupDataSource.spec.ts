import 'reflect-metadata';
import * as mediasoup from 'mediasoup';
import { MediasoupDataSource } from './MediasoupDataSource';
import { config } from '../../../../core/config';

// Mock the mediasoup c++ module to prevent intense processes spinning up during test phases
jest.mock('mediasoup', () => ({
  createWorker: jest.fn()
}));

describe('MediasoupDataSource', () => {
  let dataSource: MediasoupDataSource;
  let mockWorker: any;

  beforeEach(() => {
    dataSource = new MediasoupDataSource();
    mockWorker = {
      on: jest.fn(),
      createRouter: jest.fn()
    };
    (mediasoup.createWorker as jest.Mock).mockResolvedValue(mockWorker);

    // Mock console to avoid noisy logs in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize a Mediasoup worker with correct config', async () => {
    await dataSource.initialize();
    
    expect(mediasoup.createWorker).toHaveBeenCalledTimes(1);
    expect(mediasoup.createWorker).toHaveBeenCalledWith({
      logLevel: 'warn',
      logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp'],
      rtcMinPort: config.MEDIASOUP_MIN_PORT,
      rtcMaxPort: config.MEDIASOUP_MAX_PORT,
    });
    expect(mockWorker.on).toHaveBeenCalledWith('died', expect.any(Function));
  });

  it('should allow creating a router with proper codecs after initialization', async () => {
    mockWorker.createRouter.mockResolvedValue('mock-router');
    await dataSource.initialize();
    const router = await dataSource.getOrCreateRouter('room1');
    
    expect(router).toBe('mock-router');
    expect(mockWorker.createRouter).toHaveBeenCalledTimes(1);
    const callArgs = mockWorker.createRouter.mock.calls[0][0];
    expect(callArgs.mediaCodecs).toBeDefined();
    
    // Core FaceTime-quality codecs assert
    expect(callArgs.mediaCodecs.some((c: any) => c.mimeType === 'audio/opus')).toBe(true);
    expect(callArgs.mediaCodecs.some((c: any) => c.mimeType === 'video/VP9')).toBe(true);
    expect(callArgs.mediaCodecs.some((c: any) => c.mimeType === 'video/H264')).toBe(true);
  });

  it('should throw an error if getOrCreateRouter is called before initialize', async () => {
    await expect(dataSource.getOrCreateRouter('room1')).rejects.toThrow('Mediasoup worker not initialized');
  });
});
