// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../migrate-badge-children-to-label.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('migrate-badge-children-to-label', () => {
  it('moves text children to a label prop and self-closes', async () => {
    const out = await applyTransform(
      `import {XDSBadge} from '@xds/core';\nexport const A = () => <XDSBadge variant="success">Active</XDSBadge>;`,
    );
    expect(out).toContain("label='Active'");
    expect(out).toContain('variant="success"');
    expect(out).not.toMatch(/>Active</);
  });

  it('wraps a numeric/expression child in an expression container', async () => {
    const out = await applyTransform(
      `import {XDSBadge} from '@xds/core';\nexport const B = () => <XDSBadge>{count}</XDSBadge>;`,
    );
    expect(out).toContain('label={count}');
  });

  it('does not add a duplicate label when one already exists', async () => {
    // Regression: the codemod pushed a `label` attr unconditionally, producing
    // an invalid `<XDSBadge label="x" label="Active" />` duplicate prop.
    const input = `import {XDSBadge} from '@xds/core';\nexport const C = () => <XDSBadge label="x">Active</XDSBadge>;`;
    const out = await applyTransform(input);
    expect(out).toBe(input); // unchanged — the existing label wins
    expect(out.match(/label/g)).toHaveLength(1);
  });

  it('skips JSX element children (only text/expression migrate)', async () => {
    const input = `import {XDSBadge} from '@xds/core';\nexport const D = () => <XDSBadge><span>x</span></XDSBadge>;`;
    expect(await applyTransform(input)).toBe(input);
  });
});
