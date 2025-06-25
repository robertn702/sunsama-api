---
"sunsama-api": minor
---

Add updateTaskText method for updating task titles

Adds a new `updateTaskText` method that allows updating the text/title of a task. This method supports optional parameters for setting recommended stream IDs and controlling response payload size. The implementation includes comprehensive TypeScript types, GraphQL mutations, unit tests, and integration tests.

Features:
- Update task text/title with simple API
- Optional recommended stream ID parameter  
- Support for limiting response payload
- Full TypeScript type safety
- Comprehensive test coverage
- Integration with existing GraphQL patterns