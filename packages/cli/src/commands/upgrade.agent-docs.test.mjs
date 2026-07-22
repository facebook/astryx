// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Agent-docs staleness pass in `upgrade` (#4168).
 *
 * `astryx upgrade` must never leave the managed `<!-- ASTRYX:START -->` block
 * stale after a version bump, and must never claim "no changes needed" while
 * the block is stale:
 *
 * - --apply rewrites a stale block for the installed version, preserving all
 *   content outside the markers byte-for-byte.
 * - Dry-run reports the stale block as a pending change and does NOT write.
 * - A fresh block is left untouched (idempotent).
 * - Core installed but no managed block anywhere and no astryx.config →
 *   nudge toward `astryx init` (never-initialized case).
 * - Detection covers the canonical agent-doc paths PLUS a root-level marker
 *   scan (init --agent-docs-path can write the block to custom files), and
 *   legacy XDS-marker blocks.
 *
 * These run on the early "already up to date" return (from == installed), so
 * they need no jscodeshift; one test drives the full codemod pipeline.
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {Command} from 'commander';
import {registerUpgrade} from './upgrade.mjs';

const MARKER_START = '<!-- ASTRYX:START -->';
const MARKER_END = '<!-- ASTRYX:END -->';

let tmpDir;
let originalCwd;
let logCalls;
let stdoutCalls;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-upgrade-docs-test-'));
  originalCwd = process.cwd();
  process.chdir(tmpDir);
  logCalls = [];
  stdoutCalls = [];
  vi.spyOn(console, 'log').mockImplementation((...args) => {
    logCalls.push(args.join(' '));
  });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(process.stdout, 'write').mockImplementation(chunk => {
    stdoutCalls.push(typeof chunk === 'string' ? chunk : chunk.toString());
    return true;
  });
  vi.spyOn(process, 'exit').mockImplementation(code => {
    throw new Error(`__exit ${code}`);
  });
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, {recursive: true, force: true});
  vi.restoreAllMocks();
});

function createProgram() {
  const program = new Command();
  program.exitOverride();
  program.option('--json', 'Output as typed JSON');
  registerUpgrade(program);
  return program;
}

function writePkg(deps = {}) {
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'fixture', dependencies: deps}, null, 2),
  );
}

function writeInstalledCore(version) {
  const dir = path.join(tmpDir, 'node_modules', '@astryxdesign', 'core');
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({name: '@astryxdesign/core', version}, null, 2),
  );
}

/**
 * Write an agent-doc file whose managed block is stamped with an old version,
 * surrounded by hand-written content that must survive a refresh untouched.
 */
function writeStaleDoc(rel, {blockVersion = '0.0.1'} = {}) {
  const content = [
    '# My project',
    '',
    'Hand-written notes ABOVE the managed block.',
    '',
    MARKER_START,
    `Astryx v${blockVersion} · 12 components`,
    'old guidance the agent should no longer see',
    MARKER_END,
    '',
    'Hand-written notes BELOW the managed block.',
    '',
  ].join('\n');
  const abs = path.join(tmpDir, rel);
  fs.mkdirSync(path.dirname(abs), {recursive: true});
  fs.writeFileSync(abs, content);
  return content;
}

function readDoc(rel) {
  return fs.readFileSync(path.join(tmpDir, rel), 'utf-8');
}

/** Content before MARKER_START and after MARKER_END (the user-owned parts). */
function outsideBlock(content) {
  const start = content.indexOf(MARKER_START);
  const end = content.indexOf(MARKER_END) + MARKER_END.length;
  return {prefix: content.slice(0, start), suffix: content.slice(end)};
}

/** Run a command and capture the parsed JSON envelope (last printed JSON line). */
async function runJson(args) {
  const program = createProgram();
  try {
    await program.parseAsync(['node', 'astryx', ...args]);
  } catch (err) {
    if (!String(err?.message || '').startsWith('__exit')) throw err;
  }
  for (let i = logCalls.length - 1; i >= 0; i--) {
    const line = logCalls[i];
    if (line.startsWith('{')) {
      try {
        return JSON.parse(line);
      } catch {
        // not JSON, keep looking
      }
    }
  }
  return null;
}

