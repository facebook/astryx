// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file iconRoleStatePolicy.test.tsx
 * @input Synthetic downstream slots, local contracts and untyped theme surfaces
 * @output Role/state admission, inheritance, import-order and accessor-safety evidence
 * @position Colocated theme policy tests; no Core component enrollment or public resolver seam
 */
import React from 'react';
import {afterEach, describe, expect, expectTypeOf, it, vi} from 'vitest';
import {cleanup, render} from '@testing-library/react';
import type {
  ComponentIconMap,
  ComponentIconStateName,
  IconThemeCapabilitiesInput,
  ParticipatingComponentIconSlotName,
} from '../Icon/index';
import {
  defineIconCapabilities,
  getIconThemeContracts,
  mergeIconThemeCapabilities,
  normalizeIconThemeCapabilities,
  readIconThemeCapabilities,
} from '../Icon/iconCapabilities';
import {defineAdaptiveIcon} from '../Icon/adaptiveIcons';
import {Theme} from './Theme';
import {ThemeContext} from './useTheme';
import {defineTheme, type DefinedTheme} from './defineTheme';
import {getRegisteredTheme, resetThemes} from './themeRegistry';

declare module '../Icon/index' {
  interface IconCapabilityMap {
    'policy-test-capabilities': typeof contract;
  }
  interface ComponentIconSlotMap {
    'policy-probe-start': {slot: true; states: 'quiet' | 'active'};
    'policy-probe-end': {slot: true; states: 'quiet' | 'active'};
    'policy-late-role': {slot: true; states: 'waiting' | 'complete'};
    'policy-legacy-source': {slot: true};
  }
}

const contract = defineIconCapabilities({
  sizes: {hero: {default: '2.5rem'}},
  appearances: ['outline', 'fill'],
  weights: {values: ['regular', 'bold']},
});
const ownPolicy = {
  contract,
  roleSizeOverrides: {'policy-probe-start': 'hero', 'policy-probe-end': 'sm'},
  presentation: {
    default: {appearance: 'outline', weight: 'regular'},
    bySize: {hero: {weight: 'bold'}},
    byState: {active: {appearance: 'fill'}},
  },
} as const satisfies IconThemeCapabilitiesInput<typeof contract>;

function readRuntime(input: unknown, notifyInvalid = vi.fn()) {
  return readIconThemeCapabilities(input, [contract], notifyInvalid);
}
function asBuilt(theme: DefinedTheme): DefinedTheme {
  return {...theme, __built: true};
}
let effective: DefinedTheme | undefined;
function ReadTheme() {
  effective = React.use(ThemeContext)?.theme;
  return null;
}

afterEach(() => {
  cleanup();
  effective = undefined;
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  resetThemes();
});

