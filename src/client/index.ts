/**
 * Main Sunsama API client
 *
 * Provides a type-safe interface to interact with all Sunsama API endpoints.
 */

import { print } from 'graphql';
import { Cookie, CookieJar } from 'tough-cookie';
import { SunsamaAuthError } from '../errors/index.js';
import {
  CREATE_TASK_MUTATION,
  GET_STREAMS_BY_GROUP_ID_QUERY,
  GET_TASKS_BACKLOG_QUERY,
  GET_TASKS_BY_DAY_QUERY,
  GET_USER_QUERY,
  UPDATE_TASK_COMPLETE_MUTATION,
  UPDATE_TASK_DELETE_MUTATION,
  UPDATE_TASK_SNOOZE_DATE_MUTATION,
} from '../queries/index.js';
import type {
  CollabSnapshot,
  CreateTaskInput,
  CreateTaskOptions,
  CreateTaskPayload,
  CreateTaskResponse,
  GetStreamsByGroupIdResponse,
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
  TaskSnooze,
  UpdateTaskCompleteInput,
  UpdateTaskDeleteInput,
  UpdateTaskPayload,
  UpdateTaskSnoozeDateInput,
  User,
} from '../types/index.js';
import { validateUpdateTaskCompleteArgs, toISOString } from '../utils/index.js';

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
    let snooze: TaskSnooze | null = null;
    if (options?.snoozeUntil) {
      const snoozeDate =
        options.snoozeUntil instanceof Date ? options.snoozeUntil : new Date(options.snoozeUntil);

      snooze = {
        userId: this.userId,
        date: now,
        until: snoozeDate.toISOString(),
        __typename: 'TaskSnooze',
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
   * Creates a collaborative editing snapshot for task notes
   *
   * @param taskId - The task ID
   * @param notes - The notes content
   * @returns CollabSnapshot object
   * @internal
   */
  private createCollabSnapshot(taskId: string, notes: string): CollabSnapshot | null {
    if (!notes) {
      return null;
    }

    // This is a simplified version - the actual encoding might be more complex
    const docName = `tasks/notes/${taskId}`;

    return {
      state: {
        version: 'v1_sv',
        docName,
        clock: 0,
        value: 'AeC61NgLAQ==', // Base64 encoded empty state
      },
      updates: [
        {
          version: 'v1',
          action: 'update',
          docName,
          clock: 0,
          value: 'AQHgutTYCwAHAQdkZWZhdWx0AwlwYXJhZ3JhcGgA', // Base64 encoded paragraph structure
        },
      ],
    };
  }

  /**
   * Moves a scheduled task to a different day
   *
   * @param taskId - The ID of the task to move
   * @param targetDate - Target date in YYYY-MM-DD format
   * @param timezone - Optional timezone for date calculation (defaults to user's timezone)
   * @returns The update result with success status
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * // Move task to tomorrow
   * const result = await client.moveTaskToDay('taskId123', '2025-06-16');
   *
   * // Move with specific timezone
   * const result = await client.moveTaskToDay('taskId123', '2025-06-16', 'America/New_York');
   * ```
   */
  async moveTaskToDay(
    taskId: string,
    targetDate: string,
    timezone?: string
  ): Promise<UpdateTaskPayload> {
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      throw new SunsamaAuthError('Invalid date format. Use YYYY-MM-DD format.');
    }

    // Validate date is actually valid and not normalized
    const dateParts = targetDate.split('-');
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

    // If timezone is provided, validate it by trying to format with it
    if (timezone) {
      try {
        new Intl.DateTimeFormat('en-US', { timeZone: timezone });
      } catch (error) {
        throw new SunsamaAuthError(`Invalid timezone: ${timezone}`);
      }
    }

    const variables: { input: UpdateTaskSnoozeDateInput } = {
      input: {
        taskId,
        newDay: targetDate,
        limitResponsePayload: true,
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
   * Moves a scheduled task back to the backlog (unschedules it)
   *
   * @param taskId - The ID of the task to move to backlog
   * @returns The update result with success status
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * // Move task to backlog
   * const result = await client.moveTaskToBacklog('taskId123');
   * ```
   */
  async moveTaskToBacklog(taskId: string): Promise<UpdateTaskPayload> {
    const variables: { input: UpdateTaskSnoozeDateInput } = {
      input: {
        taskId,
        newDay: null, // null means move to backlog
        limitResponsePayload: true,
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
   * Schedules a backlog task to a specific date
   *
   * @param taskId - The ID of the backlog task to schedule
   * @param targetDate - Target date in YYYY-MM-DD format
   * @param timezone - Optional timezone for date calculation (defaults to user's timezone)
   * @returns The update result with success status
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * // Schedule backlog task to tomorrow
   * const result = await client.scheduleBacklogTask('taskId123', '2025-06-16');
   *
   * // Schedule with specific timezone
   * const result = await client.scheduleBacklogTask('taskId123', '2025-06-16', 'America/New_York');
   * ```
   */
  async scheduleBacklogTask(
    taskId: string,
    targetDate: string,
    timezone?: string
  ): Promise<UpdateTaskPayload> {
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      throw new SunsamaAuthError('Invalid date format. Use YYYY-MM-DD format.');
    }

    // Validate date is actually valid and not normalized
    const dateParts = targetDate.split('-');
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

    // If timezone is provided, validate it by trying to format with it
    if (timezone) {
      try {
        new Intl.DateTimeFormat('en-US', { timeZone: timezone });
      } catch (error) {
        throw new SunsamaAuthError(`Invalid timezone: ${timezone}`);
      }
    }

    const variables: { input: UpdateTaskSnoozeDateInput } = {
      input: {
        taskId,
        newDay: targetDate,
        limitResponsePayload: true,
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
