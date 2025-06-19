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

    it('should validate taskId in updateTaskComplete', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });

      // Should fail because of invalid task ID format
      await expect(client.updateTaskComplete('invalid-id')).rejects.toThrow('Validation error');
      await expect(client.updateTaskComplete('')).rejects.toThrow('Validation error');
      await expect(client.updateTaskComplete('short')).rejects.toThrow('Validation error');
    });

    it('should validate completeOn date in updateTaskComplete', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '507f1f77bcf86cd799439011';

      // Should fail because of invalid date
      await expect(client.updateTaskComplete(validTaskId, 'invalid-date')).rejects.toThrow(
        'Validation error'
      );
    });

    it('should accept valid Date objects and ISO strings in updateTaskComplete', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '507f1f77bcf86cd799439011';

      // These should pass validation but fail at GraphQL level (unauthorized)
      await expect(client.updateTaskComplete(validTaskId, new Date())).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
      await expect(client.updateTaskComplete(validTaskId, '2025-06-15T10:30:00Z')).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
      await expect(client.updateTaskComplete(validTaskId, '2025-06-15')).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should have deleteTask method', () => {
      const client = new SunsamaClient();

      expect(typeof client.deleteTask).toBe('function');
    });

    it('should throw error when calling deleteTask without authentication', async () => {
      const client = new SunsamaClient();

      // Should fail because no authentication
      await expect(client.deleteTask('test-task-id')).rejects.toThrow();
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

    it('should have updateTaskSnoozeDate method', () => {
      const client = new SunsamaClient();

      expect(typeof client.updateTaskSnoozeDate).toBe('function');
    });

    it('should throw error when calling updateTaskSnoozeDate without authentication', async () => {
      const client = new SunsamaClient();

      // Should fail because no authentication
      await expect(client.updateTaskSnoozeDate('test-task-id', '2025-06-16')).rejects.toThrow();
      await expect(client.updateTaskSnoozeDate('test-task-id', null)).rejects.toThrow();
    });

    it('should validate date format in updateTaskSnoozeDate', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });

      // Should fail because of invalid date format
      await expect(client.updateTaskSnoozeDate('test-task-id', 'invalid-date')).rejects.toThrow(
        'Invalid date format'
      );
      await expect(client.updateTaskSnoozeDate('test-task-id', '2025/06/16')).rejects.toThrow(
        'Invalid date format'
      );
      await expect(client.updateTaskSnoozeDate('test-task-id', '06-16-2025')).rejects.toThrow(
        'Invalid date format'
      );
    });

    it('should validate date validity in updateTaskSnoozeDate', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });

      // Should fail because of invalid date
      await expect(client.updateTaskSnoozeDate('test-task-id', '2025-13-01')).rejects.toThrow(
        'Invalid date provided'
      );
      await expect(client.updateTaskSnoozeDate('test-task-id', '2025-02-30')).rejects.toThrow(
        'Invalid date provided'
      );
    });

    it('should validate timezone in updateTaskSnoozeDate', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });

      // Should fail because of invalid timezone
      await expect(
        client.updateTaskSnoozeDate('test-task-id', '2025-06-16', { timezone: 'Invalid/Timezone' })
      ).rejects.toThrow('Invalid timezone');
    });

    it('should allow null newDay for backlog operation', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });

      // Should pass validation for null newDay (move to backlog)
      // Will fail at GraphQL level due to unauthorized access
      await expect(client.updateTaskSnoozeDate('test-task-id', null)).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should support limitResponsePayload option', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });

      // Should pass validation with limitResponsePayload option
      // Will fail at GraphQL level due to unauthorized access
      await expect(
        client.updateTaskSnoozeDate('test-task-id', '2025-06-16', { limitResponsePayload: false })
      ).rejects.toThrow('GraphQL errors: Unauthorized');
    });

    it('should have getArchivedTasks method', () => {
      const client = new SunsamaClient();

      expect(typeof client.getArchivedTasks).toBe('function');
    });

    it('should throw error when calling getArchivedTasks without authentication', async () => {
      const client = new SunsamaClient();

      // Should fail because no authentication
      await expect(client.getArchivedTasks()).rejects.toThrow();
    });

    it('should accept pagination parameters in getArchivedTasks', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });

      // Should pass validation but fail at GraphQL level (unauthorized)
      await expect(client.getArchivedTasks(0, 300)).rejects.toThrow('GraphQL errors: Unauthorized');
      await expect(client.getArchivedTasks(100, 50)).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
      await expect(client.getArchivedTasks()).rejects.toThrow('GraphQL errors: Unauthorized'); // default params
    });

    it('should use default pagination values in getArchivedTasks', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });

      // Both calls should use same default values and fail the same way
      const promise1 = client.getArchivedTasks();
      const promise2 = client.getArchivedTasks(0, 300);

      await expect(promise1).rejects.toThrow('GraphQL errors: Unauthorized');
      await expect(promise2).rejects.toThrow('GraphQL errors: Unauthorized');
    });

    it('should have getTaskById method', () => {
      const client = new SunsamaClient();

      expect(typeof client.getTaskById).toBe('function');
    });

    it('should throw error when calling getTaskById without authentication', async () => {
      const client = new SunsamaClient();

      // Should fail because no authentication
      await expect(client.getTaskById('test-task-id')).rejects.toThrow();
    });

    it('should accept valid task ID in getTaskById', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Should pass validation but fail at GraphQL level (unauthorized)
      await expect(client.getTaskById(validTaskId)).rejects.toThrow('GraphQL errors: Unauthorized');
    });

    it('should handle task not found in getTaskById', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const nonExistentTaskId = '507f1f77bcf86cd799439999';

      // Should pass validation but fail at GraphQL level (unauthorized)
      await expect(client.getTaskById(nonExistentTaskId)).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });
  });
});
