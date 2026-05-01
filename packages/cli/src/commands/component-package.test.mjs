import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {component} from '../api/component.mjs';

// These tests create a minimal monorepo fixture with:
// - packages/core (symlinked to real @xds/core for loadDocs compatibility)
// - node_modules/@test/ext with a Button + Employee component (external package)
//
// This tests the --package option for disambiguating overlapping component names.

let tmpDir;

function createFixture() {
  // Symlink real core package so loadDocs (dynamic import) works with Vite
  const realCoreDir = path.resolve(import.meta.dirname, '..', '..', '..', 'core');
  const coreDir = path.join(tmpDir, 'packages', 'core');
  fs.mkdirSync(path.dirname(coreDir), {recursive: true});
  fs.symlinkSync(realCoreDir, coreDir);

  // External package with Button (different docs) + Employee (unique)
  const extDir = path.join(tmpDir, 'node_modules', '@test', 'ext');
  const extSrc = path.join(extDir, 'src');
  fs.mkdirSync(path.join(extSrc, 'Button'), {recursive: true});
  fs.mkdirSync(path.join(extSrc, 'Employee'), {recursive: true});
  fs.writeFileSync(path.join(extDir, 'package.json'), JSON.stringify({
    name: '@test/ext',
    xds: {docs: './src', category: 'Common'},
  }));
  fs.writeFileSync(path.join(extSrc, 'Button', 'Button.doc.mjs'), `
export const docs = {
  name: 'XDSCommonButton',
  usage: { description: 'Common button with platform features.' },
  props: [{ name: 'label', type: 'string', description: 'Button label' }, { name: 'isLoading', type: 'boolean', description: 'Shows spinner' }],
};
`);
  fs.writeFileSync(path.join(extSrc, 'Employee', 'Employee.doc.mjs'), `
export const docs = {
  name: 'XDSCommonEmployee',
  usage: { description: 'Employee profile component.' },
  props: [{ name: 'employeeId', type: 'string', description: 'Employee FBID' }],
};
`);
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-pkg-test-'));
  createFixture();
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('component() with --package option', () => {
  it('returns external package docs when --package is specified', async () => {
    const result = await component('Button', {cwd: tmpDir, package: '@test/ext'});
    expect(result.type).toBe('component.detail');
    expect(result.data.name).toBe('XDSCommonButton');
    expect(result.data.usage.description).toContain('platform features');
  });

  it('returns core docs when no --package is specified (default behavior)', async () => {
    const result = await component('Button', {cwd: tmpDir});
    expect(result.type).toBe('component.detail');
    // Core's Button doc has name 'Button', not 'XDSCommonButton'
    expect(result.data.name).toBe('Button');
  });

  it('resolves unique external components without --package', async () => {
    const result = await component('Employee', {cwd: tmpDir});
    expect(result.type).toBe('component.detail');
    expect(result.data.name).toBe('XDSCommonEmployee');
  });

  it('returns props for package-scoped component', async () => {
    const result = await component('Button', {cwd: tmpDir, package: '@test/ext', props: true});
    expect(result.type).toBe('component.detail.props');
    expect(result.data).toHaveLength(2);
    expect(result.data.some(p => p.name === 'isLoading')).toBe(true);
  });

  it('throws for unknown package name', async () => {
    await expect(
      component('Button', {cwd: tmpDir, package: '@test/nonexistent'}),
    ).rejects.toThrow('not found');
  });

  it('throws for component not in the specified package', async () => {
    await expect(
      component('Avatar', {cwd: tmpDir, package: '@test/ext'}),
    ).rejects.toThrow('No component "Avatar" in package');
  });
});
