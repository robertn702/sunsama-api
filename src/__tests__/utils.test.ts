/**
 * Tests for utility functions
 */

import { describe, expect, it } from 'vitest';
import {
  buildUrlWithParams,
  dayToPanelDate,
  isPlainObject,
  validateNonEmptyString,
  validatePositiveNumber,
} from '../utils/index.js';

describe('Utility Functions', () => {
  describe('validateNonEmptyString', () => {
    it('should pass for valid strings', () => {
      expect(() => validateNonEmptyString('valid', 'field')).not.toThrow();
      expect(() => validateNonEmptyString('  valid  ', 'field')).not.toThrow();
    });

    it('should throw for empty strings', () => {
      expect(() => validateNonEmptyString('', 'field')).toThrow('field cannot be empty');
      expect(() => validateNonEmptyString('   ', 'field')).toThrow('field cannot be empty');
    });
  });

  describe('validatePositiveNumber', () => {
    it('should pass for positive numbers', () => {
      expect(() => validatePositiveNumber(1, 'field')).not.toThrow();
      expect(() => validatePositiveNumber(0.1, 'field')).not.toThrow();
      expect(() => validatePositiveNumber(100, 'field')).not.toThrow();
    });

    it('should throw for non-positive numbers', () => {
      expect(() => validatePositiveNumber(0, 'field')).toThrow('field must be a positive number');
      expect(() => validatePositiveNumber(-1, 'field')).toThrow('field must be a positive number');
    });
  });

  describe('buildUrlWithParams', () => {
    it('should return base URL when no params', () => {
      const url = buildUrlWithParams('https://api.example.com/test');
      expect(url).toBe('https://api.example.com/test');
    });

    it('should return base URL when empty params', () => {
      const url = buildUrlWithParams('https://api.example.com/test', {});
      expect(url).toBe('https://api.example.com/test');
    });

    it('should append query parameters', () => {
      const url = buildUrlWithParams('https://api.example.com/test', {
        page: 1,
        limit: 10,
        active: true,
        name: 'test',
      });

      expect(url).toContain('page=1');
      expect(url).toContain('limit=10');
      expect(url).toContain('active=true');
      expect(url).toContain('name=test');
    });
  });

  describe('isPlainObject', () => {
    it('should return true for plain objects', () => {
      expect(isPlainObject({})).toBe(true);
      expect(isPlainObject({ a: 1 })).toBe(true);
      expect(isPlainObject(Object.create(null))).toBe(false); // No prototype
    });

    it('should return false for non-plain objects', () => {
      expect(isPlainObject(null)).toBe(false);
      expect(isPlainObject(undefined)).toBe(false);
      expect(isPlainObject([])).toBe(false);
      expect(isPlainObject('string')).toBe(false);
      expect(isPlainObject(123)).toBe(false);
      expect(isPlainObject(new Date())).toBe(false);
      expect(isPlainObject(new Error())).toBe(false);
    });
  });

  describe('dayToPanelDate', () => {
    it('should convert a regular day to panel date (non-DST)', () => {
      // January 17, 2025 in New York (EST, UTC-5)
      // Midnight EST = 5am UTC
      const result = dayToPanelDate('2025-01-17', 'America/New_York');
      expect(result).toBe('2025-01-17T05:00:00.000Z');
    });

    it('should handle DST spring forward day correctly', () => {
      // March 10, 2024 - US DST starts at 2am (clocks jump to 3am)
      // At MIDNIGHT on March 10, it's still EST (UTC-5)
      // So midnight EST = 5am UTC
      const result = dayToPanelDate('2024-03-10', 'America/New_York');
      expect(result).toBe('2024-03-10T05:00:00.000Z');
    });

    it('should handle DST fall back day correctly', () => {
      // November 3, 2024 - US DST ends at 2am (clocks fall back to 1am)
      // At MIDNIGHT on November 3, it's still EDT (UTC-4)
      // So midnight EDT = 4am UTC
      const result = dayToPanelDate('2024-11-03', 'America/New_York');
      expect(result).toBe('2024-11-03T04:00:00.000Z');
    });

    it('should handle non-DST timezone (Arizona)', () => {
      // Arizona doesn't observe DST, always MST (UTC-7)
      // March 10, 2024 midnight MST = 7am UTC
      const result = dayToPanelDate('2024-03-10', 'America/Phoenix');
      expect(result).toBe('2024-03-10T07:00:00.000Z');
    });

    it('should handle positive UTC offset timezone', () => {
      // Tokyo is UTC+9, no DST
      // January 17, 2025 midnight JST = Jan 16 3pm UTC
      const result = dayToPanelDate('2025-01-17', 'Asia/Tokyo');
      expect(result).toBe('2025-01-16T15:00:00.000Z');
    });
  });
});
