/**
 * Integration tests for stream operations
 */

import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import { SunsamaClient } from '../../client/index.js';
import { getAuthenticatedClient, hasCredentials } from './setup.js';

describe.skipIf(!hasCredentials())('Stream Operations (Integration)', () => {
  let client: SunsamaClient;

  beforeAll(async () => {
    client = await getAuthenticatedClient();
  });

  describe('getStreamsByGroupId', () => {
    it('should retrieve streams for the user group', async () => {
      const streams = await client.getStreamsByGroupId();

      expect(Array.isArray(streams)).toBe(true);
    });

    it('should have valid stream properties', async () => {
      const streams = await client.getStreamsByGroupId();

      if (streams.length > 0) {
        const stream = streams[0]!;

        expect(stream._id).toBeDefined();
        expect(stream.streamName).toBeDefined();
        expect(stream.status).toBeDefined();
        expect(stream.color).toBeDefined();
        expect(typeof stream.private).toBe('boolean');
        expect(Array.isArray(stream.memberIds)).toBe(true);
        expect(Array.isArray(stream.projectIntegrations)).toBe(true);
      }
    });
  });
});
