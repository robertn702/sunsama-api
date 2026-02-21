/**
 * Main Sunsama API client
 *
 * Provides a type-safe interface to interact with all Sunsama API endpoints.
 * The client is assembled from domain-specific method classes via inheritance:
 *
 *   SunsamaClientBase     — auth, HTTP, session management
 *     └─ UserMethods      — getUser, getStreamsByGroupId, task queries
 *       └─ TaskLifecycleMethods — createTask, deleteTask, complete/uncomplete
 *         └─ TaskUpdateMethods — updateTaskText, updateTaskNotes, etc.
 *           └─ SubtaskMethods  — createSubtasks, addSubtask, etc.
 *             └─ TaskSchedulingMethods — reorderTask
 *               └─ CalendarEventMethods — createCalendarEvent
 *                 └─ SunsamaClient
 */

import { CalendarEventMethods } from './methods/calendar-events.js';

export class SunsamaClient extends CalendarEventMethods {}
