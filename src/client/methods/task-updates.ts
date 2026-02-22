/**
 * Task property update methods: text, notes, planned time, due date, stream, snooze
 */

import { SunsamaAuthError, SunsamaError } from '../../errors/index.js';
import {
  UPDATE_TASK_DUE_DATE_MUTATION,
  UPDATE_TASK_NOTES_MUTATION,
  UPDATE_TASK_PLANNED_TIME_MUTATION,
  UPDATE_TASK_SNOOZE_DATE_MUTATION,
  UPDATE_TASK_STREAM_MUTATION,
  UPDATE_TASK_TEXT_MUTATION,
  UPDATE_TASKS_BACKLOG_FOLDER_MUTATION,
} from '../../queries/index.js';
import type {
  CollabSnapshot,
  GraphQLRequest,
  TaskNotesContent,
  UpdateTaskDueDateInput,
  UpdateTaskMoveToPanelPayload,
  UpdateTaskNotesInput,
  UpdateTaskNotesOptions,
  UpdateTaskPayload,
  UpdateTaskPlannedTimeInput,
  UpdateTaskSnoozeDateInput,
  UpdateTaskStreamInput,
  UpdateTaskTextInput,
  UpdateTasksBacklogFolderInput,
} from '../../types/index.js';
import { htmlToMarkdown, markdownToHtml, createUpdatedCollabSnapshot } from '../../utils/index.js';
import { TaskLifecycleMethods } from './task-lifecycle.js';

export abstract class TaskUpdateMethods extends TaskLifecycleMethods {
  /**
   * Updates a task's snooze date for scheduling operations
   *
   * This method provides a unified interface for all task scheduling operations:
   * - Schedule a task to a specific date
   * - Move a task to the backlog (unschedule)
   * - Reschedule a task from one date to another
   *
   * @param taskId - The ID of the task to reschedule
   * @param newDay - Target date in YYYY-MM-DD format, or null to move to backlog
   * @param options - Additional options for the operation
   * @returns The update result with success status
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * // Schedule a task to tomorrow
   * const result = await client.updateTaskSnoozeDate('taskId123', '2025-06-16');
   *
   * // Move a task to the backlog (unschedule)
   * const result = await client.updateTaskSnoozeDate('taskId123', null);
   *
   * // Schedule with specific timezone
   * const result = await client.updateTaskSnoozeDate('taskId123', '2025-06-16', {
   *   timezone: 'America/New_York'
   * });
   *
   * // Get full response payload instead of limited response
   * const result = await client.updateTaskSnoozeDate('taskId123', '2025-06-16', {
   *   limitResponsePayload: false
   * });
   * ```
   */
  async updateTaskSnoozeDate(
    taskId: string,
    newDay: string | null,
    options?: {
      timezone?: string;
      limitResponsePayload?: boolean;
    }
  ): Promise<UpdateTaskPayload> {
    // Validate date format if a date is provided
    if (newDay !== null) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(newDay)) {
        throw new SunsamaAuthError('Invalid date format. Use YYYY-MM-DD format.');
      }

      // Validate date is actually valid and not normalized
      const dateParts = newDay.split('-');
      if (dateParts.length !== 3) {
        throw new SunsamaAuthError('Invalid date format. Use YYYY-MM-DD format.');
      }
      const year = parseInt(dateParts[0]!, 10);
      const month = parseInt(dateParts[1]!, 10);
      const day = parseInt(dateParts[2]!, 10);

