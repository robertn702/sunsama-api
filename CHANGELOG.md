# sunsama-api

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
