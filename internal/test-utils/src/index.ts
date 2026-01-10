/**
 * @file index.ts
 * @input Uses @testing-library/react, @testing-library/user-event
 * @output Re-exports render, screen, fireEvent, userEvent, etc.
 * @position Entry point for test utilities; consumed by test files across monorepo
 *
 * SYNC: When modified, update this header and /internal/test-utils/src/README.md
 */

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
