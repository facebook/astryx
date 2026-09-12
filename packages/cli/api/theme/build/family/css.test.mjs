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
