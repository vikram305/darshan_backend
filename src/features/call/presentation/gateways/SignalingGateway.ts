import { Server, Socket } from 'socket.io';
import { container } from '../../../../core/di/injection';
import { JoinRoomUseCase } from '../../domain/usecases/JoinRoomUseCase';
import { GetRouterCapabilitiesUseCase } from '../../domain/usecases/GetRouterCapabilitiesUseCase';
import { CreateTransportUseCase } from '../../domain/usecases/CreateTransportUseCase';
import { ConnectTransportUseCase } from '../../domain/usecases/ConnectTransportUseCase';
import { ProduceUseCase } from '../../domain/usecases/ProduceUseCase';
import { ConsumeUseCase } from '../../domain/usecases/ConsumeUseCase';
import { ResumeConsumerUseCase } from '../../domain/usecases/ResumeConsumerUseCase';
import { LeaveRoomUseCase } from '../../domain/usecases/LeaveRoomUseCase';

import { JoinRoomSchema } from '../dtos/RoomDtos';
import {
  GetRouterCapabilitiesSchema,
  CreateTransportSchema,
  ConnectTransportSchema,
  ProduceSchema,
  ConsumeSchema,
  ResumeConsumerSchema
} from '../dtos/WebRtcDtos';
import { SOCKET_EVENTS } from '../../../../core/constants/socket_events';

export class SignalingGateway {
  // Map socket.id to a { roomId, peerId } pair to handle disconnects properly
  private activeConnections = new Map<string, { roomId: string; peerId: string }>();

  constructor(private io: Server) {}

  public init(): void {
    this.io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {
      console.log(`📡 New WebRTC Client connected: ${socket.id}`);

      // 1. Join Room
      socket.on(SOCKET_EVENTS.JOIN_ROOM, async (payload: any, callback: Function) => {
        const parsed = JoinRoomSchema.safeParse(payload);
        if (!parsed.success) {
          if (callback) callback({ error: parsed.error.format() });
          return;
        }

        const useCase = container.resolve(JoinRoomUseCase);
        const result = await useCase.execute(parsed.data);

        if (result.isLeft()) {
          console.error(`Client ${socket.id} failed to join: ${result.value.message}`);
          if (callback) callback({ error: result.value.message });
          return;
        }

        const { room, newPeer } = result.value;
        socket.join(room.code);
        
        // Save to active connections for disconnect handling
        this.activeConnections.set(socket.id, { roomId: room.code, peerId: newPeer.id });

        console.log(`✅ Peer ${newPeer.name} joined room ${room.code}`);

        if (callback) {
          callback({ success: true, room, peer: newPeer });
        }

        socket.to(room.code).emit(SOCKET_EVENTS.PEER_JOINED, newPeer);
      });

      // 2. Get Router RTP Capabilities
      socket.on(SOCKET_EVENTS.GET_ROUTER_RTP_CAPABILITIES, async (payload: any, callback: Function) => {
        const parsed = GetRouterCapabilitiesSchema.safeParse(payload);
        if (!parsed.success) return callback && callback({ error: parsed.error.format() });

        const useCase = container.resolve(GetRouterCapabilitiesUseCase);
        const result = await useCase.execute(parsed.data);

        if (result.isLeft()) return callback && callback({ error: result.value.message });
        if (callback) callback({ rtpCapabilities: result.value });
      });

      // 3. Create Transport
      socket.on(SOCKET_EVENTS.CREATE_TRANSPORT, async (payload: any, callback: Function) => {
        const parsed = CreateTransportSchema.safeParse(payload);
        if (!parsed.success) return callback && callback({ error: parsed.error.format() });

        const useCase = container.resolve(CreateTransportUseCase);
        const result = await useCase.execute(parsed.data);

        if (result.isLeft()) return callback && callback({ error: result.value.message });
        if (callback) callback({ transportOptions: result.value });
      });

      // 4. Connect Transport
      socket.on(SOCKET_EVENTS.CONNECT_TRANSPORT, async (payload: any, callback: Function) => {
        const parsed = ConnectTransportSchema.safeParse(payload);
        if (!parsed.success) return callback && callback({ error: parsed.error.format() });

        const useCase = container.resolve(ConnectTransportUseCase);
        const result = await useCase.execute(parsed.data);

        if (result.isLeft()) return callback && callback({ error: result.value.message });
        if (callback) callback({ success: true });
      });

      // 5. Produce
      socket.on(SOCKET_EVENTS.PRODUCE, async (payload: any, callback: Function) => {
        const parsed = ProduceSchema.safeParse(payload);
        if (!parsed.success) return callback && callback({ error: parsed.error.format() });

        const useCase = container.resolve(ProduceUseCase);
        const result = await useCase.execute(parsed.data);

        if (result.isLeft()) return callback && callback({ error: result.value.message });
        
        const producerId = result.value;
        if (callback) callback({ id: producerId });
        
        // Notify others in room
        socket.to(parsed.data.roomId).emit(SOCKET_EVENTS.NEW_PRODUCER, {
            peerId: parsed.data.peerId,
            producerId,
            kind: parsed.data.kind
        });
      });

      // 6. Consume
      socket.on(SOCKET_EVENTS.CONSUME, async (payload: any, callback: Function) => {
        const parsed = ConsumeSchema.safeParse(payload);
        if (!parsed.success) return callback && callback({ error: parsed.error.format() });

        const useCase = container.resolve(ConsumeUseCase);
        const result = await useCase.execute(parsed.data);

        if (result.isLeft()) return callback && callback({ error: result.value.message });
        if (callback) callback({ consumerOptions: result.value });
      });

      // 7. Resume Consumer
      socket.on(SOCKET_EVENTS.RESUME_CONSUMER, async (payload: any, callback: Function) => {
        const parsed = ResumeConsumerSchema.safeParse(payload);
        if (!parsed.success) return callback && callback({ error: parsed.error.format() });

        const useCase = container.resolve(ResumeConsumerUseCase);
        const result = await useCase.execute(parsed.data);

        if (result.isLeft()) return callback && callback({ error: result.value.message });
        if (callback) callback({ success: true });
      });

      // Handle Disconnect & Cleanup
      socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
        console.log(`Client disconnected: ${socket.id}`);
        const connection = this.activeConnections.get(socket.id);
        
        if (connection) {
          const { roomId, peerId } = connection;
          
          const useCase = container.resolve(LeaveRoomUseCase);
          await useCase.execute({ roomId, peerId });
          
          // Notify others in the room
          socket.to(roomId).emit(SOCKET_EVENTS.PEER_LEFT, { peerId });
          
          this.activeConnections.delete(socket.id);
          console.log(`🧹 Cleaned up peer ${peerId} from room ${roomId}`);
        }
      });
    });
  }
}
