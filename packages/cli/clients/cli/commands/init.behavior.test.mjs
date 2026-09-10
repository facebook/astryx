// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Behavior coverage for `astryx init`.
 *
 * init.next-steps.test.mjs covers the pure getNextSteps() copy; this file
 * covers what the COMMAND actually does — the file writes, feature flags,
 * agent presets, idempotency, and error exits — by driving the real program
 * in-process (test-utils/run-cli.mjs) against a throwaway cwd. init reads
 * process.cwd(), which the harness sets to the temp dir per run.
 *
 * These lock the non-interactive contract: `astryx init` never prompts, is
 * safe to re-run, writes the tool-agnostic AGENTS.md by default, and fails
 * loudly (non-zero) only on bad input.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {runCli} from '../../../test-utils/run-cli.mjs';

const MARKER_START = '<!-- ASTRYX:START -->';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-init-behavior-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

/** @param {string} rel */
const read = rel => fs.readFileSync(path.join(tmpDir, rel), 'utf8');
/** @param {string} rel */
const exists = rel => fs.existsSync(path.join(tmpDir, rel));

describe('astryx init — default (no flags)', () => {
  it('installs the tool-agnostic AGENTS.md cheat sheet and prints next steps', async () => {
    const {status, stdout} = await runCli(['init'], {cwd: tmpDir});
    expect(status).toBe(0);
    expect(exists('AGENTS.md')).toBe(true);
    expect(read('AGENTS.md')).toContain(MARKER_START);
    // The non-interactive default always emits the getting-started guidance.
    expect(stdout).toMatch(/Next steps:/);
  });

  it('is non-interactive: exits cleanly with no TTY and no prompt text', async () => {
    const {status, stdout, stderr} = await runCli(['init'], {cwd: tmpDir});
    expect(status).toBe(0);
    // A prompt would ask a question; the non-interactive contract forbids it.
    expect(stdout).not.toMatch(/\?\s*$/m);
    expect(stderr).not.toMatch(/prompt|inquirer/i);
  });

  it('is idempotent: re-running keeps a single Astryx block (no duplication)', async () => {
    await runCli(['init'], {cwd: tmpDir});
    await runCli(['init'], {cwd: tmpDir});
    const contents = read('AGENTS.md');
    const blocks = contents.split(MARKER_START).length - 1;
    expect(blocks).toBe(1);
  });
});

describe('astryx init --features', () => {
  it('--features agents writes AGENTS.md only', async () => {
    const {status} = await runCli(['init', '--features', 'agents'], {cwd: tmpDir});
    expect(status).toBe(0);
    expect(exists('AGENTS.md')).toBe(true);
  });

  it('--features theme writes the annotated theme template', async () => {
    const {status, stdout} = await runCli(['init', '--features', 'theme'], {cwd: tmpDir});
    expect(status).toBe(0);
    expect(exists('theme.template.ts')).toBe(true);
    expect(read('theme.template.ts')).toMatch(/defineTheme/);
    expect(read('theme.template.ts')).not.toMatch(/Copyright \(c\) Meta Platforms/);
    expect(stdout).toMatch(/theme/i);
  });

  it('--features theme never clobbers an existing theme.template.ts', async () => {
    // Someone's edited copy outranks ours; re-running init must be safe.
    fs.writeFileSync(path.join(tmpDir, 'theme.template.ts'), '// mine\n');
    const {status, stdout} = await runCli(['init', '--features', 'theme'], {cwd: tmpDir});
    expect(status).toBe(0);
    expect(read('theme.template.ts')).toBe('// mine\n');
    expect(stdout).toMatch(/already exists/);
  });

  it('rejects an unknown feature with exit 1 and a helpful message', async () => {
    const {status, stderr} = await runCli(['init', '--features', 'bogus'], {cwd: tmpDir});
    expect(status).toBe(1);
    expect(stderr).toMatch(/Unknown features: bogus/);
    expect(stderr).toMatch(/agents, theme, template/);
    // A rejected run must not have written anything.
    expect(fs.readdirSync(tmpDir)).toEqual([]);
  });

  it('--all installs every feature (AGENTS.md present, exit 0)', async () => {
    const {status} = await runCli(['init', '--all'], {cwd: tmpDir});
    expect(status).toBe(0);
    expect(exists('AGENTS.md')).toBe(true);
  });
});

