import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../rename-sidenav-header-to-heading.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('rename-sidenav-header-to-heading', () => {
  it('renames title to heading on XDSSideNavHeader', async () => {
    const input = '<XDSSideNavHeader title="My App" />';
    const output = await applyTransform(input);
    expect(output).toContain('heading="My App"');
    expect(output).not.toContain('title=');
  });

  it('renames all props on XDSSideNavHeader', async () => {
    const input = `<XDSSideNavHeader
  title="My App"
  titleHref="/"
  supertitle="Acme Corp"
  supertitleHref="/org"
  subtitle="v2.0"
  subtitleHref="/version"
/>`;
    const output = await applyTransform(input);
    expect(output).toContain('heading="My App"');
    expect(output).toContain('headingHref="/"');
    expect(output).toContain('superheading="Acme Corp"');
    expect(output).toContain('superheadingHref="/org"');
    expect(output).toContain('subheading="v2.0"');
    expect(output).toContain('subheadingHref="/version"');
    expect(output).not.toContain('title=');
    expect(output).not.toContain('titleHref=');
    expect(output).not.toContain('supertitle=');
    expect(output).not.toContain('supertitleHref=');
    expect(output).not.toContain('subtitle=');
    expect(output).not.toContain('subtitleHref=');
  });

  it('renames props on XDSSideNavHeading (already renamed component)', async () => {
    const input = '<XDSSideNavHeading title="My App" titleHref="/" />';
    const output = await applyTransform(input);
    expect(output).toContain('heading="My App"');
    expect(output).toContain('headingHref="/"');
  });

  it('renames <XDSSideNavHeader> to <XDSSideNavHeading>', async () => {
    const input = '<XDSSideNavHeader title="My App" />';
    const output = await applyTransform(input);
    expect(output).toContain('<XDSSideNavHeading');
    expect(output).not.toContain('XDSSideNavHeader');
  });

  it('renames closing tag for XDSSideNavHeader', async () => {
    const input = '<XDSSideNavHeader title="My App"><Menu /></XDSSideNavHeader>';
    const output = await applyTransform(input);
    expect(output).toContain('<XDSSideNavHeading');
    expect(output).toContain('</XDSSideNavHeading>');
    expect(output).not.toContain('XDSSideNavHeader');
  });

  it('renames XDSSideNavHeader in import specifiers', async () => {
    const input = `import {XDSSideNavHeader} from '@xds/core';
<XDSSideNavHeader title="My App" />`;
    const output = await applyTransform(input);
    expect(output).toContain('import {XDSSideNavHeading}');
    expect(output).not.toContain('XDSSideNavHeader');
  });

  it('renames XDSSideNavHeaderProps in import specifiers', async () => {
    const input = `import {XDSSideNavHeaderProps} from '@xds/core';`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSSideNavHeadingProps');
    expect(output).not.toContain('XDSSideNavHeaderProps');
  });

  it('does not rename props on non-target components', async () => {
    const input = '<XDSCard title="Card Title" subtitle="Subtitle" />';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not rename props on other XDS components', async () => {
    const input = '<XDSSideNavSection title="Section" />';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('preserves non-renamed props', async () => {
    const input = '<XDSSideNavHeader title="My App" icon={<AppIcon />} menu={<Menu />} />';
    const output = await applyTransform(input);
    expect(output).toContain('heading="My App"');
    expect(output).toContain('icon={<AppIcon />}');
    expect(output).toContain('menu={<Menu />}');
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import(
      '../rename-sidenav-header-to-heading.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const api = {jscodeshift, stats: () => {}, report: () => {}};
    const source = '<XDSSideNavHeading heading="My App" headingHref="/" />';
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('handles all renames in one file', async () => {
    const input = `import {XDSSideNavHeader} from '@xds/core';
<XDSSideNavHeader
  title="My App"
  titleHref="/"
  supertitle="Corp"
  subtitle="v1"
  icon={<Icon />}
/>`;
    const output = await applyTransform(input);
    expect(output).not.toContain('XDSSideNavHeader');
    expect(output).toContain('XDSSideNavHeading');
    expect(output).toContain('heading="My App"');
    expect(output).toContain('headingHref="/"');
    expect(output).toContain('superheading="Corp"');
    expect(output).toContain('subheading="v1"');
  });

  it('handles aliased imports', async () => {
    const input = `import {XDSSideNavHeader as Header} from '@xds/core';
<Header title="My App" />`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSSideNavHeading as Header');
  });
});
