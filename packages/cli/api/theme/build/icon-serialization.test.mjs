// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Pure Icon packaging guards, without Core builds or registration.
 * @input Plain A/C policy data, own descriptors and minimal constructor namespaces.
 * @output Lossless encoding, selected-field rejection and exact cached witness checks.
 * @position Private CLI unit tests; native theme artifact coverage is separate.
 */
import {describe, expect, it, vi} from 'vitest';
import {runInNewContext} from 'node:vm';
import {
  assertIconCapability,
  assertRetainedIconInput,
  assertSupportedIconFields,
  hasIconCapabilityIntent,
  serializeIconData,
  supportsIconCapabilities,
} from './icon-serialization.mjs';

function protocol() {
  return {
    defineIconCapabilities: vi.fn(() => Object.freeze({})),
    defineAdaptiveIcon: vi.fn((capabilities, tree) =>
      Object.freeze({capabilities, tree}),
    ),
  };
}

describe('lossless Icon data', () => {
  it('preserves undefined, null, fractional weights, negative zero and own __proto__', () => {
    const input = Object.fromEntries([
      ['default', {weight: 525.5, appearance: undefined}],
      ['clear', null],
      ['zero', -0],
      ['__proto__', {safe: true}],
    ]);
    const source = serializeIconData(input, 'policy');
    const result = runInNewContext(`(${source})`);
    expect(result.default).toEqual({weight: 525.5, appearance: undefined});
    expect(Object.hasOwn(result.default, 'appearance')).toBe(true);
    expect(result.clear).toBe(null);
    expect(Object.is(result.zero, -0)).toBe(true);
    expect(Object.hasOwn(result, '__proto__')).toBe(true);
    expect(result.__proto__).toEqual({safe: true});
  });
  it('allows null-prototype data and repeated noncyclic pointers', () => {
    const shared = Object.assign(Object.create(null), {weight: 400});
    expect(serializeIconData([shared, shared], 'contracts')).toBe(
      '[{"weight": 400}, {"weight": 400}]',
    );
  });
  it.each([
    ['function', () => {}],
    ['symbol', Symbol('opaque')],
    ['bigint', 1n],
    ['NaN', NaN],
    ['infinity', Infinity],
    ['date', new Date(0)],
    ['map', new Map()],
    ['sparse array', new Array(2)],
    ['custom array field', Object.assign([], {extra: 1})],
    ['custom array prototype', Object.setPrototypeOf([], {})],
    ['hidden field', Object.defineProperty({}, 'hidden', {value: 1})],
    ['symbol field', {[Symbol('key')]: 1}],
  ])('rejects %s instead of coercing it', (_name, value) => {
    expect(() => serializeIconData(value, 'policy')).toThrow(
      expect.objectContaining({code: 'ERR_THEME_INVALID'}),
    );
  });
  it('rejects cycles and accessors without invoking their getter', () => {
    const cycle = {};
    cycle.self = cycle;
    const getter = vi.fn(() => 400);
    const accessor = Object.defineProperty({}, 'weight', {
      enumerable: true,
      get: getter,
    });
    for (const value of [cycle, accessor])
      expect(() => serializeIconData(value, 'policy')).toThrow(
        expect.objectContaining({code: 'ERR_THEME_INVALID'}),
      );
    expect(getter).not.toHaveBeenCalled();
  });
});

