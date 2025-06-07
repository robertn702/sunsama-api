/**
 * Main Sunsama API client
 * 
 * Provides a type-safe interface to interact with all Sunsama API endpoints.
 */

import type { SunsamaClientConfig } from '../types/client.js';
import { SunsamaAuthError } from '../errors/index.js';

/**
 * Main Sunsama API client class
 * 
 * Provides a type-safe interface to interact with all Sunsama API endpoints.
 */
export class SunsamaClient {
  private readonly _config: SunsamaClientConfig;
  private _sessionToken?: string;

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
    const loginUrl = 'https://api.sunsama.com/account/login/email';
    
    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Origin': 'https://app.sunsama.com',
        },
        body: formData.toString(),
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
   * Sets the session token (internal use)
   * 
   * @param token - The session token to set
   * @internal
   */
  private setSessionToken(token: string): void {
    this._sessionToken = token;
  }
}
