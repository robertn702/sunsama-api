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
 * GitHub integration for tasks
 */
export interface TaskGithubIntegration extends BaseTaskIntegration {
  service: 'github';
  identifier: {
    id: string;
    repositoryOwnerLogin: string;
    repositoryName: string;
    number: number;
    type: string;
    url: string;
    __typename: 'TaskGithubIntegrationIdentifier';
  };
  __typename: 'TaskGithubIntegration';
}

/**
 * Gmail integration for tasks
 */
export interface TaskGmailIntegration extends BaseTaskIntegration {
  service: 'gmail';
  identifier: {
    id: string;
    messageId: string;
    accountId: string;
    url: string;
    __typename: 'TaskGmailIntegrationIdentifier';
  };
  __typename: 'TaskGmailIntegration';
}

/**
 * Union type for all task integrations
 */
export type TaskIntegration =
  | TaskWebsiteIntegration
  | TaskGoogleCalendarIntegration
  | TaskLinearIntegration
  | TaskGithubIntegration
  | TaskGmailIntegration;

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
 * Input for updateTaskUncomplete mutation
 */
export interface UpdateTaskUncompleteInput {
  /** The ID of the task to mark as incomplete */
  taskId: string;

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

  /** Integration information for linking task to external services (e.g., Gmail) */
  integration?: TaskIntegration;
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

/**
 * Input for updateTaskText mutation
 */
export interface UpdateTaskTextInput {
  /** The ID of the task to update */
  taskId: string;

  /** The new text/title for the task */
  text: string;

  /** Recommended stream ID (optional) */
  recommendedStreamId?: string | null;

  /** Flag to limit response payload (returns null for updatedTask and updatedFields when true) */
  limitResponsePayload?: boolean;
}

/**
 * Input for updateTaskStream mutation
 */
export interface UpdateTaskStreamInput {
  /** The ID of the task to update */
  taskId: string;

  /** The stream ID to assign to the task */
  streamId: string;

  /** Flag to limit response payload (returns null for updatedTask and updatedFields when true) */
  limitResponsePayload?: boolean;
}

/**
 * Input for createTaskSubtasks mutation
 *
 * Creates new subtasks by registering subtask IDs with the parent task.
 * After calling this mutation, use updateTaskSubtaskTitle to set titles.
 */
export interface CreateTaskSubtasksInput {
  /** The parent task ID */
  taskId: string;

  /** Array of new subtask IDs to register (24-char hex, MongoDB ObjectId format) */
  addedSubtaskIds: string[];

  /** Flag to limit response payload (returns null for updatedTask and updatedFields when true) */
  limitResponsePayload?: boolean;
}

/**
 * Input for updateTaskSubtaskTitle mutation
 *
 * Updates the title of an existing subtask.
 */
export interface UpdateTaskSubtaskTitleInput {
  /** The parent task ID */
  taskId: string;

  /** The subtask ID to update */
  subtaskId: string;

  /** The new subtask title */
  title: string;

  /** Additional subtask IDs to add (optional, can be empty array) */
  addedSubtaskIds?: string[];
}

/**
 * Input for updateTaskSubtaskComplete mutation
 *
 * Marks a subtask as complete.
 */
export interface UpdateTaskSubtaskCompleteInput {
  /** The parent task ID */
  taskId: string;

  /** The subtask ID to mark as complete */
  subtaskId: string;

  /** ISO 8601 timestamp when the subtask was completed */
  completedDate: string;

  /** Flag to limit response payload (returns null for updatedTask and updatedFields when true) */
  limitResponsePayload?: boolean;
}

/**
 * Input for updateTaskSubtaskUncomplete mutation
 *
 * Marks a subtask as incomplete (uncompletes it).
 */
export interface UpdateTaskSubtaskUncompleteInput {
  /** The parent task ID */
  taskId: string;

  /** The subtask ID to mark as incomplete */
  subtaskId: string;

