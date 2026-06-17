// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import('../rebrand-xds-css-namespace.mjs');
  const file = {source, path: 'test.css'};
  const result = transform(file);
  return result ?? source;
}

describe('rebrand-xds-css-namespace', () => {
  it('rewrites .xds-* class selectors to .astryx-*', async () => {
    const out = await applyTransform('.xds-button { color: red; }');
    expect(out).toBe('.astryx-button { color: red; }');
  });

  it('rewrites data-xds-* attribute selectors', async () => {
    const out = await applyTransform(
      '[data-xds-theme="dark"] .xds-card { padding: 0; }',
    );
    expect(out).toBe('[data-astryx-theme="dark"] .astryx-card { padding: 0; }');
  });

  it('rewrites data-xds-* attributes in JSX/markup', async () => {
    const out = await applyTransform('<div data-xds-media="dark" />');
    expect(out).toBe('<div data-astryx-media="dark" />');
  });

  it('rewrites data-xds-* in getAttribute string args', async () => {
    const out = await applyTransform("el.getAttribute('data-xds-theme')");
    expect(out).toBe("el.getAttribute('data-astryx-theme')");
  });

  it('rewrites bare xds-* class tokens in className strings', async () => {
    const out = await applyTransform('className="xds-button primary"');
    expect(out).toBe('className="astryx-button primary"');
  });

  it('PRESERVES @layer xds-base / xds-theme (layer names stay through compat)', async () => {
    const src = '@layer reset, xds-base, xds-theme, product;';
    const out = await applyTransform(src);
    expect(out).toBe(src);
  });

  it('PRESERVES --xds-* custom properties', async () => {
    const src = '.my-card { --xds-card-padding: 24px; }';
    const out = await applyTransform(src);
    // The class selector `.my-card` is untouched and the --xds- var is left as-is
    // (var migration is a separate, human-reviewed step).
    expect(out).toBe(src);
  });

  it('does not rebrand --xds-* even when xds-base layer is nearby', async () => {
    const src =
      '@layer xds-theme {\n  .my-thing { --xds-card-padding: 8px; }\n}';
    const out = await applyTransform(src);
    expect(out).toBe(src);
  });

  it('rewrites a realistic consumer override block', async () => {
    const src = [
      '[data-xds-theme="brand"] .xds-button[data-variant="primary"] {',
      '  background: hotpink;',
      '}',
    ].join('\n');
    const out = await applyTransform(src);
    expect(out).toContain('[data-astryx-theme="brand"]');
    expect(out).toContain('.astryx-button[data-variant="primary"]');
    expect(out).not.toContain('xds-');
  });

  it('returns source unchanged when nothing matches', async () => {
    const src = '.my-button { color: blue; }';
    const out = await applyTransform(src);
    expect(out).toBe(src);
  });
});
