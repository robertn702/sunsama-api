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
    
    // Test createTask method with custom ID (for tracking through completion and deletion)
    console.log('\n✨ Testing createTask method...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const taskText = `Test Task Created by API - ${timestamp}`;
    
    // Generate a unique task ID for tracking
    const taskId = SunsamaClient.generateTaskId();
    
    const createdTask = await client.createTask(taskText, {
      taskId: taskId,
      notes: 'This task was created by the test-real-auth script to verify the full CRUD workflow (create, complete, delete).',
      timeEstimate: 25,
      streamIds: streams.length > 0 ? [streams[0]!._id] : []
    });
    
    console.log('✅ createTask successful!');
    console.log('\n📊 Created Task Information:');
    console.log(`   Success: ${createdTask.success}`);
    console.log(`   Error: ${createdTask.error || 'None'}`);
    console.log(`   Task ID: ${taskId}`);
    if (createdTask.updatedFields) {
      console.log(`   Recommended Stream: ${createdTask.updatedFields.recommendedStreamId || 'None'}`);
      console.log(`   Stream IDs: ${createdTask.updatedFields.streamIds?.join(', ') || 'None'}`);
      console.log(`   Time Estimate: ${createdTask.updatedFields.recommendedTimeEstimate || 'None'} minutes`);
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