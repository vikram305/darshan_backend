import 'reflect-metadata';
import { container } from 'tsyringe';

import { ROOM_DATA_SOURCE_INJECTION_TOKEN } from '../../features/call/data/datasources/RoomDataSource';
import { InMemoryRoomDataSource } from '../../features/call/data/datasources/InMemoryRoomDataSource';

import { ROOM_REPOSITORY_INJECTION_TOKEN } from '../../features/call/domain/repositories/RoomRepository';
import { RoomRepositoryImpl } from '../../features/call/data/repositories/RoomRepositoryImpl';

import { MediasoupDataSource } from '../../features/call/data/datasources/MediasoupDataSource';
import { WEBRTC_REPOSITORY_INJECTION_TOKEN } from '../../features/call/domain/repositories/WebRtcRepository';
import { WebRtcRepositoryImpl } from '../../features/call/data/repositories/WebRtcRepositoryImpl';

container.registerSingleton(ROOM_DATA_SOURCE_INJECTION_TOKEN, InMemoryRoomDataSource);
container.registerSingleton(ROOM_REPOSITORY_INJECTION_TOKEN, RoomRepositoryImpl);
container.registerSingleton(MediasoupDataSource); // Singleton for worker
container.registerSingleton(WEBRTC_REPOSITORY_INJECTION_TOKEN, WebRtcRepositoryImpl);

export { container };
