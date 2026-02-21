/**
 * Calendar event methods: create and update calendar events
 */

import { SunsamaAuthError, SunsamaError, SunsamaValidationError } from '../../errors/index.js';
import {
  CREATE_CALENDAR_EVENT_MUTATION,
  UPDATE_CALENDAR_EVENT_MUTATION,
} from '../../queries/index.js';
import type {
  CalendarEventInput,
  CalendarEventUpdateData,
  CreateCalendarEventInput,
  CreateCalendarEventOptions,
  CreateCalendarEventPayload,
  GraphQLRequest,
  UpdateCalendarEventInput,
  UpdateCalendarEventOptions,
  UpdateCalendarEventPayload,
} from '../../types/index.js';
import { createCalendarEventArgsSchema } from '../../utils/validation.js';
import { SunsamaClientBase } from '../base.js';
import { TaskSchedulingMethods } from './task-scheduling.js';

export abstract class CalendarEventMethods extends TaskSchedulingMethods {
  /**
   * Creates a new calendar event
   *
   * Creates a calendar event in Sunsama and optionally syncs it to an external
   * calendar service (e.g., Google Calendar). The event can be linked to an
   * existing task via the `seedTaskId` option.
   *
   * @param title - The title of the calendar event
   * @param startDate - Start date/time as Date object or ISO string
   * @param endDate - End date/time as Date object or ISO string
   * @param options - Additional event properties
   * @returns The created calendar event result with success status
   * @throws SunsamaAuthError if not authenticated
   * @throws SunsamaValidationError if start date is after end date
   * @throws SunsamaError if unable to determine user context
   *
   * @example
   * ```typescript
   * // Create a simple 30-minute event
   * const result = await client.createCalendarEvent(
   *   'Team standup',
   *   '2026-02-21T09:00:00.000Z',
   *   '2026-02-21T09:30:00.000Z'
   * );
   *
   * // Create an event with options
   * const result = await client.createCalendarEvent(
   *   'Project review',
   *   new Date('2026-02-21T14:00:00Z'),
   *   new Date('2026-02-21T15:00:00Z'),
   *   {
   *     description: 'Review Q1 progress',
   *     streamIds: ['stream-id-1'],
   *     visibility: 'public',
   *   }
   * );
   *
   * // Create an event linked to a task
   * const result = await client.createCalendarEvent(
   *   'Work on feature',
   *   '2026-02-21T10:00:00.000Z',
   *   '2026-02-21T11:00:00.000Z',
   *   { seedTaskId: 'existing-task-id' }
   * );
   * ```
   */
  async createCalendarEvent(
    title: string,
    startDate: Date | string,
    endDate: Date | string,
    options?: CreateCalendarEventOptions
  ): Promise<CreateCalendarEventPayload> {
    // Validate inputs with Zod schema
    const parsed = createCalendarEventArgsSchema.safeParse({
      title,
      startDate,
      endDate,
      visibility: options?.visibility,
      transparency: options?.transparency,
    });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path?.join('.') ?? 'input';
      throw new SunsamaValidationError(issue?.message ?? 'Validation error', field);
    }

    // Normalize dates to ISO strings
    const startDateStr =
      parsed.data.startDate instanceof Date
        ? parsed.data.startDate.toISOString()
        : new Date(parsed.data.startDate).toISOString();
    const endDateStr =
      parsed.data.endDate instanceof Date
        ? parsed.data.endDate.toISOString()
        : new Date(parsed.data.endDate).toISOString();

    // Ensure we have user context
    if (!this.userId || !this.groupId) {
      await this.getUser();
    }

    if (!this.userId || !this.groupId) {
      throw new SunsamaAuthError('Unable to determine user ID or group ID');
    }

    // Generate event ID or use provided one
    const eventId = options?.eventId || SunsamaClientBase.generateTaskId();
    const now = new Date().toISOString();

    // Determine calendar ID - use provided or fall back to user context
    const calendarId = options?.calendarId || '';
    const service = options?.service || 'google';

    // Build seed task reference if provided
    const seedTask = options?.seedTaskId
      ? { _id: options.seedTaskId, groupId: this.groupId }
      : null;

