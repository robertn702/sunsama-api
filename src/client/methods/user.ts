/**
 * User, stream, and task query methods
 */

import { SunsamaAuthError } from '../../errors/index.js';
import {
  GET_ARCHIVED_TASKS_QUERY,
  GET_STREAMS_BY_GROUP_ID_QUERY,
  GET_TASK_BY_ID_QUERY,
  GET_TASKS_BACKLOG_BUCKETED_QUERY,
  GET_TASKS_BACKLOG_QUERY,
  GET_TASKS_BY_DAY_QUERY,
  GET_USER_QUERY,
} from '../../queries/index.js';
import type {
  GetArchivedTasksInput,
  GetArchivedTasksResponse,
  GetStreamsByGroupIdResponse,
  GetTaskByIdInput,
  GetTaskByIdResponse,
  GetTasksBacklogBucketedInput,
  GetTasksBacklogBucketedOptions,
  GetTasksBacklogBucketedResponse,
  GetTasksBacklogInput,
  GetTasksBacklogResponse,
  GetTasksByDayInput,
  GetTasksByDayResponse,
  GetUserResponse,
  GraphQLRequest,
  Stream,
  Task,
  TasksBacklogBucketedResult,
  User,
} from '../../types/index.js';
import { SunsamaClientBase } from '../base.js';

export abstract class UserMethods extends SunsamaClientBase {
  /**
   * Gets the current user information
   *
   * @returns The current user data
   * @throws SunsamaAuthError if not authenticated or request fails
   */
  async getUser(): Promise<User> {
    const request: GraphQLRequest<Record<string, never>> = {
      operationName: 'getUser',
      variables: {},
      query: GET_USER_QUERY,
    };

    const response = await this.graphqlRequest<GetUserResponse, Record<string, never>>(request);

    if (!response.data) {
      throw new SunsamaAuthError('No user data received');
    }

    const user = response.data.currentUser;

    // Cache user ID, group ID, and timezone for future requests
    this.userId = user._id;
    this.groupId = user.primaryGroup?.groupId;
    this.timezone = user.profile.timezone;

    return user;
  }

  /**
   * Gets the user's timezone
   *
   * @returns The user's timezone string (e.g., "America/New_York")
   * @throws SunsamaAuthError if not authenticated or request fails
   */
  async getUserTimezone(): Promise<string> {
    // Use cached timezone if available, otherwise fetch user data
    if (!this.timezone) {
      await this.getUser();
    }

    if (!this.timezone) {
      throw new SunsamaAuthError(
        'Unable to determine timezone from user data. User profile.timezone is required.'
      );
    }

    return this.timezone;
  }

  /**
   * Gets streams for the user's group
   *
   * @returns Array of streams for the user's group
   * @throws SunsamaAuthError if not authenticated or request fails
   */
  async getStreamsByGroupId(): Promise<Stream[]> {
    // Use cached values if available, otherwise fetch user data
    if (!this.groupId) {
      await this.getUser();
    }

    if (!this.groupId) {
      throw new SunsamaAuthError(
        'Unable to determine group ID from user data. User primaryGroup is required.'
      );
    }

    const request: GraphQLRequest<{ groupId: string }> = {
      operationName: 'getStreamsByGroupId',
      variables: { groupId: this.groupId },
      query: GET_STREAMS_BY_GROUP_ID_QUERY,
    };

    const response = await this.graphqlRequest<GetStreamsByGroupIdResponse, { groupId: string }>(
      request
    );

    if (!response.data) {
      throw new SunsamaAuthError('No stream data received');
    }

    return response.data.streamsByGroupId;
  }

  /**
   * Gets tasks for a specific day
   *
   * @param day - ISO date string (e.g., "2025-05-31")
   * @param timezone - Timezone string (e.g., "America/New_York", defaults to user's timezone)
   * @returns Array of tasks for the specified day
   * @throws SunsamaAuthError if not authenticated or request fails
   */
  async getTasksByDay(day: string, timezone?: string): Promise<Task[]> {
    // Use cached values if available, otherwise fetch user data
    if (!this.userId || !this.groupId) {
      await this.getUser();
    }

    const userTimezone = timezone || this.timezone || 'UTC';

    if (!this.groupId) {
      throw new SunsamaAuthError(
        'Unable to determine group ID from user data. User primaryGroup is required.'
      );
    }

    const variables: GetTasksByDayInput = {
      day,
      timezone: userTimezone,
      userId: this.userId!,
      groupId: this.groupId,
    };

    const request: GraphQLRequest<{ input: GetTasksByDayInput }> = {
      operationName: 'getTasksByDay',
      variables: { input: variables },
      query: GET_TASKS_BY_DAY_QUERY,
    };

    const response = await this.graphqlRequest<
      GetTasksByDayResponse,
      { input: GetTasksByDayInput }
    >(request);

    if (!response.data) {
      throw new SunsamaAuthError('No task data received');
    }

    return response.data.tasksByDayV2;
  }

  /**
   * Gets tasks from the backlog
   *
   * @returns Array of backlog tasks
   * @throws SunsamaAuthError if not authenticated or request fails
   */
  async getTasksBacklog(): Promise<Task[]> {
    // Use cached values if available, otherwise fetch user data
    if (!this.userId || !this.groupId) {
      await this.getUser();
    }

    if (!this.groupId) {
      throw new SunsamaAuthError(
        'Unable to determine group ID from user data. User primaryGroup is required.'
      );
    }

    const variables: GetTasksBacklogInput = {
      userId: this.userId!,
      groupId: this.groupId,
    };

    const request: GraphQLRequest<GetTasksBacklogInput> = {
      operationName: 'getTasksBacklog',
      variables,
      query: GET_TASKS_BACKLOG_QUERY,
    };

    const response = await this.graphqlRequest<GetTasksBacklogResponse, GetTasksBacklogInput>(
      request
    );

    if (!response.data) {
      throw new SunsamaAuthError('No backlog data received');
    }

    return response.data.tasksBacklog;
  }

