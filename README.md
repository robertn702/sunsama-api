# Sunsama API TypeScript Wrapper

> **Disclaimer**: This is an unofficial wrapper for the Sunsama API. It is not affiliated with or endorsed by Sunsama.

> **A Note from the Author**: I'm a huge fan and advocate of Sunsama. I've been using it daily for over a year and it's transformed how I plan my days. I created this package because I wanted to pull my tasks into other systems. I plan to maintain this package until either Sunsama releases an official API or I stop using the service. If you build something on top of `sunsama-api` feel free to share what you're building. 

A comprehensive TypeScript wrapper for the Sunsama API, providing type-safe access to daily planning and task management functionality.

[![npm version](https://badge.fury.io/js/sunsama-api.svg)](https://www.npmjs.com/package/sunsama-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## Features

- 🔒 **Type Safety**: Full TypeScript support with comprehensive type definitions
- 🚀 **Modern**: Built with modern JavaScript/TypeScript practices
- 📦 **Lightweight**: Minimal dependencies and optimized bundle size
- 🔧 **Developer Friendly**: Intuitive API design with excellent IDE support
- ✅ **Well Tested**: Comprehensive test coverage with Vitest
- 📚 **Documented**: Complete API documentation and examples
- 📅 **Task Scheduling**: Unified interface for scheduling, rescheduling, and managing task timing
- 🆔 **ID Generation**: Built-in MongoDB ObjectId-style task ID generation
- 🔍 **Input Validation**: Robust validation using Zod v4 for enhanced type safety
- 📦 **Archive Support**: Access to archived tasks with pagination support
- 🤝 **Collaborative Editing**: Yjs-powered collaborative snapshot generation for proper real-time editing support
- 📝 **Task Notes Management**: Full CRUD operations for task notes with automatic HTML/Markdown conversion and collaborative editing state preservation

## Installation

```bash
npm install sunsama-api
```

```bash
yarn add sunsama-api
```

```bash
pnpm add sunsama-api
```

## Quick Start

```typescript
import { SunsamaClient } from 'sunsama-api';

// Initialize the client
const client = new SunsamaClient();

// Example usage
async function example() {
  try {
    // Authenticate with email/password
    await client.login('your-email@example.com', 'your-password');
    
    // Get current user information
    const user = await client.getUser();
    console.log('User:', user.profile.firstname, user.profile.lastname);
    
    // Get tasks for today
    const today = new Date().toISOString().split('T')[0];
    const tasks = await client.getTasksByDay(today);
    console.log('Today\'s tasks:', tasks.length);
    
    // Get backlog tasks
    const backlog = await client.getTasksBacklog();
    console.log('Backlog tasks:', backlog.length);
    
    // Get archived tasks
    const archived = await client.getArchivedTasks();
    console.log('Archived tasks:', archived.length);
    
    // Get streams/projects
    const streams = await client.getStreamsByGroupId();
    console.log('Streams:', streams.length);
    
    // Get user's timezone
    const timezone = await client.getUserTimezone();
    console.log('Timezone:', timezone);
    
    // Update task notes with collaborative editing (HTML input)
    await client.updateTaskNotes('task-id', {
      html: '<p>Updated notes with <strong>formatting</strong></p>'
    });
    
    // Or update with Markdown input
    await client.updateTaskNotes('task-id', {
      markdown: 'Updated notes with **formatting**'
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Authentication

The client uses email/password authentication or session tokens:

```typescript
// Method 1: Email/Password authentication
const client = new SunsamaClient();
await client.login('your-email@example.com', 'your-password');

// Method 2: Session token (if you have one)
const clientWithToken = new SunsamaClient({
  sessionToken: 'your-session-token'
});

// Check authentication status
const isAuth = await client.isAuthenticated();
console.log('Authenticated:', isAuth);

// Logout
client.logout();
```

## API Methods

The client provides the following methods organized by resource:

### Users
```typescript
// Get current user details
const user = await client.getUser();
console.log(user.profile.firstname, user.profile.lastname);

// Get user's timezone
const timezone = await client.getUserTimezone();
```

### Tasks

#### Reading Tasks
```typescript
// Get tasks for a specific day
const tasks = await client.getTasksByDay('2025-01-15');
const tasksWithTz = await client.getTasksByDay('2025-01-15', 'America/New_York');

// Get backlog tasks
const backlog = await client.getTasksBacklog();

// Get archived tasks with pagination
const archivedTasks = await client.getArchivedTasks();
const moreArchived = await client.getArchivedTasks(100, 50); // offset 100, limit 50

// Get a specific task by ID
const task = await client.getTaskById('685022edbdef77163d659d4a');
if (task) {
  console.log('Found task:', task.text);
  console.log('Task completed:', task.completed);
  console.log('Time estimate:', task.timeEstimate, 'minutes');
} else {
  console.log('Task not found');
}
```

#### Creating Tasks
```typescript
// Create a basic task
const newTask = await client.createTask('Complete project documentation');

// Create a task with options
const taskWithOptions = await client.createTask('Review pull requests', {
  notes: 'Check all open PRs in the main repository',
  timeEstimate: 30,
  streamIds: ['stream-id-1']
});

// Create a task with due date and snooze
const scheduledTask = await client.createTask('Follow up with client', {
  dueDate: new Date('2025-01-20'),
  snoozeUntil: new Date('2025-01-15T09:00:00')
});

// Create a task with custom ID (useful for tracking/deletion)
const taskId = SunsamaClient.generateTaskId();
const taskWithCustomId = await client.createTask('Custom task', {
  taskId: taskId,
  notes: 'Detailed description',
  private: false,
  streamIds: ['stream-1', 'stream-2'],
  timeEstimate: 60
});
```

#### Managing Tasks
```typescript
// Schedule a task to a specific date
const scheduleResult = await client.updateTaskSnoozeDate('taskId', '2025-06-16');

// Move a task to the backlog (unschedule)
const backlogResult = await client.updateTaskSnoozeDate('taskId', null);

// Reschedule a task from one date to another
await client.updateTaskSnoozeDate('taskId', '2025-06-20');

// Schedule with timezone consideration
await client.updateTaskSnoozeDate('taskId', '2025-06-16', {
  timezone: 'Europe/London'
});

// Get detailed response instead of limited payload
await client.updateTaskSnoozeDate('taskId', '2025-06-16', {
  limitResponsePayload: false
});

// Combine options
await client.updateTaskSnoozeDate('taskId', '2025-06-16', {
  timezone: 'Asia/Tokyo',
  limitResponsePayload: false
});

// Mark a task as complete
const completeResult = await client.updateTaskComplete('taskId');

// Mark complete with specific timestamp
const completeResultTimed = await client.updateTaskComplete('taskId', '2025-01-15T10:30:00Z');

// Get full task details in response
const completeResultFull = await client.updateTaskComplete('taskId', new Date(), false);

// Delete a task
const deleteResult = await client.deleteTask('taskId');

// Delete with full response payload
const deleteResultFull = await client.deleteTask('taskId', false);

// Delete a merged task
const deleteResultMerged = await client.deleteTask('taskId', true, true);
```

#### Updating Task Planned Time

You can update the time estimate (planned time) for a task using the `updateTaskPlannedTime` method. The time estimate represents how long you expect the task to take and is specified in minutes.

```typescript
// Set task time estimate to 30 minutes
const result = await client.updateTaskPlannedTime('taskId', 30);

// Set time estimate to 45 minutes with full response payload
const result = await client.updateTaskPlannedTime('taskId', 45, false);

// Clear time estimate (set to 0)
const result = await client.updateTaskPlannedTime('taskId', 0);

// Set time estimate to 1 hour (60 minutes)
const result = await client.updateTaskPlannedTime('taskId', 60);
```

#### Updating Task Notes

The `updateTaskNotes` method uses Yjs-powered collaborative editing to maintain proper synchronization with Sunsama's real-time editor. It accepts content in either HTML or Markdown format and automatically converts to the other format. The task must already exist and have a collaborative editing state.

```typescript
// Update with HTML content (Markdown auto-generated)
const htmlResult = await client.updateTaskNotes('taskId', {
  html: '<p>Updated task notes with <strong>bold</strong> text</p>'
});

// Update with Markdown content (HTML auto-generated)
const markdownResult = await client.updateTaskNotes('taskId', {
  markdown: 'Updated task notes with **bold** text'
});

// Update with complex HTML content
const complexResult = await client.updateTaskNotes('taskId', {
  html: '<p>First paragraph</p><p>Second paragraph with <em>italic</em> text</p>'
});

// Update with complex Markdown content
const complexMarkdownResult = await client.updateTaskNotes('taskId', {
  markdown: 'First paragraph\n\nSecond paragraph with *italic* text'
});

// Get full response payload instead of limited response
const fullResult = await client.updateTaskNotes('taskId', {
  html: '<p>New notes content</p>'
}, { limitResponsePayload: false });

// Use a specific collaborative snapshot (advanced - useful for optimized workflows)
const task = await client.getTaskById('taskId');
if (task?.collabSnapshot) {
  const customResult = await client.updateTaskNotes('taskId', {
    markdown: 'Custom notes content'
  }, { collabSnapshot: task.collabSnapshot });
}
```

### Streams
```typescript
// Get all streams for the user's group
const streams = await client.getStreamsByGroupId();
streams.forEach(stream => {
  console.log(stream.streamName, stream.color);
});
```

### Utilities
```typescript
// Generate MongoDB ObjectId-style task IDs
const taskId = SunsamaClient.generateTaskId();
console.log(taskId); // "675a1b2c3d4e5f6789abcdef"

// Use with createTask for controlled task creation
const customTask = await client.createTask('My custom task', {
  taskId: SunsamaClient.generateTaskId(),
  notes: 'Task with custom ID for tracking',
  timeEstimate: 45
});
```

## Error Handling

The wrapper provides structured error handling:

```typescript
import { SunsamaError, SunsamaAuthError, SunsamaApiError } from 'sunsama-api';

try {
  await client.login('email@example.com', 'password');
  const user = await client.getUser();
} catch (error) {
  if (error instanceof SunsamaAuthError) {
    console.error('Authentication Error:', error.message);
  } else if (error instanceof SunsamaApiError) {
    console.error('API Error:', error.message, error.status);
  } else if (error instanceof SunsamaError) {
    console.error('Client Error:', error.message);
  } else {
    console.error('Unknown Error:', error);
  }
}
```

## Development

This project uses modern development tools:

- **TypeScript** for type safety
- **Vitest** for testing
- **ESLint + Prettier** for code quality
- **pnpm** for package management
- **Changesets** for version management

### Setup

```bash
# Clone the repository
git clone https://github.com/robertn702/sunsama-api.git
cd sunsama-api

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the package
pnpm build

# Run linting
pnpm lint
```

### Scripts

- `pnpm build` - Build the package for distribution
- `pnpm dev` - Start development mode with watch
- `pnpm test` - Run the test suite
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm lint` - Lint the codebase
- `pnpm format` - Format code with Prettier

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Search [existing issues](https://github.com/robertn702/sunsama-api/issues)
2. Create a [new issue](https://github.com/robertn702/sunsama-api/issues/new)

---

Made with ❤️ for the Sunsama community
