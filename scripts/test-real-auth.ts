#!/usr/bin/env tsx

/**
 * Test script for real Sunsama authentication
 * 
 * This script tests the authentication and getUser method with real credentials
 * from environment variables.
 */

import 'dotenv/config';
import { SunsamaClient } from '../src/client';

async function testRealAuth() {
  console.log('🧪 Testing Sunsama Authentication with Real Credentials\n');
  
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