# Sunsama API TypeScript Wrapper - LLM Context

## Project Overview
TypeScript wrapper for Sunsama's GraphQL API. Provides type-safe access to daily planning and task management functionality. Published as NPM package with dual CJS/ESM builds.

## Technical Stack
- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js >= 16
- **Build**: Multiple targets (CJS, ESM, TypeScript declarations)
- **Testing**: Vitest with unit and integration tests
- **Package Manager**: pnpm (development), npm (distribution)
- **GraphQL**: gql-tag for query definitions
- **Special Dependencies**: Yjs (collaborative editing), zod (validation)

## Development Commands
```bash
pnpm build          # Build all targets (CJS, ESM, types)
pnpm test           # Unit tests only (fast, mocked)
pnpm test:integration  # Integration tests (real API, requires .env)
pnpm typecheck      # Type checking without build
pnpm lint           # ESLint
pnpm format         # Prettier
npx changeset       # Create version bump changeset
pnpm release        # Publish to npm (runs build + test + lint first)
```

## Project Structure
```
src/
├── client/           # Main SunsamaClient class
├── queries/          # GraphQL queries/mutations by domain
│   ├── tasks/        # Task operations
│   ├── streams/      # Stream operations
│   ├── user/         # User operations
│   └── fragments/    # Shared GraphQL fragments
├── types/            # TypeScript type definitions
├── utils/            # Utility functions (conversion, validation)
├── errors/           # Custom error classes
└── __tests__/
    ├── integration/  # Real API tests (shared auth, auto cleanup)
    └── *.test.ts     # Unit tests (mocked)
```

## Architecture Patterns

### GraphQL Client
- Uses native `fetch` API
- Cookie-based authentication
- GraphQL mutations for all operations
- Type-safe query/mutation functions with gql-tag

### Error Handling
- Custom error hierarchy: `SunsamaError` → `SunsamaAuthError` / `SunsamaApiError`
- Always throw errors, never return error objects
- Include context in error messages

### Type Safety
- Strict TypeScript configuration
- Zod schemas for runtime validation
- No `any` types allowed
- Discriminated unions for variant types (e.g., task integration types)

### Collaborative Editing (Yjs)
**CRITICAL**: Task notes use Yjs for real-time sync with Sunsama UI.

Required structure:
```typescript
Y.XmlFragment('default')
  └─ Y.XmlElement('paragraph')
      └─ Y.XmlText
          └─ actual content
```

**NOT** `Y.Text` directly - this breaks Sunsama UI sync.

Functions:
- `createCollabSnapshot(content)` - Create initial snapshot
- `createUpdatedCollabSnapshot(existingSnapshot, newContent)` - Update existing

## Testing Patterns

### Unit Tests
- Location: `src/__tests__/**/*.test.ts` (excluding `integration/`)
- Use Vitest with mocked dependencies
- No real API calls
- Fast, run in CI/CD

### Integration Tests
- Location: `src/__tests__/integration/*.test.ts`
- Real API calls with credentials from `.env`
- **MUST use shared authentication pattern** to avoid rate limiting

**Pattern for new integration tests:**
```typescript
import { getAuthenticatedClient, hasCredentials, trackTaskForCleanup } from './setup.js';

describe.skipIf(!hasCredentials())('Feature Name (Integration)', () => {
  let client: SunsamaClient;

  beforeAll(async () => {
    client = await getAuthenticatedClient(); // Reuses shared session
  });

  it('should test something', async () => {
    const taskId = SunsamaClient.generateTaskId();
    trackTaskForCleanup(taskId); // Auto-cleanup in teardown

    await client.createTask('Test', { taskId });
    // ... assertions
  });
});
```

**DO NOT:**
- Create separate `client.login()` calls (causes rate limiting)
- Skip `trackTaskForCleanup()` (leaves test data)
- Add `afterAll` cleanup (handled by global teardown)

### Test Organization
- `user.test.ts` - User operations
- `streams.test.ts` - Stream operations
- `tasks-crud.test.ts` - Task CRUD
- `tasks-scheduling.test.ts` - Task scheduling
- `tasks-updates.test.ts` - Task property updates
- `task-notes.test.ts` - Notes with Yjs
- `subtasks.test.ts` - Subtask management
- `archived-tasks.test.ts` - Archived task retrieval

## Code Conventions

### File Structure
- One class/interface per file
- Use explicit `.js` extensions in imports (ESM requirement)
- Export types and functions separately

### Naming
- Interfaces: PascalCase (e.g., `CreateTaskOptions`)
- Functions: camelCase (e.g., `createTask`)
- Constants: UPPER_SNAKE_CASE (e.g., `CREATE_TASK_MUTATION`)
- Private methods: camelCase with underscore prefix (e.g., `_makeRequest`)

### GraphQL
- Mutations in `src/queries/{domain}/mutations.ts`
- Queries in `src/queries/{domain}/queries.ts`
- Fragments in `src/queries/fragments/`
- Use gql-tag for all operations
- Include `__typename` in all response types

### API Methods
- All methods are async and return Promises
- Use optional parameters with defaults where appropriate
- Accept Date objects or ISO strings for dates
- Convert minutes to seconds for time estimates (API uses seconds)
- Always validate input with Zod schemas

## Common Pitfalls

1. **Yjs Structure**: Must use XmlFragment → XmlElement → XmlText, not Text directly
2. **Integration Tests**: Must use `getAuthenticatedClient()`, never create new sessions
3. **ESM Imports**: Must include `.js` extension in relative imports
4. **Time Units**: API uses seconds, public API uses minutes (convert in client)
5. **GraphQL Responses**: Always destructure from `data` property
6. **Task IDs**: Use `generateTaskId()` for custom IDs (MongoDB ObjectId format)

## Development Workflow

### Adding New API Method
1. Add TypeScript types in `src/types/api.ts`
2. Add GraphQL mutation/query in `src/queries/{domain}/`
3. Add client method in `src/client/index.ts`
4. Add unit tests (mocked)
5. Add integration test using shared auth pattern
6. Update README.md with examples
7. Run `pnpm typecheck && pnpm test && pnpm lint`

### Release Process
1. Make changes on feature branch
2. Create PR to main
3. After merge: `npx changeset` (describe changes)
4. `pnpm changeset version` (bump version, update CHANGELOG)
5. Commit version bump
6. `pnpm release` (publishes to npm, auto-pushes tags)

## Git Rules

- **Branch naming**: `{type}/{short-name}` (e.g., `feat/add-subtasks`, `fix/auth-bug`)
- **Commit email**: Use GitHub no-reply for this project

## Key Areas of Focus

When working on this project:
1. **Type safety** - No `any`, comprehensive types
2. **Error handling** - Descriptive errors with context
3. **Backwards compatibility** - Avoid breaking changes
4. **Documentation** - Update README for all public APIs
5. **Testing** - Unit tests + integration tests for all methods
6. **Yjs structure** - Maintain XmlFragment structure for notes
7. **Shared auth** - Always use singleton client in integration tests
8. **Performance** - Minimize API calls, use `limitResponsePayload` where appropriate
