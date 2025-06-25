/**
 * API response and data types
 *
 * These types represent the structure of data returned by the Sunsama API.
 * They will be populated based on the actual API documentation.
 */

import type { DocumentNode } from 'graphql';

/**
 * Base API response structure
 */
export interface ApiResponse<T = unknown> {
  /** Response data */
  data: T;

  /** Response metadata */
  meta?: {
    /** Total number of items (for paginated responses) */
    total?: number;

    /** Current page (for paginated responses) */
    page?: number;

    /** Items per page (for paginated responses) */
    limit?: number;
  };
}

/**
 * Error response structure
 */
export interface ApiErrorResponse {
  /** Error message */
  message: string;

  /** Error code */
  code?: string;

  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  /** Page number (1-based) */
  page?: number;

  /** Number of items per page */
  limit?: number;

  /** Sort field */
  sort?: string;

  /** Sort order */
  order?: 'asc' | 'desc';
}

/**
 * Common date range filter
 */
export interface DateRangeFilter {
  /** Start date (ISO string) */
  start?: string;

  /** End date (ISO string) */
  end?: string;
}

/**
 * GraphQL response structure
 */
export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: Array<string | number>;
  }>;
}

/**
 * GraphQL request structure
 */
export interface GraphQLRequest<TVariables = Record<string, unknown>> {
  operationName: string;
  variables: TVariables;
  query: string | DocumentNode;
}

/**
 * Calendar item structures
 */
export interface CalendarItemGoogle {
  summary?: string;
  summaryOverride?: string;
  timeZone?: string;
  selected?: boolean;
  accessRole?: string;
  accountId?: string;
  __typename: 'CalendarItemGoogle';
}

export interface CalendarItemMicrosoftOwner {
  address?: string;
  name?: string;
  __typename: 'CalendarItemMicrosoftOwner';
}

export interface CalendarItemMicrosoft {
  id?: string;
  name?: string;
  color?: string;
  hexColor?: string;
  isDefaultCalendar?: boolean;
  canShare?: boolean;
  canViewPrivateItems?: boolean;
  canEdit?: boolean;
  isRemovable?: boolean;
  allowedOnlineMeetingProviders?: string[];
  defaultOnlineMeetingProvider?: string;
  isTallyingResponse?: boolean;
  owner?: CalendarItemMicrosoftOwner;
  primary?: boolean;
  accountId?: string;
  __typename: 'CalendarItemMicrosoft';
}

export interface CalendarItem {
  id: string;
  accountId?: string;
  google?: CalendarItemGoogle;
  microsoft?: CalendarItemMicrosoft;
  __typename: 'CalendarItem';
}

export interface Calendar {
  items: CalendarItem[];
  __typename: 'Calendar';
}

/**
 * Services structures
 */
export interface ServiceGoogle {
  scope?: string;
  id?: string;
  email?: string;
  name?: string;
  picture?: string;
  locale?: string;
  __typename: 'ServiceGoogle';
}

export interface ServiceMicrosoft {
  scope?: string;
  id?: string;
  email?: string;
  name?: string;
  isPersonalAccount?: boolean;
  __typename: 'ServiceMicrosoft';
}

export interface ServicePhoneNumber {
  number?: string;
  verified?: boolean;
  otpExpiresAt?: string;
  __typename: 'ServicePhoneNumber';
}

export interface Services {
  google?: ServiceGoogle;
  microsoft?: ServiceMicrosoft;
  phoneNumber?: ServicePhoneNumber;
  ssoEnforced?: boolean;
  __typename: 'Services';
}

/**
 * User preferences structures
 */
export interface TimeSlot {
  hour: number;
  minute: number;
  __typename: 'TimeSlot';
}

export interface SchedulingHours {
  start: TimeSlot;
  end: TimeSlot;
  __typename: 'SchedulingHours';
}

export interface CustomKeyboardShortcut {
  id: string;
  disabled?: boolean;
  global?: boolean;
  key?: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  __typename: 'CustomKeyboardShortcut';
}

