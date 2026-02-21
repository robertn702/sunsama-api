/**
 * Integration tests for backlog folder operations
 */

import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import { SunsamaClient } from '../../client/index.js';
import { getAuthenticatedClient, hasCredentials } from './setup.js';

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
});
