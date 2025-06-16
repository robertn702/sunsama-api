---
"sunsama-api": patch
---

Add Linear integration type support

Adds TaskLinearIntegration interface and refactors TaskIntegration to be a union type of all integration types (Website, Google Calendar, Linear). Also renames base interface to BaseTaskIntegration for clarity.