describe('astryx init --agent <preset>', () => {
  it('--agent claude targets .claude/CLAUDE.md', async () => {
    const {status} = await runCli(['init', '--agent', 'claude'], {cwd: tmpDir});
    expect(status).toBe(0);
    expect(exists('.claude/CLAUDE.md')).toBe(true);
    expect(read('.claude/CLAUDE.md')).toContain(MARKER_START);
  });

  it('--agent all creates both the AGENTS.md and Claude defaults', async () => {
    const {status} = await runCli(['init', '--agent', 'all'], {cwd: tmpDir});
    expect(status).toBe(0);
    expect(exists('AGENTS.md')).toBe(true);
    expect(exists('.claude/CLAUDE.md')).toBe(true);
  });
});

describe('astryx init --remove-agents', () => {
  it('removes the Astryx section it previously installed', async () => {
    await runCli(['init', '--features', 'agents'], {cwd: tmpDir});
    expect(exists('AGENTS.md')).toBe(true);

    const {status, stdout} = await runCli(['init', '--remove-agents'], {cwd: tmpDir});
    expect(status).toBe(0);
    expect(stdout).toMatch(/removed/i);
    // AGENTS.md was created solely by us and is now empty → deleted.
    expect(exists('AGENTS.md')).toBe(false);
  });
});

describe('astryx init --json', () => {
  it('emits the install receipt as an envelope', async () => {
    const {status, stdout} = await runCli(['init', '--json'], {cwd: tmpDir});
    expect(status).toBe(0);

    const env = JSON.parse(stdout);
    expect(env.type).toBe('init.run');
    expect(env.data.mode).toBe('default');
    expect(env.data.docsWritten).toContain('AGENTS.md');
    expect(env.data.docsError).toBe(null);
  });

  it('still does the work', async () => {
    await runCli(['init', '--json'], {cwd: tmpDir});
    expect(exists('AGENTS.md')).toBe(true);
    expect(read('AGENTS.md')).toContain(MARKER_START);
  });

  it('keeps stdout a single envelope — no guidance text leaks in', async () => {
    const {stdout} = await runCli(['init', '--json'], {cwd: tmpDir});
    // The human path prints a "Next steps:" block; under --json the whole of
    // stdout has to parse, so any of it leaking would fail here.
    expect(() => JSON.parse(stdout)).not.toThrow();
    expect(stdout).not.toMatch(/Next steps:/);
  });

  it('reports the features it ran with --all', async () => {
    const {stdout} = await runCli(['init', '--all', '--json'], {cwd: tmpDir});
    const env = JSON.parse(stdout);
    expect(env.data.mode).toBe('features');
    expect(env.data.features).toEqual(
      expect.arrayContaining(['agents', 'theme']),
    );
  });

  it('emits init.remove for --remove-agents', async () => {
    await runCli(['init'], {cwd: tmpDir});
    const {stdout} = await runCli(['init', '--remove-agents', '--json'], {
      cwd: tmpDir,
    });
    const env = JSON.parse(stdout);
    expect(env.type).toBe('init.remove');
    expect(env.data.removed).toBe(true);
  });

  it('reports a bad --agent as an error envelope, not a receipt', async () => {
    const {status, stdout} = await runCli(
      ['init', '--agent', 'bogus', '--json'],
      {cwd: tmpDir},
    );
    expect(status).toBe(1);
    const env = JSON.parse(stdout);
    expect(env.code).toBe('ERR_UNKNOWN_AGENT');
    expect(env.type).toBeUndefined();
  });

  it('agrees with human mode on the exit code', async () => {
    const human = await runCli(['init', '--agent', 'bogus'], {cwd: tmpDir});
    const json = await runCli(['init', '--agent', 'bogus', '--json'], {
      cwd: tmpDir,
    });
    expect(json.status).toBe(human.status);
  });
});