  /** Flag to limit response payload (returns null for updatedTask and updatedFields when true) */
  limitResponsePayload?: boolean;
}

/**
 * Input for updateTaskMoveToPanel mutation
 *
 * Moves/reorders a task within a day panel.
 */
export interface UpdateTaskMoveToPanelInput {
  /** The ID of the task being moved */
  taskId: string;

  /** The new ordinal position value (uses spacing system, not 0-indexed) */
  ordinal: number;

  /** All task IDs in the panel in their new order */
  taskIds: string[];

  /** The user ID */
  userId: string;

  /** User's timezone (e.g., "America/Denver") */
  timezone: string;

  /** Target panel date (ISO format, e.g., "2026-01-12T07:00:00.000Z") */
  panelDate: string;

  /** Source panel date (ISO format) - same as panelDate for same-day reorder */
  movedFromPanelDate: string;

  /** Whether task was moved from archive */
  isMovedFromArchive: boolean;

  /** Whether moved from rollover to complete */
  isMovedFromRolloverToComplete: boolean;

  /** Whether moved from complete to rollover */
  isMovedFromCompleteToRollover: boolean;

  /** Whether moved within rollover */
  isMovedWithinRollover: boolean;
}

/**
 * Payload returned by updateTaskMoveToPanel mutation
 */
export interface UpdateTaskMoveToPanelPayload {
  /** Array of task IDs that were updated */
  updatedTaskIds: string[];

  __typename: 'UpdateTasksBulkPayload';
}

// ==========================================
// Calendar Event Types
// ==========================================

/**
 * Calendar event date range
 */
export interface CalendarEventDate {
  /** Start date (ISO 8601 string) */
  startDate: string;

  /** End date (ISO 8601 string) */
  endDate: string;

  /** Whether this is an all-day event */
  isAllDay: boolean | null;

  /** Timezone for the event */
  timeZone: string | null;

  __typename: 'CalendarEventDate';
}

/**
 * Calendar event coordinate
 */
export interface CalendarEventCoordinate {
  /** Latitude */
  lat: number;

  /** Longitude */
  lng: number;

  __typename: 'CalendarEventCoordinate';
}

/**
 * Calendar event location
 */
export interface CalendarEventLocation {
  /** Location name */
  name: string;

  /** Location address */
  address: string;

  /** Location alias */
  alias: string;

  /** Geographic coordinates */
  coordinate: CalendarEventCoordinate;

  __typename: 'CalendarEventLocation';
}

/**
 * Calendar event invitee type
 */
export interface CalendarEventInviteeType {
  /** Whether the invitee is an admin */
  admin: boolean | null;

  /** Whether the invitee is a guest */
  guest: boolean | null;

  __typename: 'CalendarEventInviteeType';
}

/**
 * Calendar event invitee
 */
export interface CalendarEventInvitee {
  /** User ID of the invitee */
  userId: string | null;

  /** Email address */
  email: string | null;

  /** Display name */
  name: string | null;

  /** Requirement level */
  requirement: string | null;

  /** Response status */
  status: string | null;

  /** Invitee type */
  type: CalendarEventInviteeType | null;

  /** Profile picture URL */
  profilePicture: string | null;

  /** Whether this is a resource */
  resource: boolean | null;

  __typename: 'CalendarEventInvitee';
}

/**
 * Calendar event service IDs for external calendar services
 */
export interface CalendarEventServiceIds {
  /** Google Calendar event ID */
  google: string | null;

  /** Microsoft Calendar event ID */
  microsoft: string | null;

  /** Microsoft unique ID */
  microsoftUniqueId: string | null;

  /** Apple Calendar event ID */
  apple: string | null;

  /** Apple recurrence ID */
  appleRecurrenceId: string | null;

  /** Sunsama internal ID */
  sunsama: string | null;

  __typename: 'CalendarEventServiceIds';
}

/**
 * Calendar event scheduled-to entry
 */
export interface CalendarEventScheduledToEntry {
  /** Calendar ID (usually email address) */
  calendarId: string;

