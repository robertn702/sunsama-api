/**
 * Main Sunsama API client
 *
 * Provides a type-safe interface to interact with all Sunsama API endpoints.
 */

import { print } from 'graphql';
import { Cookie, CookieJar } from 'tough-cookie';
import * as Y from 'yjs';
import { SunsamaAuthError } from '../errors/index.js';
import {
  CREATE_TASK_MUTATION,
  GET_ARCHIVED_TASKS_QUERY,
  GET_STREAMS_BY_GROUP_ID_QUERY,
  GET_TASK_BY_ID_QUERY,
  GET_TASKS_BACKLOG_QUERY,
  GET_TASKS_BY_DAY_QUERY,
  GET_USER_QUERY,
  UPDATE_TASK_COMPLETE_MUTATION,
  UPDATE_TASK_DELETE_MUTATION,
  UPDATE_TASK_NOTES_MUTATION,
  UPDATE_TASK_PLANNED_TIME_MUTATION,
  UPDATE_TASK_SNOOZE_DATE_MUTATION,
  UPDATE_TASK_DUE_DATE_MUTATION,
} from '../queries/index.js';
import type {
  CollabSnapshot,
  CreateTaskInput,
  CreateTaskOptions,
  CreateTaskPayload,
  CreateTaskResponse,
  GetArchivedTasksInput,
  GetArchivedTasksResponse,
  GetStreamsByGroupIdResponse,
  GetTaskByIdInput,
  GetTaskByIdResponse,
  GetTasksBacklogInput,
  GetTasksBacklogResponse,
  GetTasksByDayInput,
  GetTasksByDayResponse,
  GetUserResponse,
  GraphQLRequest,
  GraphQLResponse,
  RequestOptions,
  Stream,
  SunsamaClientConfig,
  Task,
  TaskInput,
  TaskNotesContent,
  TaskSnoozeInput,
  UpdateTaskCompleteInput,
  UpdateTaskDeleteInput,
  UpdateTaskNotesInput,
  UpdateTaskNotesOptions,
  UpdateTaskPayload,
  UpdateTaskPlannedTimeInput,
  UpdateTaskSnoozeDateInput,
  UpdateTaskDueDateInput,
  User,
} from '../types/index.js';
import {
  validateUpdateTaskCompleteArgs,
  toISOString,
  htmlToMarkdown,
  markdownToHtml,
} from '../utils/index.js';

/**
 * Main Sunsama API client class
 *
 * Provides a type-safe interface to interact with all Sunsama API endpoints.
 */
export class SunsamaClient {
  private static readonly BASE_URL = 'https://api.sunsama.com';

  private readonly config: SunsamaClientConfig;
  private readonly cookieJar: CookieJar;
  private userId?: string;
  private groupId?: string;
  private timezone?: string;

  /**
   * Creates a new Sunsama client instance
   *
   * @param config - Client configuration options (optional)
   */
  constructor(config: SunsamaClientConfig = {}) {
    this.config = config;
    this.cookieJar = new CookieJar();

    // If a session token is provided, set it as a cookie
    if (config.sessionToken) {
      this.setSessionTokenAsCookie(config.sessionToken);
    }
  }

  /**
   * Gets the current client configuration
   */
  getConfig(): SunsamaClientConfig {
    return { ...this.config };
  }

  /**
   * Checks if the client is authenticated
   *
   * @returns True if cookies are present in the jar
   */
  async isAuthenticated(): Promise<boolean> {
    const cookies = await this.cookieJar.getCookies(SunsamaClient.BASE_URL);
    return cookies.some(cookie => cookie.key === 'sunsamaSession');
  }

  /**
   * Authenticates with email and password
   *
   * @param email - User email address
   * @param password - User password
   * @throws SunsamaAuthError if login fails
   */
  async login(email: string, password: string): Promise<void> {
    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);

    try {
      // For login, we need to handle redirects manually to capture the session cookie
      const loginUrl = `${SunsamaClient.BASE_URL}/account/login/email`;

      // Get cookies from jar for this URL
      const cookies = await this.cookieJar.getCookies(loginUrl);
      const headers: HeadersInit = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Origin: 'https://app.sunsama.com',
      };

