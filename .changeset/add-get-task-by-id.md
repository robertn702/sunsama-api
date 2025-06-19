---
"sunsama-api": minor
---

Add getTaskById method for individual task retrieval

- Add `getTaskById(taskId: string)` method to SunsamaClient
- Supports retrieving any task by its unique ID
- Returns the complete Task object with all fields or null if not found
- Includes comprehensive tests and documentation
- Follows existing patterns for authentication and error handling