  /** User ID */
  userId: string;

  __typename: 'CalendarEventScheduledToEntry';
}

/**
 * Calendar event organizer calendar info
 */
export interface CalendarEventOrganizerCalendar {
  /** Calendar ID (usually email address) */
  calendarId: string;

  /** Display name of the calendar */
  calendarDisplayName: string;

  __typename: 'CalendarEventOrganizerCalendar';
}

/**
 * Calendar event permissions
 */
export interface CalendarEventPermissions {
  /** Whether guests can modify the event */
  guestsCanModify: boolean | null;

  /** Whether guests can invite others */
  guestsCanInviteOthers: boolean | null;

  /** Whether guests can see other guests */
  guestsCanSeeOtherGuests: boolean | null;

  /** Whether anyone can add themselves */
  anyoneCanAddSelf: boolean | null;

  /** Whether the event is locked */
  locked: boolean | null;

  /** Whether this is a private copy */
  privateCopy: boolean | null;

  __typename: 'CalendarEventPermissions';
}

/**
 * Conference solution key
 */
export interface ConferenceSolutionKey {
  /** Type of conference solution */
  type: string;

  __typename: 'ConferenceSolutionKey';
}

/**
 * Conference create request
 */
export interface ConferenceCreateRequest {
  /** Request ID */
  requestId: string | null;

  /** Conference solution key */
  conferenceSolutionKey: ConferenceSolutionKey | null;

  __typename: 'ConferenceCreateRequest';
}

/**
 * Conference entry point
 */
export interface ConferenceEntryPoint {
  /** Type of entry point */
  entryPointType: string | null;

  /** URI for the entry point */
  uri: string | null;

  /** Label for the entry point */
  label: string | null;

  /** PIN code */
  pin: string | null;

  __typename: 'ConferenceEntryPoint';
}

/**
 * Conference solution
 */
export interface ConferenceSolution {
  /** Solution key */
  key: ConferenceSolutionKey | null;

  /** Solution name */
  name: string | null;

  /** Icon URI */
  iconUri: string | null;

  __typename: 'ConferenceSolution';
}

/**
 * Calendar event conference data
 */
export interface CalendarEventConferenceData {
  /** Create request info */
  createRequest: ConferenceCreateRequest | null;

  /** Entry points for joining */
  entryPoints: ConferenceEntryPoint[];

  /** Conference solution info */
  conferenceSolution: ConferenceSolution | null;

  /** Conference ID */
  conferenceId: string | null;

  /** Signature */
  signature: string | null;

  __typename: 'CalendarEventConferenceData';
}

/**
 * Recurring event info
 */
export interface CalendarEventRecurringEventInfo {
  /** Recurring event ID */
  recurringEventId: string | null;

  /** Recurrence rule */
  recurrence: string[] | null;

  __typename: 'CalendarEventRecurringEventInfo';
}

/**
 * Calendar event run date
 */
export interface CalendarEventRunDate {
  /** Start date */
  startDate: string;

  /** End date */
  endDate: string;

  __typename: 'CalendarEventRunDate';
}

/**
 * Calendar event agenda/outcome reference
 */
export interface CalendarEventReference {
  /** Reference ID */
  _id: string;

  /** Group ID */
  groupId: string;

  __typename: 'CalendarEventReference';
}

/**
 * Calendar event child task
 */
export interface CalendarEventChildTask {
  /** Task ID */
  taskId: string;

  /** Group ID */
  groupId: string;

  /** User ID */
  userId: string;

  __typename: 'CalendarEventChildTask';
}

/**
 * Calendar event visualization preference settings
 */
export interface CalendarEventVisualizationSettings {
  /** Block projections setting */
  blockProjections: boolean | null;

  __typename: 'CalendarEventVisualizationSettings';
}

/**
 * Calendar event visualization preference per user
 */
export interface CalendarEventVisualizationPreference {
  /** User ID */
  userId: string;

