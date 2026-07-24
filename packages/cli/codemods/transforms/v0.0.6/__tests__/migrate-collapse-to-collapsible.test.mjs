// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../migrate-collapse-to-collapsible.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('migrate-collapse-to-collapsible', () => {
  it('converts isCollapsible to collapsible (boolean shorthand)', async () => {
    const input = '<XDSSideNav isCollapsible>Content</XDSSideNav>';
    const output = await applyTransform(input);
    expect(output).toContain('collapsible');
    expect(output).not.toContain('isCollapsible');
  });

  it('converts isCollapsible + defaultIsCollapsed to collapsible object', async () => {
    const input = '<XDSSideNav isCollapsible defaultIsCollapsed>Content</XDSSideNav>';
    const output = await applyTransform(input);
    expect(output).toContain('collapsible={');
    expect(output).toContain('defaultIsCollapsed');
    expect(output).not.toContain('isCollapsible');
  });

  it('converts controlled collapse props to collapsible object', async () => {
    const input = '<XDSSideNav isCollapsible isCollapsed={collapsed} onCollapsedChange={setCollapsed}>Content</XDSSideNav>';
    const output = await applyTransform(input);
    expect(output).toContain('collapsible={');
    expect(output).toContain('isCollapsed');
    expect(output).toContain('onCollapsedChange');
    expect(output).not.toContain('isCollapsible');
  });

  it('converts hasCollapseButton={false} to hasButton: false', async () => {
    const input = '<XDSSideNav isCollapsible hasCollapseButton={false}>Content</XDSSideNav>';
    const output = await applyTransform(input);
    expect(output).toContain('hasButton: false');
    expect(output).not.toContain('hasCollapseButton');
  });

  it('removes deprecated AppShell collapse props', async () => {
    const input = '<XDSAppShell isSideNavCollapsed={collapsed} onSideNavCollapsedChange={setCollapsed} defaultIsSideNavCollapsed={true}><Content /></XDSAppShell>';
    const output = await applyTransform(input);
    expect(output).not.toContain('isSideNavCollapsed');
    expect(output).not.toContain('onSideNavCollapsedChange');
    expect(output).not.toContain('defaultIsSideNavCollapsed');
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import(
      '../migrate-collapse-to-collapsible.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const api = {jscodeshift, stats: () => {}, report: () => {}};
    const source = '<XDSSideNav collapsible>Content</XDSSideNav>';
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('does not affect other components', async () => {
    const input = '<XDSCard isCollapsible>Content</XDSCard>';
    const output = await applyTransform(input);
    expect(output).toContain('isCollapsible');
  });
});
