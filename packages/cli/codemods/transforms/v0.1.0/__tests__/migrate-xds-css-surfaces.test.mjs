// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source, filePath = 'test.css') {
  const {default: transform} = await import('../migrate-xds-css-surfaces.mjs');
  // api.jscodeshift is unused by this CSS codemod, but the runner still
  // passes it — mirror that shape.
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: filePath};
  const result = transform(file, api);
  return result ?? source;
}

describe('migrate-xds-css-surfaces', () => {
  it('rewrites the .xds- class-selector prefix', async () => {
    const input = '.xds-heading { color: red; }';
    const output = await applyTransform(input);
    expect(output).toBe('.astryx-heading { color: red; }');
  });

  it('rewrites the [data-xds-theme] attribute selector', async () => {
    const input = '[data-xds-theme="dark"] .xds-card { background: black; }';
    const output = await applyTransform(input);
    expect(output).toContain('[data-astryx-theme="dark"]');
    expect(output).toContain('.astryx-card');
    expect(output).not.toContain('xds-');
  });

  it('rewrites data-xds-theme-prose and data-xds-media attribute selectors', async () => {
    const input =
      '[data-xds-theme-prose] {} [data-xds-media="print"] {}';
    const output = await applyTransform(input);
    expect(output).toContain('[data-astryx-theme-prose]');
    expect(output).toContain('[data-astryx-media="print"]');
  });

  it('rewrites @layer xds-theme and @layer xds-base', async () => {
    const input = '@layer xds-theme, xds-base;\n@layer xds-theme { a { color: red; } }';
    const output = await applyTransform(input);
    expect(output).toContain('astryx-theme');
    expect(output).toContain('astryx-base');
    expect(output).not.toContain('xds-theme');
    expect(output).not.toContain('xds-base');
  });

  it('does NOT rewrite a bare "xds" in a comment or value', async () => {
    const input = '/* xds tokens live here */\n.card { content: "xds"; }';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does NOT rewrite a class-like word missing the leading dot', async () => {
    // e.g. inside a JS-ish string or a comment fragment — not a class selector.
    const input = '/* use xds-heading in markup */';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('leaves already-migrated CSS unchanged', async () => {
    const input =
      '@layer astryx-theme { [data-astryx-theme="dark"] .astryx-card {} }';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('rewrites @import of @xds/* package stylesheets', async () => {
    const input = [
      `@import '@xds/core/reset.css';`,
      `@import '@xds/core/xds.css';`,
      `@import '@xds/theme-default/theme.css';`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain(`@import '@astryxdesign/core/reset.css';`);
    // xds.css is renamed to astryx.css (file rename, not just scope swap).
    expect(output).toContain(`@import '@astryxdesign/core/astryx.css';`);
    // theme-default collapses to theme-neutral.
    expect(output).toContain(
      `@import '@astryxdesign/theme-neutral/theme.css';`,
    );
    expect(output).not.toContain('@xds/');
  });

  it('collapses theme-daily @import to theme-neutral and preserves quote style', async () => {
    const input = `@import "@xds/theme-daily/theme.css";`;
    const output = await applyTransform(input);
    expect(output).toBe(`@import "@astryxdesign/theme-neutral/theme.css";`);
  });

  it('rewrites @import url() form', async () => {
    const input = `@import url('@xds/core/reset.css');`;
    const output = await applyTransform(input);
    expect(output).toContain(`@astryxdesign/core/reset.css`);
    expect(output).not.toContain('@xds/');
  });

  it('does not touch @import of non-xds packages', async () => {
    const input = `@import '@acme/widgets/styles.css';`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });
});
