/**
 * Integration tests for task reordering operations
 */

import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import { SunsamaClient } from '../../client/index.js';
import { getAuthenticatedClient, hasCredentials, trackTaskForCleanup } from './setup.js';

describe.skipIf(!hasCredentials())('Task Reordering Operations (Integration)', () => {
  let client: SunsamaClient;
  const today = new Date().toISOString().split('T')[0]!;

  beforeAll(async () => {
    client = await getAuthenticatedClient();
  });

  describe('reorderTask', () => {
    it('should move a task to the top of the day', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      // Create two tasks scheduled for today
      const taskIdA = SunsamaClient.generateTaskId();
      const taskIdB = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskIdA);
      trackTaskForCleanup(taskIdB);

      await client.createTask(`Test Reorder A - ${timestamp}`, {
        taskId: taskIdA,
        snoozeUntil: new Date(),
      });
      await client.createTask(`Test Reorder B - ${timestamp}`, {
        taskId: taskIdB,
        snoozeUntil: new Date(),
      });

      // Move B to position 0 (top)
      const result = await client.reorderTask(taskIdB, 0, today);

      expect(Array.isArray(result.updatedTaskIds)).toBe(true);
      expect(result.updatedTaskIds.length).toBeGreaterThan(0);
    });

    it('should move a task to a middle position', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      const taskIdA = SunsamaClient.generateTaskId();
      const taskIdB = SunsamaClient.generateTaskId();
      const taskIdC = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskIdA);
      trackTaskForCleanup(taskIdB);
      trackTaskForCleanup(taskIdC);

      await client.createTask(`Test Reorder Mid A - ${timestamp}`, {
        taskId: taskIdA,
        snoozeUntil: new Date(),
      });
      await client.createTask(`Test Reorder Mid B - ${timestamp}`, {
        taskId: taskIdB,
        snoozeUntil: new Date(),
      });
      await client.createTask(`Test Reorder Mid C - ${timestamp}`, {
        taskId: taskIdC,
        snoozeUntil: new Date(),
      });

      // Fetch sorted tasks to determine current positions, then move one to position 1
      const tasks = await client.getTasksByDay(today);
      const testTasks = tasks.filter(t => [taskIdA, taskIdB, taskIdC].includes(t._id));

      if (testTasks.length >= 2) {
        const result = await client.reorderTask(testTasks[0]!._id, 1, today);
        expect(Array.isArray(result.updatedTaskIds)).toBe(true);
      }
    });

    it('should support explicit timezone option', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      const taskIdA = SunsamaClient.generateTaskId();
      const taskIdB = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskIdA);
      trackTaskForCleanup(taskIdB);

      await client.createTask(`Test Reorder TZ A - ${timestamp}`, {
        taskId: taskIdA,
        snoozeUntil: new Date(),
      });
      await client.createTask(`Test Reorder TZ B - ${timestamp}`, {
        taskId: taskIdB,
        snoozeUntil: new Date(),
      });

      const result = await client.reorderTask(taskIdA, 0, today, {
        timezone: 'America/New_York',
      });

      expect(Array.isArray(result.updatedTaskIds)).toBe(true);
    });

    it('should return correct __typename', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      const taskIdA = SunsamaClient.generateTaskId();
      const taskIdB = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskIdA);
      trackTaskForCleanup(taskIdB);

      await client.createTask(`Test Reorder Type A - ${timestamp}`, {
        taskId: taskIdA,
        snoozeUntil: new Date(),
      });
      await client.createTask(`Test Reorder Type B - ${timestamp}`, {
        taskId: taskIdB,
        snoozeUntil: new Date(),
      });

      const result = await client.reorderTask(taskIdA, 0, today);

      expect(result.__typename).toBe('UpdateTasksBulkPayload');
    });
  });
});
