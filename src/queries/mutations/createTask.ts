/**
 * GraphQL mutation for creating a new task
 */

import { gql } from 'graphql-tag';

/**
 * Mutation for creating a new task
 *
 * Variables:
 * - task: The complete task object to create
 * - groupId: The group ID (duplicated from task for API requirements)
 * - position: Optional position parameter
 */
export const CREATE_TASK_MUTATION = gql`
  mutation createTask($task: TaskInput!, $groupId: String!, $position: String) {
    createTaskV2(task: $task, groupId: $groupId, position: $position) {
      success
      error
      updatedFields {
        recommendedStreamId
        streamIds
        recommendedTimeEstimate
        timeEstimate
        __typename
      }
      __typename
    }
  }
`;