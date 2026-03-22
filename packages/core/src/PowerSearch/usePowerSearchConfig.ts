'use client';

/**
 * @file usePowerSearchConfig.ts
 * @input Field definitions with simplified types
 * @output PowerSearchConfig + applyFilters function for client-side filtering
 * @position Utility hook; sits alongside PowerSearch core types
 */

import {useMemo} from 'react';
import type {
  DateTimeRangePart,
  EnumItem,
  PowerSearchConfig,
  PowerSearchField,
  PowerSearchFilter,
  PowerSearchOperator,
} from './types';

// =============================================================================
// Public Types
// =============================================================================

type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'enum'
  | 'enum_list'
  | 'string_list';

type FieldTypeToJS = {
  string: string;
  number: number;
  boolean: boolean;
  date: Date | number;
  enum: string;
  enum_list: ReadonlyArray<string>;
  string_list: ReadonlyArray<string>;
};

export interface FieldDefinition<
  K extends string = string,
  T extends FieldType = FieldType,
> {
  readonly key: K;
  readonly type: T;
  readonly label?: string;
  /** Required for 'enum' and 'enum_list' field types. */
  readonly enumValues?: ReadonlyArray<EnumItem>;
}

/** Infers the data record type from a tuple of FieldDefinitions. */
export type InferData<D extends ReadonlyArray<FieldDefinition>> = {
  [F in D[number] as F['key']]: FieldTypeToJS[F['type']];
};

// =============================================================================
// Operator key constants
// =============================================================================

const StringOps = {
  CONTAINS: 'contains',
  NOT_CONTAINS: 'not_contains',
  STARTS_WITH: 'starts_with',
  NOT_STARTS_WITH: 'not_starts_with',
  ENDS_WITH: 'ends_with',
  NOT_ENDS_WITH: 'not_ends_with',
  IS: 'is',
  IS_NOT: 'is_not',
} as const;

const NumberOps = {
  EQUALS: 'equals',
  NOT_EQUALS: 'not_equals',
  GREATER_THAN: 'greater_than',
  LESS_THAN: 'less_than',
  GREATER_THAN_OR_EQUAL: 'greater_than_or_equal',
  LESS_THAN_OR_EQUAL: 'less_than_or_equal',
} as const;

const DateOps = {
  BEFORE: 'before',
  AFTER: 'after',
  BETWEEN: 'between',
} as const;

const BooleanOps = {
  IS_TRUE: 'is_true',
  IS_FALSE: 'is_false',
} as const;

const EnumOps = {
  IS: 'is',
  IS_NOT: 'is_not',
} as const;

const EnumListOps = {
  IS_ANY_OF: 'is_any_of',
  IS_NONE_OF: 'is_none_of',
} as const;

const StringListOps = {
  IS_ANY_OF: 'is_any_of',
  IS_NONE_OF: 'is_none_of',
} as const;

// =============================================================================
// Default operators per field type
// =============================================================================

function stringOperators(): {
  defaultOperator: string;
  operators: ReadonlyArray<PowerSearchOperator>;
} {
  return {
    defaultOperator: StringOps.CONTAINS,
    operators: [
      {key: StringOps.CONTAINS, label: 'contains', value: {type: 'string'}},
      {
        key: StringOps.NOT_CONTAINS,
        label: 'does not contain',
        value: {type: 'string'},
      },
      {
        key: StringOps.STARTS_WITH,
        label: 'starts with',
        value: {type: 'string'},
      },
      {
        key: StringOps.NOT_STARTS_WITH,
        label: 'does not start with',
        value: {type: 'string'},
      },
      {key: StringOps.ENDS_WITH, label: 'ends with', value: {type: 'string'}},
      {
        key: StringOps.NOT_ENDS_WITH,
        label: 'does not end with',
        value: {type: 'string'},
      },
      {key: StringOps.IS, label: 'is', value: {type: 'string'}},
      {key: StringOps.IS_NOT, label: 'is not', value: {type: 'string'}},
    ],
  };
}