/** Run a command in human mode and return the combined output. */
async function runHuman(args) {
  const program = createProgram();
  try {
    await program.parseAsync(['node', 'astryx', ...args]);
  } catch (err) {
    if (!String(err?.message || '').startsWith('__exit')) throw err;
  }
  return stdoutCalls.join('') + logCalls.join('\n');
}

describe('upgrade --apply refreshes a stale agent-docs block', () => {
  it('rewrites the block for the installed version, preserving outside content byte-for-byte', async () => {
    writePkg();
    writeInstalledCore('0.0.15');
    const original = writeStaleDoc('AGENTS.md');

    const result = await runJson(['--json', 'upgrade', '--from', '0.0.15', '--apply']);
    expect(result?.type).toBe('upgrade.status');
    expect(result.data.status).toBe('up_to_date');
    expect(result.data.agentDocs.refreshed).toEqual(['AGENTS.md']);
    expect(result.data.agentDocs.stale).toEqual([]);

    const updated = readDoc('AGENTS.md');
    expect(updated).toContain('Astryx v0.0.15');
    expect(updated).not.toContain('Astryx v0.0.1 ');
    expect(updated).not.toContain('old guidance');
    // Everything outside the markers is untouched, byte-for-byte.
    expect(outsideBlock(updated)).toEqual(outsideBlock(original));
  });

  it('refreshes a block in a custom root-level file found by marker scan', async () => {
    writePkg();
    writeInstalledCore('0.0.15');
    writeStaleDoc('NOTES.md'); // init --agent-docs-path NOTES.md scenario

    const result = await runJson(['--json', 'upgrade', '--from', '0.0.15', '--apply']);
    expect(result.data.agentDocs.refreshed).toEqual(['NOTES.md']);
    expect(readDoc('NOTES.md')).toContain('Astryx v0.0.15');
  });

  it('migrates a legacy XDS-marker block to current markers on refresh', async () => {
    writePkg();
    writeInstalledCore('0.0.15');
    fs.writeFileSync(
      path.join(tmpDir, 'AGENTS.md'),
      `# doc\n\n<!-- XDS:START -->\nXDS v0.0.2 · 9 components\n<!-- XDS:END -->\nafter\n`,
    );

    const result = await runJson(['--json', 'upgrade', '--from', '0.0.15', '--apply']);
    expect(result.data.agentDocs.refreshed).toEqual(['AGENTS.md']);
    const updated = readDoc('AGENTS.md');
    expect(updated).toContain(MARKER_START);
    expect(updated).toContain('Astryx v0.0.15');
    expect(updated).not.toContain('XDS:START');
    expect(updated).toContain('after');
  });

  it('is idempotent: a just-refreshed block is reported fresh and left untouched', async () => {
    writePkg();
    writeInstalledCore('0.0.15');
    writeStaleDoc('AGENTS.md');

    await runJson(['--json', 'upgrade', '--from', '0.0.15', '--apply']);
    const afterFirst = readDoc('AGENTS.md');

    const second = await runJson(['--json', 'upgrade', '--from', '0.0.15', '--apply']);
    expect(second.data.agentDocs.refreshed).toEqual([]);
    expect(second.data.agentDocs.stale).toEqual([]);
    expect(readDoc('AGENTS.md')).toBe(afterFirst);
  });
});