    // Build the calendar event input
    const calendarEvent: CalendarEventInput = {
      _id: eventId,
      createdBy: this.userId,
      date: {
        startDate: startDateStr,
        endDate: endDateStr,
        isAllDay: options?.isAllDay ?? null,
        timeZone: null,
      },
      inviteeList: [],
      location: {
        name: '',
        address: '',
        alias: '',
      },
      staticMapUrl: '',
      status: 'scheduled',
      title,
      createdAt: now,
      scheduledTo: calendarId ? [{ calendarId, userId: this.userId }] : [],
      organizerCalendar: {
        calendarId: calendarId || '',
        calendarDisplayName: '',
      },
      service,
      serviceIds: {
        google: null,
        microsoft: null,
        microsoftUniqueId: null,
        apple: null,
        appleRecurrenceId: null,
        sunsama: null,
      },
      description: options?.description || '',
      sequence: 0,
      streamIds: options?.streamIds || [],
      lastModified: now,
      permissions: {
        guestsCanModify: null,
        guestsCanInviteOthers: null,
        guestsCanSeeOtherGuests: null,
        anyoneCanAddSelf: null,
        locked: null,
        privateCopy: null,
      },
      hangoutLink: '',
      googleCalendarURL: '',
      transparency: options?.transparency || 'opaque',
      visibility: options?.visibility || 'private',
      googleLocation: null,
      conferenceData: null,
      recurringEventInfo: null,
      runDate: null,
      agenda: [],
      outcomes: [],
      childTasks: [],
      visualizationPreferences: [
        {
          userId: this.userId,
          settings: { blockProjections: null },
        },
      ],
      seedTask,
      eventType: 'default',
    };

    const variables: CreateCalendarEventInput = {
      calendarEvent,
      groupId: this.groupId,
      limitResponsePayload: options?.limitResponsePayload ?? true,
    };

    const request: GraphQLRequest<{ input: CreateCalendarEventInput }> = {
      operationName: 'createCalendarEvent',
      variables: { input: variables },
      query: CREATE_CALENDAR_EVENT_MUTATION,
    };

    const response = await this.graphqlRequest<
      { createCalendarEventV2: CreateCalendarEventPayload },
      { input: CreateCalendarEventInput }
    >(request);

    if (!response.data) {
      throw new SunsamaError('No response data received');
    }

    return response.data.createCalendarEventV2;
  }

  /**
   * Updates a calendar event
   *
   * This method allows you to update a calendar event's properties such as title, date,
   * location, invitees, and more. It requires the full event update data object and the
   * event ID.
   *
   * @param eventId - The ID of the calendar event to update
   * @param update - The calendar event update data containing all event fields
   * @param options - Additional options for the operation
   * @returns The update result with the updated calendar event and success status
   * @throws SunsamaError if not authenticated, no response data, or missing user context
   *
   * @example
   * ```typescript
   * const result = await client.updateCalendarEvent('eventId123', {
   *   _id: 'eventId123',
   *   createdBy: 'userId',
   *   title: 'Updated Meeting Title',
   *   date: {
   *     startDate: '2026-02-22T10:00:00.000Z',
   *     endDate: '2026-02-22T11:00:00.000Z',
   *     isAllDay: null,
   *     timeZone: null,
   *   },
   *   // ... other required fields
   * });
   * ```
   */
  async updateCalendarEvent(
    eventId: string,
    update: CalendarEventUpdateData,
    options?: UpdateCalendarEventOptions
  ): Promise<UpdateCalendarEventPayload> {
    // Ensure we have user context
    if (!this.groupId) {
      await this.getUser();
    }

    if (!this.groupId) {
      throw new SunsamaError('Unable to determine group ID');
    }

    // Get the invitee email from the scheduledTo entries or the user's email
    const inviteeEmail = update.scheduledTo?.[0]?.calendarId ?? '';

    const variables: UpdateCalendarEventInput = {
      update,
      eventId,
      groupId: this.groupId,
      isInviteeStatusUpdate: options?.isInviteeStatusUpdate ?? false,
      inviteeEmail,
      skipReorder: options?.skipReorder ?? true,
      limitResponsePayload: options?.limitResponsePayload ?? true,
    };

    const request: GraphQLRequest<{ input: UpdateCalendarEventInput }> = {
      operationName: 'updateCalendarEvent',
      variables: { input: variables },
      query: UPDATE_CALENDAR_EVENT_MUTATION,
    };

    const response = await this.graphqlRequest<
      { updateCalendarEventV2: UpdateCalendarEventPayload },
      { input: UpdateCalendarEventInput }
    >(request);

    if (!response.data) {
      throw new SunsamaError('No response data received');
    }

    return response.data.updateCalendarEventV2;
  }
}
