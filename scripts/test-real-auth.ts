#!/usr/bin/env tsx

/**
 * Test script for real Sunsama authentication and API methods
 *
 * This script tests the authentication and various API methods with real credentials
 * from environment variables. It creates a single task, marks it complete, and deletes it
 * to test the full CRUD workflow.
 */

import 'dotenv/config';
import { SunsamaClient } from '../src/client';

async function testRealAuth() {
  console.log('🧪 Testing Sunsama API with Real Credentials (Full CRUD Workflow)\n');

  // Get credentials from environment
  const email = process.env['SUNSAMA_EMAIL'];
  const password = process.env['SUNSAMA_PASSWORD'];

  if (!email || !password) {
    console.error('❌ Missing credentials in .env file');
    console.error('   Please set SUNSAMA_EMAIL and SUNSAMA_PASSWORD');
    process.exit(1);
  }

  try {
    // Create client
    console.log('📝 Creating Sunsama client...');
    const client = new SunsamaClient();

    // Test authentication state before login
    console.log('🔍 Checking initial authentication state...');
    const initialAuth = await client.isAuthenticated();
    console.log(`   Initially authenticated: ${initialAuth}`);

    // Attempt login
    console.log('\n🔐 Attempting login...');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${'*'.repeat(password.length)}`);

    await client.login(email, password);
    console.log('✅ Login successful!');

    // Test authentication state after login
    console.log('\n🔍 Checking authentication state after login...');
    const postLoginAuth = await client.isAuthenticated();
    console.log(`   Now authenticated: ${postLoginAuth}`);

    // Test getUser method
    console.log('\n👤 Testing getUser method...');
    const user = await client.getUser();

    console.log('✅ getUser successful!');
    console.log('\n📊 User Information:');
    console.log(`   ID: ${user._id}`);
    console.log(`   Username: ${user.username || 'N/A'}`);
    console.log(`   Name: ${user.profile.firstname || 'N/A'} ${user.profile.lastname || 'N/A'}`);
    console.log(`   Email: ${user.emails[0]?.address || 'N/A'}`);
    console.log(`   Timezone: ${user.profile.timezone || 'N/A'}`);
    console.log(`   Created: ${user.createdAt || 'N/A'}`);
    console.log(`   Days Planned: ${user.daysPlanned || 0}`);
    console.log(`   Admin: ${user.admin || false}`);

    // Test getTasksByDay method
    console.log('\n📋 Testing getTasksByDay method...');
    const today = new Date().toISOString().split('T')[0]!; // Get today in YYYY-MM-DD format
    console.log(`   Testing with date: ${today}`);
    const tasks = await client.getTasksByDay(today);

    // Also test with a specific date that we know has tasks
    console.log('\n📋 Testing getTasksByDay with known date (2025-06-10)...');
    const testDate = '2025-06-10';
    const testTasks = await client.getTasksByDay(testDate);

    console.log('✅ getTasksByDay successful!');
    console.log('\n📊 Tasks Information:');
    console.log(`   Tasks for ${today}: ${tasks.length}`);
    console.log(`   Tasks for ${testDate}: ${testTasks.length}`);

    // Display sample tasks from either date
    const allTasks = [...tasks, ...testTasks];
    if (allTasks.length > 0) {
      console.log('\n📝 Sample tasks:');
      allTasks.slice(0, 3).forEach((task, index) => {
        console.log(`   ${index + 1}. ${task.text}`);
        console.log(`      ID: ${task._id}`);
        console.log(`      Completed: ${task.completed}`);
        console.log(`      Time Estimate: ${task.timeEstimate || 'N/A'} minutes`);
        console.log(`      Subtasks: ${task.subtasks.length}`);
        if (task.integration) {
          console.log(`      Integration: ${task.integration.service}`);
        }
        console.log('');
      });
    } else {
      console.log('   No tasks found for either date');
    }

    // Test getTasksBacklog method
    console.log('\n📋 Testing getTasksBacklog method...');
    const backlogTasks = await client.getTasksBacklog();

    console.log('✅ getTasksBacklog successful!');
    console.log(`\n📊 Backlog Information: ${backlogTasks.length} tasks`);

    if (backlogTasks.length > 0) {
      console.log('\n📝 Sample backlog tasks:');
      backlogTasks.slice(0, 3).forEach((task, index) => {
        console.log(`   ${index + 1}. ${task.text}`);
        console.log(`      ID: ${task._id}`);
        console.log(`      Completed: ${task.completed}`);
        console.log(`      Time Estimate: ${task.timeEstimate || 'N/A'} minutes`);
        console.log(`      Subtasks: ${task.subtasks.length}`);
        if (task.integration) {
          console.log(`      Integration: ${task.integration.service}`);
        }
        console.log('');
      });
    } else {
      console.log('   No tasks found in backlog');
    }

    // Test getArchivedTasks method
    console.log('\n📋 Testing getArchivedTasks method...');
    const archivedTasks = await client.getArchivedTasks();

    console.log('✅ getArchivedTasks successful!');
    console.log(`\n📊 Archived Tasks Information: ${archivedTasks.length} tasks`);

    if (archivedTasks.length > 0) {
      console.log('\n📝 Sample archived tasks:');
      archivedTasks.slice(0, 3).forEach((task, index) => {
        console.log(`   ${index + 1}. ${task.text}`);
        console.log(`      ID: ${task._id}`);
        console.log(`      Completed: ${task.completed}`);
        console.log(`      Archived At: ${task.archivedAt || 'N/A'}`);
        console.log(`      Time Estimate: ${task.timeEstimate || 'N/A'} minutes`);
        console.log(`      Subtasks: ${task.subtasks.length}`);
        if (task.integration) {
          console.log(`      Integration: ${task.integration.service}`);
        }
        console.log('');
      });

      // Test pagination with getArchivedTasks
      if (archivedTasks.length >= 10) {
        console.log('\n📋 Testing getArchivedTasks pagination...');
        const paginatedTasks = await client.getArchivedTasks(5, 3); // offset 5, limit 3
        console.log(`   Paginated tasks (offset 5, limit 3): ${paginatedTasks.length} tasks`);

        if (paginatedTasks.length > 0) {
          console.log('   Sample paginated tasks:');
          paginatedTasks.forEach((task, index) => {
            console.log(`     ${index + 1}. ${task.text} (${task._id})`);
          });
        }
      }
    } else {
      console.log('   No archived tasks found');
    }

    // Test getStreamsByGroupId method
    console.log('\n🌊 Testing getStreamsByGroupId method...');
    const streams = await client.getStreamsByGroupId();

    console.log('✅ getStreamsByGroupId successful!');
    console.log(`\n📊 Streams Information: ${streams.length} streams`);

    if (streams.length > 0) {
      console.log('\n📝 Sample streams:');
      streams.slice(0, 5).forEach((stream, index) => {
        console.log(`   ${index + 1}. ${stream.streamName}`);
        console.log(`      ID: ${stream._id}`);
        console.log(`      Status: ${stream.status}`);
        console.log(`      Color: ${stream.color}`);
        console.log(`      Private: ${stream.private}`);
        console.log(`      Members: ${stream.memberIds.length}`);
        console.log(`      Integrations: ${stream.projectIntegrations.length}`);
        if (stream.description) {
          console.log(`      Description: ${stream.description}`);
        }
        console.log('');
      });
    } else {
      console.log('   No streams found for group');
    }

    // Test getTaskById method with existing tasks
    console.log('\n🔍 Testing getTaskById method...');

    let testTaskId: string | undefined;

    // Try to get an existing task ID from our task lists
    if (allTasks.length > 0) {
      testTaskId = allTasks[0]!._id;
      console.log(`   Testing with existing task ID: ${testTaskId}`);

      const existingTask = await client.getTaskById(testTaskId);

      if (existingTask) {
        console.log('✅ getTaskById successful!');
        console.log('\n📊 Retrieved Task Information:');
        console.log(`   Task ID: ${existingTask._id}`);
        console.log(`   Text: ${existingTask.text}`);
        console.log(`   Completed: ${existingTask.completed}`);
        console.log(`   Created: ${existingTask.createdAt}`);
        console.log(`   Last Modified: ${existingTask.lastModified}`);
        console.log(`   Time Estimate: ${existingTask.timeEstimate || 'N/A'} minutes`);
        console.log(`   Subtasks: ${existingTask.subtasks.length}`);
        console.log(`   Comments: ${existingTask.comments.length}`);
        if (existingTask.integration) {
          console.log(`   Integration: ${existingTask.integration.service}`);
        }
        if (existingTask.snooze) {
          console.log(`   Snooze until: ${existingTask.snooze.until}`);
        }
        console.log(`   Stream IDs: ${existingTask.streamIds.join(', ') || 'None'}`);
      } else {
        console.log('⚠️ Task not found (returned null)');
      }
    } else {
      console.log('   No existing tasks found to test with');
    }

    // Test with a non-existent task ID
    console.log('\n   Testing with non-existent task ID...');
    const nonExistentTaskId = '507f1f77bcf86cd799439999';
    const nonExistentTask = await client.getTaskById(nonExistentTaskId);

    if (nonExistentTask === null) {
      console.log('✅ getTaskById correctly returned null for non-existent task');
    } else {
      console.log('⚠️ Unexpected: getTaskById returned a task for non-existent ID');
    }

    // Test createTask method with custom ID (for tracking through completion and deletion)
    console.log('\n✨ Testing createTask method...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const taskText = `Test Task Created by API - ${timestamp}`;

    // Generate a unique task ID for tracking
    const taskId = SunsamaClient.generateTaskId();

    const createdTask = await client.createTask(taskText, {
      taskId: taskId,
      notes:
        'This task was created by the test-real-auth script to verify the full CRUD workflow (create, complete, delete).',
      timeEstimate: 25,
      streamIds: streams.length > 0 ? [streams[0]!._id] : [],
    });

    console.log('✅ createTask successful!');
    console.log('\n📊 Created Task Information:');
    console.log(`   Success: ${createdTask.success}`);
    console.log(`   Error: ${createdTask.error || 'None'}`);
    console.log(`   Task ID: ${taskId}`);
    if (createdTask.updatedFields) {
      console.log(
        `   Recommended Stream: ${createdTask.updatedFields.recommendedStreamId || 'None'}`
      );
      console.log(`   Stream IDs: ${createdTask.updatedFields.streamIds?.join(', ') || 'None'}`);
      console.log(
        `   Time Estimate: ${createdTask.updatedFields.recommendedTimeEstimate || 'None'} minutes`
      );
    }

    // Test getTaskById with the newly created task
    console.log('\n🔍 Testing getTaskById with newly created task...');
    console.log(`   Retrieving task: ${taskId}`);
    const retrievedTask = await client.getTaskById(taskId);

    if (retrievedTask) {
      console.log('✅ getTaskById successful for created task!');
      console.log('\n📊 Retrieved Created Task Information:');
      console.log(`   Task ID: ${retrievedTask._id}`);
      console.log(`   Text: ${retrievedTask.text}`);
      console.log(`   Notes: ${retrievedTask.notes || 'None'}`);
      console.log(`   Completed: ${retrievedTask.completed}`);
      console.log(`   Time Estimate: ${retrievedTask.timeEstimate || 'N/A'} minutes`);
      console.log(`   Stream IDs: ${retrievedTask.streamIds.join(', ') || 'None'}`);
      console.log(`   Created: ${retrievedTask.createdAt}`);

      // Verify the task matches what we created
      if (retrievedTask.text === taskText) {
        console.log('✅ Task text matches what we created');
      } else {
        console.log('⚠️ Task text does not match what we created');
      }
    } else {
      console.log('❌ Failed to retrieve newly created task');
    }

    // Test updateTaskSnoozeDate method (unified scheduling operations)
    console.log('\n📅 Testing updateTaskSnoozeDate method...');

    // First, schedule the task to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0]!;

    console.log(`   Scheduling task to tomorrow (${tomorrowStr}): ${taskId}`);
    const scheduleResult = await client.updateTaskSnoozeDate(taskId, tomorrowStr);

    console.log('✅ updateTaskSnoozeDate (schedule) successful!');
    console.log('📊 Schedule Task Information:');
    console.log(`   Success: ${scheduleResult.success}`);
    if (scheduleResult.updatedFields) {
      console.log(`   Task ID: ${scheduleResult.updatedFields._id}`);
      console.log(`   New snooze date: ${scheduleResult.updatedFields.snooze?.until || 'None'}`);
    } else {
      console.log('   updatedFields: null (limitResponsePayload=true)');
    }

    // Then move to backlog
    console.log(`\n   Moving task to backlog: ${taskId}`);
    const backlogResult = await client.updateTaskSnoozeDate(taskId, null);

    console.log('✅ updateTaskSnoozeDate (backlog) successful!');
    console.log('📊 Move to Backlog Information:');
    console.log(`   Success: ${backlogResult.success}`);
    if (backlogResult.updatedFields) {
      console.log(`   Task ID: ${backlogResult.updatedFields._id}`);
      console.log(
        `   Snooze status: ${backlogResult.updatedFields.snooze ? 'Snoozed' : 'In backlog'}`
      );
    } else {
      console.log('   updatedFields: null (limitResponsePayload=true)');
    }

    // Finally, schedule it back to today
    console.log(`\n   Scheduling backlog task to today (${today}): ${taskId}`);
    const rescheduleResult = await client.updateTaskSnoozeDate(taskId, today);

    console.log('✅ updateTaskSnoozeDate (reschedule) successful!');
    console.log('📊 Reschedule Task Information:');
    console.log(`   Success: ${rescheduleResult.success}`);
    if (rescheduleResult.updatedFields) {
      console.log(`   Task ID: ${rescheduleResult.updatedFields._id}`);
      console.log(`   New snooze date: ${rescheduleResult.updatedFields.snooze?.until || 'None'}`);
    } else {
      console.log('   updatedFields: null (limitResponsePayload=true)');
    }

    // Test updateTaskNotes method
    console.log('\n📝 Testing updateTaskNotes method...');
    const notesTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const htmlNotes = `<p>These are updated notes for the test task - ${notesTimestamp}</p><p>This includes <strong>bold text</strong> and multiple paragraphs.</p>`;

    console.log(`   Updating notes for task: ${taskId}`);
    console.log(`   HTML notes preview: ${htmlNotes.substring(0, 50)}...`);

    const notesResult = await client.updateTaskNotes(taskId, { html: htmlNotes });

    console.log('✅ updateTaskNotes successful!');
    console.log('\n📊 Task Notes Update Information:');
    console.log(`   Success: ${notesResult.success}`);
    console.log(`   Skipped: ${notesResult.skipped || false}`);
    if (notesResult.updatedFields) {
      console.log(`   Task ID: ${notesResult.updatedFields._id}`);
      console.log(`   Stream IDs: ${notesResult.updatedFields.streamIds?.join(', ') || 'None'}`);
    } else {
      console.log('   updatedFields: null (limitResponsePayload=true)');
    }

    // Test updateTaskNotes with explicit collabSnapshot option
    console.log('\n📝 Testing updateTaskNotes with explicit collabSnapshot...');

    // First get the task to extract its collaborative snapshot
    const taskForSnapshot = await client.getTaskById(taskId);
    if (taskForSnapshot?.collabSnapshot) {
      const explicitMarkdown = `Explicit snapshot notes update - ${notesTimestamp}`;

      const explicitResult = await client.updateTaskNotes(
        taskId,
        { markdown: explicitMarkdown },
        {
          collabSnapshot: taskForSnapshot.collabSnapshot,
          limitResponsePayload: false,
        }
      );

      console.log('✅ updateTaskNotes with explicit collabSnapshot successful!');
      console.log(`   Success: ${explicitResult.success}`);
      console.log(`   Used explicit snapshot: true`);
      if (explicitResult.updatedFields) {
        console.log(`   Task ID: ${explicitResult.updatedFields._id}`);
      }
    } else {
      console.log(
        '⚠️ Task does not have a collaborative snapshot, skipping explicit snapshot test'
      );
    }

    // Verify the notes were updated by retrieving the task
    console.log('\n🔍 Verifying notes update by retrieving task...');
    const updatedTask = await client.getTaskById(taskId);
    if (updatedTask) {
      console.log('✅ Task retrieved successfully after notes update');
      console.log(`   Updated notes preview: ${updatedTask.notes?.substring(0, 100) || 'None'}...`);
      console.log(
        `   Notes markdown preview: ${updatedTask.notesMarkdown?.substring(0, 100) || 'None'}...`
      );

      // Check if notes were actually updated
      if (updatedTask.notes && updatedTask.notes.includes(notesTimestamp)) {
        console.log('✅ Notes were successfully updated with timestamp');
      } else {
        console.log('⚠️ Notes may not have been updated or timestamp not found');
      }
    } else {
      console.log('❌ Failed to retrieve task after notes update');
    }

    // Test updateTaskPlannedTime method
    console.log('\n⏱️ Testing updateTaskPlannedTime method...');
    console.log(`   Setting planned time for task: ${taskId}`);

    // Test setting time estimate to 45 minutes
    console.log('   Setting time estimate to 45 minutes...');
    const plannedTimeResult = await client.updateTaskPlannedTime(taskId, 45);

    console.log('✅ updateTaskPlannedTime successful!');
    console.log('\n📊 Task Planned Time Update Information:');
    console.log(`   Success: ${plannedTimeResult.success}`);
    console.log(`   Skipped: ${plannedTimeResult.skipped || false}`);
    if (plannedTimeResult.updatedFields) {
      console.log(`   Task ID: ${plannedTimeResult.updatedFields._id}`);
      console.log(
        `   Recommended Time Estimate: ${plannedTimeResult.updatedFields.recommendedTimeEstimate || 'None'} minutes`
      );
    } else {
      console.log('   updatedFields: null (limitResponsePayload=true)');
    }

    // Test updating to a different time estimate
    console.log('\n   Updating time estimate to 30 minutes...');
    const plannedTimeResult2 = await client.updateTaskPlannedTime(taskId, 30, false);

    console.log('✅ updateTaskPlannedTime (second update) successful!');
    console.log('📊 Task Planned Time Update Information:');
    console.log(`   Success: ${plannedTimeResult2.success}`);
    console.log(`   Skipped: ${plannedTimeResult2.skipped || false}`);
    if (plannedTimeResult2.updatedFields) {
      console.log(`   Task ID: ${plannedTimeResult2.updatedFields._id}`);
      console.log(
        `   Recommended Time Estimate: ${plannedTimeResult2.updatedFields.recommendedTimeEstimate || 'None'} minutes`
      );
    } else {
      console.log('   updatedFields: null (limitResponsePayload=true)');
    }

    // Verify the time estimate was updated by retrieving the task
    console.log('\n🔍 Verifying time estimate update by retrieving task...');
    const taskAfterTimeUpdate = await client.getTaskById(taskId);
    if (taskAfterTimeUpdate) {
      console.log('✅ Task retrieved successfully after time estimate update');
      console.log(`   Time estimate: ${taskAfterTimeUpdate.timeEstimate || 'None'} minutes`);
      console.log(
        `   Recommended time estimate: ${taskAfterTimeUpdate.recommendedTimeEstimate || 'None'} minutes`
      );

      // Check if time estimate was actually updated
      if (taskAfterTimeUpdate.timeEstimate === 30) {
        console.log('✅ Time estimate was successfully updated to 30 minutes');
      } else {
        console.log(
          `⚠️ Time estimate may not have been updated. Current value: ${taskAfterTimeUpdate.timeEstimate} minutes`
        );
      }
    } else {
      console.log('❌ Failed to retrieve task after time estimate update');
    }

    // Test clearing time estimate (set to 0)
    console.log('\n   Clearing time estimate (setting to 0)...');
    const clearTimeResult = await client.updateTaskPlannedTime(taskId, 0);

    console.log('✅ updateTaskPlannedTime (clear time) successful!');
    console.log('📊 Clear Time Estimate Information:');
    console.log(`   Success: ${clearTimeResult.success}`);
    console.log(`   Skipped: ${clearTimeResult.skipped || false}`);

    // Test updateTaskDueDate method
    console.log('\n📅 Testing updateTaskDueDate method...');
    console.log(`   Setting due date for task: ${taskId}`);

    // Test setting due date to a future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
    const futureDateString = futureDate.toISOString();
    console.log(`   Setting due date to: ${futureDateString}`);

    const dueDateResult = await client.updateTaskDueDate(taskId, futureDate);

    console.log('✅ updateTaskDueDate successful!');
    console.log('\n📊 Task Due Date Update Information:');
    console.log(`   Success: ${dueDateResult.success}`);
    console.log(`   Skipped: ${dueDateResult.skipped || false}`);
    if (dueDateResult.updatedFields) {
      console.log(`   Task ID: ${dueDateResult.updatedFields._id}`);
      console.log(`   Stream IDs: ${dueDateResult.updatedFields.streamIds?.join(', ') || 'None'}`);
    } else {
      console.log('   updatedFields: null (limitResponsePayload=true)');
    }

    // Test updating with ISO string format
    const specificDate = '2025-08-15T09:00:00.000Z';
    console.log(`\n   Updating due date with ISO string: ${specificDate}`);
    const dueDateResult2 = await client.updateTaskDueDate(taskId, specificDate, false);

    console.log('✅ updateTaskDueDate (ISO string) successful!');
    console.log('📊 Task Due Date Update Information:');
    console.log(`   Success: ${dueDateResult2.success}`);
    console.log(`   Skipped: ${dueDateResult2.skipped || false}`);
    if (dueDateResult2.updatedFields) {
      console.log(`   Task ID: ${dueDateResult2.updatedFields._id}`);
      console.log(`   Stream IDs: ${dueDateResult2.updatedFields.streamIds?.join(', ') || 'None'}`);
    } else {
      console.log('   updatedFields: null (limitResponsePayload=true)');
    }

    // Verify the due date was updated by retrieving the task
    console.log('\n🔍 Verifying due date update by retrieving task...');
    const taskAfterDueDateUpdate = await client.getTaskById(taskId);
    if (taskAfterDueDateUpdate) {
      console.log('✅ Task retrieved successfully after due date update');
      console.log(`   Due date: ${taskAfterDueDateUpdate.dueDate || 'None'}`);

      // Check if due date was actually updated
      if (taskAfterDueDateUpdate.dueDate === specificDate) {
        console.log('✅ Due date was successfully updated');
      } else {
        console.log(
          `⚠️ Due date may not have been updated. Current value: ${taskAfterDueDateUpdate.dueDate}`
        );
      }
    } else {
      console.log('❌ Failed to retrieve task after due date update');
    }

    // Test clearing due date (set to null)
    console.log('\n   Clearing due date (setting to null)...');
    const clearDueDateResult = await client.updateTaskDueDate(taskId, null);

    console.log('✅ updateTaskDueDate (clear due date) successful!');
    console.log('📊 Clear Due Date Information:');
    console.log(`   Success: ${clearDueDateResult.success}`);
    console.log(`   Skipped: ${clearDueDateResult.skipped || false}`);

    // Verify the due date was cleared
    console.log('\n🔍 Verifying due date was cleared...');
    const taskAfterClearDueDate = await client.getTaskById(taskId);
    if (taskAfterClearDueDate) {
      console.log('✅ Task retrieved successfully after clearing due date');
      console.log(`   Due date: ${taskAfterClearDueDate.dueDate || 'None'}`);

      // Check if due date was actually cleared
      if (taskAfterClearDueDate.dueDate === null) {
        console.log('✅ Due date was successfully cleared');
      } else {
        console.log(
          `⚠️ Due date may not have been cleared. Current value: ${taskAfterClearDueDate.dueDate}`
        );
      }
    } else {
      console.log('❌ Failed to retrieve task after clearing due date');
    }

    // Test updateTaskText method
    console.log('\\n📝 Testing updateTaskText method...');
    const originalTaskText = retrievedTask?.text || taskText;
    const textTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const newTaskText = `Updated task title - ${textTimestamp}`;

    console.log(`   Original text: ${originalTaskText}`);
    console.log(`   New text: ${newTaskText}`);
    console.log(`   Updating text for task: ${taskId}`);

    const textUpdateResult = await client.updateTaskText(taskId, newTaskText);

    console.log('✅ updateTaskText successful!');
    console.log('\\n📊 Task Text Update Information:');
    console.log(`   Success: ${textUpdateResult.success}`);
    console.log(`   Skipped: ${textUpdateResult.skipped || false}`);
    if (textUpdateResult.updatedFields) {
      console.log(`   Task ID: ${textUpdateResult.updatedFields._id}`);
      console.log(
        `   Stream IDs: ${textUpdateResult.updatedFields.streamIds?.join(', ') || 'None'}`
      );
    } else {
      console.log('   updatedFields: null (limitResponsePayload=true)');
    }

    // Test updateTaskText with options
    console.log('\\n   Testing updateTaskText with options...');
    const textWithOptionsResult = await client.updateTaskText(
      taskId,
      `Task with options - ${textTimestamp}`,
      {
        recommendedStreamId: streams.length > 0 ? streams[0]!._id : null,
        limitResponsePayload: false,
      }
    );

    console.log('✅ updateTaskText with options successful!');
    console.log('📊 Task Text Update with Options Information:');
    console.log(`   Success: ${textWithOptionsResult.success}`);
    console.log(`   Skipped: ${textWithOptionsResult.skipped || false}`);
    if (textWithOptionsResult.updatedFields) {
      console.log(`   Task ID: ${textWithOptionsResult.updatedFields._id}`);
      console.log(
        `   Recommended Stream: ${textWithOptionsResult.updatedFields.recommendedStreamId || 'None'}`
      );
      console.log(
        `   Stream IDs: ${textWithOptionsResult.updatedFields.streamIds?.join(', ') || 'None'}`
      );
    } else {
      console.log('   updatedFields: null');
    }

    // Verify the text was updated by retrieving the task
    console.log('\\n🔍 Verifying text update by retrieving task...');
    const taskAfterTextUpdate = await client.getTaskById(taskId);
    if (taskAfterTextUpdate) {
      console.log('✅ Task retrieved successfully after text update');
      console.log(`   Current text: ${taskAfterTextUpdate.text}`);
      console.log(`   Original text: ${originalTaskText}`);

      // Check if text was actually updated
      if (taskAfterTextUpdate.text.includes(textTimestamp)) {
        console.log('✅ Text was successfully updated with timestamp');
      } else {
        console.log('⚠️ Text may not have been updated or timestamp not found');
      }
    } else {
      console.log('❌ Failed to retrieve task after text update');
    }

    // Test updateTaskStream method
    console.log('\\n🌊 Testing updateTaskStream method...');

    if (streams.length > 0) {
      const originalStreamIds = taskAfterTextUpdate?.streamIds || [];
      const targetStream = streams.find(s => !originalStreamIds.includes(s._id)) || streams[0]!;

      console.log(`   Original stream IDs: ${originalStreamIds.join(', ') || 'None'}`);
      console.log(`   Assigning task to stream: ${targetStream.streamName} (${targetStream._id})`);

      const streamResult = await client.updateTaskStream(taskId, targetStream._id);

      console.log('✅ updateTaskStream successful!');
      console.log('\\n📊 Task Stream Update Information:');
      console.log(`   Success: ${streamResult.success}`);
      console.log(`   Skipped: ${streamResult.skipped || false}`);
      if (streamResult.updatedFields) {
        console.log(`   Task ID: ${streamResult.updatedFields._id}`);
        console.log(`   Stream IDs: ${streamResult.updatedFields.streamIds?.join(', ') || 'None'}`);
        console.log(
          `   Recommended Stream: ${streamResult.updatedFields.recommendedStreamId || 'None'}`
        );
      } else {
        console.log('   updatedFields: null (limitResponsePayload=true)');
      }

      // Test with full response payload
      console.log('\\n   Testing updateTaskStream with full response payload...');
      const streamResult2 = await client.updateTaskStream(taskId, targetStream._id, false);

      console.log('✅ updateTaskStream (full response) successful!');
      console.log('📊 Task Stream Update with Full Response Information:');
      console.log(`   Success: ${streamResult2.success}`);
      console.log(`   Skipped: ${streamResult2.skipped || false}`);
      if (streamResult2.updatedFields) {
        console.log(`   Task ID: ${streamResult2.updatedFields._id}`);
        console.log(
          `   Stream IDs: ${streamResult2.updatedFields.streamIds?.join(', ') || 'None'}`
        );
        console.log(
          `   Recommended Stream: ${streamResult2.updatedFields.recommendedStreamId || 'None'}`
        );
      } else {
        console.log('   updatedFields: null');
      }

      // Verify the stream assignment was updated by retrieving the task
      console.log('\\n🔍 Verifying stream assignment by retrieving task...');
      const taskAfterStreamUpdate = await client.getTaskById(taskId);
      if (taskAfterStreamUpdate) {
        console.log('✅ Task retrieved successfully after stream update');
        console.log(
          `   Current stream IDs: ${taskAfterStreamUpdate.streamIds.join(', ') || 'None'}`
        );
        console.log(
          `   Recommended stream: ${taskAfterStreamUpdate.recommendedStreamId || 'None'}`
        );

        // Check if stream assignment was actually updated
        if (taskAfterStreamUpdate.streamIds.includes(targetStream._id)) {
          console.log('✅ Stream assignment was successfully updated');
        } else {
          console.log('⚠️ Stream assignment may not have been updated or not reflected yet');
        }
      } else {
        console.log('❌ Failed to retrieve task after stream update');
      }

      // Test with a different stream if available
      if (streams.length > 1) {
        const secondStream = streams.find(s => s._id !== targetStream._id) || streams[1]!;
        console.log(
          `\\n   Testing with different stream: ${secondStream.streamName} (${secondStream._id})`
        );

        const streamResult3 = await client.updateTaskStream(taskId, secondStream._id);

        console.log('✅ updateTaskStream (different stream) successful!');
        console.log(`   Success: ${streamResult3.success}`);
        if (streamResult3.updatedFields) {
          console.log(
            `   New stream IDs: ${streamResult3.updatedFields.streamIds?.join(', ') || 'None'}`
          );
        }
      }
    } else {
      console.log('   ⚠️ No streams available to test stream assignment');
    }

    // Test subtask management methods
    console.log('\n📝 Testing subtask management methods...');

    // Test addSubtask convenience method
    console.log('\n   Testing addSubtask (convenience method)...');
    const subtask1 = await client.addSubtask(taskId, 'First subtask - buy groceries');

    console.log('✅ addSubtask successful!');
    console.log('📊 Subtask Creation Information:');
    console.log(`   Subtask ID: ${subtask1.subtaskId}`);
    console.log(`   Success: ${subtask1.result.success}`);
    console.log(`   Skipped: ${subtask1.result.skipped || false}`);

    // Add a second subtask
    console.log('\n   Adding second subtask...');
    const subtask2 = await client.addSubtask(taskId, 'Second subtask - review documents');

    console.log('✅ Second subtask added!');
    console.log(`   Subtask ID: ${subtask2.subtaskId}`);

    // Test low-level createSubtasks method (bulk create)
    console.log('\n   Testing createSubtasks (bulk create)...');
    const subtask3Id = SunsamaClient.generateTaskId();
    const subtask4Id = SunsamaClient.generateTaskId();

    const bulkCreateResult = await client.createSubtasks(taskId, [subtask3Id, subtask4Id]);

    console.log('✅ createSubtasks (bulk) successful!');
    console.log('📊 Bulk Subtask Creation Information:');
    console.log(`   Success: ${bulkCreateResult.success}`);
    console.log(`   Created subtask IDs: ${subtask3Id}, ${subtask4Id}`);

    // Test updateSubtaskTitle
    console.log('\n   Testing updateSubtaskTitle...');
    const titleUpdateResult1 = await client.updateSubtaskTitle(
      taskId,
      subtask3Id,
      'Third subtask - send email'
    );

    console.log('✅ updateSubtaskTitle (subtask 3) successful!');
    console.log(`   Success: ${titleUpdateResult1.success}`);

    const titleUpdateResult2 = await client.updateSubtaskTitle(
      taskId,
      subtask4Id,
      'Fourth subtask - schedule meeting'
    );

    console.log('✅ updateSubtaskTitle (subtask 4) successful!');
    console.log(`   Success: ${titleUpdateResult2.success}`);

    // Test completeSubtask
    console.log('\n   Testing completeSubtask...');
    const completeSubtaskResult = await client.completeSubtask(taskId, subtask1.subtaskId);

    console.log('✅ completeSubtask successful!');
    console.log('📊 Subtask Completion Information:');
    console.log(`   Success: ${completeSubtaskResult.success}`);
    console.log(`   Skipped: ${completeSubtaskResult.skipped || false}`);

    // Mark another subtask as complete
    console.log('\n   Marking second subtask as complete...');
    const completeSubtask2Result = await client.completeSubtask(taskId, subtask2.subtaskId);

    console.log('✅ Second subtask marked complete!');
    console.log(`   Success: ${completeSubtask2Result.success}`);

    // Test uncompleteSubtask
    console.log('\n   Testing uncompleteSubtask...');
    const incompleteSubtaskResult = await client.uncompleteSubtask(taskId, subtask1.subtaskId);

    console.log('✅ uncompleteSubtask successful!');
    console.log('📊 Subtask Incompletion Information:');
    console.log(`   Success: ${incompleteSubtaskResult.success}`);
    console.log(`   Skipped: ${incompleteSubtaskResult.skipped || false}`);

    // Verify subtasks by retrieving the task
    console.log('\n🔍 Verifying subtasks by retrieving task...');
    const taskWithSubtasks = await client.getTaskById(taskId);
    if (taskWithSubtasks) {
      console.log('✅ Task retrieved successfully after subtask operations');
      console.log(`\n📊 Subtasks Summary (${taskWithSubtasks.subtasks.length} total):`);

      if (taskWithSubtasks.subtasks.length > 0) {
        taskWithSubtasks.subtasks.forEach((subtask, index) => {
          const completionStatus = subtask.completed ? '✅' : '⬜';
          console.log(`   ${index + 1}. ${completionStatus} ${subtask.title || '(no title)'}`);
          console.log(`      Subtask ID: ${subtask._id}`);
          console.log(`      Completed: ${subtask.completed}`);
          if (subtask.completedAt) {
            console.log(`      Completed At: ${subtask.completedAt}`);
          }
        });

        // Verify expected subtasks
        const expectedSubtaskIds = [subtask1.subtaskId, subtask2.subtaskId, subtask3Id, subtask4Id];
        const foundSubtaskIds = taskWithSubtasks.subtasks.map(s => s._id);

        const allFound = expectedSubtaskIds.every(id => foundSubtaskIds.includes(id));
        if (allFound) {
          console.log('\n✅ All 4 subtasks were successfully created and retrieved');
        } else {
          console.log('\n⚠️ Some subtasks may be missing');
          console.log(`   Expected: ${expectedSubtaskIds.join(', ')}`);
          console.log(`   Found: ${foundSubtaskIds.join(', ')}`);
        }

        // Verify completion states
        const subtask1State = taskWithSubtasks.subtasks.find(s => s._id === subtask1.subtaskId);
        const subtask2State = taskWithSubtasks.subtasks.find(s => s._id === subtask2.subtaskId);

        if (subtask1State && !subtask1State.completed) {
          console.log('✅ Subtask 1 correctly marked as incomplete');
        } else {
          console.log('⚠️ Subtask 1 completion state may be incorrect');
        }

        if (subtask2State && subtask2State.completed) {
          console.log('✅ Subtask 2 correctly marked as complete');
        } else {
          console.log('⚠️ Subtask 2 completion state may be incorrect');
        }
      } else {
        console.log('❌ No subtasks found on task after creation');
      }
    } else {
      console.log('❌ Failed to retrieve task after subtask operations');
    }

    // Test updateTaskComplete method
    console.log('\n✅ Testing updateTaskComplete method...');
    console.log(`   Marking task as complete: ${taskId}`);

    const completeResult = await client.updateTaskComplete(taskId);

    console.log('✅ updateTaskComplete successful!');
    console.log('\n📊 Task Completion Information:');
    console.log(`   Success: ${completeResult.success}`);
    console.log(`   Skipped: ${completeResult.skipped || false}`);
    if (completeResult.updatedFields) {
      console.log(`   Task ID: ${completeResult.updatedFields._id}`);
      console.log(`   Subtasks: ${completeResult.updatedFields.subtasks?.length || 0}`);
    }

    // Test deleteTask method
    console.log('\n🗑️ Testing deleteTask method...');
    console.log(`   Deleting task: ${taskId}`);

    const deleteResult = await client.deleteTask(taskId);

    console.log('✅ deleteTask successful!');
    console.log('\n📊 Task Deletion Information:');
    console.log(`   Success: ${deleteResult.success}`);
    console.log(`   Skipped: ${deleteResult.skipped || false}`);

    // Test logout
    console.log('\n🚪 Testing logout...');
    client.logout();
    const postLogoutAuth = await client.isAuthenticated();
    console.log(`   Authenticated after logout: ${postLogoutAuth}`);

    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
    } else {
      console.error(`   Unknown error: ${error}`);
    }
    process.exit(1);
  }
}

// Run the test
testRealAuth().catch(console.error);
