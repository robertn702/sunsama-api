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
    // TODO: Implement login endpoint call in Day 2
    throw new SunsamaAuthError('Login functionality not yet implemented');
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
