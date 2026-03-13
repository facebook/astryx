import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../migrate-background-to-variant.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('migrate-background-to-variant', () => {
  it('renames background="wash" to variant="wash"', async () => {
    const input = '<XDSAppShell background="wash"><div /></XDSAppShell>';
    const output = await applyTransform(input);
    expect(output).toContain('variant="wash"');
    expect(output).not.toContain('background=');
  });

  it('renames background="surface" to variant="surface"', async () => {
    const input = '<XDSAppShell background="surface"><div /></XDSAppShell>';
    const output = await applyTransform(input);
    expect(output).toContain('variant="surface"');
    expect(output).not.toContain('background=');
  });

  it('renames background with expression to variant', async () => {
    const input = '<XDSAppShell background={bgValue}><div /></XDSAppShell>';
    const output = await applyTransform(input);
    expect(output).toContain('variant={bgValue}');
    expect(output).not.toContain('background=');
  });

  it('adds variant="surface" when no background prop exists', async () => {
    const input = '<XDSAppShell><div /></XDSAppShell>';
    const output = await applyTransform(input);
    expect(output).toContain('variant="surface"');
  });

  it('adds variant="surface" to self-closing element with no background', async () => {
    const input = '<XDSAppShell topNav={<nav />} />';
    const output = await applyTransform(input);
    expect(output).toContain('variant="surface"');
  });

  it('does not add variant if variant already exists', async () => {
    const input = '<XDSAppShell variant="section"><div /></XDSAppShell>';
    const output = await applyTransform(input);
    // Should be unchanged
    expect(output).toBe(input);
  });

  it('does not modify non-XDSAppShell components', async () => {
    const input = '<OtherComponent background="wash" />';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('preserves other props', async () => {
    const input = '<XDSAppShell background="wash" topNav={<TopNav />} sideNav={<SideNav />}><div /></XDSAppShell>';
    const output = await applyTransform(input);
    expect(output).toContain('variant="wash"');
    expect(output).toContain('topNav={<TopNav />}');
    expect(output).toContain('sideNav={<SideNav />}');
    expect(output).not.toContain('background=');
  });

  it('handles multiple XDSAppShell instances in one file', async () => {
    const input = `
      <div>
        <XDSAppShell background="wash"><div /></XDSAppShell>
        <XDSAppShell background="surface"><div /></XDSAppShell>
      </div>
    `;
    const output = await applyTransform(input);
    expect(output).not.toContain('background=');
    expect(output).toContain('variant="wash"');
    expect(output).toContain('variant="surface"');
  });

  it('handles ternary expression in background', async () => {
    const input = '<XDSAppShell background={isDark ? "wash" : "surface"}><div /></XDSAppShell>';
    const output = await applyTransform(input);
    expect(output).toContain('variant={isDark ? "wash" : "surface"}');
    expect(output).not.toContain('background=');
  });

  it('returns undefined when no XDSAppShell found', async () => {
    const {default: transform} = await import(
      '../migrate-background-to-variant.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const api = {jscodeshift, stats: () => {}, report: () => {}};
    const source = '<div>Hello</div>';
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });
});
