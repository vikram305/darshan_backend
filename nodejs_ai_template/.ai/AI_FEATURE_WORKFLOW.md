# Node.js AI Feature Creation Workflow (Copy-Paste Prompts)

This document outlines the **Cost-Optimized & High-Accuracy TDD Workflow**.

> **Instruction for the Developer:**
> Do NOT feed this file to the AI. Use it as your personal cheat sheet for copying the prompts. 
> You only need to `@` mention `.ai/architecture_prompt.md` (and schema/status) in the chat.

---

## 🧠 WINDOW 1: The Planning Phase (Use Heavy "Pro" Model)

Before generating any code, you must define the architecture and test cases. Always use your smartest, most capable reasoning model (e.g., GPT-4o, Sonnet 3.5, Gemini 1.5 Pro) for this step.

### Step 0: The Brainstorming Prompt
*Copy this into Window 1:*
```text
I want to build a [FEATURE_NAME] feature for my Node.js backend. 
Here is what it does: [Briefly explain the feature].

Act as my Senior Software Architect and outline:
1. The Domain Entities.
2. The UseCases required.
3. Database Schema additions.
4. A list of all test scenarios we need to write, explicitly including both basic `happy paths` and all critical `edge cases` (e.g., database failures, validation errors).

Do not write the code yet, just give me the text outline.
```

*(Once you agree on the plan and the edge case tests look good, copy the AI's final plan to your clipboard and **CLOSE WINDOW 1**).*

---

## ⚡ WINDOW 2: Code Generation Phase (Use Fast "Flash" Model)

Now that the reasoning is done, switch to a hyper-fast, low-cost model (e.g., GPT-4o-mini, Haiku, Gemini Flash). 

**CRITICAL RULE: 1 Feature = 1 Chat Window.**
Do not generate multiple features in the same window! Wipe the chat after every completed feature to save massive amounts of tokens.

### Prompt 1: The Core (Domain)
*Copy this into Window 2 (the new chat):*
```text
@.ai/architecture_prompt.md
I am building a new feature called `[FEATURE_NAME]`. 
Here is the architectural plan and test scenarios we agreed on:
[PASTE YOUR PLAN FROM WINDOW 1 HERE]

Generate the entire DOMAIN layer (Entities, abstract Repositories, UseCases). 
Remember the Strict TDD rule: immediately output the `_test_constants.ts` file and the Domain unit tests (`usecase.spec.ts`) for the scenarios in the plan without explaining.
```

### Prompt 2: The Database & Infrastructure (Data)
*Copy this into Window 2:*
```text
Looks perfect. Based on the Domain layer, generate the DATA layer (`[FEATURE_NAME]` database models/mappers, DataSource interfaces and implementations, and Repository implementations). 
Remember the Strict TDD rule: immediately append new constants to the core files, and output the Data integration tests covering the edge cases from the plan.
```

### Prompt 3: The API & Controllers (Presentation)
*Copy this into Window 2:*
```text
Tests passed. Finally, generate the PRESENTATION layer (`[FEATURE_NAME]` DTOs with validation, Controllers, and Routes).
Also generate the dependency injection wiring code in `injection.ts`.
Remember the Strict TDD rule: immediately output the controller mock tests (`controller.spec.ts`) covering the scenarios in the plan and explicitly verify Http Status Codes and our ApiResponse format.
```

*(Once Prompt 3 is complete and tested, **CLOSE WINDOW 2** and start a brand new window for the next feature!)*