describe('actual authored metadata retention', () => {
  const core = {defineIconCapabilities: value => value};
  it.each(['sizeOverrides', 'default', 'bySize'])(
    'rejects partial %s erasure even with retained contract metadata',
    field => {
      const contract = {};
      const raw = {
        iconCapabilities: {
          contract,
          sizeOverrides: {md: '23px'},
          presentation: {
            default: {weight: 525.5},
            bySize: {md: {appearance: 'filled'}},
          },
        },
      };
      const policy = {
        ...raw.iconCapabilities,
        presentation: {...raw.iconCapabilities.presentation},
      };
      if (field === 'sizeOverrides') delete policy.sizeOverrides;
      else delete policy.presentation[field];
      expect(() =>
        assertRetainedIconInput({iconCapabilities: policy}, [raw], core),
      ).toThrow(expect.objectContaining({code: 'ERR_CORE_INCOMPATIBLE'}));
    },
  );
  it('honors selected atomic presentation/null and per-size winners without coalescing contracts', () => {
    const parent = {},
      child = {};
    const inputs = [
      {
        iconCapabilities: {
          contract: child,
          presentation: null,
          sizeOverrides: {md: null},
        },
      },
      {
        iconCapabilities: {
          contract: parent,
          presentation: {default: {weight: 400}},
          sizeOverrides: {md: '23px', sm: '17px'},
        },
      },
    ];
    expect(() =>
      assertRetainedIconInput(
        {
          iconCapabilities: {
            contract: child,
            presentation: null,
            sizeOverrides: {md: null, sm: '17px'},
          },
        },
        inputs,
        core,
      ),
    ).not.toThrow();
  });
  it('rejects a lost sparse branch or renderer reference without evaluating supplied functions', () => {
    const contract = {},
      render = vi.fn();
    const tree = {
      default: {render, weightRange: {min: 200, max: 800}},
      bySize: {md: {default: 'md'}},
    };
    const input = {icons: {close: {capabilities: contract, tree}}};
    const theme = {
      __iconSources: {
        close: {capabilities: contract, tree: {default: tree.default}},
      },
    };
    expect(() => assertRetainedIconInput(theme, [input], core)).toThrow(
      expect.objectContaining({code: 'ERR_CORE_INCOMPATIBLE'}),
    );
    expect(render).not.toHaveBeenCalled();
    expect(() =>
      assertRetainedIconInput({__iconSources: input.icons}, [input], core),
    ).not.toThrow();
  });
});

describe('two-constructor empty own-data witness', () => {
  it('requires no normalizer, composition, version or Theme registration probe', () => {
    const core = protocol();
    const forbidden = vi.fn(() => {
      throw new Error('must not probe');
    });
    for (const name of [
      'normalizeIconThemeCapabilities',
      'getApplicationIconCapabilities',
      'defineTheme',
      'version',
    ])
      Object.defineProperty(core, name, {get: forbidden});
    expect(supportsIconCapabilities(core)).toBe(true);
    expect(supportsIconCapabilities(core)).toBe(true);
    expect(core.defineIconCapabilities).toHaveBeenCalledOnce();
    expect(core.defineIconCapabilities).toHaveBeenCalledWith({});
    expect(core.defineAdaptiveIcon).toHaveBeenCalledWith(
      core.defineIconCapabilities.mock.results[0].value,
      {default: 'compatibility-default'},
    );
    expect(forbidden).not.toHaveBeenCalled();
  });
  it.each(['bare', 'inherited', 'accessor', 'wrong-contract', 'wrong-default'])(
    'rejects the %s source protocol',
    mode => {
      const core = protocol();
      const getter = vi.fn(() => 'compatibility-default');
      core.defineAdaptiveIcon = (capabilities, tree) => {
        if (mode === 'bare') return tree;
        if (mode === 'inherited') return Object.create({capabilities, tree});
        if (mode === 'accessor')
          return {
            capabilities,
            tree: Object.defineProperty({}, 'default', {get: getter}),
          };
        if (mode === 'wrong-contract') return {capabilities: {}, tree};
        return {capabilities, tree: {default: 'wrong'}};
      };
      expect(supportsIconCapabilities(core)).toBe(false);
      expect(getter).not.toHaveBeenCalled();
    },
  );
  it('rejects a truly unobserved lineage even with the exact two-constructor witness', () => {
    expect(() =>
      assertIconCapability({name: 'unknown'}, protocol(), {unobserved: [{}]}),
    ).toThrow(expect.objectContaining({code: 'ERR_CORE_INCOMPATIBLE'}));
  });
  it('rejects missing or inherited constructors and caches a throwing witness', () => {
    expect(supportsIconCapabilities({})).toBe(false);
    expect(supportsIconCapabilities(Object.create(protocol()))).toBe(false);
    const core = protocol();
    core.defineAdaptiveIcon = vi.fn(() => {
      throw new Error('old protocol');
    });
    expect(supportsIconCapabilities(core)).toBe(false);
    expect(supportsIconCapabilities(core)).toBe(false);
    expect(core.defineAdaptiveIcon).toHaveBeenCalledOnce();
  });
});