function numberOperators(): {
  defaultOperator: string;
  operators: ReadonlyArray<PowerSearchOperator>;
} {
  return {
    defaultOperator: NumberOps.EQUALS,
    operators: [
      {
        key: NumberOps.EQUALS,
        label: 'is',
        value: {type: 'float'},
      },
      {
        key: NumberOps.NOT_EQUALS,
        label: 'is not',
        value: {type: 'float'},
      },
      {
        key: NumberOps.GREATER_THAN,
        label: 'is greater than',
        value: {type: 'float'},
      },
      {
        key: NumberOps.LESS_THAN,
        label: 'is less than',
        value: {type: 'float'},
      },
      {
        key: NumberOps.GREATER_THAN_OR_EQUAL,
        label: 'is greater than or equal to',
        value: {type: 'float'},
      },
      {
        key: NumberOps.LESS_THAN_OR_EQUAL,
        label: 'is less than or equal to',
        value: {type: 'float'},
      },
    ],
  };
}

function dateOperators(): {
  defaultOperator: string;
  operators: ReadonlyArray<PowerSearchOperator>;
} {
  return {
    defaultOperator: DateOps.AFTER,
    operators: [
      {
        key: DateOps.BEFORE,
        label: 'is before',
        value: {type: 'date_absolute'},
      },
      {
        key: DateOps.AFTER,
        label: 'is after',
        value: {type: 'date_absolute'},
      },
      {
        key: DateOps.BETWEEN,
        label: 'is between',
        value: {type: 'date_range'},
      },
    ],
  };
}

function booleanOperators(): {
  defaultOperator: string;
  operators: ReadonlyArray<PowerSearchOperator>;
} {
  return {
    defaultOperator: BooleanOps.IS_TRUE,
    operators: [
      {key: BooleanOps.IS_TRUE, label: 'is true', value: {type: 'empty'}},
      {key: BooleanOps.IS_FALSE, label: 'is false', value: {type: 'empty'}},
    ],
  };
}

function enumOperators(values: ReadonlyArray<EnumItem>): {
  defaultOperator: string;
  operators: ReadonlyArray<PowerSearchOperator>;
} {
  return {
    defaultOperator: EnumOps.IS,
    operators: [
      {key: EnumOps.IS, label: 'is', value: {type: 'enum', values}},
      {key: EnumOps.IS_NOT, label: 'is not', value: {type: 'enum', values}},
      {
        key: EnumListOps.IS_ANY_OF,
        label: 'is any of',
        value: {type: 'enum_list', values},
      },
      {
        key: EnumListOps.IS_NONE_OF,
        label: 'is none of',
        value: {type: 'enum_list', values},
      },
    ],
  };
}

function enumListOperators(values: ReadonlyArray<EnumItem>): {
  defaultOperator: string;
  operators: ReadonlyArray<PowerSearchOperator>;
} {
  return {
    defaultOperator: EnumListOps.IS_ANY_OF,
    operators: [
      {
        key: EnumListOps.IS_ANY_OF,
        label: 'is any of',
        value: {type: 'enum_list', values},
      },
      {
        key: EnumListOps.IS_NONE_OF,
        label: 'is none of',
        value: {type: 'enum_list', values},
      },
    ],
  };
}

function stringListOperators(): {
  defaultOperator: string;
  operators: ReadonlyArray<PowerSearchOperator>;
} {
  return {
    defaultOperator: StringListOps.IS_ANY_OF,
    operators: [
      {
        key: StringListOps.IS_ANY_OF,
        label: 'is any of',
        value: {type: 'string_list'},
      },
      {
        key: StringListOps.IS_NONE_OF,
        label: 'is none of',
        value: {type: 'string_list'},
      },
    ],
  };
}

// =============================================================================
// Config builder
// =============================================================================

