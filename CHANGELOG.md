# sunsama-api

## 0.12.0

### Minor Changes

- 6257871: Add GitHub integration support to createTask method

  This minor release adds support for creating Sunsama tasks with GitHub integration, enabling users to convert GitHub issues and pull requests into tasks with proper linking and metadata.

  **New Features:**

  - Added `TaskGithubIntegration` TypeScript interface with all required fields (id, repositoryOwnerLogin, repositoryName, number, type, url)
  - Updated `TaskIntegration` union type to include GitHub integration
  - `createTask` method now supports GitHub integration through the `integration` option
  - Added comprehensive JSDoc and README examples demonstrating GitHub integration usage for both issues and pull requests

  **Improvements:**

  - Added integration tests verifying GitHub integration type definitions
  - Tests cover both Issue and PullRequest types

  **Migration:**
  No breaking changes. This is a purely additive feature that extends existing functionality.

- d0afdad: Add Gmail integration support to createTask method

  This minor release adds support for creating Sunsama tasks with Gmail integration, enabling users to convert Gmail emails into tasks with proper linking and metadata.

  **New Features:**

  - Added `TaskGmailIntegration` TypeScript interface with all required fields (id, messageId, accountId, url)
  - Extended `CreateTaskOptions` to accept `integration` field for linking tasks to external services
  - Updated `createTask` method to pass integration data to the Sunsama API
  - Added comprehensive JSDoc and README examples demonstrating Gmail integration usage

  **Improvements:**

  - Removed `TaskLoomVideoIntegration` from GraphQL fragment (not a real integration)
  - Added integration tests verifying type definitions

  **Example Usage:**

  ```typescript
  const gmailTask = await client.createTask('Project Update Email', {
    integration: {
      service: 'gmail',
      identifier: {
        id: '19a830b40fd7ab7d',
        messageId: '19a830b40fd7ab7d',
        accountId: 'user@example.com',
        url: 'https://mail.google.com/mail/u/user@example.com/#inbox/19a830b40fd7ab7d',
        __typename: 'TaskGmailIntegrationIdentifier',
      },
      __typename: 'TaskGmailIntegration',
    },
    timeEstimate: 15,
  });
  ```

  **Migration:**
  No breaking changes. This is a purely additive feature that extends existing functionality.

## 0.11.2

### Patch Changes

- e9733c2: Fix task notes not syncing with Sunsama UI by using Y.XmlFragment structure

  This patch fixes Issue #14 where task notes created or updated via the API were not appearing in the Sunsama UI. The fix changes the Yjs collaborative editing structure from Y.Text to Y.XmlFragment with paragraph elements, matching the UI's rich text editor implementation.

  **Changes:**

  - Updated `createCollabSnapshot()` to use XmlFragment('default') → XmlElement('paragraph') → XmlText structure
  - Updated `createUpdatedCollabSnapshot()` to use the same XmlFragment structure
  - Added comprehensive integration test suite with 14 tests covering all task notes operations
  - Updated documentation with technical details about the XmlFragment structure

  **Migration:**
  No breaking changes. Existing code will continue to work, and notes will now properly sync with the Sunsama UI.

## 0.11.1

### Patch Changes

- a34ebf5: Reorganize queries directory with domain-based structure for improved maintainability and scalability. All GraphQL operations are now grouped by resource domain (tasks, streams, user) with consolidated mutations reducing code duplication by ~1,600 lines. No breaking changes to public API.

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
