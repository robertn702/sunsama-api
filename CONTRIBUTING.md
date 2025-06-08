# Contributing to Sunsama API TypeScript Wrapper

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/sunsama-ts.git
   cd sunsama-ts
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Run Tests**
   ```bash
   pnpm test
   ```

## Development Workflow

### Code Quality

We maintain high code quality standards:

- **TypeScript**: All code must be properly typed
- **ESLint**: Code must pass linting
- **Prettier**: Code must be formatted
- **Tests**: All new features must include tests

### Before Submitting

1. **Run the full test suite**
   ```bash
   pnpm test
   ```

2. **Check linting**
   ```bash
   pnpm lint
   ```

3. **Format code**
   ```bash
   pnpm format
   ```

4. **Build the package**
   ```bash
   pnpm build
   ```

### Commit Messages

Write clear, descriptive commit messages that explain what and why:

- Use the imperative mood ("Add feature" not "Added feature")
- Keep the first line under 50 characters
- Add detailed explanation in the body if needed
- Reference issues when applicable

Example:
```
Add getStreamsByGroupId method to client

Implements stream fetching functionality using GraphQL query.
Follows existing patterns for caching and error handling.

Fixes #123
```

## Project Structure

```
src/
├── client/           # Main client implementation
├── types/           # TypeScript type definitions
├── errors/          # Custom error classes
├── utils/           # Utility functions
└── __tests__/       # Test files
```

## Guidelines

### TypeScript

- Use strict TypeScript configuration
- Prefer `interface` over `type` for object shapes
- Use `unknown` instead of `any`
- Properly type all function parameters and return values

### Testing

- Write tests for all public APIs
- Use descriptive test names
- Group related tests with `describe` blocks
- Mock external dependencies

### Documentation

- Document all public APIs with JSDoc
- Include usage examples in documentation
- Keep README up to date
- Add inline comments for complex logic

### Error Handling

- Use custom error classes
- Provide meaningful error messages
- Include relevant context in errors
- Handle all known error scenarios

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   pnpm test
   pnpm lint
   pnpm build
   ```

4. **Commit your changes**
   ```bash
   git commit -m "Add new feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use a clear, descriptive title
   - Include a detailed description of changes
   - Reference any related issues

## Release Process

This project uses [Changesets](https://github.com/changesets/changesets) for version management:

1. **Add a changeset** for your changes:
   ```bash
   pnpm changeset
   ```

2. **Follow the prompts** to describe your changes

3. **Commit the changeset** with your PR

## Code Review Guidelines

When reviewing code, consider:

- **Functionality**: Does the code work as intended?
- **Type Safety**: Are all types properly defined?
- **Testing**: Are there adequate tests?
- **Performance**: Are there any performance concerns?
- **Security**: Are there any security implications?
- **Documentation**: Is the code well-documented?

Thank you for contributing to make this project better! 🎉
