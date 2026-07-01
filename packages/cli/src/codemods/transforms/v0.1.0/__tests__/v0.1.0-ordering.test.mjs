// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

/**
 * End-to-end test proving the v0.1.0 manifest ordering: the prefix-drop
 * codemod runs BEFORE migrate-xds-module-specifiers, so a prefixed identifier
 * imported from `@xds/core` is un-prefixed AND the module path is rewritten to
 * `@astryxdesign/core` in a single upgrade pass.
 */
async function applyManifestInOrder(source, filePath = 'test.tsx') {
  const {default: manifest} = await import('../index.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};

  let current = source;
  for (const {transform} of manifest) {
    const file = {source: current, path: filePath};
    const result = transform(file, api);
    current = result ?? current;
  }
  return current;
}

describe('v0.1.0 codemod manifest ordering', () => {
  it('runs drop-xds-prefix-imports before migrate-xds-module-specifiers', async () => {
    const {default: manifest} = await import('../index.mjs');
    const names = manifest.map(entry => entry.name);
    const prefixDropIdx = names.indexOf('drop-xds-prefix-imports');
    const specifierIdx = names.indexOf('migrate-xds-module-specifiers');
    expect(prefixDropIdx).toBeGreaterThanOrEqual(0);
    expect(specifierIdx).toBeGreaterThanOrEqual(0);
    expect(prefixDropIdx).toBeLessThan(specifierIdx);
  });

  it('drop-xds-prefix-imports is mandatory (not optional) in v0.1.0', async () => {
    const {default: manifest} = await import('../index.mjs');
    const entry = manifest.find(e => e.name === 'drop-xds-prefix-imports');
    expect(entry).toBeDefined();
    expect(entry.optional).toBeFalsy();
  });

  it('un-prefixes useXDSTheme from @xds/core/theme AND renames the scope to @astryxdesign', async () => {
    const input = [
      "import {useXDSTheme} from '@xds/core/theme';",
      '',
      'function App() {',
      '  const theme = useXDSTheme();',
      '  return theme;',
      '}',
    ].join('\n');

    const output = await applyManifestInOrder(input);

    expect(output).toMatch(/import\s*\{useTheme\}\s*from\s*['"]@astryxdesign\/core\/theme['"]/);
    expect(output).toContain('const theme = useTheme();');
    // The prefixed name and old scope must be fully gone.
    expect(output).not.toContain('useXDSTheme');
    expect(output).not.toContain('@xds/core');
  });

  it('un-prefixes XDSButton and XDSIconRegistry alongside the scope rename', async () => {
    const input = [
      "import {XDSButton, XDSIconRegistry} from '@xds/core';",
      '',
      'const registry = new XDSIconRegistry();',
      'const el = <XDSButton />;',
    ].join('\n');

    const output = await applyManifestInOrder(input);

    expect(output).toMatch(/from\s*['"]@astryxdesign\/core['"]/);
    expect(output).toContain('Button');
    expect(output).toContain('IconRegistry');
    expect(output).toContain('new IconRegistry()');
    expect(output).not.toContain('XDSButton');
    expect(output).not.toContain('XDSIconRegistry');
    expect(output).not.toContain('@xds/core');
  });
});
