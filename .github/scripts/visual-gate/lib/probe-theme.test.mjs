// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';

import {buildProbeComponents, probeColor} from './probe-theme.mjs';

const contract = {
  targets: [
    {
      key: 'badge',
      className: 'astryx-badge',
      components: ['Badge'],
      props: [
        {
          name: 'variant',
          role: 'visualProp',
          domain: {
            kind: 'finite',
            values: {strings: ['error', 'info'], numbers: []},
          },
        },
      ],
    },
    {
      key: 'switch',
      className: 'astryx-switch',
      components: ['Switch'],
      props: [
        {name: 'checked', role: 'state'},
        {name: 'disabled', role: 'state'},
      ],
    },
  ],
};

describe('probeColor', () => {
  it('is deterministic, so a baseline stays comparable across runs', () => {
    expect(probeColor('badge.base')).toBe(probeColor('badge.base'));
  });

  it('gives different selectors different colours, so two targets that collapse into one element show it', () => {
    expect(probeColor('badge.base')).not.toBe(
      probeColor('badge.variant:error'),
    );
  });

  it('honours a pinned lightness, so text stays readable against its own fill', () => {
    expect(probeColor('x', {lightness: 12})).toMatch(/12%\)$/);
  });
});

describe('buildProbeComponents', () => {
  it('covers every current target with a base selector', () => {
    const {components} = buildProbeComponents(contract);
    expect(Object.keys(components).sort()).toEqual(['badge', 'switch']);
    expect(components.badge.base).toBeDefined();
    expect(components.switch.base).toBeDefined();
  });

  it('expands a finite visual prop into one selector per generated value', () => {
    const {components} = buildProbeComponents(contract);
    expect(Object.keys(components.badge).sort()).toEqual([
      'base',
      'variant:error',
      'variant:info',
    ]);
  });

  it('covers every declared state', () => {
    const {components} = buildProbeComponents(contract);
    expect(Object.keys(components.switch).sort()).toEqual([
      'base',
      'checked',
      'disabled',
    ]);
  });

  it('paints text and background differently, so an invisible-text regression is still visible', () => {
    const {components} = buildProbeComponents(contract);
    expect(components.badge.base.color).not.toBe(
      components.badge.base.backgroundColor,
    );
  });

  it('gives Popover a radius probe so the painted surface ownership is visible', () => {
    const {components} = buildProbeComponents({
      targets: [
        {
          key: 'popover',
          className: 'astryx-popover',
          components: ['Popover'],
          props: [],
        },
      ],
    });
    expect(components.popover.base.borderRadius).toBe('32px');
  });

  it('reports an open visual prop instead of inventing probe values', () => {
    const {coverage} = buildProbeComponents({
      targets: [
        {
          key: 'code-block',
          className: 'astryx-code-block',
          components: ['CodeBlock'],
          props: [
            {
              name: 'language',
              role: 'visualProp',
              domain: {kind: 'open', primitives: ['string']},
            },
          ],
        },
      ],
    });
    expect(coverage.skipped).toEqual([
      {
        key: 'code-block',
        prop: 'language',
        reason: 'generated domain is open',
      },
    ]);
  });

  it('keeps deprecated aliases in probe coverage until Core removes them', () => {
    const {components} = buildProbeComponents({
      targets: [
        ...contract.targets,
        {
          key: 'old-badge',
          className: 'astryx-old-badge',
          components: ['Badge'],
          deprecatedFor: ['badge'],
          props: [],
        },
      ],
    });
    expect(components).toHaveProperty('old-badge');
    expect(Object.keys(components).at(-1)).toBe('old-badge');
    expect(components.badge.base.backgroundColor).toBeDefined();
    expect(components.badge.base.textDecorationColor).toBeUndefined();
    expect(components['old-badge'].base.backgroundColor).toBeUndefined();
    expect(components['old-badge'].base.textDecorationColor).toBeDefined();
  });

  it('counts what it covered, which is what the CI guard asserts', () => {
    const {coverage} = buildProbeComponents(contract);
    expect(coverage).toMatchObject({targets: 2, selectors: 6});
  });

  it('is deterministic — same contract, same theme, so regeneration is a no-op diff', () => {
    expect(buildProbeComponents(contract)).toEqual(
      buildProbeComponents(contract),
    );
  });
});
