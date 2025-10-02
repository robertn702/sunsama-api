/**
 * Task-related GraphQL mutations
 */

import { gql } from 'graphql-tag';
import { UPDATE_TASK_PAYLOAD_FRAGMENT } from '../fragments/index.js';

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

/**
 * Mutation for marking a task as complete
 *
 * Variables:
 * - input.taskId: The ID of the task to mark complete
 * - input.completeOn: ISO 8601 timestamp when the task was completed
 * - input.limitResponsePayload: Flag to limit response size (optional)
 */
export const UPDATE_TASK_COMPLETE_MUTATION = gql`
  mutation updateTaskComplete($input: UpdateTaskCompleteInput!) {
    updateTaskComplete(input: $input) {
      ...UpdateTaskPayload
      __typename
    }
  }
  ${UPDATE_TASK_PAYLOAD_FRAGMENT}
`;

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

/**
 * Mutation for updating task due date
 *
 * Variables:
 * - input.taskId: The ID of the task to update
 * - input.dueDate: ISO 8601 timestamp for the due date
 * - input.limitResponsePayload: Flag to limit response size (optional)
 */
export const UPDATE_TASK_DUE_DATE_MUTATION = gql`
  mutation updateTaskDueDate($input: UpdateTaskDueDateInput!) {
    updateTaskDueDate(input: $input) {
      ...UpdateTaskPayload
      __typename
    }
  }

  ${UPDATE_TASK_PAYLOAD_FRAGMENT}
`;

/**
 * Mutation for updating task notes
 *
 * Variables:
 * - input.taskId: The ID of the task to update
 * - input.notes: The updated notes content
 * - input.limitResponsePayload: Flag to limit response size (optional)
 */
export const UPDATE_TASK_NOTES_MUTATION = gql`
  mutation updateTaskNotes($input: UpdateTaskNotesInput!) {
    updateTaskNotes(input: $input) {
      ...UpdateTaskPayload
      __typename
    }
  }
  ${UPDATE_TASK_PAYLOAD_FRAGMENT}
`;

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

/**
 * Mutation for updating task snooze date
 *
 * Variables:
 * - input.taskId: The ID of the task to update
 * - input.snoozeDate: ISO 8601 timestamp for when to un-snooze the task
 * - input.limitResponsePayload: Flag to limit response size (optional)
 */
export const UPDATE_TASK_SNOOZE_DATE_MUTATION = gql`
  mutation updateTaskSnoozeDate($input: UpdateTaskSnoozeDateInput!) {
    updateTaskSnoozeDate(input: $input) {
      ...UpdateTaskPayload
      __typename
    }
  }

  ${UPDATE_TASK_PAYLOAD_FRAGMENT}
`;

/**
 * Mutation for updating task stream assignment
 *
 * Variables:
 * - input.taskId: The ID of the task to update
 * - input.streamIds: Array of stream IDs to assign the task to
 * - input.limitResponsePayload: Flag to limit response size (optional)
 */
export const UPDATE_TASK_STREAM_MUTATION = gql`
  mutation updateTaskStream($input: UpdateTaskStreamInput!) {
    updateTaskStream(input: $input) {
      ...UpdateTaskPayload
      __typename
    }
  }
  ${UPDATE_TASK_PAYLOAD_FRAGMENT}
`;

/**
 * Mutation for updating task text/title
 *
 * Variables:
 * - input.taskId: The ID of the task to update
 * - input.text: The updated task title/text
 * - input.limitResponsePayload: Flag to limit response size (optional)
 */
export const UPDATE_TASK_TEXT_MUTATION = gql`
  mutation updateTaskText($input: UpdateTaskTextInput!) {
    updateTaskText(input: $input) {
      ...UpdateTaskPayload
      __typename
    }
  }
  ${UPDATE_TASK_PAYLOAD_FRAGMENT}
`;
