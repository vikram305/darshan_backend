# Node.js AI Feature Creation Workflow

This is the established, highly-optimized strategy for creating scalable, production-ready Node.js/TypeScript backend features. Because there are no global custom rules, you must manually run the **Initial Setup Prompt** every time you open a new chat window.

## 0. The Initial Setup Prompt
*Copy and paste this into the AI chat at the absolute beginning of every new backend session:*

> **"Before we start, please read the following Node.js files: `.ai/architecture_prompt.md`, `.ai/database_schema.md`, and `.ai/project_status.md`."**

---

## The Strategy

1. **Step 1: Brainstorming & Planning (Pro Model)**
   - Use the **Pro Model** in "Planning Mode".
   - Define the backend DTOs, domain models, database schema updates, and UseCases. 
   - *Why:* Pro model excels at system architecture, error handling (Either wrappers), and SOLID abstraction reasoning.

2. **Step 2: Layer-by-Layer Execution (Flash Model / Pro Model if complex)**
   - Instruct the AI to generate code **strictly layer-by-layer**.
   - **CRITICAL RULE**: ALL strings, error messages, and events (like Socket.io events) MUST be defined in `src/core/constants/` first. Do NOT use hardcoded strings anywhere in the logic.
   - *Example Prompt:* "Let's build the User feature. First, generate the Domain layer (Entity, Repository interface, UseCase)."
   - Proceed sequence:
     1. `Domain Layer`: `entity.ts`, abstract `repository.ts`, `usecase.ts`, `usecase.spec.ts` (TDD first)
     2. `Data Layer`: `datasource.interface.ts`, `datasource.impl.ts`, `repository.impl.ts`, Database Models/Mappers.
     3. `Presentation Layer`: DTOs (`zod`/`class-validator`), `controller.ts`, `routes.ts`.
     4. `DI Wiring`: Update `tsyringe`/`inversify` containers.

3. **Step 3: Session Completion & Progress Saving**
   - Once the backend feature endpoints work and tests pass, update your persistent tracking.
   - *Example Prompt:* "We are done with this route. Please update `.ai/project_status.md` and document any modified schemas in `.ai/database_schema.md`."
