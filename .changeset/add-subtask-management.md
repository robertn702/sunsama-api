---
"sunsama-api": minor
---

Add subtask management methods: createSubtasks, updateSubtaskTitle, completeSubtask, uncompleteSubtask, and addSubtask

This release adds support for managing subtasks on tasks:

- `createSubtasks(taskId, subtaskIds)` - Register new subtask IDs with a parent task
- `updateSubtaskTitle(taskId, subtaskId, title)` - Set or update a subtask's title
- `completeSubtask(taskId, subtaskId, completedDate?)` - Mark a subtask as complete
- `uncompleteSubtask(taskId, subtaskId)` - Mark a subtask as incomplete
- `addSubtask(taskId, title)` - Convenience method to create a subtask with title in one call

Example usage:
```typescript
// Create a subtask in one call
const { subtaskId } = await client.addSubtask('taskId', 'Buy milk');

// Mark it complete
await client.completeSubtask('taskId', subtaskId);

// Mark it incomplete
await client.uncompleteSubtask('taskId', subtaskId);
```
