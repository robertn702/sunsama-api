/**
 * Tests for the main Sunsama client
 */

import { describe, expect, it } from 'vitest';
import { SunsamaClient } from '../client/index.js';

describe('SunsamaClient', () => {
  describe('constructor', () => {
    it('should create a client with no configuration', () => {
      const client = new SunsamaClient();

      expect(client).toBeInstanceOf(SunsamaClient);
      expect(client.config).toEqual({});
      expect(client.isAuthenticated()).toBe(false);
    });

    it('should create a client with empty configuration', () => {
      const client = new SunsamaClient({});

      expect(client).toBeInstanceOf(SunsamaClient);
      expect(client.config).toEqual({});
      expect(client.isAuthenticated()).toBe(false);
    });

    it('should create a client with session token configuration', () => {
      const client = new SunsamaClient({
        sessionToken: 'test-session-token',
      });

      expect(client).toBeInstanceOf(SunsamaClient);
      expect(client.config).toEqual({
        sessionToken: 'test-session-token',
      });
      expect(client.isAuthenticated()).toBe(true);
    });

    it('should have authentication methods', () => {
      const client = new SunsamaClient();

      expect(typeof client.isAuthenticated).toBe('function');
      expect(typeof client.getSessionToken).toBe('function');
      expect(typeof client.login).toBe('function');
      expect(typeof client.logout).toBe('function');
    });

    it('should be authenticated when session token is provided', () => {
      const client = new SunsamaClient({
        sessionToken: 'test-session-token',
      });

      expect(client.isAuthenticated()).toBe(true);
      expect(client.getSessionToken()).toBe('test-session-token');
    });

    it('should not be authenticated by default', () => {
      const client = new SunsamaClient();

      expect(client.isAuthenticated()).toBe(false);
      expect(client.getSessionToken()).toBe(undefined);
    });

    it('should allow logout', () => {
      const client = new SunsamaClient({
        sessionToken: 'test-session-token',
      });

      expect(client.isAuthenticated()).toBe(true);
      
      client.logout();
      
      expect(client.isAuthenticated()).toBe(false);
      expect(client.getSessionToken()).toBe(undefined);
    });

    it('should have login method that throws for now', async () => {
      const client = new SunsamaClient();

      await expect(client.login('test@example.com', 'password')).rejects.toThrow(
        'Login functionality not yet implemented'
      );
    });
  });
});
