# sunsama-api

## 0.11.0

### Minor Changes

- 518a4d4: Add updateTaskStream method for task stream assignment

  Implements updateTaskStream method to allow assigning tasks to specific streams (projects/categories).

  This method provides:

  - Task stream assignment functionality
  - Support for limitResponsePayload option
  - Comprehensive unit and integration tests
  - Full TypeScript support with proper types
  - Documentation with usage examples

## 0.10.0

### Minor Changes

- ce96fff: Add updateTaskText method for updating task titles

  Adds a new `updateTaskText` method that allows updating the text/title of a task. This method supports optional parameters for setting recommended stream IDs and controlling response payload size. The implementation includes comprehensive TypeScript types, GraphQL mutations, unit tests, and integration tests.

  Features:

  - Update task text/title with simple API
  - Optional recommended stream ID parameter
  - Support for limiting response payload
  - Full TypeScript type safety
  - Comprehensive test coverage
  - Integration with existing GraphQL patterns

## 0.9.0

### Minor Changes

- 447c3c4: Add updateTaskDueDate method for task deadline management

  This adds a new updateTaskDueDate method that allows users to set, update, or clear due dates for tasks. The method supports Date objects, ISO strings, and null values for clearing due dates. This feature enables better deadline tracking and task planning workflows.

## 0.8.1

### Patch Changes

- a2934c3: Fix createTask GraphQL mutation by removing \_\_typename from snooze input field

  The createTask function was incorrectly including a **typename field in the TaskSnooze object when creating tasks with snooze configuration. GraphQL input types don't accept **typename fields, causing mutations to fail. This fix introduces a separate TaskSnoozeInput type without \_\_typename and updates the createTask implementation to use it.

## 0.8.0

### Minor Changes

- f6fab2b: Simplify updateTaskNotes API with explicit format selection

  The `updateTaskNotes` method now uses a discriminated union for content parameter instead of separate `notes` and `notesMarkdown` parameters.

  - Replace dual parameters with single `content: { html: string } | { markdown: string }`
  - Add automatic HTML ↔ Markdown conversion using marked and turndown libraries
  - Provide better type safety with explicit format selection
  - Remove need for developers to provide both formats manually
  - Update all documentation and examples

  **Migration:**

  ```typescript
  // Before
  await client.updateTaskNotes(taskId, htmlContent, markdownContent);

  // After - HTML input
  await client.updateTaskNotes(taskId, { html: htmlContent });

  // After - Markdown input
  await client.updateTaskNotes(taskId, { markdown: markdownContent });
  ```

## 0.7.0

### Minor Changes

- 3017865: Add updateTaskPlannedTime method to update task time estimates

  This release adds a new `updateTaskPlannedTime` method that allows updating the planned time (time estimate) for tasks. The method accepts time estimates in minutes and automatically converts them to seconds for the API.

  Features:

  - Update task time estimates in minutes
  - Support for clearing time estimates (set to 0)
  - Optional response payload limiting
  - Full TypeScript support with proper typing
  - Comprehensive test coverage in both unit and integration tests

  Example usage:

  ```typescript
  // Set task time estimate to 30 minutes
  await client.updateTaskPlannedTime('taskId', 30);

  // Clear time estimate
  await client.updateTaskPlannedTime('taskId', 0);

  // Get full response payload
  await client.updateTaskPlannedTime('taskId', 45, false);
  ```

## 0.6.1

### Patch Changes

- b6b185f: Fix TypeScript configuration for proper type generation

  Updates tsconfig.json to ensure correct type declaration file generation and build output structure.

## 0.6.0

### Minor Changes

- a5d4e8f: Add updateTaskNotes method with Yjs-powered collaborative editing

  This release introduces a new `updateTaskNotes` method that allows updating task notes with proper collaborative editing support. Key features include:

  - **Yjs Integration**: Uses Yjs library for proper collaborative document state management
  - **Automatic Snapshot Handling**: Retrieves existing collaborative snapshots from tasks automatically
  - **Content-Aware Encoding**: Generates real base64-encoded snapshots based on actual note content
  - **Advanced Options**: Support for custom collaborative snapshots and response payload control
  - **Type Safety**: Full TypeScript support with proper error handling for missing collaborative state

  The method requires existing tasks with collaborative editing state and maintains proper synchronization with Sunsama's real-time editor. Both `createTask` and `updateTaskNotes` now use proper Yjs document encoding instead of hardcoded values.

  Breaking changes: Tasks without collaborative snapshots will now throw descriptive errors when attempting to update notes, ensuring data integrity.

## 0.5.0

### Minor Changes

- e6ac06a: Add getTaskById method for individual task retrieval

  - Add `getTaskById(taskId: string)` method to SunsamaClient
  - Supports retrieving any task by its unique ID
  - Returns the complete Task object with all fields or null if not found
  - Includes comprehensive tests and documentation
  - Follows existing patterns for authentication and error handling

## 0.4.0

### Minor Changes

- d1d92f9: feat: add getArchivedTasks method with pagination support

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

## 0.3.1

### Patch Changes

- 9f4fc79: Add Linear integration type support

  Adds TaskLinearIntegration interface and refactors TaskIntegration to be a union type of all integration types (Website, Google Calendar, Linear). Also renames base interface to BaseTaskIntegration for clarity.

## 0.3.0

### Minor Changes

- b0661ae: Add unified task scheduling method using updateTaskSnoozeDate GraphQL operation

  This release adds a new unified client method for all task scheduling operations:

  - `updateTaskSnoozeDate(taskId, newDay, options?)` - A flexible method that handles all scheduling scenarios:
    - Schedule a task to a specific date (pass date string)
    - Move a task to the backlog/unschedule (pass `null`)
    - Reschedule a task from one date to another
    - Support for timezone validation and custom response payload options

  The method provides a clean, unified interface that directly maps to the underlying GraphQL operation while eliminating code duplication. It includes comprehensive input validation with proper error handling for date formats, date validity, and timezone validation.

  Also includes:

  - Added `snooze` property to `PartialTask` interface for proper type safety
  - Comprehensive test coverage for the new unified method
  - Updated test script to demonstrate the full scheduling workflow
  - Input validation using Zod v4 for enhanced type safety

## 0.2.1

### Patch Changes

- b6c85ba: Fix ESM directory import error for Node.js compatibility

  - Add explicit .js extensions to all relative imports in source files
  - Update package.json exports to include subpath exports for all modules
  - Update ESM TypeScript configuration for proper Node.js compatibility
  - Rebuild all distribution files with correct ESM imports

  This resolves the ERR_UNSUPPORTED_DIR_IMPORT error when using the package in Node.js ESM environments.
