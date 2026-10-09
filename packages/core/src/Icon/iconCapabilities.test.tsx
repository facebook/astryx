// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file iconCapabilities.test.tsx
 * @input Pure local contracts, adaptive sources and private resolution
 * @output Regression evidence for admission, source defaults, mutation and opaque artwork
 * @position Core A tests; no subsequent rendering protocols or public resolver APIs
 */
import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {defineTheme} from '../theme/defineTheme';
import {__resetDevWarnings} from '../utils/devWarning';
import {
  getIcon,
  getIconRegistry,
  registerIcons,
  resetIcons,
} from './globalIconRegistry';
import {
  defineIconCapabilities,
  getApplicationIconCapabilities,
  getIconThemeContracts,
  markIconThemePolicyMalformed,
  mergeIconThemeCapabilities,
  normalizeIconThemeCapabilities,
  readIconThemeCapabilities,
  readIconThemeContractList,
  type IconCapabilities,
} from './iconCapabilities';
import {
  defineAdaptiveIcon,
  getIconSourceDefaults,
  normalizeIconEntry,
  prepareIconEntries,
  selectAdaptiveIcon,
} from './adaptiveIcons';
import {resolveIconWithContext} from './iconResolution';

const range = defineIconCapabilities({
  sizes: {hero: {default: '2.5rem'}},
  appearances: ['outline', 'fill'],
  weights: {range: {min: 100, max: 900}},
});
const exact = defineIconCapabilities({
  appearances: ['outline', 'fill'],
  weights: {values: ['light', 'bold']},
});
declare module './index' {
  interface IconCapabilityMap {
    engineRangeFixture: typeof range;
    engineExactFixture: typeof exact;
  }
}
const fixed = <svg data-art="default" />;
const supplied = <svg data-art="supplied" />;
const Weighted = ({weight}: {weight?: number}) => <svg data-weight={weight} />;
const variable = defineAdaptiveIcon(range, {
  default: {render: Weighted, weightRange: {min: 200, max: 800}},
});

beforeEach(() => {
  resetIcons();
  __resetDevWarnings();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  resetIcons();
});

