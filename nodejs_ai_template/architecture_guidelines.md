# Node.js TypeScript Clean Architecture — Reusable Guidelines

> A comprehensive, production-ready guideline for structuring Node.js projects using **Clean Architecture** with **Domain-Driven Design (DDD)**, **Express.js**, strict **SOLID principles**, **Test-Driven Development (TDD)**, and robust handling of real-time communication via **WebSockets** and **WebRTC (Mediasoup)**.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Folder Structure Template](#2-folder-structure-template)
3. [Core Layer — Reusable Foundations](#3-core-layer--reusable-foundations)
   - 3.1 [Error Handling (Result Pattern)](#31-error-handling-result-pattern)
   - 3.2 [Configuration & Environment](#32-configuration--environment)
   - 3.3 [Dependency Injection (DI)](#33-dependency-injection-di)
   - 3.4 [Constants System (Zero Hardcoding)](#34-constants-system-zero-hardcoding)
4. [Feature Layer — Step-by-Step Guide](#4-feature-layer--step-by-step-guide)
   - 4.1 [Domain — Entities](#41-domain--entities)
   - 4.2 [Domain — Repository Contract](#42-domain--repository-contract)
   - 4.3 [Domain — UseCases](#43-domain--usecases)
   - 4.4 [Data — DataSources (Abstract vs Impl)](#44-data--datasources-abstract-vs-impl)
   - 4.5 [Data — Repository Implementation](#45-data--repository-implementation)
   - 4.6 [Presentation — Controllers (Express)](#46-presentation--controllers-express)
   - 4.7 [Presentation — DTOs & Validation](#47-presentation--dtos--validation)
   - 4.8 [Presentation — Routes & Middleware](#48-presentation--routes--middleware)
5. [Applying SOLID Principles](#5-applying-solid-principles)
   - 5.1 [Replacing External Services (DIP & OCP)](#51-replacing-external-services-dip--ocp)
6. [Real-Time Communication (Sockets & WebRTC)](#6-real-time-communication-sockets--webrtc)
   - 6.1 [WebSocket Gateways](#61-websocket-gateways)
   - 6.2 [Mediasoup (WebRTC) Abstractions](#62-mediasoup-webrtc-abstractions)
7. [Test-Driven Development (TDD) Strategy](#7-test-driven-development-tdd-strategy)
   - 7.1 [Unit Testing UseCases](#71-unit-testing-usecases)
   - 7.2 [Integration Testing Repositories](#72-integration-testing-repositories)
   - 7.3 [Testing Presentation & DTOs](#73-testing-presentation--dtos)
8. [Production Recommendations](#8-production-recommendations)

---

## 1. Architecture Overview

This architecture adapts **Clean Architecture** principles to Node.js backend services:

```text
┌─────────────────────────────────────────────┐
│               Presentation                  │  ← Express Routes, Controllers, Socket Gateways
│  ┌────────────────────────────────────────┐  │
│  │              Domain                    │  │  ← Entities, UseCases, Repositories (Contracts)
│  │  ┌──────────────────────────────────┐  │  │
│  │  │             Data                 │  │  │  ← Mappers, Repository Impl, DS Contracts, DS Impls
│  │  └──────────────────────────────────┘  │  │
│  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**Key Principles:**
- **Dependency Rule:** Inner layers never depend on outer layers. The `Domain` layer is pure TypeScript and knows **nothing** about Express, Mediasoup, SQL, MongoDB, or external REST APIs.
- **Abstraction Boundaries:** The Domain and Data layers strictly communicate via interfaces. Data layer provides *implementations*.
- **Functional Error Handling:** All domain operations return a custom `Result<T, Failure>` class. Try-catch blocks are contained entirely within the Data layer; Express controllers only unwrap predictable `Result` states.
- **TDD Requirement:** Business logic (UseCases) must be unit-tested by mocking out generic Repository interfaces *before* the Data layer implementation is even written.

---

## 2. Folder Structure Template

Please see `project_structure.md` for the precise visual breakdown.
The overarching rule is:
- `src/core` = Shared generic logic, base classes, error models, server configuration.
- `src/features/<feature>` = Isolated functionality grouped by domain rather than technology type.

---

## 3. Core Layer — Reusable Foundations

### 3.1 Error Handling (Result Pattern)

We avoid crashing the Node process and tracking down uncaught exceptions by enforcing the Return/Result pattern bridging the Data and Domain layers.

```typescript
// src/core/error/failure.ts
export abstract class Failure {
  constructor(public readonly message: string) {}
}

export class ServerFailure extends Failure {}
export class DatabaseFailure extends Failure {}
export class ValidationFailure extends Failure {}

// src/core/error/result.ts
export type Either<L, R> = Left<L, R> | Right<L, R>;

export class Left<L, R> {
  readonly value: L;
  constructor(value: L) { this.value = value; }
  isLeft(): this is Left<L, R> { return true; }
  isRight(): this is Right<L, R> { return false; }
}

export class Right<L, R> {
  readonly value: R;
  constructor(value: R) { this.value = value; }
  isLeft(): this is Left<L, R> { return false; }
  isRight(): this is Right<L, R> { return true; }
}

export const left = <L, R>(l: L): Either<L, R> => new Left(l);
export const right = <L, R>(r: R): Either<L, R> => new Right(r);

// Async Wrapper mapping for Repositories and UseCases
export type AsyncEither<L, R> = Promise<Either<L, R>>;
```

### 3.2 Configuration & Environment

Never call `process.env` directly in feature files. Always use a centralized configuration manager.

```typescript
// src/core/config/env.ts
import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  db: {
    uri: process.env.DB_URI as string,
  },
  twilio: {
    apiKey: process.env.TWILIO_KEY as string,
  }
};
// Validate existence during bootstrap...
```

### 3.3 Dependency Injection (DI)

Use a container like `tsyringe` to fulfill SOLID's Dependency Inversion Principle. No class should instantiate its dependencies using `new`.

```typescript
// src/core/di/container.ts
import { container } from 'tsyringe';
import { SendNotificationUseCase } from '../../features/notification/domain/usecases/send_notification';
import { TwilioDataSourceImpl } from '../../features/notification/data/datasource_impl/twilio_datasource_impl';
import { NotificationRepositoryImpl } from '../../features/notification/data/repositories/notification_repository_impl';

// Register specific implementations tightly to abstract tokens
container.register('NotificationDataSource', {
  useClass: TwilioDataSourceImpl, // Swappable to SendGridDataSourceImpl!
});

container.register('NotificationRepository', {
  useClass: NotificationRepositoryImpl,
});

export { container };
```

### 3.4 Constants System (Zero Hardcoding)

**Strict Rule**: Absolutely NO hardcoded strings, magic numbers, or randomly declared enums are allowed scattered within the Domain, Data, or Presentation layers. Everything must be centralized in the `core` layer to ensure typos do not break the app and refactoring is trivial.

```typescript
// src/core/config/app_constants.ts
export const AppConstants = {
  PAGINATION_DEFAULT_LIMIT: 20,
  PASSWORD_MIN_LENGTH: 8,
};

// src/core/constants/error_messages.ts
export const ErrorMessages = {
  USER_NOT_FOUND: "The requested user was not found.",
  INVALID_UUID: "The provided ID is not a valid UUID format.",
};
```

*Example usage:* `left(new DatabaseFailure(ErrorMessages.USER_NOT_FOUND))` instead of `left(new DatabaseFailure("user not found"))`.

---

## 4. Feature Layer — Step-by-Step Guide

### 4.1 Domain — Entities

Entities are pure TypeScript classes or interfaces containing domain business logic. They represent core objects.

```typescript
// src/features/user/domain/entities/user.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly isVerified: boolean
  ) {}

  public grantPremiumAccess(): User {
    if (!this.isVerified) throw new Error("Unverified users cannot be premium");
    // Return mutated copy
    return new User(this.id, this.email, true);
  }
}
```

### 4.2 Domain — Repository Contract

The Domain dictates what it *needs* via interfaces. It doesn't care if the underlying execution is MySQL or MongoDB.

```typescript
// src/features/user/domain/repositories/user_repository.ts
import { Either } from '../../../../core/error/result';
import { Failure } from '../../../../core/error/failure';
import { User } from '../entities/user';

export interface UserRepository {
  getUserById(id: string): AsyncEither<Failure, User>;
  saveUser(user: User): AsyncEither<Failure, void>;
}
```

### 4.3 Domain — UseCases

UseCases implement specific interactions from a user. Every UseCase adheres to `UseCase<Type, Params>`.

```typescript
// src/core/usecase.ts
export interface UseCase<Type, Params> {
  execute(params: Params): AsyncEither<Failure, Type>;
}

// src/features/user/domain/usecases/get_user.ts
import { inject, injectable } from 'tsyringe';
import { UserRepository } from '../repositories/user_repository';
// ... Either/Failure imports

@injectable()
export class GetUserUseCase implements UseCase<User, { id: string }> {
  constructor(
    @inject('UserRepository') private readonly userRepository: UserRepository
  ) {}

  async execute(params: { id: string }): AsyncEither<Failure, User> {
    return this.userRepository.getUserById(params.id);
  }
}
```

### 4.4 Data — DataSources (Abstract vs Impl)

DataSources communicate strictly with databases or external APIs. They define contracts and implement them.

**Contract:**
```typescript
// src/features/user/data/datasource/user_db_datasource.ts
export interface UserDbDataSource {
  findUserRecord(id: string): Promise<any>; // Raw DB output
}
```

**Implementation (PostgreSQL/TypeORM example):**
```typescript
// src/features/user/data/datasource_impl/postgres_user_datasource.ts
import { UserDbDataSource } from '../datasource/user_db_datasource';

export class PostgresUserDataSource implements UserDbDataSource {
  async findUserRecord(id: string): Promise<any> {
    // try/catch handled at repository level or specific API handling here
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (!result.rows.length) throw new Error("Row Not Found");
    return result.rows[0];
  }
}
```

### 4.5 Data — Repository Implementation

The Repository Impl bridges the Data Sources and the Domain. It catches raw exceptions and converts them to `Result` or `Either` types.

```typescript
// src/features/user/data/repositories/user_repository_impl.ts
import { inject, injectable } from 'tsyringe';
import { UserDbDataSource } from '../datasource/user_db_datasource';
import { UserRepository } from '../../domain/repositories/user_repository';

@injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @inject('UserDbDataSource') private dataSource: UserDbDataSource
  ) {}

  async getUserById(id: string): AsyncEither<Failure, User> {
    try {
      const rawData = await this.dataSource.findUserRecord(id);
      const userEntity = new User(rawData.id, rawData.email, rawData.is_verified);
      return right(userEntity);
    } catch (error) {
      return left(new DatabaseFailure((error as Error).message));
    }
  }
  
  // ...
}
```

### 4.6 Presentation — Controllers (Express)

Controllers exist solely to unpack the Express `req`, pass parameters into the `UseCase`, and map the returned `Either` into an HTTP Response.

```typescript
// src/features/user/presentation/controllers/user_controller.ts
import { Request, Response } from 'express';
import { GetUserUseCase } from '../../domain/usecases/get_user';
import { container } from 'tsyringe';
import { DatabaseFailure } from '../../../../core/error/failure';

export class UserController {
  static async getUser(req: Request, res: Response) {
    const useCase = container.resolve(GetUserUseCase);
    
    // 1. Validate request using DTO
    const resultDto = GetUserDtoSchema.safeParse(req.params);
    if (!resultDto.success) {
      return res.status(400).json({ errors: resultDto.error.errors });
    }

    // 2. Execute UseCase
    const result = await useCase.execute({ id: resultDto.data.id });

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof DatabaseFailure) {
         return res.status(404).json({ error: "User not found" });
      }
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(result.value); // Domain entity serialized
  }
}
```

### 4.7 Presentation — DTOs & Validation

DTOs (Data Transfer Objects) serve as the strict boundary before data enters your domain. DTOs are defined using validation libraries like `zod` or `class-validator` to guarantee payload structure.

```typescript
// src/features/user/presentation/dtos/get_user_dto.ts
import { z } from 'zod';

export const GetUserDtoSchema = z.object({
  id: z.string().uuid("Invalid User ID format"),
});

export type GetUserDto = z.infer<typeof GetUserDtoSchema>;
```

### 4.8 Presentation — Routes & Middleware

```typescript
// src/features/user/presentation/routes/user_routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user_controller';

const router = Router();

router.get('/:id', UserController.getUser);

export { router as userRoutes };
```

---

## 5. Applying SOLID Principles

By adhering to this folder structure, SOLID is inherently enforced.

### 5.1 Replacing External Services (DIP & OCP)

The architecture is built for infinite extensibility. When you need to change a service (e.g., swapping a MySQL database for PostgreSQL, or changing an SMS service from Twilio to SendGrid), you **only** touch the specific Data layer implementation.

**Proof of Abstraction:**
1. **Open/Closed**: Instead of modifying `TwilioDataSourceImpl`, you create an entirely new class `SendGridDataSourceImpl` that implements the `NotificationDataSource` interface.
2. **Dependency Inversion**: Inside `core/di/container.ts`, you alter **one** line of code. You swap the binding for `'NotificationDataSource'` from `TwilioDataSourceImpl` to `SendGridDataSourceImpl`.
3. **Zero Domain Changes**: Your Domain Entities, UseCases, and Express Controllers remain **completely unchanged** because they only ever knew about the abstract `NotificationDataSource` interface. You don't have to rewrite business rules.
4. **Testing**: Because UseCases test against mocked interfaces, your core business tests do not break when you swap database vendors or third-party APIs.

---

## 6. Real-Time Communication (Sockets & WebRTC)

Scaling standard APIs is easy. WebSockets and Mediasoup (WebRTC) can quickly clutter architectures.

### 6.1 WebSocket Gateways

Treat incoming WebSocket events exactly identically to HTTP calls. Do NOT write business logic inside `.on('message')`. 

```typescript
// src/features/chat/presentation/gateways/chat_gateway.ts
import { Socket } from 'socket.io';
import { SendMessageUseCase } from '../../domain/usecases/send_message';
import { container } from 'tsyringe';

export class ChatGateway {
  static handleConnection(socket: Socket) {
    socket.on('send_message', async (data) => {
      const useCase = container.resolve(SendMessageUseCase);
      const result = await useCase.execute(data);
      
      if (result.isRight()) {
         socket.to(data.roomId).emit('new_message', result.value);
      } else {
         socket.emit('error', result.value.message);
      }
    });
  }
}
```

### 6.2 Mediasoup (WebRTC) Abstractions

Mediasoup workers, routers, and transports belong in the **Data Layer**. UseCases command the creation, but abstract interfaces deal with Mediasoup's strict classes.

**DataSource Interface:**
```typescript
// src/features/conference/data/datasource/mediasoup_datasource.ts
export interface MediasoupDataSource {
  createWorker(): Promise<string>; // Returns generic string WorkerId
  createRouter(workerId: string): Promise<string>; // Returns RouterId
  createWebRtcTransport(routerId: string): Promise<any>; // DTO with transport params
}
```

**UseCase Example:**
```typescript
export class CreateRoomUseCase implements UseCase<string, { name: string }> {
  // Receives abstract WebRTC repos, creates a room logically, requests a mediasoup router, coordinates save to Redis/DB.
}
```
*Rule of Thumb: Do not import `mediasoup/types` anywhere in `src/*/domain` or `src/*/presentation`.*

---

## 7. Test-Driven Development (TDD) Strategy

### 7.1 Unit Testing UseCases
Because the UseCase relies entirely on abstract Repositories, UseCases must be tested before Database connections are made. **You must test every scenario**: the "happy path" (Success), logical business failures (e.g., trying to grant premium to an unverified user), database connection failures, and invalid boundaries.

```typescript
// src/features/user/domain/usecases/get_user.spec.ts
import { GetUserUseCase } from './get_user';
import { UserRepository } from '../repositories/user_repository';
import { User } from '../entities/user';
import { right, left } from '../../../../core/error/result';
import { DatabaseFailure } from '../../../../core/error/failure';

describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase;
  let mockRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepo = {
      getUserById: jest.fn(),
      saveUser: jest.fn(),
    };
    useCase = new GetUserUseCase(mockRepo);
  });

  it('should return User on right (success)', async () => {
    mockRepo.getUserById.mockResolvedValue(right(new User('1', 'a@a.com', true)));
    const result = await useCase.execute({ id: '1' });
    expect(result.isRight()).toBe(true);
  });

  it('should return Failure on left (fail)', async () => {
    mockRepo.getUserById.mockResolvedValue(left(new DatabaseFailure('Not found')));
    const result = await useCase.execute({ id: '1' });
    expect(result.isLeft()).toBe(true);
  });
});
```

### 7.2 Integration Testing Repositories
Test actual Datasource Implementations by connecting a real test DB/Localstack connection, executing queries, and verifying correct error catches.

### 7.3 Testing Presentation & DTOs
Ensure that DTO validation blocks bad requests before they hit the UseCase, and that HTTP status mapping works correctly.

```typescript
// src/features/user/presentation/controllers/user_controller.spec.ts
import { UserController } from './user_controller';
import { GetUserUseCase } from '../../domain/usecases/get_user';

describe('UserController', () => {
  it('should return 400 when DTO validation fails (invalid UUID)', async () => {
    const req = { params: { id: 'not-a-uuid' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await UserController.getUser(req, res);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }));
  });
});
```

---

## 8. Production Recommendations & Best Practices

To ensure this architecture serves true Enterprise expectations, follow these mandatory best practices:

### 8.1 Strict Environment Validation
Do not rely on `process.env` directly being typed as `string | undefined`. Use **Zod** in `core/config/env.ts` to parse the environment variables securely on startup. If a variable is missing, the app should instantly crash on startup (Fail Fast) rather than failing cryptically deep in a UseCase.

### 8.2 Security Middleware
Your `app.ts` pipeline must include standard Express security layers before any routes are attached:
- **Helmet**: Secures HTTP headers to prevent XSS.
- **CORS**: Strictly configure origins.
- **Rate Limiting**: Use `express-rate-limit` to prevent brute force and DDoS on specific vulnerable endpoints (like `/login`).

### 8.3 Graceful Shutdown (SIGTERM/SIGINT)
Node.js processes will crash unexpectedly or be killed by Docker/Kubernetes scaledowns. In `server.ts`, you must intercept process signals to close resources properly:
1. Stop accepting new HTTP requests.
2. Wait for ongoing requests to finish.
3. Close Database/Redis connections safely.
4. Close Mediasoup Workers gracefully so video rooms don't corrupt active user streams.

### 8.4 Logging Strategy & PII Masking
Ban the use of `console.log`. Instead, define an abstract `Logger` interface in the Domain layer, and implement it using `Pino` or `Winston` in the Data layer. **Crucially**, configure the logger to redact/mask Personally Identifiable Information (PII) like `password`, `ssn`, or `cookie` headers automatically before writing to logs.

### 8.5 Database Transactions
If a UseCase spans multiple database actions (e.g., deducting balance AND creating a receipt), coordinate the transaction at the `RepositoryImpl` layer. Do not leak SQL transaction objects into the pure Domain UseCase.

### 8.6 DTOs & Validation Strictness
Validate data inside Controller or Express Middleware using `zod` or `class-validator` *before* hitting the UseCase. The UseCase assumes domain arguments are always correctly typed.

### 8.7 AppStrings & Constants
Store strings like "Cannot connect to database" inside `src/core/constants/error_messages.ts` and use `ErrorMessages.dbError` everywhere else to avoid random hardcoded messaging.
