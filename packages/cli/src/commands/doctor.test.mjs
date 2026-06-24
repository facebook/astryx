// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {Command} from 'commander';

import {registerDoctor} from './doctor.mjs';
import {
  runChecks,
  doctor as doctorApi,
  checkNodeVersion,
  checkCoreInstalled,
  checkVersionAlignment,
  checkThemes,
  checkConfig,
  checkAgentDocs,
  checkPeerDeps,
  checkPackageManager,
} from '../api/doctor.mjs';
import {MIN_NODE_VERSION} from '../lib/node-version.mjs';

let tmpDir;
let logCalls;
let exitCode;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-doctor-test-'));
  logCalls = [];
  exitCode = undefined;
  vi.spyOn(console, 'log').mockImplementation((...args) => {
    logCalls.push(args.join(' '));
  });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
  vi.restoreAllMocks();
  delete process.env.ASTRYX_THEME;
});

/** Make a minimal node_modules/@astryxdesign/core in tmpDir with the given version. */
function installCore(version = '0.0.14', peerDependencies) {
  const coreDir = path.join(tmpDir, 'node_modules', '@astryxdesign', 'core');
  fs.mkdirSync(coreDir, {recursive: true});
  const pkg = {name: '@astryxdesign/core', version};
  if (peerDependencies) pkg.peerDependencies = peerDependencies;
  fs.writeFileSync(path.join(coreDir, 'package.json'), JSON.stringify(pkg));
  return coreDir;
}

function installPkg(name, version = '1.0.0') {
  const dir = path.join(tmpDir, 'node_modules', ...name.split('/'));
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({name, version, main: 'index.js'}),
  );
  fs.writeFileSync(path.join(dir, 'index.js'), 'module.exports = {};');
  return dir;
}

function find(checks, id) {
  return checks.find(c => c.id === id);
}

describe('doctor — individual checks', () => {
  it('node-version: PASS uses the real CLI threshold', () => {
    const ok = checkNodeVersion({nodeVersion: '99.0.0'});
    expect(ok.status).toBe('pass');
    expect(ok.message).toContain(MIN_NODE_VERSION);

    const bad = checkNodeVersion({nodeVersion: '18.0.0'});
    expect(bad.status).toBe('fail');
    expect(bad.fix).toContain(MIN_NODE_VERSION);
  });

  it('core-installed: FAIL when @astryxdesign/core is missing, PASS when present', () => {
    const missing = checkCoreInstalled({cwd: tmpDir, coreDir: null});
    expect(missing.status).toBe('fail');
    expect(missing.fix).toBeTruthy();

    const coreDir = installCore('0.0.14');
    const present = checkCoreInstalled({cwd: tmpDir, coreDir});
    expect(present.status).toBe('pass');
    expect(present.message).toContain('0.0.14');
  });

  it('version-alignment: WARN on major/minor drift', () => {
    const coreDir = installCore('9.9.0');
    const drift = checkVersionAlignment({cwd: tmpDir, coreDir});
    expect(drift.status).toBe('warn');
    expect(drift.fix).toBeTruthy();
  });

  it('version-alignment: INFO when core is not installed', () => {
    const res = checkVersionAlignment({cwd: tmpDir, coreDir: null});
    expect(res.status).toBe('info');
  });

  it('themes: WARN when no theme packages installed', () => {
    const res = checkThemes({cwd: tmpDir, configTheme: null});
    expect(res.status).toBe('warn');
  });

  it('themes: WARN when theme installed but not wired', () => {
    installPkg('@astryxdesign/theme-default', '0.0.14');
    const res = checkThemes({cwd: tmpDir, configTheme: null});
    expect(res.status).toBe('warn');
    expect(res.message).toContain('@astryxdesign/theme-default');
  });

  it('themes: PASS when theme installed and wired via config', () => {
    installPkg('@astryxdesign/theme-default', '0.0.14');
    const res = checkThemes({cwd: tmpDir, configTheme: 'default'});
    expect(res.status).toBe('pass');
  });

  it('config: INFO when no astryx.config.mjs', async () => {
    const res = await checkConfig({cwd: tmpDir, configPath: null});
    expect(res.status).toBe('info');
  });

  it('config: PASS when a valid astryx.config.mjs loads', async () => {
    // Vitest intercepts dynamic import() through Vite's resolver, which can't
    // serve a file written to an arbitrary tmp path at runtime. Write the
    // fixture inside the package tree so Vite can resolve it, then clean up.
    const fixtureDir = fs.mkdtempSync(
      path.join(path.dirname(new URL(import.meta.url).pathname), '__doctor_cfg_'),
    );
    const configPath = path.join(fixtureDir, 'astryx.config.mjs');
    try {
      fs.writeFileSync(configPath, 'export default { theme: "default" };');
      const res = await checkConfig({cwd: fixtureDir, configPath});
      if (res.status !== 'pass') {
        throw new Error(`expected pass, got ${res.status}: ${res.message}`);
      }
      expect(res.status).toBe('pass');
    } finally {
      fs.rmSync(fixtureDir, {recursive: true, force: true});
    }
  });

  it('config: FAIL when astryx.config.mjs throws on import', async () => {
    const fixtureDir = fs.mkdtempSync(
      path.join(path.dirname(new URL(import.meta.url).pathname), '__doctor_cfg_'),
    );
    const configPath = path.join(fixtureDir, 'astryx.config.mjs');
    try {
      fs.writeFileSync(configPath, 'throw new Error("boom");\nexport default {};');
      const res = await checkConfig({cwd: fixtureDir, configPath});
      expect(res.status).toBe('fail');
      expect(res.fix).toBeTruthy();
    } finally {
      fs.rmSync(fixtureDir, {recursive: true, force: true});
    }
  });

  it('config: FAIL when packages is the wrong shape', async () => {
    const fixtureDir = fs.mkdtempSync(
      path.join(path.dirname(new URL(import.meta.url).pathname), '__doctor_cfg_'),
    );
    const configPath = path.join(fixtureDir, 'astryx.config.mjs');
    try {
      fs.writeFileSync(configPath, 'export default { packages: [123] };');
      const res = await checkConfig({cwd: fixtureDir, configPath});
      expect(res.status).toBe('fail');
    } finally {
      fs.rmSync(fixtureDir, {recursive: true, force: true});
    }
  });

  it('agent-docs: INFO when no docs present', () => {
    const res = checkAgentDocs({cwd: tmpDir});
    expect(res.status).toBe('info');
    expect(res.fix).toContain('astryx init');
  });

  it('agent-docs: WARN when docs exist without XDS markers', () => {
    fs.writeFileSync(path.join(tmpDir, 'AGENTS.md'), '# AGENTS\nno markers here');
    const res = checkAgentDocs({cwd: tmpDir});
    expect(res.status).toBe('warn');
  });

  it('agent-docs: PASS when XDS markers present', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'AGENTS.md'),
      '# AGENTS\n<!-- XDS:START -->\nstuff\n<!-- XDS:END -->\n',
    );
    const res = checkAgentDocs({cwd: tmpDir});
    expect(res.status).toBe('pass');
  });

  it('peer-deps: INFO when core not installed', () => {
    const res = checkPeerDeps({cwd: tmpDir, coreDir: null});
    expect(res.status).toBe('info');
  });

  it('peer-deps: WARN when a peer is missing', () => {
    const coreDir = installCore('0.0.14', {react: '>=19.0.0'});
    const res = checkPeerDeps({cwd: tmpDir, coreDir});
    expect(res.status).toBe('warn');
    expect(res.message).toContain('react');
  });

  it('peer-deps: PASS when peers are installed', () => {
    const coreDir = installCore('0.0.14', {react: '>=19.0.0'});
    installPkg('react', '19.0.0');
    const res = checkPeerDeps({cwd: tmpDir, coreDir});
    expect(res.status).toBe('pass');
  });

  it('package-manager: INFO, reports yarn from lockfile', () => {
    fs.writeFileSync(path.join(tmpDir, 'yarn.lock'), '');
    const res = checkPackageManager({cwd: tmpDir});
    expect(res.status).toBe('info');
    expect(res.message.toLowerCase()).toContain('yarn');
  });
});

