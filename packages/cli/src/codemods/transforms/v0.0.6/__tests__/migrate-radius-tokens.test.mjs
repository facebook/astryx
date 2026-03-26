import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import('../migrate-radius-tokens.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('migrate-radius-tokens', () => {
  it('renames old semantic radius token string literals', async () => {
    const input = `const x = '--radius-container';`;
    const output = await applyTransform(input);
    expect(output).toContain('--radius-container');
    expect(output).not.toContain('--radius-3');
  });

  it('renames radiusVars property access', async () => {
    const input = `borderRadius: radiusVars['--radius-element']`;
    const output = await applyTransform(input);
    expect(output).toContain('--radius-element');
  });

  it('renames tokens inside var() in string literals', async () => {
    const input = `borderRadius: 'var(--radius-content)'`;
    const output = await applyTransform(input);
    expect(output).toContain('var(--radius-inner)');
    expect(output).not.toContain('--radius-content');
  });

  it('renames tokens in template literals', async () => {
    const input = 'const css = `border-radius: var(--radius-inner)`;';
    const output = await applyTransform(input);
    expect(output).toContain('--radius-none');
    expect(output).not.toContain('var(--radius-inner)');
  });

  it('renames --radius-page to --radius-container', async () => {
    const input = `const x = '--radius-page';`;
    const output = await applyTransform(input);
    expect(output).toContain('--radius-container');
    expect(output).not.toContain('--radius-page');
  });

  it('migrates intermediate numeric names', async () => {
    const input = `const x = '--radius-0';`;
    const output = await applyTransform(input);
    expect(output).toContain('--radius-none');
  });

  it('renames --radius-rounded to --radius-full', async () => {
    const input = `radiusVars['--radius-rounded']`;
    const output = await applyTransform(input);
    expect(output).toContain('--radius-full');
    expect(output).not.toContain('--radius-rounded');
  });

  it('does not modify already-final names', async () => {
    const input = `const x = '--radius-container';`;
    const output = await applyTransform(input);
    expect(output).toContain('--radius-container');
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import('../migrate-radius-tokens.mjs');
    const jscodeshift = (await import('jscodeshift')).default;
    const api = {jscodeshift, stats: () => {}, report: () => {}};
    const source = `const x = '--radius-container';`;
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });
});
