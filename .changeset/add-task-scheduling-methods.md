---
"sunsama-api": minor
---

Add unified task scheduling method using updateTaskSnoozeDate GraphQL operation

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