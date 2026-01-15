/**
 * @file index.ts
 * @input Imports from component directories (Button/, VStack/, Layout/)
 * @output Exports all public components and types for @xds/core
 * @position Package entry point; consumed by external applications
 *
 * SYNC: When modified, update this header and /packages/core/src/README.md
 */

// Components
export * from './Button';
export * from './VStack';

// Layout utilities
export * from './Layout';

// Theme
export * from './theme';
