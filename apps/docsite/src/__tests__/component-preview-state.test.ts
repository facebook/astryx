// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it, vi} from 'vitest';
import {
  buildInitialState,
  buildRuntimePreviewState,
  getMissingRequiredProps,
  isOverlayPreviewClosed,
  pickPrimaryProps,
} from '../components/component-detail/interactiveState';
import type {PropDoc} from '../generated/componentRegistry';

vi.mock('@astryxdesign/core', () => ({}));
vi.mock('@astryxdesign/core/theme/syntax', () => ({allSyntaxPresets: []}));
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
      prop({name: 'searchSource', type: 'SearchSource<T>', required: true}),
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
      prop({name: 'searchSource', type: 'SearchSource<T>', required: true}),
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

  it('seeds OverflowList children from playground defaults so the preview is not empty', () => {
    const knobs = pickPrimaryProps('OverflowList', [
      prop({name: 'children', type: 'ReactNode', required: true}),
      prop({
        name: 'overflowRenderer',
        type: '(overflowItems: OverflowItem[]) => ReactNode',
      }),
    ]);

    const state = buildInitialState(knobs, {
      defaults: {
        children: [
          {
            __element: 'Button',
            props: {label: 'Overview', variant: 'secondary'},
          },
          {
            __element: 'Button',
            props: {label: 'Activity', variant: 'secondary'},
          },
          {
            __element: 'Button',
            props: {label: 'Settings', variant: 'secondary'},
          },
        ],
      },
    });

    expect(Array.isArray(state.children)).toBe(true);
    expect((state.children as unknown[]).length).toBe(3);
    expect(getMissingRequiredProps(knobs, state)).toEqual([]);
  });

  it("satisfies Icon's required, non-generatable icon prop via playground defaults", () => {
    const knobs = pickPrimaryProps('Icon', [
      prop({
        name: 'icon',
        type: 'IconName | ComponentType<SVGProps>',
        required: true,
      }),
    ]);

    // Without a playground default the required icon prop cannot be generated.
    expect(getMissingRequiredProps(knobs, buildInitialState(knobs))).toEqual([
      'icon',
    ]);

    // The doc's playground default seeds a valid semantic name.
    const state = buildInitialState(knobs, {defaults: {icon: 'search'}});
    expect(state.icon).toBe('search');
    expect(getMissingRequiredProps(knobs, state)).toEqual([]);
  });

  it("satisfies Citation's required, non-generatable source prop via playground defaults", () => {
    const knobs = pickPrimaryProps('Citation', [
      prop({name: 'source', type: 'CitationSource', required: true}),
      prop({name: 'number', type: 'number', required: true}),
    ]);

    // Without a playground default the custom-object `source` prop cannot be
    // generated, so the properties tab shows the missing-props placeholder
    // instead of an interactive preview.
    expect(getMissingRequiredProps(knobs, buildInitialState(knobs))).toEqual([
      'source',
    ]);

    // The doc's playground default seeds a renderable source object.
    const state = buildInitialState(knobs, {
      defaults: {
        source: {title: 'Astryx Design', url: 'https://example.com'},
        number: 1,
      },
    });
    expect(state.source).toMatchObject({title: 'Astryx Design'});
    expect(getMissingRequiredProps(knobs, state)).toEqual([]);
  });

  it('gives Timestamp a valid date value via playground defaults', () => {
    const knobs = pickPrimaryProps('Timestamp', [
      prop({name: 'value', type: 'string | number', required: true}),
    ]);

    // Without a playground default, the required string `value` falls back to
    // the prop's own name ("value"), which `new Date("value").toISOString()`
    // rejects with "Invalid time value" — crashing the preview on load.
    const fallback = buildInitialState(knobs).value;
    expect(fallback).toBe('value');
    expect(() => new Date(fallback as string).toISOString()).toThrow(
      'Invalid time value',
    );

    // The doc's playground default seeds a valid date the component can render.
    const state = buildInitialState(knobs, {
      defaults: {value: '2026-02-19T17:00:00Z'},
    });
    expect(state.value).toBe('2026-02-19T17:00:00Z');
    expect(() => new Date(state.value as string).toISOString()).not.toThrow();
    expect(getMissingRequiredProps(knobs, state)).toEqual([]);
  });

  it('gives Skeleton concrete preview dimensions via playground defaults', () => {
    const knobs = pickPrimaryProps('Skeleton', [
      prop({name: 'width', type: 'number | string', default: "'100%'"}),
      prop({name: 'height', type: 'number | string', default: "'100%'"}),
    ]);

    // Doc defaults alone would render at 100% (collapses in the centered preview).
    expect(buildInitialState(knobs).width).toBe('100%');

    // Playground defaults override with visible pixel dimensions.
    const state = buildInitialState(knobs, {
      defaults: {width: 200, height: 24},
    });
    expect(state.width).toBe(200);
    expect(state.height).toBe(24);
  });

  it('wires controlled open previews back to their isOpen prop', () => {
    const onPropChange = vi.fn();
    const runtimeState = buildRuntimePreviewState(
      {
        children: 'Preview content',
        isOpen: true,
      },
      onPropChange,
      {canControlOpenState: true},
    );

    expect(runtimeState.onOpenChange).toEqual(expect.any(Function));

    (runtimeState.onOpenChange as (isOpen: boolean) => void)(false);

    expect(onPropChange).toHaveBeenCalledWith('isOpen', false);
  });

  it('bridges a controlled value/onChange pair so the preview updates', () => {
    const knobs = pickPrimaryProps('Pagination', [
      prop({name: 'page', type: 'number', required: true}),
      prop({
        name: 'onChange',
        type: '(page: number) => void',
        required: true,
      }),
      prop({name: 'totalItems', type: 'number'}),
      prop({name: 'pageSize', type: 'number', default: '10'}),
      prop({
        name: 'onPageSizeChange',
        type: '(pageSize: number) => void',
      }),
    ]);

    const onPropChange = vi.fn();
    const runtimeState = buildRuntimePreviewState(
      {page: 1, totalItems: 100, pageSize: 10},
      onPropChange,
      {knobs},
    );

    // onChange's first param is `page`, which is a value prop → wired.
    expect(runtimeState.onChange).toEqual(expect.any(Function));
    (runtimeState.onChange as (page: number) => void)(3);
    expect(onPropChange).toHaveBeenCalledWith('page', 3);

    // onPageSizeChange's first param is `pageSize`, also a value prop → wired.
    expect(runtimeState.onPageSizeChange).toEqual(expect.any(Function));
    (runtimeState.onPageSizeChange as (pageSize: number) => void)(25);
    expect(onPropChange).toHaveBeenCalledWith('pageSize', 25);
  });

  it('bridges a generic value/onChange pair', () => {
    const knobs = pickPrimaryProps('Slider', [
      prop({name: 'value', type: 'number', required: true}),
      prop({
        name: 'onChange',
        type: '(value: number) => void',
        required: true,
      }),
    ]);

    const onPropChange = vi.fn();
    const runtimeState = buildRuntimePreviewState({value: 10}, onPropChange, {
      knobs,
    });

    (runtimeState.onChange as (value: number) => void)(42);
    expect(onPropChange).toHaveBeenCalledWith('value', 42);
  });

  it('leaves callbacks alone when no matching value prop exists in state', () => {
    const knobs = pickPrimaryProps('Button', [
      prop({name: 'label', type: 'string'}),
      prop({name: 'onClick', type: '(e: MouseEvent) => void'}),
    ]);

    const state = {label: 'Click me'};
    const onPropChange = vi.fn();
    const runtimeState = buildRuntimePreviewState(state, onPropChange, {knobs});

    // No `e` value prop in state → callback not bridged; state returned as-is.
    expect(runtimeState).toBe(state);
    expect(runtimeState.onClick).toBeUndefined();
  });

  it('only bridges isOpen when the preview opts into controlling open state', () => {
    const knobs = pickPrimaryProps('Popover', [
      prop({name: 'isOpen', type: 'boolean', required: true}),
      prop({
        name: 'onOpenChange',
        type: '(isOpen: boolean) => void',
        required: true,
      }),
    ]);

    const onPropChange = vi.fn();

    const withoutOptIn = buildRuntimePreviewState(
      {isOpen: true},
      onPropChange,
      {
        knobs,
      },
    );
    expect(withoutOptIn.onOpenChange).toBeUndefined();

    const withOptIn = buildRuntimePreviewState({isOpen: true}, onPropChange, {
      knobs,
      canControlOpenState: true,
    });
    (withOptIn.onOpenChange as (isOpen: boolean) => void)(false);
    expect(onPropChange).toHaveBeenCalledWith('isOpen', false);
  });

  it('keeps an explicit isOpen: false playground default in preview state', () => {
    const knobs = pickPrimaryProps('MobileNav', [
      prop({name: 'isOpen', type: 'boolean'}),
      prop({name: 'onOpenChange', type: '(isOpen: boolean) => void'}),
      prop({name: 'children', type: 'ReactNode', required: true}),
    ]);

    const state = buildInitialState(knobs, {
      overlay: true,
      defaults: {isOpen: false, children: 'nav items'},
    });

    // isOpen must be present (not undefined) so buildRuntimePreviewState can
    // bridge onOpenChange back into playground state for the open trigger.
    expect(state.isOpen).toBe(false);

    const onPropChange = vi.fn();
    const runtimeState = buildRuntimePreviewState(state, onPropChange, {
      knobs,
      canControlOpenState: true,
    });
    (runtimeState.onOpenChange as (isOpen: boolean) => void)(true);
    expect(onPropChange).toHaveBeenCalledWith('isOpen', true);
  });

  it('flags closed overlay previews only for overlay-mode playgrounds', () => {
    expect(isOverlayPreviewClosed({overlay: true}, {isOpen: false})).toBe(true);
    expect(isOverlayPreviewClosed({overlay: true}, {})).toBe(true);
    expect(isOverlayPreviewClosed({overlay: true}, {isOpen: true})).toBe(false);
    expect(isOverlayPreviewClosed({}, {isOpen: false})).toBe(false);
    expect(isOverlayPreviewClosed(null, {isOpen: false})).toBe(false);
    expect(isOverlayPreviewClosed(undefined, {})).toBe(false);
  });
});
