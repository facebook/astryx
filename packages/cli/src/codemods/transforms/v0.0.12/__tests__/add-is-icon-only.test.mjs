import {describe, it, expect} from 'vitest';

async function applyTransform(source, filePath = 'test.tsx') {
  const {default: transform} = await import('../add-is-icon-only.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const j = filePath.endsWith('.ts') || filePath.endsWith('.tsx') ? jscodeshift.withParser('tsx') : jscodeshift;
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  return transform({source, path: filePath}, api) ?? source;
}

describe('add-is-icon-only', () => {
  it('adds isIconOnly to icon-only button', async () => {
    const input = '<XDSButton label="Settings" icon={<GearIcon />} variant="ghost" />';
    expect(await applyTransform(input)).toContain('isIconOnly');
  });

  it('skips button with JSX children', async () => {
    const input = '<XDSButton label="Save" icon={<SaveIcon />}>Save</XDSButton>';
    expect(await applyTransform(input)).not.toContain('isIconOnly');
  });

  it('skips button with children prop', async () => {
    const input = '<XDSButton label="Save" icon={<SaveIcon />} children="Save" />';
    expect(await applyTransform(input)).not.toContain('isIconOnly');
  });

  it('skips button without icon', async () => {
    const input = '<XDSButton label="Submit" variant="primary" />';
    expect(await applyTransform(input)).not.toContain('isIconOnly');
  });

  it('skips button that already has isIconOnly', async () => {
    const input = '<XDSButton label="Settings" icon={<GearIcon />} isIconOnly />';
    expect(await applyTransform(input)).toBe(input);
  });

  it('handles multiple buttons', async () => {
    const input = '<>\n  <XDSButton label="A" icon={<I />} />\n  <XDSButton label="B" />\n  <XDSButton label="C" icon={<I />} />\n</>';
    expect((await applyTransform(input)).match(/isIconOnly/g)).toHaveLength(2);
  });

  it('adds isIconOnly to XDSToggleButton', async () => {
    const input = '<XDSToggleButton label="Bold" icon={<B />} value="bold" />';
    expect(await applyTransform(input)).toContain('isIconOnly');
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
    expect(await applyTransform(input)).not.toContain('isIconOnly');
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import('../add-is-icon-only.mjs');
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const result = transform({source: '<XDSButton label="X" />', path: 'test.tsx'}, {jscodeshift: j, stats: () => {}, report: () => {}});
    expect(result).toBeUndefined();
  });
});
