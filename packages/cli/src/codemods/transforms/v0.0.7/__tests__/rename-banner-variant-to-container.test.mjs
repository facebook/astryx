import {describe, it, expect} from 'vitest';

async function applyTransform(source, filePath = 'test.tsx') {
  const {default: transform} = await import(
    '../rename-banner-variant-to-container.mjs'
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

describe('rename-banner-variant-to-container', () => {
  it('renames variant to container on XDSBanner', async () => {
    const input = '<XDSBanner variant="card" status="info" title="Test" />';
    const output = await applyTransform(input);
    expect(output).toContain('container="card"');
    expect(output).not.toContain('variant=');
  });

  it('handles section variant', async () => {
    const input = '<XDSBanner variant="section" status="warning" title="Alert" />';
    const output = await applyTransform(input);
    expect(output).toContain('container="section"');
  });

  it('handles expression values', async () => {
    const input = '<XDSBanner variant={myVariant} status="info" title="Test" />';
    const output = await applyTransform(input);
    expect(output).toContain('container={myVariant}');
  });

  it('does not rename variant on other components', async () => {
    const input = '<XDSButton variant="primary" />';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not rename variant on non-XDS Banner', async () => {
    const input = '<Banner variant="card" />';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('renames XDSBannerVariant type', async () => {
    const input = 'const v: XDSBannerVariant = "card";';
    const output = await applyTransform(input, 'test.ts');
    expect(output).toContain('XDSBannerContainer');
    expect(output).not.toContain('XDSBannerVariant');
  });

  it('does not rename XDSBannerVariantMap (removed, not renamed)', async () => {
    const input = 'type T = XDSBannerVariantMap;';
    const output = await applyTransform(input, 'test.ts');
    // VariantMap is removed entirely — consumers need to manually
    // migrate augmentations to XDSBannerStatusMap
    expect(output).toBe(input);
  });

  it('preserves other props', async () => {
    const input = '<XDSBanner variant="card" status="error" title="Oops" isDismissable />';
    const output = await applyTransform(input);
    expect(output).toContain('container="card"');
    expect(output).toContain('status="error"');
    expect(output).toContain('title="Oops"');
    expect(output).toContain('isDismissable');
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import(
      '../rename-banner-variant-to-container.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const api = {jscodeshift, stats: () => {}, report: () => {}};
    const source = '<XDSBanner container="card" status="info" title="Test" />';
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });
});
