// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source, path = 'test.tsx') {
  const {default: transform} = await import('../rename-authoring-doctypes.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const result = transform({source, path}, api);
  return result ?? source;
}

describe('rename-authoring-doctypes', () => {
  it('renames an import specifier and its references', async () => {
    const input =
      `import type {PropDoc} from '@astryxdesign/cli/authoring';\n` +
      `const p: PropDoc = {name: 'x', type: 'string', description: 'y'};\n`;
    const output = await applyTransform(input);
    expect(output).toContain(
      "import type {ComponentPropDoc} from '@astryxdesign/cli/authoring'",
    );
    expect(output).toContain('const p: ComponentPropDoc =');
    expect(output).not.toMatch(/\bPropDoc\b/);
  });

  it('renames from the @astryxdesign/core re-export source', async () => {
    const input = `import type {ThemingTarget} from '@astryxdesign/core';\n`;
    const output = await applyTransform(input);
    expect(output).toContain(
      "import type {ComponentThemingTarget} from '@astryxdesign/core'",
    );
  });

  it('renames a JSDoc @type import() reference', async () => {
    const input =
      `/** @type {import('@astryxdesign/cli/authoring').TranslationDoc} */\n` +
      `export const docsZh = {};\n`;
    const output = await applyTransform(input);
    expect(output).toContain(
      "import('@astryxdesign/cli/authoring').ComponentTranslationDoc",
    );
    expect(output).not.toContain('.TranslationDoc}');
  });

  it('preserves an `as` alias, renaming only the imported name', async () => {
    const input =
      `import type {DerivedVar as DV} from '@astryxdesign/cli/authoring';\n` +
      `const d: DV = {property: 'padding'};\n`;
    const output = await applyTransform(input);
    expect(output).toContain('ComponentThemingDerivedVar as DV');
    expect(output).toContain('const d: DV =');
  });

  it('renames a re-export', async () => {
    const input = `export type {ContentBlock} from '@astryxdesign/core';\n`;
    const output = await applyTransform(input);
    expect(output).toContain('ReferenceContentBlock');
    expect(output).not.toMatch(/\bContentBlock\b/);
  });

  it('leaves the authorable entry types unchanged', async () => {
    const input =
      `import type {ComponentDoc, HookDoc} from '@astryxdesign/cli/authoring';\n`;
    const output = await applyTransform(input);
    expect(output).toContain('ComponentDoc');
    expect(output).toContain('HookDoc');
    // No accidental Component-prefixing of the entry types.
    expect(output).not.toContain('ComponentComponentDoc');
  });

  it('does not touch a local type of the same name from another module', async () => {
    const input =
      `import type {ComponentVar} from './themeEditor/constants';\n` +
      `const v: ComponentVar = {};\n`;
    const output = await applyTransform(input);
    expect(output).toContain(
      "import type {ComponentVar} from './themeEditor/constants'",
    );
    expect(output).toContain('const v: ComponentVar =');
  });

  it('is a no-op when there is no authoring doc-type reference', async () => {
    const input = `import {Button} from '@astryxdesign/core';\n`;
    const {default: transform} = await import(
      '../rename-authoring-doctypes.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const result = transform({source: input, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });
});
