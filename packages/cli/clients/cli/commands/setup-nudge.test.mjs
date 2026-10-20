// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Guardrail tests — the centralized setup check + enforcement layer 3.
 *
 * Unit: isAstryxInitialized() detects the Astryx marker across EVERY agent-doc
 * location (including the previously-missed Hermes files) and legacy XDS blocks.
 *
 * Integration: the CLI nudges (stderr) before a command when the project hasn't
 * run init — INCLUDING in --json mode (agents pass --json, and stderr never
 * corrupts the stdout JSON envelope). Quiet once set up, outside a project, and
 * for the installer command itself.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {fileURLToPath} from 'node:url';
import {
  isAstryxInitialized,
  isAstryxPromptInReach,
} from '../../../foundation/agent-docs/agent-docs.mjs';
import {runCli} from '../../../test-utils/run-cli.mjs';

/** This source checkout: the tests run the CLI from it. */
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..');

/** Is `dir` inside a git repository? The temp folder normally is not. */
function insideRepository(dir) {
  for (let d = path.resolve(dir); ; d = path.dirname(d)) {
    if (fs.existsSync(path.join(d, '.git'))) return true;
    if (path.dirname(d) === d) return false;
  }
}

const MARKER = '<!-- ASTRYX:START -->';
const NUDGE = /finish setup and install the Astryx agent prompt/;

let tmp;
beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-setup-nudge-'));
});
afterEach(() => {
  fs.rmSync(tmp, {recursive: true, force: true});
});

function write(rel, body) {
  const p = path.join(tmp, rel);
  fs.mkdirSync(path.dirname(p), {recursive: true});
  fs.writeFileSync(p, body);
}

describe('isAstryxInitialized — centralized setup check (one place)', () => {
  it('is false in an empty project', () => {
    expect(isAstryxInitialized(tmp)).toBe(false);
  });

  // Covers EVERY location a preset can write — .hermes.md/HERMES.md were the gap.
  it.each(['AGENTS.md', 'CLAUDE.md', '.claude/CLAUDE.md', '.cursorrules', '.hermes.md', 'HERMES.md'])(
    'detects the marker in %s',
    file => {
      write(file, `# doc\n${MARKER}\nbody`);
      expect(isAstryxInitialized(tmp)).toBe(true);
    },
  );

  it('detects the legacy XDS marker for back-compat', () => {
    write('AGENTS.md', '<!-- XDS:START -->');
    expect(isAstryxInitialized(tmp)).toBe(true);
  });

  it('is false when a doc file exists WITHOUT the marker', () => {
    write('AGENTS.md', 'project notes, no astryx block');
    expect(isAstryxInitialized(tmp)).toBe(false);
  });
});

// Agents read the agent docs between the repository root and the folder they
// work in, so a monorepo initialized at its root is set up in every package.
describe('isAstryxPromptInReach — up to the repository root', () => {
  it('finds init\'s block at the repository root from a workspace package', () => {
    fs.mkdirSync(path.join(tmp, '.git'));
    write('AGENTS.md', MARKER);
    write('packages/app/package.json', '{"name":"app"}');
    expect(isAstryxPromptInReach(path.join(tmp, 'packages/app'))).toBe(true);
  });

  it('treats a worktree .git file as the repository root', () => {
    write('.git', 'gitdir: /elsewhere\n');
    write('CLAUDE.md', MARKER);
    write('packages/app/package.json', '{"name":"app"}');
    expect(isAstryxPromptInReach(path.join(tmp, 'packages/app'))).toBe(true);
  });

  it('does not look above the repository root', () => {
    write('AGENTS.md', MARKER);
    fs.mkdirSync(path.join(tmp, 'repo/.git'), {recursive: true});
    write('repo/pkg/package.json', '{"name":"pkg"}');
    expect(isAstryxPromptInReach(path.join(tmp, 'repo/pkg'))).toBe(false);
  });

  it.skipIf(insideRepository(os.tmpdir()))(
    'checks only the folder itself outside a repository',
    () => {
      write('AGENTS.md', MARKER);
      write('pkg/package.json', '{"name":"pkg"}');
      expect(isAstryxPromptInReach(tmp)).toBe(true);
      expect(isAstryxPromptInReach(path.join(tmp, 'pkg'))).toBe(false);
    },
  );
});

describe('enforcement layer 3 — per-command setup nudge', () => {
  const asProject = () => write('package.json', '{"name":"t"}');

  it('nudges on stderr after a command when not set up', async () => {
    asProject();
    const r = await runCli(['docs', 'tokens'], tmp);
    expect(r.stderr).toMatch(NUDGE);
  });

  it('is suppressed in --json (machine mode stays clean), stdout valid JSON', async () => {
    asProject();
    const r = await runCli(['--json', 'docs', 'tokens'], tmp);
    // --json is machine output with a clean stdout+stderr contract; the human
    // nudge must NOT leak into it (json-shim: error envelopes have empty stderr).
    expect(r.stderr).not.toMatch(NUDGE);
    expect(() => JSON.parse(r.stdout)).not.toThrow();
  });

  it('is quiet once set up (marker present)', async () => {
    asProject();
    write('AGENTS.md', MARKER);
    expect((await runCli(['docs', 'tokens'], tmp)).stderr).not.toMatch(NUDGE);
  });

  it('is quiet outside a project (no package.json)', async () => {
    expect((await runCli(['docs', 'tokens'], tmp)).stderr).not.toMatch(NUDGE);
  });

  it('is quiet in an integration package, which is not an app', async () => {
    asProject();
    write('astryx.integration.mjs', 'export default {};\n');
    expect((await runCli(['docs', 'tokens'], tmp)).stderr).not.toMatch(NUDGE);
  });

  it('does not nudge for the installer command itself', async () => {
    asProject();
    expect((await runCli(['init'], tmp)).stderr).not.toMatch(NUDGE);
  });

  it('is quiet in a workspace package when init\'s block is at the repository root', async () => {
    fs.mkdirSync(path.join(tmp, '.git'));
    write('AGENTS.md', MARKER);
    write('packages/app/package.json', '{"name":"app"}');
    const r = await runCli(['docs', 'tokens'], path.join(tmp, 'packages/app'));
    expect(r.stderr).not.toMatch(NUDGE);
  });

  it('still nudges in a workspace package with no block up to the repository root', async () => {
    fs.mkdirSync(path.join(tmp, '.git'));
    write('AGENTS.md', 'project notes, no astryx block');
    write('packages/app/package.json', '{"name":"app"}');
    const r = await runCli(['docs', 'tokens'], path.join(tmp, 'packages/app'));
    expect(r.stderr).toMatch(NUDGE);
  });

  // The tests run the CLI from this checkout, so a project inside it is the
  // contributor flow. The same project in the temp folder nudges (above).
  it('is quiet inside the source checkout the CLI runs from', async () => {
    const inside = fs.mkdtempSync(path.join(REPO, '.astryx-setup-nudge-'));
    try {
      fs.writeFileSync(path.join(inside, 'package.json'), '{"name":"t"}');
      expect((await runCli(['docs', 'tokens'], inside)).stderr).not.toMatch(NUDGE);
    } finally {
      fs.rmSync(inside, {recursive: true, force: true});
    }
  });
});
