// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file componentAdaptations.test.ts
 * Tests the public component-adaptation value shape (spec:AST-031 FR1/FR2) and
 * the package-internal compiler's path-specific diagnostics (IR3).
 */

import {describe, expect, it} from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {DEFAULT_WIDTH_BREAKPOINTS} from './adaptationConditions';
import * as themeBarrel from './index';
import {
  compileComponentAdaptations,
  type ComponentAdaptationCondition,
  type ComponentAdaptationRule,
  type ComponentAdaptations,
  type CompiledComponentAdaptations,
} from './componentAdaptations';
import type {ThemeAdaptationCondition} from './themeAdaptations';

type Presentation = 'popover' | 'bottom-sheet';
const PRESENTATIONS = ['popover', 'bottom-sheet'] as const;
const POINTS = DEFAULT_WIDTH_BREAKPOINTS;
const PATH = '<Selector adaptations>';

function compile(
  adaptations: unknown,
  admitted?: ReadonlyArray<Presentation>,
): CompiledComponentAdaptations<Presentation> {
  return compileComponentAdaptations(
    adaptations as ComponentAdaptations<Presentation>,
    POINTS,
    PATH,
    admitted,
  );
}

describe('public value shape', () => {
  it('accepts a default plus ordered rules', () => {
    const adaptations: ComponentAdaptations<Presentation> = {
      default: 'popover',
      rules: [
        {
          when: {width: {below: 'md'}, pointer: 'coarse'},
          value: 'bottom-sheet',
        },
      ],
    };

    expect(adaptations.default).toBe('popover');
    expect(adaptations.rules).toHaveLength(1);
  });

  it('shares the theme condition grammar, narrowed to width and pointer', () => {
    const condition: ComponentAdaptationCondition = {
      width: {from: 'md', below: 'lg'},
      pointer: 'fine',
    };
    // The component condition is assignable to the theme condition it is
    // Pick'd from — the two grammars are one type, not two copies.
    const themeCondition: ThemeAdaptationCondition = condition;
    expect(themeCondition).toEqual(condition);

    const invalid: ComponentAdaptationCondition = {
      // @ts-expect-error contrast is theme-owned; it never selects a tree
      contrast: 'more',
    };
    expect(invalid).toBeDefined();
  });

  it('requires a default and a rules array', () => {
    // @ts-expect-error `default` is the server-rendered value and is required
    const noDefault: ComponentAdaptations<Presentation> = {
      rules: [{when: {pointer: 'coarse'}, value: 'bottom-sheet'}],
    };
    // @ts-expect-error `rules` is required; pass [] rather than omitting it
    const noRules: ComponentAdaptations<Presentation> = {
      default: 'popover',
    };
    const badValue: ComponentAdaptations<Presentation> = {
      default: 'popover',
      // @ts-expect-error rule values stay inside the component's value domain
      rules: [{when: {pointer: 'coarse'}, value: 'modal'}],
    };

    expect([noDefault, noRules, badValue]).toHaveLength(3);
  });

  it('accepts an empty rules array', () => {
    // A computed rule list that matched nothing is well-formed policy, not a
    // type error at the call site.
    const empty: ComponentAdaptations<Presentation> = {
      default: 'popover',
      rules: [],
    };
    const candidates: ReadonlyArray<ComponentAdaptationRule<Presentation>> = [
      {when: {pointer: 'coarse'}, value: 'bottom-sheet'},
    ];
    const filtered: ComponentAdaptations<Presentation> = {
      default: 'popover',
      rules: candidates.filter(() => false),
    };

    expect(empty.rules).toEqual([]);
    expect(filtered.rules).toEqual([]);
  });

  it('is readonly in place', () => {
    const rule: ComponentAdaptationRule<Presentation> = {
      when: {pointer: 'coarse'},
      value: 'bottom-sheet',
    };
    const adaptations: ComponentAdaptations<Presentation> = {
      default: 'popover',
      rules: [rule],
    };

    // @ts-expect-error the policy is caller-owned data, not resolver state
    adaptations.default = 'bottom-sheet';
    // @ts-expect-error rules are read as authored
    adaptations.rules[0] = rule;
    expect(adaptations.rules[0].value).toBe('bottom-sheet');
  });
});

describe('package-internal surface', () => {
  it('publishes the authoring vocabulary but no resolver', () => {
    // Types are erased, so the runtime check is the negative one: nothing that
    // RESOLVES an adaptation is exported (spec:AST-031 IR1/IR2). Selector's
    // public `adaptations` prop admitted the value shape, not the machinery.
    for (const internal of [
      'compileComponentAdaptations',
      'useComponentAdaptations',
      'normalizeAdaptationCondition',
      'compileAdaptationConditionQuery',
      'getEffectiveWidthBreakpoints',
      'useEffectiveWidthBreakpoints',
      'COMPONENT_ADAPTATION_AXES',
    ]) {
      expect(themeBarrel).not.toHaveProperty(internal);
    }

    // The value TYPES are erased at runtime, so the guard on them is the
    // barrel source: it re-exports exactly the three authoring types a caller
    // needs to write a policy, and nothing else from this module.
    const barrelSource = fs.readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), 'index.ts'),
      'utf8',
    );
    const reExport = barrelSource.match(
      /export type \{([^}]*)\} from '\.\/componentAdaptations';/,
    );
    expect(reExport).not.toBeNull();
    expect(
      reExport![1]
        .split(',')
        .map(name => name.trim())
        .filter(Boolean)
        .sort(),
    ).toEqual([
      'ComponentAdaptationCondition',
      'ComponentAdaptationRule',
      'ComponentAdaptations',
    ]);
    // A value re-export would smuggle the compiler out with the types.
    expect(barrelSource).not.toMatch(
      /^\s*export \{[^}]*\} from '\.\/componentAdaptations'/m,
    );

    // The width vocabulary the types refer to is public, and unmoved.
    expect(themeBarrel).toHaveProperty('WIDTH_BREAKPOINT_NAMES');
    expect(themeBarrel.DEFAULT_WIDTH_BREAKPOINTS).toBe(
      DEFAULT_WIDTH_BREAKPOINTS,
    );
  });
});

