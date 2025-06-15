/**
 * Tests for validation utilities
 */

import { describe, expect, it } from 'vitest';
import {
  validateUpdateTaskCompleteArgs,
  toISOString,
  objectIdSchema,
  isoDateSchema,
  dateOrStringSchema,
} from '../utils/validation.js';
import { SunsamaAuthError } from '../errors/index.js';

describe('Validation utilities', () => {
  describe('objectIdSchema', () => {
    it('should validate valid MongoDB ObjectIds', () => {
      const validIds = [
        '507f1f77bcf86cd799439011',
        '507f191e810c19729de860ea',
        '123456789012345678901234',
        'abcdefabcdefabcdefabcdef',
      ];

      for (const id of validIds) {
        expect(() => objectIdSchema.parse(id)).not.toThrow();
      }
    });

    it('should reject invalid ObjectIds', () => {
      const invalidIds = [
        '',
        'short',
        '507f1f77bcf86cd799439011x', // 25 chars
        '507f1f77bcf86cd79943901', // 23 chars
        '507f1f77bcf86cd799439g11', // invalid char 'g'
        'not-an-object-id-at-all',
        '507f1f77-bcf8-6cd7-9943-9011', // with dashes
      ];

      for (const id of invalidIds) {
        expect(() => objectIdSchema.parse(id)).toThrow();
      }
    });
  });

  describe('isoDateSchema', () => {
    it('should validate valid ISO date strings', () => {
      const validDates = [
        '2025-06-15T10:30:00.000Z',
        '2025-12-31T23:59:59.999Z',
        '2025-01-01T00:00:00.000Z',
        '2025-06-15T10:30:00Z',
      ];

      for (const date of validDates) {
        expect(() => isoDateSchema.parse(date)).not.toThrow();
      }
    });

    it('should reject invalid ISO date strings', () => {
      const invalidDates = [
        '2025-06-15',
        '2025/06/15 10:30:00',
        '15-06-2025T10:30:00Z',
        '2025-13-01T10:30:00Z', // invalid month
        '2025-06-32T10:30:00Z', // invalid day
        '2025-06-15T25:30:00Z', // invalid hour
        'not-a-date',
        '',
      ];

      for (const date of invalidDates) {
        expect(() => isoDateSchema.parse(date)).toThrow();
      }
    });
  });

  describe('dateOrStringSchema', () => {
    it('should validate Date objects', () => {
      const validDates = [new Date(), new Date('2025-06-15'), new Date('2025-12-31T23:59:59Z')];

      for (const date of validDates) {
        expect(() => dateOrStringSchema.parse(date)).not.toThrow();
      }
    });

    it('should validate valid date strings', () => {
      const validDateStrings = [
        '2025-06-15T10:30:00.000Z',
        '2025-06-15',
        '2025/06/15',
        'June 15, 2025',
        '2025-06-15 10:30:00',
      ];

      for (const dateString of validDateStrings) {
        expect(() => dateOrStringSchema.parse(dateString)).not.toThrow();
      }
    });

    it('should reject invalid date strings', () => {
      const invalidDates = ['not-a-date', '', 'invalid-date-string', '2025-13-50'];

      for (const date of invalidDates) {
        expect(() => dateOrStringSchema.parse(date)).toThrow();
      }
    });
  });

  describe('validateUpdateTaskCompleteArgs', () => {
    it('should validate valid arguments', () => {
      const validArgs = [
        {
          taskId: '507f1f77bcf86cd799439011',
          completeOn: new Date(),
          limitResponsePayload: true,
        },
        {
          taskId: '507f1f77bcf86cd799439011',
          completeOn: '2025-06-15T10:30:00Z',
          limitResponsePayload: false,
        },
        {
          taskId: '507f1f77bcf86cd799439011',
          // completeOn is optional
          limitResponsePayload: true,
        },
        {
          taskId: '507f1f77bcf86cd799439011',
          completeOn: '2025-06-15',
          // limitResponsePayload defaults to true
        },
      ];

      for (const args of validArgs) {
        expect(() => validateUpdateTaskCompleteArgs(args)).not.toThrow();
      }
    });

    it('should apply default value for limitResponsePayload', () => {
      const result = validateUpdateTaskCompleteArgs({
        taskId: '507f1f77bcf86cd799439011',
      });

      expect(result.limitResponsePayload).toBe(true);
    });

    it('should throw SunsamaAuthError for invalid taskId', () => {
      expect(() =>
        validateUpdateTaskCompleteArgs({
          taskId: 'invalid-id',
        })
      ).toThrow(SunsamaAuthError);

      expect(() =>
        validateUpdateTaskCompleteArgs({
          taskId: '',
        })
      ).toThrow(SunsamaAuthError);
    });

    it('should throw SunsamaAuthError for invalid completeOn', () => {
      expect(() =>
        validateUpdateTaskCompleteArgs({
          taskId: '507f1f77bcf86cd799439011',
          completeOn: 'invalid-date',
        })
      ).toThrow(SunsamaAuthError);
    });

    it('should include field path in error message', () => {
      try {
        validateUpdateTaskCompleteArgs({
          taskId: 'invalid-id',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(SunsamaAuthError);
        expect((error as SunsamaAuthError).message).toContain('taskId');
      }
    });
  });

  describe('toISOString', () => {
    it('should convert Date objects to ISO strings', () => {
      const date = new Date('2025-06-15T10:30:00Z');
      const result = toISOString(date);

      expect(result).toBe('2025-06-15T10:30:00.000Z');
    });

    it('should convert valid date strings to ISO strings', () => {
      const dateString = '2025-06-15';
      const result = toISOString(dateString);

      expect(result).toBe('2025-06-15T00:00:00.000Z');
    });

    it('should handle ISO strings by parsing and reformatting them', () => {
      const isoString = '2025-06-15T10:30:00Z';
      const result = toISOString(isoString);

      expect(result).toBe('2025-06-15T10:30:00.000Z');
    });

    it('should throw SunsamaAuthError for invalid dates', () => {
      expect(() => toISOString('invalid-date')).toThrow(SunsamaAuthError);
      expect(() => toISOString('')).toThrow(SunsamaAuthError);
    });
  });
});
