/**
 * Integration tests for task update operations
 */

import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import { SunsamaClient } from '../../client/index.js';
import { getAuthenticatedClient, hasCredentials, trackTaskForCleanup } from './setup.js';

describe.skipIf(!hasCredentials())('Task Update Operations (Integration)', () => {
  let client: SunsamaClient;

  beforeAll(async () => {
    client = await getAuthenticatedClient();
  });

  describe('updateTaskText', () => {
    it('should update task text', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Original Text - ${timestamp}`, { taskId });

      const newText = `Updated Text - ${timestamp}`;
      const result = await client.updateTaskText(taskId, newText);

      expect(result.success).toBe(true);

      // Verify text was updated
      const task = await client.getTaskById(taskId);
      expect(task!.text).toBe(newText);
    });

    it('should support recommendedStreamId option', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Stream Recommendation - ${timestamp}`, { taskId });

      const streams = await client.getStreamsByGroupId();
      if (streams.length > 0) {
        const result = await client.updateTaskText(taskId, `Updated with stream - ${timestamp}`, {
          recommendedStreamId: streams[0]!._id,
        });

        expect(result.success).toBe(true);
      }
    });
  });

  describe('updateTaskStream', () => {
    it('should assign a task to a stream', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Stream Assignment - ${timestamp}`, { taskId });

      const streams = await client.getStreamsByGroupId();
      if (streams.length > 0) {
        const result = await client.updateTaskStream(taskId, streams[0]!._id);

        expect(result.success).toBe(true);

        // Verify stream assignment
        const task = await client.getTaskById(taskId);
        expect(task!.streamIds).toContain(streams[0]!._id);
      }
    });

    it('should support limitResponsePayload option', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Stream Response - ${timestamp}`, { taskId });

      const streams = await client.getStreamsByGroupId();
      if (streams.length > 0) {
        const result = await client.updateTaskStream(taskId, streams[0]!._id, false);

        expect(result.success).toBe(true);
        expect(result.updatedFields).toBeDefined();
      }
    });
  });

  describe('updateTaskPlannedTime', () => {
    it('should update task time estimate', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Time Estimate - ${timestamp}`, { taskId, timeEstimate: 15 });

      const result = await client.updateTaskPlannedTime(taskId, 45);

      expect(result.success).toBe(true);

      // Verify time estimate was updated
      const task = await client.getTaskById(taskId);
      expect(task!.timeEstimate).toBe(45);
    });

    it('should clear time estimate when set to 0', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Clear Time - ${timestamp}`, { taskId, timeEstimate: 30 });

      const result = await client.updateTaskPlannedTime(taskId, 0);

      expect(result.success).toBe(true);
    });

    it('should update time estimate multiple times', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Multiple Updates - ${timestamp}`, { taskId });

      await client.updateTaskPlannedTime(taskId, 15);
      let task = await client.getTaskById(taskId);
      expect(task!.timeEstimate).toBe(15);

      await client.updateTaskPlannedTime(taskId, 30);
      task = await client.getTaskById(taskId);
      expect(task!.timeEstimate).toBe(30);

      await client.updateTaskPlannedTime(taskId, 60);
      task = await client.getTaskById(taskId);
      expect(task!.timeEstimate).toBe(60);
    });
  });

  describe('updateTaskDueDate', () => {
    it('should set task due date', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Due Date - ${timestamp}`, { taskId });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const result = await client.updateTaskDueDate(taskId, futureDate);

      expect(result.success).toBe(true);

      // Verify due date was set
      const task = await client.getTaskById(taskId);
      expect(task!.dueDate).toBeDefined();
    });

    it('should support ISO string format', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test ISO Due Date - ${timestamp}`, { taskId });

      const dueDate = '2025-08-15T09:00:00.000Z';
      const result = await client.updateTaskDueDate(taskId, dueDate);

      expect(result.success).toBe(true);

      // Verify due date was set
      const task = await client.getTaskById(taskId);
      expect(task!.dueDate).toBe(dueDate);
    });

    it('should clear due date when set to null', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      await client.createTask(`Test Clear Due Date - ${timestamp}`, {
        taskId,
        dueDate: futureDate,
      });

      const result = await client.updateTaskDueDate(taskId, null);

      expect(result.success).toBe(true);

      // Verify due date was cleared
      const task = await client.getTaskById(taskId);
      expect(task!.dueDate).toBeNull();
    });
  });
});
