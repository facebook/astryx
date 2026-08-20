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
  it('rewrites a bare defaultIsExpanded to collapsible', async () => {
    const output = await apply(
      TRANSFORM,
      `${IMPORT}const el = <Banner status="info" title="T" defaultIsExpanded><p>d</p></Banner>;`,
    );
    expect(output).toContain('collapsible');
    expect(output).not.toContain('defaultIsExpanded');
    // Open by default is `collapsible` on its own — no config object needed.
    expect(output).not.toContain('defaultIsOpen');
  });

  it('rewrites defaultIsExpanded={true} to collapsible', async () => {
    const output = await apply(
      TRANSFORM,
      `${IMPORT}const el = <Banner status="info" title="T" defaultIsExpanded={true}><p>d</p></Banner>;`,
    );
    expect(output).toContain('collapsible');
    expect(output).not.toContain('defaultIsExpanded');
    expect(output).not.toContain('defaultIsOpen');
  });

  it('rewrites defaultIsExpanded={false} to a collapsed config', async () => {
    const output = await apply(
      TRANSFORM,
      `${IMPORT}const el = <Banner status="info" title="T" defaultIsExpanded={false}><p>d</p></Banner>;`,
    );
    expect(output).toContain('collapsible={{');
    expect(output).toContain('defaultIsOpen: false');
    expect(output).not.toContain('defaultIsExpanded');
  });

  it('keeps a dynamic default dynamic', async () => {
    const output = await apply(
      TRANSFORM,
      `${IMPORT}const el = <Banner status="info" title="T" defaultIsExpanded={isOpen}><p>d</p></Banner>;`,
    );
    expect(output).toContain('defaultIsOpen: isOpen');
    expect(output).not.toContain('defaultIsExpanded');
  });

  it('preserves the implicit collapse for children with no prop', async () => {
    const output = await apply(
      TRANSFORM,
      `${IMPORT}const el = <Banner status="error" title="T"><ul><li>a</li></ul></Banner>;`,
    );
    // The old default hid these children, so the rewrite has to say so.
    expect(output).toContain('defaultIsOpen: false');
  });

  it.each([['{false}'], ['{null}'], ['{undefined}'], ["{''}"]])(
    'leaves an empty slot (%s) alone',
    async slot => {
      // `isRenderable` rejects these, so the old Banner drew no chevron and
      // hid nothing. Marking them collapsed would invent an affordance.
      const source = `${IMPORT}const el = <Banner status="info" title="T">${slot}</Banner>;`;
      const output = await apply(TRANSFORM, source);
      expect(output).toBe(source);
    },
  );

  it('leaves a childless banner alone', async () => {
    const source = `${IMPORT}const el = <Banner status="info" title="T" />;`;
    const output = await apply(TRANSFORM, source);
    expect(output).toBe(source);
  });

  it('treats whitespace-only children as no children', async () => {
    const source = `${IMPORT}const el = <Banner status="info" title="T">\n  </Banner>;`;
    const output = await apply(TRANSFORM, source);
    expect(output).toBe(source);
  });

  it('leaves a banner that already uses collapsible alone', async () => {
    const source = `${IMPORT}const el = <Banner status="info" title="T" collapsible><p>d</p></Banner>;`;
    const output = await apply(TRANSFORM, source);
    expect(output).toBe(source);
  });

  it('does not guess around a spread', async () => {
    const source = `${IMPORT}const el = <Banner status="info" title="T" {...rest}><p>d</p></Banner>;`;
    const output = await apply(TRANSFORM, source);
    expect(output).toBe(source);
  });

  it("leaves another component's defaultIsExpanded alone", async () => {
    // ChatToolCalls has a prop of the same name that this migration must not
    // touch, and a local component may be called Banner too.
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

  it('migrates a Banner imported from the package root', async () => {
    const output = await apply(
      TRANSFORM,
      `import {Banner, Button} from '@astryxdesign/core';
const el = <Banner status="info" title="T" defaultIsExpanded={false}><p>d</p></Banner>;`,
    );
    expect(output).toContain('defaultIsOpen: false');
    expect(output).not.toContain('defaultIsExpanded');
  });
});