describe('upgrade dry-run reports a stale block without writing', () => {
  it('lists the stale block (with versions) as a pending change and leaves the file unchanged', async () => {
    writePkg();
    writeInstalledCore('0.0.15');
    const original = writeStaleDoc('AGENTS.md');

    const result = await runJson(['--json', 'upgrade', '--from', '0.0.15']);
    expect(result?.type).toBe('upgrade.status');
    expect(result.data.status).toBe('up_to_date');
    expect(result.data.agentDocs.refreshed).toEqual([]);
    expect(result.data.agentDocs.stale).toEqual([
      {path: 'AGENTS.md', blockVersion: '0.0.1'},
    ]);
    expect(readDoc('AGENTS.md')).toBe(original);
  });

  it('prints the stale-block warning and the --apply next step in human mode', async () => {
    writePkg();
    writeInstalledCore('0.0.15');
    const original = writeStaleDoc('AGENTS.md');

    const output = await runHuman(['upgrade', '--from', '0.0.15']);
    expect(output).toContain(
      'Agent docs block in AGENTS.md is at v0.0.1 (installed: v0.0.15).',
    );
    expect(output).toMatch(/upgrade --from 0\.0\.15 --apply/);
    expect(output).toContain('Dry run complete');
    expect(readDoc('AGENTS.md')).toBe(original);
  });

  it('stays quiet about agent docs when the block is already fresh', async () => {
    writePkg();
    writeInstalledCore('0.0.15');
    writeStaleDoc('AGENTS.md');
    await runJson(['--json', 'upgrade', '--from', '0.0.15', '--apply']);
    logCalls.length = 0;
    stdoutCalls.length = 0;

    const output = await runHuman(['upgrade', '--from', '0.0.15']);
    expect(output).not.toContain('Agent docs');
    expect(output).toContain('Done');
  });
});

describe('upgrade nudges when the project was never initialized', () => {
  it('flags missing agent docs when core is installed but no block and no config exist', async () => {
    writePkg();
    writeInstalledCore('0.0.15');

    const result = await runJson(['--json', 'upgrade', '--from', '0.0.15']);
    expect(result.data.agentDocs.missing).toBe(true);
    expect(result.data.agentDocs.stale).toEqual([]);
    expect(result.data.agentDocs.refreshed).toEqual([]);
  });

  it('prints the init nudge in human mode', async () => {
    writePkg();
    writeInstalledCore('0.0.15');

    const output = await runHuman(['upgrade', '--from', '0.0.15']);
    expect(output).toContain('No agent docs found');
    expect(output).toMatch(/init/);
  });

  it('does not nudge when an astryx.config exists (deliberate no-agent-docs setup)', async () => {
    writePkg();
    writeInstalledCore('0.0.15');
    fs.writeFileSync(path.join(tmpDir, 'astryx.config.mjs'), 'export default {};\n');

    const result = await runJson(['--json', 'upgrade', '--from', '0.0.15']);
    expect(result.data.agentDocs.missing).toBe(false);
  });

  it('does not nudge when a doc file has a block but no markers elsewhere', async () => {
    writePkg();
    writeInstalledCore('0.0.15');
    writeStaleDoc('.claude/CLAUDE.md');

    const result = await runJson(['--json', 'upgrade', '--from', '0.0.15']);
    expect(result.data.agentDocs.missing).toBe(false);
    expect(result.data.agentDocs.stale).toEqual([
      {path: '.claude/CLAUDE.md', blockVersion: '0.0.1'},
    ]);
  });
});

describe('upgrade full pipeline carries the agent-docs result', () => {
  it('reports the stale block in the receipt on a real version-range dry run', async () => {
    writePkg();
    writeInstalledCore('0.0.10');
    fs.mkdirSync(path.join(tmpDir, 'src'), {recursive: true});
    fs.writeFileSync(path.join(tmpDir, 'src', 'index.ts'), 'const x = 1;\n');
    const original = writeStaleDoc('AGENTS.md');

    const result = await runJson([
      '--json',
      'upgrade',
      '--from',
      '0.0.9',
      '--path',
      'src',
    ]);
    expect(result).not.toBeNull();
    // Either envelope (receipt or no_codemods status) must carry agentDocs.
    expect(['upgrade.run', 'upgrade.status']).toContain(result.type);
    expect(result.data.agentDocs.stale).toEqual([
      {path: 'AGENTS.md', blockVersion: '0.0.1'},
    ]);
    // Dry-run never writes the docs — that was the old (broken) behavior.
    expect(readDoc('AGENTS.md')).toBe(original);
    if (result.type === 'upgrade.run') {
      expect(result.data.agentDocsRefreshed).toBe(false);
    }
  });
});
