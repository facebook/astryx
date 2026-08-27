// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Unit tests for the staged (next-release) codemods.
 *
 * Mirrors v0.4.0/__tests__/next-codemods.test.mjs, which covers the codemods
 * after promotion. Keeping a copy here means a staged transform is tested from
 * the day it is written rather than the day it is released.
 */

import {describe, expect, it} from 'vitest';
import jscodeshift from 'jscodeshift';

const j = jscodeshift.withParser('tsx');
const api = {jscodeshift: j, stats: () => {}, report: () => {}};

async function apply(name, source) {
  const {default: transform} = await import(`../${name}.mjs`);
  return transform({source, path: 'test.tsx'}, api) ?? source;
}

const TRANSFORM = 'banner-collapsible-content';

const IMPORT = "import {Banner} from '@astryxdesign/core/Banner';\n";

describe('banner-collapsible-content', () => {
  it('rewrites a bare defaultIsExpanded to a starts-open config', async () => {
    const output = await apply(
      TRANSFORM,
      `${IMPORT}const el = <Banner status="info" title="T" defaultIsExpanded><p>d</p></Banner>;`,
    );
    expect(output).toContain('defaultIsOpen: true');
    expect(output).not.toContain('defaultIsExpanded');
  });

  it('rewrites defaultIsExpanded={true} the same way', async () => {
    const output = await apply(
      TRANSFORM,
      `${IMPORT}const el = <Banner status="info" title="T" defaultIsExpanded={true}><p>d</p></Banner>;`,
    );
    expect(output).toContain('defaultIsOpen: true');
    expect(output).not.toContain('defaultIsExpanded');
  });

  it('drops defaultIsExpanded={false}, which is the default', async () => {
    const output = await apply(
      TRANSFORM,
      `${IMPORT}const el = <Banner status="info" title="T" defaultIsExpanded={false}><p>d</p></Banner>;`,
    );
    expect(output).not.toContain('defaultIsExpanded');
    // No config needed: starting collapsed is what a Banner does by default.
    expect(output).not.toContain('collapsible');
    // Untouched attributes keep their original text (recast only reprints
    // what changed), so the element is exactly the base minus the prop.
    expect(output).toContain('<Banner status="info" title="T">');
  });

  it('keeps a dynamic default dynamic', async () => {
    const output = await apply(
      TRANSFORM,
      `${IMPORT}const el = <Banner status="info" title="T" defaultIsExpanded={isOpen}><p>d</p></Banner>;`,
    );
    expect(output).toContain('defaultIsOpen: isOpen');
    expect(output).not.toContain('defaultIsExpanded');
  });

  it('leaves a banner that never set the prop alone', async () => {
    // The default is unchanged, so this banner still behaves as it did. The
    // migration must not touch it — that is the whole point of the shape.
    const source = `${IMPORT}const el = <Banner status="error" title="T"><ul><li>a</li></ul></Banner>;`;
    const output = await apply(TRANSFORM, source);
    expect(output).toBe(source);
  });

  it('leaves a childless banner alone', async () => {
    const source = `${IMPORT}const el = <Banner status="info" title="T" />;`;
    const output = await apply(TRANSFORM, source);
    expect(output).toBe(source);
  });

  it('leaves a banner that already uses collapsible alone', async () => {
    const source = `${IMPORT}const el = <Banner status="info" title="T" collapsible={false} defaultIsExpanded><p>d</p></Banner>;`;
    const output = await apply(TRANSFORM, source);
    expect(output).toBe(source);
  });

  it('does not guess around a spread', async () => {
    const source = `${IMPORT}const el = <Banner status="info" title="T" defaultIsExpanded {...rest}><p>d</p></Banner>;`;
    const output = await apply(TRANSFORM, source);
    expect(output).toBe(source);
  });

  it("leaves another component's defaultIsExpanded alone", async () => {
    // ChatToolCalls has a prop of the same name that this migration must not
    // touch.
    const source = `import {ChatToolCalls} from '@astryxdesign/core/Chat';
const el = <ChatToolCalls calls={calls} defaultIsExpanded />;`;
    const output = await apply(TRANSFORM, source);
    expect(output).toBe(source);
  });

  it('leaves a Banner that is not the core Banner alone', async () => {
    const source = `import {Banner} from './ui/Banner';
const el = <Banner status="info" title="T" defaultIsExpanded><p>d</p></Banner>;`;
    const output = await apply(TRANSFORM, source);
    expect(output).toBe(source);
  });

  it('leaves the prop inside a props object alone', async () => {
    // Out of scope by design: which component the object feeds is a guess,
    // and the removed prop makes those sites a type error anyway.
    const source = `${IMPORT}const args = {status: 'info', title: 'T', defaultIsExpanded: true};
const el = <Banner {...args} />;`;
    const output = await apply(TRANSFORM, source);
    expect(output).toBe(source);
  });

  it('migrates a Banner imported from the package root', async () => {
    const output = await apply(
      TRANSFORM,
      `import {Banner, Button} from '@astryxdesign/core';
const el = <Banner status="info" title="T" defaultIsExpanded><p>d</p></Banner>;`,
    );
    expect(output).toContain('defaultIsOpen: true');
    expect(output).not.toContain('defaultIsExpanded');
  });
});
