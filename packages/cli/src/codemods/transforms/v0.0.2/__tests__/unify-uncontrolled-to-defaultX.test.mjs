import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../unify-uncontrolled-to-defaultX.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('unify-uncontrolled-to-defaultX', () => {
  it('renames initialIsSideNavCollapsed on XDSAppShell', async () => {
    const input = '<XDSAppShell initialIsSideNavCollapsed={true} />';
    const output = await applyTransform(input);
    expect(output).toContain('defaultIsSideNavCollapsed={true}');
    expect(output).not.toContain('initialIsSideNavCollapsed');
  });

  it('renames initialIsOpen on XDSCollapsible', async () => {
    const input = '<XDSCollapsible initialIsOpen={false} title="Section" />';
    const output = await applyTransform(input);
    expect(output).toContain('defaultIsOpen={false}');
    expect(output).not.toContain('initialIsOpen');
  });

  it('renames initialIsExpanded on XDSBanner', async () => {
    const input = '<XDSBanner initialIsExpanded={true} />';
    const output = await applyTransform(input);
    expect(output).toContain('defaultIsExpanded={true}');
    expect(output).not.toContain('initialIsExpanded');
  });

  it('preserves other props', async () => {
    const input = '<XDSAppShell initialIsSideNavCollapsed={true} topNav={<Nav />} />';
    const output = await applyTransform(input);
    expect(output).toContain('defaultIsSideNavCollapsed={true}');
    expect(output).toContain('topNav={<Nav />}');
  });

  it('does not rename initialIsOpen on non-XDS components', async () => {
    const input = '<Collapsible initialIsOpen={true} />';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not rename unrelated props on XDS components', async () => {
    const input = '<XDSAppShell topNav={<Nav />} />';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import(
      '../unify-uncontrolled-to-defaultX.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const api = {jscodeshift, stats: () => {}, report: () => {}};
    const source = '<XDSCollapsible defaultIsOpen={true} />';
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('handles multiple components in one file', async () => {
    const input = `
      <div>
        <XDSCollapsible initialIsOpen={true} />
        <XDSBanner initialIsExpanded={false} />
      </div>
    `;
    const output = await applyTransform(input);
    expect(output).toContain('defaultIsOpen={true}');
    expect(output).toContain('defaultIsExpanded={false}');
  });
});
