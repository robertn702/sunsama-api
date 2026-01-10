import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    globalSetup: './src/__tests__/integration/globalSetup.ts',
    include: ['src/__tests__/integration/**/*.test.ts'],
    exclude: ['node_modules/', 'dist/'],
    fileParallelism: false, // Run test files sequentially to avoid rate limiting
    pool: 'forks', // Use separate processes for isolation
    testTimeout: 30000, // 30 second timeout for integration tests (API can be slow)
  },
});