      const date = new Date(year, month - 1, day);
      if (
        isNaN(date.getTime()) ||
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
      ) {
        throw new SunsamaAuthError('Invalid date provided.');
      }
    }

    // If timezone is provided, validate it by trying to format with it
    if (options?.timezone) {
      try {
        new Intl.DateTimeFormat('en-US', { timeZone: options.timezone });
      } catch (error) {
        throw new SunsamaAuthError(`Invalid timezone: ${options.timezone}`);
      }
    }

    const variables: { input: UpdateTaskSnoozeDateInput } = {
      input: {
        taskId,
        newDay,
        limitResponsePayload: options?.limitResponsePayload ?? true,
      },
    };

    const request: GraphQLRequest = {
      operationName: 'updateTaskSnoozeDate',
      variables,
      query: UPDATE_TASK_SNOOZE_DATE_MUTATION,
    };

    const response = await this.graphqlRequest(request);

    if (!response.data) {
      throw new SunsamaAuthError('No response data received');
    }

    return (response.data as { updateTaskSnoozeDate: UpdateTaskPayload }).updateTaskSnoozeDate;
  }

  /**
   * Updates the notes of a task
   *
   * This method allows you to update task notes by providing content in either HTML or Markdown
   * format. The other format will be automatically generated using conversion utilities. It uses
   * the existing collaborative editing snapshot from the task to ensure proper synchronization
   * with the Sunsama editor.
   *
   * @param taskId - The ID of the task to update
   * @param content - The new notes content in either HTML or Markdown format
   * @param options - Additional options for the operation
   * @returns The update result with success status
   * @throws SunsamaAuthError if not authenticated, task not found, or no collaborative snapshot available
   *
   * @example
   * ```typescript
   * // Update task notes with HTML content
   * const result = await client.updateTaskNotes('taskId123', {
   *   html: '<p>Updated notes with <strong>bold</strong> text</p>'
   * });
   *
   * // Update task notes with Markdown content
   * const result = await client.updateTaskNotes('taskId123', {
   *   markdown: 'Updated notes with **bold** text'
   * });
   *
   * // Get full response payload instead of limited response
   * const result = await client.updateTaskNotes('taskId123', {
   *   html: '<p>New notes</p>'
   * }, { limitResponsePayload: false });
   *
   * // Provide a specific collaborative snapshot to use
   * const task = await client.getTaskById('taskId123');
   * const result = await client.updateTaskNotes('taskId123', {
   *   markdown: 'New notes'
   * }, { collabSnapshot: task.collabSnapshot });
   * ```
   */
  async updateTaskNotes(
    taskId: string,
    content: TaskNotesContent,
    options?: UpdateTaskNotesOptions
  ): Promise<UpdateTaskPayload> {
    // Convert content to both HTML and Markdown formats
    let notes: string;
    let notesMarkdown: string;

    if ('html' in content) {
      // HTML provided, convert to Markdown
      notes = content.html;
      notesMarkdown = htmlToMarkdown(content.html);
    } else {
      // Markdown provided, convert to HTML
      notesMarkdown = content.markdown;
      notes = markdownToHtml(content.markdown);
    }

    let collabSnapshot: CollabSnapshot;

    if (options?.collabSnapshot) {
      // Use the provided collaborative snapshot
      collabSnapshot = createUpdatedCollabSnapshot(options.collabSnapshot, notesMarkdown);
    } else {
      // Fetch the task to get its collaborative snapshot
      const existingTask = await this.getTaskById(taskId);

      if (!existingTask) {
        throw new SunsamaAuthError(`Task with ID ${taskId} not found`);
      }

      if (!existingTask.collabSnapshot) {
        throw new SunsamaAuthError(
          `Task ${taskId} does not have a collaborative snapshot. Cannot update notes for a task without existing collaborative editing state.`
        );
      }

      // Use the existing collaborative snapshot from the task
      collabSnapshot = createUpdatedCollabSnapshot(existingTask.collabSnapshot, notesMarkdown);
    }

    const variables: { input: UpdateTaskNotesInput } = {
      input: {
        taskId,
        notes,
        notesMarkdown,
        editorVersion: 3,
        collabSnapshot,
        limitResponsePayload: options?.limitResponsePayload ?? true,
      },
    };

    const request: GraphQLRequest = {
      operationName: 'updateTaskNotes',
      variables,
      query: UPDATE_TASK_NOTES_MUTATION,
    };

    const response = await this.graphqlRequest(request);

    if (!response.data) {
      throw new SunsamaAuthError('No response data received');
    }

    return (response.data as { updateTaskNotes: UpdateTaskPayload }).updateTaskNotes;
  }

  /**
   * Updates the planned time (time estimate) for a task
   *
   * This method allows you to update the time estimate for a task in minutes.
   * The time estimate represents how long you expect the task to take.
   *
   * @param taskId - The ID of the task to update
   * @param timeEstimateMinutes - The planned time in minutes (will be converted to seconds for the API)
   * @param limitResponsePayload - Whether to limit the response payload size (defaults to true)
   * @returns The update result with success status
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * // Set task time estimate to 30 minutes
   * const result = await client.updateTaskPlannedTime('taskId123', 30);
   *
   * // Set time estimate with full response payload
   * const result = await client.updateTaskPlannedTime('taskId123', 45, false);
   *
   * // Clear time estimate (set to 0)
   * const result = await client.updateTaskPlannedTime('taskId123', 0);
   * ```
   */
  async updateTaskPlannedTime(
    taskId: string,
    timeEstimateMinutes: number,
    limitResponsePayload = true
  ): Promise<UpdateTaskPayload> {
    // Convert minutes to seconds for the API
    const timeInSeconds = timeEstimateMinutes * 60;

    const variables: { input: UpdateTaskPlannedTimeInput } = {
      input: {
        taskId,
        timeInSeconds,
        limitResponsePayload,
      },
    };

    const request: GraphQLRequest = {
      operationName: 'updateTaskPlannedTime',
      variables,
      query: UPDATE_TASK_PLANNED_TIME_MUTATION,
    };

    const response = await this.graphqlRequest(request);

    if (!response.data) {
      throw new SunsamaAuthError('No response data received');
    }

    return (response.data as { updateTaskPlannedTime: UpdateTaskPayload }).updateTaskPlannedTime;
  }

  /**
   * Updates the due date for a task
   *
   * This method allows you to set or clear a task's due date. The due date represents
   * when the task should be completed and can be used for deadline tracking and planning.
   *
   * @param taskId - The ID of the task to update
   * @param dueDate - The due date as Date, ISO string, or null to clear the due date
   * @param limitResponsePayload - Whether to limit the response payload size (defaults to true)
   * @returns The update result with success status
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * // Set task due date to a specific date
   * const result = await client.updateTaskDueDate('taskId123', new Date('2025-06-21'));
   *
   * // Set due date with ISO string
   * const result = await client.updateTaskDueDate('taskId123', '2025-06-21T04:00:00.000Z');
   *
   * // Clear the due date
   * const result = await client.updateTaskDueDate('taskId123', null);
   *
   * // Get full response payload instead of limited response
   * const result = await client.updateTaskDueDate('taskId123', new Date('2025-06-21'), false);
   * ```
   */
  async updateTaskDueDate(
    taskId: string,
    dueDate: Date | string | null,
    limitResponsePayload = true
  ): Promise<UpdateTaskPayload> {
    // Convert Date to ISO string if needed
    let dueDateString: string | null = null;
    if (dueDate !== null) {
      if (dueDate instanceof Date) {
        dueDateString = dueDate.toISOString();
      } else {
        dueDateString = dueDate;
      }
    }

    const variables: { input: UpdateTaskDueDateInput } = {
      input: {
        taskId,
        dueDate: dueDateString,
        limitResponsePayload,
      },
    };

    const request: GraphQLRequest = {
      operationName: 'updateTaskDueDate',
      variables,
      query: UPDATE_TASK_DUE_DATE_MUTATION,
    };

    const response = await this.graphqlRequest(request);

    if (!response.data) {
      throw new SunsamaAuthError('No response data received');
    }

    return (response.data as { updateTaskDueDate: UpdateTaskPayload }).updateTaskDueDate;
  }

  /**
   * Updates the text/title of a task
   *
   * This method allows you to update the main text or title of a task. You can optionally
   * specify a recommended stream ID for the task.
   *
   * @param taskId - The ID of the task to update
   * @param text - The new text/title for the task
   * @param options - Additional options for the operation
   * @returns The update result with success status
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * // Update task text to a new title
   * const result = await client.updateTaskText('taskId123', 'Updated task title');
   *
   * // Update with recommended stream ID
   * const result = await client.updateTaskText('taskId123', 'Task with stream', {
   *   recommendedStreamId: 'stream-id-123'
   * });
   *
   * // Get full response payload instead of limited response
   * const result = await client.updateTaskText('taskId123', 'New title', {
   *   limitResponsePayload: false
   * });
   * ```
   */
  async updateTaskText(
    taskId: string,
    text: string,
    options?: {
      recommendedStreamId?: string | null;
      limitResponsePayload?: boolean;
    }
  ): Promise<UpdateTaskPayload> {
    const variables: { input: UpdateTaskTextInput } = {
      input: {
        taskId,
        text,
        recommendedStreamId: options?.recommendedStreamId || null,
        limitResponsePayload: options?.limitResponsePayload ?? true,
      },
    };

    const request: GraphQLRequest = {
      operationName: 'updateTaskText',
      variables,
      query: UPDATE_TASK_TEXT_MUTATION,
    };

    const response = await this.graphqlRequest(request);

    if (!response.data) {
      throw new SunsamaAuthError('No response data received');
    }

    return (response.data as { updateTaskText: UpdateTaskPayload }).updateTaskText;
  }

  /**
   * Updates the stream assignment for a task
   *
   * This method allows you to assign a task to a specific stream (project/category).
   * A stream represents a project, area of focus, or organizational category in Sunsama.
   *
   * @param taskId - The ID of the task to update
   * @param streamId - The ID of the stream to assign the task to
   * @param limitResponsePayload - Whether to limit the response payload size (defaults to true)
   * @returns The update result with success status
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * // Assign task to a specific stream
   * const result = await client.updateTaskStream('taskId123', 'streamId456');
   *
   * // Get full response payload instead of limited response
   * const result = await client.updateTaskStream('taskId123', 'streamId456', false);
   * ```
   */
  async updateTaskStream(
    taskId: string,
    streamId: string,
    limitResponsePayload = true
  ): Promise<UpdateTaskPayload> {
    const variables: { input: UpdateTaskStreamInput } = {
      input: {
        taskId,
        streamId,
        limitResponsePayload,
      },
    };

    const request: GraphQLRequest = {
      operationName: 'updateTaskStream',
      variables,
      query: UPDATE_TASK_STREAM_MUTATION,
    };

    const response = await this.graphqlRequest(request);

    if (!response.data) {
      throw new SunsamaAuthError('No response data received');
    }

    return (response.data as { updateTaskStream: UpdateTaskPayload }).updateTaskStream;
  }

  /**
   * Updates the backlog folder assignment for one or more tasks
   *
   * This method moves tasks into a specific backlog folder or removes them from
   * their current folder. It operates on multiple tasks at once.
   *
   * @param taskIds - Array of task IDs to update
   * @param folderId - The folder ID to move tasks into, or null to remove from folder
   * @returns The bulk update result with the array of updated task IDs
   * @throws SunsamaError if no response data is received
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * // Move tasks into a folder
   * const result = await client.updateTasksBacklogFolder(
   *   ['taskId1', 'taskId2'],
   *   'folderId123'
   * );
   *
   * // Remove tasks from their folder
   * const result = await client.updateTasksBacklogFolder(
   *   ['taskId1', 'taskId2'],
   *   null
   * );
   * ```
   */
  async updateTasksBacklogFolder(
    taskIds: string[],
    folderId: string | null
  ): Promise<UpdateTaskMoveToPanelPayload> {
    const variables: { input: UpdateTasksBacklogFolderInput } = {
      input: {
        taskIds,
        folderId,
      },
    };

    const request: GraphQLRequest<{ input: UpdateTasksBacklogFolderInput }> = {
      operationName: 'updateTasksBacklogFolder',
      variables,
      query: UPDATE_TASKS_BACKLOG_FOLDER_MUTATION,
    };

    const response = await this.graphqlRequest<
      { updateTasksBacklogFolder: UpdateTaskMoveToPanelPayload },
      { input: UpdateTasksBacklogFolderInput }
    >(request);

    if (!response.data) {
      throw new SunsamaError('No response data received');
    }

    return response.data.updateTasksBacklogFolder;
  }
}
