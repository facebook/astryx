// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source, path = 'test.tsx') {
  const {default: transform} = await import('../migrate-authoring-imports.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const result = transform({source, path}, api);
  return result ?? source;
}

const OLD_SOURCES = [
  '@astryxdesign/cli/config',
  '@astryxdesign/cli/doc',
  '@astryxdesign/cli/integration',
  '@astryxdesign/cli/template',
  '@astryxdesign/cli/codemod',
  '@astryxdesign/core/authoring',
  '@astryxdesign/core/config',
];

describe('migrate-authoring-imports', () => {
  for (const src of OLD_SOURCES) {
    it(`repoints a type import from ${src}`, async () => {
      const input = `import type {AstryxConfig} from '${src}';\nconst c: AstryxConfig = {};\n`;
      const output = await applyTransform(input);
      expect(output).toContain("from '@astryxdesign/cli/authoring'");
      expect(output).not.toContain(src);
      // Bindings are untouched — only the specifier moved.
      expect(output).toContain('AstryxConfig');
    });
  }

  it('repoints a value import and preserves the bindings', async () => {
    const input = `import {parseConfig} from '@astryxdesign/cli/config';\n`;
    const output = await applyTransform(input);
    expect(output).toContain(
      "import {parseConfig} from '@astryxdesign/cli/authoring'",
    );
  });

  it('repoints a re-export', async () => {
    const input = `export {AstryxIntegration} from '@astryxdesign/cli/integration';\n`;
    const output = await applyTransform(input);
    expect(output).toContain("from '@astryxdesign/cli/authoring'");
    expect(output).not.toContain('@astryxdesign/cli/integration');
  });

  it('repoints a dynamic import', async () => {
    const input = `const m = await import('@astryxdesign/cli/codemod');\n`;
    const output = await applyTransform(input);
    expect(output).toContain("import('@astryxdesign/cli/authoring')");
  });

  it('repoints a TS import-type', async () => {
    const input = `type C = import('@astryxdesign/core/config').AstryxConfig;\n`;
    const output = await applyTransform(input);
    expect(output).toContain("import('@astryxdesign/cli/authoring').AstryxConfig");
  });

  it('leaves unrelated imports untouched', async () => {
    const input = `import {Button} from '@astryxdesign/core';\nimport {parseDoc} from '@astryxdesign/cli/doc';\n`;
    const output = await applyTransform(input);
    expect(output).toContain("from '@astryxdesign/core'");
    expect(output).toContain("from '@astryxdesign/cli/authoring'");
    expect(output).not.toContain('@astryxdesign/cli/doc');
  });

  it('is a no-op when there is no authoring import', async () => {
    const input = `import {Button} from '@astryxdesign/core';\n`;
    const {default: transform} = await import('../migrate-authoring-imports.mjs');
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const result = transform({source: input, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });
});
