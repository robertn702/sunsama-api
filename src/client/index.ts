/**
 * Main Sunsama API client
 * 
 * Provides a type-safe interface to interact with all Sunsama API endpoints.
 */

import type { SunsamaClientConfig, RequestOptions } from '../types/client.js';
import { SunsamaAuthError } from '../errors/index.js';

/**
 * Main Sunsama API client class
 * 
 * Provides a type-safe interface to interact with all Sunsama API endpoints.
 */
export class SunsamaClient {
  private static readonly BASE_URL = 'https://api.sunsama.com';
  
  private readonly config: SunsamaClientConfig;
  private sessionToken?: string;

  /**
   * Creates a new Sunsama client instance
   * 
   * @param config - Client configuration options (optional)
   */
  constructor(config: SunsamaClientConfig = {}) {
    this.config = config;
    this.sessionToken = config.sessionToken;
  }

  /**
   * Gets the current client configuration
   */
  getConfig(): SunsamaClientConfig {
    return { ...this.config };
  }

  /**
   * Checks if the client is authenticated
   * 
   * @returns True if a valid session token is available
   */
  isAuthenticated(): boolean {
    return !!this.sessionToken;
  }

  /**
   * Gets the current session token
   * 
   * @returns The session token if available, undefined otherwise
   */
  getSessionToken(): string | undefined {
    return this.sessionToken;
  }

  /**
   * Authenticates with email and password
   * 
   * @param email - User email address
   * @param password - User password
   * @throws SunsamaAuthError if login fails
   */
  async login(email: string, password: string): Promise<void> {
    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);

    try {
      const response = await this.request('/account/login/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new SunsamaAuthError(`Login failed: ${response.status} ${response.statusText}`);
      }

      // Extract sunsamaSession cookie from response headers
      const setCookieHeader = response.headers.get('set-cookie');
      if (!setCookieHeader) {
        throw new SunsamaAuthError('No session cookie received from login');
      }

      // Parse the sunsamaSession cookie value
      const sessionMatch = setCookieHeader.match(/sunsamaSession=([^;]+)/);
      if (!sessionMatch || !sessionMatch[1]) {
        throw new SunsamaAuthError('Invalid session cookie format');
      }

      // Store session token in memory
      const sessionToken = sessionMatch[1];
      this.setSessionToken(sessionToken);
    } catch (error) {
      if (error instanceof SunsamaAuthError) {
        throw error;
      }
      throw new SunsamaAuthError(`Login request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clears the current session token
   */
  logout(): void {
    this.sessionToken = undefined;
  }

  /**
   * Makes an authenticated request to the Sunsama API
   * 
   * @param path - The API endpoint path (e.g., '/tasks')
   * @param options - Request options
   * @returns The response from the API
   * @internal
   */
  private async request(
    path: string,
    options: RequestOptions
  ): Promise<Response> {
    const url = `${SunsamaClient.BASE_URL}${path}`;
    
    // Build headers
    const headers: HeadersInit = {
      'Origin': 'https://app.sunsama.com',
      ...options.headers,
    };

    // Add session token if available
    if (this.sessionToken) {
      headers['Cookie'] = `sunsamaSession=${this.sessionToken}`;
    }

    // Build query string if params provided
    let fullUrl = url;
    if (options.params) {
      const params = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      fullUrl = `${url}?${params.toString()}`;
    }

    // Make the request
    const response = await fetch(fullUrl, {
      method: options.method,
      headers,
      body: options.body instanceof URLSearchParams 
        ? options.body.toString() 
        : options.body ? JSON.stringify(options.body) : undefined,
    });

    return response;
  }

  /**
   * Sets the session token (internal use)
   * 
   * @param token - The session token to set
   * @internal
   */
  private setSessionToken(token: string): void {
    this.sessionToken = token;
  }
}
