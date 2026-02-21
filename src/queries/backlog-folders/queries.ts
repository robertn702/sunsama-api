/**
 * Backlog folder-related GraphQL queries
 */

import { gql } from 'graphql-tag';

/**
 * Fragment for BacklogFolder fields
 */
export const BACKLOG_FOLDER_FRAGMENT = gql`
  fragment BacklogFolder on BacklogFolder {
    _id
    name
    position
    groupId
    userId
    deleted
    createdAt
    lastModified
    __typename
  }
`;

/**
 * Query to get backlog folders for a user in a group
 *
 * Variables:
 * - userId: The user's ID
 * - groupId: The group's ID
 */
export const GET_BACKLOG_FOLDERS_QUERY = gql`
  query getBacklogFolders($userId: String!, $groupId: String!) {
    backlogFolders(userId: $userId, groupId: $groupId) {
      ...BacklogFolder
      __typename
    }
  }

  ${BACKLOG_FOLDER_FRAGMENT}
`;
