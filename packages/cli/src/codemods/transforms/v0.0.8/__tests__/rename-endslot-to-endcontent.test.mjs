import {describe, it, expect} from 'vitest';

async function applyTransform(source, filePath = 'test.tsx') {
  const {default: transform} = await import(
    '../rename-endslot-to-endcontent.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const j = filePath.endsWith('.ts') || filePath.endsWith('.tsx')
    ? jscodeshift.withParser('tsx')
    : jscodeshift;
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: filePath};
  const result = transform(file, api);
  return result ?? source;
}

describe('rename-endslot-to-endcontent', () => {
  // JSX prop renames
  it('renames endSlot to endContent on XDSButton', async () => {
    const input = '<XDSButton label="Messages" endSlot={<XDSBadge label={3} />} />';
    const output = await applyTransform(input);
    expect(output).toContain('endContent={<XDSBadge label={3} />}');
    expect(output).not.toContain('endSlot');
  });

  it('handles endSlot with expression values', async () => {
    const input = '<XDSButton label="Edit" endSlot={badge} />';
    const output = await applyTransform(input);
    expect(output).toContain('endContent={badge}');
  });

  it('preserves other props', async () => {
    const input = '<XDSButton label="Edit" icon={<PencilIcon />} endSlot={<XDSBadge label="New" />}>Edit</XDSButton>';
    const output = await applyTransform(input);
    expect(output).toContain('endContent=');
    expect(output).toContain('label="Edit"');
    expect(output).toContain('icon={<PencilIcon />}');
    expect(output).toContain('>Edit</XDSButton>');
  });

  it('does not rename endContent (already migrated)', async () => {
    const input = '<XDSButton label="Messages" endContent={<XDSBadge label={3} />} />';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  // Object property renames (e.g., DropdownMenu button prop)
  it('renames endSlot in object literals', async () => {
    const input = `<XDSDropdownMenu button={{ label: "Actions", endSlot: <XDSBadge label={3} /> }} items={[]} />`;
    const output = await applyTransform(input);
    expect(output).toContain('endContent:');
    expect(output).not.toContain('endSlot');
  });

  it('renames endSlot in standalone objects', async () => {
    const input = `const props = { label: "Test", endSlot: badge };`;
    const output = await applyTransform(input);
    expect(output).toContain('endContent: badge');
    expect(output).not.toContain('endSlot');
  });

  // Destructuring renames
  it('renames endSlot in destructuring (shorthand)', async () => {
    const input = `const { label, endSlot } = props;`;
    const output = await applyTransform(input);
    expect(output).toContain('endContent');
    expect(output).not.toContain('endSlot');
  });

  it('renames endSlot in destructuring (with rename)', async () => {
    const input = `const { endSlot: mySlot } = props;`;
    const output = await applyTransform(input);
    expect(output).toContain('endContent: mySlot');
    expect(output).not.toContain('endSlot');
  });

  // Should not touch unrelated components
  it('renames endSlot on any component (covers wrappers)', async () => {
    const input = '<MyButton endSlot={<Icon />} />';
    const output = await applyTransform(input);
    expect(output).toContain('endContent=');
  });

  // No-op
  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import(
      '../rename-endslot-to-endcontent.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const source = '<XDSButton label="Messages" endContent={<XDSBadge label={3} />} />';
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });
});
