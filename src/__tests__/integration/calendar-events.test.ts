/**
 * Integration tests for calendar event operations
 */

import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import { SunsamaClient } from '../../client/index.js';
import { getAuthenticatedClient, hasCredentials, trackTaskForCleanup } from './setup.js';

describe.skipIf(!hasCredentials())('Calendar Event Operations (Integration)', () => {
  let client: SunsamaClient;
  let googleCalendarId: string;

  beforeAll(async () => {
    client = await getAuthenticatedClient();
    const user = await client.getUser();
    const email = user.services?.google?.email;
    if (!email) {
      throw new Error(
        'No Google Calendar email found - these tests require a Google Calendar integration'
      );
    }
    googleCalendarId = email;
  });

  describe('createCalendarEvent', () => {
    it('should create a basic calendar event', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const now = new Date();
      const startDate = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
      const endDate = new Date(now.getTime() + 90 * 60 * 1000); // 1.5 hours from now

      const result = await client.createCalendarEvent(
        `Test Calendar Event - ${timestamp}`,
        startDate,
        endDate,
        { calendarId: googleCalendarId, service: 'google' }
      );

      expect(result.success).toBe(true);
    });

    it('should create a calendar event with ISO string dates', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const now = new Date();
      const startDate = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
      const endDate = new Date(now.getTime() + 2.5 * 60 * 60 * 1000).toISOString();

      const result = await client.createCalendarEvent(
        `Test ISO Date Event - ${timestamp}`,
        startDate,
        endDate,
        { calendarId: googleCalendarId, service: 'google' }
      );

      expect(result.success).toBe(true);
    });

    it('should create a calendar event with options', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const now = new Date();
      const startDate = new Date(now.getTime() + 3 * 60 * 60 * 1000);
      const endDate = new Date(now.getTime() + 3.5 * 60 * 60 * 1000);

      const streams = await client.getStreamsByGroupId();

      const result = await client.createCalendarEvent(
        `Test Options Event - ${timestamp}`,
        startDate,
        endDate,
        {
          calendarId: googleCalendarId,
          service: 'google',
          description: 'Integration test event with options',
          streamIds: streams.length > 0 ? [streams[0]!._id] : [],
        }
      );

      expect(result.success).toBe(true);
    });

    it('should create a calendar event linked to a task', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();

      // Create a task first
      await client.createTask(`Seed Task for Event - ${timestamp}`, { taskId });
      trackTaskForCleanup(taskId);

      const now = new Date();
      const startDate = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      const endDate = new Date(now.getTime() + 4.5 * 60 * 60 * 1000);

      const result = await client.createCalendarEvent(
        `Test Seeded Event - ${timestamp}`,
        startDate,
        endDate,
        { calendarId: googleCalendarId, service: 'google', seedTaskId: taskId }
      );

      expect(result.success).toBe(true);
    });
  });

  describe('updateCalendarEvent', () => {
    it('should update an existing calendar event title', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const now = new Date();
      const startDate = new Date(now.getTime() + 5 * 60 * 60 * 1000);
      const endDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);

      // Create a calendar event with full response payload so we have the event data for update
      const createResult = await client.createCalendarEvent(
        `Test Update Event - ${timestamp}`,
        startDate,
        endDate,
        { calendarId: googleCalendarId, service: 'google', limitResponsePayload: false }
      );

      expect(createResult.success).toBe(true);
      expect(createResult.createdCalendarEvent).not.toBeNull();

      const event = createResult.createdCalendarEvent!;

      // Update the event with a modified title
      const updateResult = await client.updateCalendarEvent(event._id, {
        _id: event._id,
        createdBy: event.createdBy,
        title: `Updated Event - ${timestamp}`,
        date: {
          startDate: event.date.startDate,
          endDate: event.date.endDate,
          isAllDay: event.date.isAllDay,
          timeZone: event.date.timeZone,
        },
        inviteeList: event.inviteeList.map(inv => ({
          userId: inv.userId,
          email: inv.email,
          name: inv.name,
          requirement: inv.requirement,
          status: inv.status,
          type: inv.type ? { admin: inv.type.admin, guest: inv.type.guest } : null,
          profilePicture: inv.profilePicture,
          resource: inv.resource,
        })),
        location: {
          name: event.location.name,
          address: event.location.address,
          alias: event.location.alias,
          coordinate: { lat: event.location.coordinate.lat, lng: event.location.coordinate.lng },
        },
        staticMapUrl: event.staticMapUrl,
        status: event.status,
        createdAt: event.createdAt,
        scheduledTo: event.scheduledTo.map(s => ({
          calendarId: s.calendarId,
          userId: s.userId,
        })),
        organizerCalendar: {
          calendarId: event.organizerCalendar.calendarId,
          calendarDisplayName: event.organizerCalendar.calendarDisplayName,
        },
        service: event.service,
        serviceIds: {
          google: event.serviceIds.google,
          microsoft: event.serviceIds.microsoft,
          microsoftUniqueId: event.serviceIds.microsoftUniqueId,
          apple: event.serviceIds.apple,
          appleRecurrenceId: event.serviceIds.appleRecurrenceId,
          sunsama: event.serviceIds.sunsama,
        },
        description: event.description,
        sequence: event.sequence,
        streamIds: event.streamIds,
        lastModified: event.lastModified,
        permissions: {
          guestsCanModify: event.permissions.guestsCanModify,
          guestsCanInviteOthers: event.permissions.guestsCanInviteOthers,
          guestsCanSeeOtherGuests: event.permissions.guestsCanSeeOtherGuests,
          anyoneCanAddSelf: event.permissions.anyoneCanAddSelf,
          locked: event.permissions.locked,
          privateCopy: event.permissions.privateCopy,
        },
        hangoutLink: event.hangoutLink,
        googleCalendarURL: event.googleCalendarURL,
        transparency: event.transparency,
        visibility: event.visibility,
        googleLocation: event.googleLocation,
        conferenceData: event.conferenceData,
        recurringEventInfo: event.recurringEventInfo
          ? {
              recurringEventId: event.recurringEventInfo.recurringEventId,
              recurrence: event.recurringEventInfo.recurrence,
            }
          : null,
        runDate: event.runDate
          ? { startDate: event.runDate.startDate, endDate: event.runDate.endDate }
          : null,
        agenda: event.agenda.map(a => ({ _id: a._id, groupId: a.groupId })),
        outcomes: event.outcomes.map(o => ({ _id: o._id, groupId: o.groupId })),
        childTasks: event.childTasks.map(c => ({
          taskId: c.taskId,
          groupId: c.groupId,
          userId: c.userId,
        })),
        visualizationPreferences: event.visualizationPreferences.map(vp => ({
          userId: vp.userId,
          settings: { blockProjections: vp.settings.blockProjections },
        })),
        seedTask: event.seedTask
          ? { _id: event.seedTask._id, groupId: event.seedTask.groupId }
          : null,
        eventType: event.eventType,
      });

      expect(updateResult.success).toBe(true);
    });
  });
});
