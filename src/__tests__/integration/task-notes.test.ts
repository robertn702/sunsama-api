/**
 * Integration tests for task notes operations
 *
 * Tests all operations related to task notes including:
 * - Creating tasks with notes
 * - Adding notes to existing tasks
 * - Updating existing notes
 * - Clearing notes
 * - Various note formats (HTML, Markdown, plain text)
 * - Special characters and edge cases
 *
 * This test suite validates the fix for issue #14:
 * https://github.com/robertn702/sunsama-api/issues/14
 *
 * Setup:
 * 1. Create a .env file in the project root with:
 *    SUNSAMA_EMAIL=your-email@example.com
 *    SUNSAMA_PASSWORD=your-password
 * 2. Run this test: pnpm test:integration
 */

import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SunsamaClient } from '../../client/index.js';

// Skip these tests if credentials are not available
const hasCredentials = process.env['SUNSAMA_EMAIL'] && process.env['SUNSAMA_PASSWORD'];

describe.skipIf(!hasCredentials)('Task Notes Operations (Integration Tests)', () => {
  let client: SunsamaClient;
  const createdTaskIds: string[] = [];

  beforeAll(async () => {
    if (!hasCredentials) {
      console.log('Skipping integration tests - credentials not found in .env file');
      return;
    }

    // Create client and login
    client = new SunsamaClient();
    const email = process.env['SUNSAMA_EMAIL']!;
    const password = process.env['SUNSAMA_PASSWORD']!;

    await client.login(email, password);
  });

  afterAll(async () => {
    if (!hasCredentials || !client) return;

    // Clean up all created tasks
    // Uncomment to enable cleanup:
    for (const taskId of createdTaskIds) {
      try {
        await client.deleteTask(taskId);
      } catch (error) {
        console.error(`Failed to delete task ${taskId}:`, error);
      }
    }

    // Logout
    client.logout();
  });

  describe('Creating tasks with initial notes', () => {
    it('should create a task with plain text notes', async () => {
      const taskId = SunsamaClient.generateTaskId();
      createdTaskIds.push(taskId);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const notesContent = 'Initial notes added during task creation';

      const createResult = await client.createTask(`Test Initial Notes - ${timestamp}`, {
        taskId,
        notes: notesContent,
      });

      expect(createResult.success).toBe(true);

      // Retrieve and verify notes were set during creation
      const retrievedTask = await client.getTaskById(taskId);

      expect(retrievedTask).not.toBeNull();
      expect(retrievedTask!.notes).toBeDefined();
      expect(retrievedTask!.notes).not.toBeNull();
      expect(retrievedTask!.notes).not.toBe('');
      expect(retrievedTask!.notes).toContain(notesContent);
    });

    it('should create a task with HTML notes', async () => {
      const taskId = SunsamaClient.generateTaskId();
      createdTaskIds.push(taskId);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const htmlNotes = '<p>Task notes with <strong>HTML</strong> formatting</p>';

      const createResult = await client.createTask(`Test HTML Initial Notes - ${timestamp}`, {
        taskId,
        notes: htmlNotes,
      });

      expect(createResult.success).toBe(true);

      const retrievedTask = await client.getTaskById(taskId);

      expect(retrievedTask).not.toBeNull();
      expect(retrievedTask!.notes).toBeDefined();
      expect(retrievedTask!.notes).toContain('HTML');
      expect(retrievedTask!.notes).toContain('formatting');
    });

    it('should create a task with multiline notes', async () => {
      const taskId = SunsamaClient.generateTaskId();
      createdTaskIds.push(taskId);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const multilineNotes = `Line 1: Project overview
Line 2: Requirements
Line 3: Deadline information`;

      const createResult = await client.createTask(`Test Multiline Initial Notes - ${timestamp}`, {
        taskId,
        notes: multilineNotes,
      });

      expect(createResult.success).toBe(true);

      const retrievedTask = await client.getTaskById(taskId);

      expect(retrievedTask).not.toBeNull();
      expect(retrievedTask!.notes).toContain('Line 1');
      expect(retrievedTask!.notes).toContain('Line 2');
      expect(retrievedTask!.notes).toContain('Line 3');
    });
  });

  describe('Adding notes to existing tasks', () => {
    it('should add plain text notes to a task created without notes', async () => {
      const taskId = SunsamaClient.generateTaskId();
      createdTaskIds.push(taskId);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const notesContent = 'Check all open PRs in the main repository';

      // Step 1: Create task WITHOUT notes
      const createResult = await client.createTask(`Test Add Notes - ${timestamp}`, {
        taskId,
        timeEstimate: 30,
      });

      expect(createResult.success).toBe(true);

      // Step 2: Add notes using updateTaskNotes
      const updateResult = await client.updateTaskNotes(taskId, { html: notesContent });
      expect(updateResult.success).toBe(true);

      // Step 3: Retrieve and verify notes
      const retrievedTask = await client.getTaskById(taskId);

      expect(retrievedTask).not.toBeNull();
      expect(retrievedTask!.notes).toBeDefined();
      expect(retrievedTask!.notes).not.toBeNull();
      expect(retrievedTask!.notes).not.toBe('');
      expect(retrievedTask!.notes).toContain(notesContent);
    });

    it('should add HTML notes to an existing task', async () => {
      const taskId = SunsamaClient.generateTaskId();
      createdTaskIds.push(taskId);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const htmlNotes = '<p>This is a <strong>formatted</strong> note with HTML</p>';

      // Create task without notes
      const createResult = await client.createTask(`Test Add HTML Notes - ${timestamp}`, {
        taskId,
      });

      expect(createResult.success).toBe(true);

      // Add HTML notes using updateTaskNotes
      const updateResult = await client.updateTaskNotes(taskId, { html: htmlNotes });
      expect(updateResult.success).toBe(true);

      // Verify HTML notes
      const retrievedTask = await client.getTaskById(taskId);

      expect(retrievedTask).not.toBeNull();
      expect(retrievedTask!.notes).toBeDefined();
      expect(retrievedTask!.notes).not.toBeNull();
      expect(retrievedTask!.notes).not.toBe('');
      expect(retrievedTask!.notes).toContain('formatted');
      // Check that formatting is preserved (either as HTML tags or markdown)
      const hasFormatting =
        retrievedTask!.notes.includes('strong') ||
        retrievedTask!.notes.includes('**') ||
        retrievedTask!.notes.includes('<b>') ||
        retrievedTask!.notes.includes('__');
      expect(hasFormatting).toBe(true);
    });

    it('should add notes using markdown format', async () => {
      const taskId = SunsamaClient.generateTaskId();
      createdTaskIds.push(taskId);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const markdownNotes = 'This is **bold** and this is *italic* text';

      // Create task without notes
      const createResult = await client.createTask(`Test Markdown Notes - ${timestamp}`, {
        taskId,
      });

      expect(createResult.success).toBe(true);

      // Add markdown notes using updateTaskNotes
      const updateResult = await client.updateTaskNotes(taskId, { markdown: markdownNotes });
      expect(updateResult.success).toBe(true);

      // Verify notes contain the expected content
      const retrievedTask = await client.getTaskById(taskId);

      expect(retrievedTask).not.toBeNull();
      expect(retrievedTask!.notes).toBeDefined();
      expect(retrievedTask!.notes).not.toBe('');
      expect(retrievedTask!.notesMarkdown).toContain('bold');
      expect(retrievedTask!.notesMarkdown).toContain('italic');
    });
  });

  describe('Updating existing notes', () => {
    it('should update existing notes with new content', async () => {
      const taskId = SunsamaClient.generateTaskId();
      createdTaskIds.push(taskId);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const initialNotes = 'Original notes content';
      const updatedNotes = 'Updated notes content with new information';

      // Create task with initial notes
      const createResult = await client.createTask(`Test Update Notes - ${timestamp}`, {
        taskId,
        notes: initialNotes,
      });

      expect(createResult.success).toBe(true);

      // Update notes
      const updateResult = await client.updateTaskNotes(taskId, { html: updatedNotes });
      expect(updateResult.success).toBe(true);

      // Verify notes were updated
      const retrievedTask = await client.getTaskById(taskId);

      expect(retrievedTask).not.toBeNull();
      expect(retrievedTask!.notes).toContain(updatedNotes);
      expect(retrievedTask!.notes).not.toContain('Original notes content');
    });

    it('should update notes multiple times consecutively', async () => {
      const taskId = SunsamaClient.generateTaskId();
      createdTaskIds.push(taskId);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      // Create task
      const createResult = await client.createTask(`Test Multiple Updates - ${timestamp}`, {
        taskId,
      });

      expect(createResult.success).toBe(true);

      // First update
      await client.updateTaskNotes(taskId, { html: 'First update' });
      let task = await client.getTaskById(taskId);
      expect(task!.notes).toContain('First update');

      // Second update
      await client.updateTaskNotes(taskId, { html: 'Second update' });
      task = await client.getTaskById(taskId);
      expect(task!.notes).toContain('Second update');
      expect(task!.notes).not.toContain('First update');

      // Third update
      await client.updateTaskNotes(taskId, { html: 'Third update' });
      task = await client.getTaskById(taskId);
      expect(task!.notes).toContain('Third update');
      expect(task!.notes).not.toContain('Second update');
    });

    it('should replace notes with minimal content', async () => {
      const taskId = SunsamaClient.generateTaskId();
      createdTaskIds.push(taskId);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      // Create task with notes
      const createResult = await client.createTask(`Test Replace Notes - ${timestamp}`, {
        taskId,
        notes: 'These notes will be replaced with minimal content',
      });

      expect(createResult.success).toBe(true);

      // Verify notes exist
      let task = await client.getTaskById(taskId);
      expect(task!.notes).toContain('These notes will be replaced');

      // Replace notes with minimal content
      // Note: Empty string is not allowed by HTML validation, so use minimal actual content
      const minimalContent = '-';
      await client.updateTaskNotes(taskId, { html: minimalContent });

      // Verify notes were replaced
      task = await client.getTaskById(taskId);
      expect(task!.notes).not.toContain('These notes will be replaced');
      // Notes should be minimal (single dash)
      expect(task!.notes).toContain('-');
      expect(task!.notes!.length).toBeLessThan(20);
    });
  });

  describe('Edge cases and special scenarios', () => {
    it('should handle notes with special characters and emojis', async () => {
      const taskId = SunsamaClient.generateTaskId();
      createdTaskIds.push(taskId);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const specialNotes = 'Notes with émojis 🚀 and special chars: @#$%^&*() <tag>';

      // Create task without notes
      const createResult = await client.createTask(`Test Special Chars - ${timestamp}`, {
        taskId,
      });

      expect(createResult.success).toBe(true);

      // Add notes with special characters
      const updateResult = await client.updateTaskNotes(taskId, { html: specialNotes });
      expect(updateResult.success).toBe(true);

      // Verify special characters are preserved
      const retrievedTask = await client.getTaskById(taskId);

      expect(retrievedTask).not.toBeNull();
      expect(retrievedTask!.notes).toBeDefined();
      expect(retrievedTask!.notes).not.toBe('');
      expect(retrievedTask!.notes).toContain('émojis');
      expect(retrievedTask!.notes).toContain('🚀');
      // Special characters may be HTML-encoded (e.g., & becomes &amp;)
      const hasSpecialChars =
        retrievedTask!.notes.includes('@#$%^&*()') || retrievedTask!.notes.includes('&amp;');
      expect(hasSpecialChars).toBe(true);
    });

    it('should handle long notes content', async () => {
      const taskId = SunsamaClient.generateTaskId();
      createdTaskIds.push(taskId);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      // Create a long note (500+ characters)
      const longNotes =
        `This is a very long note that tests the system's ability to handle large amounts of text. `.repeat(
          10
        );

      const createResult = await client.createTask(`Test Long Notes - ${timestamp}`, {
        taskId,
        notes: longNotes,
      });

      expect(createResult.success).toBe(true);

      const retrievedTask = await client.getTaskById(taskId);

      expect(retrievedTask).not.toBeNull();
      expect(retrievedTask!.notes).toBeDefined();
      expect(retrievedTask!.notes!.length).toBeGreaterThan(500);
      expect(retrievedTask!.notes).toContain('very long note');
    });

    it('should handle tasks created without notes (null/empty)', async () => {
      const taskId = SunsamaClient.generateTaskId();
      createdTaskIds.push(taskId);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      // Create task without notes option
      const createResult = await client.createTask(`Test No Notes - ${timestamp}`, {
        taskId,
        timeEstimate: 15,
      });

      expect(createResult.success).toBe(true);

      // Retrieve and verify notes is null or empty
      const retrievedTask = await client.getTaskById(taskId);

      expect(retrievedTask).not.toBeNull();
      // Notes should be null or empty string when not provided
      expect(retrievedTask!.notes === null || retrievedTask!.notes === '').toBe(true);
    });

    it('should preserve notes when updating other task properties', async () => {
      const taskId = SunsamaClient.generateTaskId();
      createdTaskIds.push(taskId);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const notesContent = 'These notes should remain unchanged';

      // Create task with notes
      const createResult = await client.createTask(`Test Preserve Notes - ${timestamp}`, {
        taskId,
        notes: notesContent,
        timeEstimate: 30,
      });

      expect(createResult.success).toBe(true);

      // Update task time estimate (not notes)
      await client.updateTaskPlannedTime(taskId, 45);

      // Verify notes are still intact
      const retrievedTask = await client.getTaskById(taskId);

      expect(retrievedTask).not.toBeNull();
      expect(retrievedTask!.notes).toContain(notesContent);
      expect(retrievedTask!.timeEstimate).toBe(45);
    });
  });

  describe('Notes format interoperability', () => {
    it('should correctly convert between HTML and Markdown formats', async () => {
      const taskId = SunsamaClient.generateTaskId();
      createdTaskIds.push(taskId);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      // Create task
      const createResult = await client.createTask(`Test Format Conversion - ${timestamp}`, {
        taskId,
      });

      expect(createResult.success).toBe(true);

      // Add notes as HTML
      const htmlContent = '<p>This is <strong>bold</strong> text</p>';
      await client.updateTaskNotes(taskId, { html: htmlContent });

      let task = await client.getTaskById(taskId);
      expect(task!.notes).toBeDefined();
      expect(task!.notesMarkdown).toBeDefined();

      // Update notes as Markdown
      const markdownContent = 'This is **bold** text';
      await client.updateTaskNotes(taskId, { markdown: markdownContent });

      task = await client.getTaskById(taskId);
      expect(task!.notes).toBeDefined();
      expect(task!.notesMarkdown).toContain('bold');
    });
  });
});
