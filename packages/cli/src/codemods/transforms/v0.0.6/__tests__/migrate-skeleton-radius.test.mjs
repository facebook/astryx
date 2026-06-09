// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import('../migrate-skeleton-radius.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('migrate-skeleton-radius', () => {
  it('converts radius="container" to radius={3}', async () => {
    const input = '<XDSSkeleton radius="container" />';
    const output = await applyTransform(input);
    expect(output).toContain('radius={3}');
    expect(output).not.toContain('"container"');
  });

  it('converts radius="element" to radius={2}', async () => {
    const input = '<XDSSkeleton radius="element" />';
    const output = await applyTransform(input);
    expect(output).toContain('radius={2}');
  });

  it('converts radius="content" to radius={1}', async () => {
    const input = '<XDSSkeleton radius="content" />';
    const output = await applyTransform(input);
    expect(output).toContain('radius={1}');
  });

  it('converts radius="inner" to radius={0}', async () => {
    const input = '<XDSSkeleton radius="inner" />';
    const output = await applyTransform(input);
    expect(output).toContain('radius={0}');
  });

  it('converts radius={"container"} expression to radius={3}', async () => {
    const input = '<XDSSkeleton radius={"container"} />';
    const output = await applyTransform(input);
    expect(output).toContain('radius={3}');
  });

  it('does not change radius="none"', async () => {
    const input = '<XDSSkeleton radius="none" />';
    const output = await applyTransform(input);
    expect(output).toContain('radius="none"');
  });

  it('does not change radius="rounded"', async () => {
    const input = '<XDSSkeleton radius="rounded" />';
    const output = await applyTransform(input);
    expect(output).toContain('radius="rounded"');
  });

  it('does not change radius={3}', async () => {
    const {default: transform} = await import('../migrate-skeleton-radius.mjs');
    const jscodeshift = (await import('jscodeshift')).default;
    const api = {jscodeshift, stats: () => {}, report: () => {}};
    const source = '<XDSSkeleton radius={3} />';
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('does not affect other components', async () => {
    const input = '<XDSCard radius="container" />';
    const {default: transform} = await import('../migrate-skeleton-radius.mjs');
    const jscodeshift = (await import('jscodeshift')).default;
    const api = {jscodeshift, stats: () => {}, report: () => {}};
    const result = transform({source: input, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });
});
