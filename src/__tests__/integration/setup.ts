/**
 * Shared authentication setup for integration tests
 *
 * This module provides a singleton authenticated SunsamaClient instance
 * that is shared across all integration tests to avoid rate limiting.
 *
 * Each fork worker reads the session token written by globalSetup and
 * constructs a client with it directly, avoiding repeated login() calls.
 */

/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';
import { SunsamaClient } from '../../client/index.js';

const SESSION_TOKEN_FILE = path.resolve('.integration-session.tmp');

let sharedClient: SunsamaClient | null = null;
const createdTaskIds: string[] = [];

/**
 * Get or create an authenticated SunsamaClient instance
 *
 * Prefers reusing the session token written by globalSetup to avoid
 * calling login() in every fork worker. Falls back to login() if the
 * token file is not present (e.g. running a single test file directly).
 */
export async function getAuthenticatedClient(): Promise<SunsamaClient> {
  if (sharedClient) {
    return sharedClient;
  }

  // Prefer the pre-shared session token to avoid repeated logins
  if (fs.existsSync(SESSION_TOKEN_FILE)) {
    const token = fs.readFileSync(SESSION_TOKEN_FILE, 'utf-8').trim();
    if (token) {
      sharedClient = new SunsamaClient({ sessionToken: token });
      return sharedClient;
    }
  }

  // Fallback: login directly (used when running a single test file without globalSetup)
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
