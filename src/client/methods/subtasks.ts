/**
 * Subtask management methods
 */

import { SunsamaAuthError } from '../../errors/index.js';
import {
  CREATE_TASK_SUBTASKS_MUTATION,
  UPDATE_TASK_SUBTASK_COMPLETE_MUTATION,
  UPDATE_TASK_SUBTASK_TITLE_MUTATION,
  UPDATE_TASK_SUBTASK_UNCOMPLETE_MUTATION,
} from '../../queries/index.js';
import type {
  CreateTaskSubtasksInput,
  GraphQLRequest,
  UpdateTaskPayload,
  UpdateTaskSubtaskCompleteInput,
  UpdateTaskSubtaskTitleInput,
  UpdateTaskSubtaskUncompleteInput,
} from '../../types/index.js';
import { SunsamaClientBase } from '../base.js';
import { TaskUpdateMethods } from './task-updates.js';

export abstract class SubtaskMethods extends TaskUpdateMethods {
  /**
   * Creates subtasks for a task
   *
   * This registers new subtask IDs with the parent task. After calling this,
   * use updateSubtaskTitle to set the title for each subtask.
   *
   * @param taskId - The parent task ID
   * @param subtaskIds - Array of subtask IDs to register (24-char hex MongoDB ObjectId format)
   * @param limitResponsePayload - Whether to limit response size (defaults to true)
   * @returns The update result with success status and optionally the updated task
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * // Create subtasks with auto-generated IDs
   * const subtaskId1 = SunsamaClient.generateTaskId();
   * const subtaskId2 = SunsamaClient.generateTaskId();
   * await client.createSubtasks('parentTaskId', [subtaskId1, subtaskId2]);
   *
   * // Then set their titles
   * await client.updateSubtaskTitle('parentTaskId', subtaskId1, 'First subtask');
   * await client.updateSubtaskTitle('parentTaskId', subtaskId2, 'Second subtask');
   * ```
   */
  async createSubtasks(
    taskId: string,
    subtaskIds: string[],
    limitResponsePayload = true
  ): Promise<UpdateTaskPayload> {
    const variables: CreateTaskSubtasksInput = {
      taskId,
      addedSubtaskIds: subtaskIds,
      limitResponsePayload,
    };

    const request: GraphQLRequest<{ input: CreateTaskSubtasksInput }> = {
      operationName: 'createTaskSubtasks',
      variables: { input: variables },
      query: CREATE_TASK_SUBTASKS_MUTATION,
    };

    const response = await this.graphqlRequest<
      { createTaskSubtasks: UpdateTaskPayload },
      { input: CreateTaskSubtasksInput }
    >(request);

    if (!response.data) {
      throw new SunsamaAuthError('No response data received');
    }

    return response.data.createTaskSubtasks;
  }

  /**
   * Updates a subtask's title
   *
   * @param taskId - The parent task ID
   * @param subtaskId - The subtask ID to update
   * @param title - The new subtask title
   * @returns The update result with success status and optionally the updated task
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * // Update subtask title
   * await client.updateSubtaskTitle('parentTaskId', 'subtaskId', 'Buy milk');
   * ```
   */
  async updateSubtaskTitle(
    taskId: string,
    subtaskId: string,
    title: string
  ): Promise<UpdateTaskPayload> {
    const variables: UpdateTaskSubtaskTitleInput = {
      taskId,
      subtaskId,
      title,
      addedSubtaskIds: [],
    };

    const request: GraphQLRequest<{ input: UpdateTaskSubtaskTitleInput }> = {
      operationName: 'updateTaskSubtaskTitle',
      variables: { input: variables },
      query: UPDATE_TASK_SUBTASK_TITLE_MUTATION,
    };

    const response = await this.graphqlRequest<
      { updateTaskSubtaskTitle: UpdateTaskPayload },
      { input: UpdateTaskSubtaskTitleInput }
    >(request);

    if (!response.data) {
      throw new SunsamaAuthError('No response data received');
    }

    return response.data.updateTaskSubtaskTitle;
  }

