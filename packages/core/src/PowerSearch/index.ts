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

export {PowerSearch} from './PowerSearch';
export type {PowerSearchProps, PowerSearchSize} from './PowerSearch';

export {PowerSearchToken} from './PowerSearchToken';
export {PowerSearchFilterEditor} from './PowerSearchFilterEditor';

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
  DateRangeFilterPreset,
  RelativeDateFilterPreset,
  OperatorTokenizationConfig,
  PowerSearchChangeType,
  PowerSearchHandle,

  // Component override types
  PowerSearchTokenProps,
  PowerSearchEditorProps,
  PowerSearchComponentOverride,
  PowerSearchComponents,
} from './types';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  PowerSearch as XDSPowerSearch,
  PowerSearchFilterEditor as XDSPowerSearchFilterEditor,
  PowerSearchToken as XDSPowerSearchToken,
  usePowerSearchConfig as useXDSPowerSearchConfig,
} from '.';
export type {
  CustomOperatorValue as XDSCustomOperatorValue,
  DateAbsoluteOperatorValue as XDSDateAbsoluteOperatorValue,
  DateRangeFilterPreset as XDSDateRangeFilterPreset,
  DateRangeOperatorValue as XDSDateRangeOperatorValue,
  DateRelativeOperatorValue as XDSDateRelativeOperatorValue,
  DateTimeRange as XDSDateTimeRange,
  DateTimeRangePart as XDSDateTimeRangePart,
  EmptyOperatorValue as XDSEmptyOperatorValue,
  EntityListOperatorValue as XDSEntityListOperatorValue,
  EnumItem as XDSEnumItem,
  EnumListOperatorValue as XDSEnumListOperatorValue,
  EnumOperatorValue as XDSEnumOperatorValue,
  FieldDefinition as XDSFieldDefinition,
  FilterValue as XDSFilterValue,
  FilterValueCustom as XDSFilterValueCustom,
  FilterValueDateAbsolute as XDSFilterValueDateAbsolute,
  FilterValueDateRange as XDSFilterValueDateRange,
  FilterValueDateRelative as XDSFilterValueDateRelative,
  FilterValueEmpty as XDSFilterValueEmpty,
  FilterValueEntityList as XDSFilterValueEntityList,
  FilterValueEnum as XDSFilterValueEnum,
  FilterValueEnumList as XDSFilterValueEnumList,
  FilterValueFloat as XDSFilterValueFloat,
  FilterValueInteger as XDSFilterValueInteger,
  FilterValueNested as XDSFilterValueNested,
  FilterValueString as XDSFilterValueString,
  FilterValueStringList as XDSFilterValueStringList,
  FilterValueTime as XDSFilterValueTime,
  FloatOperatorValue as XDSFloatOperatorValue,
  InferData as XDSInferData,
  IntegerOperatorValue as XDSIntegerOperatorValue,
  NestedOperatorValue as XDSNestedOperatorValue,
  OperatorTokenizationConfig as XDSOperatorTokenizationConfig,
  OperatorValue as XDSOperatorValue,
  PartialFilter as XDSPartialFilter,
  PowerSearchChangeType as XDSPowerSearchChangeType,
  PowerSearchComponentOverride as XDSPowerSearchComponentOverride,
  PowerSearchComponents as XDSPowerSearchComponents,
  PowerSearchConfig as XDSPowerSearchConfig,
  PowerSearchEditorProps as XDSPowerSearchEditorProps,
  PowerSearchEntity as XDSPowerSearchEntity,
  PowerSearchField as XDSPowerSearchField,
  PowerSearchFilter as XDSPowerSearchFilter,
  PowerSearchHandle as XDSPowerSearchHandle,
  PowerSearchOperator as XDSPowerSearchOperator,
  PowerSearchProps as XDSPowerSearchProps,
  PowerSearchSize as XDSPowerSearchSize,
  PowerSearchTokenProps as XDSPowerSearchTokenProps,
  RelativeDateFilterPreset as XDSRelativeDateFilterPreset,
  StringListOperatorValue as XDSStringListOperatorValue,
  StringOperatorValue as XDSStringOperatorValue,
  TimeOperatorValue as XDSTimeOperatorValue,
} from '.';
// <compat-aliases:end>
