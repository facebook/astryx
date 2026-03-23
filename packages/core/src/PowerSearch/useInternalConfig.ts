'use client';

/**
 * @file useInternalConfig.ts
 * @input PowerSearchConfig
 * @output InternalConfig with O(1) lookups
 * @position Hook; consumed by XDSPowerSearch and sub-components
 *
 * SYNC: When modified, update:
 * - /packages/core/src/PowerSearch/index.ts
 */

import {useMemo} from 'react';
import type {
  PowerSearchConfig,
  PowerSearchField,
  PowerSearchOperator,
} from './types';

export interface InternalConfig {
  readonly config: PowerSearchConfig;
  getField(key: string): PowerSearchField | undefined;
  getOperator(
    fieldKey: string,
    operatorKey: string,
  ): PowerSearchOperator | undefined;
  getDefaultOperator(fieldKey: string): PowerSearchOperator | undefined;
  getVisibleFields(): ReadonlyArray<PowerSearchField>;
  getVisibleOperators(fieldKey: string): ReadonlyArray<PowerSearchOperator>;
}

export function useInternalConfig(config: PowerSearchConfig): InternalConfig {
  return useMemo(() => {
    const fieldMap = new Map<string, PowerSearchField>();
    const operatorMap = new Map<string, Map<string, PowerSearchOperator>>();

    for (const field of config.fields) {
      fieldMap.set(field.key, field);
      const opMap = new Map<string, PowerSearchOperator>();
      for (const op of field.operators) {
        opMap.set(op.key, op);
      }
      operatorMap.set(field.key, opMap);
    }

    return {
      config,

      getField(key: string) {
        return fieldMap.get(key);
      },

      getOperator(fieldKey: string, operatorKey: string) {
        return operatorMap.get(fieldKey)?.get(operatorKey);
      },

      getDefaultOperator(fieldKey: string) {
        const field = fieldMap.get(fieldKey);
        if (!field) return undefined;
        if (field.defaultOperator) {
          return operatorMap.get(fieldKey)?.get(field.defaultOperator);
        }
        return field.operators[0];
      },

      getVisibleFields() {
        return config.fields;
      },

      getVisibleOperators(fieldKey: string) {
        const field = fieldMap.get(fieldKey);
        return field?.operators ?? [];
      },
    };
  }, [config]);
}
