/**
 * Integration tests for task scheduling operations
 */

import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import { SunsamaClient } from '../../client/index.js';
import { getAuthenticatedClient, hasCredentials, trackTaskForCleanup } from './setup.js';

describe.skipIf(!hasCredentials())('Task Scheduling Operations (Integration)', () => {
  let client: SunsamaClient;

  beforeAll(async () => {
    client = await getAuthenticatedClient();
  });

  describe('updateTaskSnoozeDate', () => {
    it('should schedule a task to a future date', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Schedule Task - ${timestamp}`, { taskId });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0]!;

      const result = await client.updateTaskSnoozeDate(taskId, tomorrowStr);

      expect(result.success).toBe(true);
    });

    it('should move a task to backlog', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Backlog Task - ${timestamp}`, { taskId });

      // First schedule it
      const today = new Date().toISOString().split('T')[0]!;
      await client.updateTaskSnoozeDate(taskId, today);

      // Then move to backlog
      const result = await client.updateTaskSnoozeDate(taskId, null);

      expect(result.success).toBe(true);
    });

    it('should reschedule a task from one date to another', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Reschedule Task - ${timestamp}`, { taskId });

      // Schedule to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0]!;
      await client.updateTaskSnoozeDate(taskId, tomorrowStr);

      // Reschedule to today
      const today = new Date().toISOString().split('T')[0]!;
      const result = await client.updateTaskSnoozeDate(taskId, today);

      expect(result.success).toBe(true);
    });

    it('should support timezone option', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Timezone Schedule - ${timestamp}`, { taskId });

      const today = new Date().toISOString().split('T')[0]!;
      const result = await client.updateTaskSnoozeDate(taskId, today, {
        timezone: 'America/New_York',
      });

      expect(result.success).toBe(true);
    });

    it('should support limitResponsePayload option', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Response Payload - ${timestamp}`, { taskId });

      const today = new Date().toISOString().split('T')[0]!;
      const result = await client.updateTaskSnoozeDate(taskId, today, {
        limitResponsePayload: false,
      });

      expect(result.success).toBe(true);
      expect(result.updatedFields).toBeDefined();
    });
  });
});
