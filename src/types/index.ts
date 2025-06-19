/**
 * Type definitions for the Sunsama API wrapper
 *
 * This file exports all type definitions used throughout the library.
 */

// Client configuration types
export type * from './client.js';

// API response types
export type * from './api.js';

// Common utility types
export type * from './common.js';

// Re-export utility types from utils for convenience
export type {
  HtmlToMarkdownOptions,
  MarkdownToHtmlOptions,
  ConversionOptions,
} from '../utils/conversion.js';
