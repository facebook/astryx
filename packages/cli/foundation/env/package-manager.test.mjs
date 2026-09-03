// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  detectPackageManager,
  explainPackageManager,
  getDlxPrefix,
  isCliOneOff,
  getCliInvocation,
  formatCliCommand,
} from './package-manager.mjs';

let tmpDir;
const ORIGINAL_ARGV1 = process.argv[1];

afterEach(() => {
  if (tmpDir) {
    fs.rmSync(tmpDir, {recursive: true, force: true});
    tmpDir = null;
  }
  vi.restoreAllMocks();
  delete process.env.npm_config_user_agent;
  process.argv[1] = ORIGINAL_ARGV1;
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

  it('refuses to let the runner break a multi-lockfile tie', () => {
    // One `yarn install` inside a pnpm project leaves a yarn.lock next to the
    // committed pnpm-lock.yaml. Nothing the project owns picks between them, so
    // there is no honest answer to give — only the neutral one.
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');
    fs.writeFileSync(path.join(dir, 'yarn.lock'), '');
    process.env.npm_config_user_agent = 'pnpm/11.10.0 npm/? node/v22.0.0';
    expect(detectPackageManager(dir)).toBe('npx');
    expect(explainPackageManager(dir)).toMatchObject({
      ambiguous: true,
      candidates: ['yarn', 'pnpm'],
    });
  });

  it('does not reproduce a wrong `yarn astryx` line it was invoked through', () => {
    // The regression: an agent handed the wrong `yarn astryx` line runs the CLI
    // THROUGH yarn, so npm_config_user_agent says yarn. A runner tiebreak then
    // agrees with the mistake, and regenerating agent docs writes it again —
    // the wrong line reproduces itself forever. Project evidence only.
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');
    fs.writeFileSync(path.join(dir, 'yarn.lock'), '');
    process.env.npm_config_user_agent = 'yarn/1.22.21 npm/? node/v22.0.0';
    expect(detectPackageManager(dir)).not.toBe('yarn');
    expect(getCliInvocation(dir)).toBe('npx astryx');
  });

  it('does not reproduce it for a directly invoked installed binary either', () => {
    const dir = makeTmpDir();
    const entry = process.argv[1];
    try {
      fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');
      fs.writeFileSync(path.join(dir, 'yarn.lock'), '');
      process.env.npm_config_user_agent = 'yarn/1.22.21 npm/? node/v22.0.0';
      process.argv[1] = path.join(dir, 'node_modules/.bin/astryx');
      expect(getCliInvocation(dir)).toBe('npx astryx');
    } finally {
      process.argv[1] = entry;
    }
  });

  it('breaks the tie from a committed pnpm-workspace.yaml', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');
    fs.writeFileSync(path.join(dir, 'yarn.lock'), '');
    fs.writeFileSync(path.join(dir, 'pnpm-workspace.yaml'), 'packages: []\n');
    process.env.npm_config_user_agent = 'yarn/1.22.21 npm/? node/v22.0.0';
    expect(detectPackageManager(dir)).toBe('pnpm');
  });

  it('breaks the tie from a committed .yarnrc.yml', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');
    fs.writeFileSync(path.join(dir, 'yarn.lock'), '');
    fs.writeFileSync(path.join(dir, '.yarnrc.yml'), 'nodeLinker: node-modules\n');
    expect(detectPackageManager(dir)).toBe('yarn');
  });

  it('stays ambiguous when the project owns evidence for both', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');
    fs.writeFileSync(path.join(dir, 'yarn.lock'), '');
    fs.writeFileSync(path.join(dir, 'pnpm-workspace.yaml'), 'packages: []\n');
    fs.writeFileSync(path.join(dir, '.yarnrc.yml'), '');
    expect(explainPackageManager(dir).ambiguous).toBe(true);
  });

  it('lets the packageManager field break a multi-lockfile tie', () => {
    // A single lockfile still outranks the field (asserted above). This is only
    // about the case where the filesystem is self-contradictory.
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'yarn.lock'), '');
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({packageManager: 'pnpm@11.10.0'}),
    );
    expect(detectPackageManager(dir)).toBe('pnpm');
  });

  it('ignores a runner that has no lockfile in the directory', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');
    process.env.npm_config_user_agent = 'yarn/1.22.21 npm/? node/v22.0.0';
    expect(detectPackageManager(dir)).toBe('pnpm');
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

describe('getDlxPrefix', () => {
  it('returns "pnpm dlx" for pnpm projects', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');
    expect(getDlxPrefix(dir)).toBe('pnpm dlx');
  });

  it('returns "yarn dlx" for yarn projects', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'yarn.lock'), '');
    expect(getDlxPrefix(dir)).toBe('yarn dlx');
  });

  it('returns "bunx" for bun projects', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'bun.lockb'), '');
    expect(getDlxPrefix(dir)).toBe('bunx');
  });

  it('falls back to "npx" with no signals', () => {
    const dir = makeTmpDir();
    delete process.env.npm_config_user_agent;
    expect(getDlxPrefix(dir)).toBe('npx');
  });
});

