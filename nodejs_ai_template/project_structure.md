# Node.js + TypeScript Base-API — Project Structure & Onboarding Guide

This document provides a detailed overview of the project structure, architecture patterns, and conventions for the base-api. It is intended to help new developers quickly understand the codebase and contribute effectively while adhering to CLEAN architecture, SOLID principles, and strict TDD.

> 📘 For the full reusable architecture guidelines (with code examples for every layer), see [architecture_guidelines.md](./architecture_guidelines.md).

---

## 1. Directory Structure

```text
src/
  core/
    config/                # Centralized environment variables, magic strings
      env.ts                 # Validated env Config (Zod strict validation)
      app_constants.ts       # Numeric values: timeouts, thresholds
    constants/             # Zero-hardcoding — all shared string values here
      error_messages.ts      # Standard error output strings
      patterns.ts            # Regex patterns (email, phone)
    error/                 # Error handling & Base classes
      exceptions.ts          # ServerException, ValidationException
      failure.ts             # Failure, ServerFailure, DatabaseFailure (Domain Errors)
      result.ts             # Either<Failure, T> implementation
    di/                    # Dependency Injection Configuration
      container.ts           # tsyringe / inversify / custom DI container
    index.ts               # Core module exports

  features/
    notification/            # Generic Feature supporting SOLID (e.g. Email/SMS Swap)
      data/                # External Interactions (Email, DB, SMS)
        datasource/
          notification_datasource.ts       # Abstract interface (Dependency Inversion)
        datasource_impl/
          sendgrid_datasource_impl.ts      # Concrete Impl (Swappable)
          twilio_datasource_impl.ts        # Concrete Impl (Swappable)
        repositories/
          notification_repository_impl.ts  # Combines Datasources
      domain/              # Pure Business logic (Zero dependencies)
        entities/
          notification.ts        # Pure TS classes
        repositories/
          notification_repository.ts # Abstract interface (Contract)
        usecases/
          send_notification.ts     # UseCase to orchestrate Sending
      presentation/        # Express.js HTTP interactions
        dtos/
          send_notification_dto.ts   # Request/Response schemas (Zod/class-validator)
        controllers/
          notification_controller.ts # Express Req/Res handling, maps to UseCases
        routes/
          notification_router.ts     # Express Rotuer setup
        middlewares/
          auth_middleware.ts

    video_conference/        # Feature showcasing WebRTC and Sockets
      data/
        datasource/
          rtc_datasource.ts            # WebRTC Abstract Interface
          socket_datasource.ts         # Socket Abstract Interface
        datasource_impl/
          mediasoup_datasource_impl.ts # Mediasoup specifics (Router, Transport, Producer)
          socketio_datasource_impl.ts  # Socket.io specific implementation
        repositories/
          conference_repository_impl.ts
      domain/
        entities/
          room.ts                      # Room logic
          peer.ts                      # Connected User
        repositories/
          conference_repository.ts     # WebRTC/Socket orchestration contracts
        usecases/
          join_room.ts                 # Main UC handling signaling logic
          produce_media.ts
      presentation/
        dtos/
          join_room_dto.ts             # Typed sockets payloads
        gateways/                      # Socket.Io / WS controllers
          conference_gateway.ts        # Handle incoming socket events
        controllers/                   # Standard Express HTTP hooks
          room_controller.ts           # Create/Delete rooms via HTTP

  server.ts                  # App Entry Point (Handles Graceful Shutdown / SIGTERM)
  app.ts                     # Express pipeline setup (Helmet, CORS, Rate Limiters)

tests/                       # TDD Enforced Directory Tree
  core/
  features/
    notification/
      domain/
        usecases/
          send_notification.spec.ts  # Mock DB, Twilio, test success and failure
      data/
      presentation/
```

---

## 2. Architecture Overview

The project follows **Clean Architecture** with **Domain-Driven Design (DDD)** and heavy emphasis on **SOLID Principles**:

```text
┌────────────────────────────────────────────────────────┐
│               Presentation (Express)                   │  Req/Res, Gateways, DTO validation
│  ┌─────────────────────────────────────────────────┐   │
│  │              Domain                             │   │  Entities, UseCases, Repo & DS Contracts
│  │  ┌───────────────────────────────────────────┐  │   │
│  │  │             Data                          │  │   │  Models, DataSources (DB/Mediasoup/Twilio)
│  │  └───────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
         ↑ Dependencies point inward only ↑
```

**Data Flow:** `Express Route → Controller → UseCase → Repository (Interface) → RepositoryImpl → DataSource (Interface) → DataSourceImpl → Real Implementation (DB/Email/WebRTC)`

---

## 3. SOLID & Swappability

This structure excels at isolation. Because the `Domain` layer only interacts with TypeScript `interfaces` (Dependencies Inverted), swapping components is trivial.

**Example: Switching from MySQL to PostgreSQL or SendGrid to Twilio:**
1. You do **not** touch the `Domain` or `Presentation` layers.
2. In `data/datasource_impl/`, you create a new class `PostgresDataSourceImpl` that implements `DatabaseDataSource` interface.
3. In `core/di/container.ts`, you swap the injected instance from `MysqlDataSourceImpl` to `PostgresDataSourceImpl`.
4. Run tests. Everything works.

---

## 4. Error Handling Strategy

To prevent Express from crashing and provide functional error handling:

| Layer | Type | When |
|-------|------|------|
| Data | `ServerException` / `DatabaseException` | Thrown by DataSources |
| Domain+ | `Result<T, Failure>` (or `Either`) | Caught by RepositoryImpl, strictly returned over to UseCases. |
| Presentation | HTTP Status Maps | Controller unwraps `Result`. Success = `200/201`. Error maps to `400/404/500` appropriately. |

**Flow:** Custom API fetch throws `ServerException` → `RepositoryImpl` catches it → returns `Failure(ServerFailure(msg))` → `UseCase` passes it back → Express `Controller` checks if it's a Failure and sends a `res.status(500).json(...)`.

---

## 5. WebRTC (Mediasoup) & Sockets

Real-time architectures easily break Clean Architecture if allowed to bleed into controllers.
1. **Gateways**: Replacing HTTP Controllers for Socket connections. Handlers listen to events and pass data to UseCases.
2. **DataSources**: The actual WebRTC worker, router, and transport creation reside strictly in the `Data Layer` as `MediasoupDataSourceImpl.ts`.
3. **UseCases**: UseCases handle the flow. E.g., `ProduceMediaUseCase` will coordinate verifying the user and delegating the creation of a Mediasoup Producer via abstract interfaces.

---

## 6. How to Extend the Project (Feature Checklist)

1. **Add a New Feature:**
   - Create `src/features/<name>/` with `data/`, `domain/`, `presentation/` subfolders.
   - **TDD First!** Write your domain entities and UseCase tests *before* writing the logic.
   - Domain: `entities` → `repository (interface)` → `usecases`.
   - Data: `datasource (interface)` -> `datasource_impl` → `repository_impl`.
   - Presentation: `controller.ts` → `rules/validators.ts` → `routes.ts`.
   - Register dependencies in DI container (`container.ts`).

2. **Add Tests:**
   - Always mirror folder structure in the `tests/` directory.

3. **Avoid Hardcoding:**
   - Ensure all strings go into `core/constants/`.
   - Ensure all secrets go into environment variables securely mapped in `core/config/env.ts`.
