/**
 * Integration tests for calendar event operations
 */

import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import { SunsamaClient } from '../../client/index.js';
import { getAuthenticatedClient, hasCredentials, trackTaskForCleanup } from './setup.js';

describe.skipIf(!hasCredentials())('Calendar Event Operations (Integration)', () => {
  let client: SunsamaClient;

  beforeAll(async () => {
    client = await getAuthenticatedClient();
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
        endDate
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
        endDate
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
        { seedTaskId: taskId }
      );

      expect(result.success).toBe(true);
    });
  });
});
