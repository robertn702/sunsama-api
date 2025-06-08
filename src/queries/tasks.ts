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