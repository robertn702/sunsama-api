---
"sunsama-api": minor
---

feat: add getArchivedTasks method with pagination support

Adds new `getArchivedTasks()` method to SunsamaClient for retrieving archived tasks with optional pagination parameters (offset, limit). The method follows the same authentication and error handling patterns as existing methods.

**New Features:**
- `getArchivedTasks(offset?, limit?)` method with default pagination (offset=0, limit=300)
- `GetArchivedTasksInput` and `GetArchivedTasksResponse` TypeScript interfaces
- `GET_ARCHIVED_TASKS_QUERY` GraphQL query using existing Task fragment
- Comprehensive unit tests and integration tests with real API validation

**Usage:**
```typescript
// Get first 300 archived tasks (default)
const archivedTasks = await client.getArchivedTasks();

// Get archived tasks with custom pagination
const moreTasks = await client.getArchivedTasks(300, 100); // offset 300, limit 100
```