      if (cookies.length > 0) {
        headers['Cookie'] = cookies.map(cookie => cookie.cookieString()).join('; ');
      }

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers,
        body: formData.toString(),
        redirect: 'manual', // Don't follow redirects automatically
      });

      // For login, we expect a 302 redirect on success
      if (response.status !== 302) {
        const responseText = await response.text();
        throw new SunsamaAuthError(
          `Login failed: ${response.status} ${response.statusText}. Response: ${responseText}`
        );
      }

      // Extract and store cookies from response
      const setCookieHeader = response.headers.get('set-cookie');
      if (!setCookieHeader) {
        // Debug: print all response headers
        const allHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          allHeaders[key] = value;
        });
        throw new SunsamaAuthError(
          `No session cookie received from login. Response headers: ${JSON.stringify(allHeaders, null, 2)}`
        );
      }

      // Store the cookie in the jar
      try {
        const loginUrl = `${SunsamaClient.BASE_URL}/account/login/email`;
        await this.cookieJar.setCookie(setCookieHeader, loginUrl);
      } catch (error) {
        throw new SunsamaAuthError(
          `Failed to store session cookie: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    } catch (error) {
      if (error instanceof SunsamaAuthError) {
        throw error;
      }
      throw new SunsamaAuthError(
        `Login request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Clears all cookies from the jar and cached user data
   */
  logout(): void {
    this.cookieJar.removeAllCookiesSync();
    this.userId = undefined;
    this.groupId = undefined;
    this.timezone = undefined;
  }

  /**
   * Makes an authenticated request to the Sunsama API
   *
   * @param path - The API endpoint path (e.g., '/tasks')
   * @param options - Request options
   * @returns The response from the API
   * @internal
   */
  private async request(path: string, options: RequestOptions): Promise<Response> {
    const url = `${SunsamaClient.BASE_URL}${path}`;

    // Build headers
    const headers: HeadersInit = {
      Origin: 'https://app.sunsama.com',
      ...options.headers,
    };

    // Get cookies from jar for this URL
    const cookies = await this.cookieJar.getCookies(url);
    if (cookies.length > 0) {
      headers['Cookie'] = cookies.map(cookie => cookie.cookieString()).join('; ');
    }

    // Build query string if params provided
    let fullUrl = url;
    if (options.params) {
      const params = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      fullUrl = `${url}?${params.toString()}`;
    }

    // Process request body
    let body: string | undefined;
    if (options.body instanceof URLSearchParams) {
      body = options.body.toString();
    } else if (options.body) {
      body = JSON.stringify(options.body);
    }

    // Make the request
    return await fetch(fullUrl, {
      method: options.method,
      headers,
      body,
    });
  }

  /**
   * Makes a GraphQL request to the Sunsama API
   *
   * @param request - The GraphQL request
   * @returns The GraphQL response
   * @internal
   */
  private async graphqlRequest<T, TVariables = Record<string, unknown>>(
    request: GraphQLRequest<TVariables>
  ): Promise<GraphQLResponse<T>> {
    // Convert DocumentNode to string if needed
    const queryString = typeof request.query === 'string' ? request.query : print(request.query);

    const requestBody = {
      ...request,
      query: queryString,
    };

    const response = await this.request('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(request.operationName && { 'x-gql-operation-name': request.operationName }),
      },
      body: requestBody,
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new SunsamaAuthError(
        `GraphQL request failed: ${response.status} ${response.statusText}. Response: ${responseText}`
      );
    }

    const result = (await response.json()) as GraphQLResponse<T>;

    if (result.errors && result.errors.length > 0) {
      throw new SunsamaAuthError(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
    }

    return result;
  }

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
   * // Get a task by ID
   * const task = await client.getTaskById('685022edbdef77163d659d4a');
   *
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
    const taskId = options?.taskId || SunsamaClient.generateTaskId();

    // Generate timestamps
    const now = new Date().toISOString();

    // Build collaborative editing snapshot for notes
    const collabSnapshot = this.createCollabSnapshot(taskId, options?.notes || '');

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
      integration: null,
      deleted: false,
      text,
      notes: options?.notes || '',
      notesMarkdown: null,
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

  /**
   * Generates a unique task ID in MongoDB ObjectId format
   *
   * This method creates a 24-character hexadecimal string following MongoDB ObjectId conventions:
   * - First 8 chars: Unix timestamp (4 bytes)
   * - Next 10 chars: Random value (5 bytes)
   * - Last 6 chars: Incrementing counter (3 bytes)
   *
   * @returns A 24-character hexadecimal string compatible with Sunsama's task ID format
   * @example
   * ```typescript
   * const taskId = SunsamaClient.generateTaskId();
   * console.log(taskId); // "507f1f77bcf86cd799439011"
   * ```
   */
  public static generateTaskId(): string {
    // Get current timestamp (4 bytes = 8 hex chars)
    const timestamp = Math.floor(Date.now() / 1000);
    const timestampHex = timestamp.toString(16).padStart(8, '0');

    // Generate random value (5 bytes = 10 hex chars)
    const randomValue = SunsamaClient.getRandomValue();

    // Generate counter (3 bytes = 6 hex chars) - increment for each ID generation
    const counter = SunsamaClient.getNextCounter();
    const counterHex = counter.toString(16).padStart(6, '0');

    return timestampHex + randomValue + counterHex;
  }

  private static _counter = Math.floor(Math.random() * 0xffffff);

  /**
   * Gets a random value for ObjectId generation (5 bytes = 10 hex chars)
   * @internal
   */
  private static getRandomValue(): string {
    // Generate 5 random bytes for the random portion
    const randomBytes = new Uint8Array(5);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(randomBytes);
    } else {
      // Fallback for Node.js environments
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const cryptoModule = require('crypto');
      const buffer = cryptoModule.randomBytes(5);
      randomBytes.set(buffer);
    }

    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Gets the next counter value for ID generation (3 bytes = 6 hex chars)
   * @internal
   */
  private static getNextCounter(): number {
    SunsamaClient._counter = (SunsamaClient._counter + 1) % 0xffffff;
    return SunsamaClient._counter;
  }

  /**
   * Creates a collaborative editing snapshot for task notes using Yjs
   *
   * This method creates a proper Yjs document with the provided notes content
   * and encodes it as a collaborative snapshot that can be used for real-time
   * collaborative editing in Sunsama.
   *
   * @param taskId - The task ID
   * @param notes - The notes content to initialize the document with
   * @returns CollabSnapshot object with Yjs-generated state, or null if no notes
   * @internal
   */
  private createCollabSnapshot(taskId: string, notes: string): CollabSnapshot | null {
    if (!notes) {
      return null;
    }

    const docName = `tasks/notes/${taskId}`;

    // Create a new Yjs document
    const ydoc = new Y.Doc();

    // Create a Y.Text instance for the notes content
    const ytext = ydoc.getText('notes');

    // Insert the initial notes content
    ytext.insert(0, notes);

    // Encode the document state as an update
    const stateUpdate = Y.encodeStateAsUpdate(ydoc);
    const base64State = Buffer.from(stateUpdate).toString('base64');

    // Create the collaborative snapshot in the expected format
    return {
      state: {
        version: 'v1_sv',
        docName,
        clock: 0,
        value: base64State,
      },
      updates: [
        {
          version: 'v1',
          action: 'update',
          docName,
          clock: 0,
          value: base64State,
        },
      ],
    };
  }

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
   * This method allows you to update task notes by providing content in either HTML or Markdown format.
   * The other format will be automatically generated using conversion utilities. It uses the existing
   * collaborative editing snapshot from the task to ensure proper synchronization with the Sunsama editor.
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
      collabSnapshot = this.createUpdatedCollabSnapshot(options.collabSnapshot, notesMarkdown);
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
      collabSnapshot = this.createUpdatedCollabSnapshot(existingTask.collabSnapshot, notesMarkdown);
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
   * Creates an updated collaborative editing snapshot based on existing state
   *
   * This method takes an existing collaborative snapshot and creates a new one
   * with the updated content, properly handling the Yjs document state and
   * incrementing version clocks.
   *
   * @param existingSnapshot - The existing collaborative snapshot
   * @param newContent - The new content to apply
   * @returns Updated CollabSnapshot object
   * @internal
   */
  private createUpdatedCollabSnapshot(
    existingSnapshot: CollabSnapshot,
    newContent: string
  ): CollabSnapshot {
    // Create a new Yjs document
    const ydoc = new Y.Doc();

    try {
      // Try to apply the existing state if possible
      if (existingSnapshot.state.value) {
        const existingState = Buffer.from(existingSnapshot.state.value, 'base64');
        Y.applyUpdate(ydoc, existingState);
      }
    } catch (error) {
      // If we can't apply the existing state, start fresh
      // Could not apply existing collaborative state, creating fresh document
      // eslint-disable-next-line no-console
      console.warn('Could not apply existing collaborative state, creating fresh document:', error);
    }

    // Get the text instance and update it with new content
    const ytext = ydoc.getText('notes');

    // Clear existing content and insert new content
    if (ytext.length > 0) {
      ytext.delete(0, ytext.length);
    }
    if (newContent) {
      ytext.insert(0, newContent);
    }

    // Encode the updated document state
    const updatedState = Y.encodeStateAsUpdate(ydoc);
    const base64State = Buffer.from(updatedState).toString('base64');

    // Increment the clock for proper versioning
    const newClock = existingSnapshot.state.clock + 1;

    return {
      state: {
        ...existingSnapshot.state,
        clock: newClock,
        value: base64State,
      },
      updates: [
        ...existingSnapshot.updates,
        {
          version: 'v1',
          action: 'update',
          docName: existingSnapshot.state.docName,
          clock: newClock,
          value: base64State,
        },
      ],
    };
  }

  /**
   * Sets a session token as a cookie in the jar
   *
   * @param token - The session token to set
   * @internal
   */
  private setSessionTokenAsCookie(token: string): void {
    try {
      const cookie = new Cookie({
        key: 'sunsamaSession',
        value: token,
        domain: 'api.sunsama.com',
        path: '/',
        httpOnly: true,
        secure: true,
      });

      this.cookieJar.setCookieSync(cookie, SunsamaClient.BASE_URL);
    } catch (error) {
      // Silently fail if cookie cannot be set
      // Note: Error intentionally ignored to avoid breaking authentication flow
    }
  }
}
