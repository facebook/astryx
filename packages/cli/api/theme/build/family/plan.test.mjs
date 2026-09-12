// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file plan.test.mjs
 * @input One resolved theme and every existing compiler output track
 * @output A complete, fixed-order 13-section member plan
 * @position AST-034 FR5/FR6 completeness gate
 */

import {describe, expect, it} from 'vitest';
import {createMemberPlan, SECTION_KINDS} from './plan.mjs';

function input(overrides = {}) {
  return {
    identity: {name: 'ocean', sourceId: 'themes/ocean.ts', parentName: null},
    resolved: {
      name: 'ocean',
      tokens: {'--ink': 'red'},
      components: {},
      __adaptations: {widthBreakpoints: {}, rules: []},
      __axes: {},
    },
    dataDefaults: ':root { --data-blue: blue; }',
    rules: {
      prose: ['  :where(p) {\n    color: var(--ink);\n  }'],
      component: ['  :scope {\n    --ink: red;\n  }'],
    },
    adaptations: {prose: '', component: ''},
    onMedia: '',
    colorScheme: '',
    registries: {icons: null, indicators: null},
    fonts: [],
    typeAugmentations: '',
    provenance: {command: 'astryx theme build --family ...'},
    ...overrides,
  };
}

describe('createMemberPlan', () => {
  it('represents every compiler section exactly once in the fixed order', () => {
    const plan = createMemberPlan(input());

    expect(plan.sections.map(section => section.kind)).toEqual(SECTION_KINDS);
    expect(new Set(plan.sections.map(section => section.kind)).size).toBe(13);
    expect(plan.sections).toHaveLength(13);
    expect(plan.planDigest).toMatch(/^sha256-[a-f0-9]{64}$/);
  });

  it('keeps deliberately empty sections instead of omitting them', () => {
    const plan = createMemberPlan(
      input({dataDefaults: '', rules: {prose: [], component: []}}),
    );

    expect(plan.sections.find(section => section.kind === 'data-defaults')).toMatchObject({
      empty: true,
      tracks: ['css'],
      css: [],
    });
    expect(plan.sections.find(section => section.kind === 'registries')).toMatchObject({
      empty: true,
      tracks: ['js'],
    });
  });

  it('separates token declarations from complete component lowering', () => {
    const plan = createMemberPlan(
      input({
        rules: {
          prose: [],
          component: [
            '  :scope {\n    --ink: red;\n    --paper: white;\n  }',
            '  .astryx-button::before {\n    color: red;\n  }',
          ],
        },
      }),
    );

    const tokens = plan.sections.find(section => section.kind === 'tokens');
    const components = plan.sections.find(
      section => section.kind === 'components',
    );
    expect(tokens.css.map(unit => unit.property)).toEqual(['--ink', '--paper']);
    expect(components.css).toEqual([
      expect.objectContaining({selector: '.astryx-button::before', property: 'color'}),
    ]);
  });
});
