import { Server, Socket } from 'socket.io';
import { container } from '../../../../core/di/injection';
import { JoinRoomUseCase } from '../../domain/usecases/JoinRoomUseCase';
import { JoinRoomSchema } from '../dtos/RoomDtos';
import { SOCKET_EVENTS } from '../../../../core/constants/socket_events';

export class SignalingGateway {
  constructor(private io: Server) {}

  public init(): void {
    this.io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {
      console.log(`📡 New WebRTC Client connected: ${socket.id}`);

      socket.on(SOCKET_EVENTS.JOIN_ROOM, async (payload: any, callback: Function) => {
        // Validate payload using Zod
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
        
        console.log(`✅ Peer ${newPeer.name} joined room ${room.code}`);

        if (callback) {
          callback({ success: true, room, peer: newPeer });
        }

        // Notify others
        socket.to(room.code).emit(SOCKET_EVENTS.PEER_JOINED, newPeer);
      });

      socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        console.log(`Client disconnected: ${socket.id}`);
        // Handle peer leave logic here later
      });
    });
  }
}
