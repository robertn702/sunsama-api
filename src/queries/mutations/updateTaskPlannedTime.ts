/**
 * GraphQL mutation for updating a task's planned time
 */

import { gql } from 'graphql-tag';
import { UPDATE_TASK_PAYLOAD_FRAGMENT } from './updateTaskComplete.js';

/**
 * Mutation for updating a task's planned time (time estimate)
 *
 * Variables:
 * - input.taskId: The ID of the task to update
 * - input.timeInSeconds: The planned time in seconds (timeEstimate * 60)
 * - input.limitResponsePayload: Flag to limit response size (optional)
 */
export const UPDATE_TASK_PLANNED_TIME_MUTATION = gql`
  mutation updateTaskPlannedTime($input: UpdateTaskPlannedTimeInput!) {
    updateTaskPlannedTime(input: $input) {
      ...UpdateTaskPayload
      __typename
    }
  }
  ${UPDATE_TASK_PAYLOAD_FRAGMENT}
`;
