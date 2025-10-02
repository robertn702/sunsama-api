/**
 * GraphQL fragments for mutation responses
 */

import { gql } from 'graphql-tag';
import {
  TASK_FRAGMENT,
  TASK_ACTUAL_TIME_FRAGMENT,
  TASK_SCHEDULED_TIME_FRAGMENT,
  TASK_INTEGRATION_FRAGMENT,
} from './task.js';

/**
 * Fragment for PartialTask structure
 * Used in update operations to return only modified fields
 */
export const PARTIAL_TASK_FRAGMENT = gql`
  fragment PartialTask on PartialTask {
    _id
    recommendedStreamId
    streamIds
    recommendedTimeEstimate
    subtasks {
      _id
      title
      completedDate
      completedBy
      timeEstimate
      actualTime {
        ...TaskActualTime
        __typename
      }
      snooze {
        userId
        date
        until
        __typename
      }
      scheduledTime {
        ...TaskScheduledTime
        __typename
      }
      integration {
        ...TaskIntegration
        __typename
      }
      mergedTaskId
      recommendedTimeEstimate
      __typename
    }
    __typename
  }
  ${TASK_ACTUAL_TIME_FRAGMENT}
  ${TASK_SCHEDULED_TIME_FRAGMENT}
  ${TASK_INTEGRATION_FRAGMENT}
`;

/**
 * Fragment for UpdateTaskPayload structure
 * Defines the response structure for task update mutations
 */
export const UPDATE_TASK_PAYLOAD_FRAGMENT = gql`
  fragment UpdateTaskPayload on UpdateTaskPayload {
    updatedTask {
      ...Task
      __typename
    }
    updatedFields {
      ...PartialTask
      __typename
    }
    success
    skipped
    __typename
  }
  ${TASK_FRAGMENT}
  ${PARTIAL_TASK_FRAGMENT}
`;
