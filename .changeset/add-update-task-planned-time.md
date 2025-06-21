---
"sunsama-api": minor
---

Add updateTaskPlannedTime method to update task time estimates

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