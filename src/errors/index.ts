/**
 * Error classes for the Sunsama API wrapper
 */

/**
 * Base error class for all Sunsama-related errors
 */
export class SunsamaError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'SunsamaError';
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SunsamaError);
    }
  }
}

/**
 * Error thrown when API requests fail
 */
export class SunsamaApiError extends SunsamaError {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response?: unknown,
    code?: string
  ) {
    super(message, code);
    this.name = 'SunsamaApiError';
  }

  /**
   * Check if this is a client error (4xx status code)
   */
  public isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if this is a server error (5xx status code)
   */
  public isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Check if this is a rate limit error
   */
  public isRateLimitError(): boolean {
    return this.status === 429;
  }

  /**
   * Check if this is an authentication error
   */
  public isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }
}

/**
 * Error thrown when client configuration is invalid
 */
export class SunsamaConfigError extends SunsamaError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'SunsamaConfigError';
  }
}

/**
 * Error thrown when request validation fails
 */
export class SunsamaValidationError extends SunsamaError {
  constructor(
    message: string,
    public readonly field?: string,
    code?: string
  ) {
    super(message, code);
    this.name = 'SunsamaValidationError';
  }
}

/**
 * Error thrown when network requests fail
 */
export class SunsamaNetworkError extends SunsamaError {
  constructor(message: string, cause?: Error) {
    super(message, 'NETWORK_ERROR', cause);
    this.name = 'SunsamaNetworkError';
  }
}

/**
 * Error thrown when requests timeout
 */
export class SunsamaTimeoutError extends SunsamaNetworkError {
  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`);
    this.name = 'SunsamaTimeoutError';
  }
}
