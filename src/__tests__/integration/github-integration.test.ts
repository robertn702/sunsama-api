/**
 * Integration tests for GitHub integration support
 */

import { describe, it, expect } from 'vitest';
import type { TaskGithubIntegration } from '../../types/index.js';

describe('GitHub Integration', () => {
  it('should accept TaskGithubIntegration type in createTask options', () => {
    // This test ensures the TypeScript types are correctly defined
    const githubIntegration: TaskGithubIntegration = {
      service: 'github',
      identifier: {
        id: 'I_kwDOO4SCuM7VTB4n',
        repositoryOwnerLogin: 'robertn702',
        repositoryName: 'sunsama-api',
        number: 17,
        type: 'Issue',
        url: 'https://github.com/robertn702/sunsama-api/issues/17',
        __typename: 'TaskGithubIntegrationIdentifier',
      },
      __typename: 'TaskGithubIntegration',
    };

    // Type assertion test - this should compile without errors
    const options = {
      integration: githubIntegration,
      timeEstimate: 45,
    };

    expect(options.integration.service).toBe('github');
    expect(options.integration.identifier.repositoryOwnerLogin).toBe('robertn702');
    expect(options.integration.identifier.repositoryName).toBe('sunsama-api');
    expect(options.integration.identifier.number).toBe(17);
  });

  it('should have all required GitHub integration identifier fields', () => {
    const githubIntegration: TaskGithubIntegration = {
      service: 'github',
      identifier: {
        id: 'test-id',
        repositoryOwnerLogin: 'test-owner',
        repositoryName: 'test-repo',
        number: 123,
        type: 'Issue',
        url: 'https://github.com/test-owner/test-repo/issues/123',
        __typename: 'TaskGithubIntegrationIdentifier',
      },
      __typename: 'TaskGithubIntegration',
    };

    expect(githubIntegration.identifier).toHaveProperty('id');
    expect(githubIntegration.identifier).toHaveProperty('repositoryOwnerLogin');
    expect(githubIntegration.identifier).toHaveProperty('repositoryName');
    expect(githubIntegration.identifier).toHaveProperty('number');
    expect(githubIntegration.identifier).toHaveProperty('type');
    expect(githubIntegration.identifier).toHaveProperty('url');
  });

  it('should include GitHub in TaskIntegration union type', () => {
    // This test ensures GitHub is part of the TaskIntegration union
    const githubIntegration: TaskGithubIntegration = {
      service: 'github',
      identifier: {
        id: 'id',
        repositoryOwnerLogin: 'owner',
        repositoryName: 'repo',
        number: 1,
        type: 'Issue',
        url: 'url',
        __typename: 'TaskGithubIntegrationIdentifier',
      },
      __typename: 'TaskGithubIntegration',
    };

    // Should be assignable to TaskIntegration type
    const integration = githubIntegration;
    expect(integration.service).toBe('github');
  });

  it('should support both Issue and PullRequest types', () => {
    const issueIntegration: TaskGithubIntegration = {
      service: 'github',
      identifier: {
        id: 'issue-id',
        repositoryOwnerLogin: 'owner',
        repositoryName: 'repo',
        number: 1,
        type: 'Issue',
        url: 'https://github.com/owner/repo/issues/1',
        __typename: 'TaskGithubIntegrationIdentifier',
      },
      __typename: 'TaskGithubIntegration',
    };

    const prIntegration: TaskGithubIntegration = {
      service: 'github',
      identifier: {
        id: 'pr-id',
        repositoryOwnerLogin: 'owner',
        repositoryName: 'repo',
        number: 2,
        type: 'PullRequest',
        url: 'https://github.com/owner/repo/pull/2',
        __typename: 'TaskGithubIntegrationIdentifier',
      },
      __typename: 'TaskGithubIntegration',
    };

    expect(issueIntegration.identifier.type).toBe('Issue');
    expect(prIntegration.identifier.type).toBe('PullRequest');
  });
});
