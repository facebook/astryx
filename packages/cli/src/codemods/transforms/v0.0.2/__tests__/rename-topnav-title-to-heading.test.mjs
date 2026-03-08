import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../rename-topnav-title-to-heading.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('rename-topnav-title-to-heading', () => {
  it('renames title to heading on XDSTopNav', async () => {
    const input = '<XDSTopNav title={<Logo />} label="Nav" />';
    const output = await applyTransform(input);
    expect(output).toContain('heading={<Logo />}');
    expect(output).not.toContain('title=');
  });

  it('renames title to heading on XDSTopNavTitle', async () => {
    const input = '<XDSTopNavTitle title="My App" href="/" />';
    const output = await applyTransform(input);
    expect(output).toContain('heading="My App"');
    expect(output).not.toContain('title=');
  });

  it('renames title to heading on XDSTopNavHeading', async () => {
    const input = '<XDSTopNavHeading title="My App" href="/" />';
    const output = await applyTransform(input);
    expect(output).toContain('heading="My App"');
    expect(output).not.toContain('title=');
  });

  it('renames <XDSTopNavTitle> to <XDSTopNavHeading>', async () => {
    const input = '<XDSTopNavTitle title="My App" href="/" />';
    const output = await applyTransform(input);
    expect(output).toContain('<XDSTopNavHeading');
    expect(output).not.toContain('XDSTopNavTitle');
  });

  it('renames closing tag for XDSTopNavTitle', async () => {
    const input = '<XDSTopNavTitle title="My App">Custom</XDSTopNavTitle>';
    const output = await applyTransform(input);
    expect(output).toContain('<XDSTopNavHeading');
    expect(output).toContain('</XDSTopNavHeading>');
    expect(output).not.toContain('XDSTopNavTitle');
  });

  it('renames XDSTopNavTitle in import specifiers', async () => {
    const input = `import {XDSTopNavTitle} from '@xds/core';
<XDSTopNavTitle title="My App" />`;
    const output = await applyTransform(input);
    expect(output).toContain('import {XDSTopNavHeading}');
    expect(output).not.toContain('XDSTopNavTitle');
  });

  it('renames XDSTopNavTitleProps in import specifiers', async () => {
    const input = `import {XDSTopNavTitleProps} from '@xds/core';`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSTopNavHeadingProps');
    expect(output).not.toContain('XDSTopNavTitleProps');
  });

  it('does not rename title on non-target components', async () => {
    const input = '<XDSBanner title="Alert" />';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not rename title on other XDS components', async () => {
    const input = '<XDSDialog title="Confirm" />';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('preserves other props on XDSTopNav', async () => {
    const input = '<XDSTopNav title={<Logo />} label="Nav" startContent={items} />';
    const output = await applyTransform(input);
    expect(output).toContain('heading={<Logo />}');
    expect(output).toContain('label="Nav"');
    expect(output).toContain('startContent={items}');
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import(
      '../rename-topnav-title-to-heading.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const api = {jscodeshift, stats: () => {}, report: () => {}};
    const source = '<XDSTopNav heading={<Logo />} label="Nav" />';
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('handles all renames in one file', async () => {
    const input = `import {XDSTopNav, XDSTopNavTitle} from '@xds/core';
<XDSTopNav title={<XDSTopNavTitle title="My App" href="/" />} label="Nav" />`;
    const output = await applyTransform(input);
    expect(output).not.toContain('XDSTopNavTitle');
    expect(output).not.toContain('title=');
    expect(output).toContain('XDSTopNavHeading');
    expect(output).toContain('heading=');
  });

  it('handles aliased imports', async () => {
    const input = `import {XDSTopNavTitle as Title} from '@xds/core';
<Title title="My App" />`;
    const output = await applyTransform(input);
    // Import should rename imported but keep local alias
    expect(output).toContain('XDSTopNavHeading as Title');
  });
});
