/**
 * @file types.ts
 * @input None
 * @output Exports all PowerSearch type definitions
 * @position Type definitions; consumed by all PowerSearch modules
 *
 * SYNC: When modified, update:
 * - /packages/core/src/PowerSearch/index.ts
 */

import type {ReactNode} from 'react';
import type {XDSSearchSource, XDSSearchableItem} from '../Typeahead/types';

// =============================================================================
// Operator Value Types — define what kind of editor to show
// =============================================================================

export interface EmptyOperatorValue {
  readonly type: 'empty';
}

export interface StringOperatorValue {
  readonly type: 'string';
  /** When provided, shows a typeahead instead of a plain text input. */
  readonly searchSource?: XDSSearchSource;
  /** Allow arbitrary strings not in the search source. @default false */
  readonly isArbitraryStringAllowed?: boolean;
}

export interface StringListOperatorValue {
  readonly type: 'string_list';
  /** When provided, shows a tokenizer with search. */
  readonly searchSource?: XDSSearchSource;
  /** Allow arbitrary strings not in the search source. @default false */
  readonly isArbitraryStringAllowed?: boolean;
  /** Tokenization config for paste behavior. */
  readonly tokenization?: OperatorTokenizationConfig;
}

export interface IntegerOperatorValue {
  readonly type: 'integer';
  readonly minValue?: number;
  readonly maxValue?: number;
  readonly units?: string;
}

export interface FloatOperatorValue {
  readonly type: 'float';
  readonly minValue?: number;
  readonly maxValue?: number;
  readonly units?: string;
}

export interface TimeOperatorValue {
  readonly type: 'time';
  readonly minValue?: string;
  readonly maxValue?: string;
}

export interface DateAbsoluteOperatorValue {
  readonly type: 'date_absolute';
  /** If true, only show date picker without time. */
  readonly isDateOnly?: boolean;
}

export interface DateRelativeOperatorValue {
  readonly type: 'date_relative';
  /** Allow past dates. @default true */
  readonly isPastAllowed?: boolean;
  /** Allow future dates. @default true */
  readonly isFutureAllowed?: boolean;
}

export interface DateRangeOperatorValue {
  readonly type: 'date_range';
  /** Preset date ranges (e.g. "Last 7 days"). */
  readonly intervalDatePresets?: ReadonlyArray<DateRangePreset>;
  /** Preset relative dates. */
  readonly relativeDatePresets?: ReadonlyArray<RelativeDatePreset>;
}

export interface EnumItem {
  readonly value: string;
  readonly label: string;
  readonly icon?: ReactNode;
}

export interface EnumOperatorValue {
  readonly type: 'enum';
  readonly values: ReadonlyArray<EnumItem>;
}

export interface EnumListOperatorValue {
  readonly type: 'enum_list';
  readonly values: ReadonlyArray<EnumItem>;
}

export interface EntityListOperatorValue {
  readonly type: 'entity_list';
  /** Search source for entities. */
  readonly searchSource?: XDSSearchSource;
  /** Allow arbitrary strings not in the search source. @default false */
  readonly isArbitraryStringAllowed?: boolean;
  /** Tokenization config for paste behavior. */
  readonly tokenization?: OperatorTokenizationConfig;
}

export interface CustomOperatorValue {
  readonly type: 'custom';
  /** Custom editor component. */
  readonly Editor: React.ComponentType<{
    isDisabled?: boolean;
    onChange: (value: string | null) => void;
    placeholder: string;
    value: string | null;
  }>;
  /** Convert JSON value to display string. */
  readonly getString: (value: string) => string;
}

export interface NestedOperatorValue {
  readonly type: 'nested';
}

export type OperatorValue =
  | EmptyOperatorValue
  | StringOperatorValue
  | StringListOperatorValue
  | IntegerOperatorValue
  | FloatOperatorValue
  | TimeOperatorValue
  | DateAbsoluteOperatorValue
  | DateRelativeOperatorValue
  | DateRangeOperatorValue
  | EnumOperatorValue
  | EnumListOperatorValue
  | EntityListOperatorValue
  | CustomOperatorValue
  | NestedOperatorValue;

// =============================================================================
// Filter Value Types — the actual stored values
// =============================================================================

export interface FilterValueEmpty {
  readonly type: 'empty';
}

export interface FilterValueString {
  readonly type: 'string';
  readonly value: string;
}

export interface FilterValueStringList {
  readonly type: 'string_list';
  readonly value: ReadonlyArray<string>;
}

export interface FilterValueInteger {
  readonly type: 'integer';
  readonly value: number;
}

export interface FilterValueFloat {
  readonly type: 'float';
  readonly value: number;
}

export interface FilterValueTime {
  readonly type: 'time';
  readonly value: string;
}

