---
name: tests
description: Generates and manages unit and end-to-end tests. Use when ensuring code quality or verifying user flows in Svelte components.
---

# Tests Skill

This skill ensures that the application remains robust through consistent testing patterns.

## When to use this skill

- Use this when creating new features that require verification.
- Use this when debugging complex component interactions.
- Use this to generate mock data for testing UI states.

## How to use it

### 1. Component Testing

- Use Vitest + `vitest-browser-svelte` with Playwright provider for browser-based component tests.
- Test files live alongside components: `src/**/*.svelte.{test,spec}.{js,ts}`.
- Focus on user interactions (clicks, inputs) and state transitions.

### 2. Server/Unit Testing

- Plain `.{test,spec}.{js,ts}` files run in Node environment.
- Use for testing utilities, stores (runes), and server logic.

### 3. Standards

- Follow the project's lowercase comment style within test files.
- Ensure all tests are kept simple and direct (DRY/KISS).

## Example Commands

```sh
bun run test          # Run all tests (unit + component)
bun run test:unit     # Unit tests only
```
