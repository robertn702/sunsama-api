---
"sunsama-api": patch
---

Fix rich text formatting in task notes (fixes #17)

- Add proper Yjs XML structure for bullet and ordered lists
- Support inline formatting (bold, italic, links, code) in notes
- Add block-level elements (blockquote, horizontal rule)
- Decode HTML entities from markdown parser
- Fix Yjs element insertion order to avoid warnings

