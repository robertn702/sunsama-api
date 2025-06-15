/**
 * Validation utilities using Zod v4
 *
 * This module uses Zod v4 features for improved performance and type safety.
 * Key v4 improvements used:
 * - Enhanced error messages with structured error configuration
 * - Improved object schema validation with custom messages
 * - Better union type handling
 * - More efficient parsing and validation
 */

import { z } from 'zod/v4';
import { SunsamaAuthError } from '../errors/index.js';

/**
 * MongoDB ObjectId validation pattern
 */
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

/**
 * Schema for validating MongoDB ObjectId strings using Zod v4
 */
export const objectIdSchema = z
  .string({
    message: 'Task ID must be a string',
  })
  .min(1, 'Task ID cannot be empty')
  .regex(objectIdPattern, 'Task ID must be a valid MongoDB ObjectId (24-character hex string)');

/**
 * Schema for validating ISO date strings using Zod v4 format
 */
export const isoDateSchema = z
  .string({
    message: 'Date must be a string',
  })
  .refine(
    value => {
      // Check if it's a valid date and roughly follows ISO format
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return false;
      }
      // Check if it contains basic ISO format patterns (YYYY-MM-DDTHH:mm:ss or similar)
      const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      return isoPattern.test(value);
    },
    {
      message: 'Must be a valid ISO 8601 date string (e.g., "2025-06-15T10:30:00Z")',
    }
  );

/**
 * Schema for validating Date objects or date strings using Zod v4
 */
export const dateOrStringSchema = z.union([
  z.date({
    message: 'Must be a valid Date object',
  }),
  isoDateSchema,
  z
    .string({
      message: 'Date must be a string',
    })
    .refine(
      value => {
        const date = new Date(value);
        return !isNaN(date.getTime());
      },
      {
        message: 'Must be a valid date string',
      }
    ),
]);

/**
 * Schema for updateTaskComplete arguments using Zod v4
 */
export const updateTaskCompleteArgsSchema = z.object(
  {
    taskId: objectIdSchema,
    completeOn: dateOrStringSchema.optional(),
    limitResponsePayload: z
      .boolean({
        message: 'limitResponsePayload must be a boolean',
      })
      .default(true),
  },
  {
    message: 'Invalid arguments object',
  }
);

/**
 * Type for updateTaskComplete arguments
 */
export type UpdateTaskCompleteArgs = z.infer<typeof updateTaskCompleteArgsSchema>;

/**
 * Validates and parses updateTaskComplete arguments
 * @param args - Arguments to validate
 * @returns Parsed and validated arguments
 * @throws SunsamaAuthError if validation fails
 */
export function validateUpdateTaskCompleteArgs(args: {
  taskId: string;
  completeOn?: Date | string;
  limitResponsePayload?: boolean;
}): UpdateTaskCompleteArgs {
  try {
    return updateTaskCompleteArgsSchema.parse(args);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new SunsamaAuthError(`Validation error: ${messages.join(', ')}`);
    }
    throw error;
  }
}

/**
 * Converts a Date or string to ISO string for API usage
 * @param value - Date object or string
 * @returns ISO string representation
 */
export function toISOString(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  // If it's already a string, validate it's a proper date and return ISO format
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new SunsamaAuthError('Invalid date provided');
  }
  return date.toISOString();
}
