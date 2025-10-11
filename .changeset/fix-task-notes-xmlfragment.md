---
"sunsama-api": patch
---

Fix task notes not syncing with Sunsama UI by using Y.XmlFragment structure

This patch fixes Issue #14 where task notes created or updated via the API were not appearing in the Sunsama UI. The fix changes the Yjs collaborative editing structure from Y.Text to Y.XmlFragment with paragraph elements, matching the UI's rich text editor implementation.

**Changes:**
- Updated `createCollabSnapshot()` to use XmlFragment('default') → XmlElement('paragraph') → XmlText structure
- Updated `createUpdatedCollabSnapshot()` to use the same XmlFragment structure
- Added comprehensive integration test suite with 14 tests covering all task notes operations
- Updated documentation with technical details about the XmlFragment structure

**Migration:**
No breaking changes. Existing code will continue to work, and notes will now properly sync with the Sunsama UI.
