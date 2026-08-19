// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source, filePath = 'test.tsx') {
  const {default: transform} = await import('../remove-size-props.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const j =
    filePath.endsWith('.ts') || filePath.endsWith('.tsx')
      ? jscodeshift.withParser('tsx')
      : jscodeshift;
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: filePath};
  const result = transform(file, api);
  return result ?? source;
}

describe('remove-size-props', () => {
  // StatusDot
  it('removes size prop from XDSStatusDot', async () => {
    const input = '<XDSStatusDot variant="positive" label="Online" size="sm" />';
    const output = await applyTransform(input);
    expect(output).toBe('<XDSStatusDot variant="positive" label="Online" />');
  });

  it('removes size="md" from XDSStatusDot', async () => {
    const input = '<XDSStatusDot variant="positive" label="Online" size="md" />';
    const output = await applyTransform(input);
    expect(output).toBe('<XDSStatusDot variant="positive" label="Online" />');
  });

  it('removes size expression from XDSStatusDot', async () => {
    const input = '<XDSStatusDot variant="positive" label="Online" size={dotSize} />';
    const output = await applyTransform(input);
    expect(output).toBe('<XDSStatusDot variant="positive" label="Online" />');
  });

  // ProgressBar
  it('removes size prop from XDSProgressBar', async () => {
    const input = '<XDSProgressBar value={50} label="Progress" size="md" />';
    const output = await applyTransform(input);
    expect(output).toBe('<XDSProgressBar value={50} label="Progress" />');
  });

  it('removes size="sm" from XDSProgressBar', async () => {
    const input = '<XDSProgressBar value={50} label="Progress" size="sm" />';
    const output = await applyTransform(input);
    expect(output).toBe('<XDSProgressBar value={50} label="Progress" />');
  });

  it('removes size="lg" from XDSProgressBar', async () => {
    const input = '<XDSProgressBar value={50} label="Progress" size="lg" />';
    const output = await applyTransform(input);
    expect(output).toBe('<XDSProgressBar value={50} label="Progress" />');
  });

  // Preserves other props
  it('preserves all other props on StatusDot', async () => {
    const input = '<XDSStatusDot variant="warning" label="Away" size="sm" isPulsing />';
    const output = await applyTransform(input);
    expect(output).toContain('variant="warning"');
    expect(output).toContain('label="Away"');
    expect(output).toContain('isPulsing');
    expect(output).not.toContain('size');
  });

  it('preserves all other props on ProgressBar', async () => {
    const input = '<XDSProgressBar value={75} label="Upload" size="lg" variant="positive" hasValueLabel />';
    const output = await applyTransform(input);
    expect(output).toContain('value={75}');
    expect(output).toContain('label="Upload"');
    expect(output).toContain('variant="positive"');
    expect(output).toContain('hasValueLabel');
    expect(output).not.toContain('size');
  });

  // Does not touch unrelated components
  it('does not remove size from other components', async () => {
    const input = '<XDSButton size="md" label="Click" />';
    const output = await applyTransform(input);
    expect(output).toContain('size="md"');
  });

  it('does not remove size from XDSAvatar', async () => {
    const input = '<XDSAvatar size={48} name="Test" />';
    const output = await applyTransform(input);
    expect(output).toContain('size={48}');
  });

  // Type import cleanup
  it('removes XDSStatusDotSize type import', async () => {
    const input = `import type { XDSStatusDot, XDSStatusDotProps, XDSStatusDotSize } from '@xds/core/StatusDot';`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSStatusDot');
    expect(output).toContain('XDSStatusDotProps');
    expect(output).not.toContain('XDSStatusDotSize');
  });

  it('removes XDSProgressBarSize type import', async () => {
    const input = `import type { XDSProgressBar, XDSProgressBarSize } from '@xds/core/ProgressBar';`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSProgressBar');
    expect(output).not.toContain('XDSProgressBarSize');
  });

  it('removes entire import if only size type was imported', async () => {
    const input = `import type { XDSStatusDotSize } from '@xds/core/StatusDot';`;
    const output = await applyTransform(input);
    expect(output).not.toContain('import');
  });

  // No-op
  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import('../remove-size-props.mjs');
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const source = '<XDSStatusDot variant="positive" label="Online" />';
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('returns undefined for ProgressBar with no size', async () => {
    const {default: transform} = await import('../remove-size-props.mjs');
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const source = '<XDSProgressBar value={50} label="Test" />';
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  // Multiple instances
  it('removes size from multiple StatusDot instances', async () => {
    const input = `<>
  <XDSStatusDot variant="positive" label="Online" size="sm" />
  <XDSStatusDot variant="negative" label="Offline" size="md" />
</>`;
    const output = await applyTransform(input);
    expect(output).not.toContain('size');
    expect(output).toContain('variant="positive"');
    expect(output).toContain('variant="negative"');
  });
});
