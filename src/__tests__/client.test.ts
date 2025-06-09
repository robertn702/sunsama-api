/**
 * Tests for the main Sunsama client
 */

import { describe, expect, it } from 'vitest';
import { SunsamaClient } from '../client/index.js';

describe('SunsamaClient', () => {
  describe('constructor', () => {
    it('should create a client with no configuration', async () => {
      const client = new SunsamaClient();

      expect(client).toBeInstanceOf(SunsamaClient);
      expect(client.getConfig()).toEqual({});
      expect(await client.isAuthenticated()).toBe(false);
    });

    it('should create a client with empty configuration', async () => {
      const client = new SunsamaClient({});

      expect(client).toBeInstanceOf(SunsamaClient);
      expect(client.getConfig()).toEqual({});
      expect(await client.isAuthenticated()).toBe(false);
    });

    it('should create a client with session token configuration', async () => {
      const client = new SunsamaClient({
        sessionToken: 'test-session-token',
      });

      expect(client).toBeInstanceOf(SunsamaClient);
      expect(client.getConfig()).toEqual({
        sessionToken: 'test-session-token',
      });
      expect(await client.isAuthenticated()).toBe(true);
    });

    it('should have authentication methods', () => {
      const client = new SunsamaClient();

      expect(typeof client.isAuthenticated).toBe('function');
      expect(typeof client.login).toBe('function');
      expect(typeof client.logout).toBe('function');
    });

    it('should not be authenticated by default', async () => {
      const client = new SunsamaClient();

      expect(await client.isAuthenticated()).toBe(false);
    });

    it('should have logout method', () => {
      const client = new SunsamaClient();

      // Just verify logout method exists and can be called
      expect(() => client.logout()).not.toThrow();
    });

    it('should have login method that makes API call', async () => {
      const client = new SunsamaClient();

      // Note: Actual login will fail without valid credentials
      // This test just verifies the method exists and attempts the request
      await expect(client.login('test@example.com', 'password')).rejects.toThrow();
    });

    it('should have getUser method', () => {
      const client = new SunsamaClient();

      expect(typeof client.getUser).toBe('function');
    });

    it('should throw error when calling getUser without authentication', async () => {
      const client = new SunsamaClient();

      // Should fail because no authentication
      await expect(client.getUser()).rejects.toThrow();
    });

    it('should have getTasksByDay method', () => {
      const client = new SunsamaClient();

      expect(typeof client.getTasksByDay).toBe('function');
    });

    it('should throw error when calling getTasksByDay without authentication', async () => {
      const client = new SunsamaClient();

      // Should fail because no authentication
      await expect(client.getTasksByDay('2025-01-01')).rejects.toThrow();
    });

    it('should have getTasksBacklog method', () => {
      const client = new SunsamaClient();

      expect(typeof client.getTasksBacklog).toBe('function');
    });

    it('should throw error when calling getTasksBacklog without authentication', async () => {
      const client = new SunsamaClient();

      // Should fail because no authentication
      await expect(client.getTasksBacklog()).rejects.toThrow();
    });

    it('should have getStreamsByGroupId method', () => {
      const client = new SunsamaClient();

      expect(typeof client.getStreamsByGroupId).toBe('function');
    });

    it('should throw error when calling getStreamsByGroupId without authentication', async () => {
      const client = new SunsamaClient();

      // Should fail because no authentication
      await expect(client.getStreamsByGroupId()).rejects.toThrow();
    });

    it('should have updateTaskComplete method', () => {
      const client = new SunsamaClient();

      expect(typeof client.updateTaskComplete).toBe('function');
    });

    it('should throw error when calling updateTaskComplete without authentication', async () => {
      const client = new SunsamaClient();

      // Should fail because no authentication
      await expect(client.updateTaskComplete('test-task-id')).rejects.toThrow();
    });

    it('should have createTask method', () => {
      const client = new SunsamaClient();

      expect(typeof client.createTask).toBe('function');
    });

    it('should throw error when calling createTask without authentication', async () => {
      const client = new SunsamaClient();

      // Should fail because no authentication
      await expect(client.createTask('Test task')).rejects.toThrow();
    });

    it('should have createTaskAdvanced method', () => {
      const client = new SunsamaClient();

      expect(typeof client.createTaskAdvanced).toBe('function');
    });

    it('should throw error when calling createTaskAdvanced without authentication', async () => {
      const client = new SunsamaClient();

      // Mock task input for testing
      const mockTaskInput = {
        _id: 'test-id',
        groupId: 'test-group',
        taskType: 'outcomes',
        streamIds: [],
        recommendedStreamId: null,
        eventInfo: null,
        seededEventIds: null,
        private: false,
        assigneeId: 'test-user',
        createdBy: 'test-user',
        integration: null,
        deleted: false,
        text: 'Test task',
        notes: '',
        notesMarkdown: null,
        notesChecksum: null,
        editorVersion: 3,
        collabSnapshot: null,
        completed: false,
        completedBy: null,
        completeDate: null,
        completeOn: null,
        archivedAt: null,
        duration: null,
        runDate: null,
        snooze: null,
        timeHorizon: null,
        dueDate: null,
        comments: [],
        orderings: [],
        backlogOrderings: [],
        subtasks: [],
        subtasksCollapsed: null,
        sequence: null,
        followers: [],
        recommendedTimeEstimate: null,
        timeEstimate: null,
        actualTime: [],
        scheduledTime: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        objectiveId: null,
        ritual: null,
      };

      // Should fail because no authentication
      await expect(client.createTaskAdvanced(mockTaskInput)).rejects.toThrow();
    });
  });
});
