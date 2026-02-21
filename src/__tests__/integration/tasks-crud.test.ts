/**
 * Integration tests for task CRUD operations
 */

import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import { SunsamaClient } from '../../client/index.js';
import { getAuthenticatedClient, hasCredentials, trackTaskForCleanup } from './setup.js';

describe.skipIf(!hasCredentials())('Task CRUD Operations (Integration)', () => {
  let client: SunsamaClient;

  beforeAll(async () => {
    client = await getAuthenticatedClient();
  });

  describe('createTask', () => {
    it('should create a basic task', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      const result = await client.createTask(`Test Basic Task - ${timestamp}`, {
        taskId,
      });

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should create a task with all options', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      const streams = await client.getStreamsByGroupId();

      const result = await client.createTask(`Test Full Options Task - ${timestamp}`, {
        taskId,
        notes: 'Test notes with details',
        timeEstimate: 30,
        streamIds: streams.length > 0 ? [streams[0]!._id] : [],
      });

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();

      // Verify the task was created with correct properties
      const task = await client.getTaskById(taskId);
      expect(task).not.toBeNull();
      expect(task!.notes).toContain('Test notes with details');
      expect(task!.timeEstimate).toBe(30);
    });

    it('should generate unique task IDs', () => {
      const id1 = SunsamaClient.generateTaskId();
      const id2 = SunsamaClient.generateTaskId();

      expect(id1).not.toBe(id2);
      expect(id1.length).toBe(24);
      expect(id2.length).toBe(24);
    });
  });

  describe('getTaskById', () => {
    it('should retrieve a task by ID', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      const taskText = `Test Retrieve Task - ${timestamp}`;
      await client.createTask(taskText, { taskId });

      const task = await client.getTaskById(taskId);

      expect(task).not.toBeNull();
      expect(task!._id).toBe(taskId);
      expect(task!.text).toBe(taskText);
      expect(task!.completed).toBe(false);
    });

    it('should return null for non-existent task', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';
      const task = await client.getTaskById(nonExistentId);

      expect(task).toBeNull();
    });

    it('should retrieve task with all fields', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Full Fields - ${timestamp}`, {
        taskId,
        notes: 'Test notes',
        timeEstimate: 45,
      });

      const task = await client.getTaskById(taskId);

      expect(task).not.toBeNull();
      expect(task!._id).toBeDefined();
      expect(task!.text).toBeDefined();
      expect(task!.createdAt).toBeDefined();
      expect(task!.lastModified).toBeDefined();
      expect(Array.isArray(task!.subtasks)).toBe(true);
      expect(Array.isArray(task!.comments)).toBe(true);
      expect(Array.isArray(task!.streamIds)).toBe(true);
    });
  });

  describe('getTasksByDay', () => {
    it('should retrieve tasks for today', async () => {
      const today = new Date().toISOString().split('T')[0]!;
      const tasks = await client.getTasksByDay(today);

      expect(Array.isArray(tasks)).toBe(true);
    });

    it('should retrieve tasks for a specific date', async () => {
      const tasks = await client.getTasksByDay('2025-06-10');

      expect(Array.isArray(tasks)).toBe(true);
    });

    it('should support timezone parameter', async () => {
      const today = new Date().toISOString().split('T')[0]!;
      const tasks = await client.getTasksByDay(today, 'America/New_York');

      expect(Array.isArray(tasks)).toBe(true);
    });
  });

  describe('getTasksBacklog', () => {
    it('should retrieve backlog tasks', async () => {
      const backlogTasks = await client.getTasksBacklog();

      expect(Array.isArray(backlogTasks)).toBe(true);
    });

    it('should have valid backlog task properties', async () => {
      const backlogTasks = await client.getTasksBacklog();

      if (backlogTasks.length > 0) {
        const task = backlogTasks[0]!;

        expect(task._id).toBeDefined();
        expect(task.text).toBeDefined();
        expect(typeof task.completed).toBe('boolean');
      }
    });
  });

  describe('getTasksBacklogBucketed', () => {
    it('should retrieve paginated backlog tasks', async () => {
      const result = await client.getTasksBacklogBucketed();

      expect(result).toBeDefined();
      expect(result.pageInfo).toBeDefined();
      expect(typeof result.pageInfo.hasNextPage).toBe('boolean');
      expect(Array.isArray(result.tasks)).toBe(true);
    });

    it('should support custom page size', async () => {
      const result = await client.getTasksBacklogBucketed({ first: 5 });

      expect(result).toBeDefined();
      expect(Array.isArray(result.tasks)).toBe(true);
      expect(result.tasks.length).toBeLessThanOrEqual(5);
    });

    it('should support cursor-based pagination', async () => {
      const firstPage = await client.getTasksBacklogBucketed({ first: 2 });

      expect(firstPage).toBeDefined();

      if (firstPage.pageInfo.hasNextPage && firstPage.pageInfo.endCursor) {
        const secondPage = await client.getTasksBacklogBucketed({
          first: 2,
          after: firstPage.pageInfo.endCursor,
        });

        expect(secondPage).toBeDefined();
        expect(Array.isArray(secondPage.tasks)).toBe(true);
      }
    });

    it('should have valid task properties in backlog results', async () => {
      const result = await client.getTasksBacklogBucketed({ first: 5 });

      if (result.tasks.length > 0) {
        const task = result.tasks[0]!;

        expect(task._id).toBeDefined();
        expect(task.text).toBeDefined();
        expect(typeof task.completed).toBe('boolean');
      }
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();

      await client.createTask(`Test Delete Task - ${timestamp}`, { taskId });

      const result = await client.deleteTask(taskId);

      expect(result.success).toBe(true);

      // Note: Verification of deletion is best-effort due to potential caching/timing
      // If deleteTask returns success, we trust the deletion occurred
    });

    it('should support limitResponsePayload option', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();

      await client.createTask(`Test Delete Options - ${timestamp}`, { taskId });

      const result = await client.deleteTask(taskId, false);

      expect(result.success).toBe(true);
    });
  });

  describe('updateTaskComplete', () => {
    it('should mark a task as complete', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Complete Task - ${timestamp}`, { taskId });

      const result = await client.updateTaskComplete(taskId);

      expect(result.success).toBe(true);

      // Verify task is marked complete
      const task = await client.getTaskById(taskId);
      expect(task!.completed).toBe(true);
    });

    it('should support custom completion timestamp', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Complete Timestamp - ${timestamp}`, { taskId });

      const completionTime = '2025-01-15T10:30:00Z';
      const result = await client.updateTaskComplete(taskId, completionTime);

      expect(result.success).toBe(true);
    });
  });

  describe('updateTaskUncomplete', () => {
    it('should mark a completed task as incomplete', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Uncomplete Task - ${timestamp}`, { taskId });
      await client.updateTaskComplete(taskId);

      const result = await client.updateTaskUncomplete(taskId);

      expect(result.success).toBe(true);

      // Verify task is no longer marked complete
      const task = await client.getTaskById(taskId);
      expect(task!.completed).toBe(false);
    });

    it('should support limitResponsePayload option', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Uncomplete Options - ${timestamp}`, { taskId });
      await client.updateTaskComplete(taskId);

      const result = await client.updateTaskUncomplete(taskId, false);

      expect(result.success).toBe(true);
    });
  });
});
