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
