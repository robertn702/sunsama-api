/**
 * Vitest global setup for integration tests
 *
 * This file handles authentication and cleanup for all integration tests.
 * Authentication happens once at the start, and cleanup happens at the end.
 *
 * The session token is written to a temp file so that each fork worker can
 * reuse it via SunsamaClient({ sessionToken }) instead of calling login()
 * independently (which causes 429 rate limiting).
 */

/* eslint-disable no-console */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { getAuthenticatedClient, cleanup, hasCredentials } from './setup.js';

export const SESSION_TOKEN_FILE = path.resolve('.integration-session.tmp');

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
    const client = await getAuthenticatedClient();
    const token = await client.getSessionToken();

    if (token) {
      fs.writeFileSync(SESSION_TOKEN_FILE, token, 'utf-8');
    }

    console.log('✅ Authentication successful\n');
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    throw error;
  }
}

export async function teardown(): Promise<void> {
  // Remove session token temp file
  if (fs.existsSync(SESSION_TOKEN_FILE)) {
    fs.unlinkSync(SESSION_TOKEN_FILE);
  }

  // Cleanup all tracked tasks and logout
  await cleanup();
  console.log('\n✅ Integration test cleanup complete\n');
}
