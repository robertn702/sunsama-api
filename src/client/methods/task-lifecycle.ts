/**
 * Task lifecycle methods: create, delete, complete, and uncomplete
 */

import { SunsamaAuthError, SunsamaError } from '../../errors/index.js';
import {
  CREATE_TASK_MUTATION,
  UPDATE_TASK_COMPLETE_MUTATION,
  UPDATE_TASK_DELETE_MUTATION,
  UPDATE_TASK_UNCOMPLETE_MUTATION,
} from '../../queries/index.js';
import type {
  CreateTaskInput,
  CreateTaskOptions,
  CreateTaskPayload,
  CreateTaskResponse,
  GraphQLRequest,
  TaskInput,
  TaskSnoozeInput,
  UpdateTaskCompleteInput,
  UpdateTaskDeleteInput,
  UpdateTaskPayload,
  UpdateTaskUncompleteInput,
} from '../../types/index.js';
import {
  validateUpdateTaskCompleteArgs,
  toISOString,
  htmlToMarkdown,
  createCollabSnapshot,
} from '../../utils/index.js';
import { SunsamaClientBase } from '../base.js';
import { UserMethods } from './user.js';

export abstract class TaskLifecycleMethods extends UserMethods {
  /**
   * Marks a task as complete
   *
   * @param taskId - The ID of the task to mark as complete
   * @param completeOn - The date/time when the task was completed (defaults to current time)
   * @param limitResponsePayload - Whether to limit the response payload size (defaults to true)
   * @returns The update result with success status and optionally the updated task
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * // Mark a task as complete with current timestamp
   * const result = await client.updateTaskComplete('taskId');
   *
   * // Mark complete with specific timestamp
   * const result = await client.updateTaskComplete('taskId', '2025-01-15T10:30:00Z');
   *
   * // Get full task details in response
   * const result = await client.updateTaskComplete('taskId', new Date(), false);
   * ```
   */
  async updateTaskComplete(
    taskId: string,
    completeOn?: Date | string,
    limitResponsePayload = true
  ): Promise<UpdateTaskPayload> {
    // Validate arguments using Zod
    const validatedArgs = validateUpdateTaskCompleteArgs({
      taskId,
      completeOn,
      limitResponsePayload,
    });

    // Convert Date to ISO string if needed
    const completeOnString = validatedArgs.completeOn
      ? toISOString(validatedArgs.completeOn)
      : new Date().toISOString();

    const variables: UpdateTaskCompleteInput = {
      taskId: validatedArgs.taskId,
      completeOn: completeOnString,
      limitResponsePayload: validatedArgs.limitResponsePayload,
    };

    const request: GraphQLRequest<{ input: UpdateTaskCompleteInput }> = {
      operationName: 'updateTaskComplete',
      variables: { input: variables },
      query: UPDATE_TASK_COMPLETE_MUTATION,
    };

    const response = await this.graphqlRequest<
      { updateTaskComplete: UpdateTaskPayload },
      { input: UpdateTaskCompleteInput }
    >(request);

    if (!response.data) {
      throw new SunsamaAuthError('No response data received');
    }

    return response.data.updateTaskComplete;
  }

  /**
   * Marks a task as incomplete (uncompletes it)
   *
   * @param taskId - The ID of the task to mark as incomplete
   * @param limitResponsePayload - Whether to limit the response payload size (defaults to true)
   * @returns The update result with success status and optionally the updated task
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * // Mark a task as incomplete
   * const result = await client.updateTaskUncomplete('taskId');
   *
   * // Get full task details in response
   * const result = await client.updateTaskUncomplete('taskId', false);
   * ```
   */
  async updateTaskUncomplete(
    taskId: string,
    limitResponsePayload = true
  ): Promise<UpdateTaskPayload> {
    const variables: UpdateTaskUncompleteInput = {
      taskId,
      limitResponsePayload,
    };

    const request: GraphQLRequest<{ input: UpdateTaskUncompleteInput }> = {
      operationName: 'updateTaskUncomplete',
      variables: { input: variables },
      query: UPDATE_TASK_UNCOMPLETE_MUTATION,
    };

    const response = await this.graphqlRequest<
      { updateTaskUncomplete: UpdateTaskPayload },
      { input: UpdateTaskUncompleteInput }
    >(request);

    if (!response.data) {
      throw new SunsamaError('No response data received');
    }

    return response.data.updateTaskUncomplete;
  }

  /**
   * Deletes a task
   *
   * @param taskId - The ID of the task to delete
   * @param limitResponsePayload - Whether to limit response size (defaults to true)
   * @param wasTaskMerged - Whether the task was merged before deletion (defaults to false)
   * @returns The update result with success status
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * // Delete a task
   * const result = await client.deleteTask('taskId');
   *
   * // Delete with full response payload
   * const result = await client.deleteTask('taskId', false);
   *
   * // Delete a merged task
   * const result = await client.deleteTask('taskId', true, true);
   * ```
   */
  async deleteTask(
    taskId: string,
    limitResponsePayload = true,
    wasTaskMerged = false
  ): Promise<UpdateTaskPayload> {
    const variables: UpdateTaskDeleteInput = {
      taskId,
      limitResponsePayload,
      wasTaskMerged,
    };

    const request: GraphQLRequest<{ input: UpdateTaskDeleteInput }> = {
      operationName: 'updateTaskDelete',
      variables: { input: variables },
      query: UPDATE_TASK_DELETE_MUTATION,
    };

    const response = await this.graphqlRequest<
      { updateTaskDelete: UpdateTaskPayload },
      { input: UpdateTaskDeleteInput }
    >(request);

    if (!response.data) {
      throw new SunsamaAuthError('No response data received');
    }

    return response.data.updateTaskDelete;
  }

