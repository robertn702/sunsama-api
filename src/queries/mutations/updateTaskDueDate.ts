/**
 * GraphQL mutation for updating task due date
 */

import gql from 'graphql-tag';
import { TASK_FRAGMENT } from '../fragments/index.js';
import { UPDATE_TASK_PAYLOAD_FRAGMENT } from './updateTaskComplete.js';

export const UPDATE_TASK_DUE_DATE_MUTATION = gql`
  mutation updateTaskDueDate($input: UpdateTaskDueDateInput!) {
    updateTaskDueDate(input: $input) {
      ...UpdateTaskPayload
      __typename
    }
  }

  ${UPDATE_TASK_PAYLOAD_FRAGMENT}
  ${TASK_FRAGMENT}
`;