  /** Visualization settings */
  settings: CalendarEventVisualizationSettings;

  __typename: 'CalendarEventVisualizationPreference';
}

/**
 * Calendar event seed task reference
 */
export interface CalendarEventSeedTask {
  /** Task ID */
  _id: string;

  /** Group ID */
  groupId: string;

  __typename: 'CalendarEventSeedTask';
}

/**
 * Full calendar event structure returned by the API
 */
export interface CalendarEvent {
  /** Event ID */
  _id: string;

  /** User who created the event */
  createdBy: string;

  /** Event date range */
  date: CalendarEventDate;

  /** List of invitees */
  inviteeList: CalendarEventInvitee[];

  /** Event location */
  location: CalendarEventLocation;

  /** Static map URL */
  staticMapUrl: string;

  /** Event status (e.g., "scheduled") */
  status: string;

  /** Event title */
  title: string;

  /** Creation timestamp */
  createdAt: string;

  /** Calendars the event is scheduled to */
  scheduledTo: CalendarEventScheduledToEntry[];

  /** Organizer calendar info */
  organizerCalendar: CalendarEventOrganizerCalendar;

  /** Calendar service (e.g., "google", "microsoft") */
  service: string;

  /** External service IDs */
  serviceIds: CalendarEventServiceIds;

  /** Event description */
  description: string;

  /** Sequence number */
  sequence: number;

  /** Associated stream IDs */
  streamIds: string[];

  /** Last modified timestamp */
  lastModified: string;

  /** Event permissions */
  permissions: CalendarEventPermissions;

  /** Hangout/meeting link */
  hangoutLink: string;

  /** Google Calendar URL */
  googleCalendarURL: string;

  /** Event transparency (e.g., "opaque", "transparent") */
  transparency: string;

  /** Event visibility (e.g., "private", "public") */
  visibility: string;

  /** Google location data */
  googleLocation: string | null;

  /** Conference data */
  conferenceData: CalendarEventConferenceData | null;

  /** Recurring event info */
  recurringEventInfo: CalendarEventRecurringEventInfo | null;

  /** Run date info */
  runDate: CalendarEventRunDate | null;

  /** Agenda items */
  agenda: CalendarEventReference[];

  /** Outcome items */
  outcomes: CalendarEventReference[];

  /** Child tasks */
  childTasks: CalendarEventChildTask[];

  /** Per-user visualization preferences */
  visualizationPreferences: CalendarEventVisualizationPreference[];

  /** Seed task reference */
  seedTask: CalendarEventSeedTask | null;

  /** Event type (e.g., "default") */
  eventType: string;

  /** Whether current user can view this event */
  _userCanView: boolean | null;

  /** Whether current user can edit this event */
  _userCanEdit: boolean | null;

  /** Calendar ID this event belongs to */
  _calendarId: string | null;

  __typename: 'CalendarEvent';
}

/**
 * Updated fields returned after creating a calendar event
 */
export interface CreateCalendarEventUpdatedFields {
  /** Updated service IDs */
  serviceIds: CalendarEventServiceIds | null;

  /** Updated conference data */
  conferenceData: CalendarEventConferenceData | null;

  /** Updated status */
  status: string | null;

  /** Updated scheduled-to entries */
  scheduledTo: CalendarEventScheduledToEntry[] | null;

  /** Updated organizer calendar */
  organizerCalendar: CalendarEventOrganizerCalendar | null;

  /** Updated invitee list */
  inviteeList: CalendarEventInvitee[] | null;

  /** Updated location */
  location: CalendarEventLocation | null;

  /** Updated Google Calendar URL */
  googleCalendarURL: string | null;

  /** Updated hangout link */
  hangoutLink: string | null;

  /** Updated permissions */
  permissions: CalendarEventPermissions | null;

