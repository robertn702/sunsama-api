/**
 * Calendar event methods: create calendar events
 */

import { SunsamaAuthError, SunsamaError, SunsamaValidationError } from '../../errors/index.js';
import { CREATE_CALENDAR_EVENT_MUTATION } from '../../queries/index.js';
import type {
  CalendarEventInput,
  CreateCalendarEventInput,
  CreateCalendarEventOptions,
  CreateCalendarEventPayload,
  GraphQLRequest,
} from '../../types/index.js';
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
    // Convert dates to ISO strings
    const startDateStr = startDate instanceof Date ? startDate.toISOString() : startDate;
    const endDateStr = endDate instanceof Date ? endDate.toISOString() : endDate;

    // Validate dates before making any API calls
    const startMs = new Date(startDateStr).getTime();
    const endMs = new Date(endDateStr).getTime();

    if (isNaN(startMs)) {
      throw new SunsamaValidationError('Invalid start date', 'startDate');
    }

    if (isNaN(endMs)) {
      throw new SunsamaValidationError('Invalid end date', 'endDate');
    }

    if (startMs > endMs) {
      throw new SunsamaValidationError(
        'Start date must be before or equal to end date',
        'startDate'
      );
    }

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
        coordinate: { lat: 0, lng: 0 },
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
      limitResponsePayload: true,
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
}
