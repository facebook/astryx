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


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSField as Field,
  XDSFieldLabel as FieldLabel,
  XDSFieldStatus as FieldStatus,
  XDSInputClearButton as InputClearButton,
} from '.';
export type {
  XDSFieldLabelProps as FieldLabelProps,
  XDSFieldProps as FieldProps,
  XDSFieldStatusInput as FieldStatusInput,
  XDSFieldStatusProps as FieldStatusProps,
  XDSFieldStatusType as FieldStatusType,
  XDSFieldStatusVariant as FieldStatusVariant,
  XDSFieldStatusVariantMap as FieldStatusVariantMap,
  XDSInputSize as InputSize,
  XDSInputStatus as InputStatus,
  XDSInputStatusType as InputStatusType,
} from '.';
// <compat-aliases:end>
