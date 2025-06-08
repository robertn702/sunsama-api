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
export interface GraphQLResponse<T = any> {
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
export interface GraphQLRequest {
  operationName: string;
  variables: Record<string, any>;
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
  onboarding?: any;
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
  waitList?: any;
  weeklyPlanning?: WeeklySchedule;
  weeklyReview?: WeeklySchedule;
  lastArchiveCheckDate?: string;
  integrationRequests?: any;
  dayStart?: DayBoundary;
  plannedDayStart?: DayBoundary;
  dayEnd?: DayBoundary;
  waitlistId?: string;
  trialPeriod?: any;
  qualificationAssessment?: any;
  disappointmentIndex?: any;
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
  day: string;        // ISO date string like "2025-05-31"
  timezone: string;   // Timezone like "America/New_York"
  userId: string;     // User ID
  groupId: string;    // Group ID
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
  integration?: TaskIntegration | null;
  mergedTaskId?: string | null;
  recommendedTimeEstimate?: number | null;
  __typename: 'TaskSubtask';
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
  template?: any | null; // Complex nested structure
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
export interface TaskIntegration {
  service: string;
  __typename: string;
}

/**
 * Website integration for tasks
 */
export interface TaskWebsiteIntegration extends TaskIntegration {
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
export interface TaskGoogleCalendarIntegration extends TaskIntegration {
  service: 'googleCalendar';
  identifier: {
    sunsamaId: string;
    __typename: 'TaskGoogleCalendarIntegrationIdentifier';
  };
  __typename: 'TaskGoogleCalendarIntegration';
}

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
  collabSnapshot?: any | null; // Complex object for collaborative editing
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