  __typename: 'CreateCalendarEventUpdatedFields';
}

/**
 * Payload returned by createCalendarEvent mutation
 */
export interface CreateCalendarEventPayload {
  /** The created calendar event (null when limitResponsePayload is true) */
  createdCalendarEvent: CalendarEvent | null;

  /** Fields that were updated by the server (null when limitResponsePayload is true) */
  updatedFields: CreateCalendarEventUpdatedFields | null;

  /** Whether the operation succeeded */
  success: boolean;

  __typename: 'CreateCalendarEventPayload';
}

/**
 * Updated fields returned in calendar event update response
 */
export interface UpdateCalendarEventUpdatedFields {
  /** Updated service IDs */
  serviceIds: CalendarEventServiceIds | null;

  /** Updated conference data */
  conferenceData: CalendarEventConferenceData | null;

  /** Updated status */
  status: string | null;

  /** Updated scheduled-to entries */
  scheduledTo: CalendarEventScheduledToEntry[] | null;

  /** Updated organizer calendar */
  organizerCalendar: CalendarEventOrganizerCalendar | null;

  /** Updated invitee list */
  inviteeList: CalendarEventInvitee[] | null;

  /** Updated location */
  location: CalendarEventLocation | null;

  /** Updated Google Calendar URL */
  googleCalendarURL: string | null;

  /** Updated hangout link */
  hangoutLink: string | null;

  /** Updated permissions */
  permissions: CalendarEventPermissions | null;

  __typename: 'UpdateCalendarEventUpdatedFields';
}

/**
 * Payload returned by updateCalendarEvent mutation
 */
export interface UpdateCalendarEventPayload {
  /** The updated calendar event (null when limitResponsePayload is true) */
  updatedCalendarEvent: CalendarEvent | null;

  /** Fields that were updated (null when limitResponsePayload is true) */
  updatedFields: UpdateCalendarEventUpdatedFields | null;

  /** Whether the operation succeeded */
  success: boolean;

  /** Whether the operation was skipped */
  skipped: boolean | null;

  __typename: 'UpdateCalendarEventPayload';
}

// ---- Input types for calendar event mutations ----

/**
 * Input for calendar event date range
 */
export interface CalendarEventDateInput {
  /** Start date (ISO 8601 string) */
  startDate: string;

  /** End date (ISO 8601 string) */
  endDate: string;

  /** Whether this is an all-day event */
  isAllDay?: boolean | null;

  /** Timezone for the event */
  timeZone?: string | null;
}

/**
 * Input for calendar event coordinate
 */
export interface CalendarEventCoordinateInput {
  /** Latitude */
  lat: number;

  /** Longitude */
  lng: number;
}

/**
 * Input for calendar event location
 */
export interface CalendarEventLocationInput {
  /** Location name */
  name?: string;

  /** Location address */
  address?: string;

  /** Location alias */
  alias?: string;

  /** Geographic coordinates */
  coordinate?: CalendarEventCoordinateInput;
}

/**
 * Input for calendar event service IDs
 */
export interface CalendarEventServiceIdsInput {
  /** Google Calendar event ID */
  google?: string | null;

  /** Microsoft Calendar event ID */
  microsoft?: string | null;

  /** Microsoft unique ID */
  microsoftUniqueId?: string | null;

  /** Apple Calendar event ID */
  apple?: string | null;

  /** Apple recurrence ID */
  appleRecurrenceId?: string | null;

  /** Sunsama internal ID */
  sunsama?: string | null;
}

/**
 * Input for calendar event scheduled-to entry
 */
export interface CalendarEventScheduledToEntryInput {
  /** Calendar ID (usually email address) */
  calendarId: string;

  /** User ID */
  userId: string;
}

/**
 * Input for calendar event organizer calendar info
 */
export interface CalendarEventOrganizerCalendarInput {
  /** Calendar ID (usually email address) */
  calendarId: string;