export interface UserPreferences {
  clockStyle?: string;
  defaultCalendarView?: string;
  defaultHomeView?: string;
  defaultMainPanel?: string;
  defaultMobileCalendarView?: string;
  defaultHideTasks?: boolean;
  hideTeamEvtCopies?: boolean;
  hideMessenger?: boolean;
  disableSpellcheck?: boolean;
  channelRecommendations?: boolean;
  plannedTimeRecommendations?: boolean;
  subtaskPlannedTimeRecommendations?: boolean;
  startDayOfWeekOffset?: number;
  workingSessionTransparency?: string;
  workingSessionVisibility?: string;
  workingSessionDuration?: number;
  promptToUpdateStatus?: boolean;
  darkMode?: boolean;
  keyboardShortcuts?: boolean;
  customKeyboardShortcuts?: CustomKeyboardShortcut[];
  autoArchiveThreshold?: number;
  showDeclinedEvents?: boolean;
  usePlannedTimeAsActualTime?: boolean;
  rollToTop?: boolean;
  includeWeekendInReflection?: boolean;
  planningAutoRollover?: boolean;
  autoFocus?: boolean;
  focusBarDisabledTriggers?: string[];
  workloadThreshold?: number;
  importEventFilters?: string[];
  autoImportEvents?: boolean;
  importEventCompletionSync?: boolean;
  workingSessionCalendarReminder?: boolean;
  workingSessionBuffer?: number;
  focusModeNextUpReminder?: boolean;
  autoRescheduleWorkingSessionConflicts?: boolean;
  autoRescheduleWorkingSessionCompletions?: boolean;
  schedulingHours?: SchedulingHours;
  defaultEmailClient?: string;
  timerNotificationsEnabled?: boolean;
  timerNotificationsSoundId?: string;
  timerPomodoroNotificationsSoundId?: string;
  timerNotificationsVolume?: number;
  timerNotificationsTimeRemainingTriggers?: number[];
  endOfDayMessageId?: string;
  endOfDayCustomMessage?: string;
  autoBreak?: boolean;
  defaultTargetFocusDuration?: number;
  defaultTargetBreakDuration?: number;
  defaultFocusTimerView?: string;
  completedTaskCalendarPinStyle?: string;
  hideCompletedTasks?: boolean;
  insertTaskPosition?: string;
  chatToolFocusSyncTrigger?: string;
  chatToolFocusSyncUpdateStatus?: boolean;
  chatToolFocusSyncUpdateDnd?: boolean;
  chatToolFocusSyncPrivacy?: string;
  chatToolFocusSyncStatusEmoji?: string;
  navigationPanelStyle?: string;
  preferredAILanguage?: string;
  preferredLanguage?: string;
  visualizeTaskProjectedTimeOnCalendar?: boolean;
  visualizeTaskActualTimeOnCalendar?: boolean;
  __typename: 'UserPreferences';
}

/**
 * Notification settings
 */
export interface NotificationSetting {
  subscribed: boolean;
  channels: string[];
  __typename: string;
}

export interface NotifySettings {
  inviteeResponse?: NotificationSetting;
  invitedToEvent?: NotificationSetting;
  eventUpdated?: NotificationSetting;
  eventCancelled?: NotificationSetting;
  newComments?: NotificationSetting;
  shareTasks?: NotificationSetting;
  taskComment?: NotificationSetting;
  taskStream?: NotificationSetting;
  taskAssignee?: NotificationSetting;
  taskCompletion?: NotificationSetting;
  taskSchedule?: NotificationSetting;
  taskCreation?: NotificationSetting;
  eventReminders?: NotificationSetting;
  dossier?: NotificationSetting;
  planYourDay?: NotificationSetting;
  weeklyStats?: NotificationSetting;
  weekReview?: NotificationSetting;
  systemUpdates?: NotificationSetting;
  dailyWrapSeen?: NotificationSetting;
  dailyWrapReply?: NotificationSetting;
  __typename: 'NotifySettings';
}

/**
 * App status structures
 */
export interface AppStatus {
  status?: string;
  deferralDate?: string;
  __typename: string;
}

