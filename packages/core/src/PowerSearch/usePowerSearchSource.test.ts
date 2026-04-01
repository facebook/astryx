/**
 * @file usePowerSearchSource.test.ts
 * @input usePowerSearchSource, useInternalConfig
 * @output Tests for field typeahead search source, including contentSearchFieldKey
 * @position Testing; validates usePowerSearchSource.ts
 */

import {describe, it, expect} from 'vitest';
import {renderHook} from '@testing-library/react';
import {usePowerSearchSource} from './usePowerSearchSource';
import {useInternalConfig} from './useInternalConfig';
import type {PowerSearchConfig, PowerSearchAuxData} from './types';

// =============================================================================
// Helpers
// =============================================================================

function createSource(config: PowerSearchConfig) {
  const {result} = renderHook(() => {
    const internal = useInternalConfig(config);
    return usePowerSearchSource(internal);
  });
  return result.current;
}

// =============================================================================
// Fixtures
// =============================================================================

const baseConfig: PowerSearchConfig = {
  name: 'TestSearch',
  fields: [
    {
      key: 'title',
      label: 'Title',
      defaultOperator: 'contains',
      operators: [
        {key: 'contains', label: 'contains', value: {type: 'string'}},
        {key: 'is', label: 'is', value: {type: 'string'}},
      ],
    },
    {
      key: 'status',
      label: 'Status',
      defaultOperator: 'is',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: {
            type: 'enum',
            values: [
              {value: 'open', label: 'Open'},
              {value: 'closed', label: 'Closed'},
            ],
          },
        },
      ],
    },
  ],
};

const configWithContentSearch: PowerSearchConfig = {
  ...baseConfig,
  contentSearchFieldKey: 'title',
};

// =============================================================================
// Tests
// =============================================================================

describe('usePowerSearchSource', () => {
  describe('bootstrap (no query)', () => {
    it('returns only field names without operator labels', () => {
      const source = createSource(baseConfig);
      const items = source.bootstrap();

      expect(items.map(i => i.label)).toEqual(['Title', 'Status']);
    });

    it('sets defaultOperator on bootstrap items', () => {
      const source = createSource(baseConfig);
      const items = source.bootstrap();

      const titleAux = items[0].auxiliaryData as PowerSearchAuxData;
      expect(titleAux.fieldKey).toBe('title');
      expect(titleAux.operatorKey).toBe('contains');

      const statusAux = items[1].auxiliaryData as PowerSearchAuxData;
      expect(statusAux.fieldKey).toBe('status');
      expect(statusAux.operatorKey).toBe('is');
    });

    it('empty search returns same as bootstrap', () => {
      const source = createSource(baseConfig);
      expect(source.search('')).toEqual(source.bootstrap());
    });
  });

  describe('search (with query)', () => {
    it('shows field name for partial match', () => {
      const source = createSource(baseConfig);
      const results = source.search('tit');

      expect(results.some(r => r.label === 'Title')).toBe(true);
    });

    it('shows all field+operator combos for partial match', () => {
      const source = createSource(baseConfig);
      const results = source.search('tit');
      const labels = results.map(r => r.label);

      expect(labels).toContain('Title');
      expect(labels).toContain('Title contains');
      expect(labels).toContain('Title is');
    });

    it('matches query against combined field and operator label', () => {
      const source = createSource(baseConfig);
      const results = source.search('title contains');

      expect(results.some(r => r.label === 'Title contains')).toBe(true);
    });

    it('matches partial field + operator query', () => {
      const source = createSource(baseConfig);
      const results = source.search('title con');

      expect(results.some(r => r.label === 'Title contains')).toBe(true);
    });

    it('field name item uses defaultOperator', () => {
      const source = createSource(baseConfig);
      const results = source.search('tit');

      const titleItem = results.find(r => r.label === 'Title');
      const aux = titleItem?.auxiliaryData as PowerSearchAuxData;
      expect(aux.operatorKey).toBe('contains');
    });

    it('field+operator items use specific operator', () => {
      const source = createSource(baseConfig);
      const results = source.search('tit');

      const isItem = results.find(r => r.label === 'Title is');
      const aux = isItem?.auxiliaryData as PowerSearchAuxData;
      expect(aux.operatorKey).toBe('is');
    });
  });

  describe('contentSearchFieldKey', () => {
    it('shows content search item for non-matching query', () => {
      const source = createSource(configWithContentSearch);
      const results = source.search('foobar');

      expect(results[0].label).toBe('"foobar"');
      const aux = results[0].auxiliaryData as PowerSearchAuxData;
      expect(aux.fieldKey).toBe('title');
      expect(aux.operatorKey).toBe('contains');
      expect(aux.filterValue).toEqual({type: 'string', value: 'foobar'});
    });

    it('does not show content search item when query exactly matches a field name', () => {
      const source = createSource(configWithContentSearch);
      const results = source.search('title');

      const contentItem = results.find(r => r.label.startsWith('"'));
      expect(contentItem).toBeUndefined();
    });

    it('does not show content search item when query exactly matches field + operator', () => {
      const source = createSource(configWithContentSearch);
      const results = source.search('Title contains');

      const contentItem = results.find(r => r.label.startsWith('"'));
      expect(contentItem).toBeUndefined();
    });

    it('exact match check is case-insensitive', () => {
      const source = createSource(configWithContentSearch);
      const results = source.search('TITLE');

      const contentItem = results.find(r => r.label.startsWith('"'));
      expect(contentItem).toBeUndefined();
    });

    it('shows content search item for partial field match', () => {
      const source = createSource(configWithContentSearch);
      const results = source.search('tit');

      expect(results[0].label).toBe('"tit"');
      // Field and field+operator results should still appear after
      expect(results.some(r => r.label === 'Title')).toBe(true);
      expect(results.some(r => r.label === 'Title contains')).toBe(true);
    });

    it('does not show content search item when contentSearchFieldKey is not set', () => {
      const source = createSource(baseConfig);
      const results = source.search('foobar');

      const contentItem = results.find(r => r.label.startsWith('"'));
      expect(contentItem).toBeUndefined();
    });

    it('content search item is first in results', () => {
      const source = createSource(configWithContentSearch);
      const results = source.search('sta');

      expect(results[0].label).toBe('"sta"');
      expect(results.length).toBeGreaterThan(1);
    });
  });
});
