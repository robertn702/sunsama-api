# Implementation Plan: createTask Method

## Overview
This document outlines the step-by-step plan to implement the `createTask` method in the Sunsama API TypeScript wrapper. This method allows creating new tasks with various properties including text, notes, time estimates, and stream assignments.

## Analysis of the GraphQL Mutation

### Request Structure
- **Operation Name**: `createTask`
- **Mutation Variables**:
  ```typescript
  {
    task: {
      _id: string,                    // Client-generated ID for the task
      groupId: string,                // Group ID the task belongs to
      taskType: string,               // Type of task (e.g., "outcomes")
      streamIds: string[],            // Array of stream IDs to associate with
      recommendedStreamId: string | null,
      eventInfo: object | null,
      seededEventIds: string[] | null,
      private: boolean,               // Whether task is private
      assigneeId: string,             // ID of the user assigned to the task
      createdBy: string,              // ID of the user creating the task
      integration: object | null,
      deleted: boolean,
      text: string,                   // Main task text/title
      notes: string,                  // Task notes/description
      notesMarkdown: string | null,
      notesChecksum: string | null,
      editorVersion: number,          // Editor version (e.g., 3)
      collabSnapshot: object,         // Collaborative editing state
      completed: boolean,
      completedBy: string | null,
      completeDate: string | null,
      completeOn: string | null,
      archivedAt: string | null,
      duration: number | null,
      runDate: object | null,
      snooze: object | null,          // Snooze configuration
      timeHorizon: object | null,
      dueDate: string | null,
      comments: array[],
      orderings: array[],
      backlogOrderings: array[],
      subtasks: array[],
      subtasksCollapsed: boolean | null,
      sequence: object | null,
      followers: string[],
      recommendedTimeEstimate: number | null,
      timeEstimate: number,           // Time estimate in minutes
      actualTime: array[],
      scheduledTime: array[],
      createdAt: string,              // ISO timestamp
      lastModified: string,           // ISO timestamp
      objectiveId: string | null,
      ritual: object | null
    },
    groupId: string,                  // Group ID (duplicated from task)
    position?: string                 // Optional position parameter
  }
  ```

### Response Structure
- **Success Response**:
  ```typescript
  {
    data: {
      createTaskV2: {
        success: boolean,             // Whether the operation succeeded
        error: string | null,         // Error message if failed
        updatedFields: {              // Fields that were updated/computed by server
          recommendedStreamId: string | null,
          streamIds: string[] | null,
          recommendedTimeEstimate: number | null,
          timeEstimate: number | null,
          __typename: "PartialTask"
        },
        __typename: "CreateTaskPayload"
      }
    }
  }
  ```

## Implementation Checklist

### 1. Define TypeScript Types
- [ ] Create `TaskInput` interface in `src/types/api.ts` (full task input structure)
- [ ] Create `CreateTaskInput` interface for the mutation variables
- [ ] Create `CreateTaskPayload` interface for the response
- [ ] Create simplified input interfaces for common use cases
- [ ] Export new types from `src/types/index.ts` (automatically exported via wildcard)

### 2. Create GraphQL Mutation
- [ ] Create new file `src/queries/mutations/createTask.ts`
- [ ] Define the GraphQL mutation string
- [ ] Import or create required fragments if needed
- [ ] Export the mutation from `src/queries/mutations/index.ts`

### 3. Implement Client Method
- [ ] Add `createTask` method to `SunsamaClient` class
- [ ] Create a simplified method signature for common use cases
- [ ] Generate client-side task ID (UUID)
- [ ] Handle default values for required fields
- [ ] Use cached userId and groupId from client state
- [ ] Handle the collaborative editing snapshot
- [ ] Use existing `graphqlRequest` method for the API call

### 4. Add Documentation
- [ ] Add comprehensive JSDoc comments to the method
- [ ] Include parameter descriptions
- [ ] Document return type
- [ ] Add usage examples in the comments
- [ ] Update README.md to include the new method in the API Methods section

