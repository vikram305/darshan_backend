import 'reflect-metadata';
import http from 'http';
import { Server } from 'socket.io';
import { app } from './app';
import { config } from './core/config';
import { container } from './core/di/injection';
import { MediasoupDataSource } from './features/call/data/datasources/MediasoupDataSource';
import { SignalingGateway } from './features/call/presentation/gateways/SignalingGateway';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

async function bootstrap() {
  try {
    // 1. Initialize Mediasoup
    const mediasoupDataSource = container.resolve(MediasoupDataSource);
    await mediasoupDataSource.initialize();

    // 2. Initialize Socket.io Gateway
    const signalingGateway = new SignalingGateway(io);
    signalingGateway.init();

    // 3. Start Server
    server.listen(config.PORT, () => {
      console.log(`🚀 Darshan Backend running on http://localhost:${config.PORT}`);
    });

  } catch (error) {
    console.error('Failed to bootstrap application', error);
    process.exit(1);
  }
}

bootstrap();
