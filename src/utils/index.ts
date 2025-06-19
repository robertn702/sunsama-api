/**
 * Utility functions for the Sunsama API wrapper
 */

export * from './validation.js';
export * from './conversion.js';

/**
 * Validates that a string is not empty
 *
 * @param value - The string to validate
 * @param fieldName - Name of the field (for error messages)
 * @throws {Error} If the string is empty or only whitespace
 */
export function validateNonEmptyString(value: string, fieldName: string): void {
  if (!value || value.trim().length === 0) {
    throw new Error(`${fieldName} cannot be empty`);
  }
}

/**
 * Validates that a number is positive
 *
 * @param value - The number to validate
 * @param fieldName - Name of the field (for error messages)
 * @throws {Error} If the number is not positive
 */
export function validatePositiveNumber(value: number, fieldName: string): void {
  if (value <= 0) {
    throw new Error(`${fieldName} must be a positive number`);
  }
}

/**
 * Builds a URL with query parameters
 *
 * @param baseUrl - The base URL
 * @param params - Query parameters to append
 * @returns The complete URL with query string
 */
export function buildUrlWithParams(
  baseUrl: string,
  params?: Record<string, string | number | boolean>
): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const url = new URL(baseUrl);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  return url.toString();
}

/**
 * Checks if a value is a plain object
 *
 * @param value - The value to check
 * @returns True if the value is a plain object
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    value.constructor === Object &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}
