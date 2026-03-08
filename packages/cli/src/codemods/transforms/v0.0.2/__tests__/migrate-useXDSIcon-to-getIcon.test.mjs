import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../migrate-useXDSIcon-to-getIcon.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('migrate-useXDSIcon-to-getIcon', () => {
  it('renames useXDSIcon call to getIcon', async () => {
    const input = `const icon = useXDSIcon('close');`;
    const output = await applyTransform(input);
    expect(output).toContain("getIcon('close')");
    expect(output).not.toContain('useXDSIcon');
  });

  it('renames useXDSIcon in import specifiers', async () => {
    const input = `import {useXDSIcon} from '@xds/core';
const icon = useXDSIcon('close');`;
    const output = await applyTransform(input);
    expect(output).toMatch(/import\s*\{.*getIcon.*\}/);
    expect(output).toContain("getIcon('close')");
    expect(output).not.toContain('useXDSIcon');
  });

  it('updates import source from IconRegistry to globalIconRegistry', async () => {
    const input = `import {useXDSIcon} from '../Icon/IconRegistry';
const icon = useXDSIcon('close');`;
    const output = await applyTransform(input);
    expect(output).toMatch(/from\s+['"]\.\.\/Icon\/globalIconRegistry['"]/);
    expect(output).toMatch(/import\s*\{.*getIcon.*\}/);
    expect(output).not.toMatch(/['"]\.\.\/Icon\/IconRegistry['"]/);
    expect(output).not.toContain('useXDSIcon');
  });

  it('removes IconRegistryContext from imports', async () => {
    const input = `import {IconRegistryContext, useXDSIcon} from '@xds/core';
const icon = useXDSIcon('close');`;
    const output = await applyTransform(input);
    expect(output).not.toContain('IconRegistryContext');
    expect(output).toMatch(/import\s*\{.*getIcon.*\}/);
  });

  it('removes entire import when only IconRegistryContext', async () => {
    const input = `import {IconRegistryContext} from '@xds/core';`;
    const output = await applyTransform(input);
    expect(output).not.toContain('import');
    expect(output).not.toContain('IconRegistryContext');
  });

  it('removes IconRegistryContext.Provider wrapper', async () => {
    const input = `<IconRegistryContext.Provider value={icons}>
  <App />
</IconRegistryContext.Provider>`;
    const output = await applyTransform(input);
    expect(output).not.toContain('IconRegistryContext');
    expect(output).not.toContain('Provider');
    expect(output).toContain('<App />');
  });

  it('preserves @xds/core import source', async () => {
    const input = `import {useXDSIcon} from '@xds/core';
const icon = useXDSIcon('close');`;
    const output = await applyTransform(input);
    expect(output).toContain("from '@xds/core'");
    expect(output).toMatch(/import\s*\{.*getIcon.*\}/);
  });

  it('handles aliased import', async () => {
    const input = `import {useXDSIcon as getMyIcon} from '@xds/core';
const icon = getMyIcon('close');`;
    const output = await applyTransform(input);
    expect(output).toContain('getIcon as getMyIcon');
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import(
      '../migrate-useXDSIcon-to-getIcon.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const api = {jscodeshift, stats: () => {}, report: () => {}};
    const source = `const icon = getIcon('close');`;
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('handles multiple useXDSIcon calls in one file', async () => {
    const input = `import {useXDSIcon} from '@xds/core';
const close = useXDSIcon('close');
const check = useXDSIcon('check');`;
    const output = await applyTransform(input);
    expect(output).toContain("getIcon('close')");
    expect(output).toContain("getIcon('check')");
    expect(output).not.toContain('useXDSIcon');
  });

  it('updates relative IconRegistry import path', async () => {
    const input = `import {useXDSIcon} from './IconRegistry';
const icon = useXDSIcon('close');`;
    const output = await applyTransform(input);
    expect(output).toMatch(/from\s*['"]\.\/globalIconRegistry['"]/);
  });
});