  /**
   * Creates a new task with flexible options
   *
   * @param text - The main text/title of the task
   * @param options - Additional task properties (including optional custom taskId)
   * @returns The created task result with success status
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * // Create a simple task (ID auto-generated)
   * const result = await client.createTask('Complete project documentation');
   *
   * // Create a task with options
   * const result = await client.createTask('Review pull requests', {
   *   notes: 'Check all open PRs in the main repository',
   *   timeEstimate: 30,
   *   streamIds: ['stream-id-1']
   * });
   *
   * // Create a task with custom ID (useful for tracking/deletion)
   * const customId = SunsamaClient.generateTaskId();
   * const result = await client.createTask('Follow up with client', {
   *   taskId: customId,
   *   snoozeUntil: new Date('2025-01-15T09:00:00')
   * });
   *
   * // Create a task from a GitHub issue
   * const result = await client.createTask('Fix API documentation bug', {
   *   integration: {
   *     service: 'github',
   *     identifier: {
   *       id: 'I_kwDOO4SCuM7VTB4n',
   *       repositoryOwnerLogin: 'robertn702',
   *       repositoryName: 'sunsama-api',
   *       number: 17,
   *       type: 'Issue',
   *       url: 'https://github.com/robertn702/sunsama-api/issues/17',
   *       __typename: 'TaskGithubIntegrationIdentifier'
   *     },
   *     __typename: 'TaskGithubIntegration'
   *   },
   *   timeEstimate: 45
   * });
   *
   * // Create a task from a Gmail email
   * const result = await client.createTask('Project Update Email', {
   *   integration: {
   *     service: 'gmail',
   *     identifier: {
   *       id: '19a830b40fd7ab7d',
   *       messageId: '19a830b40fd7ab7d',
   *       accountId: 'user@example.com',
   *       url: 'https://mail.google.com/mail/u/user@example.com/#inbox/19a830b40fd7ab7d',
   *       __typename: 'TaskGmailIntegrationIdentifier'
   *     },
   *     __typename: 'TaskGmailIntegration'
   *   },
   *   timeEstimate: 15
   * });
   * ```
   */
  async createTask(text: string, options?: CreateTaskOptions): Promise<CreateTaskPayload> {
    // Ensure we have user context
    if (!this.userId || !this.groupId) {
      await this.getUser();
    }

    if (!this.userId || !this.groupId) {
      throw new SunsamaAuthError('Unable to determine user ID or group ID');
    }

    // Use provided task ID or generate a new one
    const taskId = options?.taskId || SunsamaClientBase.generateTaskId();

    // Generate timestamps
    const now = new Date().toISOString();

    // Handle notes conversion - convert HTML to Markdown
    const notesHtml = options?.notes || '';
    const notesMarkdown = notesHtml ? htmlToMarkdown(notesHtml) : '';

    // Build collaborative editing snapshot for notes (using markdown)
    const collabSnapshot = createCollabSnapshot(taskId, notesMarkdown);

    // Handle snooze configuration
    let snooze: TaskSnoozeInput | null = null;
    if (options?.snoozeUntil) {
      const snoozeDate =
        options.snoozeUntil instanceof Date ? options.snoozeUntil : new Date(options.snoozeUntil);

      snooze = {
        userId: this.userId,
        date: now,
        until: snoozeDate.toISOString(),
      };
    }

    // Handle due date
    let dueDate: string | null = null;
    if (options?.dueDate) {
      dueDate = options.dueDate instanceof Date ? options.dueDate.toISOString() : options.dueDate;
    }

    // Build the complete task input
    const taskInput: TaskInput = {
      _id: taskId,
      groupId: this.groupId,
      taskType: 'outcomes',
      streamIds: options?.streamIds || [],
      recommendedStreamId: null,
      eventInfo: null,
      seededEventIds: null,
      private: options?.private || false,
      assigneeId: this.userId,
      createdBy: this.userId,
      integration: options?.integration || null,
      deleted: false,
      text,
      notes: notesHtml,
      notesMarkdown: notesMarkdown || null,
      notesChecksum: null,
      editorVersion: 3,
      collabSnapshot,
      completed: false,
      completedBy: null,
      completeDate: null,
      completeOn: null,
      archivedAt: null,
      duration: null,
      runDate: null,
      snooze,
      timeHorizon: null,
      dueDate,
      comments: [],
      orderings: [],
      backlogOrderings: [],
      subtasks: [],
      subtasksCollapsed: null,
      sequence: null,
      followers: [],
      recommendedTimeEstimate: null,
      timeEstimate: options?.timeEstimate || null,
      actualTime: [],
      scheduledTime: [],
      createdAt: now,
      lastModified: now,
      objectiveId: null,
      ritual: null,
    };

    const variables: CreateTaskInput = {
      task: taskInput,
      groupId: this.groupId,
      position: undefined,
    };

    const request: GraphQLRequest<CreateTaskInput> = {
      operationName: 'createTask',
      variables,
      query: CREATE_TASK_MUTATION,
    };

    const response = await this.graphqlRequest<CreateTaskResponse, CreateTaskInput>(request);

    if (!response.data) {
      throw new SunsamaAuthError('No response data received');
    }

    return response.data.createTaskV2;
  }
}
