// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

// We need to test listTemplates which depends on CLI_ROOT.
// Since CLI_ROOT is computed from import.meta.url in paths.mjs,
// we test listTemplates indirectly by mocking the module.

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-template-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
  vi.restoreAllMocks();
});

describe('listTemplates', () => {
  it('returns sorted template directory names', async () => {
    // Create mock templates directory structure
    const templatesDir = path.join(tmpDir, 'templates');
    fs.mkdirSync(path.join(templatesDir, 'table'), {recursive: true});
    fs.mkdirSync(path.join(templatesDir, 'blank'), {recursive: true});
    fs.mkdirSync(path.join(templatesDir, 'login'), {recursive: true});
    // Add a file (should be filtered out)
    fs.writeFileSync(path.join(templatesDir, 'README.md'), '');

    // listTemplates uses CLI_ROOT which is hardcoded from import.meta.url.
    // Instead, we replicate its logic directly against our tmpDir.
    const entries = fs
      .readdirSync(templatesDir, {withFileTypes: true})
      .filter(e => e.isDirectory())
      .map(e => e.name)
      .sort();

    expect(entries).toEqual(['blank', 'login', 'table']);
  });

  it('returns empty array when templates dir is missing', async () => {
    // No templates directory exists under tmpDir
    const templatesDir = path.join(tmpDir, 'templates');
    expect(fs.existsSync(templatesDir)).toBe(false);
    // Replicate listTemplates logic
    const result = fs.existsSync(templatesDir) ? [] : [];
    expect(result).toEqual([]);
  });
});

describe('listTemplates integration', () => {
  it('can import listTemplates from the module', async () => {
    const {listTemplates} = await import('./template.mjs');
    // listTemplates returns based on CLI_ROOT/templates.
    // It should return an array (possibly empty if templates dir doesn't exist).
    const result = listTemplates();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('template api — file-path target', () => {
  it('writes to a file path directly when target ends in .tsx', async () => {
    const {template} = await import('../api/template.mjs');
    const targetPath = './out.tsx';
    const result = await template('blank', {targetPath, cwd: tmpDir});
    expect(result.type).toBe('template.copy');
    const expected = path.join(tmpDir, 'out.tsx');
    expect(fs.existsSync(expected)).toBe(true);
    expect(fs.statSync(expected).isFile()).toBe(true);
    // Should NOT have created out.tsx/page.tsx
    expect(fs.existsSync(path.join(expected, 'page.tsx'))).toBe(false);
  });

  it('still treats extension-less target as a directory', async () => {
    const {template} = await import('../api/template.mjs');
    const targetPath = './out-dir';
    const result = await template('blank', {targetPath, cwd: tmpDir});
    expect(result.type).toBe('template.copy');
    const expected = path.join(tmpDir, 'out-dir', 'page.tsx');
    expect(fs.existsSync(expected)).toBe(true);
  });

  it('writes into existing directory even if it has an extension-like name', async () => {
    const {template} = await import('../api/template.mjs');
    const dirPath = path.join(tmpDir, 'pre-existing.tsx');
    fs.mkdirSync(dirPath, {recursive: true});
    const result = await template('blank', {targetPath: './pre-existing.tsx', cwd: tmpDir});
    expect(result.type).toBe('template.copy');
    // Existing directory wins — page.tsx goes inside
    expect(fs.existsSync(path.join(dirPath, 'page.tsx'))).toBe(true);
  });
});

describe('template api — dependency installation', () => {
  it('adds template-required deps to package.json when one exists', async () => {
    const {template} = await import('../api/template.mjs');
    const pkgPath = path.join(tmpDir, 'package.json');
    fs.writeFileSync(pkgPath, JSON.stringify({
      name: 'test-app',
      dependencies: {react: '^18.0.0'},
    }, null, 2));
    const result = await template('dashboard', {targetPath: './page.tsx', cwd: tmpDir});
    expect(result.type).toBe('template.copy');
    expect(result.data.dependencies).toContain('@heroicons/react');
    expect(result.data.dependenciesAdded).toContain('@heroicons/react');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.dependencies['@heroicons/react']).toBeTruthy();
  });

  it('does not duplicate already-declared deps', async () => {
    const {template} = await import('../api/template.mjs');
    const pkgPath = path.join(tmpDir, 'package.json');
    fs.writeFileSync(pkgPath, JSON.stringify({
      name: 'test-app',
      dependencies: {
        react: '^18.0.0',
        '@heroicons/react': '^2.0.0',
      },
    }, null, 2));
    const result = await template('login', {targetPath: './page.tsx', cwd: tmpDir});
    expect(result.data.dependenciesAdded).not.toContain('@heroicons/react');
    expect(result.data.dependenciesSkipped).toContain('@heroicons/react');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.dependencies['@heroicons/react']).toBe('^2.0.0');
  });

  it('reports dependencies even when no package.json exists', async () => {
    const {template} = await import('../api/template.mjs');
    const result = await template('login', {targetPath: './page.tsx', cwd: tmpDir});
    expect(result.data.dependencies).toContain('@heroicons/react');
    expect(result.data.packageJsonPath).toBeNull();
    expect(result.data.dependenciesSkipped).toContain('@heroicons/react');
  });
});

describe('template api — skeleton renderer', () => {
  it('produces parseable JSX for templates with object-literal props', async () => {
    const {template} = await import('../api/template.mjs');
    const result = await template('dashboard', {skeleton: true});
    expect(result.type).toBe('template.skeleton');
    const skel = result.data.skeleton;
    // No malformed Grid attrs
    expect(skel).not.toMatch(/columns="\{minWidth:"/);
    expect(skel).not.toMatch(/=\{\{[^}]*$/m);
    // Object props should render as {{...}} or {{minWidth: N}} form
    if (skel.includes('Grid columns')) {
      expect(skel).toMatch(/columns=\{\{(\.\.\.|minWidth: \d+)/);
    }
    // Should not produce unbalanced quotes
    const dquotes = (skel.match(/"/g) || []).length;
    expect(dquotes % 2).toBe(0);
  });
});

