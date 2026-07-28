// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Upgrade config-codemod-ordering tests.
 *
 * Verifies that CORE codemods run BEFORE the consumer's config is loaded, so a
 * config codemod (v0.1.3 migrate-layout-components, meta.codemodType==='config')
 * can repair an otherwise-invalid config that strict `Project.load` would reject.
 *
 * Like the integration-policy tests, these scaffold a real consumer project
 * (package.json + astryx.config.mjs) under a REPO-LOCAL temp dir (so Vite
 * permits dynamic import of the config module — it blocks /tmp) and chdir in.
 *
 * Cases:
 *   1. dry-run, legacy layout.components, v0.1.3 config codemod in range →
 *      does NOT abort; reports "fixable, re-run with --apply" + the suggested
 *      `--codemod ... --apply` command; exit 0; integrations skipped.
 *   2. --apply, same config → core config codemod writes the repaired config,
 *      then config loads strictly OK and the upgrade completes; on-disk config
 *      is migrated to experimental.xle.components.
 *   3. dry-run, config genuinely invalid (integrations: 5) with NO pending
 *      config codemod → still ABORTS (exit nonzero).
 *   4. happy path (valid config, no config codemod) → unchanged behavior.
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {Command} from 'commander';
import {registerUpgrade} from './upgrade.mjs';

let tmpDir;
let originalCwd;
let logCalls;
let stdoutCalls;
let exitCode;

beforeEach(() => {
  originalCwd = process.cwd();
  // Repo-local temp dir: under cwd so Vite allows the astryx.config import.
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-upgrade-order-'));
  process.chdir(tmpDir);
  logCalls = [];
  stdoutCalls = [];
  exitCode = undefined;
  vi.spyOn(console, 'log').mockImplementation((...a) => logCalls.push(a.join(' ')));
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(process.stdout, 'write').mockImplementation(chunk => {
    stdoutCalls.push(typeof chunk === 'string' ? chunk : chunk.toString());
    return true;
  });
  vi.spyOn(process, 'exit').mockImplementation(code => {
    exitCode = code;
    throw new Error(`__exit ${code}`);
  });
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, {recursive: true, force: true});
  vi.restoreAllMocks();
});

function writePkg() {
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'consumer'}),
  );
}

function writeInstalledCore(version) {
  const dir = path.join(tmpDir, 'node_modules', '@astryxdesign', 'core');
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({name: '@astryxdesign/core', version}),
  );
}

function writeConfig(body) {
  fs.writeFileSync(path.join(tmpDir, 'astryx.config.mjs'), body);
}

function writeSource() {
  fs.mkdirSync(path.join(tmpDir, 'src'), {recursive: true});
  fs.writeFileSync(path.join(tmpDir, 'src', 'index.ts'), 'const foo = 1;\n');
}

const LEGACY_CONFIG = `export default {
  layout: {
    components: {
      KpiCard: '@/components/KpiCard',
    },
  },
};
`;

function createProgram() {
  const program = new Command();
  program.exitOverride();
  program.option('--json', 'Output as typed JSON');
  registerUpgrade(program);
  return program;
}

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
        // keep looking
      }
    }
  }
  return null;
}

async function runHuman(args) {
  const program = createProgram();
  try {
    await program.parseAsync(['node', 'astryx', ...args]);
  } catch (err) {
    if (!String(err?.message || '').startsWith('__exit')) throw err;
  }
  return stdoutCalls.join('') + '\n' + logCalls.join('\n');
}

