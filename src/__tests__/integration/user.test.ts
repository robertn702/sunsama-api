/**
 * Integration tests for user operations
 */

import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import { SunsamaClient } from '../../client/index.js';
import { getAuthenticatedClient, hasCredentials } from './setup.js';

describe.skipIf(!hasCredentials())('User Operations (Integration)', () => {
  let client: SunsamaClient;

  beforeAll(async () => {
    client = await getAuthenticatedClient();
  });

  describe('getUser', () => {
    it('should retrieve current user information', async () => {
      const user = await client.getUser();

      expect(user).toBeDefined();
      expect(user._id).toBeDefined();
      expect(user.profile).toBeDefined();
      expect(user.emails).toBeDefined();
      expect(Array.isArray(user.emails)).toBe(true);
    });

    it('should have valid user profile fields', async () => {
      const user = await client.getUser();

      expect(user.profile.firstname).toBeDefined();
      expect(user.profile.lastname).toBeDefined();
      expect(user.profile.timezone).toBeDefined();
      expect(typeof user.daysPlanned).toBe('number');
    });
  });

  describe('getUserTimezone', () => {
    it('should retrieve user timezone', async () => {
      const timezone = await client.getUserTimezone();

      expect(timezone).toBeDefined();
      expect(typeof timezone).toBe('string');
      expect(timezone.length).toBeGreaterThan(0);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when authenticated', async () => {
      const isAuth = await client.isAuthenticated();
      expect(isAuth).toBe(true);
    });
  });
});
