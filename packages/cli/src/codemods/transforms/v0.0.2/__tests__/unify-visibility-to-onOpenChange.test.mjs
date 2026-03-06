import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../unify-visibility-to-onOpenChange.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('unify-visibility-to-onOpenChange', () => {
  // Simple renames
  it('renames onHide to onOpenChange on XDSDialog', async () => {
    const input = '<XDSDialog onHide={handleHide} />';
    const output = await applyTransform(input);
    expect(output).toContain('onOpenChange={handleHide}');
    expect(output).not.toContain('onHide');
  });

  it('renames onHide to onOpenChange on XDSDialogHeader', async () => {
    const input = '<XDSDialogHeader onHide={close} title="Test" />';
    const output = await applyTransform(input);
    expect(output).toContain('onOpenChange={close}');
    expect(output).not.toContain('onHide');
  });

  it('renames onHide to onOpenChange on XDSCommandPalette', async () => {
    const input = '<XDSCommandPalette onHide={() => setOpen(false)} />';
    const output = await applyTransform(input);
    expect(output).toContain('onOpenChange=');
    expect(output).not.toContain('onHide');
  });

  it('renames onClose to onOpenChange on XDSMobileNav', async () => {
    const input = '<XDSMobileNav onClose={handleClose} />';
    const output = await applyTransform(input);
    expect(output).toContain('onOpenChange={handleClose}');
    expect(output).not.toContain('onClose');
  });

  it('renames onMenuToggle to onOpenChange on XDSDropdownMenu', async () => {
    const input = '<XDSDropdownMenu onMenuToggle={toggle} />';
    const output = await applyTransform(input);
    expect(output).toContain('onOpenChange={toggle}');
    expect(output).not.toContain('onMenuToggle');
  });

  it('renames onToggle to onOpenChange on XDSPopover', async () => {
    const input = '<XDSPopover onToggle={handleToggle} />';
    const output = await applyTransform(input);
    expect(output).toContain('onOpenChange={handleToggle}');
    expect(output).not.toContain('onToggle');
  });

  it('renames onToggle to onOpenChange on XDSCollapsibleGroup', async () => {
    const input = '<XDSCollapsibleGroup onToggle={handleToggle} />';
    const output = await applyTransform(input);
    expect(output).toContain('onOpenChange={handleToggle}');
    expect(output).not.toContain('onToggle');
  });

  // Merge components — single prop
  it('renames onShow to onOpenChange on XDSHoverCard when only onShow', async () => {
    const input = '<XDSHoverCard onShow={handleShow} />';
    const output = await applyTransform(input);
    expect(output).toContain('onOpenChange={handleShow}');
    expect(output).not.toContain('onShow');
  });

  it('renames onHide to onOpenChange on XDSTooltip when only onHide', async () => {
    const input = '<XDSTooltip onHide={handleHide} />';
    const output = await applyTransform(input);
    expect(output).toContain('onOpenChange={handleHide}');
    expect(output).not.toContain('onHide');
  });

  // Merge components — both props
  it('adds TODO comment on XDSHoverCard when both onShow and onHide exist', async () => {
    const input = '<XDSHoverCard onShow={show} onHide={hide} />';
    const output = await applyTransform(input);
    expect(output).toContain('TODO');
    // Both props should remain
    expect(output).toContain('onShow');
    expect(output).toContain('onHide');
  });

  it('adds TODO comment on XDSTooltip when both onShow and onHide exist', async () => {
    const input = '<XDSTooltip onShow={show} onHide={hide} content="tip" />';
    const output = await applyTransform(input);
    expect(output).toContain('TODO');
    expect(output).toContain('onShow');
    expect(output).toContain('onHide');
  });

  // Negative cases
  it('does not rename onHide on non-XDS components', async () => {
    const input = '<Dialog onHide={handleHide} />';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not rename onToggle on non-XDS components', async () => {
    const input = '<Popover onToggle={handleToggle} />';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import(
      '../unify-visibility-to-onOpenChange.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const api = {jscodeshift, stats: () => {}, report: () => {}};
    const source = '<XDSDialog onOpenChange={handleChange} />';
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('handles multiple components in one file', async () => {
    const input = `
      <div>
        <XDSDialog onHide={close} />
        <XDSPopover onToggle={toggle} />
      </div>
    `;
    const output = await applyTransform(input);
    expect(output).not.toContain('onHide');
    expect(output).not.toContain('onToggle');
    expect(output).toContain('onOpenChange={close}');
    expect(output).toContain('onOpenChange={toggle}');
  });
});
