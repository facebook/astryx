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
          // Check if query matches field name or aliases
          const fieldLabel = field.label.toLowerCase();
          const fieldMatches =
            fieldLabel.includes(lower) ||
            field.typeaheadAliases?.some(alias =>
              alias.toLowerCase().includes(lower),
            );

          // Respect typeaheadMinQueryLength
          if (
            field.typeaheadMinQueryLength != null &&
            lower.length < field.typeaheadMinQueryLength
          ) {
            continue;
          }

          if (fieldMatches) {
            // Add the field with its default operator
            const defaultOp = config.getDefaultOperator(field.key);
            const id = defaultOp ? `${field.key}:${defaultOp.key}` : field.key;
            if (!seen.has(id)) {
              seen.add(id);
              results.push({
                id,
                label: defaultOp
                  ? `${field.label} ${defaultOp.label}`
                  : field.label,
                auxiliaryData: {
                  fieldKey: field.key,
                  operatorKey: defaultOp?.key,
                },
              });
            }
          }

          // Also check if query matches operator labels
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
    if (defaultOp) {
      items.push({
        id: `${field.key}:${defaultOp.key}`,
        label: defaultOp.label
          ? `${field.label} ${defaultOp.label}`
          : field.label,
        auxiliaryData: {
          fieldKey: field.key,
          operatorKey: defaultOp.key,
        },
      });
    } else {
      items.push({
        id: field.key,
        label: field.label,
        auxiliaryData: {
          fieldKey: field.key,
        },
      });
    }
  }

  return items;
}