describe('upgrade — core codemods run before config load', () => {
  it('dry-run: legacy layout.components is reported as fixable, not an abort', async () => {
    // 0.1.2 -> 0.1.3 brings the migrate-layout-components config codemod.
    writePkg();
    writeInstalledCore('0.1.3');
    writeConfig(LEGACY_CONFIG);
    writeSource();

    const result = await runJson([
      '--json',
      'upgrade',
      '--from',
      '0.1.2',
      '--path',
      'src',
    ]);

    expect(result).not.toBeNull();
    // Did NOT abort with a config-validation error.
    expect(result.error).toBeUndefined();
    expect(exitCode).not.toBe(1);
    // Reported as the fixable case with the suggested apply command.
    expect(result.type).toBe('upgrade.status');
    expect(result.data.status).toBe('config_fixable');
    expect(result.data.configCodemods).toContain(
      'migrate-layout-components-to-experimental',
    );
    expect(result.data.suggestedCommand).toBe(
      'astryx upgrade --from 0.1.2 --codemod migrate-layout-components-to-experimental --apply',
    );
    expect(result.data.message).toMatch(/--apply/);
    // Integrations skipped for the preview.
    expect(result.data.note).toMatch(/--apply run/i);
    // Dry-run did not write the config.
    const onDisk = fs.readFileSync(
      path.join(tmpDir, 'astryx.config.mjs'),
      'utf-8',
    );
    expect(onDisk).toContain('layout');
    expect(onDisk).not.toContain('experimental');
  });

  it('human dry-run prints the fixable guidance + suggested command', async () => {
    writePkg();
    writeInstalledCore('0.1.3');
    writeConfig(LEGACY_CONFIG);
    writeSource();

    const out = await runHuman(['upgrade', '--from', '0.1.2', '--path', 'src']);
    expect(out).toMatch(/fails strict validation/i);
    expect(out).toContain(
      'astryx upgrade --from 0.1.2 --codemod migrate-layout-components-to-experimental --apply',
    );
    expect(exitCode).not.toBe(1);
  });

  it('--apply: core config codemod repairs the config, then the upgrade completes', async () => {
    writePkg();
    writeInstalledCore('0.1.3');
    writeConfig(LEGACY_CONFIG);
    writeSource();

    const result = await runJson([
      '--json',
      'upgrade',
      '--from',
      '0.1.2',
      '--path',
      'src',
      '--apply',
    ]);

    expect(result).not.toBeNull();
    expect(result.error).toBeUndefined();
    expect(exitCode).not.toBe(1);
    expect(result.type).toBe('upgrade.run');
    expect(result.data.filesChanged).toBeGreaterThan(0);

    // The on-disk config was migrated to experimental.xle.components.
    const onDisk = fs.readFileSync(
      path.join(tmpDir, 'astryx.config.mjs'),
      'utf-8',
    );
    expect(onDisk).toContain('experimental');
    expect(onDisk).toContain('xle');
    expect(onDisk).toMatch(
      /KpiCard:\s*\{\s*from:\s*['"]@\/components\/KpiCard['"]/,
    );
    expect(onDisk).not.toMatch(/layout\s*:/);
  });

  it('dry-run: a genuinely invalid config with NO fixing codemod still aborts', async () => {
    writePkg();
    writeInstalledCore('0.1.3');
    // `integrations: 5` is invalid AND no config codemod in 0.1.2->0.1.3 fixes it.
    writeConfig(`export default { integrations: 5 };\n`);
    writeSource();

    const result = await runJson([
      '--json',
      'upgrade',
      '--from',
      '0.1.2',
      '--path',
      'src',
    ]);

    expect(result).not.toBeNull();
    // Aborts with a config-validation error (not the fixable status).
    expect(result.error).toBeTruthy();
    expect(result.type).not.toBe('upgrade.status');
    expect(exitCode).toBe(1);
  });

  it('happy path: valid config with no config codemod behaves normally', async () => {
    writePkg();
    writeInstalledCore('0.1.3');
    // A valid, already-migrated config; no relocation needed.
    writeConfig(`export default { integrations: [] };\n`);
    writeSource();

    const result = await runJson([
      '--json',
      'upgrade',
      '--from',
      '0.1.2',
      '--path',
      'src',
      '--apply',
    ]);

    expect(result).not.toBeNull();
    expect(result.error).toBeUndefined();
    expect(exitCode).not.toBe(1);
    // Completed as a run (the config codemod is a no-op on an already-migrated config).
    expect(result.type).toBe('upgrade.run');
  });
});
