/**
 * Shared authentication setup for integration tests
 *
 * This module provides a singleton authenticated SunsamaClient instance
 * that is shared across all integration tests to avoid rate limiting.
 */

/* eslint-disable no-console */

import { SunsamaClient } from '../../client/index.js';

let sharedClient: SunsamaClient | null = null;
const createdTaskIds: string[] = [];

/**
 * Get or create an authenticated SunsamaClient instance
 *
 * This function returns a singleton client that authenticates once
 * and is reused across all integration tests.
 */
export async function getAuthenticatedClient(): Promise<SunsamaClient> {
  if (sharedClient) {
    return sharedClient;
  }

  const email = process.env['SUNSAMA_EMAIL'];
  const password = process.env['SUNSAMA_PASSWORD'];

  if (!email || !password) {
    throw new Error(
      'Missing SUNSAMA_EMAIL or SUNSAMA_PASSWORD in .env file. ' +
        'Integration tests require valid credentials.'
    );
  }

  sharedClient = new SunsamaClient();
  await sharedClient.login(email, password);

  return sharedClient;
}

/**
 * Track a task ID for cleanup after tests complete
 */
export function trackTaskForCleanup(taskId: string): void {
  if (!createdTaskIds.includes(taskId)) {
    createdTaskIds.push(taskId);
  }
}

/**
 * Get all tracked task IDs
 */
export function getTrackedTaskIds(): string[] {
  return [...createdTaskIds];
}

/**
 * Cleanup all tracked tasks and logout
 *
 * This should be called in test teardown or global teardown
 */
export async function cleanup(): Promise<void> {
  if (!sharedClient) return;

  // Delete all tracked tasks
  for (const taskId of createdTaskIds) {
    try {
      await sharedClient.deleteTask(taskId);
    } catch (error) {
      console.error(`Failed to cleanup task ${taskId}:`, error);
    }
  }

  // Logout and reset
  sharedClient.logout();
  sharedClient = null;
  createdTaskIds.length = 0;
}

/**
 * Check if credentials are available for integration tests
 */
export function hasCredentials(): boolean {
  return !!(process.env['SUNSAMA_EMAIL'] && process.env['SUNSAMA_PASSWORD']);
}
