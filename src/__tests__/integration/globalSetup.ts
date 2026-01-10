/**
 * Vitest global setup for integration tests
 *
 * This file handles authentication and cleanup for all integration tests.
 * Authentication happens once at the start, and cleanup happens at the end.
 */

/* eslint-disable no-console */

import 'dotenv/config';
import { getAuthenticatedClient, cleanup, hasCredentials } from './setup.js';

export async function setup(): Promise<void> {
  if (!hasCredentials()) {
    console.warn(
      '\n⚠️  Integration tests will be skipped - missing credentials in .env file\n' +
        '   Set SUNSAMA_EMAIL and SUNSAMA_PASSWORD to run integration tests\n'
    );
    return;
  }

  console.log('\n🔐 Authenticating once for all integration tests...\n');

  try {
    // Authenticate once at the start - this creates the singleton
    await getAuthenticatedClient();
    console.log('✅ Authentication successful\n');
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    throw error;
  }
}

export async function teardown(): Promise<void> {
  // Cleanup all tracked tasks and logout
  await cleanup();
  console.log('\n✅ Integration test cleanup complete\n');
}
