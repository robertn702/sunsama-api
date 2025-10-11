# Sunsama API TypeScript Wrapper - Project Context

## Project Overview
This is a TypeScript package that serves as a wrapper around Sunsama's API. Sunsama is a daily planning application that helps users organize tasks, calendar events, and focus time. This wrapper provides a type-safe, developer-friendly interface for interacting with Sunsama's REST API endpoints.

## Technical Stack
- **Language**: TypeScript
- **Runtime**: Node.js
- **IDE**: WebStorm (JetBrains)
- **Distribution**: NPM package
- **Target Environment**: Both Node.js and browser environments (if applicable)

## Project Goals
- Provide a complete TypeScript wrapper for all Sunsama API endpoints
- Ensure type safety with comprehensive TypeScript definitions
- Implement proper error handling and response validation
- Include comprehensive documentation and examples
- Follow NPM package best practices for distribution
- Maintain clean, maintainable, and well-tested code
- Support full CRUD operations: create, read, update, delete tasks
- Provide access to archived tasks with pagination support
- Enable task retrieval by ID for individual task operations
- Support task notes updating with Yjs-powered collaborative editing using XmlFragment structure for proper Sunsama UI synchronization
- Maintain collaborative editing state consistency for real-time synchronization
- Provide simplified API with explicit format selection using discriminated unions
- Support task planned time (time estimate) updating for task management
- Support task stream assignment and task text/title updates
- Support task due date management

## Development Environment
- Primary development is done in WebStorm IDE
- Standard TypeScript toolchain (tsc, tsconfig.json)
- Package management via pnpm for development (faster installs, disk space efficiency)
- Distribution via npm registry for end users
- Testing framework: Vitest (fast, TypeScript-first testing)
- Code formatting and linting tools (Prettier, ESLint)

## Development Commands
- `pnpm dev` - Start development with watch mode
- `pnpm build` - Build for distribution (CJS, ESM, and types)
- `pnpm test` - Run test suite with Vitest
- `pnpm test:auth` - Run real API authentication tests
- `pnpm test:integration` - Run integration tests (requires credentials in .env)
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Generate test coverage report
- `pnpm lint` - Check code with ESLint
- `pnpm format` - Format code with Prettier
- `pnpm typecheck` - Type-check without building
- `npx changeset` - Create a changeset for version bump
- `pnpm release` - Publish to npm registry

## API Wrapper Considerations
- Authentication handling (API keys, tokens)
- HTTP client implementation using native fetch API
- Request/response type definitions
- Error handling and custom error classes
- Pagination support for list endpoints (implemented: getArchivedTasks)
- Collaborative editing support with Yjs integration for real-time document synchronization
- Real-time updates (webhooks/websockets if supported)
- Configuration management

## NPM Package Structure
- Proper package.json configuration
- pnpm-lock.yaml for development dependency locking
- TypeScript declaration files (.d.ts)
- Multiple build targets (CommonJS, ESM)
- README with usage examples
- Semantic versioning strategy
- GitHub Actions CI/CD pipeline for automated testing, building, and publishing to npm registry
- .npmignore to exclude development files from published package
- Vitest configuration for comprehensive test coverage

## Key Areas of Focus
When working on this project, prioritize:
1. Type safety and developer experience
2. Comprehensive API coverage
3. Clear documentation and examples
4. Robust error handling
5. Performance optimization
6. Comprehensive testing with Vitest
7. Automated CI/CD with GitHub Actions
8. Backward compatibility considerations
9. Collaborative editing state management and Yjs integration consistency

## Project Structure
The codebase is organized with a domain-based architecture:
- `src/client/` - Main SunsamaClient implementation
- `src/queries/` - GraphQL operations organized by domain
  - `tasks/` - Task-related queries and mutations
  - `streams/` - Stream-related queries
  - `user/` - User-related queries
  - `fragments/` - Shared GraphQL fragments
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions (conversion, validation)
- `src/errors/` - Custom error classes
- `src/__tests__/` - Test files using Vitest
- `scripts/` - Development and testing scripts

## Recent Improvements (v0.11.1)
- **Fixed Issue #14**: Task notes now properly sync with Sunsama UI using Y.XmlFragment structure instead of Y.Text
- **Collaborative Editing Fix**: Updated `createCollabSnapshot()` and `createUpdatedCollabSnapshot()` methods to use XmlFragment('default') → XmlElement('paragraph') → XmlText structure
- **Domain-based Query Organization**: Refactored GraphQL queries into domain-specific directories (tasks/, streams/, user/, fragments/)
- **Enhanced Task Management**: Added methods for updateTaskText, updateTaskStream, updateTaskDueDate
- **Improved Integration Testing**: Comprehensive test suite for task notes with various content types (HTML, markdown, special characters)

## Technical Implementation Details
### Yjs Collaborative Editing Structure
The package uses Yjs for collaborative editing synchronization with Sunsama's UI:
```
Y.XmlFragment('default')
  └─ Y.XmlElement('paragraph')
      └─ Y.XmlText
          └─ actual content
```
This structure ensures proper synchronization with Sunsama's rich text editor.

### Development Data
The `dev/` directory contains:
- Investigation notes for debugging (e.g., `NOTES-issue-14-investigation.md`)
- Yjs decoding scripts for analyzing collaborative snapshots
- Test scripts for verifying XmlFragment implementation
- This directory is gitignored and should never be committed

## Context for LLM Assistance
This project involves creating a production-ready TypeScript package that other developers will use to interact with Sunsama's API. Focus on best practices for API wrapper design, TypeScript package development, and NPM distribution. The code should be maintainable, well-documented, and follow modern JavaScript/TypeScript conventions.

When working with collaborative editing features, ensure proper Yjs structure (XmlFragment, not Text) is maintained for Sunsama UI compatibility.

## Git Rules

**IMPORTANT**: Never commit the `dev/` directory or any of its files to git. This directory contains development data including sample API responses and testing data that should remain local only.

**Branch Naming Convention**: Use the format `{type}/{short-name}` where `{type}` follows conventional commit naming convention (feat, fix, chore, refactor, docs, style, test, ci, etc.).