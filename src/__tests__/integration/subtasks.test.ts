/**
 * Integration tests for subtask operations
 */

import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import { SunsamaClient } from '../../client/index.js';
import { getAuthenticatedClient, hasCredentials, trackTaskForCleanup } from './setup.js';

describe.skipIf(!hasCredentials())('Subtask Operations (Integration)', () => {
  let client: SunsamaClient;

  beforeAll(async () => {
    client = await getAuthenticatedClient();
  });

  describe('addSubtask', () => {
    it('should add a subtask with title', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Add Subtask - ${timestamp}`, { taskId });

      const result = await client.addSubtask(taskId, 'First subtask');

      expect(result.subtaskId).toBeDefined();
      expect(result.result.success).toBe(true);

      // Verify subtask was added
      const task = await client.getTaskById(taskId);
      expect(task!.subtasks.length).toBeGreaterThan(0);
      expect(task!.subtasks.some(s => s._id === result.subtaskId)).toBe(true);
    });

    it('should add multiple subtasks', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Multiple Subtasks - ${timestamp}`, { taskId });

      const subtask1 = await client.addSubtask(taskId, 'First subtask');
      const subtask2 = await client.addSubtask(taskId, 'Second subtask');

      expect(subtask1.subtaskId).toBeDefined();
      expect(subtask2.subtaskId).toBeDefined();
      expect(subtask1.subtaskId).not.toBe(subtask2.subtaskId);

      // Verify both subtasks were added
      const task = await client.getTaskById(taskId);
      expect(task!.subtasks.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('createSubtasks', () => {
    it('should create subtasks with bulk registration', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Bulk Subtasks - ${timestamp}`, { taskId });

      const subtaskId1 = SunsamaClient.generateTaskId();
      const subtaskId2 = SunsamaClient.generateTaskId();

      // Register subtask IDs (API may process sequentially)
      await client.createSubtasks(taskId, [subtaskId1]);
      await client.createSubtasks(taskId, [subtaskId2]);

      // Add titles to the subtasks (required for them to appear)
      await client.updateSubtaskTitle(taskId, subtaskId1, 'First bulk subtask');
      await client.updateSubtaskTitle(taskId, subtaskId2, 'Second bulk subtask');

      // Verify subtasks were created
      const task = await client.getTaskById(taskId);
      const subtaskIds = task!.subtasks.map(s => s._id);
      expect(subtaskIds).toContain(subtaskId1);
      expect(subtaskIds).toContain(subtaskId2);
    });
  });

  describe('updateSubtaskTitle', () => {
    it('should update subtask title', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Update Subtask Title - ${timestamp}`, { taskId });

      const subtaskId = SunsamaClient.generateTaskId();
      await client.createSubtasks(taskId, [subtaskId]);
      await client.updateSubtaskTitle(taskId, subtaskId, 'Updated title');

      // Verify title was updated
      const task = await client.getTaskById(taskId);
      const subtask = task!.subtasks.find(s => s._id === subtaskId);
      expect(subtask).toBeDefined();
      expect(subtask!.title).toBe('Updated title');
    });
  });

  describe('completeSubtask', () => {
    it('should mark subtask as complete', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Complete Subtask - ${timestamp}`, { taskId });

      const subtask = await client.addSubtask(taskId, 'Subtask to complete');
      const result = await client.completeSubtask(taskId, subtask.subtaskId);

      expect(result.success).toBe(true);

      // Verify subtask is marked complete
      const task = await client.getTaskById(taskId);
      const completedSubtask = task!.subtasks.find(s => s._id === subtask.subtaskId);
      expect(completedSubtask).toBeDefined();
      expect(completedSubtask!.completedDate).toBeDefined();
      expect(completedSubtask!.completedDate).not.toBeNull();
    });

    it('should support custom completion timestamp', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Subtask Timestamp - ${timestamp}`, { taskId });

      const subtask = await client.addSubtask(taskId, 'Subtask with timestamp');
      const completionTime = '2025-01-15T10:00:00Z';
      const result = await client.completeSubtask(taskId, subtask.subtaskId, completionTime);

      expect(result.success).toBe(true);
    });
  });

  describe('uncompleteSubtask', () => {
    it('should mark subtask as incomplete', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Uncomplete Subtask - ${timestamp}`, { taskId });

      const subtask = await client.addSubtask(taskId, 'Subtask to toggle');

      // Mark complete
      await client.completeSubtask(taskId, subtask.subtaskId);

      // Mark incomplete
      const result = await client.uncompleteSubtask(taskId, subtask.subtaskId);

      expect(result.success).toBe(true);

      // Verify subtask is marked incomplete
      const task = await client.getTaskById(taskId);
      const incompletedSubtask = task!.subtasks.find(s => s._id === subtask.subtaskId);
      expect(incompletedSubtask).toBeDefined();
      expect(incompletedSubtask!.completedDate).toBeNull();
    });
  });

  describe('subtask workflow', () => {
    it('should handle complete subtask workflow', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);

      await client.createTask(`Test Subtask Workflow - ${timestamp}`, { taskId });

      // Add subtasks
      const subtask1 = await client.addSubtask(taskId, 'First item');
      const subtask2 = await client.addSubtask(taskId, 'Second item');

      // Complete first subtask
      await client.completeSubtask(taskId, subtask1.subtaskId);

      // Verify states
      let task = await client.getTaskById(taskId);
      const sub1 = task!.subtasks.find(s => s._id === subtask1.subtaskId);
      const sub2 = task!.subtasks.find(s => s._id === subtask2.subtaskId);

      expect(sub1!.completedDate).not.toBeNull();
      expect(sub2!.completedDate).toBeNull();

      // Complete second subtask
      await client.completeSubtask(taskId, subtask2.subtaskId);

      // Uncomplete first subtask
      await client.uncompleteSubtask(taskId, subtask1.subtaskId);

      // Verify final states
      task = await client.getTaskById(taskId);
      const finalSub1 = task!.subtasks.find(s => s._id === subtask1.subtaskId);
      const finalSub2 = task!.subtasks.find(s => s._id === subtask2.subtaskId);

      expect(finalSub1!.completedDate).toBeNull();
      expect(finalSub2!.completedDate).not.toBeNull();
    });
  });
});
