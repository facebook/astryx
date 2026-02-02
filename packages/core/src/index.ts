/**
 * @file index.ts
 * @input Imports from component directories (Button/, Layout/, Layer/)
 * @output Exports all public components and types for @xds/core
 * @position Package entry point; consumed by external applications
 *
 * SYNC: When modified, update this header and /packages/core/src/README.md
 */

// Components
export * from './Avatar';
export * from './Button';
export * from './Calendar';
export * from './CheckboxInput';
export * from './DatePicker';
export * from './Field';
export * from './Icon';
export * from './Text';
export * from './TextInput';
export * from './TextArea';

// Layout utilities and components (includes XDSHStack, XDSVStack)
export * from './Layout';

// Layer utilities and components (includes XDSHoverCard)
export * from './Layer';

// Skeleton loading placeholder
export * from './Skeleton';

// Hooks
export * from './hooks';

// Utilities
export * from './utils';

// Theme
export * from './theme';
