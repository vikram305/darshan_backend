import 'reflect-metadata';
import request from 'supertest';
import express from 'express';
import { container } from '../../../../core/di/injection';
import { CallController } from './CallController';
import { CreateRoomUseCase } from '../../domain/usecases/CreateRoomUseCase';
import { right, left } from '../../../../core/error/Either';
import { ServerFailure } from '../../../../core/error/Failure';
import { Room } from '../../domain/entities/Room';
import { ERROR_MESSAGES } from '../../../../core/constants/error_messages';

const app = express();
app.use(express.json());
app.post('/api/calls/room', CallController.createRoom);

describe('CallController', () => {
  let mockCreateRoomUseCase: jest.Mocked<CreateRoomUseCase>;

  beforeEach(() => {
    mockCreateRoomUseCase = {
      execute: jest.fn()
    } as any;
    
    // Prevent tests from leaking state across Dependency Injection
    container.clearInstances();
    container.registerInstance(CreateRoomUseCase, mockCreateRoomUseCase);
  });

  it('should return 201 and created room on success', async () => {
    const fakeRoom = new Room('999999');
    mockCreateRoomUseCase.execute.mockResolvedValue(right(fakeRoom));

    const response = await request(app).post('/api/calls/room').send();

    expect(response.status).toBe(201);
    expect(response.body.room.code).toBe('999999');
  });

  it('should return error status and message on failure', async () => {
    mockCreateRoomUseCase.execute.mockResolvedValue(left(new ServerFailure(ERROR_MESSAGES.ROOM_CREATION_FAILED)));

    const response = await request(app).post('/api/calls/room').send();

    expect(response.status).toBe(500);
    expect(response.body.error).toBe(ERROR_MESSAGES.ROOM_CREATION_FAILED);
  });
});
