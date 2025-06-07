/**
 * Tests for the main Sunsama client
 */

import { describe, expect, it } from 'vitest';
import { SunsamaClient } from '../client/index.js';

describe('SunsamaClient', () => {
  describe('constructor', () => {
    it('should create a client with no configuration', async () => {
      const client = new SunsamaClient();

      expect(client).toBeInstanceOf(SunsamaClient);
      expect(client.getConfig()).toEqual({});
      expect(await client.isAuthenticated()).toBe(false);
    });

    it('should create a client with empty configuration', async () => {
      const client = new SunsamaClient({});

      expect(client).toBeInstanceOf(SunsamaClient);
      expect(client.getConfig()).toEqual({});
      expect(await client.isAuthenticated()).toBe(false);
    });

    it('should create a client with session token configuration', async () => {
      const client = new SunsamaClient({
        sessionToken: 'test-session-token',
      });

      expect(client).toBeInstanceOf(SunsamaClient);
      expect(client.getConfig()).toEqual({
        sessionToken: 'test-session-token',
      });
      expect(await client.isAuthenticated()).toBe(true);
    });

    it('should have authentication methods', () => {
      const client = new SunsamaClient();

      expect(typeof client.isAuthenticated).toBe('function');
      expect(typeof client.login).toBe('function');
      expect(typeof client.logout).toBe('function');
    });

    it('should not be authenticated by default', async () => {
      const client = new SunsamaClient();

      expect(await client.isAuthenticated()).toBe(false);
    });

    it('should have logout method', () => {
      const client = new SunsamaClient();
      
      // Just verify logout method exists and can be called
      expect(() => client.logout()).not.toThrow();
    });

    it('should have login method that makes API call', async () => {
      const client = new SunsamaClient();

      // Note: Actual login will fail without valid credentials
      // This test just verifies the method exists and attempts the request
      await expect(client.login('test@example.com', 'password')).rejects.toThrow();
    });
  });
});
