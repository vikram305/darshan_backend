import 'reflect-metadata';
import { SignalingGateway } from './SignalingGateway';
import { container } from '../../../../core/di/injection';
import { JoinRoomUseCase } from '../../domain/usecases/JoinRoomUseCase';
import { right, left } from '../../../../core/error/Either';
import { Room } from '../../domain/entities/Room';
import { Peer } from '../../domain/entities/Peer';
import { SOCKET_EVENTS } from '../../../../core/constants/socket_events';

describe('SignalingGateway', () => {
  let signalingGateway: SignalingGateway;
  let mockIo: any;
  let mockSocket: any;
  let mockJoinRoomUseCase: jest.Mocked<JoinRoomUseCase>;

  beforeEach(() => {
    mockSocket = {
      id: 'socket-123',
      on: jest.fn(),
      join: jest.fn(),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn()
    };

    mockIo = {
      on: jest.fn()
    };

    mockJoinRoomUseCase = {
      execute: jest.fn()
    } as any;

    container.clearInstances();
    container.registerInstance(JoinRoomUseCase, mockJoinRoomUseCase);

    signalingGateway = new SignalingGateway(mockIo);
    
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize connection listener', () => {
    signalingGateway.init();
    expect(mockIo.on).toHaveBeenCalledWith(SOCKET_EVENTS.CONNECTION, expect.any(Function));
  });

  it('should handle join-room event successfully', async () => {
    signalingGateway.init();
    
    // Extract the connection callback and trigger it
    const connectionCallback = mockIo.on.mock.calls[0][1];
    connectionCallback(mockSocket);

    // Find the join-room event listener that was registered
    const joinRoomCall = mockSocket.on.mock.calls.find((call: any[]) => call[0] === SOCKET_EVENTS.JOIN_ROOM);
    expect(joinRoomCall).toBeDefined();
    const joinRoomCallback = joinRoomCall[1];

    const fakeRoom = new Room('123456');
    const fakePeer = new Peer('peer-1', 'Alice');
    mockJoinRoomUseCase.execute.mockResolvedValue(right({ room: fakeRoom, newPeer: fakePeer }));

    const mockAck = jest.fn();
    
    // Execute the socket event handler logic
    await joinRoomCallback({ code: '123456', peerName: 'Alice' }, mockAck);

    expect(mockJoinRoomUseCase.execute).toHaveBeenCalledWith({ code: '123456', peerName: 'Alice' });
    expect(mockSocket.join).toHaveBeenCalledWith('123456');
    
    // Should ack success to sender
    expect(mockAck).toHaveBeenCalledWith({ success: true, room: fakeRoom, peer: fakePeer });
    
    // Should emit to the rest of the room
    expect(mockSocket.to).toHaveBeenCalledWith('123456');
    expect(mockSocket.emit).toHaveBeenCalledWith(SOCKET_EVENTS.PEER_JOINED, fakePeer);
  });

  it('should reject invalid dto on join-room', async () => {
    signalingGateway.init();
    const connectionCallback = mockIo.on.mock.calls[0][1];
    connectionCallback(mockSocket);

    const joinRoomCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === SOCKET_EVENTS.JOIN_ROOM)[1];
    const mockAck = jest.fn();
    
    // Execute with invalid payload (missing peerName)
    await joinRoomCallback({ code: '123456' }, mockAck);

    expect(mockJoinRoomUseCase.execute).not.toHaveBeenCalled();
    expect(mockAck).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(Object) }));
  });

  it('should reject when JoinRoomUseCase returns a Left failure', async () => {
    signalingGateway.init();
    const connectionCallback = mockIo.on.mock.calls[0][1];
    connectionCallback(mockSocket);

    const joinRoomCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === SOCKET_EVENTS.JOIN_ROOM)[1];
    const mockAck = jest.fn();
    
    mockJoinRoomUseCase.execute.mockResolvedValue(left({ message: 'Internal Error', code: 500 } as any));

    await joinRoomCallback({ code: '123456', peerName: 'Bob' }, mockAck);

    expect(mockAck).toHaveBeenCalledWith({ error: 'Internal Error' });
    expect(mockSocket.join).not.toHaveBeenCalled();
  });

  it('should handle disconnect event', () => {
    signalingGateway.init();
    const connectionCallback = mockIo.on.mock.calls[0][1];
    connectionCallback(mockSocket);

    const disconnectCall = mockSocket.on.mock.calls.find((call: any[]) => call[0] === SOCKET_EVENTS.DISCONNECT);
    expect(disconnectCall).toBeDefined();

    const disconnectCallback = disconnectCall[1];
    // We just verify it executes without errors (since it's a console log currently)
    expect(() => disconnectCallback()).not.toThrow();
  });
});
