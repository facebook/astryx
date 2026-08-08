// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Behavior when MULTIPLE integrations each contribute a template
 * transform. This is the tricky, easy-to-get-wrong case, so the contract is
 * pinned here explicitly:
 *
 *   1. COMPOSITION — distinct wrappers nest, applied in config order, so the
 *      LAST integration in the config is the OUTERMOST wrapper. Deterministic:
 *      the same config always produces the same nesting.
 *   2. OBSERVABILITY — `transformedBy` / `alterations` / `onAlter` list exactly
 *      the integrations that actually changed the source, in application order.
 *   3. ISOLATION — one integration failing (invalid output) is rolled back and
 *      warned; the others still apply. Never broken output.
 *   4. CONFLICTS — two integrations wrapping in the SAME component name resolve
 *      to first-wins (you can't bind the same name twice); a wrapper whose name
 *      collides with a pre-existing import rolls back rather than duplicate a
 *      binding.
 *   5. SCOPE / OWNERSHIP — `appliesTo` and owner-exclusion are evaluated per
 *      integration, independently.
 */

import {describe, it, expect} from 'vitest';
import jscodeshift from 'jscodeshift';
import {applyTemplateTransforms, applyTransformContext} from './apply.mjs';

const CORE = '@astryxdesign/core';
const PAGE = `export default function Page() { return <Main />; }`;

const tpl = (over = {}) => ({type: 'page', id: 'x', package: CORE, ...over});
const entry = (pkg, transform) => ({package: pkg, transform});
const wrap = (component, from, extra = {}) => ({wrap: {component, from, ...extra}});
const count = (s, re) => (s.match(re) ?? []).length;
const parses = s =>
  expect(() => jscodeshift.withParser('tsx')(s)).not.toThrow();

function apply(source, transforms, {template = tpl(), onWarn} = {}) {
  return applyTemplateTransforms(source, {
    filePath: '/t/page.tsx',
    template,
    transforms,
    jscodeshift,
    onWarn,
  });
}

describe('multi-integration: composition of distinct wrappers', () => {
  it('nests in config order — last integration is outermost', () => {
    const {source, transformedBy} = apply(PAGE, [
      entry('@a/one', wrap('Inner', '@a/one')),
      entry('@b/two', wrap('Outer', '@b/two')),
    ]);
    expect(transformedBy).toEqual(['@a/one', '@b/two']);
    expect(source).toContain('<Inner>');
    expect(source).toContain('<Outer>');
    expect(source.indexOf('<Outer>')).toBeLessThan(source.indexOf('<Inner>'));
    expect(source).toMatch(/from '@a\/one'/);
    expect(source).toMatch(/from '@b\/two'/);
    parses(source);
  });

  it('reversing config order reverses the nesting', () => {
    const ab = apply(PAGE, [
      entry('@a', wrap('AA', '@a')),
      entry('@b', wrap('BB', '@b')),
    ]).source;
    const ba = apply(PAGE, [
      entry('@b', wrap('BB', '@b')),
      entry('@a', wrap('AA', '@a')),
    ]).source;
    expect(ab.indexOf('<BB>')).toBeLessThan(ab.indexOf('<AA>'));
    expect(ba.indexOf('<AA>')).toBeLessThan(ba.indexOf('<BB>'));
  });

  it('composes five integrations, each once, in order', () => {
    const five = ['@i/1', '@i/2', '@i/3', '@i/4', '@i/5'].map((p, i) =>
      entry(p, wrap(`W${i + 1}`, p)),
    );
    const {source, transformedBy} = apply(PAGE, five);
    expect(transformedBy).toEqual(['@i/1', '@i/2', '@i/3', '@i/4', '@i/5']);
    for (let i = 1; i <= 5; i++) {
      expect(count(source, new RegExp(`<W${i}>`, 'g'))).toBe(1);
    }
    expect(source.indexOf('<W5>')).toBeLessThan(source.indexOf('<W1>'));
    parses(source);
  });

  it('is deterministic — same config yields byte-identical output from pristine', () => {
    const set = () => [
      entry('@a', wrap('Inner', '@a')),
      entry('@b', wrap('Outer', '@b')),
    ];
    expect(apply(PAGE, set()).source).toBe(apply(PAGE, set()).source);
  });
});

describe('multi-integration: observability', () => {
  it('transformedBy + alterations reflect each applied integration in order', () => {
    const {transformedBy, alterations} = apply(PAGE, [
      entry('@a', {description: 'A shell.', ...wrap('AA', '@a')}),
      entry('@b', {description: 'B shell.', ...wrap('BB', '@b')}),
    ]);
    expect(transformedBy).toEqual(['@a', '@b']);
    expect(alterations.map(a => a.package)).toEqual(['@a', '@b']);
    expect(alterations[0]).toMatchObject({
      package: '@a',
      wrappers: ['AA'],
      description: 'A shell.',
    });
    expect(alterations[1].wrappers).toEqual(['BB']);
  });

  it('onAlter fires once with every applied integration (via the show/copy seam)', () => {
    /** @type {any[]} */
    const calls = [];
    applyTransformContext(PAGE, '/t/page.tsx', {
      transforms: [
        entry('@a', wrap('AA', '@a')),
        entry('@b', wrap('BB', '@b')),
      ],
      jscodeshift,
      template: tpl(),
      onAlter: a => calls.push(a),
    });
    expect(calls).toHaveLength(1);
    expect(calls[0].map((/** @type {any} */ a) => a.package)).toEqual([
      '@a',
      '@b',
    ]);
  });
});

describe('multi-integration: isolation', () => {
  it('a broken integration is skipped + warned; the rest still apply', () => {
    /** @type {string[]} */
    const warnings = [];
    // `default` is a reserved word -> `import {default}` is invalid -> rollback.
    const {source, transformedBy} = apply(
      PAGE,
      [
        entry('@bad', wrap('default', '@bad')),
        entry('@good', wrap('Shell', '@good')),
      ],
      {onWarn: m => warnings.push(m)},
    );
    expect(transformedBy).toEqual(['@good']);
    expect(source).toContain('<Shell>');
    expect(warnings).toHaveLength(1);
    parses(source);
  });

  it('a broken integration in the MIDDLE does not stop the ones after it', () => {
    /** @type {string[]} */
    const warnings = [];
    const {source, transformedBy} = apply(
      PAGE,
      [
        entry('@a', wrap('AA', '@a')),
        entry('@bad', wrap('default', '@bad')),
        entry('@c', wrap('CC', '@c')),
      ],
      {onWarn: m => warnings.push(m)},
    );
    expect(transformedBy).toEqual(['@a', '@c']);
    expect(source).toContain('<AA>');
    expect(source).toContain('<CC>');
    expect(warnings).toHaveLength(1);
    parses(source);
  });
});

describe('multi-integration: conflicts', () => {
  it('same wrapper NAME from different modules -> first wins, second skipped', () => {
    const {source, transformedBy} = apply(PAGE, [
      entry('@a', wrap('Shell', '@a')),
      entry('@b', wrap('Shell', '@b')),
    ]);
    // Only the first Shell is applied — you can't bind two `Shell`s.
    expect(transformedBy).toEqual(['@a']);
    expect(count(source, /<Shell>/g)).toBe(1);
    expect(source).toMatch(/from '@a'/);
    expect(source).not.toMatch(/from '@b'/);
    parses(source);
  });

  it('a wrapper name colliding with a pre-existing import rolls back, others apply', () => {
    /** @type {string[]} */
    const warnings = [];
    const src = `import {Frame} from '@existing';\nexport default function Page() { return <Main />; }`;
    const {source, transformedBy} = apply(
      src,
      [
        entry('@a', wrap('Frame', '@a')), // collides with @existing's Frame
        entry('@b', wrap('Shell', '@b')), // fine
      ],
      {onWarn: m => warnings.push(m)},
    );
    expect(transformedBy).toEqual(['@b']);
    expect(count(source, /<Frame>/g)).toBe(0); // @a wrap rolled back
    expect(source).toContain('<Shell>');
    expect(warnings).toHaveLength(1);
    parses(source);
  });
});

describe('multi-integration: scope + ownership (independent per integration)', () => {
  it('owner-exclusion is per integration', () => {
    // Template owned by @a: @a is excluded from its own template; @b applies.
    const {transformedBy} = apply(
      PAGE,
      [entry('@a', wrap('AA', '@a')), entry('@b', wrap('BB', '@b'))],
      {template: tpl({package: '@a'})},
    );
    expect(transformedBy).toEqual(['@b']);
  });

  it('one integration may transform another integration’s template', () => {
    const {source, transformedBy} = apply(PAGE, [entry('@b', wrap('BB', '@b'))], {
      template: tpl({package: '@a'}),
    });
    expect(transformedBy).toEqual(['@b']);
    expect(source).toContain('<BB>');
  });

  it('appliesTo.types is evaluated per integration', () => {
    const {transformedBy} = apply(PAGE, [
      entry('@a', wrap('AA', '@a')),
      entry('@b', {appliesTo: {types: ['block']}, ...wrap('BB', '@b')}),
    ]);
    // Page template: @a (page-scoped default) applies; @b (block-only) does not.
    expect(transformedBy).toEqual(['@a']);
  });

  it('appliesTo.include is evaluated per integration', () => {
    const {transformedBy} = apply(
      PAGE,
      [
        entry('@a', {appliesTo: {include: ['x']}, ...wrap('AA', '@a')}),
        entry('@b', {appliesTo: {include: ['other']}, ...wrap('BB', '@b')}),
      ],
      {template: tpl({id: 'x'})},
    );
    expect(transformedBy).toEqual(['@a']);
  });
});
