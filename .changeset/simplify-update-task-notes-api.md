---
'sunsama-api': minor
---

Simplify updateTaskNotes API with explicit format selection

The `updateTaskNotes` method now uses a discriminated union for content parameter instead of separate `notes` and `notesMarkdown` parameters.

- Replace dual parameters with single `content: { html: string } | { markdown: string }`
- Add automatic HTML ↔ Markdown conversion using marked and turndown libraries
- Provide better type safety with explicit format selection
- Remove need for developers to provide both formats manually
- Update all documentation and examples

**Migration:**
```typescript
// Before
await client.updateTaskNotes(taskId, htmlContent, markdownContent);

// After - HTML input
await client.updateTaskNotes(taskId, { html: htmlContent });

// After - Markdown input  
await client.updateTaskNotes(taskId, { markdown: markdownContent });
```