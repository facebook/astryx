// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSField component and types from XDSField.tsx, XDSFieldLabel from XDSFieldLabel.tsx, XDSFieldStatus from XDSFieldStatus.tsx
 * @output Exports XDSField, XDSFieldProps, XDSFieldStatusInput, XDSFieldStatusType, XDSFieldLabel, XDSFieldLabelProps, XDSFieldStatus component
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Field/Field.doc.mjs
 */

export {XDSField} from './XDSField';
export type {
  XDSFieldProps,
  XDSFieldStatusInput,
  XDSFieldStatusType,
} from './XDSField';
export {XDSFieldLabel} from './XDSFieldLabel';
export type {XDSFieldLabelProps} from './XDSFieldLabel';
export {XDSFieldStatus} from '../FieldStatus';
export type {
  XDSFieldStatusProps,
  XDSFieldStatusVariant,
  XDSFieldStatusVariantMap,
} from '../FieldStatus';

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

// Shared input components
export {XDSInputClearButton} from './XDSInputClearButton';
