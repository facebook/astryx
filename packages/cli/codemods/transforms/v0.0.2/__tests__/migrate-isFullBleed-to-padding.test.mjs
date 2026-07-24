// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../migrate-isFullBleed-to-padding.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('migrate-isFullBleed-to-padding', () => {
  it('converts isFullBleed (no value) to padding={0} on XDSCard', async () => {
    const input = '<XDSCard isFullBleed>Content</XDSCard>';
    const output = await applyTransform(input);
    expect(output).toContain('padding={0}');
    expect(output).not.toContain('isFullBleed');
  });

  it('converts isFullBleed={true} to padding={0} on XDSCard', async () => {
    const input = '<XDSCard isFullBleed={true}>Content</XDSCard>';
    const output = await applyTransform(input);
    expect(output).toContain('padding={0}');
    expect(output).not.toContain('isFullBleed');
  });

  it('removes isFullBleed={false} on XDSCard', async () => {
    const input = '<XDSCard isFullBleed={false}>Content</XDSCard>';
    const output = await applyTransform(input);
    expect(output).not.toContain('isFullBleed');
    expect(output).not.toContain('padding');
  });

  it('converts isFullBleed on XDSSection', async () => {
    const input = '<XDSSection isFullBleed>Content</XDSSection>';
    const output = await applyTransform(input);
    expect(output).toContain('padding={0}');
    expect(output).not.toContain('isFullBleed');
  });

  it('converts isFullBleed on XDSLayout', async () => {
    const input = '<XDSLayout isFullBleed content={<div />} />';
    const output = await applyTransform(input);
    expect(output).toContain('padding={0}');
    expect(output).not.toContain('isFullBleed');
  });

  it('converts isFullBleed on XDSLayoutContent', async () => {
    const input = '<XDSLayoutContent isFullBleed><div /></XDSLayoutContent>';
    const output = await applyTransform(input);
    expect(output).toContain('padding={0}');
    expect(output).not.toContain('isFullBleed');
  });

  it('converts isFullBleed on XDSLayoutHeader', async () => {
    const input = '<XDSLayoutHeader isFullBleed>Header</XDSLayoutHeader>';
    const output = await applyTransform(input);
    expect(output).toContain('padding={0}');
    expect(output).not.toContain('isFullBleed');
  });

  it('converts isFullBleed on XDSLayoutFooter', async () => {
    const input = '<XDSLayoutFooter isFullBleed>Footer</XDSLayoutFooter>';
    const output = await applyTransform(input);
    expect(output).toContain('padding={0}');
    expect(output).not.toContain('isFullBleed');
  });

  it('converts isFullBleed on XDSLayoutPanel', async () => {
    const input = '<XDSLayoutPanel isFullBleed><nav /></XDSLayoutPanel>';
    const output = await applyTransform(input);
    expect(output).toContain('padding={0}');
    expect(output).not.toContain('isFullBleed');
  });

  it('does NOT convert isFullBleed on XDSDivider', async () => {
    const input = '<XDSDivider isFullBleed />';
    const output = await applyTransform(input);
    expect(output).toContain('isFullBleed');
    expect(output).not.toContain('padding');
  });

  it('does NOT convert isFullBleed on unknown components', async () => {
    const input = '<CustomComponent isFullBleed />';
    const output = await applyTransform(input);
    expect(output).toContain('isFullBleed');
    expect(output).not.toContain('padding');
  });

  it('handles multiple components in one file', async () => {
    const input = `
      <div>
        <XDSCard isFullBleed>Card</XDSCard>
        <XDSSection isFullBleed={true}>Section</XDSSection>
        <XDSDivider isFullBleed />
      </div>
    `;
    const output = await applyTransform(input);
    expect(output).not.toContain('isFullBleed>Card');
    expect(output).not.toContain('isFullBleed={true}>Section');
    // Divider's isFullBleed should remain
    expect(output).toContain('isFullBleed');
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import(
      '../migrate-isFullBleed-to-padding.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const api = {jscodeshift, stats: () => {}, report: () => {}};
    const source = '<XDSCard padding={0}>Content</XDSCard>';
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('preserves other props', async () => {
    const input = '<XDSCard isFullBleed width={400} height={300}>Content</XDSCard>';
    const output = await applyTransform(input);
    expect(output).toContain('padding={0}');
    expect(output).toContain('width={400}');
    expect(output).toContain('height={300}');
    expect(output).not.toContain('isFullBleed');
  });

  it('does not add padding={0} if padding already exists', async () => {
    const input = '<XDSCard isFullBleed padding={2}>Content</XDSCard>';
    const output = await applyTransform(input);
    expect(output).not.toContain('isFullBleed');
    // Should keep existing padding, not add another
    const paddingMatches = output.match(/padding=/g);
    expect(paddingMatches).toHaveLength(1);
  });
});