export interface DesktopApp {
  darwin?: AppStatus;
  win32?: AppStatus;
  linux?: AppStatus;
  __typename: 'DesktopApp';
}

export interface MobileApp {
  status?: string;
  os?: string;
  lastModified?: string;
  __typename: 'MobileApp';
}

/**
 * Planning and scheduling structures
 */
export interface DayBoundary {
  hour: number;
  minute: number;
  disabled?: boolean;
  __typename: string;
}

export interface WeeklySchedule {
  hour: number;
  minute: number;
  isoWeekday: number;
  lastWeekPlanned?: string;
  weeksPlanned?: number;
  disabled?: boolean;
  __typename: string;
}

export interface DailyPlanning {
  snoozedUntilDate?: string;
  lastDayPlanned?: string;
  disabledSteps?: string[];
  importEventsWithoutInvitees?: boolean;
  __typename: 'DailyPlanning';
}

export interface DailyShutdown {
  snoozedUntilDate?: string;
  lastDayShutdown?: string;
  __typename: 'DailyShutdown';
}

/**
 * Other user data structures
 */
export interface PrimaryGroup {
  groupId: string;
  __typename: 'PrimaryGroup';
}

export interface UserProfile {
  profilePictureURL?: string;
  firstname?: string;
  lastname?: string;
  timezone?: string;
  timezoneWarningDisabled?: boolean;
  profileThumbs?: {
    image_24?: string;
    image_32?: string;
    image_48?: string;
    image_72?: string;
    image_192?: string;
    __typename: 'ProfileThumbs';
  };
  useCase?: string;
  onboardingEventSent?: boolean;
  __typename: 'UserProfile';
}

export interface UserEmail {
  address: string;
  verified: boolean;
  __typename: 'UserEmail';
}

export interface Contacts {
  integrationEnabled?: boolean;
  usesNewPeopleApi?: boolean;
  accountId?: string;
  __typename: 'Contacts';
}

export interface EmailCourse {
  id: string;
  status: string;
  __typename: 'EmailCourse';
}

export interface FacebookTracking {
  _fbp?: string;
  _fbc?: string;
  __typename: 'FacebookTracking';
}

export interface Tracking {
  facebook?: FacebookTracking;
  chatSetupConfigId?: string;
  __typename: 'Tracking';
}

export interface Proficiency {
  id: string;
  count: number;
  proficient: boolean;
  proficientAt?: string;
  firstPerformedAt?: string;
  __typename: 'Proficiency';
}

export interface ReminderSchedule {
  enabled: boolean;
  isoDayIndex: number;
  time: TimeSlot;
  __typename: 'ReminderSchedule';
}

export interface Reminder {
  schedule: ReminderSchedule;
  nextDeliveryAt?: string;
  __typename: 'Reminder';
}

export interface ScheduledCall {
  workflow: string;
  reminder: Reminder;
  __typename: 'ScheduledCall';
}

export interface Assistant {
  scheduledCalls?: ScheduledCall[];
  __typename: 'Assistant';
}

export interface DailyWrap {
  reminder: Reminder;
  __typename: 'DailyWrap';
}

export interface DailyCatchUp {
  reminder: Reminder;
  __typename: 'DailyCatchUp';
}

/**
 * Complete User profile data
 */
