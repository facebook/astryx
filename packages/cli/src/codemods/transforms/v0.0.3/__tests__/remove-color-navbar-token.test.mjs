import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../remove-color-navbar-token.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

/**
 * Strip TODO comments to check that code-level references are gone.
 */
function stripComments(code) {
  return code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

describe('remove-color-navbar-token', () => {
  it('replaces colorVars["--color-navbar"] with colorVars["--color-surface"]', async () => {
    const input = `
      const styles = stylex.create({
        nav: {
          backgroundColor: colorVars['--color-navbar'],
        },
      });
    `;
    const output = await applyTransform(input);
    expect(output).toContain('--color-surface');
    expect(stripComments(output)).not.toContain('--color-navbar');
    expect(output).toContain('TODO(xds-codemod)');
  });

  it('removes --color-navbar from theme definition objects', async () => {
    const input = `
      const theme = defineTheme({
        colors: {
          '--color-surface': ['#fff', '#1a1a1a'],
          '--color-navbar': ['#fff', '#1f1f22'],
          '--color-wash': ['#f0f0f0', '#000'],
        },
      });
    `;
    const output = await applyTransform(input);
    expect(stripComments(output)).not.toContain('--color-navbar');
    expect(output).toContain('--color-surface');
    expect(output).toContain('--color-wash');
  });

  it('skips files with no --color-navbar reference', async () => {
    const {default: transform} = await import(
      '../remove-color-navbar-token.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const api = {jscodeshift, stats: () => {}, report: () => {}};
    const source = `
      const styles = stylex.create({
        root: { backgroundColor: colorVars['--color-surface'] },
      });
    `;
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('handles double-quoted property access', async () => {
    const input = `
      const styles = stylex.create({
        nav: {
          backgroundColor: colorVars["--color-navbar"],
        },
      });
    `;
    const output = await applyTransform(input);
    expect(output).toContain('--color-surface');
    expect(stripComments(output)).not.toContain('--color-navbar');
  });

  it('handles --color-navbar as a standalone string literal', async () => {
    const input = `
      const token = '--color-navbar';
    `;
    const output = await applyTransform(input);
    expect(output).toContain('--color-surface');
    expect(stripComments(output)).not.toContain('--color-navbar');
  });

  it('handles multiple occurrences in one file', async () => {
    const input = `
      const theme = {
        '--color-navbar': '#fff',
      };
      const bg = colorVars['--color-navbar'];
    `;
    const output = await applyTransform(input);
    expect(stripComments(output)).not.toContain('--color-navbar');
  });
});
