# Implementation Plan: updateTaskComplete Method

## Overview
This document outlines the step-by-step plan to implement the `updateTaskComplete` method in the Sunsama API TypeScript wrapper. This method allows marking a task as complete with a specific completion timestamp.

## Analysis of the GraphQL Mutation

### Request Structure
- **Operation Name**: `updateTaskComplete`
- **Mutation Variables**:
  ```typescript
  {
    input: {
      taskId: string,          // The ID of the task to mark complete
      completeOn: string,      // ISO 8601 timestamp when task was completed
      limitResponsePayload: boolean  // Flag to limit response size
    }
  }
  ```

### Response Structure
- **Success Response**:
  ```typescript
  {
    data: {
      updateTaskComplete: {
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
- [x] Create `UpdateTaskCompleteInput` interface in `src/types/api.ts`
- [x] Create `UpdateTaskPayload` interface in `src/types/api.ts`
- [x] Export new types from `src/types/index.ts` (automatically exported via wildcard)

### 2. Create GraphQL Mutation
- [x] Create new file `src/queries/mutations/updateTaskComplete.ts`
- [x] Define the GraphQL mutation string using existing fragments
- [x] Import required fragments (UpdateTaskPayload, Task, PartialTask)
- [x] Export the mutation from `src/queries/index.ts`

### 3. Implement Client Method
- [x] Add `updateTaskComplete` method to `SunsamaClient` class
- [x] Method signature: `async updateTaskComplete(taskId: string, completeOn?: Date | string, limitResponsePayload?: boolean): Promise<UpdateTaskPayload>`
- [x] Handle optional `completeOn` parameter (default to current time if not provided)
- [x] Convert Date object to ISO string if needed
- [x] Use existing `graphqlRequest` method for the API call

### 4. Add Documentation
- [x] Add comprehensive JSDoc comments to the method
- [x] Include parameter descriptions
- [x] Document return type
- [x] Add usage examples in the comments
- [x] Update README.md to include the new method in the API Methods section

### 5. Create Tests
- [x] Add tests to `src/__tests__/client.test.ts`
- [x] Test that updateTaskComplete method exists
- [x] Test error when calling without authentication
- [ ] Add real authentication test to `scripts/test-real-auth.ts` (NOTE: Defer until after task creation logic is implemented)
- [ ] Add more comprehensive unit tests with mocked responses (deferred for future)

### 6. Quality Assurance
- [x] Run TypeScript compiler (`npm run typecheck`)
- [x] Run linter (`npm run lint`)
- [x] Run tests (`npm test`)
- [x] Ensure all checks pass

## Method Implementation Details

### Method Signature
```typescript
async updateTaskComplete(
  taskId: string,
  completeOn?: Date | string,
  limitResponsePayload: boolean = true
): Promise<UpdateTaskPayload>
```

### Key Considerations
1. **Default Behavior**: If `completeOn` is not provided, use current timestamp
2. **Date Handling**: Accept both Date objects and ISO strings for flexibility
3. **Response Optimization**: Default `limitResponsePayload` to `true` for performance
4. **Error Handling**: Properly handle and throw appropriate errors
5. **Type Safety**: Ensure full type coverage for inputs and outputs

## GraphQL Mutation Structure
The mutation uses the following fragments:
- `UpdateTaskPayload`: Main response structure
- `Task`: Full task object (when not limited)
- `PartialTask`: Partial task with updated fields
- `TaskActualTime`: Time tracking information
- `TaskScheduledTime`: Scheduled time information
- `TaskIntegration`: Integration details for various services

## Testing Strategy
1. **Unit Tests**: Test the method in isolation with mocked responses
2. **Integration Tests**: Test with real API if test credentials are available
3. **Edge Cases**: Test boundary conditions and error scenarios
4. **Type Tests**: Ensure TypeScript types are correctly inferred

## Success Criteria
- [ ] Method successfully marks tasks as complete (needs real-world testing)
- [x] All TypeScript types are properly defined and exported
- [x] GraphQL mutation is correctly structured with all fragments
- [ ] Comprehensive test coverage (>90%)
- [x] Documentation is clear and includes examples
- [x] README.md is updated with the new method
- [x] All linting and type checking passes
- [x] Method follows existing code patterns in the codebase

## Progress Notes

### Step 1 Completed (TypeScript Types)
- Added `PartialTask` interface for partial task updates
- Added `UpdateTaskCompleteInput` interface with proper JSDoc comments
- Added `UpdateTaskPayload` interface for the mutation response
- Types are automatically exported through the wildcard export in `src/types/index.ts`

### Step 2 Completed (GraphQL Mutation)
- Created `src/queries/mutations/` directory structure
- Created `updateTaskComplete.ts` with:
  - `PARTIAL_TASK_FRAGMENT` for partial task updates
  - `UPDATE_TASK_PAYLOAD_FRAGMENT` for the response structure
  - `UPDATE_TASK_COMPLETE_MUTATION` for the actual mutation
- Created `src/queries/mutations/index.ts` to export mutations
- Updated `src/queries/index.ts` to include mutations export
- All fragments are properly imported and composed

### Step 3 Completed (Client Method Implementation)
- Added `updateTaskComplete` method to `SunsamaClient` class
- Method accepts taskId, optional completeOn (Date or string), and optional limitResponsePayload
- Handles date conversion from Date object to ISO string
- Defaults to current timestamp if completeOn is not provided
- Defaults limitResponsePayload to true for performance
- Uses existing graphqlRequest method for API call
- Added comprehensive JSDoc documentation with examples
- Follows existing patterns in the codebase

### Step 5 Partially Completed (Tests)
- Added basic unit tests to `src/__tests__/client.test.ts`:
  - Test that updateTaskComplete method exists
  - Test that it throws error when called without authentication
- Real authentication test in `scripts/test-real-auth.ts` is deferred:
  - Need to implement task creation logic first to ensure we have tasks to test with
  - Once task creation is available, will add comprehensive tests for all three scenarios
- More comprehensive unit tests with mocked GraphQL responses can be added in the future

### Step 6 Completed (Quality Assurance)
- Successfully ran TypeScript compiler - no type errors
- Successfully ran ESLint - all code is properly formatted and follows style guidelines
- Fixed formatting issues with Prettier
- All unit tests pass (38 tests across 3 test files)
- The code is production-ready from a quality perspective

### README.md Updated
- Added three examples of using `updateTaskComplete` to the Tasks section:
  - Basic usage with just taskId (uses current timestamp)
  - Usage with custom timestamp string
  - Usage with Date object and full response payload
- The documentation is now complete and users can see how to use the new method

## Summary

The `updateTaskComplete` method has been successfully implemented with:
- Complete TypeScript type definitions
- Properly structured GraphQL mutation with all necessary fragments
- Clean implementation following existing patterns
- Comprehensive JSDoc documentation
- Basic unit tests
- All quality checks passing
- Updated README documentation

The only remaining items are:
1. Real-world testing with actual tasks
2. More comprehensive unit tests with mocked responses
3. Integration test in `scripts/test-real-auth.ts` (deferred until task creation is implemented)

## README.md Update Requirements

When implementing the method, update the README.md file to include:

1. **Add to the Tasks section** under API Methods:
   ```typescript
   // Mark a task as complete
   const result = await client.updateTaskComplete('taskId');
   
   // Mark complete with specific timestamp
   const result = await client.updateTaskComplete('taskId', '2025-01-15T10:30:00Z');
   
   // Get full task details in response
   const result = await client.updateTaskComplete('taskId', new Date(), false);
   ```

2. **Document the method parameters**:
   - `taskId` (required): The ID of the task to mark complete
   - `completeOn` (optional): Date or ISO string when task was completed (defaults to now)
   - `limitResponsePayload` (optional): Whether to limit response size (defaults to true)

3. **Document the return value**:
   - Returns `UpdateTaskPayload` with success status and optionally the updated task