'use client';

/**
 * @file index.ts
 * @input Uses XDSFormLayout, XDSFormLayoutContext
 * @output Re-exports public API for FormLayout
 * @position Entry point for FormLayout module
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/FormLayout/README.md
 */

export {XDSFormLayout} from './XDSFormLayout';
export type {XDSFormLayoutProps} from './XDSFormLayout';
export type {XDSFormLayoutDirection} from './XDSFormLayoutContext';
export {XDSFormLayoutContext} from './XDSFormLayoutContext';
