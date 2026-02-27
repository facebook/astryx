/**
 * @file index.ts
 * @input Imports stack components
 * @output Exports XDSStack, XDSHStack, XDSVStack, XDSStackItem components
 * @position Entry point for Layout/Stack
 *
 * SYNC: When modified, update /packages/core/src/Layout/README.md
 */

// Unified stack component
export {XDSStack} from './XDSStack';
export type {XDSStackProps, StackAlignment} from './XDSStack';

// Legacy wrappers (deprecated — use XDSStack instead)
export {XDSHStack} from './XDSHStack';
export type {XDSHStackProps} from './XDSHStack';

export {XDSVStack} from './XDSVStack';
export type {XDSVStackProps} from './XDSVStack';

export {XDSStackItem} from './XDSStackItem';
export type {XDSStackItemProps} from './XDSStackItem';
