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
- Support task notes updating with Yjs-powered collaborative editing features
- Maintain collaborative editing state consistency for real-time synchronization
- Support task planned time (time estimate) updating for task management
- Action item checklist and MVP requirements are documented in MVP_AUTH.md

## Development Environment
- Primary development is done in WebStorm IDE
- Standard TypeScript toolchain (tsc, tsconfig.json)
- Package management via pnpm for development (faster installs, disk space efficiency)
- Distribution via npm registry for end users
- Testing framework: Vitest (fast, TypeScript-first testing)
- Code formatting and linting tools (Prettier, ESLint)

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

## Context for LLM Assistance
This project involves creating a production-ready TypeScript package that other developers will use to interact with Sunsama's API. Focus on best practices for API wrapper design, TypeScript package development, and NPM distribution. The code should be maintainable, well-documented, and follow modern JavaScript/TypeScript conventions.

## Git Rules

**IMPORTANT**: Never commit the `dev/` directory or any of its files to git. This directory contains development data including sample API responses and testing data that should remain local only.

**Branch Naming Convention**: Use the format `{type}/{short-name}` where `{type}` follows conventional commit naming convention (feat, fix, chore, refactor, docs, style, test, ci, etc.).