  /** Display name of the calendar */
  calendarDisplayName?: string;
}

/**
 * Input for calendar event permissions
 */
export interface CalendarEventPermissionsInput {
  /** Whether guests can modify the event */
  guestsCanModify?: boolean | null;

  /** Whether guests can invite others */
  guestsCanInviteOthers?: boolean | null;

  /** Whether guests can see other guests */
  guestsCanSeeOtherGuests?: boolean | null;

  /** Whether anyone can add themselves */
  anyoneCanAddSelf?: boolean | null;

  /** Whether the event is locked */
  locked?: boolean | null;

  /** Whether this is a private copy */
  privateCopy?: boolean | null;
}

/**
 * Input for calendar event visualization preference settings
 */
export interface CalendarEventVisualizationSettingsInput {
  /** Block projections setting */
  blockProjections?: boolean | null;
}

/**
 * Input for calendar event visualization preference per user
 */
export interface CalendarEventVisualizationPreferenceInput {
  /** User ID */
  userId: string;

  /** Visualization settings */
  settings: CalendarEventVisualizationSettingsInput;
}

/**
 * Input for calendar event seed task reference
 */
export interface CalendarEventSeedTaskInput {
  /** Task ID */
  _id: string;

  /** Group ID */
  groupId: string;
}

/**
 * Input for calendar event invitee
 */
export interface CalendarEventInviteeInput {
  /** User ID of the invitee */
  userId?: string | null;

  /** Email address */
  email?: string | null;

  /** Display name */
  name?: string | null;

  /** Requirement level */
  requirement?: string | null;

  /** Response status */
  status?: string | null;

  /** Profile picture URL */
  profilePicture?: string | null;

  /** Whether this is a resource */
  resource?: boolean | null;
}

/**
 * Input for conference solution key
 */
export interface ConferenceSolutionKeyInput {
  /** Type of conference solution */
  type: string;
}

/**
 * Input for conference create request
 */
export interface ConferenceCreateRequestInput {
  /** Request ID */
  requestId?: string | null;

  /** Conference solution key */
  conferenceSolutionKey?: ConferenceSolutionKeyInput | null;
}

/**
 * Input for conference entry point
 */
export interface ConferenceEntryPointInput {
  /** Type of entry point */
  entryPointType?: string | null;

  /** URI for the entry point */
  uri?: string | null;

  /** Label for the entry point */
  label?: string | null;

  /** PIN code */
  pin?: string | null;
}

/**
 * Input for conference solution
 */
export interface ConferenceSolutionInput {
  /** Solution key */
  key?: ConferenceSolutionKeyInput | null;

  /** Solution name */
  name?: string | null;

  /** Icon URI */
  iconUri?: string | null;
}

/**
 * Input for calendar event conference data
 */
export interface CalendarEventConferenceDataInput {
  /** Create request info */
  createRequest?: ConferenceCreateRequestInput | null;

  /** Entry points for joining */
  entryPoints?: ConferenceEntryPointInput[];

  /** Conference solution info */
  conferenceSolution?: ConferenceSolutionInput | null;

  /** Conference ID */
  conferenceId?: string | null;

  /** Signature */
  signature?: string | null;
}

/**
 * Input for recurring event info
 */
export interface CalendarEventRecurringEventInfoInput {
  /** Recurring event ID */
  recurringEventId?: string | null;

  /** Recurrence rule */
  recurrence?: string[] | null;
}

/**
 * Input for calendar event run date
 */
export interface CalendarEventRunDateInput {
  /** Start date */
  startDate: string;

  /** End date */
  endDate: string;
}

/**
 * Input for calendar event agenda/outcome reference
 */
export interface CalendarEventReferenceInput {
  /** Reference ID */
  _id: string;

  /** Group ID */
  groupId: string;
}

/**
 * Input for calendar event child task
 */
export interface CalendarEventChildTaskInput {
  /** Task ID */
  taskId: string;

  /** Group ID */
  groupId: string;