describe('finite role and state policy authoring', () => {
  it('keeps states finite per owner and true slots source-only', () => {
    expectTypeOf<ComponentIconStateName<'policy-probe-start'>>().toEqualTypeOf<
      'quiet' | 'active'
    >();
    expectTypeOf<
      ComponentIconStateName<'policy-legacy-source'>
    >().toEqualTypeOf<never>();
    expectTypeOf<
      Extract<ParticipatingComponentIconSlotName, 'policy-legacy-source'>
    >().toEqualTypeOf<never>();
    const legacy = {'policy-legacy-source': null} satisfies ComponentIconMap;
    expect(legacy['policy-legacy-source']).toBeNull();
    const noStateWeight: IconThemeCapabilitiesInput<typeof contract> = {
      presentation: {
        byState: {
          active: {
            appearance: 'fill',
            // @ts-expect-error State policy never selects weight.
            weight: 'bold',
          },
        },
      },
      roleSizeOverrides: {
        // @ts-expect-error A source-only slot is not a metadata role.
        'policy-legacy-source': 'sm',
      },
    };
    expect(noStateWeight).toBeDefined();
    const noUniversalStates: IconThemeCapabilitiesInput<typeof contract> = {
      presentation: {
        byState: {
          // @ts-expect-error No universal state vocabulary is admitted by the public map.
          invented: {appearance: 'fill'},
        },
      },
    };
    expect(noUniversalStates).toBeDefined();
  });

  it('snapshots role sizes and appearance-only state presentation immutably', () => {
    const input = {
      contract,
      roleSizeOverrides: {'policy-probe-start': 'hero'},
      presentation: {byState: {active: {appearance: 'fill'}}},
    };
    const policy = normalizeIconThemeCapabilities(input);
    input.roleSizeOverrides['policy-probe-start'] = 'sm';
    input.presentation.byState.active.appearance = 'outline';
    expect(policy?.roleSizeOverrides).toEqual({'policy-probe-start': 'hero'});
    expect(policy?.presentation).toEqual({
      byState: {active: {appearance: 'fill'}},
    });
    expect(Object.isFrozen(policy?.roleSizeOverrides)).toBe(true);
    expect(Object.isFrozen(policy?.presentation?.byState?.active)).toBe(true);
    expect(normalizeIconThemeCapabilities(policy)).toBe(policy);
  });

  it('preserves nonenumerable C own data and validates hidden malformed entries', () => {
    const roleSizes = Object.defineProperty({}, 'policy-probe-start', {
      value: 'hero',
    });
    const state = Object.defineProperty({}, 'appearance', {value: 'fill'});
    const byState = Object.defineProperty({}, 'active', {value: state});
    const presentation = Object.defineProperty({}, 'byState', {value: byState});
    const input = Object.defineProperties(
      {contract},
      {
        roleSizeOverrides: {value: roleSizes},
        presentation: {value: presentation},
      },
    );
    const policy = normalizeIconThemeCapabilities(input);
    expect(policy?.roleSizeOverrides).toEqual({'policy-probe-start': 'hero'});
    expect(policy?.presentation?.byState).toEqual({
      active: {appearance: 'fill'},
    });
    expect(readRuntime(input)?.roleSizeOverrides).toEqual(
      policy?.roleSizeOverrides,
    );
    expect(readRuntime(input)?.presentation?.byState).toEqual(
      policy?.presentation?.byState,
    );
    expect(() =>
      normalizeIconThemeCapabilities({
        roleSizeOverrides: Object.defineProperty({}, 'bad role', {value: 'sm'}),
      }),
    ).toThrow(/invalid role override name/);
    expect(() =>
      normalizeIconThemeCapabilities({
        contract,
        presentation: {
          byState: Object.defineProperty({}, 'active', {
            value: {weight: 'bold'},
          }),
        },
      }),
    ).toThrow(/unknown field/);
  });

  it.each([false, true])(
    'omits own undefined state entries in strict/runtime policy (nonenumerable: %s)',
    nonenumerable => {
      const byState = Object.defineProperty(
        {quiet: {appearance: 'outline'}},
        'active',
        {value: undefined, enumerable: !nonenumerable},
      );
      const input = {contract, presentation: {byState}};
      const policy = normalizeIconThemeCapabilities(input);
      expect(policy?.presentation?.byState).toEqual({
        quiet: {appearance: 'outline'},
      });
      expect(policy?.presentation?.byState).not.toHaveProperty('active');
      const invalid = vi.fn();
      const runtime = readRuntime(input, invalid);
      expect(runtime?.presentation?.byState).toEqual(
        policy?.presentation?.byState,
      );
      expect(readRuntime(runtime, invalid)).toBe(runtime);
      expect(invalid).not.toHaveBeenCalled();
    },
  );

  it('accepts typed undefined state entries through source defineTheme and atomic extension', () => {
    const base = defineTheme({
      name: 'undefined-state-base',
      iconCapabilities: ownPolicy,
    });
    const input = {
      presentation: {
        byState: {active: undefined, quiet: {appearance: 'outline'}},
      },
    } as const satisfies IconThemeCapabilitiesInput<typeof contract>;
    const source = defineTheme({
      name: 'undefined-state-source',
      iconCapabilities: {contract, ...input},
    });
    const child = defineTheme({
      name: 'undefined-state-child',
      extends: base,
      iconCapabilities: input,
    });
    expect(source.iconCapabilities?.presentation?.byState).toEqual({
      quiet: {appearance: 'outline'},
    });
    expect(child.iconCapabilities?.presentation).toEqual(
      source.iconCapabilities?.presentation,
    );
    expect(child.iconCapabilities?.presentation).not.toHaveProperty('default');
    expect(child.iconCapabilities?.presentation?.byState).not.toHaveProperty(
      'active',
    );
    const empty = defineTheme({
      name: 'undefined-state-empty',
      extends: base,
      iconCapabilities: {presentation: {byState: {active: undefined}}},
    });
    expect(empty.iconCapabilities?.presentation).toEqual({byState: {}});
  });

  it('keeps null/accessor/weight state entries malformed while undefined is omission', () => {
    const getter = vi.fn(() => undefined);
    const byState = Object.defineProperty(
      {
        complete: undefined,
        active: null,
        quiet: {appearance: 'outline', weight: undefined},
      },
      'waiting',
      {get: getter, enumerable: true},
    );
    const invalid = vi.fn();
    const runtime = readRuntime({presentation: {byState}}, invalid);
    expect(runtime?.presentation?.byState).not.toHaveProperty('complete');
    expect(runtime?.presentation?.byState).not.toHaveProperty('waiting');
    expect(runtime?.presentation?.byState?.quiet).toEqual({
      appearance: 'outline',
    });
    expect(invalid).toHaveBeenCalled();
    expect(getter).not.toHaveBeenCalled();
    for (const entry of [null, {weight: undefined}]) {
      expect(() =>
        normalizeIconThemeCapabilities({
          contract,
          presentation: {byState: {active: entry}},
        }),
      ).toThrow();
    }
    expect(() =>
      normalizeIconThemeCapabilities({presentation: {byState}}),
    ).toThrow(/plain data/);
  });

  it('leaves A bySize undefined-entry validation unchanged', () => {
    const input = {contract, presentation: {bySize: {sm: undefined}}};
    expect(() => normalizeIconThemeCapabilities(input)).toThrow(/plain object/);
    const invalid = vi.fn();
    readRuntime(input, invalid);
    expect(invalid).toHaveBeenCalled();
  });

  it('does not create C fields when reading or merging A-only policy', () => {
    const safe = readRuntime({presentation: {default: {weight: 'regular'}}});
    const merged = mergeIconThemeCapabilities(safe, readRuntime({}));
    expect(merged).not.toHaveProperty('roleSizeOverrides');
    expect(merged?.presentation).not.toHaveProperty('byState');
  });

  it('admits a theme before or after the downstream owner declares its role', async () => {
    vi.resetModules();
    const {defineTheme: freshDefineTheme} = await import('./defineTheme');
    const input = {
      name: 'late-role-before',
      componentIcons: {'policy-late-role': 'close'},
      iconCapabilities: {
        contract,
        roleSizeOverrides: {'policy-late-role': 'hero'},
        presentation: {byState: {complete: {appearance: 'fill'}}},
      },
    } as const;
    const before = freshDefineTheme(input);
    const {declareComponentIconRole, getComponentIconRole} =
      await import('../Icon/componentIconRoles');
    expect(getComponentIconRole('policy-late-role')).toBeUndefined();
    declareComponentIconRole({
      slot: 'policy-late-role',
      defaultSize: 'md',
      statePrecedence: ['complete', 'waiting'],
    });
    const after = freshDefineTheme({...input, name: 'late-role-after'});
    expect(after.componentIcons).toEqual(before.componentIcons);
    expect(after.iconCapabilities).toEqual(before.iconCapabilities);
  });

  it('requires sizes and appearances to be locally admitted even after another contract loads', () => {
    defineIconCapabilities({
      sizes: {unrelated: {default: '3rem'}},
      appearances: ['unrelated'],
    });
    expect(() =>
      normalizeIconThemeCapabilities({
        roleSizeOverrides: {'policy-probe-start': 'unrelated'},
      }),
    ).toThrow(/unadmitted role size/);
    expect(() =>
      normalizeIconThemeCapabilities({
        presentation: {byState: {active: {appearance: 'unrelated'}}},
      }),
    ).toThrow(/unadmitted theme appearance/);
  });

  it.each([
    '',
    ' active',
    'active ',
    'constructor',
    'prototype',
    '__proto__',
    'a\nb',
    'a\u007fb',
  ])(
    'rejects unsafe state name %j without invoking presentation data',
    state => {
      expect(() =>
        normalizeIconThemeCapabilities({
          contract,
          presentation: {byState: {[state]: {appearance: 'fill'}}},
        }),
      ).toThrow(/invalid theme state name/);
    },
  );

  it.each([
    'probe',
    'Probe-start',
    'probe--start',
    'probe_start',
    'probe-start-',
  ])('rejects non-kebab role key %j', slot => {
    expect(() =>
      normalizeIconThemeCapabilities({
        roleSizeOverrides: {[slot]: 'sm'},
      }),
    ).toThrow(/invalid role override name/);
  });

  it('rejects state weight, including undefined, without changing default/bySize weight admission', () => {
    for (const weight of ['bold', undefined]) {
      expect(() =>
        normalizeIconThemeCapabilities({
          contract,
          presentation: {byState: {active: {appearance: 'fill', weight}}},
        }),
      ).toThrow(/unknown field/);
    }
    expect(normalizeIconThemeCapabilities(ownPolicy)?.presentation).toEqual(
      ownPolicy.presentation,
    );
  });

  it('rejects top-level and nested authoring accessors without executing them', () => {
    const getter = vi.fn(() => {
      throw new Error('accessor executed');
    });
    const fixtures = [
      Object.defineProperty({}, 'roleSizeOverrides', {get: getter}),
      {
        roleSizeOverrides: Object.defineProperty({}, 'policy-probe-start', {
          get: getter,
        }),
      },
      {presentation: Object.defineProperty({}, 'byState', {get: getter})},
      {
        presentation: {
          byState: Object.defineProperty({}, 'active', {get: getter}),
        },
      },
      {
        presentation: {
          byState: {
            active: Object.defineProperty({}, 'appearance', {get: getter}),
          },
        },
      },
    ];
    for (const fixture of fixtures) {
      expect(() => normalizeIconThemeCapabilities(fixture)).toThrow(
        /plain data/,
      );
    }
    expect(getter).not.toHaveBeenCalled();
  });
});

