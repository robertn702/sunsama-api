# Sunsama API TypeScript Wrapper

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
const client = new SunsamaClient({
  apiKey: 'your-api-key',
});

// Example usage (implementation coming soon)
async function example() {
  try {
    // Get current user tasks
    const tasks = await client.tasks.list();
    console.log('Your tasks:', tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}
```

## API Documentation

Full API documentation is available at [docs link - to be added].

## Configuration

The client can be configured with various options:

```typescript
const client = new SunsamaClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.sunsama.com', // Optional: custom base URL
  timeout: 30000, // Optional: request timeout in ms
  retries: 3, // Optional: number of retries for failed requests
});
```

## Error Handling

The wrapper provides structured error handling:

```typescript
import { SunsamaError, SunsamaApiError } from 'sunsama-api';

try {
  const result = await client.tasks.create(taskData);
} catch (error) {
  if (error instanceof SunsamaApiError) {
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
git clone https://github.com/yourusername/sunsama-api.git
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

## Disclaimer

This is an unofficial wrapper for the Sunsama API. It is not affiliated with or endorsed by Sunsama.

## Support

If you encounter any issues or have questions:

1. Search [existing issues](https://github.com/yourusername/sunsama-api/issues)
2. Create a [new issue](https://github.com/yourusername/sunsama-api/issues/new)

---

Made with ❤️ for the Sunsama community