### 5. Create Tests
- [ ] Add tests to `src/__tests__/client.test.ts`
- [ ] Test that createTask method exists
- [ ] Test error when calling without authentication
- [ ] Add real authentication test to `scripts/test-real-auth.ts`
- [ ] Test various task creation scenarios
- [ ] Add comprehensive unit tests with mocked responses

### 6. Quality Assurance
- [ ] Run TypeScript compiler (`npm run typecheck`)
- [ ] Run linter (`npm run lint`)
- [ ] Run tests (`npm test`)
- [ ] Ensure all checks pass

## Method Implementation Details

### Method Signature
```typescript
// Simplified signature for common use cases
async createTask(
  text: string,
  options?: {
    notes?: string;
    timeEstimate?: number;
    streamIds?: string[];
    private?: boolean;
    dueDate?: Date | string;
    snoozeUntil?: Date | string;
  }
): Promise<CreateTaskPayload>

// Advanced signature for full control
async createTaskAdvanced(
  taskInput: TaskInput
): Promise<CreateTaskPayload>
```

### Key Considerations
1. **ID Generation**: Generate a unique ID client-side for the task
2. **Default Values**: Provide sensible defaults for all required fields
3. **User Context**: Use cached userId and groupId from the client
4. **Editor Version**: Default to version 3 (current version)
5. **Timestamps**: Generate createdAt and lastModified client-side
6. **Collaborative Editing**: Handle the collabSnapshot structure for notes
7. **Simplified API**: Provide a simple method for common use cases
8. **Date Handling**: Accept both Date objects and ISO strings

## GraphQL Mutation Structure
```graphql
mutation createTask($task: TaskInput!, $groupId: String!, $position: String) {
  createTaskV2(task: $task, groupId: $groupId, position: $position) {
    success
    error
    updatedFields {
      recommendedStreamId
      streamIds
      recommendedTimeEstimate
      timeEstimate
      __typename
    }
    __typename
  }
}
```

## Testing Strategy
1. **Unit Tests**: Test the method in isolation with mocked responses
2. **Integration Tests**: Test with real API to create actual tasks
3. **Edge Cases**: Test boundary conditions and error scenarios
4. **Validation**: Test input validation and default value handling

## Success Criteria
- [ ] Method successfully creates tasks in Sunsama
- [ ] All TypeScript types are properly defined and exported
- [ ] GraphQL mutation is correctly structured
- [ ] Simplified API is intuitive and easy to use
- [ ] Comprehensive test coverage (>90%)
- [ ] Documentation is clear and includes examples
- [ ] README.md is updated with the new method
- [ ] All linting and type checking passes
- [ ] Method follows existing code patterns in the codebase

## Progress Notes

### Analysis Notes
- The task creation requires a full task object with many fields
- The task ID is generated client-side (appears to be a MongoDB ObjectId format)
- The mutation uses `createTaskV2` which suggests there's an older version
- The response includes `updatedFields` which may contain server-computed values
- The `collabSnapshot` field contains collaborative editing state for notes
- The `snooze` field has a specific structure with userId, date, and until fields
- Task type appears to be "outcomes" in the example

## README.md Update Requirements

When implementing the method, update the README.md file to include:

1. **Add to the Tasks section** under API Methods:
   ```typescript
   // Create a simple task
   const task = await client.createTask('Complete project documentation');
   
   // Create a task with options
   const task = await client.createTask('Review pull requests', {
     notes: 'Check all open PRs in the main repository',
     timeEstimate: 30,
     streamIds: ['stream-id-1'],
     dueDate: '2025-01-20'
   });
   
   // Create a task with snooze
   const task = await client.createTask('Follow up with client', {
     snoozeUntil: new Date('2025-01-15T09:00:00')
   });
   ```

2. **Document the method parameters**:
   - `text` (required): The main text/title of the task
   - `options` (optional): Additional task properties
     - `notes`: Task description/notes
     - `timeEstimate`: Time estimate in minutes
     - `streamIds`: Array of stream IDs to assign the task to
     - `private`: Whether the task is private
     - `dueDate`: Due date as Date or ISO string
     - `snoozeUntil`: Snooze until date as Date or ISO string

3. **Document the return value**:
   - Returns `CreateTaskPayload` with success status and any server-updated fields