describe('role/state extension and contract lineage', () => {
  it('merges role sizes per key with null clearing and retained sibling policy', () => {
    const base = defineTheme({name: 'role-base', iconCapabilities: ownPolicy});
    const child = defineTheme({
      name: 'role-child',
      extends: base,
      iconCapabilities: {roleSizeOverrides: {'policy-probe-start': null}},
    });
    expect(child.iconCapabilities?.roleSizeOverrides).toEqual({
      'policy-probe-start': null,
      'policy-probe-end': 'sm',
    });
    expect(child.iconCapabilities?.presentation).toEqual(
      base.iconCapabilities?.presentation,
    );
    expect(getIconThemeContracts(child.iconCapabilities)).toContain(contract);
    expect(child.__iconContracts).toContain(contract);
  });

  it('treats undefined role/map entries as omission while null remains a clearing marker', () => {
    const base = defineTheme({
      name: 'undefined-base',
      componentIcons: {'policy-probe-start': 'close'},
      iconCapabilities: ownPolicy,
    });
    const child = defineTheme({
      name: 'undefined-child',
      extends: base,
      componentIcons: {'policy-probe-start': undefined},
      iconCapabilities: {roleSizeOverrides: {'policy-probe-start': undefined}},
    });
    expect(child.componentIcons).toEqual(base.componentIcons);
    expect(child.iconCapabilities?.roleSizeOverrides).toEqual(
      base.iconCapabilities?.roleSizeOverrides,
    );
    const invalid = vi.fn();
    const own = readRuntime(
      {roleSizeOverrides: {'policy-probe-start': undefined}},
      invalid,
    );
    expect(invalid).not.toHaveBeenCalled();
    expect(
      mergeIconThemeCapabilities(base.iconCapabilities, own)?.roleSizeOverrides,
    ).toEqual(base.iconCapabilities?.roleSizeOverrides);
  });

  it.each([
    {default: {weight: 'bold'}},
    {byState: {quiet: {appearance: 'outline'}}},
    {},
    null,
  ] as const)(
    'replaces the entire inherited presentation with %j',
    presentation => {
      const base = defineTheme({
        name: 'atomic-base',
        iconCapabilities: ownPolicy,
      });
      const child = defineTheme({
        name: 'atomic-child',
        extends: base,
        iconCapabilities: {presentation},
      });
      expect(child.iconCapabilities?.presentation).toEqual(presentation);
      expect(child.iconCapabilities?.roleSizeOverrides).toEqual(
        ownPolicy.roleSizeOverrides,
      );
    },
  );

  it('keeps policy-only custom sizes admitted after overriding the contributing source', () => {
    const source = defineAdaptiveIcon(contract, {default: <svg />});
    const base = defineTheme({
      name: 'source-policy-base',
      icons: {close: source},
    });
    const child = defineTheme({
      name: 'source-policy-child',
      extends: base,
      icons: {close: <svg data-art="fixed" />},
      iconCapabilities: {
        roleSizeOverrides: {'policy-probe-start': 'hero'},
        presentation: {byState: {active: {appearance: 'fill'}}},
      },
    });
    expect(child.__iconSources).toBeUndefined();
    expect(child.__iconContracts).toContain(contract);
    expect(getIconThemeContracts(child.iconCapabilities)).toContain(contract);
    expect(
      child.iconCapabilities?.roleSizeOverrides?.['policy-probe-start'],
    ).toBe('hero');
  });

  it('merges component maps across extends, retaining null suppression and omitted siblings', () => {
    const base = defineTheme({
      name: 'map-base',
      componentIcons: {
        'policy-probe-start': 'close',
        'policy-probe-end': 'search',
      },
    });
    const child = defineTheme({
      name: 'map-child',
      extends: base,
      componentIcons: {'policy-probe-start': null},
    });
    expect(child.componentIcons).toEqual({
      'policy-probe-start': null,
      'policy-probe-end': 'search',
    });
    expect(Object.isFrozen(child.componentIcons)).toBe(true);
    expect(
      defineTheme({name: 'map-grandchild', extends: child}).componentIcons,
    ).toBe(child.componentIcons);
  });

  it('rejects concrete/namespaced map values and authoring map accessors', () => {
    for (const componentIcons of [
      {'policy-probe-start': <svg />},
      {'policy-probe-start': 'library:close'},
      {'bad role': 'close'},
    ]) {
      expect(() =>
        defineTheme({name: 'bad-map', componentIcons: componentIcons as never}),
      ).toThrow();
    }
    const getter = vi.fn(() => {
      throw new Error('map accessor executed');
    });
    const input = Object.defineProperty(
      {name: 'bad-map-getter'},
      'componentIcons',
      {get: getter},
    );
    const base = Object.defineProperty(
      {name: 'bad-base-getter', tokens: {}},
      'componentIcons',
      {get: getter},
    );
    expect(() => defineTheme(input)).toThrow(/plain data/);
    expect(() => defineTheme({name: 'extends-bad-map', extends: base})).toThrow(
      /plain data/,
    );
    expect(getter).not.toHaveBeenCalled();
  });
});