describe('pure capability contracts', () => {
  it('snapshots local data without admitting it to unrelated requests', () => {
    expect(getApplicationIconCapabilities().appearances).toEqual([]);
    const result = resolveIconWithContext('close', {size: 'hero'});
    expect(result.inspection.size.admitted).toBe(false);
    expect(result.inspection.size.selected).toBe('md');
    expect(getApplicationIconCapabilities().sizes).not.toHaveProperty('hero');
  });
  it('preserves normalized and unchanged raw contract pointer identity', () => {
    const raw = {sizes: {hero: {default: '2.5rem'}}, appearances: ['outline']};
    const snapshot = defineIconCapabilities(raw);
    expect(defineIconCapabilities(raw)).toBe(snapshot);
    expect(defineIconCapabilities(snapshot)).toBe(snapshot);
    expect(Object.isFrozen(snapshot.sizes?.hero)).toBe(true);
    raw.appearances.push('fill');
    const changed = defineIconCapabilities(raw);
    expect(changed).not.toBe(snapshot);
    expect(snapshot.appearances).toEqual(['outline']);
    expect(changed.appearances).toEqual(['outline', 'fill']);
  });
  it('strictly revalidates raw mutation before WeakMap cache reuse', () => {
    const raw = {weights: {range: {min: 100, max: 900}}};
    defineIconCapabilities(raw);
    raw.weights.range.max = Number.NaN;
    expect(() => defineIconCapabilities(raw)).toThrow();
  });
  it('normalizes a foreign frozen snapshot without structural identity guessing', () => {
    const foreign = Object.freeze({appearances: Object.freeze(['outline'])});
    const local = defineIconCapabilities(foreign);
    expect(local).not.toBe(foreign);
    expect(defineIconCapabilities(foreign)).toBe(local);
    expect(defineIconCapabilities({...foreign})).not.toBe(local);
  });
  it('preserves valid contract-list siblings without array getters, methods or inherited slots', () => {
    const valid = Object.freeze({appearances: Object.freeze(['fill'])});
    const snapshot = defineIconCapabilities(valid);
    const getter = vi.fn(() => {
      throw new Error('array accessor executed');
    });
    const contributors: unknown[] = Array(3);
    contributors[2] = valid;
    Object.defineProperties(contributors, {
      '0': {get: getter},
      map: {get: getter},
      [Symbol.iterator]: {get: getter},
    });
    const invalid = vi.fn();
    const survivors = readIconThemeContractList(contributors, invalid);
    expect(survivors).toHaveLength(1);
    expect(survivors[0]).toBe(snapshot);
    expect(Object.isFrozen(survivors)).toBe(true);
    expect(invalid).toHaveBeenCalled();
    expect(getter).not.toHaveBeenCalled();
  });
  it('revalidates mutable contract-list contributors while preserving unaffected snapshot lineage', () => {
    const raw = {sizes: {hero: {default: '40px'}}, appearances: ['fill']};
    const foreign = Object.freeze({appearances: Object.freeze(['outline'])});
    const own = defineIconCapabilities(raw);
    const other = defineIconCapabilities(foreign);
    const input = [raw, {appearances: ['']}, foreign];
    const invalid = vi.fn();
    for (let read = 0; read < 2; read++) {
      const survivors = readIconThemeContractList(input, invalid);
      expect(survivors).toHaveLength(2);
      expect(survivors[0]).toBe(own);
      expect(survivors[1]).toBe(other);
    }
    raw.appearances[0] = '';
    const survivors = readIconThemeContractList(input, invalid);
    expect(survivors).toHaveLength(1);
    expect(survivors[0]).toBe(other);
    raw.appearances[0] = 'fill';
    expect(readIconThemeContractList(input, invalid)[0]).toBe(own);
    expect(invalid).toHaveBeenCalled();
    expect(getApplicationIconCapabilities().sizes).not.toHaveProperty('hero');
  });
  it('rejects inherited contract-array behavior before getter or iterator execution', () => {
    const getter = vi.fn(() => {
      throw new Error('contract array behavior executed');
    });
    const appearances = ['fill'];
    Object.setPrototypeOf(
      appearances,
      Object.defineProperties(Object.create(Array.prototype), {
        every: {get: getter},
        [Symbol.iterator]: {get: getter},
      }),
    );
    const valid = defineIconCapabilities({appearances: ['outline']});
    const invalid = vi.fn();
    const survivors = readIconThemeContractList(
      [{appearances}, valid],
      invalid,
    );
    expect(survivors).toHaveLength(1);
    expect(survivors[0]).toBe(valid);
    expect(invalid).toHaveBeenCalled();
    expect(getter).not.toHaveBeenCalled();
  });
  it('caches explicit immutable composition and accepts equivalent built-in defaults', () => {
    expect(getApplicationIconCapabilities(range, exact)).toBe(
      getApplicationIconCapabilities(range, exact),
    );
    const builtin = defineIconCapabilities({sizes: {md: {default: '1.25rem'}}});
    expect(getApplicationIconCapabilities(builtin).sizes.md.default).toBe(
      '20px',
    );
  });
  it('rejects conflicting canonical defaults without touching another source', () => {
    const other = defineIconCapabilities({sizes: {hero: {default: '3rem'}}});
    expect(() => getApplicationIconCapabilities(range, other)).toThrow(
      /conflicting/,
    );
    expect(getApplicationIconCapabilities(range).sizes.hero.default).toBe(
      '2.5rem',
    );
  });
  it.each([
    {sizes: {hero: {default: '0px'}}},
    {sizes: {hero: {default: '20px; color:red'}}},
    {sizes: {hero: {default: 'calc(foo)'}}},
    {appearances: ['outline', 'outline']},
    {appearances: ['']},
    {weights: {values: [Number.POSITIVE_INFINITY]}},
    {weights: {values: [100, '100']}},
    {weights: {range: {min: 100, max: 100}}},
    {weights: {values: [100], range: {min: 100, max: 900}}},
    {unexpected: true},
  ])('rejects malformed contract data %#', value => {
    expect(() => defineIconCapabilities(value as IconCapabilities)).toThrow();
  });
  it('never executes contract fields or array-item getters', () => {
    const getter = vi.fn(() => ['outline']);
    expect(() =>
      defineIconCapabilities(
        Object.defineProperty({}, 'appearances', {get: getter}),
      ),
    ).toThrow();
    const array = Object.defineProperty(['outline'], '0', {get: getter});
    expect(() => defineIconCapabilities({appearances: array})).toThrow();
    expect(getter).not.toHaveBeenCalled();
  });
});

