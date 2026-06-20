// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import('../drop-xds-prefix-imports.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('drop-xds-prefix-imports', () => {
  it('renames a named import + its JSX usage', async () => {
    const input = [
      `import {XDSButton} from '@xds/core';`,
      `export const App = () => <XDSButton label="Hi" />;`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain(`import {Button} from '@xds/core';`);
    expect(output).toContain('<Button label="Hi" />');
    expect(output).not.toContain('XDSButton');
  });

  it('renames subpath imports and keeps the source path', async () => {
    const input = `import {XDSButton} from '@xds/core/Button';`;
    const output = await applyTransform(input);
    expect(output).toContain('Button');
    // The subpath dir is NOT renamed by this codemod.
    expect(output).toContain(`from '@xds/core/Button'`);
    expect(output).not.toContain('XDSButton');
  });

  it('renames hooks (useXDS -> use)', async () => {
    const input = [
      `import {useXDSTheme} from '@xds/core';`,
      `const t = useXDSTheme();`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain('import {useTheme}');
    expect(output).toContain('const t = useTheme();');
    expect(output).not.toContain('useXDSTheme');
  });

  it('renames type-only imports and type references', async () => {
    const input = [
      `import type {XDSButtonProps} from '@xds/core';`,
      `type Props = XDSButtonProps & {extra: true};`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain('ButtonProps');
    expect(output).not.toContain('XDSButtonProps');
  });

  it('renames type references in generic type-argument positions', async () => {
    const input = [
      `import {XDSTableColumn} from '@xds/core/Table';`,
      `const cols = useMemo<XDSTableColumn<Issue>[]>(() => [], []);`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain(`import {TableColumn} from '@xds/core/Table';`);
    expect(output).toContain('useMemo<TableColumn<Issue>[]>');
    // The unrelated generic argument `Issue` must be left alone.
    expect(output).toContain('<Issue>');
    expect(output).not.toContain('XDSTableColumn');
  });

  it('rewrites the imported name but keeps a custom local alias', async () => {
    const input = [
      `import {XDSButton as Btn} from '@xds/core';`,
      `export const App = () => <Btn />;`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain('Button as Btn');
    expect(output).toContain('<Btn />');
    expect(output).not.toContain('XDSButton');
  });

  it('does NOT touch identifiers that are not imported from @xds/core', async () => {
    const input = [
      `import {XDSButton} from '@my/other-lib';`,
      `const XDSCustomThing = 1;`,
      `export const App = () => <XDSButton />;`,
    ].join('\n');
    const output = await applyTransform(input);
    // Neither the third-party import nor the local symbol should change.
    expect(output).toContain(`import {XDSButton} from '@my/other-lib';`);
    expect(output).toContain('const XDSCustomThing = 1;');
    expect(output).toContain('<XDSButton />');
  });

  it('does NOT touch strings that merely start with XDS', async () => {
    const input = [
      `import {XDSButton} from '@xds/core';`,
      `const label = 'XDSButton is great';`,
      `export const App = () => <XDSButton label={label} />;`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain(`'XDSButton is great'`);
    expect(output).toContain('<Button label={label} />');
  });

  it('handles multiple specifiers and a mix of components, hooks, and types', async () => {
    const input = [
      `import {XDSButton, XDSCard, useXDSToast} from '@xds/core';`,
      `import type {XDSCardProps} from '@xds/core';`,
      `export function App() {`,
      `  const toast = useXDSToast();`,
      `  const p: XDSCardProps = {};`,
      `  return <XDSCard><XDSButton /></XDSCard>;`,
      `}`,
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toContain('import {Button, Card, useToast}');
    expect(output).toContain('CardProps');
    expect(output).toContain('const toast = useToast();');
    expect(output).toContain('<Card><Button /></Card>');
    expect(output).not.toContain('XDS');
  });

  it('rewrites re-exports from @xds/core', async () => {
    const input = `export {XDSButton} from '@xds/core/Button';`;
    const output = await applyTransform(input);
    expect(output).toContain('Button');
    expect(output).toContain(`from '@xds/core/Button'`);
    expect(output).not.toContain('XDSButton');
  });

  it('returns source unchanged when there is nothing to rename', async () => {
    const input = `import {useState} from 'react';\nconst x = 1;`;
    const output = await applyTransform(input);
    expect(output).toContain(`import {useState} from 'react';`);
    expect(output).toContain('const x = 1;');
  });
});
