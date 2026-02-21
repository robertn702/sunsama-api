---
"sunsama-api": minor
---

feat: add createCalendarEvent endpoint

Adds `client.createCalendarEvent(title, startDate, endDate, options?)` for creating calendar events in Sunsama, with optional sync to external calendar services (e.g. Google Calendar).

New options:
- `eventId` — custom event ID (auto-generated if omitted)
- `description` — event description
- `calendarId` — target calendar (e.g. email address)
- `service` — calendar service (`"google"` | `"microsoft"`, defaults to `"google"`)
- `streamIds` — associate with one or more streams
- `visibility` — `"private"` | `"public"` | `"default"` | `"confidential"`
- `transparency` — `"opaque"` | `"transparent"`
- `isAllDay` — mark as all-day event
- `seedTaskId` — link the event to an existing task
- `limitResponsePayload` — control response size (defaults to `true`)
