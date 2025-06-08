/**
 * Tests for error classes
 */

import { describe, it, expect } from 'vitest';
import {
  SunsamaError,
  SunsamaApiError,
  SunsamaConfigError,
  SunsamaValidationError,
  SunsamaNetworkError,
  SunsamaTimeoutError,
} from '../errors/index.js';

describe('Error Classes', () => {
  describe('SunsamaError', () => {
    it('should create a basic error', () => {
      const error = new SunsamaError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(SunsamaError);
      expect(error.name).toBe('SunsamaError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBeUndefined();
    });

    it('should create an error with code', () => {
      const error = new SunsamaError('Test error', 'TEST_CODE');

      expect(error.code).toBe('TEST_CODE');
    });

    it('should create an error with cause', () => {
      const cause = new Error('Cause error');
      const error = new SunsamaError('Test error', 'TEST_CODE', cause);

      expect(error.cause).toBe(cause);
    });
  });

  describe('SunsamaApiError', () => {
    it('should create an API error', () => {
      const error = new SunsamaApiError('API error', 400);

      expect(error).toBeInstanceOf(SunsamaError);
      expect(error).toBeInstanceOf(SunsamaApiError);
      expect(error.name).toBe('SunsamaApiError');
      expect(error.status).toBe(400);
    });

    it('should identify client errors correctly', () => {
      const error400 = new SunsamaApiError('Bad Request', 400);
      const error404 = new SunsamaApiError('Not Found', 404);
      const error500 = new SunsamaApiError('Server Error', 500);

      expect(error400.isClientError()).toBe(true);
      expect(error404.isClientError()).toBe(true);
      expect(error500.isClientError()).toBe(false);
    });

    it('should identify server errors correctly', () => {
      const error400 = new SunsamaApiError('Bad Request', 400);
      const error500 = new SunsamaApiError('Server Error', 500);
      const error502 = new SunsamaApiError('Bad Gateway', 502);

      expect(error400.isServerError()).toBe(false);
      expect(error500.isServerError()).toBe(true);
      expect(error502.isServerError()).toBe(true);
    });

    it('should identify rate limit errors correctly', () => {
      const error429 = new SunsamaApiError('Rate Limited', 429);
      const error400 = new SunsamaApiError('Bad Request', 400);

      expect(error429.isRateLimitError()).toBe(true);
      expect(error400.isRateLimitError()).toBe(false);
    });

    it('should identify auth errors correctly', () => {
      const error401 = new SunsamaApiError('Unauthorized', 401);
      const error403 = new SunsamaApiError('Forbidden', 403);
      const error400 = new SunsamaApiError('Bad Request', 400);

      expect(error401.isAuthError()).toBe(true);
      expect(error403.isAuthError()).toBe(true);
      expect(error400.isAuthError()).toBe(false);
    });
  });

  describe('SunsamaConfigError', () => {
    it('should create a config error', () => {
      const error = new SunsamaConfigError('Invalid config');

      expect(error).toBeInstanceOf(SunsamaError);
      expect(error).toBeInstanceOf(SunsamaConfigError);
      expect(error.name).toBe('SunsamaConfigError');
    });
  });

  describe('SunsamaValidationError', () => {
    it('should create a validation error', () => {
      const error = new SunsamaValidationError('Invalid field', 'fieldName');

      expect(error).toBeInstanceOf(SunsamaError);
      expect(error).toBeInstanceOf(SunsamaValidationError);
      expect(error.name).toBe('SunsamaValidationError');
      expect(error.field).toBe('fieldName');
    });
  });

  describe('SunsamaNetworkError', () => {
    it('should create a network error', () => {
      const error = new SunsamaNetworkError('Network failed');

      expect(error).toBeInstanceOf(SunsamaError);
      expect(error).toBeInstanceOf(SunsamaNetworkError);
      expect(error.name).toBe('SunsamaNetworkError');
      expect(error.code).toBe('NETWORK_ERROR');
    });
  });

  describe('SunsamaTimeoutError', () => {
    it('should create a timeout error', () => {
      const error = new SunsamaTimeoutError(5000);

      expect(error).toBeInstanceOf(SunsamaNetworkError);
      expect(error).toBeInstanceOf(SunsamaTimeoutError);
      expect(error.name).toBe('SunsamaTimeoutError');
      expect(error.message).toBe('Request timed out after 5000ms');
    });
  });
});
