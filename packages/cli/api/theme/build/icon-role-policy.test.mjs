// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Structural role/state policy admission, captured retention and lossless emission.
 * @input Own-data maps, finite state names, null markers and selected raw lineage.
 * @output Import-order-independent admission and per-field erasure rejection.
 * @position Private CLI unit seam; never imports role registries or public resolver plumbing.
 */
import {describe, expect, it, vi} from 'vitest';
import {runInNewContext} from 'node:vm';
import {interceptCore} from './core-interception.mjs';
import {lowerBuiltIconContracts} from './icon-emission.mjs';
import {
  assertRetainedIconInput,
  assertSupportedIconFields,
  hasIconCapabilityIntent,
} from './icon-serialization.mjs';

const core = {defineIconCapabilities: value => value};
const policy = () => ({
  componentIcons: {'fixture-leading': 'close', 'fixture-trailing': null},
  iconCapabilities: {
    roleSizeOverrides: {'fixture-leading': 'sm', 'fixture-trailing': null},
    presentation: {
      default: {weight: 600},
      bySize: {sm: {weight: 400}},
      byState: {active: {appearance: 'filled'}, busy: {}},
    },
  },
});

describe('structural role/state admission', () => {
  it('admits own map and role policy without a declaration import or global state vocabulary', () => {
    const theme = policy();
    theme.componentIcons['fixture-fallback'] = undefined;
    expect(() => assertSupportedIconFields(theme)).not.toThrow();
    expect(() =>
      assertSupportedIconFields({componentIcons: undefined}),
    ).not.toThrow();
    expect(() => assertSupportedIconFields({componentIcons: {}})).not.toThrow();
    expect(() =>
      assertSupportedIconFields({
        iconCapabilities: {roleSizeOverrides: {}, presentation: {byState: {}}},
      }),
    ).not.toThrow();
    expect(hasIconCapabilityIntent({componentIcons: {}})).toBe(true);
    expect(hasIconCapabilityIntent({componentIcons: undefined})).toBe(false);
  });
  it.each([
    ['map array', {componentIcons: []}],
    ['map null', {componentIcons: null}],
    [
      'concrete artwork',
      {componentIcons: {'fixture-leading': {default: 'svg'}}},
    ],
    [
      'namespaced artwork',
      {componentIcons: {'fixture-leading': 'fixture:close'}},
    ],
    [
      'role without component',
      {iconCapabilities: {roleSizeOverrides: {leading: 'sm'}}},
    ],
    [
      'role dimension',
      {iconCapabilities: {roleSizeOverrides: {'fixture-leading': 16}}},
    ],
    ['role map null', {iconCapabilities: {roleSizeOverrides: null}}],
    ['state map null', {iconCapabilities: {presentation: {byState: null}}}],
    [
      'state request null',
      {iconCapabilities: {presentation: {byState: {active: null}}}},
    ],
    [
      'state weight',
      {iconCapabilities: {presentation: {byState: {active: {weight: 600}}}}},
    ],
    [
      'undefined state weight',
      {
        iconCapabilities: {
          presentation: {byState: {active: {weight: undefined}}},
        },
      },
    ],
    [
      'state size',
      {iconCapabilities: {presentation: {byState: {active: {size: 'sm'}}}}},
    ],
    ['new policy field', {iconCapabilities: {futurePolicy: {}}}],
    [
      'new presentation field',
      {iconCapabilities: {presentation: {futureStates: {}}}},
    ],
  ])(
    'rejects %s in selected/raw/inherited/spread/built evidence',
    (_label, input) => {
      for (const candidate of [input, {...input}, {...input, __built: true}]) {
        expect(() => assertSupportedIconFields(candidate)).toThrow(
          expect.objectContaining({code: 'ERR_THEME_INVALID'}),
        );
        expect(() =>
          assertSupportedIconFields({name: 'child'}, [candidate]),
        ).toThrow(expect.objectContaining({code: 'ERR_THEME_INVALID'}));
      }
    },
  );
  it.each([
    '',
    ' active',
    'active ',
    'active\nstate',
    'active\u0000state',
    '__proto__',
    'constructor',
    'prototype',
  ])('rejects unsafe state name %j', state => {
    const byState = Object.fromEntries([[state, {appearance: 'filled'}]]);
    expect(() =>
      assertSupportedIconFields({iconCapabilities: {presentation: {byState}}}),
    ).toThrow(expect.objectContaining({code: 'ERR_THEME_INVALID'}));
  });
  it('rejects getters, symbols and inherited maps without reading them', () => {
    const getter = vi.fn(() => 'filled');
    const request = Object.defineProperty({}, 'appearance', {
      enumerable: true,
      get: getter,
    });
    const inputs = [
      Object.defineProperty({}, 'componentIcons', {get: getter}),
      {componentIcons: Object.create({'fixture-leading': 'close'})},
      {componentIcons: {[Symbol('slot')]: 'close'}},
      {
        iconCapabilities: {
          roleSizeOverrides: Object.defineProperty({}, 'fixture-leading', {
            enumerable: true,
            get: getter,
          }),
        },
      },
      {iconCapabilities: {presentation: {byState: {active: request}}}},
    ];
    for (const input of inputs)
      expect(() => assertSupportedIconFields(input)).toThrow(
        expect.objectContaining({code: 'ERR_THEME_INVALID'}),
      );
    expect(getter).not.toHaveBeenCalled();
  });
  it('admits and retains hidden own-data C fields without omitting their unsupported siblings', () => {
    const componentIcons = Object.defineProperty({}, 'fixture-leading', {
      value: 'close',
    });
    const roleSizeOverrides = Object.defineProperty({}, 'fixture-leading', {
      value: 'sm',
    });
    const byState = Object.defineProperty({}, 'active', {
      value: Object.defineProperty({}, 'appearance', {value: 'filled'}),
    });
    const input = {
      componentIcons,
      iconCapabilities: {roleSizeOverrides, presentation: {byState}},
    };
    const normalized = {
      componentIcons: {'fixture-leading': 'close'},
      iconCapabilities: {
        roleSizeOverrides: {'fixture-leading': 'sm'},
        presentation: {byState: {active: {appearance: 'filled'}}},
      },
    };
    expect(() => assertSupportedIconFields(input)).not.toThrow();
    expect(() =>
      assertRetainedIconInput(normalized, [input], core),
    ).not.toThrow();
    const weight = Object.defineProperty({}, 'weight', {value: undefined});
    expect(() =>
      assertSupportedIconFields({
        iconCapabilities: {presentation: {byState: {active: weight}}},
      }),
    ).toThrow(expect.objectContaining({code: 'ERR_THEME_INVALID'}));
  });
  it('admits null-prototype own maps and ignores an unrelated malformed sibling', () => {
    const componentIcons = Object.assign(Object.create(null), {
      'fixture-leading': 'close',
    });
    const selected = {componentIcons, iconCapabilities: {presentation: null}};
    expect(() => assertSupportedIconFields(selected, [selected])).not.toThrow();
  });
});