export interface User {
  _id: string;
  activationDate?: string;
  admin?: boolean;
  aka?: string;
  calendar?: Calendar;
  services?: Services;
  emails: UserEmail[];
  primaryGroup?: PrimaryGroup;
  onboarding?: unknown;
  preferences: UserPreferences;
  contacts?: Contacts;
  createdAt?: string;
  dailyPlanning?: DailyPlanning;
  dailyShutdown?: DailyShutdown;
  daysPlanned?: number;
  daysShutdown?: number;
  desktopApp?: DesktopApp;
  mobileApp?: MobileApp;
  lastAnnouncementCheckDate?: string;
  lastModified?: string;
  nodeId?: string;
  notifySettings?: NotifySettings;
  profile: UserProfile;
  toursCompleted?: string[];
  username?: string;
  waitList?: unknown;
  weeklyPlanning?: WeeklySchedule;
  weeklyReview?: WeeklySchedule;
  lastArchiveCheckDate?: string;
  integrationRequests?: unknown;
  dayStart?: DayBoundary;
  plannedDayStart?: DayBoundary;
  dayEnd?: DayBoundary;
  waitlistId?: string;
  trialPeriod?: unknown;
  qualificationAssessment?: unknown;
  disappointmentIndex?: unknown;
  emailCourses?: EmailCourse[];
  tracking?: Tracking;
  proficiencies?: Proficiency[];
  assistant?: Assistant;
  dailyWrap?: DailyWrap;
  dailyCatchUp?: DailyCatchUp;
  __typename: 'User';
}

/**
 * Response for getUser query
 */
export interface GetUserResponse {
  currentUser: User;
}

/**
 * Input for getTasksByDay query
 */
export interface GetTasksByDayInput {
  day: string; // ISO date string like "2025-05-31"
  timezone: string; // Timezone like "America/New_York"
  userId: string; // User ID
  groupId: string; // Group ID
}

/**
 * Task subtask structure
 */
export interface TaskSubtask {
  _id: string;
  title: string;
  completedDate?: string | null;
  completedBy?: string | null;
  timeEstimate?: number | null;
  actualTime?: TaskActualTime | null;
  snooze?: TaskSnooze | null;
  scheduledTime?: TaskScheduledTime | null;
  // TODO: Investigate if subtask integration objects are the same as full task integration objects
  integration?: TaskIntegration | null;
  mergedTaskId?: string | null;
  recommendedTimeEstimate?: number | null;
  __typename: 'TaskSubtask';
}

/**
 * Task snooze information for input (mutations)
 */
export interface TaskSnoozeInput {
  userId: string;
  date: string;
  until: string;
}

/**
 * Task snooze information
 */
export interface TaskSnooze {
  userId: string;
  date: string;
  until: string;
  __typename: 'TaskSnooze';
}

/**
 * Task actual time tracking
 */
export interface TaskActualTime {
  userId: string;
  startDate: string;
  endDate: string;
  duration: number;
  isTimerEntry: boolean;
  __typename: 'TaskActualTime';
}

/**
 * Task scheduled time information
 */
export interface TaskScheduledTime {
  eventId: string;
  serviceIds: {
    google?: string | null;
    microsoft?: string | null;
    microsoftUniqueId?: string | null;
    apple?: string | null;
    appleRecurrenceId?: string | null;
    sunsama?: string | null;
    __typename: 'CalendarEventServiceIds';
  };
  calendarId: string;
  userId: string;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  importedFromCalendar: boolean;
  __typename: 'TaskScheduledTime';
}

/**
 * Task event information
 */
export interface TaskEventInfo {
  eventId: string;
  clone: boolean;
  __typename: 'TaskEventInfo';
}

/**
 * Task ordering information
 */
export interface TaskOrdering {
  ordinal: number;
  panelDate: string;
  channelId?: string | null;
  userId: string;
  __typename: 'TaskOrdering';
}

/**
 * Task backlog ordering
 */
export interface TaskBacklogOrdering {
  horizonType: string;
  position: number;
  streamId: string;
  __typename: 'TaskBacklogOrdering';
}

/**
 * Task sequence information for recurring tasks
 */
export interface TaskSequence {
  date: string;
  id: string;
  expiresDate: string;
  ruleString: string;
  searchable: boolean;
  forked: boolean;
  final: boolean;
  estimatedStart?: {
    hour: number;
    minute: number;
    __typename: 'TaskSequenceEstimatedStart';
  } | null;
  master?: string | null;
  finalDate?: string | null;
  template?: unknown | null; // Complex nested structure
  __typename: 'TaskSequence';
}

/**
 * Task ritual information
 */
export interface TaskRitual {
  id: string;
  period: {
    interval: string;
    startCalendarDay: string;
    endCalendarDay: string;
    __typename: string;
  };
  __typename: 'TaskRitual';
}

