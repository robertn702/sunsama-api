---
"sunsama-api": patch
---

Exclude test files from build output

Integration test setup files (`setup.ts`, `globalSetup.ts`, etc.) were being included in the published package because they didn't match the `**/*.test.ts` exclude pattern.

**Changes:**
- Add `**/__tests__/**` to exclude patterns in all TypeScript build configs (tsconfig.types.json, tsconfig.cjs.json, tsconfig.esm.json)
- Update verify-package script to check for unwanted `__tests__` directories and prevent future regressions

This reduces package size and prevents test-related code from being shipped to consumers.