describe('per-field role/state retention', () => {
  it.each(['componentIcons', 'roleSizeOverrides', 'byState'])(
    'rejects complete %s erasure even when other capability fields survive',
    field => {
      const input = policy();
      const theme = structuredClone(input);
      if (field === 'componentIcons') delete theme.componentIcons;
      else if (field === 'roleSizeOverrides')
        delete theme.iconCapabilities.roleSizeOverrides;
      else delete theme.iconCapabilities.presentation.byState;
      expect(() => assertRetainedIconInput(theme, [input], core)).toThrow(
        expect.objectContaining({code: 'ERR_CORE_INCOMPATIBLE'}),
      );
    },
  );
  it.each(['componentIcons', 'roleSizeOverrides', 'byState'])(
    'rejects partial %s erasure while retaining its outer map',
    field => {
      const input = policy();
      const theme = structuredClone(input);
      if (field === 'componentIcons')
        delete theme.componentIcons['fixture-trailing'];
      else if (field === 'roleSizeOverrides')
        delete theme.iconCapabilities.roleSizeOverrides['fixture-trailing'];
      else delete theme.iconCapabilities.presentation.byState.active.appearance;
      expect(() => assertRetainedIconInput(theme, [input], core)).toThrow(
        expect.objectContaining({code: 'ERR_CORE_INCOMPATIBLE'}),
      );
    },
  );
  it.each([
    {componentIcons: {}},
    {iconCapabilities: {roleSizeOverrides: {}}},
    {iconCapabilities: {presentation: {byState: {}}}},
  ])('does not mistake empty-map input %j for absent intent', input => {
    expect(() => assertRetainedIconInput({}, [input], core)).toThrow(
      expect.objectContaining({code: 'ERR_CORE_INCOMPATIBLE'}),
    );
  });
  it('honors per-key null clearing, undefined fallback and atomic presentation replacement', () => {
    const parent = policy();
    const child = {
      componentIcons: {'fixture-leading': null, 'fixture-trailing': undefined},
      iconCapabilities: {
        roleSizeOverrides: {'fixture-leading': null},
        presentation: {byState: {busy: {appearance: 'outline'}}},
      },
    };
    const theme = {
      componentIcons: {'fixture-leading': null, 'fixture-trailing': null},
      iconCapabilities: {
        roleSizeOverrides: {'fixture-leading': null, 'fixture-trailing': null},
        presentation: child.iconCapabilities.presentation,
      },
    };
    expect(() =>
      assertRetainedIconInput(theme, [child, parent], core),
    ).not.toThrow();
    const cleared = {
      ...theme,
      iconCapabilities: {...theme.iconCapabilities, presentation: null},
    };
    expect(() =>
      assertRetainedIconInput(
        cleared,
        [{iconCapabilities: {presentation: null}}, child, parent],
        core,
      ),
    ).not.toThrow();
  });
  it('omits optional undefined state entries without inheriting a replaced presentation', () => {
    const parent = {
      iconCapabilities: {
        presentation: {byState: {active: {appearance: 'filled'}}},
      },
    };
    const child = {
      iconCapabilities: {presentation: {byState: {active: undefined}}},
    };
    const normalized = {iconCapabilities: {presentation: {byState: {}}}};
    expect(() => assertSupportedIconFields(child)).not.toThrow();
    expect(() =>
      assertRetainedIconInput(normalized, [child, parent], core),
    ).not.toThrow();
    expect(() =>
      assertRetainedIconInput(
        {iconCapabilities: {presentation: {}}},
        [child],
        core,
      ),
    ).toThrow(expect.objectContaining({code: 'ERR_CORE_INCOMPATIBLE'}));
  });
  it('captures a post-call component map spread as the selected winner rather than restoring old input', () => {
    const interception = interceptCore({defineTheme: value => ({...value})});
    const raw = policy();
    const base =
      interception.modules['@astryxdesign/core/theme'].defineTheme(raw);
    const spread = {
      ...base,
      componentIcons: {...base.componentIcons, 'fixture-leading': null},
    };
    const captured = interception.inputOf(spread);
    expect(captured.componentIcons).toEqual({
      'fixture-leading': null,
      'fixture-trailing': null,
    });
    expect(raw.componentIcons['fixture-leading']).toBe('close');
    expect(() =>
      assertRetainedIconInput(spread, [captured, raw], core),
    ).not.toThrow();
  });
});

describe('lossless role/state artifact fields', () => {
  it('emits map fallback/null markers and appearance-only state data without public plumbing', () => {
    const theme = policy();
    theme.componentIcons['fixture-fallback'] = undefined;
    const emitted = lowerBuiltIconContracts(theme, 'fixture', new Set());
    const result = runInNewContext(`({${emitted.fields}})`);
    expect(result).toEqual(theme);
    expect(Object.hasOwn(result.componentIcons, 'fixture-fallback')).toBe(true);
    expect(emitted.imports).toBe('');
    expect(emitted.declarations).toBe('');
    expect(emitted.fields).not.toMatch(
      /resolveIcon|inspectIcon|declareComponentIconRole|normalizeIconThemeCapabilities/,
    );
  });
  it('emits componentIcons-only and empty maps without requiring a contract constructor', () => {
    for (const componentIcons of [{}, {'fixture-leading': null}]) {
      const emitted = lowerBuiltIconContracts(
        {componentIcons},
        'fixture',
        new Set(),
      );
      expect(runInNewContext(`({${emitted.fields}})`)).toEqual({
        componentIcons,
      });
      expect(emitted.imports).toBe('');
    }
  });
});
