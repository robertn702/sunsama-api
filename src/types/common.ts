/**
 * Common utility types used throughout the library
 */

/**
 * Make specified properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specified properties required
 */
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * ISO 8601 date string
 */
export type ISODateString = string;

/**
 * UUID string
 */
export type UUID = string;

/**
 * Non-empty string
 */
export type NonEmptyString = string & { readonly __brand: unique symbol };

/**
 * Positive number
 */
export type PositiveNumber = number & { readonly __brand: unique symbol };

/**
 * Represents a value that can be null or undefined
 */
export type Nullable<T> = T | null | undefined;

/**
 * Utility type for API endpoints that return lists
 */
export type ListResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

/**
 * Base entity properties that most API resources have
 */
export interface BaseEntity {
  /** Unique identifier */
  id: UUID;
  
  /** Creation timestamp */
  createdAt: ISODateString;
  
  /** Last update timestamp */
  updatedAt: ISODateString;
}
