// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PowerSearchRouting.test.tsx
 * @input Uses vitest, @testing-library/react, PowerSearch
 * @output Tests coarse-pointer routing between PowerSearch surfaces
 * @position Core integration test for PowerSearch.tsx
 *
 * SYNC: When PowerSearch pointer routing changes, update these tests
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {PowerSearch} from './PowerSearch';
import type {PowerSearchConfig} from './types';

const config: PowerSearchConfig = {
  name: 'RoutingTest',
  fields: [
    {
      key: 'title',
      label: 'Title',
      defaultOperator: 'contains',
      operators: [
        {key: 'contains', label: 'contains', value: {type: 'string'}},
      ],
    },
    {
      key: 'status',
      label: 'Status',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: {
            type: 'enum',
            values: [{value: 'open', label: 'Open'}],
          },
        },
      ],
    },
  ],
};

function setCoarsePointer(isCoarse: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query === '(pointer: coarse)' ? isCoarse : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PowerSearch pointer routing', () => {
  it('renders the touch surface for a coarse pointer', () => {
    setCoarsePointer(true);
    render(<PowerSearch config={config} filters={[]} onChange={() => {}} />);

    expect(screen.getByRole('button', {name: 'Add filters…'})).toBeTruthy();
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('keeps the typeahead surface for a fine pointer', () => {
    setCoarsePointer(false);
    render(<PowerSearch config={config} filters={[]} onChange={() => {}} />);

    expect(screen.getByRole('combobox', {name: 'Search'})).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'Add filters…'})).toBeNull();
  });

  it('renders hybrid content search on a coarse pointer', () => {
    setCoarsePointer(true);
    render(
      <PowerSearch
        config={{...config, contentSearchFieldKey: 'title'}}
        filters={[]}
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole('searchbox', {name: 'Search'})).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Add filters…'})).toBeTruthy();
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('keeps the typeahead surface for unsupported content-search values', () => {
    setCoarsePointer(true);
    render(
      <PowerSearch
        config={{...config, contentSearchFieldKey: 'status'}}
        filters={[]}
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole('combobox', {name: 'Search'})).toBeTruthy();
    expect(screen.queryByRole('searchbox')).toBeNull();
  });

  it('keeps the typeahead surface when nested filters need the desktop editor', () => {
    setCoarsePointer(true);
    const nestedConfig: PowerSearchConfig = {
      name: 'NestedRoutingTest',
      fields: [
        {
          key: 'group',
          label: 'Group',
          operators: [
            {key: 'matches', label: 'matches', value: {type: 'nested'}},
          ],
        },
      ],
    };
    render(
      <PowerSearch config={nestedConfig} filters={[]} onChange={() => {}} />,
    );

    expect(screen.getByRole('combobox', {name: 'Search'})).toBeTruthy();
  });

  it('keeps configured token-overflow behavior on the typeahead surface', () => {
    setCoarsePointer(true);
    render(
      <PowerSearch
        config={config}
        filters={[]}
        onChange={() => {}}
        tokenOverflowBehavior="unfocusedInline"
      />,
    );

    expect(screen.getByRole('combobox', {name: 'Search'})).toBeTruthy();
  });
});