  /** User ID */
  userId: string;
}

/**
 * Calendar event object input for the createCalendarEvent mutation
 */
export interface CalendarEventInput {
  /** Client-generated unique ID for the event */
  _id: string;

  /** User who created the event */
  createdBy: string;

  /** Event date range */
  date: CalendarEventDateInput;

  /** List of invitees */
  inviteeList: CalendarEventInviteeInput[];

  /** Event location */
  location: CalendarEventLocationInput;

  /** Static map URL */
  staticMapUrl: string;

  /** Event status (e.g., "scheduled") */
  status: string;

  /** Event title */
  title: string;

  /** Creation timestamp */
  createdAt: string;

  /** Calendars the event is scheduled to */
  scheduledTo: CalendarEventScheduledToEntryInput[];

  /** Organizer calendar info */
  organizerCalendar: CalendarEventOrganizerCalendarInput;

  /** Calendar service (e.g., "google", "microsoft") */
  service: 'google' | 'microsoft';

  /** External service IDs */
  serviceIds: CalendarEventServiceIdsInput;

  /** Event description */
  description: string;

  /** Sequence number */
  sequence: number;

  /** Associated stream IDs */
  streamIds: string[];

  /** Last modified timestamp */
  lastModified: string;

  /** Event permissions */
  permissions: CalendarEventPermissionsInput;

  /** Hangout/meeting link */
  hangoutLink: string;

  /** Google Calendar URL */
  googleCalendarURL: string;

  /** Event transparency */
  transparency: 'opaque' | 'transparent';

  /** Event visibility */
  visibility: 'private' | 'public' | 'default' | 'confidential';

  /** Google location data */
  googleLocation: string | null;

  /** Conference data */
  conferenceData: CalendarEventConferenceDataInput | null;

  /** Recurring event info */
  recurringEventInfo: CalendarEventRecurringEventInfoInput | null;

  /** Run date info */
  runDate: CalendarEventRunDateInput | null;

  /** Agenda items */
  agenda: CalendarEventReferenceInput[];

  /** Outcome items */
  outcomes: CalendarEventReferenceInput[];

  /** Child tasks */
  childTasks: CalendarEventChildTaskInput[];

  /** Per-user visualization preferences */
  visualizationPreferences: CalendarEventVisualizationPreferenceInput[];

  /** Seed task reference (link to a task) */
  seedTask: CalendarEventSeedTaskInput | null;

  /** Event type (e.g., "default") */
  eventType: string;
}

/**
 * Input for createCalendarEvent mutation (internal GraphQL API)
 */
export interface CreateCalendarEventInput {
  /** The calendar event object to create */
  calendarEvent: CalendarEventInput;

  /** Group ID */
  groupId: string;

  /** Flag to limit response payload */
  limitResponsePayload?: boolean;
}

/**
 * Simplified options for creating a calendar event
 */
export interface CreateCalendarEventOptions {
  /** Custom event ID (if not provided, one will be generated automatically) */
  eventId?: string;

  /** Event description */
  description?: string;

  /** Calendar ID to schedule the event to (e.g., email address) */
  calendarId?: string;

  /** Calendar service to use (defaults to "google") */
  service?: 'google' | 'microsoft';

  /** Array of stream IDs to associate with the event */
  streamIds?: string[];

  /** Event visibility (defaults to "private") */
  visibility?: 'private' | 'public' | 'default' | 'confidential';

  /** Event transparency (defaults to "opaque") */
  transparency?: 'opaque' | 'transparent';

  /** Whether this is an all-day event */
  isAllDay?: boolean;

  /** Seed task ID to link this event to an existing task */
  seedTaskId?: string;

  /** When false, the full created event is returned (default: true) */
  limitResponsePayload?: boolean;
}

/**
 * Calendar event update data - the fields that can be updated on a calendar event
 */
export interface CalendarEventUpdateData {
  /** Event ID */
  _id: string;

  /** User ID of the creator */
  createdBy: string;

