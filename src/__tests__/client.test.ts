/**
 * Tests for the main Sunsama client
 */

import { describe, expect, it } from 'vitest';
import { SunsamaClient } from '../client/index.js';

describe('SunsamaClient', () => {
  describe('constructor', () => {
    it('should create a client with valid configuration', () => {
      const client = new SunsamaClient({
        apiKey: 'test-api-key',
      });

      expect(client).toBeInstanceOf(SunsamaClient);
    });

    it('should use default configuration values', () => {
      const client = new SunsamaClient({
        apiKey: 'test-api-key',
      });

      const config = client.config;

      expect(config.apiKey).toBe('test-api-key');
      expect(config.baseUrl).toBe('https://api.sunsama.com');
      expect(config.timeout).toBe(30000);
      expect(config.retries).toBe(3);
    });

    it('should allow custom configuration', () => {
      const client = new SunsamaClient({
        apiKey: 'test-api-key',
        baseUrl: 'https://custom.api.com',
        timeout: 5000,
        retries: 1,
      });

      const config = client.config;

      expect(config.baseUrl).toBe('https://custom.api.com');
      expect(config.timeout).toBe(5000);
      expect(config.retries).toBe(1);
    });

    it('should throw error for empty API key', () => {
      expect(() => {
        new SunsamaClient({
          apiKey: '',
        });
      }).toThrow(); // TODO: Implement validation and update test
    });
  });
});