describe('isCliOneOff', () => {
  it('detects an npm npx cache entry', () => {
    process.argv[1] = '/home/u/.npm/_npx/a1b2/node_modules/.bin/astryx';
    expect(isCliOneOff()).toBe(true);
  });

  it('detects a pnpm dlx cache entry', () => {
    process.argv[1] = '/home/u/.cache/pnpm/dlx/9f/node_modules/@astryxdesign/cli/bin/astryx.mjs';
    expect(isCliOneOff()).toBe(true);
  });

  it('detects a bunx cache entry', () => {
    process.argv[1] = '/home/u/.bun/install/cache/@astryxdesign/cli/bin/astryx.mjs';
    expect(isCliOneOff()).toBe(true);
  });

  it('is false for an installed node_modules entry', () => {
    process.argv[1] = '/proj/node_modules/@astryxdesign/cli/bin/astryx.mjs';
    expect(isCliOneOff()).toBe(false);
  });

  it('is false for a source checkout (dev) entry', () => {
    process.argv[1] = '/repo/packages/cli/bin/astryx.mjs';
    expect(isCliOneOff()).toBe(false);
  });
});

describe('getCliInvocation', () => {
  it('uses the run-prefix + bare bin when installed (not one-off)', () => {
    process.argv[1] = '/proj/node_modules/@astryxdesign/cli/bin/astryx.mjs';
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');
    expect(getCliInvocation(dir)).toBe('pnpm exec astryx');
  });

  it('uses the dlx runner + scoped package when run one-off', () => {
    process.argv[1] = '/home/u/.npm/_npx/a1b2/node_modules/.bin/astryx';
    const dir = makeTmpDir();
    delete process.env.npm_config_user_agent;
    expect(getCliInvocation(dir)).toBe('npx @astryxdesign/cli');
  });

  it('pairs the dlx runner with the scoped package for pnpm one-off', () => {
    process.argv[1] = '/home/u/.cache/pnpm/dlx/9f/node_modules/@astryxdesign/cli/bin/astryx.mjs';
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');
    expect(getCliInvocation(dir)).toBe('pnpm dlx @astryxdesign/cli');
  });
});

describe('formatCliCommand', () => {
  it('strips a leading "astryx" token and prepends the invocation stem', () => {
    process.argv[1] = '/proj/node_modules/@astryxdesign/cli/bin/astryx.mjs';
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');
    expect(formatCliCommand('astryx component Button', dir)).toBe('pnpm exec astryx component Button');
  });

  it('accepts a bare subcommand (no leading astryx)', () => {
    process.argv[1] = '/proj/node_modules/@astryxdesign/cli/bin/astryx.mjs';
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'package-lock.json'), '{}');
    expect(formatCliCommand('docs tokens', dir)).toBe('npx astryx docs tokens');
  });

  it('rewrites to the scoped package for one-off invocations', () => {
    process.argv[1] = '/home/u/.npm/_npx/a1b2/node_modules/.bin/astryx';
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'package-lock.json'), '{}');
    expect(formatCliCommand('astryx component Button', dir)).toBe('npx @astryxdesign/cli component Button');
  });
});
