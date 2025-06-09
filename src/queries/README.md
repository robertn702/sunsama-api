# GraphQL Queries

This directory contains all GraphQL queries and fragments used by the Sunsama API client.

## Structure

```
queries/
├── index.ts              # Main exports for all queries
├── user.ts               # User-related queries
├── tasks.ts              # Task-related queries
└── fragments/
    ├── index.ts          # Fragment exports
    └── task.ts           # Task-related fragments
```

## Organization Principles

### 1. **Separation by Domain**

- `user.ts` - All user-related queries
- `tasks.ts` - All task-related queries
- Add new files for other domains (calendars, objectives, etc.)

### 2. **Fragment Reusability**

- Common fragments are stored in `fragments/` directory
- Large fragments are broken down into smaller, composable pieces
- Fragments are imported and combined in queries

### 3. **Naming Conventions**

- **Queries**: `GET_[ENTITY]_QUERY` (e.g., `GET_USER_QUERY`)
- **Fragments**: `[ENTITY]_FRAGMENT` (e.g., `TASK_FRAGMENT`)
- **Sub-fragments**: `[ENTITY]_[SUBFIELD]_FRAGMENT` (e.g., `TASK_INTEGRATION_FRAGMENT`)

## Usage in Client

```typescript
import { GET_USER_QUERY, GET_TASKS_BY_DAY_QUERY } from '../queries/index.js';

// Use in GraphQL requests
const request: GraphQLRequest = {
  operationName: 'getUser',
  variables: {},
  query: GET_USER_QUERY,
};
```

## Adding New Queries

1. **For a new domain**: Create a new file (e.g., `calendars.ts`)
2. **For new fragments**: Add to appropriate file in `fragments/`
3. **Export**: Add exports to the relevant index files
4. **Import**: Import in client where needed

## Benefits

- **Maintainability**: Queries are easier to find and modify
- **Reusability**: Fragments can be shared across queries
- **Readability**: Client code is cleaner without large inline strings
- **Type Safety**: Queries are statically analyzable
- **Testing**: Queries can be unit tested independently