/**
 * Task run date information
 */
export interface TaskRunDate {
  startDate: string;
  endDate: string;
  __typename: 'TaskRunDate';
}

/**
 * Task time horizon
 */
export interface TaskTimeHorizon {
  type: string;
  relativeTo: string;
  __typename: 'TaskTimeHorizon';
}

/**
 * Task comment structure
 */
export interface TaskComment {
  userId: string;
  text: string;
  markdown: string;
  editorVersion: number;
  groupId: string;
  createdAt: string;
  editedAt?: string;
  deleted: boolean;
  file?: string;
  fileMetadata?: {
    url: string;
    filename: string;
    mimetype: string;
    size: number;
    width?: number;
    height?: number;
    __typename: 'TaskFileMetadata';
  };
  __typename: 'TaskComment';
}

/**
 * Base task integration interface
 */
export interface BaseTaskIntegration {
  service: string;
  __typename: string;
}

/**
 * Website integration for tasks
 */
export interface TaskWebsiteIntegration extends BaseTaskIntegration {
  service: 'website';
  identifier: {
    url: string;
    private: boolean;
    canonicalUrl?: string | null;
    description?: string | null;
    faviconUrl?: string | null;
    imageUrl?: string | null;
    siteName?: string | null;
    title?: string | null;
    __typename: 'TaskWebsiteIntegrationIdentifier';
  };
  __typename: 'TaskWebsiteIntegration';
}

/**
 * Google Calendar integration for tasks
 */
export interface TaskGoogleCalendarIntegration extends BaseTaskIntegration {
  service: 'googleCalendar';
  identifier: {
    sunsamaId: string;
    __typename: 'TaskGoogleCalendarIntegrationIdentifier';
  };
  __typename: 'TaskGoogleCalendarIntegration';
}

/**
 * Linear integration for tasks
 */
export interface TaskLinearIntegration extends BaseTaskIntegration {
  service: 'linear';
  identifier: {
    id: string;
    url: string;
    identifier: string;
    linearUserId: string;
    linearOrganizationId: string;
    number: number;
    _version: string;
    __typename: 'TaskLinearIntegrationIdentifier';
  };
  __typename: 'TaskLinearIntegration';
}

/**
 * Union type for all task integrations
 */
export type TaskIntegration =
  | TaskWebsiteIntegration
  | TaskGoogleCalendarIntegration
  | TaskLinearIntegration;

/**
 * Main Task structure
 */
export interface Task {
  _id: string;
  groupId: string;
  taskType: string;
  streamIds: string[];
  recommendedStreamId?: string | null;
  eventInfo?: TaskEventInfo | null;
  seededEventIds?: string[] | null;
  private: boolean;
  assigneeId: string;
  createdBy: string;
  integration?: TaskIntegration | null;
  deleted: boolean;
  text: string;
  notes: string;
  notesMarkdown?: string | null;
  notesChecksum?: string | null;
  editorVersion?: number | null;
  collabSnapshot?: CollabSnapshot | null; // Collaborative editing snapshot for notes
  completed: boolean;
  completedBy?: string | null;
  completeDate?: string | null;
  completeOn?: string | null;
  archivedAt?: string | null;
  duration?: number | null;
  runDate?: TaskRunDate | null;
  snooze?: TaskSnooze | null;
  timeHorizon?: TaskTimeHorizon | null;
  dueDate?: string | null;
  comments: TaskComment[];
  orderings: TaskOrdering[];
  backlogOrderings: TaskBacklogOrdering[];
  subtasks: TaskSubtask[];
  subtasksCollapsed?: boolean | null;
  sequence?: TaskSequence | null;
  followers: string[];
  recommendedTimeEstimate?: number | null;
  timeEstimate?: number | null;
  actualTime: TaskActualTime[];
  scheduledTime: TaskScheduledTime[];
  createdAt: string;
  lastModified: string;
  objectiveId?: string | null;
  ritual?: TaskRitual | null;
  __typename: 'Task';
}

/**
 * Response for getTasksByDay query
 */
