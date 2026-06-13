// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, test} from 'vitest';
import transform from '../migrate-theme-selectors-to-data-attrs.mjs';

function apply(source) {
  return transform({source}, {}) ?? '';
}

describe('migrate-theme-selectors-to-data-attrs', () => {
  test('converts button variant and size selectors', () => {
    expect(apply('.xds-button.primary.sm:hover { color: red; }')).toBe(
      '.xds-button[data-variant="primary"][data-size="sm"]:hover { color: red; }',
    );
  });

  test('converts heading level and color selectors', () => {
    expect(apply('.xds-heading.level-2.secondary { margin: 0; }')).toBe(
      '.xds-heading[data-level="2"][data-color="secondary"] { margin: 0; }',
    );
  });

  test('converts text type and color selectors', () => {
    expect(apply('.xds-text.body.primary { color: black; }')).toBe(
      '.xds-text[data-type="body"][data-color="primary"] { color: black; }',
    );
  });

  test('converts selectors inside TS string literals', () => {
    expect(
      apply("const selector = '.xds-card.muted > .xds-button.ghost';"),
    ).toBe(
      'const selector = \'.xds-card[data-variant="muted"] > .xds-button[data-variant="ghost"]\';',
    );
  });

  test('leaves unknown components unchanged', () => {
    expect(apply('.xds-made-up.primary { color: red; }')).toBe('');
  });

  test('leaves selectors with additional xds classes unchanged', () => {
    expect(apply('.xds-table-row.xds-row-selected { color: red; }')).toBe('');
  });
});
