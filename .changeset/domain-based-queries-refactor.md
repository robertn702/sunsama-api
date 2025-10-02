---
"sunsama-api": patch
---

Reorganize queries directory with domain-based structure for improved maintainability and scalability. All GraphQL operations are now grouped by resource domain (tasks, streams, user) with consolidated mutations reducing code duplication by ~1,600 lines. No breaking changes to public API.
