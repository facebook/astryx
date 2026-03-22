'use client';

/**
 * @file index.ts
 * @input Imports XDSField component and types from XDSField.tsx, XDSFieldLabel from XDSFieldLabel.tsx, XDSFieldStatus from XDSFieldStatus.tsx
 * @output Exports XDSField, XDSFieldProps, XDSFieldStatus, XDSFieldStatusType, XDSFieldLabel, XDSFieldLabelProps, XDSFieldStatus component
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Field/Field.doc.mjs
 */

export {XDSField} from './XDSField';
export type {
  XDSFieldProps,
  XDSFieldStatus,
  XDSFieldStatusType,
} from './XDSField';
export {XDSFieldLabel} from './XDSFieldLabel';
export type {XDSFieldLabelProps} from './XDSFieldLabel';
export {XDSFieldStatus as XDSFieldStatusComponent} from './XDSFieldStatus';
export type {
  XDSFieldStatusProps,
  XDSFieldStatusVariant,
  XDSFieldStatusVariantMap,
} from './XDSFieldStatus';

// Shared input types
export type {XDSInputStatus, XDSInputStatusType, XDSInputSize} from './types';

// Shared input styles
export {
  inputWrapperStyles,
  inputStatusBorderStyles,
  inputStatusHoverShadowStyles,
  inputStatusFocusWithinStyles,
  inputStatusFocusStyles,
} from './inputStyles.stylex';
