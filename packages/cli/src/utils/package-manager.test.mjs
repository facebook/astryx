// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {detectPackageManager} from './package-manager.mjs';

let tmpDir;

afterEach(() => {
  if (tmpDir) {
    fs.rmSync(tmpDir, {recursive: true, force: true});
    tmpDir = null;
  }
  vi.restoreAllMocks();
  delete process.env.npm_config_user_agent;
});

function makeTmpDir() {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-pm-test-'));
  return tmpDir;
}

describe('detectPackageManager', () => {
  it('detects yarn from yarn.lock', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'yarn.lock'), '');
    expect(detectPackageManager(dir)).toBe('yarn');
  });

  it('detects pnpm from pnpm-lock.yaml', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');
    expect(detectPackageManager(dir)).toBe('pnpm');
  });

  it('detects npm from package-lock.json', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'package-lock.json'), '{}');
    expect(detectPackageManager(dir)).toBe('npm');
  });

  it('detects bun from bun.lockb', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'bun.lockb'), '');
    expect(detectPackageManager(dir)).toBe('bun');
  });

  it('detects from packageManager field in package.json (no lockfile)', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({packageManager: 'yarn@4.1.0'}),
    );
    expect(detectPackageManager(dir)).toBe('yarn');
  });

  it('detects pnpm from packageManager field', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({packageManager: 'pnpm@8.0.0'}),
    );
    expect(detectPackageManager(dir)).toBe('pnpm');
  });

  it('ignores unknown packageManager values', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({packageManager: 'unknown@1.0.0'}),
    );
    expect(detectPackageManager(dir)).toBe('npx');
  });

  it('lockfile takes priority over packageManager field', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'yarn.lock'), '');
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({packageManager: 'pnpm@8.0.0'}),
    );
    expect(detectPackageManager(dir)).toBe('yarn');
  });

  it('detects from npm_config_user_agent env var', () => {
    const dir = makeTmpDir();
    process.env.npm_config_user_agent = 'yarn/1.22.22 node/v20.0.0';
    expect(detectPackageManager(dir)).toBe('yarn');
  });

  it('detects pnpm from npm_config_user_agent env var', () => {
    const dir = makeTmpDir();
    process.env.npm_config_user_agent = 'pnpm/8.15.0 node/v20.0.0';
    expect(detectPackageManager(dir)).toBe('pnpm');
  });

  it('falls back to npx when no signals present', () => {
    const dir = makeTmpDir();
    expect(detectPackageManager(dir)).toBe('npx');
  });

  it('packageManager field takes priority over npm_config_user_agent', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({packageManager: 'bun@1.0.0'}),
    );
    process.env.npm_config_user_agent = 'npm/10.0.0 node/v20.0.0';
    expect(detectPackageManager(dir)).toBe('bun');
  });
});
