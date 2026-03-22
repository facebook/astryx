'use client';

/**
 * @file index.ts
 * @input Imports XDSDialog component and types from XDSDialog.tsx
 * @output Exports XDSDialog, XDSDialogHeader, and related types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Dialog/Dialog.doc.mjs
 */

export {XDSDialog} from './XDSDialog';
export type {
  XDSDialogProps,
  XDSDialogVariant,
  XDSDialogVariantMap,
  XDSDialogPurpose,
  XDSDialogPosition,
} from './XDSDialog';

export {XDSDialogHeader} from './XDSDialogHeader';
export type {XDSDialogHeaderProps} from './XDSDialogHeader';
