/**
 * API response and data types
 * 
 * These types represent the structure of data returned by the Sunsama API.
 * They will be populated based on the actual API documentation.
 */

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
  query: string;
}

/**
 * User profile data
 */
export interface User {
  _id: string;
  activationDate?: string;
  admin?: boolean;
  aka?: string;
  emails: Array<{
    address: string;
    verified: boolean;
  }>;
  profile: {
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
    };
    useCase?: string;
    onboardingEventSent?: boolean;
  };
  preferences: {
    clockStyle?: string;
    defaultCalendarView?: string;
    defaultHomeView?: string;
    defaultMainPanel?: string;
    darkMode?: boolean;
    keyboardShortcuts?: boolean;
    autoArchiveThreshold?: number;
    workingSessionDuration?: number;
    // Add more preference fields as needed
  };
  username?: string;
  createdAt?: string;
  lastModified?: string;
  nodeId?: string;
  daysPlanned?: number;
  daysShutdown?: number;
  // Simplified - the full response has many more fields
}

/**
 * Response for getUser query
 */
export interface GetUserResponse {
  currentUser: User;
}
