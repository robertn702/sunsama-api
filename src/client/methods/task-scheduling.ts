/**
 * Task scheduling and reordering methods
 */

import { SunsamaError, SunsamaValidationError } from '../../errors/index.js';
import { UPDATE_TASK_MOVE_TO_PANEL_MUTATION } from '../../queries/index.js';
import type {
  GraphQLRequest,
  Task,
  UpdateTaskMoveToPanelInput,
  UpdateTaskMoveToPanelPayload,
} from '../../types/index.js';
import { dayToPanelDate } from '../../utils/index.js';
import { SubtaskMethods } from './subtasks.js';

export abstract class TaskSchedulingMethods extends SubtaskMethods {
  /**
   * Reorders a task within a day by moving it to a specific position
   *
   * This method handles the complexity of Sunsama's ordinal-based positioning system.
   * You simply specify a 0-based position and the method calculates the appropriate
   * ordinal value and constructs the full task list.
   *
   * @param taskId - The ID of the task to reorder
   * @param position - The target position (0 = top, 1 = second, etc.). Must be less than the total number of tasks for the day.
   * @param day - The day to reorder within (YYYY-MM-DD format)
   * @param options - Additional options
   * @returns The result with updated task IDs
   * @throws SunsamaAuthError if not authenticated or request fails
   *
   * @example
   * ```typescript
   * // Move a task to the top of today's list
   * const result = await client.reorderTask('taskId123', 0, '2026-01-12');
   *
   * // Move a task to position 3 (fourth from top)
   * const result = await client.reorderTask('taskId123', 3, '2026-01-12');
   *
   * // With explicit timezone
   * const result = await client.reorderTask('taskId123', 0, '2026-01-12', {
   *   timezone: 'America/New_York'
   * });
   * ```
   */
  async reorderTask(
    taskId: string,
    position: number,
    day: string,
    options?: {
      timezone?: string;
    }
  ): Promise<UpdateTaskMoveToPanelPayload> {
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      throw new SunsamaValidationError('Invalid date format. Use YYYY-MM-DD format.', 'day');
    }

    // Ensure we have user context
    if (!this.userId) {
      await this.getUser();
    }

    if (!this.userId) {
      throw new SunsamaError('Unable to determine user ID');
    }

    // Get timezone
    const timezone = options?.timezone || this.timezone || 'UTC';

    // Fetch current tasks for the day to get the task list and calculate ordinals
    const unsortedTasks = await this.getTasksByDay(day, timezone);

    // Sort tasks by ordinal (API returns them in arbitrary order)
    const tasks = [...unsortedTasks].sort((a, b) => {
      const aOrdinal = a.orderings?.[0]?.ordinal ?? 0;
      const bOrdinal = b.orderings?.[0]?.ordinal ?? 0;
      return aOrdinal - bOrdinal;
    });

    // Find the task we're moving (in the sorted list)
    const taskIndex = tasks.findIndex(t => t._id === taskId);
    if (taskIndex === -1) {
      throw new SunsamaError(`Task ${taskId} not found in day ${day}`);
    }

    // Validate position
    if (position < 0 || position >= tasks.length) {
      throw new SunsamaValidationError(
        `Invalid position ${position}. Must be between 0 and ${tasks.length - 1}`,
        'position'
      );
    }

    // Build the new task order by moving the task to the target position
    const taskIds = tasks.map(t => t._id);
    taskIds.splice(taskIndex, 1); // Remove from current position
    taskIds.splice(position, 0, taskId); // Insert at new position

    // Calculate ordinal based on neighboring tasks
    const ordinal = this.calculateOrdinal(tasks, taskIndex, position);

    // Convert day to panel date format (ISO with timezone offset)
    const panelDate = dayToPanelDate(day, timezone);

    const input: UpdateTaskMoveToPanelInput = {
      taskId,
      ordinal,
      taskIds,
      userId: this.userId,
      timezone,
      panelDate,
      movedFromPanelDate: panelDate, // Same day reorder
      isMovedFromArchive: false,
      isMovedFromRolloverToComplete: false,
      isMovedFromCompleteToRollover: false,
      isMovedWithinRollover: false,
    };

    const request: GraphQLRequest<{ input: UpdateTaskMoveToPanelInput }> = {
      operationName: 'updateTaskMoveToPanel',
      variables: { input },
      query: UPDATE_TASK_MOVE_TO_PANEL_MUTATION,
    };

    const response = await this.graphqlRequest<
      { updateTaskMoveToPanel: UpdateTaskMoveToPanelPayload },
      { input: UpdateTaskMoveToPanelInput }
    >(request);

    if (!response.data) {
      throw new SunsamaError('No response data received');
    }

    return response.data.updateTaskMoveToPanel;
  }

  /**
   * Calculates the ordinal value for a task being moved to a new position
   *
   * Sunsama uses a spacing system where ordinals have gaps between them
   * to allow for easy insertion. This method calculates an appropriate
   * ordinal based on neighboring tasks.
   *
   * @param tasks - Current list of tasks in order
   * @param fromIndex - Current index of the task being moved
   * @param toIndex - Target index for the task
   * @returns The calculated ordinal value
   * @internal
   */
  private calculateOrdinal(tasks: Task[], fromIndex: number, toIndex: number): number {
    // Get current ordinals from task orderings
    const getOrdinal = (task: Task): number => {
      const ordering = task.orderings?.[0];
      return ordering?.ordinal ?? 0;
    };

    // Build list without the moving task
    const otherTasks = tasks.filter((_, i) => i !== fromIndex);

    if (otherTasks.length === 0) {
      // Only task in the list
      return 1024;
    }

    if (toIndex === 0) {
      // Moving to top - place before first task's ordinal.
      // Use midpoint when possible to avoid negative ordinals; fall back to
      // subtraction only when the first ordinal is already at or below zero.
      const firstOrdinal = getOrdinal(otherTasks[0]!);
      return firstOrdinal > 0 ? Math.floor(firstOrdinal / 2) : firstOrdinal - 1024;
    }

    if (toIndex >= otherTasks.length) {
      // Moving to bottom - add spacing to last task's ordinal
      const lastOrdinal = getOrdinal(otherTasks[otherTasks.length - 1]!);
      return lastOrdinal + 1024;
    }

    // Moving between two tasks - use midpoint
    const prevOrdinal = getOrdinal(otherTasks[toIndex - 1]!);
    const nextOrdinal = getOrdinal(otherTasks[toIndex]!);
    return Math.floor((prevOrdinal + nextOrdinal) / 2);
  }
}
