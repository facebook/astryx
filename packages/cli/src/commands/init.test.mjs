// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CLI integration tests for `xds init` and related top-level CLI behaviors.
 * Spawns the actual bin to verify exit codes and user-facing output.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BIN = path.resolve(__dirname, '../../bin/xds.mjs');

function runCli(args, {cwd} = {}) {
  return spawnSync('node', [BIN, ...args], {
    cwd: cwd ?? process.cwd(),
    encoding: 'utf-8',
    env: {...process.env, NO_COLOR: '1', FORCE_COLOR: '0'},
  });
}

describe('xds CLI top-level', () => {
  it('exits 1 with a clear error on unknown command', () => {
    const result = runCli(['bogus']);
    expect(result.status).toBe(1);
    const out = (result.stderr || '') + (result.stdout || '');
    expect(out).toMatch(/unknown command/i);
    expect(out).toContain('bogus');
  });
});

describe('xds init --features bogus', () => {
  it('exits 1 on unknown feature', () => {
    const result = runCli(['init', '--features', 'bogus']);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/Unknown features/i);
    expect(result.stderr).toContain('bogus');
  });
});

describe('xds init --agent bogus', () => {
  let tmpDir;
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-init-test-'));
  });
  afterEach(() => {
    fs.rmSync(tmpDir, {recursive: true, force: true});
  });

  it('exits 1 with a clear error on unknown agent (with --features agents)', () => {
    const result = runCli(['init', '--features', 'agents', '--agent', 'bogus'], {cwd: tmpDir});
    expect(result.status).toBe(1);
    const out = (result.stderr || '') + (result.stdout || '');
    expect(out).toMatch(/Unknown agent/i);
    expect(out).toContain('bogus');
  });

  it('exits 1 on unknown agent even without --features', () => {
    const result = runCli(['init', '--agent', 'bogus'], {cwd: tmpDir});
    expect(result.status).toBe(1);
    const out = (result.stderr || '') + (result.stdout || '');
    expect(out).toMatch(/Unknown agent/i);
  });
});

describe('xds init --agent without --features', () => {
  let tmpDir;
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-init-implicit-'));
  });
  afterEach(() => {
    fs.rmSync(tmpDir, {recursive: true, force: true});
  });

  it('implicitly enables the agents feature when --agent is passed', () => {
    const result = runCli(['init', '--agent', 'codex'], {cwd: tmpDir});
    expect(result.status).toBe(0);
    expect(fs.existsSync(path.join(tmpDir, 'AGENTS.md'))).toBe(true);
    const content = fs.readFileSync(path.join(tmpDir, 'AGENTS.md'), 'utf-8');
    expect(content).toContain('# AGENTS');
  });

  it('implicitly enables the agents feature when --agent-docs-path is passed', () => {
    const target = './a.md';
    const result = runCli(['init', '--agent-docs-path', target], {cwd: tmpDir});
    expect(result.status).toBe(0);
    expect(fs.existsSync(path.join(tmpDir, 'a.md'))).toBe(true);
    const content = fs.readFileSync(path.join(tmpDir, 'a.md'), 'utf-8');
    expect(content).toContain('# a');
    expect(content).not.toContain('# a.md');
  });
});

describe('xds init header consistency', () => {
  it('writes the same header style across default, --agent, and --agent-docs-path paths', () => {
    const t1 = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-h1-'));
    runCli(['init', '--features', 'agents'], {cwd: t1});
    const c1 = fs.readFileSync(path.join(t1, '.claude', 'CLAUDE.md'), 'utf-8');

    const t2 = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-h2-'));
    runCli(['init', '--features', 'agents', '--agent', 'codex'], {cwd: t2});
    const c2 = fs.readFileSync(path.join(t2, 'AGENTS.md'), 'utf-8');

    const t3 = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-h3-'));
    runCli(['init', '--features', 'agents', '--agent-docs-path', './CLAUDE.md'], {cwd: t3});
    const c3 = fs.readFileSync(path.join(t3, 'CLAUDE.md'), 'utf-8');

    // All headers must use the stripped-extension form: `# <basename>`.
    expect(c1).toContain('# CLAUDE');
    expect(c1).not.toContain('# CLAUDE.md');
    expect(c2).toContain('# AGENTS');
    expect(c2).not.toContain('# AGENTS.md');
    expect(c3).toContain('# CLAUDE');
    expect(c3).not.toContain('# CLAUDE.md');

    [t1, t2, t3].forEach(t => fs.rmSync(t, {recursive: true, force: true}));
  });
});

