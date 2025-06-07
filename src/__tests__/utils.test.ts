/**
 * Tests for utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  validateNonEmptyString,
  validatePositiveNumber,
  buildUrlWithParams,
  isPlainObject,
  deepMerge,
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

  describe('deepMerge', () => {
    it('should merge simple objects', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const result = deepMerge(target, source);
      
      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should deep merge nested objects', () => {
      const target = { 
        a: 1, 
        nested: { x: 1, y: 2 } 
      };
      const source = { 
        b: 2, 
        nested: { y: 3, z: 4 } 
      };
      const result = deepMerge(target, source);
      
      expect(result).toEqual({
        a: 1,
        b: 2,
        nested: { x: 1, y: 3, z: 4 }
      });
    });

    it('should not mutate the original objects', () => {
      const target = { a: 1, nested: { x: 1 } };
      const source = { b: 2, nested: { y: 2 } };
      const result = deepMerge(target, source);
      
      expect(target).toEqual({ a: 1, nested: { x: 1 } });
      expect(source).toEqual({ b: 2, nested: { y: 2 } });
      expect(result).toEqual({ a: 1, b: 2, nested: { x: 1, y: 2 } });
    });
  });
});
