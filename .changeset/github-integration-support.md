---
"sunsama-api": minor
---

Add GitHub integration support to createTask method

This minor release adds support for creating Sunsama tasks with GitHub integration, enabling users to convert GitHub issues and pull requests into tasks with proper linking and metadata.

**New Features:**
- Added `TaskGithubIntegration` TypeScript interface with all required fields (id, repositoryOwnerLogin, repositoryName, number, type, url)
- Updated `TaskIntegration` union type to include GitHub integration
- `createTask` method now supports GitHub integration through the `integration` option
- Added comprehensive JSDoc and README examples demonstrating GitHub integration usage for both issues and pull requests

**Improvements:**
- Added integration tests verifying GitHub integration type definitions
- Tests cover both Issue and PullRequest types

**Migration:**
No breaking changes. This is a purely additive feature that extends existing functionality.