export interface GetTasksByDayResponse {
  tasksByDayV2: Task[];
}

/**
 * Input for getTasksBacklog query
 */
export interface GetTasksBacklogInput {
  userId: string; // User ID
  groupId: string; // Group ID
}

/**
 * Response for getTasksBacklog query
 */
export interface GetTasksBacklogResponse {
  tasksBacklog: Task[];
}

/**
 * Stream standup rule structure
 */
export interface StreamStandupRule {
  isoDays: string[];
  hour: number;
  minute: number;
  __typename: 'StreamStandupRule';
}

/**
 * Stream standup configuration
 */
export interface StreamStandup {
  channel: string;
  rule: StreamStandupRule;
  nextStandupDate?: string | null;
  lastStandupDate?: string | null;
  timezone: string;
  __typename: 'StreamStandup';
}

/**
 * Stream edit trail entry
 */
export interface StreamEditTrail {
  userId: string;
  editDate: string;
  __typename: 'StreamEditTrail';
}

/**
 * Stream project integration
 */
export interface StreamProjectIntegration {
  integration: string;
  projectId: string;
  accountId: string;
  userId: string;
  __typename: 'StreamProjectIntegration';
}

/**
 * Stream schedule time slot
 */
export interface StreamScheduleTimeSlot {
  id: string;
  dayIndex: number;
  start: TimeSlot;
  end: TimeSlot;
  __typename: 'StreamScheduleTimeSlot';
}

/**
 * Stream schedule for a user
 */
export interface StreamSchedule {
  userId: string;
  timeSpans: StreamScheduleTimeSlot[];
  __typename: 'StreamSchedule';
}

/**
 * Stream structure
 */
export interface Stream {
  _id: string;
  groupId: string;
  createdAt: string;
  createdBy: string;
  streamName: string;
  category?: string | null;
  categoryStreamId?: string | null;
  personal?: boolean | null;
  description: string;
  status: string;
  lastModified: string;
  slackChannelId?: string | null;
  slackAccountId?: string | null;
  standup?: StreamStandup | null;
  editTrail: StreamEditTrail[];
  color: string;
  memberIds: string[];
  private: boolean;
  projectIntegrations: StreamProjectIntegration[];
  schedules: StreamSchedule[];
  deleted: boolean;
  __typename: 'Stream';
}

/**
 * Input for getStreamsByGroupId query
 */
export interface GetStreamsByGroupIdInput {
  groupId: string;
}

/**
 * Response for getStreamsByGroupId query
 */
export interface GetStreamsByGroupIdResponse {
  streamsByGroupId: Stream[];
}

/**
 * Partial task structure returned in update operations
 * Contains only the fields that were modified
 */
export interface PartialTask {
  _id: string;
  recommendedStreamId?: string | null;
  streamIds?: string[];
  recommendedTimeEstimate?: number | null;
  subtasks?: TaskSubtask[];
  snooze?: TaskSnooze | null;
  __typename: 'PartialTask';
}

/**
 * Input for updateTaskComplete mutation
 */
export interface UpdateTaskCompleteInput {
  /** The ID of the task to mark as complete */
  taskId: string;

  /** ISO 8601 timestamp when the task was completed */
  completeOn: string;

  /** Flag to limit response payload (returns null for updatedTask and updatedFields when true) */
  limitResponsePayload?: boolean;
}

/**
 * Payload returned by updateTaskComplete mutation
 */
export interface UpdateTaskPayload {
  /** The updated task (null when limitResponsePayload is true) */
  updatedTask: Task | null;

  /** Partial task containing only updated fields (null when limitResponsePayload is true) */
  updatedFields: PartialTask | null;

  /** Whether the operation succeeded */
  success: boolean;

  /** Whether the operation was skipped */
  skipped: boolean | null;

  __typename: 'UpdateTaskPayload';
}

/**
 * Collaborative editing snapshot for task notes
 */
export interface CollabSnapshot {
  state: {
    version: string;
    docName: string;
    clock: number;
    value: string;
  };
  updates: Array<{
    version: string;
    action: string;
    docName: string;
    clock: number;
    value: string;
  }>;
}

