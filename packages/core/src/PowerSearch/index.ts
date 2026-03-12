/**
 * @file index.ts
 * @input PowerSearch component and types
 * @output Exports all PowerSearch module public API
 * @position Entry point for PowerSearch module
 *
 * SYNC: When adding new PowerSearch files, update exports here
 */

export {XDSPowerSearch} from './XDSPowerSearch';
export type {XDSPowerSearchProps} from './XDSPowerSearch';

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
} from './types';
