---
"sunsama-api": patch
---

Fix package build output structure (v0.13.0 regression)

Version 0.13.0 had a packaging bug where TypeScript was outputting files to `dist/{cjs,esm,types}/src/index.*` instead of `dist/{cjs,esm,types}/index.*`, causing module resolution failures.

**Root cause:** Adding `vitest.config.ts` to the `include` array in tsconfig.json caused TypeScript to be unable to infer a single root directory, resulting in the `src/` folder structure being preserved in the output.

**Fixes:**
- Add explicit `rootDir: "./src"` to tsconfig.json
- Remove `vitest.config.ts` from include array
- Add post-build verification script to prevent future regressions
- Add `verify-package` script and `postbuild` hook to automatically validate package structure
