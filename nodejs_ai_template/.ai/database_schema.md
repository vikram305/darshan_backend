# Complete Database Schema Reference

> **AI INSTRUCTION:** This file contains the single source of truth for the Database. When building a use case or data layer, refer strictly to the models defined here to avoid hallucinations.

## Strategy: Central Schema tracking

If your project is relatively small/medium, keeping all core schemas documented here is much more token-efficient than making the AI read 20 different MongoDB Schema/TypeORM Entity files.

*(Example formatting below)*

### `users` table/collection
| Field | Type | Modifiers | Description |
|-------|------|-----------|-------------|
| `id` | UUID | Primary Key | Unique identifier |
| `email` | String | Unique, Index | User's email |
| `password` | String | Hashed | Bcrypt hashed string |
| `role` | Enum | `USER`, `ADMIN` | Authorization level |
| `createdAt` | DateTime | Auto | Record creation timestamp |

### `profiles` table/collection
| Field | Type | Modifiers | Description |
|-------|------|-----------|-------------|
| `userId` | UUID | Foreign Key | References `users.id` |
| `firstName` | String | Required | |
| `lastName` | String | Required | |
| `avatarUrl` | String | Optional | |

---

*Note: If the application scales to 100+ tables, do not use this file. Instead, provide the AI with only the specific chunks or models it needs inside the chat manually.*