describe('compileComponentAdaptations', () => {
  it('lowers every rule in author order', () => {
    const compiled = compile(
      {
        default: 'popover',
        rules: [
          {when: {width: {below: 'md'}}, value: 'bottom-sheet'},
          {when: {pointer: 'fine'}, value: 'popover'},
        ],
      },
      PRESENTATIONS,
    );

    expect(compiled).toEqual({
      default: 'popover',
      queries: ['(width < 768px)', '(pointer: fine)'],
      values: ['bottom-sheet', 'popover'],
    });
  });

  it('resolves named points against the supplied theme map', () => {
    const compiled = compileComponentAdaptations<Presentation>(
      {
        default: 'popover',
        rules: [{when: {width: {below: 'md'}}, value: 'bottom-sheet'}],
      },
      {...POINTS, md: 900},
      PATH,
    );

    expect(compiled.queries).toEqual(['(width < 900px)']);
  });

  it('compiles an empty policy to no queries', () => {
    const compiled = compile({default: 'popover', rules: []}, PRESENTATIONS);

    expect(compiled).toEqual({
      default: 'popover',
      queries: [],
      values: [],
    });
  });

  it.each([
    [null, `${PATH} must be an object.`],
    [
      {rules: [{when: {pointer: 'coarse'}, value: 'bottom-sheet'}]},
      `${PATH}.default is required; it is the server-rendered and no-match value.`,
    ],
    [{default: 'popover'}, `${PATH}.rules is required; pass [] for no rules.`],
    [
      {default: 'popover', rules: {}},
      `${PATH}.rules must be an array of {when, value} objects.`,
    ],
    [
      {default: 'popover', rules: [{pointer: 'coarse'}]},
      `${PATH}.rules[0].pointer is not supported.`,
    ],
    [
      {default: 'popover', rules: [{when: {pointer: 'coarse'}}]},
      `${PATH}.rules[0].value is required.`,
    ],
    [
      {default: 'popover', rules: [{value: 'bottom-sheet'}]},
      `${PATH}.rules[0].when is required.`,
    ],
    [
      {default: 'popover', rules: [{when: {}, value: 'bottom-sheet'}]},
      `${PATH}.rules[0].when must contain at least one condition.`,
    ],
    [
      {
        default: 'popover',
        presentation: 'popover',
        rules: [{when: {pointer: 'coarse'}, value: 'bottom-sheet'}],
      },
      `${PATH}.presentation is not supported.`,
    ],
  ])('rejects an invalid policy %#', (adaptations, message) => {
    expect(() => compile(adaptations)).toThrow(message);
  });

  it('rejects unsupported condition axes with the rule path', () => {
    expect(() =>
      compile({
        default: 'popover',
        rules: [
          {when: {pointer: 'coarse'}, value: 'bottom-sheet'},
          {when: {contrast: 'more'}, value: 'bottom-sheet'},
        ],
      }),
    ).toThrow(`${PATH}.rules[1].when.contrast is not supported.`);

    expect(() =>
      compile({
        default: 'popover',
        rules: [{when: {motion: 'reduce'}, value: 'bottom-sheet'}],
      }),
    ).toThrow(`${PATH}.rules[0].when.motion is not supported.`);
  });

  it('rejects unknown breakpoint names and reversed ranges', () => {
    expect(() =>
      compile({
        default: 'popover',
        rules: [{when: {width: {below: 'xs'}}, value: 'bottom-sheet'}],
      }),
    ).toThrow(
      `${PATH}.rules[0].when.width.below must be one of sm, md, lg, xl, 2xl.`,
    );

    expect(() =>
      compile({
        default: 'popover',
        rules: [
          {when: {width: {from: 'xl', below: 'sm'}}, value: 'bottom-sheet'},
        ],
      }),
    ).toThrow(`${PATH}.rules[0].when.width must resolve to \`from < below\``);
  });

  it('rejects values outside the component domain when one is given', () => {
    expect(() =>
      compile(
        {
          default: 'popover',
          rules: [{when: {pointer: 'coarse'}, value: 'modal'}],
        },
        PRESENTATIONS,
      ),
    ).toThrow(
      `${PATH}.rules[0].value must be one of popover, bottom-sheet; received "modal".`,
    );

    expect(() => compile({default: 'modal', rules: []}, PRESENTATIONS)).toThrow(
      `${PATH}.default must be one of popover, bottom-sheet; received "modal".`,
    );

    expect(() =>
      compile({
        default: 42,
        rules: [{when: {pointer: 'coarse'}, value: 'bottom-sheet'}],
      }),
    ).toThrow(`${PATH}.default must be a non-empty string value.`);
  });

  it('accepts any string value when the caller admits no closed domain', () => {
    const compiled = compile({
      default: 'anything',
      rules: [{when: {pointer: 'coarse'}, value: 'else'}],
    });

    expect(compiled.values).toEqual(['else']);
  });
});
