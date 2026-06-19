// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports Field component and types from Field.tsx, FieldLabel from FieldLabel.tsx, FieldStatus from FieldStatus.tsx
 * @output Exports Field, FieldProps, FieldStatusInput, FieldStatusType, FieldLabel, FieldLabelProps, FieldStatus component
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Field/Field.doc.mjs
 */

export {Field} from './Field';
export type {
  FieldProps,
  FieldStatusInput,
  FieldStatusType,
} from './Field';
export {FieldLabel} from './FieldLabel';
export type {FieldLabelProps} from './FieldLabel';
export {FieldStatus} from '../FieldStatus';
export type {
  FieldStatusProps,
  FieldStatusVariant,
  FieldStatusVariantMap,
} from '../FieldStatus';

// Shared input types
export type {InputStatus, InputStatusType, InputSize} from './types';

// Shared input styles
export {
  inputWrapperStyles,
  inputStatusBorderStyles,
  inputStatusHoverShadowStyles,
  inputStatusFocusWithinStyles,
  inputStatusFocusStyles,
} from './inputStyles.stylex';

// Shared input components
export {InputClearButton} from './InputClearButton';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Field as XDSField,
  FieldLabel as XDSFieldLabel,
  InputClearButton as XDSInputClearButton,
} from '.';
export type {
  FieldLabelProps as XDSFieldLabelProps,
  FieldProps as XDSFieldProps,
  FieldStatusInput as XDSFieldStatusInput,
  FieldStatusType as XDSFieldStatusType,
  InputSize as XDSInputSize,
  InputStatus as XDSInputStatus,
  InputStatusType as XDSInputStatusType,
} from '.';
// <compat-aliases:end>
