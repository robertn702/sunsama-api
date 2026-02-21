/**
 * Task-related GraphQL queries
 */

import { gql } from 'graphql-tag';
import {
  TASK_FRAGMENT,
  TASK_ACTUAL_TIME_FRAGMENT,
  TASK_SCHEDULED_TIME_FRAGMENT,
  TASK_INTEGRATION_FRAGMENT,
} from '../fragments/index.js';

export const GET_TASKS_BY_DAY_QUERY = gql`
  query getTasksByDay($input: GetTasksByDayInput!) {
    tasksByDayV2(input: $input) {
      ...Task
      __typename
    }
  }

  ${TASK_FRAGMENT}

  ${TASK_ACTUAL_TIME_FRAGMENT}

  ${TASK_SCHEDULED_TIME_FRAGMENT}

  ${TASK_INTEGRATION_FRAGMENT}
`;

export const GET_TASKS_BACKLOG_QUERY = gql`
  query getTasksBacklog($userId: String!, $groupId: String!) {
    tasksBacklog(userId: $userId, groupId: $groupId) {
      ...Task
      __typename
    }
  }

  ${TASK_FRAGMENT}

  ${TASK_ACTUAL_TIME_FRAGMENT}

  ${TASK_SCHEDULED_TIME_FRAGMENT}

  ${TASK_INTEGRATION_FRAGMENT}
`;

export const GET_ARCHIVED_TASKS_QUERY = gql`
  query getArchivedTasks($input: GetArchivedTasksInput!) {
    archivedTasks(input: $input) {
      ...Task
      __typename
    }
  }

  ${TASK_FRAGMENT}

  ${TASK_ACTUAL_TIME_FRAGMENT}

  ${TASK_SCHEDULED_TIME_FRAGMENT}

  ${TASK_INTEGRATION_FRAGMENT}
`;

/**
 * Query for fetching backlog tasks with cursor-based pagination
 *
 * Variables:
 * - userId: The user ID (required)
 * - groupId: The group ID (required)
 * - first: Number of tasks to fetch for forward pagination (optional)
 * - after: Cursor for forward pagination (optional)
 * - last: Number of tasks to fetch for backward pagination (optional)
 * - before: Cursor for backward pagination (optional)
 * - filter: Task filter object (optional)
 */
export const GET_TASKS_BACKLOG_BUCKETED_QUERY = gql`
  query getTasksBacklogBucketed(
    $userId: String!
    $groupId: String!
    $after: String
    $before: String
    $first: Int
    $last: Int
    $filter: TaskFilter
  ) {
    tasksBacklogBucketed(
      userId: $userId
      groupId: $groupId
      after: $after
      before: $before
      first: $first
      last: $last
      filter: $filter
    ) {
      pageInfo {
        hasNextPage
        endCursor
        __typename
      }
      tasks {
        ...Task
        __typename
      }
      __typename
    }
  }

  ${TASK_FRAGMENT}

  ${TASK_ACTUAL_TIME_FRAGMENT}

  ${TASK_SCHEDULED_TIME_FRAGMENT}

  ${TASK_INTEGRATION_FRAGMENT}
`;

export const GET_TASK_BY_ID_QUERY = gql`
  query getTaskById($taskId: String!, $groupId: String!) {
    taskById(taskId: $taskId, groupId: $groupId) {
      ...Task
      __typename
    }
  }

  ${TASK_FRAGMENT}

  ${TASK_ACTUAL_TIME_FRAGMENT}

  ${TASK_SCHEDULED_TIME_FRAGMENT}

  ${TASK_INTEGRATION_FRAGMENT}
`;