  /**
   * Gets tasks from the backlog with cursor-based pagination
   *
   * This is the paginated version of `getTasksBacklog`. It returns tasks in pages
   * with cursor-based navigation, useful for large backlogs.
   *
   * @param options - Pagination and filter options
   * @param options.first - Number of tasks to fetch (forward pagination, defaults to 30)
   * @param options.after - Cursor for forward pagination (fetch tasks after this cursor)
   * @param options.last - Number of tasks to fetch (backward pagination)
   * @param options.before - Cursor for backward pagination (fetch tasks before this cursor)
   * @param options.filter - Filter to apply to backlog tasks
   * @returns Paginated backlog result with tasks and page info
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * // Get first page of backlog tasks
   * const result = await client.getTasksBacklogBucketed();
   * console.log('Tasks:', result.tasks.length);
   * console.log('Has more:', result.pageInfo.hasNextPage);
   *
   * // Get next page using cursor
   * if (result.pageInfo.hasNextPage) {
   *   const nextPage = await client.getTasksBacklogBucketed({
   *     after: result.pageInfo.endCursor,
   *   });
   * }
   *
   * // Fetch a custom page size
   * const smallPage = await client.getTasksBacklogBucketed({ first: 10 });
   * ```
   */
  async getTasksBacklogBucketed(
    options?: GetTasksBacklogBucketedOptions
  ): Promise<TasksBacklogBucketedResult> {
    // Use cached values if available, otherwise fetch user data
    if (!this.userId || !this.groupId) {
      await this.getUser();
    }

    if (!this.groupId) {
      throw new SunsamaAuthError(
        'Unable to determine group ID from user data. User primaryGroup is required.'
      );
    }

    const variables: GetTasksBacklogBucketedInput = {
      userId: this.userId!,
      groupId: this.groupId,
      first: options?.first ?? 30,
      ...(options?.after !== undefined && { after: options.after }),
      ...(options?.last !== undefined && { last: options.last }),
      ...(options?.before !== undefined && { before: options.before }),
      ...(options?.filter !== undefined && { filter: options.filter }),
    };

    const request: GraphQLRequest<GetTasksBacklogBucketedInput> = {
      operationName: 'getTasksBacklogBucketed',
      variables,
      query: GET_TASKS_BACKLOG_BUCKETED_QUERY,
    };

    const response = await this.graphqlRequest<
      GetTasksBacklogBucketedResponse,
      GetTasksBacklogBucketedInput
    >(request);

    if (!response.data) {
      throw new SunsamaAuthError('No backlog data received');
    }

    return response.data.tasksBacklogBucketed;
  }

  /**
   * Gets archived tasks for the user
   *
   * @param offset - Pagination offset (defaults to 0)
   * @param limit - Maximum number of tasks to return (defaults to 300)
   * @returns Array of archived tasks
   * @throws SunsamaAuthError if not authenticated or request fails
   */
  async getArchivedTasks(offset = 0, limit = 300): Promise<Task[]> {
    // Use cached values if available, otherwise fetch user data
    if (!this.userId || !this.groupId) {
      await this.getUser();
    }

    if (!this.groupId) {
      throw new SunsamaAuthError(
        'Unable to determine group ID from user data. User primaryGroup is required.'
      );
    }

    const variables: { input: GetArchivedTasksInput } = {
      input: {
        userId: this.userId!,
        groupId: this.groupId,
        offset,
        limit,
      },
    };

    const request: GraphQLRequest<{ input: GetArchivedTasksInput }> = {
      operationName: 'getArchivedTasks',
      variables,
      query: GET_ARCHIVED_TASKS_QUERY,
    };

    const response = await this.graphqlRequest<
      GetArchivedTasksResponse,
      { input: GetArchivedTasksInput }
    >(request);

    if (!response.data) {
      throw new SunsamaAuthError('No archived tasks data received');
    }

    return response.data.archivedTasks;
  }

  /**
   * Gets a specific task by its ID
   *
   * @param taskId - The ID of the task to retrieve
   * @returns The task if found, null if not found
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * const task = await client.getTaskById('685022edbdef77163d659d4a');
   * if (task) {
   *   console.log('Task found:', task.text);
   * } else {
   *   console.log('Task not found');
   * }
   * ```
   */
  async getTaskById(taskId: string): Promise<Task | null> {
    // Use cached values if available, otherwise fetch user data
    if (!this.groupId) {
      await this.getUser();
    }

    if (!this.groupId) {
      throw new SunsamaAuthError(
        'Unable to determine group ID from user data. User primaryGroup is required.'
      );
    }

    const variables: GetTaskByIdInput = {
      taskId,
      groupId: this.groupId,
    };

    const request: GraphQLRequest<GetTaskByIdInput> = {
      operationName: 'getTaskById',
      variables,
      query: GET_TASK_BY_ID_QUERY,
    };

    const response = await this.graphqlRequest<GetTaskByIdResponse, GetTaskByIdInput>(request);

    if (!response.data) {
      throw new SunsamaAuthError('No response data received');
    }

    return response.data.taskById;
  }
}
