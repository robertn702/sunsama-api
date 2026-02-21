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

/**
 * Mutation for creating subtasks on a task
 *
 * This registers new subtask IDs with the parent task. After calling this,
 * use updateTaskSubtaskTitle to set the title for each subtask.
 *
 * Variables:
 * - input.taskId: The parent task ID
 * - input.addedSubtaskIds: Array of new subtask IDs to register (24-char hex)
 * - input.limitResponsePayload: Flag to limit response size (optional)
 */
export const CREATE_TASK_SUBTASKS_MUTATION = gql`
  mutation createTaskSubtasks($input: CreateTaskSubtasksInput!) {
    createTaskSubtasks(input: $input) {
      ...UpdateTaskPayload
      __typename
    }
  }
  ${UPDATE_TASK_PAYLOAD_FRAGMENT}
`;

/**
 * Mutation for updating a subtask's title
 *
 * Variables:
 * - input.taskId: The parent task ID
 * - input.subtaskId: The subtask ID to update
 * - input.title: The new subtask title
 * - input.addedSubtaskIds: Additional subtask IDs to add (optional, can be empty array)
 */
export const UPDATE_TASK_SUBTASK_TITLE_MUTATION = gql`
  mutation updateTaskSubtaskTitle($input: UpdateTaskSubtaskTitleInput!) {
    updateTaskSubtaskTitle(input: $input) {
      ...UpdateTaskPayload
      __typename
    }
  }
  ${UPDATE_TASK_PAYLOAD_FRAGMENT}
`;

/**
 * Mutation for marking a subtask as complete
 *
 * Variables:
 * - input.taskId: The parent task ID
 * - input.subtaskId: The subtask ID to mark as complete
 * - input.completedDate: ISO 8601 timestamp when completed (required)
 * - input.limitResponsePayload: Flag to limit response size (optional)
 */
export const UPDATE_TASK_SUBTASK_COMPLETE_MUTATION = gql`
  mutation updateTaskSubtaskComplete($input: UpdateTaskSubtaskCompleteInput!) {
    updateTaskSubtaskComplete(input: $input) {
      ...UpdateTaskPayload
      __typename
    }
  }
  ${UPDATE_TASK_PAYLOAD_FRAGMENT}
`;

/**
 * GraphQL mutation for marking a subtask as incomplete
 *
 * Input variables:
 * - input.taskId: The parent task ID
 * - input.subtaskId: The subtask ID to mark as incomplete
 * - input.limitResponsePayload: Flag to limit response size (optional)
 */
export const UPDATE_TASK_SUBTASK_UNCOMPLETE_MUTATION = gql`
  mutation updateTaskSubtaskUncomplete($input: UpdateTaskSubtaskUncompleteInput!) {
    updateTaskSubtaskUncomplete(input: $input) {
      ...UpdateTaskPayload
      __typename
    }
  }
  ${UPDATE_TASK_PAYLOAD_FRAGMENT}
`;

/**
 * Mutation for marking a task as incomplete (uncompleting it)
 *
 * Variables:
 * - input.taskId: The ID of the task to mark as incomplete
 * - input.limitResponsePayload: Flag to limit response size (optional)
 */
export const UPDATE_TASK_UNCOMPLETE_MUTATION = gql`
  mutation updateTaskUncomplete($input: UpdateTaskUncompleteInput!) {
    updateTaskUncomplete(input: $input) {
      ...UpdateTaskPayload
      __typename
    }
  }
  ${UPDATE_TASK_PAYLOAD_FRAGMENT}
`;

/**
 * Mutation for moving/reordering a task within a day panel
 *
 * Variables:
 * - input.taskId: The ID of the task being moved
 * - input.ordinal: The new ordinal position value
 * - input.taskIds: All task IDs in the panel in order
 * - input.userId: The user ID
 * - input.timezone: User's timezone (e.g., "America/Denver")
 * - input.panelDate: Target panel date (ISO format)
 * - input.movedFromPanelDate: Source panel date (ISO format)
 * - input.isMovedFromArchive: Whether task was moved from archive
 * - input.isMovedFromRolloverToComplete: Whether moved from rollover to complete
 * - input.isMovedFromCompleteToRollover: Whether moved from complete to rollover
 * - input.isMovedWithinRollover: Whether moved within rollover
 */
export const UPDATE_TASK_MOVE_TO_PANEL_MUTATION = gql`
  mutation updateTaskMoveToPanel($input: UpdateTaskMoveToPanelInput!) {
    updateTaskMoveToPanel(input: $input) {
      updatedTaskIds
      __typename
    }
  }
`;