describe('doctor — runChecks / report', () => {
  it('returns checks + a summary with per-status counts', async () => {
    const report = await runChecks({cwd: tmpDir});
    expect(Array.isArray(report.checks)).toBe(true);
    expect(report.checks.length).toBeGreaterThan(0);
    const {pass, warn, fail, info} = report.summary;
    const total = pass + warn + fail + info;
    expect(total).toBe(report.checks.length);
  });

  it('reports a FAIL for core when run in a bare directory', async () => {
    const report = await runChecks({cwd: tmpDir});
    expect(find(report.checks, 'core-installed').status).toBe('fail');
    expect(report.summary.fail).toBeGreaterThan(0);
  });

  it('api doctor() returns the {type, data} envelope', async () => {
    const res = await doctorApi({cwd: tmpDir});
    expect(res.type).toBe('doctor');
    expect(res.data.checks).toBeTruthy();
    expect(res.data.summary).toBeTruthy();
  });
});

function createProgram() {
  const program = new Command();
  program.exitOverride();
  program.option('--json', 'Output as typed JSON');
  registerDoctor(program);
  return program;
}

describe('doctor — command', () => {
  it('--json emits a doctor envelope', async () => {
    const program = createProgram();
    await program.parseAsync(['node', 'astryx', '--json', 'doctor']);
    const out = logCalls.join('\n');
    const parsed = JSON.parse(out);
    expect(parsed.apiVersion).toBe(1);
    expect(parsed.type).toBe('doctor');
    expect(Array.isArray(parsed.data.checks)).toBe(true);
    expect(parsed.data.summary).toHaveProperty('fail');
  });

  it('exit code stays 0 when there are no failures', async () => {
    // Run against the monorepo (where @astryxdesign/core resolves) → no FAIL.
    const prevExit = process.exitCode;
    process.exitCode = undefined;
    const program = createProgram();
    await program.parseAsync(['node', 'astryx', 'doctor']);
    // In the repo, core resolves, so no failures → exitCode untouched.
    expect(process.exitCode).toBeUndefined();
    process.exitCode = prevExit;
  });

  it('sets exit code 1 when a check FAILs (bare dir, no @astryxdesign/core)', async () => {
    const prevCwd = process.cwd();
    const prevExit = process.exitCode;
    process.exitCode = undefined;
    process.chdir(tmpDir);
    try {
      const program = createProgram();
      await program.parseAsync(['node', 'astryx', 'doctor']);
      expect(process.exitCode).toBe(1);
    } finally {
      process.chdir(prevCwd);
      process.exitCode = prevExit;
    }
  });
});
