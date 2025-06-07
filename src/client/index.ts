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
  private readonly _config: SunsamaClientConfig;
  private _sessionToken?: string;
  private readonly baseUrl = 'https://api.sunsama.com';

  /**
   * Creates a new Sunsama client instance
   * 
   * @param config - Client configuration options (optional)
   */
  constructor(config: SunsamaClientConfig = {}) {
    this._config = config;
    this._sessionToken = config.sessionToken;
  }

  /**
   * Gets the current client configuration
   */
  public get config(): SunsamaClientConfig {
    return { ...this._config };
  }

  /**
   * Checks if the client is authenticated
   * 
   * @returns True if a valid session token is available
   */
  public isAuthenticated(): boolean {
    return !!this._sessionToken;
  }

  /**
   * Gets the current session token
   * 
   * @returns The session token if available, undefined otherwise
   */
  public getSessionToken(): string | undefined {
    return this._sessionToken;
  }

  /**
   * Authenticates with email and password
   * 
   * @param email - User email address
   * @param password - User password
   * @throws SunsamaAuthError if login fails
   */
  public async login(email: string, password: string): Promise<void> {
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
  public logout(): void {
    this._sessionToken = undefined;
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
    const url = `${this.baseUrl}${path}`;
    
    // Build headers
    const headers: HeadersInit = {
      'Origin': 'https://app.sunsama.com',
      ...options.headers,
    };

    // Add session token if available
    if (this._sessionToken) {
      headers['Cookie'] = `sunsamaSession=${this._sessionToken}`;
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
    this._sessionToken = token;
  }
}
