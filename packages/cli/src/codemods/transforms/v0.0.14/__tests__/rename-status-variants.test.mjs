// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../rename-status-variants.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('rename-status-variants', () => {
  it('renames StatusDot variant="positive" to "success"', async () => {
    const input = `<XDSStatusDot variant="positive" label="Online" />`;
    const output = await applyTransform(input);
    expect(output).toContain("'success'");
    expect(output).not.toContain("'positive'");
  });

  it('renames StatusDot variant="negative" to "error"', async () => {
    const input = `<XDSStatusDot variant="negative" label="Offline" />`;
    const output = await applyTransform(input);
    expect(output).toContain("'error'");
    expect(output).not.toContain("'negative'");
  });

  it('renames StatusDot variant="info" to "accent"', async () => {
    const input = `<XDSStatusDot variant="info" label="Info" />`;
    const output = await applyTransform(input);
    expect(output).toContain("'accent'");
    expect(output).not.toContain("'info'");
  });

  it('renames AvatarStatusDot variant="positive" to "success"', async () => {
    const input = `<XDSAvatarStatusDot variant="positive" label="Online" />`;
    const output = await applyTransform(input);
    expect(output).toContain("'success'");
    expect(output).not.toContain("'positive'");
  });

  it('renames Icon color="positive" to "success"', async () => {
    const input = `<XDSIcon color="positive" icon={CheckIcon} />`;
    const output = await applyTransform(input);
    expect(output).toContain("'success'");
    expect(output).not.toContain("'positive'");
  });

  it('renames Icon color="negative" to "error"', async () => {
    const input = `<XDSIcon color="negative" icon={XIcon} />`;
    const output = await applyTransform(input);
    expect(output).toContain("'error'");
    expect(output).not.toContain("'negative'");
  });

  it('renames ProgressBar variant="positive" to "success"', async () => {
    const input = `<XDSProgressBar variant="positive" value={50} />`;
    const output = await applyTransform(input);
    expect(output).toContain("'success'");
    expect(output).not.toContain("'positive'");
  });

  it('renames ProgressBar variant="negative" to "error"', async () => {
    const input = `<XDSProgressBar variant="negative" value={50} />`;
    const output = await applyTransform(input);
    expect(output).toContain("'error'");
    expect(output).not.toContain("'negative'");
  });

  it('handles expression container: variant={"positive"}', async () => {
    const input = `<XDSStatusDot variant={'positive'} label="Online" />`;
    const output = await applyTransform(input);
    expect(output).toContain("'success'");
    expect(output).not.toContain("'positive'");
  });

  it('handles ternary: variant={x ? "positive" : "negative"}', async () => {
    const input = `<XDSStatusDot variant={isOnline ? 'positive' : 'negative'} label="Status" />`;
    const output = await applyTransform(input);
    expect(output).toContain("'success'");
    expect(output).toContain("'error'");
    expect(output).not.toContain("'positive'");
    expect(output).not.toContain("'negative'");
  });

  it('renames object property values in files importing target components', async () => {
    const input = `import { XDSStatusDot } from '@xds/core/StatusDot';
const args = { variant: 'positive' };`;
    const output = await applyTransform(input);
    expect(output).toContain("'success'");
    expect(output).not.toContain("'positive'");
  });

  it('renames Storybook argType options arrays', async () => {
    const input = `import { XDSStatusDot } from '@xds/core/StatusDot';
const meta = { argTypes: { variant: { options: ['positive', 'negative', 'warning', 'info', 'neutral'] } } };`;
    const output = await applyTransform(input);
    expect(output).toContain("'success'");
    expect(output).toContain("'error'");
    expect(output).toContain("'accent'");
    expect(output).not.toContain("'positive'");
    expect(output).not.toContain("'negative'");
    expect(output).not.toContain("'info'");
    // warning and neutral are unchanged
    expect(output).toContain("'warning'");
    expect(output).toContain("'neutral'");
  });

  it('does not touch unrelated components', async () => {
    const input = `<XDSBadge variant="info" label="New" />`;
    const output = await applyTransform(input);
    // XDSBadge is not in the target list
    expect(output).toContain('info');
  });

  it('does not touch unrelated props on target components', async () => {
    const input = `<XDSStatusDot variant="positive" label="positive result" />`;
    const output = await applyTransform(input);
    expect(output).toContain("'success'");
    // The label "positive result" should NOT be renamed
    expect(output).toContain('positive result');
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import(
      '../rename-status-variants.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const source = `<XDSStatusDot variant='success' label='Online' />`;
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('handles a full component file', async () => {
    const input = `import { XDSStatusDot } from '@xds/core/StatusDot';
import { XDSIcon } from '@xds/core/Icon';

function StatusIndicator({ isOnline }: { isOnline: boolean }) {
  return (
    <div>
      <XDSStatusDot
        variant={isOnline ? 'positive' : 'negative'}
        label={isOnline ? 'Online' : 'Offline'}
      />
      <XDSIcon
        icon={isOnline ? CheckIcon : XIcon}
        color={isOnline ? 'positive' : 'negative'}
      />
    </div>
  );
}`;
    const output = await applyTransform(input);
    expect(output).toContain("'success'");
    expect(output).toContain("'error'");
    expect(output).not.toContain("'positive'");
    expect(output).not.toContain("'negative'");
  });
});
