/**
 * GraphQL mutation for deleting a task
 */

import { gql } from 'graphql-tag';
import { UPDATE_TASK_PAYLOAD_FRAGMENT } from './updateTaskComplete.js';

/**
 * Mutation for deleting a task
 *
 * Variables:
 * - input.taskId: The ID of the task to delete
 * - input.limitResponsePayload: Flag to limit response size (optional)
 * - input.wasTaskMerged: Whether the task was merged before deletion (optional)
 */
export const UPDATE_TASK_DELETE_MUTATION = gql`
  mutation updateTaskDelete($input: UpdateTaskDeleteInput!) {
    updateTaskDelete(input: $input) {
      ...UpdateTaskPayload
      __typename
    }
  }
  ${UPDATE_TASK_PAYLOAD_FRAGMENT}
`;
