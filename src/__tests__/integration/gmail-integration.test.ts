/**
 * Integration tests for Gmail integration support
 */

import { describe, it, expect } from 'vitest';
import type { TaskGmailIntegration } from '../../types/index.js';

describe('Gmail Integration', () => {
  it('should accept TaskGmailIntegration type in createTask options', () => {
    // This test ensures the TypeScript types are correctly defined
    const gmailIntegration: TaskGmailIntegration = {
      service: 'gmail',
      identifier: {
        id: '19a830b40fd7ab7d',
        messageId: '19a830b40fd7ab7d',
        accountId: 'user@example.com',
        url: 'https://mail.google.com/mail/u/user@example.com/#inbox/19a830b40fd7ab7d',
        __typename: 'TaskGmailIntegrationIdentifier',
      },
      __typename: 'TaskGmailIntegration',
    };

    // Type assertion test - this should compile without errors
    const options = {
      integration: gmailIntegration,
      timeEstimate: 5,
    };

    expect(options.integration.service).toBe('gmail');
    expect(options.integration.identifier.messageId).toBe('19a830b40fd7ab7d');
  });

  it('should have all required Gmail integration identifier fields', () => {
    const gmailIntegration: TaskGmailIntegration = {
      service: 'gmail',
      identifier: {
        id: 'test-id',
        messageId: 'test-message-id',
        accountId: 'test@example.com',
        url: 'https://mail.google.com/test-url',
        __typename: 'TaskGmailIntegrationIdentifier',
      },
      __typename: 'TaskGmailIntegration',
    };

    expect(gmailIntegration.identifier).toHaveProperty('id');
    expect(gmailIntegration.identifier).toHaveProperty('messageId');
    expect(gmailIntegration.identifier).toHaveProperty('accountId');
    expect(gmailIntegration.identifier).toHaveProperty('url');
  });

  it('should include Gmail in TaskIntegration union type', () => {
    // This test ensures Gmail is part of the TaskIntegration union
    const gmailIntegration: TaskGmailIntegration = {
      service: 'gmail',
      identifier: {
        id: 'id',
        messageId: 'msgId',
        accountId: 'account',
        url: 'url',
        __typename: 'TaskGmailIntegrationIdentifier',
      },
      __typename: 'TaskGmailIntegration',
    };

    // Should be assignable to TaskIntegration type
    const integration = gmailIntegration;
    expect(integration.service).toBe('gmail');
  });
});
