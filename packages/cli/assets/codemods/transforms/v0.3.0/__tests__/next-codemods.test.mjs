// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import jscodeshift from 'jscodeshift';

const j = jscodeshift.withParser('tsx');
const api = {jscodeshift: j, stats: () => {}, report: () => {}};
async function apply(name, source) {
  const {default: transform} = await import(`../${name}.mjs`);
  return transform({source, path: 'test.tsx'}, api) ?? source;
}

describe('next codemods', () => {
  it('renames TopNavHeading href to headingHref without touching TopNavItem', async () => {
    const input = `import {TopNavHeading, TopNavItem} from '@astryxdesign/core/TopNav';
const x = <><TopNavHeading heading="App" href="/" /><TopNavItem label="Home" href="/" /></>;`;
    const output = await apply(
      'rename-topnavheading-href-to-headinghref',
      input,
    );
    expect(output).toContain('headingHref="/"');
    expect(output).toContain('<TopNavItem label="Home" href="/"');
  });

  it('migrates Grid minChildWidth to columns minWidth fit mode', async () => {
    const input = `import {Grid} from '@astryxdesign/core/Grid';
const x = <Grid minChildWidth={160} gap={4} />;`;
    const output = await apply('migrate-grid-minchildwidth-to-columns', input);
    expect(output).toContain('columns={{');
    expect(output).toContain('minWidth: 160');
    expect(output).toContain("repeat: 'fit'");
    expect(output).not.toContain('minChildWidth');
  });

  it('renames NavMenuItem imports and JSX', async () => {
    const input = `import {NavMenuItem, type NavMenuItemProps} from '@astryxdesign/core/NavMenu';
const item: NavMenuItemProps = {};
const x = <NavMenuItem label="Legacy" />;`;
    const output = await apply(
      'migrate-navmenuitem-to-navheadingmenuitem',
      input,
    );
    expect(output).toContain('NavHeadingMenuItem');
    expect(output).toContain('NavHeadingMenuItemProps');
    expect(output).not.toContain('NavMenuItem');
  });

  it('repoints lab CodeBlock imports to core CodeBlock subpath', async () => {
    const input = `import {CodeBlock, Drawer} from '@astryxdesign/lab';
const x = <CodeBlock code="x" />;`;
    const output = await apply('migrate-lab-codeblock-imports', input);
    expect(output).toContain("from '@astryxdesign/core/CodeBlock'");
    expect(output).toMatch(/import \{\s*Drawer\s*\} from '@astryxdesign\/lab'/);
  });

  it('removes deprecated transition token imports', async () => {
    const input = `import {transitionVars, durationVars, type TransitionVarName} from '@astryxdesign/core/theme';
const d = durationVars;`;
    const output = await apply('remove-theme-transition-token-imports', input);
    expect(output).toContain('durationVars');
    expect(output).not.toContain('transitionVars');
    expect(output).not.toContain('TransitionVarName');
  });
});
