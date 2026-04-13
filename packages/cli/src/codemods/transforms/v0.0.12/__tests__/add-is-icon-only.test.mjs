import {describe, it, expect} from 'vitest';

async function applyTransform(source, filePath = 'test.tsx') {
  const {default: transform} = await import('../add-is-icon-only.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const j = filePath.endsWith('.ts') || filePath.endsWith('.tsx') ? jscodeshift.withParser('tsx') : jscodeshift;
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  return transform({source, path: filePath}, api) ?? source;
}

describe('add-is-icon-only', () => {
  it('converts icon-only button to XDSIconButton', async () => {
    const input = `import {XDSButton} from '@xds/core/Button';
<XDSButton label="Settings" icon={<GearIcon />} variant="ghost" />`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSIconButton');
    expect(output).not.toContain('XDSButton');
    expect(output).toContain('@xds/core/IconButton');
  });

  it('skips button with JSX children', async () => {
    const input = '<XDSButton label="Save" icon={<SaveIcon />}>Save</XDSButton>';
    expect(await applyTransform(input)).not.toContain('XDSIconButton');
  });

  it('skips button with children prop', async () => {
    const input = '<XDSButton label="Save" icon={<SaveIcon />} children="Save" />';
    expect(await applyTransform(input)).not.toContain('XDSIconButton');
  });

  it('skips button without icon', async () => {
    const input = '<XDSButton label="Submit" variant="primary" />';
    expect(await applyTransform(input)).not.toContain('XDSIconButton');
  });

  it('skips button that already has isIconOnly', async () => {
    const input = '<XDSButton label="Settings" icon={<GearIcon />} isIconOnly />';
    expect(await applyTransform(input)).toBe(input);
  });

  it('handles multiple buttons — converts only icon-only ones', async () => {
    const input = `import {XDSButton} from '@xds/core/Button';
<>
  <XDSButton label="A" icon={<I />} />
  <XDSButton label="B" />
  <XDSButton label="C" icon={<I />} />
</>`;
    const output = await applyTransform(input);
    expect((output.match(/XDSIconButton/g) || []).length).toBeGreaterThanOrEqual(2);
    // XDSButton should remain for the non-icon-only one
    expect(output).toContain('XDSButton');
  });

  it('does NOT convert XDSToggleButton', async () => {
    const input = '<XDSToggleButton label="Bold" icon={<B />} value="bold" />';
    expect(await applyTransform(input)).not.toContain('XDSIconButton');
  });

  it('removes redundant children matching label', async () => {
    const input = '<XDSButton label="Save" icon={<SaveIcon />}>Save</XDSButton>';
    const output = await applyTransform(input);
    expect(output).not.toContain('>Save<');
    expect(output).toContain('/>');
  });

  it('preserves children differing from label', async () => {
    const input = '<XDSButton label="Close dialog" icon={<X />}>Close</XDSButton>';
    expect(await applyTransform(input)).toContain('>Close<');
  });

  it('adds isIconOnly to DropdownMenu button object', async () => {
    const input = "<XDSDropdownMenu button={{ label: 'More', icon: <I /> }} items={[]} />";
    expect(await applyTransform(input)).toContain('isIconOnly: true');
  });

  it('skips DropdownMenu button object with children', async () => {
    const input = "<XDSDropdownMenu button={{ label: 'X', icon: <I />, children: 'X' }} items={[]} />";
    expect(await applyTransform(input)).not.toContain('isIconOnly');
  });

  it('skips unrelated components', async () => {
    const input = '<XDSAvatar icon={<P />} name="U" />';
    expect(await applyTransform(input)).not.toContain('XDSIconButton');
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import('../add-is-icon-only.mjs');
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const result = transform({source: '<XDSButton label="X" />', path: 'test.tsx'}, {jscodeshift: j, stats: () => {}, report: () => {}});
    expect(result).toBeUndefined();
  });

  it('removes endContent when converting to XDSIconButton', async () => {
    const input = `import {XDSButton} from '@xds/core/Button';
<XDSButton label="X" icon={<I />} endContent={<Badge />} />`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSIconButton');
    expect(output).not.toContain('endContent');
  });

  it('replaces Button import when no XDSButton usage remains', async () => {
    const input = `import {XDSButton} from '@xds/core/Button';
<XDSButton label="X" icon={<I />} />`;
    const output = await applyTransform(input);
    expect(output).toContain('@xds/core/IconButton');
    expect(output).not.toContain('@xds/core/Button');
  });

  it('keeps Button import when XDSButton still used', async () => {
    const input = `import {XDSButton} from '@xds/core/Button';
<><XDSButton label="A" icon={<I />} /><XDSButton label="B" variant="primary" /></>`;
    const output = await applyTransform(input);
    expect(output).toContain('@xds/core/Button');
    expect(output).toContain('@xds/core/IconButton');
  });

  it('adds XDSIconButton to barrel import', async () => {
    const input = `import {XDSButton, XDSBadge} from '@xds/core';
<XDSButton label="X" icon={<I />} />`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSIconButton');
    expect(output).toContain("from '@xds/core'");
  });

  it('updates closing tag for non-self-closing elements', async () => {
    const input = `import {XDSButton} from '@xds/core/Button';
<XDSButton label="X" icon={<I />}></XDSButton>`;
    const output = await applyTransform(input);
    expect(output).toContain('</XDSIconButton>');
  });
});
