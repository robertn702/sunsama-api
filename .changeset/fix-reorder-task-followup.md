---
"sunsama-api": patch
---

fix: correct error classes and ordinal calculation in reorderTask

- Use `SunsamaValidationError` for invalid date format and position errors
- Use `SunsamaError` for task-not-found and missing response data
- Fix `calculateOrdinal` to avoid negative ordinals when moving a task to the top of a list with small ordinal values
- Add integration tests for `reorderTask`
- Add `reorderTask` documentation to README
