/**
 * Client configuration and related types
 */

/**
 * Configuration options for the Sunsama client
 */
export interface SunsamaClientConfig {
  /** Session token for authentication (optional) */
  sessionToken?: string;
}

/**
 * HTTP method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Request options for API calls
 */
export interface RequestOptions {
  /** HTTP method */
  method: HttpMethod;

  /** Request headers */
  headers?: Record<string, string>;

  /** Request body */
  body?: unknown;

  /** Query parameters */
  params?: Record<string, string | number | boolean>;

  /** Custom timeout for this request */
  timeout?: number;
}
