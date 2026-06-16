// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input PowerSearch component and types
 * @output Exports all PowerSearch module public API
 * @position Entry point for PowerSearch module
 *
 * SYNC: When adding new PowerSearch files, update exports here
 */

export {XDSPowerSearch} from './XDSPowerSearch';
export type {XDSPowerSearchProps, XDSPowerSearchSize} from './XDSPowerSearch';

export {XDSPowerSearchToken} from './XDSPowerSearchToken';
export {XDSPowerSearchFilterEditor} from './XDSPowerSearchFilterEditor';

export {
  createPowerSearchConfig,
  usePowerSearchConfig,
} from './usePowerSearchConfig';
export type {FieldDefinition, InferData} from './usePowerSearchConfig';

export type {
  // Config types
  PowerSearchConfig,
  PowerSearchField,
  PowerSearchOperator,

  // Operator value types
  OperatorValue,
  EmptyOperatorValue,
  StringOperatorValue,
  StringListOperatorValue,
  IntegerOperatorValue,
  FloatOperatorValue,
  TimeOperatorValue,
  DateAbsoluteOperatorValue,
  DateRelativeOperatorValue,
  DateRangeOperatorValue,
  EnumOperatorValue,
  EnumListOperatorValue,
  EntityListOperatorValue,
  CustomOperatorValue,
  NestedOperatorValue,

  // Filter value types
  FilterValue,
  FilterValueEmpty,
  FilterValueString,
  FilterValueStringList,
  FilterValueInteger,
  FilterValueFloat,
  FilterValueTime,
  FilterValueDateAbsolute,
  FilterValueDateRelative,
  FilterValueDateRange,
  FilterValueEnum,
  FilterValueEnumList,
  FilterValueEntityList,
  FilterValueCustom,
  FilterValueNested,

  // Filter types
  PowerSearchFilter,
  PartialFilter,

  // Supporting types
  EnumItem,
  PowerSearchEntity,
  DateTimeRange,
  DateTimeRangePart,
  DateRangePreset,
  RelativeDatePreset,
  OperatorTokenizationConfig,
  PowerSearchChangeType,
  XDSPowerSearchHandle,

  // Component override types
  PowerSearchTokenProps,
  PowerSearchEditorProps,
  PowerSearchComponentOverride,
  XDSPowerSearchComponents,
} from './types';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSPowerSearch as PowerSearch,
  XDSPowerSearchFilterEditor as PowerSearchFilterEditor,
  XDSPowerSearchToken as PowerSearchToken,
} from '.';
export type {
  XDSPowerSearchComponents as PowerSearchComponents,
  XDSPowerSearchHandle as PowerSearchHandle,
  XDSPowerSearchProps as PowerSearchProps,
  XDSPowerSearchSize as PowerSearchSize,
} from '.';
// <compat-aliases:end>
