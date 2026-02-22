/**
 * Backlog folder-related GraphQL mutations
 */

import { gql } from 'graphql-tag';

/**
 * Mutation for updating the backlog folder assignment for multiple tasks
 *
 * Variables:
 * - input.taskIds: Array of task IDs to update
 * - input.folderId: The folder ID to move tasks into, or null to remove from folder
 */
export const UPDATE_TASKS_BACKLOG_FOLDER_MUTATION = gql`
  mutation updateTasksBacklogFolder($input: UpdateTasksBacklogFolderInput!) {
    updateTasksBacklogFolder(input: $input) {
      updatedTaskIds
      __typename
    }
  }
`;
