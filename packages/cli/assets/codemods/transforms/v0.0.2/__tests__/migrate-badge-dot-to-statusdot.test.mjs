// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../migrate-badge-dot-to-statusdot.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

function getRawResult(source) {
  return import('../migrate-badge-dot-to-statusdot.mjs').then(
    async ({default: transform}) => {
      const jscodeshift = (await import('jscodeshift')).default;
      const api = {jscodeshift, stats: () => {}, report: () => {}};
      return transform({source, path: 'test.tsx'}, api);
    },
  );
}

describe('migrate-badge-dot-to-statusdot', () => {
  it('transforms shape="dot" badge to StatusDot', async () => {
    const input = `import {XDSBadge} from '@xds/core/Badge';
<XDSBadge variant="warning" shape="dot" label="Away" />`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSStatusDot');
    expect(output).toContain('variant="warning"');
    expect(output).toContain('label="Away"');
    expect(output).not.toContain('shape');
    expect(output).not.toContain('XDSBadge');
  });

  it('maps success to positive and error to negative', async () => {
    const input = `import {XDSBadge} from '@xds/core/Badge';
<XDSBadge variant="success" shape="dot" label="Online" />`;
    const output = await applyTransform(input);
    expect(output).toContain('variant="positive"');

    const input2 = `import {XDSBadge} from '@xds/core/Badge';
<XDSBadge variant="error" shape="dot" label="Offline" />`;
    const output2 = await applyTransform(input2);
    expect(output2).toContain('variant="negative"');
  });

  it('does NOT transform badge without shape="dot"', async () => {
    const input = `import {XDSBadge} from '@xds/core/Badge';
<XDSBadge variant="error" label="3" />`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSBadge');
    expect(output).not.toContain('XDSStatusDot');
  });

  it('does NOT transform badge with icon prop even if shape="dot"', async () => {
    const input = `import {XDSBadge} from '@xds/core/Badge';
<XDSBadge variant="success" shape="dot" label="Active" icon={checkIcon} />`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSBadge');
    expect(output).not.toContain('XDSStatusDot');
  });

  it('adds StatusDot import', async () => {
    const input = `import {XDSBadge} from '@xds/core/Badge';
<XDSBadge variant="neutral" shape="dot" label="Idle" />`;
    const output = await applyTransform(input);
    expect(output).toMatch(/from ['"]@xds\/core\/StatusDot['"]/);
    expect(output).toContain('XDSStatusDot');
  });

  it('removes Badge import when no other usages remain', async () => {
    const input = `import {XDSBadge} from '@xds/core/Badge';
<XDSBadge variant="info" shape="dot" label="Info" />`;
    const output = await applyTransform(input);
    expect(output).not.toContain("from '@xds/core/Badge'");
    expect(output).not.toContain('XDSBadge');
  });

  it('keeps Badge import when mixed dot + pill usages exist', async () => {
    const input = `import {XDSBadge} from '@xds/core/Badge';
<div>
  <XDSBadge variant="error" shape="dot" label="Unread" />
  <XDSBadge variant="success" label="5" />
</div>`;
    const output = await applyTransform(input);
    expect(output).toContain("from '@xds/core/Badge'");
    expect(output).toMatch(/from ['"]@xds\/core\/StatusDot['"]/);
    // The dot mode one should be converted
    expect(output).toContain('XDSStatusDot');
    // The pill one should remain
    expect(output).toContain('XDSBadge');
  });

  it('does not transform non-XDS component with shape="dot"', async () => {
    const input = '<Badge variant="error" shape="dot" label="x" />';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('returns undefined when no changes needed', async () => {
    const result = await getRawResult('<XDSButton>Click</XDSButton>');
    expect(result).toBeUndefined();
  });

  it('preserves other props (xstyle, className, data-testid, ref)', async () => {
    const input = `import {XDSBadge} from '@xds/core/Badge';
<XDSBadge variant="error" shape="dot" label="Status" xstyle={styles.dot} className="my-badge" data-testid="status-dot" ref={badgeRef} />`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSStatusDot');
    expect(output).toContain('variant="negative"');
    expect(output).toContain('label="Status"');
    expect(output).toContain('xstyle={styles.dot}');
    expect(output).toContain('className="my-badge"');
    expect(output).toContain('data-testid="status-dot"');
    expect(output).toContain('ref={badgeRef}');
    expect(output).not.toContain('shape');
  });

  it('defaults to neutral when no variant prop', async () => {
    const input = `import {XDSBadge} from '@xds/core/Badge';
<XDSBadge shape="dot" label="Unknown" />`;
    const output = await applyTransform(input);
    expect(output).toContain('variant="neutral"');
    expect(output).toContain('label="Unknown"');
  });

  it('passes through label prop (not replaced with placeholder)', async () => {
    const input = `import {XDSBadge} from '@xds/core/Badge';
<XDSBadge variant="error" shape="dot" label="Unread" />`;
    const output = await applyTransform(input);
    expect(output).toContain('label="Unread"');
    expect(output).not.toContain('label="status"');
  });
});
