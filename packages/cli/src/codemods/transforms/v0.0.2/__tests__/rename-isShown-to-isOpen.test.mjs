import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../rename-isShown-to-isOpen.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('rename-isShown-to-isOpen', () => {
  it('renames isShown on XDSDialog', async () => {
    const input = '<XDSDialog isShown={isShown} onOpenChange={handleChange}>Content</XDSDialog>';
    const output = await applyTransform(input);
    expect(output).toContain('isOpen={isShown}');
    expect(output).not.toContain('isShown=');
  });

  it('renames isShown on XDSCommandPalette', async () => {
    const input = '<XDSCommandPalette isShown={visible} onOpenChange={setVisible} />';
    const output = await applyTransform(input);
    expect(output).toContain('isOpen={visible}');
    expect(output).not.toContain('isShown=');
  });

  it('renames isShown on XDSPopover', async () => {
    const input = '<XDSPopover isShown={open} onOpenChange={setOpen} content={<div />}><button /></XDSPopover>';
    const output = await applyTransform(input);
    expect(output).toContain('isOpen={open}');
    expect(output).not.toContain('isShown=');
  });

  it('does not rename isShown on non-target components', async () => {
    const input = '<Modal isShown={true} />';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not rename isShown on other XDS components', async () => {
    const input = '<XDSTooltip isShown={true}><span /></XDSTooltip>';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('preserves other props', async () => {
    const input = '<XDSDialog isShown={shown} onOpenChange={setShown} width={600} purpose="info">Content</XDSDialog>';
    const output = await applyTransform(input);
    expect(output).toContain('isOpen={shown}');
    expect(output).toContain('onOpenChange={setShown}');
    expect(output).toContain('width={600}');
    expect(output).toContain('purpose="info"');
  });

  it('handles multiple target components in one file', async () => {
    const input = `
      <div>
        <XDSDialog isShown={a} onOpenChange={setA}>Dialog</XDSDialog>
        <XDSCommandPalette isShown={b} onOpenChange={setB} />
        <XDSPopover isShown={c} onOpenChange={setC} content={<div />}><button /></XDSPopover>
      </div>
    `;
    const output = await applyTransform(input);
    expect(output).not.toContain('isShown=');
    expect(output).toContain('isOpen={a}');
    expect(output).toContain('isOpen={b}');
    expect(output).toContain('isOpen={c}');
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import(
      '../rename-isShown-to-isOpen.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const api = {jscodeshift, stats: () => {}, report: () => {}};
    const source = '<XDSDialog isOpen={open} onOpenChange={setOpen}>Content</XDSDialog>';
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('handles boolean literal values', async () => {
    const input = '<XDSDialog isShown={true} onOpenChange={() => {}}>Content</XDSDialog>';
    const output = await applyTransform(input);
    expect(output).toContain('isOpen={true}');
    expect(output).not.toContain('isShown=');
  });

  it('handles ternary expressions', async () => {
    const input = '<XDSDialog isShown={condition ? true : false} onOpenChange={handler}>Content</XDSDialog>';
    const output = await applyTransform(input);
    expect(output).toContain('isOpen={condition ? true : false}');
    expect(output).not.toContain('isShown=');
  });
});
