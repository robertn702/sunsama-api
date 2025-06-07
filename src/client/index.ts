/**
 * Main Sunsama API client
 *
 * Provides a type-safe interface to interact with all Sunsama API endpoints.
 */

import { CookieJar, Cookie } from 'tough-cookie';
import { SunsamaAuthError } from '../errors/index.js';
import type { RequestOptions, SunsamaClientConfig } from '../types/client.js';

/**
 * Main Sunsama API client class
 *
 * Provides a type-safe interface to interact with all Sunsama API endpoints.
 */
export class SunsamaClient {
  private static readonly BASE_URL = 'https://api.sunsama.com';

  private readonly config: SunsamaClientConfig;
  private readonly cookieJar: CookieJar;

  /**
   * Creates a new Sunsama client instance
   *
   * @param config - Client configuration options (optional)
   */
  constructor(config: SunsamaClientConfig = {}) {
    this.config = config;
    this.cookieJar = new CookieJar();
    
    // If a session token is provided, set it as a cookie
    if (config.sessionToken) {
      this.setSessionTokenAsCookie(config.sessionToken);
    }
  }

  /**
   * Gets the current client configuration
   */
  getConfig(): SunsamaClientConfig {
    return {...this.config};
  }

  /**
   * Checks if the client is authenticated
   *
   * @returns True if cookies are present in the jar
   */
  async isAuthenticated(): Promise<boolean> {
    const cookies = await this.cookieJar.getCookies(SunsamaClient.BASE_URL);
    return cookies.some(cookie => cookie.key === 'sunsamaSession');
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

      // Extract and store cookies from response
      const setCookieHeader = response.headers.get('set-cookie');
      if (!setCookieHeader) {
        throw new SunsamaAuthError('No session cookie received from login');
      }

      // Store the cookie in the jar
      try {
        const loginUrl = `${SunsamaClient.BASE_URL}/account/login/email`;
        await this.cookieJar.setCookie(setCookieHeader, loginUrl);
      } catch (error) {
        throw new SunsamaAuthError(`Failed to store session cookie: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } catch (error) {
      if (error instanceof SunsamaAuthError) {
        throw error;
      }
      throw new SunsamaAuthError(`Login request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clears all cookies from the jar
   */
  logout(): void {
    this.cookieJar.removeAllCookiesSync();
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

    // Get cookies from jar for this URL
    const cookies = await this.cookieJar.getCookies(url);
    if (cookies.length > 0) {
      headers['Cookie'] = cookies.map(cookie => cookie.cookieString()).join('; ');
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
   * Sets a session token as a cookie in the jar
   * 
   * @param token - The session token to set
   * @internal
   */
  private setSessionTokenAsCookie(token: string): void {
    try {
      const cookie = new Cookie({
        key: 'sunsamaSession',
        value: token,
        domain: 'api.sunsama.com',
        path: '/',
        httpOnly: true,
        secure: true,
      });
      
      this.cookieJar.setCookieSync(cookie, SunsamaClient.BASE_URL);
    } catch (error) {
      // Silently fail if cookie cannot be set
      console.warn('Failed to set session token as cookie:', error);
    }
  }
}
