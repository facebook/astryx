// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it, vi} from 'vitest';
import {
  buildInitialState,
  getMissingRequiredProps,
  pickPrimaryProps,
} from '../components/component-detail/interactiveState';
import type {PropDoc} from '../generated/componentRegistry';

vi.mock('@xds/core', () => ({}));
vi.mock('@xds/core/theme/syntax', () => ({allSyntaxPresets: []}));
vi.mock('../generated/themeRegistry', () => ({themeObjectsFull: {}}));

function prop(
  partial: Partial<PropDoc> & Pick<PropDoc, 'name' | 'type'>,
): PropDoc {
  return {
    description: '',
    ...partial,
  };
}

describe('component detail preview state', () => {
  it('generates safe runtime defaults for typeahead-like required props', async () => {
    const knobs = pickPrimaryProps('BaseTypeahead', [
      prop({name: 'searchSource', type: 'XDSSearchSource<T>', required: true}),
      prop({name: 'value', type: 'T | null', required: true}),
      prop({
        name: 'onChange',
        type: '(item: T | null) => void',
        required: true,
      }),
    ]);

    const state = buildInitialState(knobs);

    expect(state.value).toBeNull();
    expect(state.onChange).toEqual(expect.any(Function));
    expect(state.searchSource).toMatchObject({
      search: expect.any(Function),
      bootstrap: expect.any(Function),
      cancel: expect.any(Function),
    });
    await expect(
      Promise.resolve(
        (state.searchSource as {search: (query: string) => unknown}).search(
          'proj',
        ),
      ),
    ).resolves.toEqual([{id: 'projects', label: 'Projects'}]);
    expect(getMissingRequiredProps(knobs, state)).toEqual([]);
  });

  it('keeps generated required fallbacks when playground defaults open an inline preview', () => {
    const knobs = pickPrimaryProps('CommandPalette', [
      prop({name: 'isOpen', type: 'boolean', required: true}),
      prop({
        name: 'onOpenChange',
        type: '(isOpen: boolean) => void',
        required: true,
      }),
      prop({name: 'searchSource', type: 'XDSSearchSource<T>', required: true}),
      prop({name: 'isInline', type: 'boolean'}),
    ]);

    const state = buildInitialState(knobs, {
      defaults: {
        isOpen: true,
        isInline: true,
        onOpenChange: undefined,
      },
    });

    expect(state.isOpen).toBe(true);
    expect(state.isInline).toBe(true);
    expect(state.onOpenChange).toEqual(expect.any(Function));
    expect(state.searchSource).toMatchObject({
      search: expect.any(Function),
      bootstrap: expect.any(Function),
      cancel: expect.any(Function),
    });
    expect(getMissingRequiredProps(knobs, state)).toEqual([]);
  });

  it('reports required props that cannot be generated safely', () => {
    const knobs = pickPrimaryProps('CustomWidget', [
      prop({name: 'config', type: 'CustomConfig', required: true}),
    ]);
    const state = buildInitialState(knobs);

    expect(state.config).toBeUndefined();
    expect(getMissingRequiredProps(knobs, state)).toEqual(['config']);
  });
});
