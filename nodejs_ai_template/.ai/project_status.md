# Backend Progress & Integration Status

> **AI INSTRUCTION:** Read this file at the beginning of a session to understand what backend features, tables, and auth paradigms exist. Update this file when an endpoint or service is finalized.

## 🟢 Completed API Features
- **Call Feature (Milestone 1 Core)**: `CreateRoom` (REST) and `JoinRoom` (Socket.IO) features are operational. Strict TDD implemented and Clean Architecture enforced. Room and Peer entities available.

---

## 🟡 In Progress
- **Milestone 2 (WebRTC Signaling)**: Remaining WebRTC transport logic.

---

## 🔗 Shared Infrastructure & Gateways

*Look here for shared dependencies before creating new ones.*

- **Database Connection:** InMemoryRoomDataSource (MVP).
- **Authentication Strategy:** None (MVP specific).
- **WebSockets / WebRTC:** Mediasoup worker configured (`MediasoupDataSource`), Socket.io gateway fully bootstrapped in `SignalingGateway.ts`.
- **Caching:** None.
