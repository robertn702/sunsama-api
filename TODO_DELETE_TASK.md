# Implementation Plan: deleteTask Method

## Overview
This document outlines the step-by-step plan to implement the `deleteTask` method in the Sunsama API TypeScript wrapper. This method allows deleting tasks using the updateTaskDelete GraphQL mutation.

## Analysis of the GraphQL Mutation

### Request Structure
- **Operation Name**: `updateTaskDelete`
- **Mutation Variables**:
  ```typescript
  {
    input: {
      taskId: string,              // The ID of the task to delete
      limitResponsePayload: boolean, // Flag to limit response size
      wasTaskMerged: boolean       // Whether the task was merged before deletion
    }
  }
  ```

### Response Structure
- **Success Response**:
  ```typescript
  {
    data: {
      updateTaskDelete: {
        updatedTask: Task | null,      // Full task object (null when limitResponsePayload is true)
        updatedFields: PartialTask | null,  // Partial task with updated fields only
        success: boolean,               // Whether the operation succeeded
        skipped: boolean | null,        // Whether the operation was skipped
        __typename: "UpdateTaskPayload"
      }
    }
  }
  ```

## Implementation Checklist

### 1. Define TypeScript Types
- [ ] Create `UpdateTaskDeleteInput` interface in `src/types/api.ts`
- [ ] Reuse existing `UpdateTaskPayload` interface (already exists)
- [ ] Export new types from `src/types/index.ts` (automatically exported via wildcard)

### 2. Create GraphQL Mutation
- [ ] Create new file `src/queries/mutations/updateTaskDelete.ts`
- [ ] Define the GraphQL mutation string using existing fragments
- [ ] Import required fragments (UpdateTaskPayload, Task, PartialTask)
- [ ] Export the mutation from `src/queries/mutations/index.ts`

### 3. Implement Client Method
- [ ] Add `deleteTask` method to `SunsamaClient` class
- [ ] Method signature: `async deleteTask(taskId: string, limitResponsePayload?: boolean, wasTaskMerged?: boolean): Promise<UpdateTaskPayload>`
- [ ] Handle optional parameters with sensible defaults
- [ ] Use existing `graphqlRequest` method for the API call

### 4. Add Documentation
- [ ] Add comprehensive JSDoc comments to the method
- [ ] Include parameter descriptions
- [ ] Document return type
- [ ] Add usage examples in the comments
- [ ] Update README.md to include the new method in the API Methods section

### 5. Create Tests
- [ ] Add tests to `src/__tests__/client.test.ts`
- [ ] Test that deleteTask method exists
- [ ] Test error when calling without authentication
- [ ] Add real authentication test to `scripts/test-real-auth.ts`
- [ ] Add comprehensive unit tests with mocked responses

### 6. Quality Assurance
- [ ] Run TypeScript compiler (`npm run typecheck`)
- [ ] Run linter (`npm run lint`)
- [ ] Run tests (`npm test`)
- [ ] Ensure all checks pass

## Method Implementation Details

### Method Signature
```typescript
async deleteTask(
  taskId: string,
  limitResponsePayload: boolean = true,
  wasTaskMerged: boolean = false
): Promise<UpdateTaskPayload>
```

### Key Considerations
1. **Default Behavior**: `limitResponsePayload` defaults to `true` for performance
2. **Task Merging**: `wasTaskMerged` defaults to `false` for standard deletion
3. **Response Optimization**: Limited payload returns null for updatedTask and updatedFields
4. **Error Handling**: Properly handle and throw appropriate errors
5. **Type Safety**: Ensure full type coverage for inputs and outputs

## GraphQL Mutation Structure
The mutation uses the following fragments:
- `UpdateTaskPayload`: Main response structure (reuses existing fragment)
- `Task`: Full task object (when not limited)
- `PartialTask`: Partial task with updated fields
- `TaskActualTime`: Time tracking information
- `TaskScheduledTime`: Scheduled time information
- `TaskIntegration`: Integration details for various services

## Testing Strategy
1. **Unit Tests**: Test the method in isolation with mocked responses
2. **Integration Tests**: Test with real API to delete actual tasks
3. **Edge Cases**: Test boundary conditions and error scenarios
4. **Type Tests**: Ensure TypeScript types are correctly inferred

## Success Criteria
- [ ] Method successfully deletes tasks in Sunsama
- [ ] All TypeScript types are properly defined and exported
- [ ] GraphQL mutation is correctly structured with all fragments
- [ ] Comprehensive test coverage (>90%)
- [ ] Documentation is clear and includes examples
- [ ] README.md is updated with the new method
- [ ] All linting and type checking passes
- [ ] Method follows existing code patterns in the codebase

## Progress Notes

### Analysis Notes
- The task deletion uses `updateTaskDelete` mutation which follows the same pattern as `updateTaskComplete`
- The response structure is identical to other update operations (`UpdateTaskPayload`)
- The `wasTaskMerged` parameter suggests support for merged task cleanup
- The mutation can return limited or full response based on `limitResponsePayload`
- This operation is permanent and sets the task's `deleted` flag

## GraphQL Mutation Structure
```graphql
mutation updateTaskDelete($input: UpdateTaskDeleteInput!) {
  updateTaskDelete(input: $input) {
    ...UpdateTaskPayload
    __typename
  }
}
```

## Testing Strategy
1. **Unit Tests**: Test the method in isolation with mocked responses
2. **Integration Tests**: Test with real API to delete actual tasks (requires task creation first)
3. **Edge Cases**: Test boundary conditions and error scenarios
4. **Validation**: Test input validation and default value handling

## README.md Update Requirements

When implementing the method, update the README.md file to include:

1. **Add to the Tasks section** under API Methods:
   ```typescript
   // Delete a task
   const result = await client.deleteTask('taskId');
   
   // Delete with full response payload
   const result = await client.deleteTask('taskId', false);
   
   // Delete a merged task
   const result = await client.deleteTask('taskId', true, true);
   ```

2. **Document the method parameters**:
   - `taskId` (required): The ID of the task to delete
   - `limitResponsePayload` (optional): Whether to limit response size (defaults to true)
   - `wasTaskMerged` (optional): Whether the task was merged before deletion (defaults to false)

3. **Document the return value**:
   - Returns `UpdateTaskPayload` with success status and optionally the updated task details