describe('xds init --remove-agents', () => {
  let tmpDir;
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-remove-'));
  });
  afterEach(() => {
    fs.rmSync(tmpDir, {recursive: true, force: true});
  });

  it('prints "no agent docs found" when nothing exists', () => {
    const result = runCli(['init', '--remove-agents'], {cwd: tmpDir});
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/no agent docs found/i);
    // Must NOT print the misleading success message when nothing was removed.
    expect(result.stdout).not.toMatch(/AI agent docs removed/i);
  });

  it('removes empty .claude/ directory after cleanup', () => {
    runCli(['init', '--features', 'agents'], {cwd: tmpDir});
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'CLAUDE.md'))).toBe(true);

    const result = runCli(['init', '--remove-agents'], {cwd: tmpDir});
    expect(result.status).toBe(0);
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'CLAUDE.md'))).toBe(false);
    // The now-empty .claude dir should also be cleaned up.
    expect(fs.existsSync(path.join(tmpDir, '.claude'))).toBe(false);
  });
});

describe('postinstall banner', () => {
  function checkBoxAlignment(stdout) {
    const lines = stdout.split('\n');
    const bodyLines = lines.filter(l => l.startsWith('  │ '));
    const topBorder = lines.find(l => l.startsWith('  ╭'));
    const bottomBorder = lines.find(l => l.startsWith('  ╰'));

    expect(bodyLines.length).toBeGreaterThan(5);
    expect(topBorder).toBeDefined();
    expect(bottomBorder).toBeDefined();

    const bodyLen = bodyLines[0].length;
    for (const l of bodyLines) {
      expect(l.length).toBe(bodyLen);
      expect(l.endsWith('│')).toBe(true);
    }
    expect(topBorder.length).toBe(bodyLen);
    expect(bottomBorder.length).toBe(bodyLen);
  }

  it('every body line matches inner width and right border aligns (default)', () => {
    const result = runCli(['postinstall']);
    expect(result.status).toBe(0);
    checkBoxAlignment(result.stdout);
  });

  it('right border aligns with `pnpm exec` prefix (longer command)', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-pnpm-banner-'));
    try {
      fs.writeFileSync(path.join(tmpDir, 'pnpm-lock.yaml'), '');
      const result = runCli(['postinstall'], {cwd: tmpDir});
      expect(result.status).toBe(0);
      checkBoxAlignment(result.stdout);
      expect(result.stdout).toContain('pnpm exec xds');
    } finally {
      fs.rmSync(tmpDir, {recursive: true, force: true});
    }
  });

  it('right border aligns with `bunx` prefix', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-bun-banner-'));
    try {
      fs.writeFileSync(path.join(tmpDir, 'bun.lock'), '');
      const result = runCli(['postinstall'], {cwd: tmpDir});
      expect(result.status).toBe(0);
      checkBoxAlignment(result.stdout);
      expect(result.stdout).toContain('bunx xds');
    } finally {
      fs.rmSync(tmpDir, {recursive: true, force: true});
    }
  });

  it('right border aligns with `yarn` prefix', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-yarn-banner-'));
    try {
      fs.writeFileSync(path.join(tmpDir, 'yarn.lock'), '');
      const result = runCli(['postinstall'], {cwd: tmpDir});
      expect(result.status).toBe(0);
      checkBoxAlignment(result.stdout);
      expect(result.stdout).toContain('yarn xds');
    } finally {
      fs.rmSync(tmpDir, {recursive: true, force: true});
    }
  });
});

describe('lazy-load fallback', () => {
  it('exits 1 when a command failed to load and is invoked', () => {
    // Verify the lazy-load failure path exits non-zero. We synthesize a
    // commander program that follows the same pattern as src/index.mjs,
    // including the failure-fallback action.
    const stub = path.join(os.tmpdir(), `xds-broken-cmd-${Date.now()}.mjs`);
    fs.writeFileSync(stub, `
import {Command} from 'commander';
const program = new Command();
program.name('xds');

const cmd = {name: 'broken', path: './does-not-exist.mjs', register: 'noop'};
try {
  const mod = await import(cmd.path);
  mod[cmd.register](program);
} catch (e) {
  program
    .command(cmd.name)
    .description('(failed to load: ' + e.message + ')')
    .action(() => {
      console.error('Command "' + cmd.name + '" failed to load:');
      console.error(e.message);
      process.exit(1);
    });
}
program.parse(['node', 'xds', 'broken']);
`);
    try {
      const result = spawnSync('node', [stub], {
        encoding: 'utf-8',
        cwd: path.dirname(BIN),
      });
      expect(result.status).toBe(1);
    } finally {
      fs.unlinkSync(stub);
    }
  });
});