describe('selected raw unsupported fields', () => {
  it.each([
    [
      'namespaced component map',
      {componentIcons: {'fixture-leading': 'library:mark'}},
    ],
    ['bad slot name', {componentIcons: {bad: 'close'}}],
    ['null component map', {componentIcons: null}],
    [
      'role size dimension',
      {iconCapabilities: {roleSizeOverrides: {'fixture-leading': 20}}},
    ],
    [
      'state weight',
      {iconCapabilities: {presentation: {byState: {active: {weight: 600}}}}},
    ],
  ])('rejects %s in raw, inherited and spread evidence', (_name, input) => {
    const plain = {name: 'plain'};
    for (const evidence of [[input], [{...input}]])
      expect(() => assertSupportedIconFields(plain, evidence)).toThrow(
        expect.objectContaining({code: 'ERR_THEME_INVALID'}),
      );
    expect(() => assertSupportedIconFields(input)).toThrow(
      expect.objectContaining({code: 'ERR_THEME_INVALID'}),
    );
    expect(() => assertSupportedIconFields(plain)).not.toThrow();
  });
  it('does not invoke forbidden field or policy getters', () => {
    const getter = vi.fn(() => ({}));
    for (const input of [
      Object.defineProperty({}, 'componentIcons', {get: getter}),
      Object.defineProperty({}, 'iconCapabilities', {get: getter}),
      {
        iconCapabilities: Object.defineProperty({}, 'presentation', {
          get: getter,
        }),
      },
    ])
      expect(() => assertSupportedIconFields(input)).toThrow(
        expect.objectContaining({code: 'ERR_THEME_INVALID'}),
      );
    expect(getter).not.toHaveBeenCalled();
  });
  it('does not scan an unrelated sibling and admits supported null/default/bySize data', () => {
    const unused = {componentIcons: null};
    const selected = {
      iconCapabilities: {
        sizeOverrides: {compact: null},
        presentation: {
          default: {weight: 525.5},
          bySize: {md: {appearance: 'outline'}},
        },
      },
    };
    expect(() => assertSupportedIconFields(selected, [selected])).not.toThrow();
    expect(() =>
      assertSupportedIconFields({iconCapabilities: {presentation: null}}),
    ).not.toThrow();
    expect(() => assertSupportedIconFields(unused)).toThrow();
  });
  it('detects bare/bound source intent but does not mistake React nodes for source IR', () => {
    expect(hasIconCapabilityIntent({icons: {close: {default: 'svg'}}})).toBe(
      true,
    );
    expect(
      hasIconCapabilityIntent({
        icons: {close: {capabilities: {}, tree: {default: 'svg'}}},
      }),
    ).toBe(true);
    expect(
      hasIconCapabilityIntent({
        icons: {
          close: {
            $$typeof: Symbol.for('react.transitional.element'),
            default: 'ordinary prop',
          },
        },
      }),
    ).toBe(false);
    expect(
      hasIconCapabilityIntent({
        iconCapabilities: undefined,
        icons: {close: 'fixed'},
      }),
    ).toBe(false);
  });
  it('fails capability-blind Core only for selected capability/unknown lineage', () => {
    expect(() => assertIconCapability({name: 'plain'}, {})).not.toThrow();
    expect(() =>
      assertIconCapability(
        {name: 'plain'},
        {},
        {lineage: [{iconCapabilities: null}]},
      ),
    ).toThrow(expect.objectContaining({code: 'ERR_CORE_INCOMPATIBLE'}));
    expect(() =>
      assertIconCapability({name: 'plain'}, {}, {unobserved: [{}]}),
    ).toThrow(expect.objectContaining({code: 'ERR_CORE_INCOMPATIBLE'}));
  });
});