/**
 * Input structure for creating a new task
 */
export interface TaskInput {
  /** Client-generated unique ID for the task */
  _id: string;

  /** Group ID the task belongs to */
  groupId: string;

  /** Type of task (e.g., "outcomes") */
  taskType: string;

  /** Array of stream IDs to associate with the task */
  streamIds: string[];

  /** Recommended stream ID (optional) */
  recommendedStreamId: string | null;

  /** Event information (optional) */
  eventInfo: TaskEventInfo | null;

  /** Seeded event IDs (optional) */
  seededEventIds: string[] | null;

  /** Whether the task is private */
  private: boolean;

  /** ID of the user assigned to the task */
  assigneeId: string;

  /** ID of the user creating the task */
  createdBy: string;

  /** Integration information (optional) */
  integration: TaskIntegration | null;

  /** Whether the task is deleted */
  deleted: boolean;

  /** Main task text/title */
  text: string;

  /** Task notes/description */
  notes: string;

  /** Notes in markdown format (optional) */
  notesMarkdown: string | null;

  /** Notes checksum (optional) */
  notesChecksum: string | null;

  /** Editor version number */
  editorVersion: number;

  /** Collaborative editing state */
  collabSnapshot: CollabSnapshot | null;

  /** Whether the task is completed */
  completed: boolean;

  /** ID of user who completed the task (optional) */
  completedBy: string | null;

  /** Date when task was completed (optional) */
  completeDate: string | null;

  /** Timestamp when task was marked complete (optional) */
  completeOn: string | null;

  /** Timestamp when task was archived (optional) */
  archivedAt: string | null;

  /** Task duration (optional) */
  duration: number | null;

  /** Run date information (optional) */
  runDate: TaskRunDate | null;

  /** Snooze configuration (optional) */
  snooze: TaskSnoozeInput | null;

  /** Time horizon configuration (optional) */
  timeHorizon: TaskTimeHorizon | null;

  /** Due date (optional) */
  dueDate: string | null;

  /** Task comments */
  comments: TaskComment[];

  /** Task orderings */
  orderings: TaskOrdering[];

  /** Backlog orderings */
  backlogOrderings: TaskBacklogOrdering[];

  /** Subtasks */
  subtasks: TaskSubtask[];

  /** Whether subtasks are collapsed (optional) */
  subtasksCollapsed: boolean | null;

  /** Sequence information for recurring tasks (optional) */
  sequence: TaskSequence | null;

  /** User IDs following this task */
  followers: string[];

  /** Recommended time estimate in minutes (optional) */
  recommendedTimeEstimate: number | null;

  /** Time estimate in minutes */
  timeEstimate: number | null;

  /** Actual time tracking */
  actualTime: TaskActualTime[];

  /** Scheduled time information */
  scheduledTime: TaskScheduledTime[];

  /** ISO timestamp when task was created */
  createdAt: string;

  /** ISO timestamp when task was last modified */
  lastModified: string;

  /** Objective ID (optional) */
  objectiveId: string | null;

  /** Ritual information (optional) */
  ritual: TaskRitual | null;
}

/**
 * Simplified options for creating a task
 */
export interface CreateTaskOptions {
  /** Custom task ID (if not provided, one will be generated automatically) */
  taskId?: string;

  /** Task description/notes */
  notes?: string;

  /** Time estimate in minutes */
  timeEstimate?: number;

  /** Array of stream IDs to assign the task to */
  streamIds?: string[];

  /** Whether the task is private */
  private?: boolean;

  /** Due date as Date or ISO string */
  dueDate?: Date | string;

  /** Snooze until date as Date or ISO string */
  snoozeUntil?: Date | string;
}

/**
 * Input for createTask mutation
 */
export interface CreateTaskInput {
  /** The task object to create */
  task: TaskInput;

  /** Group ID (duplicated from task for API requirements) */
  groupId: string;

  /** Optional position parameter */
  position?: string;
}

