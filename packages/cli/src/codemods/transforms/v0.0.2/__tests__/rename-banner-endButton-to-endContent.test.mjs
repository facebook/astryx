import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../rename-banner-endButton-to-endContent.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('rename-banner-endButton-to-endContent', () => {
  it('renames endButton to endContent on XDSBanner', async () => {
    const input = '<XDSBanner endButton={<button>Close</button>} />';
    const output = await applyTransform(input);
    expect(output).toContain('endContent={<button>Close</button>}');
    expect(output).not.toContain('endButton');
  });

  it('handles expression values', async () => {
    const input = '<XDSBanner endButton={closeBtn} variant="info" />';
    const output = await applyTransform(input);
    expect(output).toContain('endContent={closeBtn}');
    expect(output).toContain('variant="info"');
  });

  it('does not rename endButton on non-XDS components', async () => {
    const input = '<Banner endButton={<button>X</button>} />';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not rename endButton on other XDS components', async () => {
    const input = '<XDSDialog endButton={btn} />';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import(
      '../rename-banner-endButton-to-endContent.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const api = {jscodeshift, stats: () => {}, report: () => {}};
    const source = '<XDSBanner endContent={btn} />';
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('preserves other XDSBanner props', async () => {
    const input = '<XDSBanner variant="warning" endButton={btn} title="Alert" />';
    const output = await applyTransform(input);
    expect(output).toContain('endContent={btn}');
    expect(output).toContain('variant="warning"');
    expect(output).toContain('title="Alert"');
  });
});