describe('bound adaptive artwork', () => {
  it('retains fixed read-map and supplied node/callback/ref identity', () => {
    const callback = vi.fn();
    const ref = React.createRef<SVGSVGElement>();
    const node = <svg onClick={callback} ref={ref} />;
    const entries = prepareIconEntries({close: node}).entries;
    expect(getIconSourceDefaults(entries)).toBe(entries);
    expect(entries.close).toBe(node);
    const theme = defineTheme({name: 'fixed-identity', icons: {close: node}});
    expect(getIcon('close', theme)).toBe(node);
    expect(
      (
        getIcon('close', theme) as React.ReactElement<{
          onClick: unknown;
          ref: unknown;
        }>
      ).props,
    ).toMatchObject({onClick: callback, ref});
    expect(callback).not.toHaveBeenCalled();
  });
  it('freezes only source IR and leaves lazy payloads/components opaque', () => {
    const lazy = React.lazy(async () => ({default: Weighted}));
    const getter = vi.fn(() => {
      throw new Error('lazy payload inspected');
    });
    Object.defineProperty(lazy, '_payload', {get: getter});
    Object.defineProperty(lazy, '_init', {get: getter});
    const source = defineAdaptiveIcon(range, {
      default: {render: lazy, weightRange: {min: 100, max: 900}},
    });
    const defaults = getIconSourceDefaults({close: source});
    expect((defaults.close as React.ReactElement).type).toBe(lazy);
    expect((defaults.close as React.ReactElement).props).toEqual({});
    expect(Object.isFrozen(source.tree)).toBe(true);
    expect(getter).not.toHaveBeenCalled();
  });
  it('passes a fractional numeric weight unchanged inside the supplied range', () => {
    const result = selectAdaptiveIcon(variable, {size: 'md', weight: 347.125});
    expect((result.node as React.ReactElement).type).toBe(Weighted);
    expect(
      (result.node as React.ReactElement<{weight: number}>).props.weight,
    ).toBe(347.125);
    expect(result.weight).toMatchObject({supported: true, selected: 347.125});
  });
  it('keeps supplied default props empty when a range request is unsupported', () => {
    const result = selectAdaptiveIcon(variable, {size: 'md', weight: 150});
    expect((result.node as React.ReactElement).props).toEqual({});
    expect(result.weight.fallback).toBe(true);
  });
  it('selects size then appearance then weight without searching siblings', () => {
    const source = defineAdaptiveIcon(exact, {
      default: fixed,
      bySize: {
        sm: {
          default: fixed,
          byAppearance: {fill: {default: fixed, byWeight: {bold: supplied}}},
        },
        md: supplied,
      },
    });
    expect(
      selectAdaptiveIcon(source, {
        size: 'sm',
        appearance: 'fill',
        weight: 'bold',
      }).node,
    ).toBe(supplied);
    expect(
      selectAdaptiveIcon(source, {
        size: 'lg',
        appearance: 'fill',
        weight: 'bold',
      }).node,
    ).toBe(fixed);
    expect(
      selectAdaptiveIcon(source, {
        size: 'sm',
        appearance: 'outline',
        weight: 'bold',
      }).node,
    ).toBe(fixed);
  });
  it.each([
    {bySize: {sm: fixed}},
    {default: fixed, bySize: {hero: supplied}},
    {default: fixed, byAppearance: {unknown: supplied}},
    {
      default: fixed,
      byAppearance: {fill: {default: fixed, bySize: {sm: supplied}}},
    },
    {default: {render: Weighted, weightRange: {min: 100, max: 900}}},
    {default: fixed, byWeight: {'200': supplied}},
  ])('rejects malformed, unadmitted or out-of-order trees %#', tree => {
    expect(() => defineAdaptiveIcon(exact, tree as never)).toThrow();
  });
  it('refuses unbound trees and top-level parameterized IR', () => {
    expect((): void => {
      void normalizeIconEntry({default: fixed});
    }).toThrow(/bound/);
    expect((): void => {
      void normalizeIconEntry(
        {render: Weighted, weightRange: {min: 100, max: 900}},
        range,
      );
    }).toThrow();
    registerIcons({close: fixed});
    expect(getApplicationIconCapabilities().appearances).toEqual([]);
  });
  it('rejects source IR inside fixed React arrays without invoking getters', () => {
    expect(() =>
      defineAdaptiveIcon(range, {
        default: [{render: Weighted, weightRange: {min: 100, max: 900}}],
      } as never),
    ).toThrow();
    expect(() =>
      defineAdaptiveIcon(range, {default: [{default: fixed}]} as never),
    ).toThrow();
    const getter = vi.fn(() => fixed);
    const array = Object.defineProperty([fixed], '0', {get: getter});
    expect(() => defineAdaptiveIcon(range, {default: array})).toThrow();
    expect(getter).not.toHaveBeenCalled();
  });
  it('revalidates opaque mutable fixed arrays before reusing an immutable source', () => {
    const nodes: unknown[] = [fixed];
    const source = defineAdaptiveIcon(range, {
      default: nodes as React.ReactNode[],
    });
    nodes[0] = {render: Weighted, weightRange: {min: 100, max: 900}};
    const fallback = resolveIconWithContext(
      'close',
      {},
      {
        name: 'mutated-array',
        tokens: {},
        icons: {},
        __iconSources: {close: source},
      },
    );
    expect(fallback.inspection.diagnostics).toContainEqual(
      expect.objectContaining({code: 'malformed-entry'}),
    );
    expect(fallback.inspection.source.provenance).toBe('default');
  });
  it('preserves opaque promises/iterables and ordinary fixed arrays', () => {
    const promise = Promise.resolve(fixed);
    const iterator = {
      *[Symbol.iterator]() {
        yield fixed;
      },
    };
    const array = [fixed, supplied];
    expect(normalizeIconEntry(promise)).toBe(promise);
    expect(normalizeIconEntry(iterator)).toBe(iterator);
    expect(normalizeIconEntry(array)).toBe(array);
  });
});

