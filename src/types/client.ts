/**
 * Client configuration and related types
 */

/**
 * Configuration options for the Sunsama client
 */
export interface SunsamaClientConfig {
  /** API key for authentication */
  apiKey: string;
  
  /** Base URL for the API (optional, defaults to official Sunsama API) */
  baseUrl?: string;
  
  /** Request timeout in milliseconds (optional, defaults to 30000) */
  timeout?: number;
  
  /** Number of retries for failed requests (optional, defaults to 3) */
  retries?: number;
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
