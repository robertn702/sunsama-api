---
"sunsama-api": minor
---

Add updateTaskNotes method with Yjs-powered collaborative editing

This release introduces a new `updateTaskNotes` method that allows updating task notes with proper collaborative editing support. Key features include:

- **Yjs Integration**: Uses Yjs library for proper collaborative document state management
- **Automatic Snapshot Handling**: Retrieves existing collaborative snapshots from tasks automatically
- **Content-Aware Encoding**: Generates real base64-encoded snapshots based on actual note content
- **Advanced Options**: Support for custom collaborative snapshots and response payload control
- **Type Safety**: Full TypeScript support with proper error handling for missing collaborative state

The method requires existing tasks with collaborative editing state and maintains proper synchronization with Sunsama's real-time editor. Both `createTask` and `updateTaskNotes` now use proper Yjs document encoding instead of hardcoded values.

Breaking changes: Tasks without collaborative snapshots will now throw descriptive errors when attempting to update notes, ensuring data integrity.