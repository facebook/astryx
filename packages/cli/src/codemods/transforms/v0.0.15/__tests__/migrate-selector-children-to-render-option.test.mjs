// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} =
    await import('../migrate-selector-children-to-render-option.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('migrate-selector-children-to-render-option', () => {
  it('moves XDSSelector function children to renderOption', async () => {
    const input = `import {XDSSelector} from '@xds/core/Selector';
<XDSSelector label="Role" options={options} value={value} onChange={setValue}>
  {option => <XDSSelectorOption label={option.label} />}
</XDSSelector>`;
    const output = await applyTransform(input);
    expect(output).toContain(
      'renderOption={option => <XDSSelectorOption label={option.label} />}',
    );
    expect(output).not.toContain('</XDSSelector>');
  });

  it('moves XDSMultiSelector function children to renderOption', async () => {
    const input = `import {XDSMultiSelector} from '@xds/core/MultiSelector';
<XDSMultiSelector label="Tags" options={options} value={value} onChange={setValue}>
  {option => <span>{option.label}</span>}
</XDSMultiSelector>`;
    const output = await applyTransform(input);
    expect(output).toContain(
      'renderOption={option => <span>{option.label}</span>}',
    );
    expect(output).not.toContain('</XDSMultiSelector>');
  });

  it('moves function-reference children to renderOption', async () => {
    const input = `import {XDSSelector} from '@xds/core';
<XDSSelector label="Queue" options={options} value={value} onChange={setValue}>
  {renderOption}
</XDSSelector>`;
    const output = await applyTransform(input);
    expect(output).toContain('renderOption={renderOption}');
    expect(output).not.toContain('</XDSSelector>');
  });

  it('renames explicit children prop to renderOption', async () => {
    const input = `import {XDSSelector} from '@xds/core/Selector';
<XDSSelector label="Queue" options={options} value={value} onChange={setValue} children={renderOption} />`;
    const output = await applyTransform(input);
    expect(output).toContain('renderOption={renderOption}');
    expect(output).not.toContain('children=');
  });

  it('handles aliased imports', async () => {
    const input = `import {XDSSelector as Selector} from '@xds/core/Selector';
<Selector label="Role" options={options} value={value} onChange={setValue}>
  {option => <span>{option.label}</span>}
</Selector>`;
    const output = await applyTransform(input);
    expect(output).toContain(
      'renderOption={option => <span>{option.label}</span>}',
    );
    expect(output).not.toContain('</Selector>');
  });

  it('handles namespace imports', async () => {
    const input = `import * as XDS from '@xds/core';
<XDS.XDSSelector label="Role" options={options} value={value} onChange={setValue}>
  {option => <span>{option.label}</span>}
</XDS.XDSSelector>`;
    const output = await applyTransform(input);
    expect(output).toContain(
      'renderOption={option => <span>{option.label}</span>}',
    );
    expect(output).not.toContain('</XDS.XDSSelector>');
  });

  it('skips selectors that already use renderOption', async () => {
    const input = `import {XDSSelector} from '@xds/core/Selector';
<XDSSelector label="Role" options={options} value={value} onChange={setValue} renderOption={renderOption}>
  {oldRenderOption}
</XDSSelector>`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not touch legacy @nest/xds selector item children', async () => {
    const input = `import {XDSSelector, XDSSelectorItem} from '@nest/xds';
<XDSSelector label="Role" value={value} onChange={setValue}>
  <XDSSelectorItem label="Admin" value="admin" />
</XDSSelector>`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not convert direct JSX children into renderOption', async () => {
    const input = `import {XDSSelector} from '@xds/core/Selector';
<XDSSelector label="Role" options={options} value={value} onChange={setValue}>
  <XDSSelectorOption label="Admin" />
</XDSSelector>`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });
});