function buildField(def: FieldDefinition): PowerSearchField {
  const label = def.label ?? def.key;

  switch (def.type) {
    case 'string': {
      const ops = stringOperators();
      return {key: def.key, label, ...ops};
    }
    case 'number': {
      const ops = numberOperators();
      return {key: def.key, label, ...ops};
    }
    case 'date': {
      const ops = dateOperators();
      return {key: def.key, label, ...ops};
    }
    case 'boolean': {
      const ops = booleanOperators();
      return {key: def.key, label, ...ops};
    }
    case 'enum': {
      const values = def.enumValues ?? [];
      const ops = enumOperators(values);
      return {key: def.key, label, ...ops};
    }
    case 'enum_list': {
      const values = def.enumValues ?? [];
      const ops = enumListOperators(values);
      return {key: def.key, label, ...ops};
    }
    case 'string_list': {
      const ops = stringListOperators();
      return {key: def.key, label, ...ops};
    }
  }
}

// =============================================================================
// Filter application
// =============================================================================

function toUnixSeconds(value: Date | number): number {
  if (value instanceof Date) {
    return Math.floor(value.getTime() / 1000);
  }
  return value;
}

function resolveRangePart(part: DateTimeRangePart): number {
  switch (part.type) {
    case 'NOW':
      return Math.floor(Date.now() / 1000);
    case 'ABSOLUTE':
      return part.unixSeconds;
    case 'RELATIVE': {
      const now = Date.now() / 1000;
      const multipliers: Record<string, number> = {
        second: 1,
        minute: 60,
        hour: 3600,
        day: 86400,
        week: 604800,
        month: 2592000,
        year: 31536000,
      };
      return Math.floor(now - part.backValue * (multipliers[part.unit] ?? 0));
    }
  }
}

function matchesFilter(
  row: Record<string, unknown>,
  filter: PowerSearchFilter,
): boolean {
  const fieldValue = row[filter.field];
  const {operator, value: filterValue} = filter;

  switch (filterValue.type) {
    case 'empty': {
      if (operator === BooleanOps.IS_TRUE) return Boolean(fieldValue) === true;
      if (operator === BooleanOps.IS_FALSE)
        return Boolean(fieldValue) === false;
      return true;
    }

    case 'string': {
      const s = String(fieldValue ?? '').toLowerCase();
      const target = filterValue.value.toLowerCase();
      if (operator in stringOpHandlers) {
        return stringOpHandlers[operator as keyof typeof stringOpHandlers](
          s,
          target,
        );
      }
      return true;
    }

    case 'integer':
    case 'float': {
      const n = Number(fieldValue);
      const target = filterValue.value;
      if (operator in numberOpHandlers) {
        return numberOpHandlers[operator as keyof typeof numberOpHandlers](
          n,
          target,
        );
      }
      return true;
    }

    case 'date_absolute': {
      const ts = toUnixSeconds(fieldValue as Date | number);
      if (operator === DateOps.BEFORE) return ts < filterValue.unixSeconds;
      if (operator === DateOps.AFTER) return ts > filterValue.unixSeconds;
      return true;
    }

    case 'date_range': {
      const ts = toUnixSeconds(fieldValue as Date | number);
      if (operator === DateOps.BETWEEN) {
        const start = resolveRangePart(filterValue.value.start);
        const end = resolveRangePart(filterValue.value.end);
        return ts >= start && ts <= end;
      }
      return true;
    }

    case 'enum': {
      if (operator === EnumOps.IS)
        return String(fieldValue) === filterValue.value;
      if (operator === EnumOps.IS_NOT)
        return String(fieldValue) !== filterValue.value;
      return true;
    }

    case 'enum_list': {
      const sv = String(fieldValue);
      if (operator === EnumListOps.IS_ANY_OF)
        return filterValue.value.includes(sv);
      if (operator === EnumListOps.IS_NONE_OF)
        return !filterValue.value.includes(sv);
      return true;
    }

    case 'string_list': {
      const arr = Array.isArray(fieldValue)
        ? (fieldValue as string[])
        : [String(fieldValue)];
      if (operator === StringListOps.IS_ANY_OF) {
        return arr.some(v => filterValue.value.includes(v));
      }
      if (operator === StringListOps.IS_NONE_OF) {
        return arr.every(v => !filterValue.value.includes(v));
      }
      return true;
    }

    default:
      return true;
  }
}

