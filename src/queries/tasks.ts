/**
 * Task-related GraphQL queries
 */

import { gql } from 'graphql-tag';
import {
  TASK_FRAGMENT,
  TASK_ACTUAL_TIME_FRAGMENT,
  TASK_SCHEDULED_TIME_FRAGMENT,
  TASK_INTEGRATION_FRAGMENT,
} from './fragments/index.js';

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
