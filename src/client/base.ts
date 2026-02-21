/**
 * Base Sunsama client
 *
 * Provides core HTTP infrastructure, authentication, session management,
 * and task ID generation. Extended by domain-specific method classes.
 */

import { print } from 'graphql';
import { Cookie, CookieJar } from 'tough-cookie';
import { SunsamaAuthError } from '../errors/index.js';
import type {
  GraphQLRequest,
  GraphQLResponse,
  RequestOptions,
  SunsamaClientConfig,
} from '../types/index.js';

export abstract class SunsamaClientBase {
  protected static readonly BASE_URL = 'https://api.sunsama.com';

  private readonly config: SunsamaClientConfig;
  private readonly cookieJar: CookieJar;
  protected userId?: string;
  protected groupId?: string;
  protected timezone?: string;

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
    return { ...this.config };
  }

  /**
   * Checks if the client is authenticated
   *
   * @returns True if a session cookie is present in the jar
   */
  async isAuthenticated(): Promise<boolean> {
    const cookies = await this.cookieJar.getCookies(SunsamaClientBase.BASE_URL);
    return cookies.some(cookie => cookie.key === 'sunsamaSession');
  }

  /**
   * Returns the current session token, or undefined if not authenticated
   *
   * @returns The session token string, or undefined
   */
  async getSessionToken(): Promise<string | undefined> {
    const cookies = await this.cookieJar.getCookies(SunsamaClientBase.BASE_URL);
    return cookies.find(cookie => cookie.key === 'sunsamaSession')?.value;
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
      // For login, we need to handle redirects manually to capture the session cookie
      const loginUrl = `${SunsamaClientBase.BASE_URL}/account/login/email`;

      // Get cookies from jar for this URL
      const cookies = await this.cookieJar.getCookies(loginUrl);
      const headers: HeadersInit = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Origin: 'https://app.sunsama.com',
      };

      if (cookies.length > 0) {
        headers['Cookie'] = cookies.map(cookie => cookie.cookieString()).join('; ');
      }

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers,
        body: formData.toString(),
        redirect: 'manual', // Don't follow redirects automatically
      });

      // For login, we expect a 302 redirect on success
      if (response.status !== 302) {
        const responseText = await response.text();
        throw new SunsamaAuthError(
          `Login failed: ${response.status} ${response.statusText}. Response: ${responseText}`
        );
      }

      // Extract and store cookies from response
      const setCookieHeader = response.headers.get('set-cookie');
      if (!setCookieHeader) {
        // Debug: print all response headers
        const allHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          allHeaders[key] = value;
        });
        throw new SunsamaAuthError(
          `No session cookie received from login. Response headers: ${JSON.stringify(allHeaders, null, 2)}`
        );
      }

      // Store the cookie in the jar
      try {
        const loginUrl = `${SunsamaClientBase.BASE_URL}/account/login/email`;
        await this.cookieJar.setCookie(setCookieHeader, loginUrl);
      } catch (error) {
        throw new SunsamaAuthError(
          `Failed to store session cookie: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    } catch (error) {
      if (error instanceof SunsamaAuthError) {
        throw error;
      }
      throw new SunsamaAuthError(
        `Login request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Clears all cookies from the jar and cached user data
   */
  logout(): void {
    this.cookieJar.removeAllCookiesSync();
    this.userId = undefined;
    this.groupId = undefined;
    this.timezone = undefined;
  }

  /**
   * Makes an authenticated request to the Sunsama API
   *
   * @param path - The API endpoint path (e.g., '/graphql')
   * @param options - Request options
   * @returns The response from the API
   * @internal
   */
  private async request(path: string, options: RequestOptions): Promise<Response> {
    const url = `${SunsamaClientBase.BASE_URL}${path}`;

    // Build headers
    const headers: HeadersInit = {
      Origin: 'https://app.sunsama.com',
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

    // Process request body
    let body: string | undefined;
    if (options.body instanceof URLSearchParams) {
      body = options.body.toString();
    } else if (options.body) {
      body = JSON.stringify(options.body);
    }

    // Make the request
    return await fetch(fullUrl, {
      method: options.method,
      headers,
      body,
    });
  }

  /**
   * Makes a GraphQL request to the Sunsama API
   *
   * @param request - The GraphQL request
   * @returns The GraphQL response
   * @internal
   */
  protected async graphqlRequest<T, TVariables = Record<string, unknown>>(
    request: GraphQLRequest<TVariables>
  ): Promise<GraphQLResponse<T>> {
    // Convert DocumentNode to string if needed
    const queryString = typeof request.query === 'string' ? request.query : print(request.query);

    const requestBody = {
      ...request,
      query: queryString,
    };

    const response = await this.request('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(request.operationName && { 'x-gql-operation-name': request.operationName }),
      },
      body: requestBody,
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new SunsamaAuthError(
        `GraphQL request failed: ${response.status} ${response.statusText}. Response: ${responseText}`
      );
    }

    const result = (await response.json()) as GraphQLResponse<T>;

    if (result.errors && result.errors.length > 0) {
      throw new SunsamaAuthError(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
    }

    return result;
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

      this.cookieJar.setCookieSync(cookie, SunsamaClientBase.BASE_URL);
    } catch (error) {
      // Silently fail if cookie cannot be set
      // Note: Error intentionally ignored to avoid breaking authentication flow
    }
  }

  /**
   * Generates a unique task ID in MongoDB ObjectId format
   *
   * This method creates a 24-character hexadecimal string following MongoDB ObjectId conventions:
   * - First 8 chars: Unix timestamp (4 bytes)
   * - Next 10 chars: Random value (5 bytes)
   * - Last 6 chars: Incrementing counter (3 bytes)
   *
   * @returns A 24-character hexadecimal string compatible with Sunsama's task ID format
   * @example
   * ```typescript
   * const taskId = SunsamaClient.generateTaskId();
   * console.log(taskId); // "507f1f77bcf86cd799439011"
   * ```
   */
  public static generateTaskId(): string {
    // Get current timestamp (4 bytes = 8 hex chars)
    const timestamp = Math.floor(Date.now() / 1000);
    const timestampHex = timestamp.toString(16).padStart(8, '0');

    // Generate random value (5 bytes = 10 hex chars)
    const randomValue = SunsamaClientBase.getRandomValue();

    // Generate counter (3 bytes = 6 hex chars) - increment for each ID generation
    const counter = SunsamaClientBase.getNextCounter();
    const counterHex = counter.toString(16).padStart(6, '0');

    return timestampHex + randomValue + counterHex;
  }

  private static _counter = Math.floor(Math.random() * 0xffffff);

  /**
   * Gets a random value for ObjectId generation (5 bytes = 10 hex chars)
   * @internal
   */
  private static getRandomValue(): string {
    // Generate 5 random bytes for the random portion
    const randomBytes = new Uint8Array(5);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(randomBytes);
    } else {
      // Fallback for Node.js environments
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const cryptoModule = require('crypto');
      const buffer = cryptoModule.randomBytes(5);
      randomBytes.set(buffer);
    }

    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Gets the next counter value for ID generation (3 bytes = 6 hex chars)
   * @internal
   */
  private static getNextCounter(): number {
    SunsamaClientBase._counter = (SunsamaClientBase._counter + 1) % 0xffffff;
    return SunsamaClientBase._counter;
  }
}
