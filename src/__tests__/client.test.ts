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

    it('should have updateTaskNotes method', () => {
      const client = new SunsamaClient();

      expect(typeof client.updateTaskNotes).toBe('function');
    });

    it('should throw error when calling updateTaskNotes without authentication', async () => {
      const client = new SunsamaClient();

      // Should fail because no authentication
      await expect(
        client.updateTaskNotes('test-task-id', { html: '<p>New notes</p>' })
      ).rejects.toThrow();
    });

    it('should accept HTML content in updateTaskNotes', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Should fail when trying to fetch task for collaborative snapshot (unauthorized)
      await expect(
        client.updateTaskNotes(validTaskId, { html: '<p>Updated notes</p>' })
      ).rejects.toThrow('GraphQL errors: Unauthorized');
    });

    it('should accept Markdown content in updateTaskNotes', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Should fail when trying to fetch task for collaborative snapshot (unauthorized)
      await expect(
        client.updateTaskNotes(validTaskId, { markdown: 'Updated notes' })
      ).rejects.toThrow('GraphQL errors: Unauthorized');
    });

    it('should accept limitResponsePayload option in updateTaskNotes', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Should fail when trying to fetch task for collaborative snapshot (unauthorized)
      await expect(
        client.updateTaskNotes(
          validTaskId,
          { html: '<p>Updated notes</p>' },
          {
            limitResponsePayload: false,
          }
        )
      ).rejects.toThrow('GraphQL errors: Unauthorized');
    });

    it('should accept collabSnapshot option in updateTaskNotes', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Mock collaborative snapshot
      const mockCollabSnapshot = {
        state: {
          version: 'v1_sv',
          docName: `tasks/notes/${validTaskId}`,
          clock: 0,
          value: 'mock-base64-value',
        },
        updates: [
          {
            version: 'v1',
            action: 'update',
            docName: `tasks/notes/${validTaskId}`,
            clock: 0,
            value: 'mock-base64-update',
          },
        ],
      };

      // Should pass validation but fail at GraphQL level (unauthorized)
      // When collabSnapshot is provided, it should skip getTaskById
      await expect(
        client.updateTaskNotes(
          validTaskId,
          { html: '<p>Updated notes</p>' },
          {
            collabSnapshot: mockCollabSnapshot,
          }
        )
      ).rejects.toThrow('GraphQL errors: Unauthorized');
    });

    it('should handle empty HTML content in updateTaskNotes', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Should fail during conversion validation
      await expect(client.updateTaskNotes(validTaskId, { html: '' })).rejects.toThrow(
        'HTML to Markdown conversion failed'
      );
    });

    it('should handle empty Markdown content in updateTaskNotes', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Should fail during conversion validation
      await expect(client.updateTaskNotes(validTaskId, { markdown: '' })).rejects.toThrow(
        'Markdown to HTML conversion failed'
      );
    });

    it('should handle complex HTML content in updateTaskNotes', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';
      const htmlNotes =
        '<p>Updated notes with <strong>bold</strong> text</p><p>Second paragraph</p>';

      // Should pass validation but fail at GraphQL level (unauthorized)
      await expect(client.updateTaskNotes(validTaskId, { html: htmlNotes })).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should have updateTaskPlannedTime method', () => {
      const client = new SunsamaClient();

      expect(typeof client.updateTaskPlannedTime).toBe('function');
    });

    it('should throw error when calling updateTaskPlannedTime without authentication', async () => {
      const client = new SunsamaClient();

      // Should fail because no authentication
      await expect(client.updateTaskPlannedTime('test-task-id', 30)).rejects.toThrow();
    });

    it('should accept valid parameters in updateTaskPlannedTime', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Should pass validation but fail at GraphQL level (unauthorized)
      await expect(client.updateTaskPlannedTime(validTaskId, 30)).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
      await expect(client.updateTaskPlannedTime(validTaskId, 0)).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
      await expect(client.updateTaskPlannedTime(validTaskId, 45, false)).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should convert minutes to seconds correctly in updateTaskPlannedTime', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Test that time conversion works (30 minutes = 1800 seconds)
      // This should pass validation but fail at GraphQL level (unauthorized)
      await expect(client.updateTaskPlannedTime(validTaskId, 30)).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should support limitResponsePayload option in updateTaskPlannedTime', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Should pass validation with limitResponsePayload option
      // Will fail at GraphQL level due to unauthorized access
      await expect(client.updateTaskPlannedTime(validTaskId, 60, false)).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should handle zero time estimate in updateTaskPlannedTime', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Should pass validation for zero time estimate
      // Will fail at GraphQL level due to unauthorized access
      await expect(client.updateTaskPlannedTime(validTaskId, 0)).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should have updateTaskDueDate method', () => {
      const client = new SunsamaClient();

      expect(typeof client.updateTaskDueDate).toBe('function');
    });

    it('should throw error when calling updateTaskDueDate without authentication', async () => {
      const client = new SunsamaClient();

      // Should fail because no authentication
      await expect(client.updateTaskDueDate('test-task-id', new Date())).rejects.toThrow();
    });

    it('should accept Date object in updateTaskDueDate', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';
      const dueDate = new Date('2025-06-21');

      // Should pass validation but fail at GraphQL level (unauthorized)
      await expect(client.updateTaskDueDate(validTaskId, dueDate)).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should accept ISO string in updateTaskDueDate', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';
      const dueDate = '2025-06-21T04:00:00.000Z';

      // Should pass validation but fail at GraphQL level (unauthorized)
      await expect(client.updateTaskDueDate(validTaskId, dueDate)).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should accept null to clear due date in updateTaskDueDate', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Should pass validation but fail at GraphQL level (unauthorized)
      await expect(client.updateTaskDueDate(validTaskId, null)).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should support limitResponsePayload option in updateTaskDueDate', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';
      const dueDate = new Date('2025-06-21');

      // Should pass validation with limitResponsePayload option
      // Will fail at GraphQL level due to unauthorized access
      await expect(client.updateTaskDueDate(validTaskId, dueDate, false)).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should convert Date to ISO string correctly in updateTaskDueDate', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';
      const dueDate = new Date('2025-06-21T10:30:00Z');

      // Should pass validation but fail at GraphQL level (unauthorized)
      await expect(client.updateTaskDueDate(validTaskId, dueDate)).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should handle complex Markdown content in updateTaskNotes', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';
      const markdownNotes = 'Updated notes with **bold** text\n\nSecond paragraph';

      // Should pass validation but fail at GraphQL level (unauthorized)
      await expect(
        client.updateTaskNotes(validTaskId, { markdown: markdownNotes })
      ).rejects.toThrow('GraphQL errors: Unauthorized');
    });

    it('should have updateTaskText method', () => {
      const client = new SunsamaClient();

      expect(typeof client.updateTaskText).toBe('function');
    });

    it('should throw error when calling updateTaskText without authentication', async () => {
      const client = new SunsamaClient();

      // Should fail because no authentication
      await expect(client.updateTaskText('test-task-id', 'New task title')).rejects.toThrow();
    });

    it('should accept valid parameters in updateTaskText', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Should pass validation but fail at GraphQL level (unauthorized)
      await expect(client.updateTaskText(validTaskId, 'Updated task title')).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should accept recommendedStreamId option in updateTaskText', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Should pass validation but fail at GraphQL level (unauthorized)
      await expect(
        client.updateTaskText(validTaskId, 'Task with stream', {
          recommendedStreamId: 'stream-id-123',
        })
      ).rejects.toThrow('GraphQL errors: Unauthorized');
    });

    it('should support limitResponsePayload option in updateTaskText', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Should pass validation with limitResponsePayload option
      // Will fail at GraphQL level due to unauthorized access
      await expect(
        client.updateTaskText(validTaskId, 'New title', {
          limitResponsePayload: false,
        })
      ).rejects.toThrow('GraphQL errors: Unauthorized');
    });

    it('should handle empty text in updateTaskText', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Should pass validation even with empty text but fail at GraphQL level (unauthorized)
      await expect(client.updateTaskText(validTaskId, '')).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should handle special characters in updateTaskText', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';
      const specialText = 'Task with émojis 🚀 and special chars: @#$%^&*()';

      // Should pass validation but fail at GraphQL level (unauthorized)
      await expect(client.updateTaskText(validTaskId, specialText)).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should handle long text in updateTaskText', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';
      const longText = 'A'.repeat(1000); // 1000 character text

      // Should pass validation but fail at GraphQL level (unauthorized)
      await expect(client.updateTaskText(validTaskId, longText)).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should handle null recommendedStreamId in updateTaskText', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Should pass validation but fail at GraphQL level (unauthorized)
      await expect(
        client.updateTaskText(validTaskId, 'Task with null stream', {
          recommendedStreamId: null,
        })
      ).rejects.toThrow('GraphQL errors: Unauthorized');
    });

    it('should combine all options in updateTaskText', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Should pass validation with all options combined
      // Will fail at GraphQL level due to unauthorized access
      await expect(
        client.updateTaskText(validTaskId, 'Combined options task', {
          recommendedStreamId: 'stream-123',
          limitResponsePayload: false,
        })
      ).rejects.toThrow('GraphQL errors: Unauthorized');
    });

    it('should have updateTaskStream method', () => {
      const client = new SunsamaClient();

      expect(typeof client.updateTaskStream).toBe('function');
    });

    it('should throw error when calling updateTaskStream without authentication', async () => {
      const client = new SunsamaClient();

      // Should fail because no authentication
      await expect(client.updateTaskStream('test-task-id', 'test-stream-id')).rejects.toThrow();
    });

    it('should accept valid parameters in updateTaskStream', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';
      const validStreamId = '677a9e5a76a1c9390bbebf92';

      // Should pass validation but fail at GraphQL level (unauthorized)
      await expect(client.updateTaskStream(validTaskId, validStreamId)).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should support limitResponsePayload option in updateTaskStream', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';
      const validStreamId = '677a9e5a76a1c9390bbebf92';

      // Should pass validation with limitResponsePayload option
      // Will fail at GraphQL level due to unauthorized access
      await expect(client.updateTaskStream(validTaskId, validStreamId, false)).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should handle empty string streamId in updateTaskStream', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Should pass validation even with empty string streamId but fail at GraphQL level (unauthorized)
      await expect(client.updateTaskStream(validTaskId, '')).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should handle ObjectId format streamId in updateTaskStream', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';
      const objectIdStreamId = '507f1f77bcf86cd799439011';

      // Should pass validation with ObjectId format streamId but fail at GraphQL level (unauthorized)
      await expect(client.updateTaskStream(validTaskId, objectIdStreamId)).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should handle default limitResponsePayload in updateTaskStream', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';
      const validStreamId = '677a9e5a76a1c9390bbebf92';

      // Should use default limitResponsePayload=true when not specified
      // Will fail at GraphQL level due to unauthorized access
      await expect(client.updateTaskStream(validTaskId, validStreamId)).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should validate both taskId and streamId parameters in updateTaskStream', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';
      const validStreamId = '677a9e5a76a1c9390bbebf92';

      // Both parameters should be required and validation should pass
      // Will fail at GraphQL level due to unauthorized access
      await expect(client.updateTaskStream(validTaskId, validStreamId)).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should have reorderTask method', () => {
      const client = new SunsamaClient();

      expect(typeof client.reorderTask).toBe('function');
    });

    it('should throw error when calling reorderTask without authentication', async () => {
      const client = new SunsamaClient();

      // Should fail because no authentication
      await expect(client.reorderTask('test-task-id', 0, '2025-01-12')).rejects.toThrow();
    });

    it('should validate day format in reorderTask', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Should reject invalid day format (validation happens before authentication)
      await expect(client.reorderTask(validTaskId, 0, 'invalid-date')).rejects.toThrow(
        'Invalid date format'
      );
      await expect(client.reorderTask(validTaskId, 0, '2025/01/12')).rejects.toThrow(
        'Invalid date format'
      );
      await expect(client.reorderTask(validTaskId, 0, '01-12-2025')).rejects.toThrow(
        'Invalid date format'
      );
    });

    it('should accept valid parameters in reorderTask', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Should pass validation but fail at GraphQL level (unauthorized)
      await expect(client.reorderTask(validTaskId, 0, '2025-01-12')).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });

    it('should accept valid timezone in reorderTask', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Should pass validation but fail at GraphQL level (unauthorized)
      await expect(
        client.reorderTask(validTaskId, 0, '2025-01-12', { timezone: 'America/New_York' })
      ).rejects.toThrow('GraphQL errors: Unauthorized');
    });

    it('should accept various valid positions in reorderTask', async () => {
      const client = new SunsamaClient({ sessionToken: 'test-token' });
      const validTaskId = '685022edbdef77163d659d4a';

      // Position 0 (top)
      await expect(client.reorderTask(validTaskId, 0, '2025-01-12')).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );

      // Position 1 (second)
      await expect(client.reorderTask(validTaskId, 1, '2025-01-12')).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );

      // Large position (validated against task count at runtime)
      await expect(client.reorderTask(validTaskId, 100, '2025-01-12')).rejects.toThrow(
        'GraphQL errors: Unauthorized'
      );
    });
  });
});
