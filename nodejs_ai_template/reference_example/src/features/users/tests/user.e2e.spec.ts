import "reflect-metadata";
import express from 'express';
import request from 'supertest';
import { userRouter } from '../presentation/routes/user.routes';
import { container } from 'tsyringe';
import { CreateUserUseCase } from '../domain/usecases/create_user.usecase';
import { right, left } from '../../../core/error/either';
import { ServerFailure } from '../../../core/error/failure';
import { UserEntity } from '../domain/entities/user.entity';

describe('Users Feature E2E API Tests', () => {
  const app = express();
  app.use(express.json());
  app.use('/users', userRouter);

  const mockUseCase = {
    execute: jest.fn()
  };

  beforeAll(() => {
    // Override DI container with mock usecase for isolation 
    container.registerInstance(CreateUserUseCase, mockUseCase as any);
  });

  it('POST /users (Success 201)', async () => {
    const tUser = new UserEntity('999', 'e2e@test.com', 'Test', new Date());
    mockUseCase.execute.mockResolvedValue(right(tUser));

    const res = await request(app)
      .post('/users')
      .send({ email: 'e2e@test.com', firstName: 'Test' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('999');
  });

  it('POST /users (Validation 400 failure from Zod)', async () => {
    // We send a bad email "not-an-email"
    const res = await request(app)
      .post('/users')
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(400); 
    // Assert Zod validation block triggered before reaching controller
    expect(res.body[0].message).toBe('Invalid email address format');
  });

  it('POST /users (Domain 400 failure from UseCase Either.Left)', async () => {
    mockUseCase.execute.mockResolvedValue(left(new ServerFailure('Email taken')));

    const res = await request(app)
      .post('/users')
      .send({ email: 'valid@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Email taken');
  });
});
