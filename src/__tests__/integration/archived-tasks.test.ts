/**
 * Integration tests for archived task operations
 */

import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import { SunsamaClient } from '../../client/index.js';
import { getAuthenticatedClient, hasCredentials } from './setup.js';

describe.skipIf(!hasCredentials())('Archived Tasks Operations (Integration)', () => {
  let client: SunsamaClient;

  beforeAll(async () => {
    client = await getAuthenticatedClient();
  });

  describe('getArchivedTasks', () => {
    it('should retrieve archived tasks', async () => {
      const archivedTasks = await client.getArchivedTasks();

      expect(Array.isArray(archivedTasks)).toBe(true);
    });

    it('should have valid archived task properties', async () => {
      const archivedTasks = await client.getArchivedTasks();

      if (archivedTasks.length > 0) {
        const task = archivedTasks[0]!;

        expect(task._id).toBeDefined();
        expect(task.text).toBeDefined();
        expect(typeof task.completed).toBe('boolean');
        expect(Array.isArray(task.subtasks)).toBe(true);
        expect(Array.isArray(task.streamIds)).toBe(true);
      }
    });

    it('should support pagination', async () => {
      const allTasks = await client.getArchivedTasks();

      if (allTasks.length >= 10) {
        const paginatedTasks = await client.getArchivedTasks(5, 3);

        expect(Array.isArray(paginatedTasks)).toBe(true);
        expect(paginatedTasks.length).toBeLessThanOrEqual(3);

        // Tasks should be different from the first 5
        if (paginatedTasks.length > 0 && allTasks.length > 5) {
          expect(paginatedTasks[0]!._id).not.toBe(allTasks[0]!._id);
        }
      }
    });
  });
});