describe('tolerant role/state runtime policy', () => {
  it('preserves valid role/state siblings and nulls without executing getters or state weight', () => {
    const getter = vi.fn(() => {
      throw new Error('runtime accessor executed');
    });
    const sizes = Object.defineProperty(
      {
        'policy-probe-start': 'hero',
        'policy-probe-end': null,
        'bad role': 'sm',
        'policy-unknown-size': 'unknown',
      },
      'policy-getter-size',
      {get: getter},
    );
    const states = Object.defineProperty(
      {
        active: Object.defineProperty({appearance: 'fill'}, 'weight', {
          get: getter,
        }),
        quiet: {appearance: 'outline', weight: 'bold'},
        constructor: {appearance: 'fill'},
        'bad\nstate': {appearance: 'fill'},
      },
      'broken',
      {get: getter},
    );
    const invalid = vi.fn();
    const safe = readRuntime(
      {
        roleSizeOverrides: sizes,
        presentation: {
          default: {weight: 'regular'},
          bySize: {hero: {weight: 'bold'}},
          byState: states,
        },
      },
      invalid,
    );
    expect(safe?.roleSizeOverrides).toEqual({
      'policy-probe-start': 'hero',
      'policy-probe-end': null,
    });
    expect(safe?.presentation?.byState).toMatchObject({
      active: {appearance: 'fill'},
      quiet: {appearance: 'outline'},
    });
    expect(safe?.presentation?.byState?.active).not.toHaveProperty('weight');
    expect(safe?.presentation?.byState?.quiet).not.toHaveProperty('weight');
    expect(safe?.presentation?.default?.weight).toBe('regular');
    expect(safe?.presentation?.bySize?.hero.weight).toBe('bold');
    expect(safe?.presentation?.byState).not.toHaveProperty('constructor');
    expect(invalid).toHaveBeenCalled();
    expect(getter).not.toHaveBeenCalled();
    invalid.mockClear();
    expect(readRuntime(safe, invalid)).toBe(safe);
    expect(invalid).toHaveBeenCalled();
  });

  it('never coerces opaque role sizes to property keys', () => {
    const coerce = vi.fn(() => {
      throw new Error('size coercion executed');
    });
    const size = {[Symbol.toPrimitive]: coerce};
    const fixture = {roleSizeOverrides: {'policy-probe-start': size}};
    expect(() => normalizeIconThemeCapabilities(fixture)).toThrow(
      /unadmitted role size/,
    );
    expect(readRuntime(fixture)?.roleSizeOverrides).toEqual({});
    expect(coerce).not.toHaveBeenCalled();
  });

  it('preserves malformed evidence and cache identity through repeated safe merges', () => {
    const invalid = vi.fn();
    const base = normalizeIconThemeCapabilities(ownPolicy);
    const own = readRuntime(
      {
        roleSizeOverrides: {'policy-probe-start': null},
        presentation: {byState: {active: {appearance: 'fill', weight: 'bold'}}},
      },
      invalid,
    );
    const merged = mergeIconThemeCapabilities(base, own);
    expect(mergeIconThemeCapabilities(base, own)).toBe(merged);
    expect(merged?.roleSizeOverrides?.['policy-probe-start']).toBeNull();
    expect(merged?.presentation).toEqual(own?.presentation);
    invalid.mockClear();
    expect(readRuntime(merged, invalid)).toBe(merged);
    expect(invalid).toHaveBeenCalled();
  });
});