  /**
   * Marks a subtask as complete
   *
   * @param taskId - The parent task ID
   * @param subtaskId - The subtask ID to mark as complete
   * @param completedDate - ISO 8601 timestamp when completed (optional, defaults to now)
   * @param limitResponsePayload - Whether to limit response size (defaults to true)
   * @returns The update result with success status and optionally the updated task
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * // Mark subtask as complete with current timestamp
   * await client.completeSubtask('parentTaskId', 'subtaskId');
   *
   * // Mark subtask as complete with specific timestamp
   * await client.completeSubtask('parentTaskId', 'subtaskId', '2024-01-15T10:00:00Z');
   * ```
   */
  async completeSubtask(
    taskId: string,
    subtaskId: string,
    completedDate?: string,
    limitResponsePayload = true
  ): Promise<UpdateTaskPayload> {
    const variables: UpdateTaskSubtaskCompleteInput = {
      taskId,
      subtaskId,
      completedDate: completedDate ?? new Date().toISOString(),
      limitResponsePayload,
    };

    const request: GraphQLRequest<{ input: UpdateTaskSubtaskCompleteInput }> = {
      operationName: 'updateTaskSubtaskComplete',
      variables: { input: variables },
      query: UPDATE_TASK_SUBTASK_COMPLETE_MUTATION,
    };

    const response = await this.graphqlRequest<
      { updateTaskSubtaskComplete: UpdateTaskPayload },
      { input: UpdateTaskSubtaskCompleteInput }
    >(request);

    if (!response.data) {
      throw new SunsamaAuthError('No response data received');
    }

    return response.data.updateTaskSubtaskComplete;
  }

  /**
   * Marks a subtask as incomplete (uncompletes it)
   *
   * @param taskId - The parent task ID
   * @param subtaskId - The subtask ID to mark as incomplete
   * @param limitResponsePayload - Whether to limit response size (defaults to true)
   * @returns The update result with success status and optionally the updated task
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * // Mark subtask as incomplete
   * await client.uncompleteSubtask('parentTaskId', 'subtaskId');
   * ```
   */
  async uncompleteSubtask(
    taskId: string,
    subtaskId: string,
    limitResponsePayload = true
  ): Promise<UpdateTaskPayload> {
    const variables: UpdateTaskSubtaskUncompleteInput = {
      taskId,
      subtaskId,
      limitResponsePayload,
    };

    const request: GraphQLRequest<{ input: UpdateTaskSubtaskUncompleteInput }> = {
      operationName: 'updateTaskSubtaskUncomplete',
      variables: { input: variables },
      query: UPDATE_TASK_SUBTASK_UNCOMPLETE_MUTATION,
    };

    const response = await this.graphqlRequest<
      { updateTaskSubtaskUncomplete: UpdateTaskPayload },
      { input: UpdateTaskSubtaskUncompleteInput }
    >(request);

    if (!response.data) {
      throw new SunsamaAuthError('No response data received');
    }

    return response.data.updateTaskSubtaskUncomplete;
  }

  /**
   * Convenience method to create a subtask with a title in one call
   *
   * This is a convenience wrapper around createSubtasks and updateSubtaskTitle.
   *
   * @param taskId - The parent task ID
   * @param title - The subtask title
   * @returns The subtask ID and the update result
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * // Create a subtask with title in one call
   * const { subtaskId, result } = await client.addSubtask('parentTaskId', 'Buy milk');
   * console.log('Created subtask:', subtaskId);
   *
   * // Later, mark it complete
   * await client.completeSubtask('parentTaskId', subtaskId);
   * ```
   */
  async addSubtask(
    taskId: string,
    title: string
  ): Promise<{ subtaskId: string; result: UpdateTaskPayload }> {
    const subtaskId = SunsamaClientBase.generateTaskId();

    // Step 1: Register the subtask ID
    await this.createSubtasks(taskId, [subtaskId]);

    // Step 2: Set the title
    const result = await this.updateSubtaskTitle(taskId, subtaskId, title);

    return { subtaskId, result };
  }
}
