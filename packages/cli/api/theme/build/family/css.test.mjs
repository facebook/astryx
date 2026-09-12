// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file css.test.mjs
 * @input Complete member plans with shared and member-specific declarations
 * @output One family stylesheet with exact scopes and zero-specificity sharing
 * @position AST-034 FR6/FR10 factoring and cascade structure tests
 */

import postcss from 'postcss';
import {describe, expect, it} from 'vitest';
import {renderFamilyCSS} from './css.mjs';
import {factorFamilyPlans} from './factor.mjs';
import {createMemberPlan} from './plan.mjs';

function plan(name, ink, beforeContent) {
  return createMemberPlan({
    identity: {
      name,
      sourceId: `themes/${name}.ts`,
      parentName: name === 'ocean' ? null : 'ocean',
    },
    resolved: {name, tokens: {'--shared': 'green', '--ink': ink}},
    dataDefaults: ':root { --data-blue: blue; }',
    rules: {
      prose: ['  :where(p) {\n    color: var(--ink);\n  }'],
      component: [
        `  :scope {\n    --shared: green;\n    --ink: ${ink};\n  }`,
        '  .astryx-button {\n    color: var(--ink);\n  }',
        `  .astryx-button::before {\n    content: "${beforeContent}";\n  }`,
      ],
    },
    adaptations: {prose: '', component: ''},
    onMedia: '',
    colorScheme: '',
    registries: {},
    fonts: [],
    typeAugmentations: '',
    provenance: {},
  });
}

describe('family CSS factoring', () => {
  it('emits shared declarations once and keeps exact member deltas', () => {
    const plans = [
      plan('ocean', 'red', 'S'),
      plan('ocean-deep', 'blue', 'C'),
      plan('ocean-zero', 'red', 'S'),
    ];
    const css = renderFamilyCSS(factorFamilyPlans(plans));

    expect(css.match(/--shared: green/g)).toHaveLength(1);
    expect(css.match(/--ink: red/g)).toHaveLength(1);
    expect(css.match(/--ink: blue/g)).toHaveLength(1);
    expect(css).toContain(
      '@scope ([data-astryx-theme="ocean"], [data-astryx-theme="ocean-zero"]) to ([data-astryx-theme])',
    );
    expect(css).toContain(
      '@scope ([data-astryx-theme="ocean-deep"]) to ([data-astryx-theme])',
    );
    expect(css).toContain(':where(:scope)');
    expect(css).toContain(':scope {');
    expect(css).toContain(':where(.astryx-button)');
    expect(css).toContain(':where(.astryx-button)::before');
    expect(css).not.toContain(':where(.astryx-button::before)');
    expect(() => postcss.parse(css)).not.toThrow();
  });

  it('keeps inherited state specificity when a child adds a base declaration', () => {
    const componentPlan = (name, parentName, componentRules) =>
      createMemberPlan({
        identity: {name, sourceId: `${name}.mjs`, parentName},
        resolved: {name, tokens: {}, components: {}},
        dataDefaults: '',
        rules: {prose: [], component: componentRules},
        adaptations: {prose: '', component: ''},
        onMedia: '',
        colorScheme: '',
        registries: {},
        fonts: [],
        typeAugmentations: '',
        provenance: {},
      });
    const css = renderFamilyCSS(
      factorFamilyPlans([
        componentPlan('base', null, ['.astryx-button:hover { color: red; }']),
        componentPlan('child', 'base', [
          '.astryx-button:hover { color: red; }',
          '.astryx-button { color: green; }',
        ]),
      ]),
    );

    expect(css.match(/color: red/g)).toHaveLength(2);
    expect(css).not.toContain(':where(.astryx-button:hover)');
    expect(() => postcss.parse(css)).not.toThrow();
  });

  it('keeps each member’s authored adaptation order when values reverse', () => {
    const adaptationPlan = (name, parentName, values) =>
      createMemberPlan({
        identity: {name, sourceId: `${name}.mjs`, parentName},
        resolved: {
          name,
          tokens: {},
          components: {},
          __adaptations: {},
          __axes: {},
        },
        dataDefaults: '',
        rules: {prose: [], component: []},
        adaptations: {
          prose: '',
          component: values
            .map(
              value =>
                `@media (pointer: coarse) { @scope ([data-astryx-theme="${name}"]) to ([data-astryx-theme]) { :scope { --tone: ${value}; } } }`,
            )
            .join('\n'),
        },
        onMedia: '',
        colorScheme: '',
        registries: {},
        fonts: [],
        typeAugmentations: '',
        provenance: {},
      });
    const css = renderFamilyCSS(
      factorFamilyPlans([
        adaptationPlan('a', null, ['red', 'blue']),
        adaptationPlan('b', 'a', ['blue', 'red']),
      ]),
    );
    /** @type {Record<'a'|'b', string[]>} */
    const valuesByMember = {a: [], b: []};
    postcss.parse(css).walkAtRules('scope', atRule => {
      const member = atRule.params.includes('"a"')
        ? 'a'
        : atRule.params.includes('"b"')
          ? 'b'
          : null;
      if (!member) return;
      atRule.walkDecls('--tone', declaration => {
        valuesByMember[member].push(declaration.value);
      });
    });

    expect(valuesByMember).toEqual({
      a: ['red', 'blue'],
      b: ['blue', 'red'],
    });
    expect(css.match(/--tone:/g)).toHaveLength(4);
    expect(css).not.toMatch(/:where\(:scope\)\s*\{\s*--tone/);
  });

  it('retains zero-delta member applicability without a member artifact', () => {
    const css = renderFamilyCSS(
      factorFamilyPlans([
        plan('ocean', 'red', 'S'),
        plan('ocean-zero', 'red', 'S'),
      ]),
    );

    expect(css).toContain('[data-astryx-theme="ocean-zero"]');
    expect(css.match(/--ink: red/g)).toHaveLength(1);
  });
});