const stringOpHandlers = {
  [StringOps.CONTAINS]: (s: string, t: string) => s.includes(t),
  [StringOps.NOT_CONTAINS]: (s: string, t: string) => !s.includes(t),
  [StringOps.STARTS_WITH]: (s: string, t: string) => s.startsWith(t),
  [StringOps.NOT_STARTS_WITH]: (s: string, t: string) => !s.startsWith(t),
  [StringOps.ENDS_WITH]: (s: string, t: string) => s.endsWith(t),
  [StringOps.NOT_ENDS_WITH]: (s: string, t: string) => !s.endsWith(t),
  [StringOps.IS]: (s: string, t: string) => s === t,
  [StringOps.IS_NOT]: (s: string, t: string) => s !== t,
} as const;

const numberOpHandlers = {
  [NumberOps.EQUALS]: (n: number, t: number) => n === t,
  [NumberOps.NOT_EQUALS]: (n: number, t: number) => n !== t,
  [NumberOps.GREATER_THAN]: (n: number, t: number) => n > t,
  [NumberOps.LESS_THAN]: (n: number, t: number) => n < t,
  [NumberOps.GREATER_THAN_OR_EQUAL]: (n: number, t: number) => n >= t,
  [NumberOps.LESS_THAN_OR_EQUAL]: (n: number, t: number) => n <= t,
} as const;

// =============================================================================
// Public API
// =============================================================================

/**
 * Creates a PowerSearchConfig and an applyFilters function from field definitions.
 *
 * @example
 * ```
 * const defs = [
 *   { key: 'name', type: 'string', label: 'Name' },
 *   { key: 'age', type: 'number', label: 'Age' },
 *   { key: 'active', type: 'boolean', label: 'Active' },
 * ] as const;
 *
 * const { config, applyFilters } = createPowerSearchConfig(defs);
 * const filtered = applyFilters(filters, data);
 * ```
 */
export function createPowerSearchConfig<
  const D extends ReadonlyArray<FieldDefinition>,
>(
  definitions: D,
  configName?: string,
): {
  config: PowerSearchConfig;
  applyFilters: <T extends InferData<D>>(
    filters: ReadonlyArray<PowerSearchFilter>,
    data: ReadonlyArray<T>,
  ) => Array<T>;
} {
  const fields = definitions.map(buildField);

  const config: PowerSearchConfig = {
    name: configName ?? 'PowerSearchConfig',
    fields,
  };

  function applyFilters<T extends InferData<D>>(
    filters: ReadonlyArray<PowerSearchFilter>,
    data: ReadonlyArray<T>,
  ): Array<T> {
    if (filters.length === 0) return [...data];
    return data.filter(row =>
      filters.every(f => matchesFilter(row as Record<string, unknown>, f)),
    );
  }

  return {config, applyFilters};
}

/**
 * React hook that memoizes the result of createPowerSearchConfig.
 *
 * @example
 * ```
 * const defs = [
 *   { key: 'name', type: 'string', label: 'Name' },
 *   { key: 'status', type: 'enum', label: 'Status', enumValues: [
 *     { value: 'active', label: 'Active' },
 *     { value: 'inactive', label: 'Inactive' },
 *   ]},
 * ] as const;
 *
 * function MyComponent() {
 *   const { config, applyFilters } = usePowerSearchConfig(defs);
 *   const filtered = applyFilters(filters, data);
 *   // ...
 * }
 * ```
 */
export function usePowerSearchConfig<
  const D extends ReadonlyArray<FieldDefinition>,
>(
  definitions: D,
  configName?: string,
): {
  config: PowerSearchConfig;
  applyFilters: <T extends InferData<D>>(
    filters: ReadonlyArray<PowerSearchFilter>,
    data: ReadonlyArray<T>,
  ) => Array<T>;
} {
  return useMemo(
    () => createPowerSearchConfig(definitions, configName),
    [definitions, configName],
  );
}
