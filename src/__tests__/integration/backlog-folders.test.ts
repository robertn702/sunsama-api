/**
 * Integration tests for backlog folder operations
 */

import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import { SunsamaClient } from '../../client/index.js';
import { getAuthenticatedClient, hasCredentials, trackTaskForCleanup } from './setup.js';

describe.skipIf(!hasCredentials())('Backlog Folder Operations (Integration)', () => {
  let client: SunsamaClient;

  beforeAll(async () => {
    client = await getAuthenticatedClient();
  });

  describe('getBacklogFolders', () => {
    it('should retrieve backlog folders for the user', async () => {
      const folders = await client.getBacklogFolders();

      expect(Array.isArray(folders)).toBe(true);
    });

    it('should have valid backlog folder properties', async () => {
      const folders = await client.getBacklogFolders();

      if (folders.length > 0) {
        const folder = folders[0]!;

        expect(folder._id).toBeDefined();
        expect(folder.name).toBeDefined();
        expect(typeof folder.position).toBe('number');
        expect(folder.groupId).toBeDefined();
        expect(folder.userId).toBeDefined();
        expect(typeof folder.deleted).toBe('boolean');
        expect(folder.createdAt).toBeDefined();
        expect(folder.lastModified).toBeDefined();
        expect(folder.__typename).toBe('BacklogFolder');
      }
    });
  });

  describe('updateTasksBacklogFolder', () => {
    it('should move a task into a backlog folder and back out', async () => {
      const folders = await client.getBacklogFolders();
      if (folders.length === 0) return;

      const folder = folders[0]!;

      // Create a task to use for this test
      const taskId = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId);
      await client.createTask('Test backlog folder assignment', { taskId });

      // Move task to backlog first
      await client.updateTaskSnoozeDate(taskId, null);

      // Move task into the folder
      const assignResult = await client.updateTasksBacklogFolder([taskId], folder._id);
      expect(Array.isArray(assignResult.updatedTaskIds)).toBe(true);
      expect(assignResult.updatedTaskIds).toContain(taskId);

      // Remove task from folder
      const removeResult = await client.updateTasksBacklogFolder([taskId], null);
      expect(Array.isArray(removeResult.updatedTaskIds)).toBe(true);
      expect(removeResult.updatedTaskIds).toContain(taskId);
    });

    it('should handle multiple task IDs', async () => {
      const folders = await client.getBacklogFolders();
      if (folders.length === 0) return;

      const folder = folders[0]!;

      // Create two tasks
      const taskId1 = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId1);
      await client.createTask('Test bulk folder 1', { taskId: taskId1 });

      const taskId2 = SunsamaClient.generateTaskId();
      trackTaskForCleanup(taskId2);
      await client.createTask('Test bulk folder 2', { taskId: taskId2 });

      // Move both to backlog
      await client.updateTaskSnoozeDate(taskId1, null);
      await client.updateTaskSnoozeDate(taskId2, null);

      // Move both tasks into the folder
      const result = await client.updateTasksBacklogFolder([taskId1, taskId2], folder._id);
      expect(Array.isArray(result.updatedTaskIds)).toBe(true);
      expect(result.updatedTaskIds).toContain(taskId1);
      expect(result.updatedTaskIds).toContain(taskId2);
    });
  });
});
