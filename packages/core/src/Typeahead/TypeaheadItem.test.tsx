// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TypeaheadItem.test.tsx
 * @input Uses vitest, @testing-library/react, TypeaheadItem
 * @output Unit tests for TypeaheadItem
 * @position Testing; validates TypeaheadItem.tsx implementation
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {TypeaheadItem} from './TypeaheadItem';

describe('TypeaheadItem', () => {
  it('forwards pass-through props to the item element', () => {
    render(
      <TypeaheadItem
        item={{id: '1', label: 'Alice'}}
        aria-label="Alice, engineer"
        id="result-1"
        data-source="directory"
        data-testid="item"
      />,
    );
    const item = screen.getByTestId('item');
    expect(item).toHaveAttribute('aria-label', 'Alice, engineer');
    expect(item).toHaveAttribute('id', 'result-1');
    expect(item).toHaveAttribute('data-source', 'directory');
  });

  it('merges a caller className with its own classes', () => {
    render(
      <TypeaheadItem
        item={{id: '1', label: 'Alice'}}
        className="caller-class"
        data-testid="item"
      />,
    );
    const item = screen.getByTestId('item');
    expect(item.className).toContain('caller-class');
    expect(item.className).toContain('astryx-typeahead-item');
  });
});
