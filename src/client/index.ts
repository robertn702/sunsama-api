/**
 * Main Sunsama API client
 * 
 * This is a placeholder file for the main client implementation.
 * The actual implementation will be added in the next phase.
 */

import type { SunsamaClientConfig } from '../types/client.js';

/**
 * Main Sunsama API client class
 * 
 * Provides a type-safe interface to interact with all Sunsama API endpoints.
 */
export class SunsamaClient {
  private readonly config: Required<SunsamaClientConfig>;

  /**
   * Creates a new Sunsama client instance
   * 
   * @param config - Client configuration options
   */
  constructor(config: SunsamaClientConfig) {
    // TODO: Implement client initialization
    this.config = {
      baseUrl: 'https://api.sunsama.com',
      timeout: 30000,
      retries: 3,
      ...config,
    };
  }

  /**
   * Gets the current client configuration
   */
  public getConfig(): Required<SunsamaClientConfig> {
    return { ...this.config };
  }
}
