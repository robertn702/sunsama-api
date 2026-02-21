---
description: Add a new API endpoint from a curl request
model: claude-opus-4-6
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(pnpm typecheck:*), Bash(pnpm test:*), Bash(pnpm lint:*)
argument-hint: <curl request>
---

You are adding a new endpoint to the Sunsama API TypeScript client. The user has provided a curl request captured from browser dev tools.

## Input

Curl request to implement:

```
$ARGUMENTS
```

## Steps

### 1. Parse the curl request

Extract from the curl request:
- `operationName` — from the `x-gql-operation-name` header and/or the `operationName` field in the request body
- `query` — the full GraphQL mutation or query string from the request body
- Input variables — from the `variables.input` object in the request body
- Response shape — infer from the fragment/field selections in the query

### 2. Understand the operation

Determine:
- Is it a **mutation** or a **query**?
- What **domain** does it belong to? (`tasks`, `streams`, `user`) — look at the operation name for hints
- What **input fields** does it take? (from `variables.input`)
- What does it **return**? (from the query body — look for `...UpdateTaskPayload`, custom fields, etc.)

### 3. Check for existing types and patterns

Read these files to understand existing conventions before writing anything:
- `src/types/api.ts` — find analogous input interfaces
- `src/queries/tasks/mutations.ts` — see how mutations are structured
- `src/queries/fragments/index.ts` — see what fragments are available
- The appropriate method file in `src/client/methods/` — find the most similar existing method:
  - Task queries → `src/client/methods/user.ts`
  - Task create/delete/complete/uncomplete → `src/client/methods/task-lifecycle.ts`
  - Task text/notes/time/stream/snooze updates → `src/client/methods/task-updates.ts`
  - Subtask operations → `src/client/methods/subtasks.ts`
  - Scheduling/reorder → `src/client/methods/task-scheduling.ts`
- `src/__tests__/client.test.ts` — see unit test patterns
- `src/__tests__/integration/tasks-crud.test.ts` — see integration test patterns

### 4. Add the TypeScript input type

Add a new `interface` to `src/types/api.ts` near the other related input types.

Naming convention: `Update{Resource}{Action}Input` or `Create{Resource}Input`.

Include:
- JSDoc comment block
- All fields with types and `/** ... */` doc comments
- Optional fields marked with `?`

Example pattern:
```typescript
/**
 * Input for updateTaskFoo mutation
 */
export interface UpdateTaskFooInput {
  /** The ID of the task to update */
  taskId: string;

  /** Flag to limit response payload */
  limitResponsePayload?: boolean;
}
```

### 5. Add the GraphQL mutation/query constant

Add the constant to the appropriate file in `src/queries/{domain}/mutations.ts` (or `queries.ts` for reads).

Naming convention: `UPDATE_TASK_{ACTION}_MUTATION` or `GET_{RESOURCE}_QUERY`.

Use the exact query string from the curl request, replacing inline fragments with the shared `${UPDATE_TASK_PAYLOAD_FRAGMENT}` where applicable.

Include a JSDoc block describing variables.

Example:
```typescript
/**
 * Mutation for doing foo to a task
 *
 * Variables:
 * - input.taskId: The ID of the task
 * - input.limitResponsePayload: Flag to limit response size (optional)
 */
export const UPDATE_TASK_FOO_MUTATION = gql`
  mutation updateTaskFoo($input: UpdateTaskFooInput!) {
    updateTaskFoo(input: $input) {
      ...UpdateTaskPayload
      __typename
    }
  }
  ${UPDATE_TASK_PAYLOAD_FRAGMENT}
`;
```

### 6. Add the client method

Add the method to the appropriate file in `src/client/methods/` (identified in step 3):

1. Import the new mutation constant at the top of the method file
2. Import the new input type at the top of the method file
3. Add the method in alphabetical order among similar methods in that class

Method conventions:
- All methods are `async` and return `Promise<...>`
- Use `limitResponsePayload = true` as default parameter
- Throw `SunsamaError` for missing response data
- Throw `SunsamaValidationError` for invalid caller input (bad format, out-of-range)
- Throw `SunsamaAuthError` only for authentication failures
- Include full JSDoc with `@param`, `@returns`, `@throws`, and `@example`

Example structure:
```typescript
/**
 * Does foo to a task
 *
 * @param taskId - The ID of the task
 * @param limitResponsePayload - Whether to limit response size (defaults to true)
 * @returns The update result with success status
 * @throws SunsamaAuthError if not authenticated or request fails
 *
 * @example
 * ```typescript
 * const result = await client.updateTaskFoo('taskId123');
 * ```
 */
async updateTaskFoo(
  taskId: string,
  limitResponsePayload = true
): Promise<UpdateTaskPayload> {
  const variables: UpdateTaskFooInput = {
    taskId,
    limitResponsePayload,
  };

  const request: GraphQLRequest<{ input: UpdateTaskFooInput }> = {
    operationName: 'updateTaskFoo',
    variables: { input: variables },
    query: UPDATE_TASK_FOO_MUTATION,
  };

  const response = await this.graphqlRequest<
    { updateTaskFoo: UpdateTaskPayload },
    { input: UpdateTaskFooInput }
  >(request);

  if (!response.data) {
    throw new SunsamaError('No response data received');
  }

  return response.data.updateTaskFoo;
}
```

### 7. Add unit tests

Add tests to `src/__tests__/client.test.ts` near the tests for similar methods.

Always include at minimum:
- Method existence check
- Throws-without-auth check

If the method has input validation (e.g. date format, range checks), also add tests for:
- Invalid inputs throw `SunsamaValidationError`
- Valid inputs pass validation (fail at GraphQL level with "Unauthorized")

Example pattern:
```typescript
it('should have updateTaskFoo method', () => {
  const client = new SunsamaClient();
  expect(typeof client.updateTaskFoo).toBe('function');
});

it('should throw error when calling updateTaskFoo without authentication', async () => {
  const client = new SunsamaClient();
  await expect(client.updateTaskFoo('test-task-id')).rejects.toThrow();
});
```

### 8. Add integration tests

Add a `describe` block to the most appropriate integration test file in `src/__tests__/integration/`. Use `tasks-crud.test.ts` for general task operations, or create a new file if the feature is distinct enough.

**Always** use the shared auth pattern:
- `getAuthenticatedClient()` — never call `client.login()`
- `trackTaskForCleanup(taskId)` — for any tasks created
- `describe.skipIf(!hasCredentials())(...)` — to skip when no credentials

Test the full round-trip where possible (e.g., create → do operation → verify state).

### 9. Update README

Add usage examples to `README.md` near the section for similar methods. Follow the existing pattern of short, practical code snippets.

### 10. Verify

Run:
```bash
pnpm typecheck && pnpm test && pnpm lint
```

All checks must pass before finishing.

## Notes

- The `graphqlRequest` method handles HTTP errors and throws `SunsamaAuthError` for non-2xx responses and GraphQL errors — you don't need to handle those in the client method
- `limitResponsePayload: true` causes `updatedTask` and `updatedFields` to be `null` in the response — this is expected and documented in `UpdateTaskPayload`
- Always use `.js` extensions in relative imports (ESM requirement)
- Error class selection:
  - `SunsamaAuthError` — authentication failures only (login failed, session expired, cannot determine user ID)
  - `SunsamaValidationError` — invalid caller input (bad format, out-of-range values); accepts optional `field` parameter
  - `SunsamaError` — generic errors that don't fit a more specific class (e.g. missing response data, task not found)
