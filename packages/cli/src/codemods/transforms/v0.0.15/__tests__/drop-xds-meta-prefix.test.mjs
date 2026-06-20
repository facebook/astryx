// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import('../drop-xds-meta-prefix.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('drop-xds-meta-prefix', () => {
  it('renames a basic named import (XDSMetaAppShell -> MetaAppShell)', async () => {
    const input = `import {XDSMetaAppShell} from '@nest/xds-meta/AppShell';`;
    const output = await applyTransform(input);
    expect(output).toContain(
      `import {MetaAppShell} from '@nest/xds-meta/AppShell';`,
    );
    expect(output).not.toContain('XDSMetaAppShell');
  });

  it('renames a hook (useXDSMetaCommandPalette -> useMetaCommandPalette)', async () => {
    const input = [
      `import {useXDSMetaCommandPalette} from '@nest/xds-meta/CommandPalette';`,
      `const cp = useXDSMetaCommandPalette();`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain(
      `import {useMetaCommandPalette} from '@nest/xds-meta/CommandPalette';`,
    );
    expect(output).toContain('const cp = useMetaCommandPalette();');
    expect(output).not.toContain('useXDSMetaCommandPalette');
  });

  it('renames a camel-case binding (xdsMetaIconRegistry -> metaIconRegistry)', async () => {
    const input = [
      `import {xdsMetaIconRegistry} from '@nest/xds-meta/Theme';`,
      `xdsMetaIconRegistry.register('foo');`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain(
      `import {metaIconRegistry} from '@nest/xds-meta/Theme';`,
    );
    expect(output).toContain(`metaIconRegistry.register('foo');`);
    expect(output).not.toContain('xdsMetaIconRegistry');
  });

  it('updates JSX usage (<XDSMetaAppShell> -> <MetaAppShell>)', async () => {
    const input = [
      `import {XDSMetaAppShell} from '@nest/xds-meta/AppShell';`,
      `export const App = () => <XDSMetaAppShell>hi</XDSMetaAppShell>;`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain('<MetaAppShell>hi</MetaAppShell>');
    expect(output).not.toContain('XDSMetaAppShell');
  });

  it('updates type usage in generic positions (ComponentProps<typeof XDSMetaAppShell>)', async () => {
    const input = [
      `import {XDSMetaAppShell} from '@nest/xds-meta/AppShell';`,
      `import type {ComponentProps} from 'react';`,
      `type Props = ComponentProps<typeof XDSMetaAppShell>;`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain('ComponentProps<typeof MetaAppShell>');
    expect(output).not.toContain('XDSMetaAppShell');
  });

  it('renames type references nested in generic type-argument positions', async () => {
    const input = [
      `import {XDSMetaTableColumn} from '@nest/xds-meta/Table';`,
      `const cols = useMemo<XDSMetaTableColumn<Issue>[]>(() => [], []);`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain(
      `import {MetaTableColumn} from '@nest/xds-meta/Table';`,
    );
    expect(output).toContain('useMemo<MetaTableColumn<Issue>[]>');
    // The unrelated generic argument `Issue` must be left alone.
    expect(output).toContain('<Issue>');
    expect(output).not.toContain('XDSMetaTableColumn');
  });

  it('renames multiple imports from the root barrel', async () => {
    const input = [
      `import {XDSMetaAppShell, XDSMetaBugNub} from '@nest/xds-meta';`,
      `export const App = () => <XDSMetaAppShell><XDSMetaBugNub /></XDSMetaAppShell>;`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain(
      `import {MetaAppShell, MetaBugNub} from '@nest/xds-meta';`,
    );
    expect(output).toContain('<MetaAppShell><MetaBugNub /></MetaAppShell>');
    expect(output).not.toContain('XDSMeta');
  });

  it('does NOT touch identifiers imported from a non-xds-meta source', async () => {
    const input = [
      `import {XDSMetaLookalike} from './local';`,
      `export const App = () => <XDSMetaLookalike />;`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain(`import {XDSMetaLookalike} from './local';`);
    expect(output).toContain('<XDSMetaLookalike />');
  });

  it('does NOT touch local symbols that are not imported from xds-meta', async () => {
    const input = [
      `import {XDSMetaAppShell} from '@nest/xds-meta/AppShell';`,
      `const XDSMetaFoo = 1;`,
      `export const App = () => <XDSMetaAppShell>{XDSMetaFoo}</XDSMetaAppShell>;`,
    ].join('\n');
    const output = await applyTransform(input);
    // Local symbol stays untouched.
    expect(output).toContain('const XDSMetaFoo = 1;');
    expect(output).toContain('{XDSMetaFoo}');
    // The imported binding is renamed.
    expect(output).toContain('<MetaAppShell>');
    expect(output).not.toContain('XDSMetaAppShell');
  });

  it('handles subpath imports and keeps the source path', async () => {
    const input = [
      `import {XDSMetaSideNav} from '@nest/xds-meta/SideNav';`,
      `export const App = () => <XDSMetaSideNav />;`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain(
      `import {MetaSideNav} from '@nest/xds-meta/SideNav';`,
    );
    expect(output).toContain('<MetaSideNav />');
    expect(output).not.toContain('XDSMetaSideNav');
  });

  it('returns undefined (no changes) when there are no @nest/xds-meta imports', async () => {
    const {default: transform} = await import('../drop-xds-meta-prefix.mjs');
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const file = {
      source: `import {useState} from 'react';\nconst x = 1;`,
      path: 'test.tsx',
    };
    const result = transform(file, api);
    expect(result).toBeUndefined();
  });
});
