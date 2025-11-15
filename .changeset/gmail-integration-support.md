---
"sunsama-api": minor
---

Add Gmail integration support to createTask method

This minor release adds support for creating Sunsama tasks with Gmail integration, enabling users to convert Gmail emails into tasks with proper linking and metadata.

**New Features:**
- Added `TaskGmailIntegration` TypeScript interface with all required fields (id, messageId, accountId, url)
- Extended `CreateTaskOptions` to accept `integration` field for linking tasks to external services
- Updated `createTask` method to pass integration data to the Sunsama API
- Added comprehensive JSDoc and README examples demonstrating Gmail integration usage

**Improvements:**
- Removed `TaskLoomVideoIntegration` from GraphQL fragment (not a real integration)
- Added integration tests verifying type definitions

**Example Usage:**
```typescript
const gmailTask = await client.createTask('Project Update Email', {
  integration: {
    service: 'gmail',
    identifier: {
      id: '19a830b40fd7ab7d',
      messageId: '19a830b40fd7ab7d',
      accountId: 'user@example.com',
      url: 'https://mail.google.com/mail/u/user@example.com/#inbox/19a830b40fd7ab7d',
      __typename: 'TaskGmailIntegrationIdentifier'
    },
    __typename: 'TaskGmailIntegration'
  },
  timeEstimate: 15
});
```

**Migration:**
No breaking changes. This is a purely additive feature that extends existing functionality.