describe('descriptor-safe Theme map and policy inheritance', () => {
  it('inherits maps and role sizes without borrowing region artwork or registration', () => {
    const outer = asBuilt(
      defineTheme({
        name: 'outer-role-region',
        componentIcons: {
          'policy-probe-start': 'close',
          'policy-probe-end': 'search',
        },
        icons: {close: <svg data-art="outer" />},
        iconCapabilities: ownPolicy,
      }),
    );
    const inner = asBuilt(
      defineTheme({
        name: 'inner-role-region',
        componentIcons: {'policy-probe-start': null},
        icons: {search: <svg data-art="inner" />},
        iconCapabilities: {
          roleSizeOverrides: {'policy-probe-start': null},
          presentation: null,
        },
      }),
    );
    render(
      <Theme theme={outer}>
        <Theme theme={inner}>
          <ReadTheme />
        </Theme>
      </Theme>,
    );
    expect(effective?.componentIcons).toEqual({
      'policy-probe-start': null,
      'policy-probe-end': 'search',
    });
    expect(effective?.iconCapabilities?.roleSizeOverrides).toEqual({
      'policy-probe-start': null,
      'policy-probe-end': 'sm',
    });
    expect(effective?.iconCapabilities?.presentation).toBeNull();
    expect(effective?.icons).toBe(inner.icons);
    expect(getRegisteredTheme(inner.name)).toBe(inner);
    expect(inner.componentIcons).toEqual({'policy-probe-start': null});
    expect(inner.iconCapabilities?.roleSizeOverrides).not.toHaveProperty(
      'policy-probe-end',
    );
  });

  it('updates inherited policy and maps when a nested region switches themes', () => {
    const outer = asBuilt(
      defineTheme({
        name: 'switch-outer',
        iconCapabilities: ownPolicy,
        componentIcons: {'policy-probe-end': 'search'},
      }),
    );
    const first = asBuilt(
      defineTheme({
        name: 'switch-first',
        componentIcons: {'policy-probe-start': null},
        iconCapabilities: {roleSizeOverrides: {'policy-probe-start': null}},
      }),
    );
    const second = asBuilt(
      defineTheme({
        name: 'switch-second',
        componentIcons: {'policy-probe-start': 'close'},
      }),
    );
    const {rerender} = render(
      <Theme theme={outer}>
        <Theme theme={first}>
          <ReadTheme />
        </Theme>
      </Theme>,
    );
    expect(
      effective?.iconCapabilities?.roleSizeOverrides?.['policy-probe-start'],
    ).toBeNull();
    rerender(
      <Theme theme={outer}>
        <Theme theme={second}>
          <ReadTheme />
        </Theme>
      </Theme>,
    );
    expect(
      effective?.iconCapabilities?.roleSizeOverrides?.['policy-probe-start'],
    ).toBe('hero');
    expect(effective?.componentIcons).toEqual({
      'policy-probe-start': 'close',
      'policy-probe-end': 'search',
    });
  });

  it('removes top-level map accessors from context and retains inherited valid maps', () => {
    const getter = vi.fn(() => {
      throw new Error('top-level map getter executed');
    });
    const outer = asBuilt(
      defineTheme({
        name: 'getter-map-outer',
        componentIcons: {'policy-probe-start': 'close'},
        iconCapabilities: ownPolicy,
      }),
    );
    const own = Object.defineProperty(
      {name: 'getter-map-inner', tokens: {}, __built: true as const},
      'componentIcons',
      {get: getter},
    );
    vi.stubEnv('NODE_ENV', 'production');
    render(
      <Theme theme={outer}>
        <Theme theme={own}>
          <ReadTheme />
        </Theme>
      </Theme>,
    );
    expect(effective?.componentIcons).toEqual(outer.componentIcons);
    expect(
      Object.getOwnPropertyDescriptor(effective, 'componentIcons'),
    ).toHaveProperty('value');
    const invalid = vi.fn();
    readRuntime(effective?.iconCapabilities, invalid);
    expect(invalid).toHaveBeenCalled();
    expect(getter).not.toHaveBeenCalled();
    expect(getRegisteredTheme(own.name)).toBe(own);
  });

  it('retains valid malformed map siblings and policy accessors as boundary evidence across nesting', () => {
    const getter = vi.fn(() => {
      throw new Error('nested getter executed');
    });
    const maps = Object.defineProperty(
      {
        'policy-probe-start': null,
        'policy-probe-end': 'search',
        'bad role': 'close',
      },
      'policy-accessor',
      {get: getter},
    );
    const roleSizes = Object.defineProperty(
      {'policy-probe-start': 'hero'},
      'policy-probe-end',
      {get: getter},
    );
    const state = Object.defineProperty({appearance: 'fill'}, 'weight', {
      get: getter,
    });
    const own = {
      name: 'malformed-siblings-region',
      tokens: {},
      __built: true as const,
      componentIcons: maps as ComponentIconMap,
      iconCapabilities: {
        contract,
        roleSizeOverrides: roleSizes,
        presentation: {byState: {active: state}},
      },
    };
    const leaf = {
      name: 'malformed-leaf-region',
      tokens: {},
      __built: true as const,
    };
    const opaque = Object.defineProperty(own, 'unused', {get: getter});
    const {rerender} = render(
      <Theme theme={opaque}>
        <ReadTheme />
      </Theme>,
    );
    const assertSafe = () => {
      expect(effective?.componentIcons).toEqual({
        'policy-probe-start': null,
        'policy-probe-end': 'search',
      });
      expect(effective?.iconCapabilities?.roleSizeOverrides).toEqual({
        'policy-probe-start': 'hero',
      });
      expect(
        effective?.iconCapabilities?.presentation?.byState?.active,
      ).toEqual({appearance: 'fill'});
      const invalid = vi.fn();
      readRuntime(effective?.iconCapabilities, invalid);
      expect(invalid).toHaveBeenCalled();
    };
    assertSafe();
    expect(Object.getOwnPropertyDescriptor(effective, 'unused')?.get).toBe(
      getter,
    );
    rerender(
      <Theme theme={opaque}>
        <Theme theme={leaf}>
          <ReadTheme />
        </Theme>
      </Theme>,
    );
    assertSafe();
    expect(getter).not.toHaveBeenCalled();
  });
});
