# Backend Progress & Integration Status

> **AI INSTRUCTION:** Read this file at the beginning of a session to understand what backend features, tables, and auth paradigms exist. Update this file when an endpoint or service is finalized.

## 🟢 Completed API Features
- **Call Feature (Milestone 1 Core)**: `CreateRoom` (REST) and `JoinRoom` (Socket.IO) features are operational. Strict TDD implemented and Clean Architecture enforced (100% Jest line coverage). Constants extracted (`error_messages`, `socket_events`). Room and Peer entities available.
- **WebRTC Signaling (Milestone 2)**: Full WebRTC transport logic established using Mediasoup. Implemented `GetRouterCapabilities`, `CreateTransport`, `ConnectTransport`, `Produce`, `Consume`, and `ResumeConsumer` use cases. Mediasoup worker and router auto-scaled per room. Graceful `LeaveRoom` garbage collection on disconnects.

---

## 🟡 In Progress
- **Milestone 3 (Flutter WebRTC Integration - Pre-work)**: Getting ready for client-side integration of flutter WebRTC.

---

## 🔗 Shared Infrastructure & Gateways

*Look here for shared dependencies before creating new ones.*

- **Database Connection:** InMemoryRoomDataSource (MVP).
- **Authentication Strategy:** None (MVP specific).
- **WebSockets / WebRTC:** Mediasoup worker configured (`MediasoupDataSource`), Socket.io gateway fully bootstrapped in `SignalingGateway.ts`.
- **Caching:** None.
