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
    
    // Get streams/projects
    const streams = await client.getStreamsByGroupId();
    console.log('Streams:', streams.length);
    
    // Get user's timezone
    const timezone = await client.getUserTimezone();
    console.log('Timezone:', timezone);
    
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
