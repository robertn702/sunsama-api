/**
 * Main Sunsama API client
 *
 * Provides a type-safe interface to interact with all Sunsama API endpoints.
 */

import { print } from 'graphql';
import { Cookie, CookieJar } from 'tough-cookie';
import { SunsamaAuthError } from '../errors';
import {
  CREATE_TASK_MUTATION,
  GET_STREAMS_BY_GROUP_ID_QUERY,
  GET_TASKS_BACKLOG_QUERY,
  GET_TASKS_BY_DAY_QUERY,
  GET_USER_QUERY,
  UPDATE_TASK_COMPLETE_MUTATION,
} from '../queries';
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
  UpdateTaskPayload,
  User,
} from '../types';

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
    // Convert Date to ISO string if needed
    let completeOnString: string;
    if (completeOn instanceof Date) {
      completeOnString = completeOn.toISOString();
    } else if (completeOn) {
      completeOnString = completeOn;
    } else {
      // Default to current time
      completeOnString = new Date().toISOString();
    }

    const variables: UpdateTaskCompleteInput = {
      taskId,
      completeOn: completeOnString,
      limitResponsePayload,
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
   * Creates a new task with simplified options
   *
   * @param text - The main text/title of the task
   * @param options - Additional task properties
   * @returns The created task result with success status
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * // Create a simple task
   * const result = await client.createTask('Complete project documentation');
   *
   * // Create a task with options
   * const result = await client.createTask('Review pull requests', {
   *   notes: 'Check all open PRs in the main repository',
   *   timeEstimate: 30,
   *   streamIds: ['stream-id-1']
   * });
   *
   * // Create a task with snooze
   * const result = await client.createTask('Follow up with client', {
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

    // Generate a unique task ID (similar to MongoDB ObjectId format)
    const taskId = this.generateTaskId();

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
   * Creates a new task with full control over all properties (advanced)
   *
   * @param taskInput - Complete task input object
   * @returns The created task result with success status
   * @throws SunsamaAuthError if not authenticated or request fails
   */
  async createTaskAdvanced(taskInput: TaskInput): Promise<CreateTaskPayload> {
    // Ensure we have group ID
    if (!this.groupId) {
      await this.getUser();
    }

    if (!this.groupId) {
      throw new SunsamaAuthError('Unable to determine group ID');
    }

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
   * Generates a unique task ID in MongoDB ObjectId-like format
   *
   * @returns A 24-character hexadecimal string
   * @internal
   */
  private generateTaskId(): string {
    // Generate 12 random bytes and convert to hex (24 characters)
    const randomBytes = new Uint8Array(12);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(randomBytes);
    } else {
      // Fallback for Node.js environments
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const cryptoModule = require('crypto');
      const buffer = cryptoModule.randomBytes(12);
      randomBytes.set(buffer);
    }

    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
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
