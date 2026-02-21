# Contributing to Sunsama API TypeScript Wrapper

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/sunsama-api.git
   cd sunsama-api
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Run Tests**
   ```bash
   pnpm test
   ```

## Development Workflow

### Code Quality

We maintain high code quality standards:

- **TypeScript**: All code must be properly typed
- **ESLint**: Code must pass linting
- **Prettier**: Code must be formatted
- **Tests**: All new features must include tests

### Before Submitting

1. **Run the full test suite**
   ```bash
   pnpm test
   ```

2. **Run integration tests** (if you modified API endpoints)
   ```bash
   pnpm test:integration
   ```

3. **Check linting**
   ```bash
   pnpm lint
   ```

4. **Format code**
   ```bash
   pnpm format
   ```

5. **Build the package**
   ```bash
   pnpm build
   ```

### Commit Messages

Write clear, descriptive commit messages that explain what and why:

- Use the imperative mood ("Add feature" not "Added feature")
- Keep the first line under 50 characters
- Add detailed explanation in the body if needed
- Reference issues when applicable

Example:
```
Add getStreamsByGroupId method to client

Implements stream fetching functionality using GraphQL query.
Follows existing patterns for caching and error handling.

Fixes #123
```

## Project Structure

```
src/
├── client/                    # SunsamaClient (assembled via inheritance chain)
│   ├── index.ts               # SunsamaClient — thin assembled class
│   ├── base.ts                # SunsamaClientBase — auth, HTTP, session management
│   └── methods/               # Domain method classes (each extends the previous)
│       ├── user.ts            # getUser, task queries, stream queries
│       ├── task-lifecycle.ts  # createTask, deleteTask, complete/uncomplete
│       ├── task-updates.ts    # updateTaskText/Notes/PlannedTime/DueDate/Stream/SnoozeDate
│       ├── subtasks.ts        # createSubtasks, addSubtask, complete/uncomplete subtask
│       └── task-scheduling.ts # reorderTask
├── queries/                   # GraphQL queries/mutations by domain
│   ├── tasks/                 # Task mutations and queries
│   ├── streams/               # Stream queries
│   ├── user/                  # User query
│   └── fragments/             # Shared GraphQL fragments
├── types/                     # TypeScript type definitions
├── utils/                     # Utility functions
│   ├── collab.ts              # Yjs helpers (createCollabSnapshot, etc.)
│   ├── conversion.ts          # HTML ↔ Markdown conversion
│   ├── validation.ts          # Zod schemas and validators
│   └── dates.ts               # Timezone/date utilities
├── errors/                    # Custom error classes
└── __tests__/                 # Test files
    ├── integration/           # Real API tests (shared auth, auto cleanup)
    └── *.test.ts              # Unit tests (mocked)
```

When adding a new API method, add it to the appropriate file in `src/client/methods/` — **not** `src/client/index.ts` (which is just the assembled class). See `CLAUDE.md` for the full mapping.

## Guidelines

### TypeScript

- Use strict TypeScript configuration
- Prefer `interface` over `type` for object shapes
- Use `unknown` instead of `any`
- Properly type all function parameters and return values

### Testing

The project uses two types of tests:

#### Unit Tests
- Fast, mocked tests for individual functions
- Located in `src/__tests__/**/*.test.ts` (excluding `integration/`)
- Run with `pnpm test`
- No credentials required
- Must pass before merging

Guidelines:
- Write tests for all public APIs
- Use descriptive test names
- Group related tests with `describe` blocks
- Mock external dependencies

#### Integration Tests (Required for API Changes)

**IMPORTANT**: Any changes to existing API endpoints or new endpoint implementations **MUST** include integration tests.

Integration tests:
- Validate real API behavior with live credentials
- Located in `src/__tests__/integration/*.test.ts`
- Use shared authentication to avoid rate limiting
- Automatically clean up test data

**Running Integration Tests:**

1. **Setup credentials** (first time only):
   ```bash
   # Create .env file in project root
   echo "SUNSAMA_EMAIL=your-email@example.com" >> .env
   echo "SUNSAMA_PASSWORD=your-password" >> .env
   ```

2. **Run all integration tests**:
   ```bash
   pnpm test:integration
   ```

3. **Run specific test file**:
   ```bash
   # Run only subtask tests
   pnpm vitest run --config vitest.integration.config.ts src/__tests__/integration/subtasks.test.ts

   # Run only user tests
   pnpm vitest run --config vitest.integration.config.ts src/__tests__/integration/user.test.ts
   ```

4. **Run tests matching a pattern**:
   ```bash
   # Run only tests with "complete" in the name
   pnpm vitest run --config vitest.integration.config.ts --grep "complete"
   ```

**Writing Integration Tests:**

When adding a new API method, follow this pattern:

```typescript
import { getAuthenticatedClient, hasCredentials, trackTaskForCleanup } from './setup.js';

describe.skipIf(!hasCredentials())('Your Feature (Integration)', () => {
  let client: SunsamaClient;

  beforeAll(async () => {
    client = await getAuthenticatedClient(); // Reuses shared session
  });

  it('should test your feature', async () => {
    const taskId = SunsamaClient.generateTaskId();
    trackTaskForCleanup(taskId); // Auto-cleanup after tests

    await client.createTask('Test task', { taskId });
    // ... your test assertions
  });
});
```

**Integration Test Organization:**
- `user.test.ts` - User operations
- `streams.test.ts` - Stream operations
- `tasks-crud.test.ts` - Task CRUD operations
- `tasks-scheduling.test.ts` - Task scheduling
- `tasks-updates.test.ts` - Task property updates
- `task-notes.test.ts` - Task notes operations
- `subtasks.test.ts` - Subtask management
- `archived-tasks.test.ts` - Archived task retrieval

### Documentation

- Document all public APIs with JSDoc
- Include usage examples in documentation
- Keep README up to date
- Add inline comments for complex logic

### Error Handling

- Use custom error classes
- Provide meaningful error messages
- Include relevant context in errors
- Handle all known error scenarios

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards
   - Add unit tests for new functionality
   - Add integration tests for API endpoint changes
   - Update documentation as needed

3. **Test your changes**
   ```bash
   pnpm test                    # Unit tests
   pnpm test:integration        # Integration tests (if API changes)
   pnpm lint                    # Linting
   pnpm build                   # Build check
   ```

4. **Commit your changes**
   ```bash
   git commit -m "Add new feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use a clear, descriptive title
   - Include a detailed description of changes
   - Reference any related issues

## Release Process

This project uses [Changesets](https://github.com/changesets/changesets) for version management:

1. **Add a changeset** for your changes:
   ```bash
   pnpm changeset
   ```

2. **Follow the prompts** to describe your changes

3. **Commit the changeset** with your PR

## Code Review Guidelines

When reviewing code, consider:

- **Functionality**: Does the code work as intended?
- **Type Safety**: Are all types properly defined?
- **Testing**: Are there adequate unit tests? Are integration tests included for API changes?
- **Performance**: Are there any performance concerns?
- **Security**: Are there any security implications?
- **Documentation**: Is the code well-documented?

Thank you for contributing to make this project better! 🎉