export interface FilterValueDateAbsolute {
  readonly type: 'date_absolute';
  readonly unixSeconds: number;
}

export interface FilterValueDateRelative {
  readonly type: 'date_relative';
  readonly value: string;
}

export interface FilterValueDateRange {
  readonly type: 'date_range';
  readonly value: DateTimeRange;
}

export interface FilterValueEnum {
  readonly type: 'enum';
  readonly value: string;
}

export interface FilterValueEnumList {
  readonly type: 'enum_list';
  readonly value: ReadonlyArray<string>;
}

export interface PowerSearchEntity {
  readonly id: string;
  readonly label: string;
  readonly photo?: string;
}

export interface FilterValueEntityList {
  readonly type: 'entity_list';
  readonly value: ReadonlyArray<PowerSearchEntity>;
}

export interface FilterValueCustom {
  readonly type: 'custom';
  /** Custom values are stored as JSON strings. */
  readonly value: string;
}

export interface FilterValueNested {
  readonly type: 'nested';
  readonly value: ReadonlyArray<PowerSearchFilter>;
}

export type FilterValue =
  | FilterValueEmpty
  | FilterValueString
  | FilterValueStringList
  | FilterValueInteger
  | FilterValueFloat
  | FilterValueTime
  | FilterValueDateAbsolute
  | FilterValueDateRelative
  | FilterValueDateRange
  | FilterValueEnum
  | FilterValueEnumList
  | FilterValueEntityList
  | FilterValueCustom
  | FilterValueNested;

// =============================================================================
// Supporting Types
// =============================================================================

export interface OperatorTokenizationConfig {
  /** Regex to apply to pasted text. */
  readonly regex?: string;
  /** Sort tokens after tokenizing. */
  readonly sort?: boolean;
}

export type DateTimeRangePart =
  | {readonly type: 'NOW'}
  | {readonly type: 'ABSOLUTE'; readonly unixSeconds: number}
  | {
      readonly type: 'RELATIVE';
      readonly backValue: number;
      readonly unit:
        | 'second'
        | 'minute'
        | 'hour'
        | 'day'
        | 'week'
        | 'month'
        | 'year';
      readonly anchorKey?: string;
    };

export interface DateTimeRange {
  readonly start: DateTimeRangePart;
  readonly end: DateTimeRangePart;
}

export interface DateRangePreset {
  readonly label: string;
  readonly value: DateTimeRange;
}

export interface RelativeDatePreset {
  readonly label: string;
  readonly value: string;
}

// =============================================================================
// Config Types
// =============================================================================

export interface PowerSearchOperator {
  readonly key: string;
  readonly label: string;
  readonly value: OperatorValue;
}

export interface PowerSearchField {
  readonly key: string;
  readonly label: string;
  readonly operators: ReadonlyArray<PowerSearchOperator>;
  /** Icon displayed next to the field name. */
  readonly icon?: ReactNode;
  /** Default operator key when the field is selected. */
  readonly defaultOperator?: string;
  /** Group label for organizing fields. */
  readonly group?: string;
  /** Description text for the field. */
  readonly description?: string;
  /** Alternative strings that match this field in typeahead. */
  readonly typeaheadAliases?: ReadonlyArray<string>;
  /** Minimum query length before this field appears in typeahead. */
  readonly typeaheadMinQueryLength?: number;
  /** Whether to show this field as a "value match" in typeahead. @default true */
  readonly isValueMatchAllowed?: boolean;
}

export interface PowerSearchConfig {
  readonly name: string;
  readonly fields: ReadonlyArray<PowerSearchField>;
  /** Key of the field used for content/text search. */
  readonly contentSearchFieldKey?: string;
}

// =============================================================================
// Filter Types
// =============================================================================

export interface PowerSearchFilter {
  readonly field: string;
  readonly operator: string;
  readonly value: FilterValue;
  /** Prevent editing this filter. */
  readonly isReadOnly?: boolean;
}

export interface PartialFilter {
  readonly field: string;
  readonly operator?: string;
  readonly value?: FilterValue;
  readonly isReadOnly?: boolean;
}

// =============================================================================
// Change & Handle Types
// =============================================================================

export type PowerSearchChangeType = 'add' | 'edit' | 'remove';

export interface XDSPowerSearchHandle {
  /** Focus the typeahead input. */
  focusTypeahead(): void;
  /** Blur the typeahead input. */
  blurTypeahead(): void;
}

// =============================================================================
// Internal auxiliary data for tokenizer items
// =============================================================================

export interface PowerSearchAuxData {
  readonly fieldKey: string;
  readonly operatorKey?: string;
  readonly filterValue?: FilterValue;
  /** Index in the filters array (for editing/removing). */
  readonly filterIndex?: number;
}

export type PowerSearchItem = XDSSearchableItem<PowerSearchAuxData>;
