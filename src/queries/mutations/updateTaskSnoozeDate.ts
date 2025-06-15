/**
 * GraphQL mutation for updating task snooze date
 */

import gql from 'graphql-tag';
import { TASK_FRAGMENT } from '../fragments/index.js';
import { UPDATE_TASK_PAYLOAD_FRAGMENT } from './updateTaskComplete.js';

export const UPDATE_TASK_SNOOZE_DATE_MUTATION = gql`
  mutation updateTaskSnoozeDate($input: UpdateTaskSnoozeDateInput!) {
    updateTaskSnoozeDate(input: $input) {
      ...UpdateTaskPayload
      __typename
    }
  }

  ${UPDATE_TASK_PAYLOAD_FRAGMENT}
  ${TASK_FRAGMENT}
`;
