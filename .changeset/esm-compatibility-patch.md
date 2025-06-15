---
'sunsama-api': patch
---

Fix ESM directory import error for Node.js compatibility

- Add explicit .js extensions to all relative imports in source files
- Update package.json exports to include subpath exports for all modules  
- Update ESM TypeScript configuration for proper Node.js compatibility
- Rebuild all distribution files with correct ESM imports

This resolves the ERR_UNSUPPORTED_DIR_IMPORT error when using the package in Node.js ESM environments.