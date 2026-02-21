---
"sunsama-api": patch
---

refactor: split SunsamaClient into modular domain files

Extracted the monolithic `src/client/index.ts` (~2100 lines) into a chain of abstract domain classes:
- `src/client/base.ts` — auth, HTTP, session management
- `src/client/methods/user.ts` — user, stream, and task query methods
- `src/client/methods/task-lifecycle.ts` — createTask, deleteTask, complete/uncomplete
- `src/client/methods/task-updates.ts` — text, notes, planned time, due date, stream, snooze
- `src/client/methods/subtasks.ts` — subtask CRUD
- `src/client/methods/task-scheduling.ts` — reorderTask

Also extracted Yjs collaborative snapshot helpers to pure functions in `src/utils/collab.ts`.

No public API changes.
