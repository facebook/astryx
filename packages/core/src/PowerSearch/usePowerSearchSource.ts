'use client';

/**
 * @file usePowerSearchSource.ts
 * @input InternalConfig
 * @output XDSSearchSource for field typeahead in the main tokenizer
 * @position Hook; consumed by XDSPowerSearch
 *
 * SYNC: When modified, update:
 * - /packages/core/src/PowerSearch/index.ts
 */

import {useMemo} from 'react';
import type {XDSSearchSource} from '../Typeahead/types';
import type {InternalConfig} from './useInternalConfig';
import type {PowerSearchItem} from './types';

export function usePowerSearchSource(
  config: InternalConfig,
): XDSSearchSource<PowerSearchItem> {
  return useMemo(() => {
    const allItems = buildFieldItems(config);

    return {
      search(query: string): PowerSearchItem[] {
        const lower = query.toLowerCase().trim();
        if (lower === '') return allItems;

        const results: PowerSearchItem[] = [];
        const seen = new Set<string>();

        for (const field of config.getVisibleFields()) {
          // Respect typeaheadMinQueryLength
          if (
            field.typeaheadMinQueryLength != null &&
            lower.length < field.typeaheadMinQueryLength
          ) {
            continue;
          }

          // Check if query matches field name or aliases
          const fieldMatches =
            field.label.toLowerCase().includes(lower) ||
            field.typeaheadAliases?.some(alias =>
              alias.toLowerCase().includes(lower),
            );

          if (fieldMatches) {
            // Add the field name entry (opens with defaultOperator)
            const defaultOp = config.getDefaultOperator(field.key);
            const fieldId = field.key;
            if (!seen.has(fieldId)) {
              seen.add(fieldId);
              results.push({
                id: fieldId,
                label: field.label,
                auxiliaryData: {
                  fieldKey: field.key,
                  operatorKey: defaultOp?.key,
                },
              });
            }
          }

          // Check each field+operator combo against the query
          for (const op of field.operators) {
            const combinedLabel = `${field.label} ${op.label}`.toLowerCase();
            if (combinedLabel.includes(lower)) {
              const id = `${field.key}:${op.key}`;
              if (!seen.has(id)) {
                seen.add(id);
                results.push({
                  id,
                  label: `${field.label} ${op.label}`,
                  auxiliaryData: {
                    fieldKey: field.key,
                    operatorKey: op.key,
                  },
                });
              }
            }
          }
        }

        // Field+operator+value suggestions for string-valued operators.
        // Matches "title foobar" → Title contains "foobar"
        // and "title contains foobar" → Title contains "foobar"
        for (const field of config.getVisibleFields()) {
          if (field.isValueMatchAllowed === false) continue;

          const fieldLabel = field.label.toLowerCase();

          // Try "<field> <operator> <value>" first (longer match wins)
          let hasExactOperatorMatch = false;
          for (const op of field.operators) {
            if (op.value.type !== 'string' && op.value.type !== 'string_list') {
              continue;
            }
            const prefix = `${fieldLabel} ${op.label.toLowerCase()} `;
            if (lower.startsWith(prefix) && lower.length > prefix.length) {
              hasExactOperatorMatch = true;
              const rawValue = query.slice(prefix.length);
              const id = `${field.key}:${op.key}:value:${rawValue}`;
              if (!seen.has(id)) {
                seen.add(id);
                results.push({
                  id,
                  label: `${field.label} ${op.label} "${rawValue}"`,
                  auxiliaryData: {
                    fieldKey: field.key,
                    operatorKey: op.key,
                    filterValue:
                      op.value.type === 'string'
                        ? {type: 'string', value: rawValue}
                        : {type: 'string_list', value: [rawValue]},
                  },
                });
              }
            }
          }

          // Try "<field> <value>" — suggests all string-valued operators.
          // Skip if an explicit "<field> <operator> <value>" already matched.
          const fieldPrefix = `${fieldLabel} `;
          if (
            !hasExactOperatorMatch &&
            lower.startsWith(fieldPrefix) &&
            lower.length > fieldPrefix.length
          ) {
            // Check the remainder isn't the start of an operator name
            const remainder = lower.slice(fieldPrefix.length);
            const isOperatorPrefix = field.operators.some(op =>
              op.label.toLowerCase().startsWith(remainder),
            );
            if (!isOperatorPrefix) {
              const rawValue = query.slice(fieldPrefix.length);
              for (const op of field.operators) {
                if (
                  op.value.type !== 'string' &&
                  op.value.type !== 'string_list'
                ) {
                  continue;
                }
                const id = `${field.key}:${op.key}:value:${rawValue}`;
                if (!seen.has(id)) {
                  seen.add(id);
                  results.push({
                    id,
                    label: `${field.label} ${op.label} "${rawValue}"`,
                    auxiliaryData: {
                      fieldKey: field.key,
                      operatorKey: op.key,
                      filterValue:
                        op.value.type === 'string'
                          ? {type: 'string', value: rawValue}
                          : {type: 'string_list', value: [rawValue]},
                    },
                  });
                }
              }
            }
          }
        }

        // If contentSearchFieldKey is set and no field or field+operator
        // exactly matches the query, prepend a content search item
        const contentFieldKey = config.config.contentSearchFieldKey;
        const hasExactMatch = config
          .getVisibleFields()
          .some(
            f =>
              f.label.toLowerCase() === lower ||
              f.operators.some(
                op => `${f.label} ${op.label}`.toLowerCase() === lower,
              ),
          );
        if (contentFieldKey && !hasExactMatch) {
          const contentField = config.getField(contentFieldKey);
          const contentOp = config.getDefaultOperator(contentFieldKey);
          if (contentField && contentOp) {
            results.unshift({
              id: `__content_search__:${query}`,
              label: `"${query}"`,
              auxiliaryData: {
                fieldKey: contentFieldKey,
                operatorKey: contentOp.key,
                filterValue: {type: 'string', value: query},
              },
            });
          }
        }

        return results;
      },

      bootstrap(): PowerSearchItem[] {
        return allItems;
      },
    };
  }, [config]);
}

function buildFieldItems(config: InternalConfig): PowerSearchItem[] {
  const items: PowerSearchItem[] = [];

  for (const field of config.getVisibleFields()) {
    const defaultOp = config.getDefaultOperator(field.key);
    items.push({
      id: field.key,
      label: field.label,
      auxiliaryData: {
        fieldKey: field.key,
        operatorKey: defaultOp?.key,
      },
    });
  }

  return items;
}