/**
 * Response payload for createTask mutation
 */
export interface CreateTaskPayload {
  /** Whether the operation succeeded */
  success: boolean;

  /** Error message if the operation failed */
  error: string | null;

  /** Fields that were updated/computed by the server */
  updatedFields: PartialTask | null;

  __typename: 'CreateTaskPayload';
}

/**
 * Response structure for createTask mutation
 */
export interface CreateTaskResponse {
  createTaskV2: CreateTaskPayload;
}

/**
 * Input for updateTaskDelete mutation
 */
export interface UpdateTaskDeleteInput {
  /** The ID of the task to delete */
  taskId: string;

  /** Flag to limit response payload (returns null for updatedTask and updatedFields when true) */
  limitResponsePayload?: boolean;

  /** Whether the task was merged before deletion */
  wasTaskMerged?: boolean;
}

/**
 * Input for updateTaskSnoozeDate mutation
 */
export interface UpdateTaskSnoozeDateInput {
  /** The ID of the task to reschedule */
  taskId: string;

  /**
   * The new day to schedule the task to (YYYY-MM-DD format)
   * Set to null to move the task to backlog (unschedule)
   */
  newDay: string | null;

  /** Flag to limit response payload (returns null for updatedTask and updatedFields when true) */
  limitResponsePayload?: boolean;
}

/**
 * Input for getArchivedTasks query
 */
export interface GetArchivedTasksInput {
  /** User ID */
  userId: string;

  /** Group ID */
  groupId: string;

  /** Offset for pagination (defaults to 0) */
  offset?: number;

  /** Maximum number of tasks to return (defaults to 300) */
  limit?: number;
}

/**
 * Response for getArchivedTasks query
 */
export interface GetArchivedTasksResponse {
  archivedTasks: Task[];
}

/**
 * Input for getTaskById query
 */
export interface GetTaskByIdInput {
  /** The ID of the task to retrieve */
  taskId: string;
  /** Group ID that the task belongs to */
  groupId: string;
}

/**
 * Response for getTaskById query
 */
export interface GetTaskByIdResponse {
  taskById: Task | null;
}

/**
 * Content type for updateTaskNotes - either HTML or Markdown format
 */
export type TaskNotesContent = { html: string } | { markdown: string };

/**
 * Options for updateTaskNotes method
 */
export interface UpdateTaskNotesOptions {
  /** Flag to limit response payload (returns null for updatedTask and updatedFields when true) */
  limitResponsePayload?: boolean;

  /** Collaborative editing snapshot for the notes (optional, will be fetched if not provided) */
  collabSnapshot?: CollabSnapshot;
}

/**
 * Input for updateTaskNotes mutation (internal GraphQL API)
 */
export interface UpdateTaskNotesInput {
  /** The ID of the task to update */
  taskId: string;

  /** The new notes content (HTML format) */
  notes: string;

  /** The new notes content (Markdown format) */
  notesMarkdown: string;

  /** Editor version (typically 3) */
  editorVersion: number;

  /** Collaborative editing snapshot for the notes */
  collabSnapshot: CollabSnapshot;

  /** Flag to limit response payload (returns null for updatedTask and updatedFields when true) */
  limitResponsePayload?: boolean;
}

/**
 * Input for updateTaskPlannedTime mutation
 */
export interface UpdateTaskPlannedTimeInput {
  /** The ID of the task to update */
  taskId: string;

  /** The planned time in seconds (timeEstimate in minutes * 60) */
  timeInSeconds: number;

  /** Flag to limit response payload (returns null for updatedTask and updatedFields when true) */
  limitResponsePayload?: boolean;
}

/**
 * Input for updateTaskDueDate mutation
 */
export interface UpdateTaskDueDateInput {
  /** The ID of the task to update */
  taskId: string;

  /** The due date as an ISO 8601 string (e.g., "2025-06-21T04:00:00.000Z"), or null to clear the due date */
  dueDate: string | null;

  /** Flag to limit response payload (returns null for updatedTask and updatedFields when true) */
  limitResponsePayload?: boolean;
}
