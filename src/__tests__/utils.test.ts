/**
 * Tests for utility functions
 */

import { describe, expect, it } from 'vitest';
import {
  buildUrlWithParams,
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
});