describe('safe local theme policy', () => {
  it('shares explicit contract lineage with source and normalized policy', () => {
    const raw = {
      appearances: ['outline', 'fill'] as const,
      weights: {range: {min: 100, max: 900}},
    };
    const source = defineAdaptiveIcon(raw, {
      default: {render: Weighted, weightRange: {min: 100, max: 900}},
    });
    const theme = defineTheme({
      name: 'lineage',
      icons: {close: source},
      iconCapabilities: {
        contract: raw,
        presentation: {default: {weight: 400.5}},
      },
    });
    expect(theme.iconCapabilities?.contract).toBe(source.capabilities);
    expect(theme.__iconContracts).toContain(source.capabilities);
    expect((theme.icons?.close as React.ReactElement).props).toEqual({});
    expect(
      (getIcon('close', theme) as React.ReactElement<{weight: number}>).props
        .weight,
    ).toBe(400.5);
    expect(React.isValidElement(getIconRegistry(theme).close)).toBe(true);
  });
  it('sanitizes invalid siblings without executing any policy getter', () => {
    const getter = vi.fn(() => 'fill');
    const raw = {
      contract: range,
      sizeOverrides: {hero: '3rem', unknown: '4rem'},
      presentation: {
        default: {
          weight: 300.5,
          get appearance() {
            return getter();
          },
        },
      },
    };
    const invalid = vi.fn();
    const policy = readIconThemeCapabilities(raw, [range], invalid);
    expect(policy?.sizeOverrides).toEqual({hero: '3rem'});
    expect(policy?.presentation?.default).toEqual({weight: 300.5});
    expect(invalid).toHaveBeenCalled();
    expect(getter).not.toHaveBeenCalled();
  });
  it('retains malformed evidence and valid intent through immutable merges', () => {
    const invalid = vi.fn();
    const policy = readIconThemeCapabilities(
      {contract: range, presentation: {default: {weight: 300}, unknown: true}},
      [range],
      invalid,
    );
    const merged = mergeIconThemeCapabilities(
      policy,
      normalizeIconThemeCapabilities({sizeOverrides: {md: '30px'}}),
    );
    expect(merged?.presentation?.default?.weight).toBe(300);
    invalid.mockClear();
    readIconThemeCapabilities(merged, [range], invalid);
    expect(invalid).toHaveBeenCalled();
    expect(getIconThemeContracts(merged)).toContain(range);
  });
  it('carries a top-level descriptor failure without adding a public marker field', () => {
    const policy = markIconThemePolicyMalformed();
    expect(Object.keys(policy)).toEqual([]);
    const invalid = vi.fn();
    readIconThemeCapabilities(policy, [], invalid);
    expect(invalid).toHaveBeenCalledOnce();
  });
  it('treats null presentation and dimension overrides as inheritance clears', () => {
    const base = normalizeIconThemeCapabilities({
      contract: range,
      sizeOverrides: {hero: '3rem'},
      presentation: {default: {weight: 300}},
    });
    const own = normalizeIconThemeCapabilities(
      {sizeOverrides: {hero: null}, presentation: null},
      base,
    );
    expect(own?.sizeOverrides?.hero).toBeNull();
    expect(own?.presentation).toBeNull();
  });
  it('distinguishes application weight admission from source-local exact values', () => {
    const numericNames = defineIconCapabilities({weights: {values: ['400']}});
    const source = defineAdaptiveIcon(numericNames, {
      default: fixed,
      byWeight: {'400': supplied},
    });
    const theme = defineTheme({
      name: 'weight-local',
      icons: {close: source},
      iconCapabilities: {contract: range},
    });
    expect(resolveIconWithContext('close', {weight: 400}, theme).node).toBe(
      fixed,
    );
  });
  it('is quiet in production and deduplicates explicit unsupported requests in development', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const theme = defineTheme({
      name: 'diagnostics',
      icons: {close: fixed},
      iconCapabilities: {contract: range},
    });
    resolveIconWithContext('close', {appearance: 'fill'}, theme);
    resolveIconWithContext('close', {appearance: 'fill'}, theme);
    expect(warning).toHaveBeenCalledOnce();
    warning.mockClear();
    vi.stubEnv('NODE_ENV', 'production');
    resolveIconWithContext('close', {weight: 901}, theme);
    expect(warning).not.toHaveBeenCalled();
  });
  it('does not consume explicit warning keys for theme policy fallback', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const theme = defineTheme({
      name: 'policy-only',
      icons: {close: fixed},
      iconCapabilities: {
        contract: range,
        presentation: {default: {appearance: 'fill'}},
      },
    });
    resolveIconWithContext('close', {}, theme);
    expect(warning).not.toHaveBeenCalled();
    resolveIconWithContext('close', {appearance: 'fill'}, theme);
    expect(warning).toHaveBeenCalledOnce();
  });
  it('keeps fixed no-axis reads out of policy/contract inspection', () => {
    const getter = vi.fn(() => {
      throw new Error('fixed read inspected policy');
    });
    const theme = Object.defineProperties(
      {name: 'fixed-fast', tokens: {}, icons: {close: fixed}},
      {
        iconCapabilities: {get: getter},
        __iconContracts: {get: getter},
      },
    );
    expect(getIcon('close', theme)).toBe(fixed);
    expect(getIconRegistry(theme).close).toBe(fixed);
    expect(getter).not.toHaveBeenCalled();
  });
  it('protects near-property-read fixed lookup with warmed median batches', () => {
    const theme = defineTheme({
      name: 'fixed-budget',
      icons: {close: fixed},
      iconCapabilities: {contract: range},
    });
    // eslint-disable-next-line @typescript-eslint/promise-function-async -- This benchmarks synchronous fixed-node reads, never Promise-wrapped artwork.
    const read = () => getIcon('close', theme);
    // eslint-disable-next-line @typescript-eslint/promise-function-async -- The baseline is an opaque synchronous ReactNode property read.
    const baseline = () => theme.icons?.close;
    let sink: React.ReactNode;
    const time = (callback: () => React.ReactNode) => {
      const start = performance.now();
      for (let index = 0; index < 50000; index++) {
        sink = callback();
      }
      return (performance.now() - start) / 50000;
    };
    time(read);
    time(baseline);
    const median = (callback: () => React.ReactNode) =>
      [time(callback), time(callback), time(callback)].sort((a, b) => a - b)[1];
    const measured = median(read);
    const property = median(baseline);
    expect(sink).toBe(fixed);
    expect(measured).toBeLessThan(Math.max(0.0015, property * 30));
  });
});