  /** Event date range */
  date: {
    startDate: string;
    endDate: string;
    isAllDay?: boolean | null;
    timeZone?: string | null;
  };

  /** List of invitees */
  inviteeList: Array<{
    userId?: string | null;
    email?: string | null;
    name?: string | null;
    requirement?: string | null;
    status?: string | null;
    type?: { admin?: boolean | null; guest?: boolean | null } | null;
    profilePicture?: string | null;
    resource?: boolean | null;
  }>;

  /** Event location */
  location: {
    name: string;
    address: string;
    alias: string;
    coordinate: { lat: number; lng: number };
  };

  /** Static map URL */
  staticMapUrl: string;

  /** Event status */
  status: string;

  /** Event title */
  title: string;

  /** When the event was created */
  createdAt: string;

  /** Calendar(s) the event is scheduled to */
  scheduledTo: Array<{ calendarId: string; userId: string }>;

  /** Organizer calendar info */
  organizerCalendar: {
    calendarId: string;
    calendarDisplayName?: string | null;
  };

  /** Calendar service (e.g., "google", "microsoft") */
  service: string;

  /** Cross-service IDs */
  serviceIds: {
    google?: string | null;
    microsoft?: string | null;
    microsoftUniqueId?: string | null;
    apple?: string | null;
    appleRecurrenceId?: string | null;
    sunsama?: string | null;
  };

  /** Event description */
  description: string;

  /** Event sequence number */
  sequence: number;

  /** Stream IDs */
  streamIds: string[];

  /** Last modified timestamp */
  lastModified: string;

  /** Event permissions */
  permissions: {
    guestsCanModify?: boolean | null;
    guestsCanInviteOthers?: boolean | null;
    guestsCanSeeOtherGuests?: boolean | null;
    anyoneCanAddSelf?: boolean | null;
    locked?: boolean | null;
    privateCopy?: boolean | null;
  };

  /** Hangout link */
  hangoutLink: string;

  /** Google Calendar URL */
  googleCalendarURL: string;

  /** Transparency */
  transparency: string;

  /** Visibility */
  visibility: string;

  /** Google location */
  googleLocation: string | null;

  /** Conference data */
  conferenceData: CalendarEventConferenceDataInput | null;

  /** Recurring event info */
  recurringEventInfo: {
    recurringEventId?: string | null;
    recurrence?: string[] | null;
  } | null;

  /** Run date */
  runDate: { startDate: string; endDate: string } | null;

  /** Agenda references */
  agenda: Array<{ _id: string; groupId: string }>;

  /** Outcome references */
  outcomes: Array<{ _id: string; groupId: string }>;

  /** Child task references */
  childTasks: Array<{ taskId: string; groupId: string; userId: string }>;

  /** Visualization preferences */
  visualizationPreferences: Array<{
    userId: string;
    settings: { blockProjections?: boolean | null };
  }> | null;

  /** Seed task reference */
  seedTask: { _id: string; groupId: string } | null;

  /** Event type */
  eventType: string;
}

/**
 * Input for updateCalendarEvent mutation
 */
export interface UpdateCalendarEventInput {
  /** The calendar event update data */
  update: CalendarEventUpdateData;

  /** The event ID being updated */
  eventId: string;

  /** The group ID */
  groupId: string;

  /** Whether this is an invitee status update */
  isInviteeStatusUpdate: boolean;

  /** The invitee's email address */
  inviteeEmail: string;

  /** Whether to skip reordering */
  skipReorder: boolean;

  /** Flag to limit response payload */
  limitResponsePayload?: boolean;
}

/**
 * Simplified options for updating a calendar event
 */
export interface UpdateCalendarEventOptions {
  /** Whether this is an invitee status update (defaults to false) */
  isInviteeStatusUpdate?: boolean;

  /** Whether to skip reordering (defaults to true) */
  skipReorder?: boolean;

  /** Flag to limit response payload (defaults to true) */
  limitResponsePayload?: boolean;
}
