// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../rename-stack-element-to-as.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('rename-stack-element-to-as', () => {
  it('renames element to as on XDSStack', async () => {
    const input = `<XDSStack element="nav">Content</XDSStack>`;
    const output = await applyTransform(input);
    expect(output).toContain('as="nav"');
    expect(output).not.toContain('element=');
  });

  it('renames element to as on XDSHStack', async () => {
    const input = `<XDSHStack element="section">Content</XDSHStack>`;
    const output = await applyTransform(input);
    expect(output).toContain('as="section"');
    expect(output).not.toContain('element=');
  });

  it('renames element to as on XDSVStack', async () => {
    const input = `<XDSVStack element="main">Content</XDSVStack>`;
    const output = await applyTransform(input);
    expect(output).toContain('as="main"');
    expect(output).not.toContain('element=');
  });

  it('renames element to as on XDSStackItem', async () => {
    const input = `<XDSStackItem element="li">Content</XDSStackItem>`;
    const output = await applyTransform(input);
    expect(output).toContain('as="li"');
    expect(output).not.toContain('element=');
  });

  it('handles multiple components in one file', async () => {
    const input = `<XDSHStack element="nav"><XDSStackItem element="li">Item</XDSStackItem></XDSHStack>`;
    const output = await applyTransform(input);
    expect(output).toContain('<XDSHStack as="nav"');
    expect(output).toContain('<XDSStackItem as="li"');
    expect(output).not.toContain('element=');
  });

  it('does not touch unrelated components', async () => {
    const input = `<XDSButton element="a">Link</XDSButton>`;
    const output = await applyTransform(input);
    expect(output).toContain('element="a"');
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import(
      '../rename-stack-element-to-as.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const source = `<XDSStack as="nav">Content</XDSStack>`;
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });
});
