// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {component} from '../api/component.mjs';

// These tests create a minimal monorepo fixture with:
// - packages/core (symlinked to real @astryxdesign/core for loadDocs compatibility)
// - node_modules/@test/ext with a Button + ProfileCard component (external package)
//
// This tests the --package option for disambiguating overlapping component names.

let tmpDir;

function createFixture() {
  // Symlink real core package so loadDocs (dynamic import) works with Vite
  const realCoreDir = path.resolve(import.meta.dirname, '..', '..', '..', 'core');
  const coreDir = path.join(tmpDir, 'packages', 'core');
  fs.mkdirSync(path.dirname(coreDir), {recursive: true});
  fs.symlinkSync(realCoreDir, coreDir);

  // External package with Button (different docs) + ProfileCard (unique)
  const extDir = path.join(tmpDir, 'node_modules', '@test', 'ext');
  const extSrc = path.join(extDir, 'src');
  fs.mkdirSync(path.join(extSrc, 'Button'), {recursive: true});
  fs.mkdirSync(path.join(extSrc, 'ProfileCard'), {recursive: true});

  // Blocks directory with a ProfileCard showcase
  const blocksDir = path.join(extDir, 'blocks', 'components', 'ProfileCard');
  fs.mkdirSync(blocksDir, {recursive: true});
  fs.writeFileSync(path.join(blocksDir, 'ProfileCardShowcase.doc.mjs'), `
export const doc = {
  type: 'block',
  name: 'ProfileCard — Showcase',
  description: 'ProfileCard showcase.',
  isReady: true,
  isShowcase: true,
  aspectRatio: 16 / 9,
  componentsUsed: ['ProfileCard'],
};
`);
  fs.writeFileSync(path.join(blocksDir, 'ProfileCardShowcase.tsx'),
    "'use client';\nexport default function ProfileCardShowcase() { return <div>ProfileCard</div>; }");

  fs.writeFileSync(path.join(extDir, 'package.json'), JSON.stringify({
    name: '@test/ext',
    astryx: {docs: './src', category: 'Common', blocks: './blocks/components'},
  }));
  fs.writeFileSync(path.join(extSrc, 'Button', 'Button.doc.mjs'), `
export const docs = {
  name: 'AcmeButton',
  usage: { description: 'Common button with platform features.' },
  props: [{ name: 'label', type: 'string', description: 'Button label' }, { name: 'isLoading', type: 'boolean', description: 'Shows spinner' }],
};
`);
  fs.writeFileSync(path.join(extSrc, 'ProfileCard', 'ProfileCard.doc.mjs'), `
export const docs = {
  name: 'AcmeProfileCard',
  usage: { description: 'Profile card component.' },
  props: [{ name: 'userId', type: 'string', description: 'User identifier' }],
};
`);
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-pkg-test-'));
  createFixture();
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('component() with --package option', () => {
  it('returns external package docs when --package is specified', async () => {
    const result = await component('Button', {cwd: tmpDir, package: '@test/ext'});
    expect(result.type).toBe('component.detail');
    expect(result.data.name).toBe('AcmeButton');
    expect(result.data.usage.description).toContain('platform features');
  });

  it('returns core docs when no --package is specified (default behavior)', async () => {
    const result = await component('Button', {cwd: tmpDir});
    expect(result.type).toBe('component.detail');
    // Core's Button doc has name 'Button', not 'AcmeButton'
    expect(result.data.name).toBe('Button');
  });

  it('resolves unique external components without --package', async () => {
    const result = await component('ProfileCard', {cwd: tmpDir});
    expect(result.type).toBe('component.detail');
    expect(result.data.name).toBe('AcmeProfileCard');
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

  it('returns showcase from external package when --package + --showcase', async () => {
    const result = await component('ProfileCard', {cwd: tmpDir, package: '@test/ext', showcase: true});
    expect(result.type).toBe('component.detail.showcase');
    expect(result.data.component).toBe('ProfileCard');
    expect(result.data.source).toContain('ProfileCardShowcase');
    expect(result.data.aspectRatio).toBeCloseTo(16 / 9);
  });
});
