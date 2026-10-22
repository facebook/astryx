// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the CLI peer version warning.
 */

import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {checkCliPeerVersion, cliVersion} from './cli-peer-version.mjs';
import {runCli} from '../../test-utils/run-cli.mjs';

/** @type {string} */
let tmpDir;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-cli-peer-'));
});

afterAll(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

/**
 * @param {string} name
 * @param {Record<string, unknown>} pkgJson
 */
function makeIntegration(name, pkgJson) {
  const dir = path.join(tmpDir, name.replace(/[/@]/g, '_'));
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkgJson));
  return {name, version: String(pkgJson.version ?? '1.0.0'), __packageDir: dir};
}

describe('checkCliPeerVersion', () => {
  it('returns null when no @astryxdesign/cli peer is declared', () => {
    const integration = makeIntegration('@test/no-peer', {
      name: '@test/no-peer',
      version: '1.0.0',
    });
    expect(checkCliPeerVersion(integration, '0.6.5', tmpDir)).toBeNull();
  });

  it('returns null when the CLI satisfies the peer range', () => {
    const integration = makeIntegration('@test/satisfied', {
      name: '@test/satisfied',
      version: '1.0.0',
      peerDependencies: {'@astryxdesign/cli': '>=0.6.0'},
    });
    expect(checkCliPeerVersion(integration, '0.6.5', tmpDir)).toBeNull();
  });

  it('warns when the CLI is below the peer range', () => {
    const integration = makeIntegration('@test/needs-newer', {
      name: '@test/needs-newer',
      version: '2.0.0',
      peerDependencies: {'@astryxdesign/cli': '>=0.8.0'},
    });
    const project = path.join(tmpDir, 'npm-project');
    fs.mkdirSync(project, {recursive: true});
    fs.writeFileSync(path.join(project, 'package-lock.json'), '{}\n');
    const result = checkCliPeerVersion(integration, '0.6.5', project);
    expect(result).not.toBeNull();
    expect(result.severity).toBe('warning');
    expect(result.code).toBe('cli_peer_version');
    expect(result.message).toContain('@test/needs-newer');
    expect(result.message).toContain('>=0.8.0');
    expect(result.message).toContain('0.6.5');
    expect(result.message).toContain('`npm install @astryxdesign/cli@latest`');
  });

  it("names the project's own package manager in the upgrade command", () => {
    const project = path.join(tmpDir, 'pnpm-project');
    fs.mkdirSync(project, {recursive: true});
    fs.writeFileSync(path.join(project, 'pnpm-lock.yaml'), "lockfileVersion: '9.0'\n");
    const integration = makeIntegration('@test/pnpm', {
      name: '@test/pnpm',
      version: '1.0.0',
      peerDependencies: {'@astryxdesign/cli': '>=0.8.0'},
    });
    const result = checkCliPeerVersion(integration, '0.6.5', project);
    expect(result?.message).toContain('`pnpm add @astryxdesign/cli@latest`');
  });

  it('does not ask for an upgrade when the CLI is newer than the range', () => {
    const integration = makeIntegration('@test/older', {
      name: '@test/older',
      version: '1.0.0',
      peerDependencies: {'@astryxdesign/cli': '^0.6.0'},
    });
    const result = checkCliPeerVersion(integration, '0.7.3', tmpDir);
    expect(result?.code).toBe('cli_peer_version');
    expect(result?.severity).toBe('warning');
    expect(result?.message).toBe(
      '@test/older supports @astryxdesign/cli ^0.6.0, but this CLI is 0.7.3, outside that range, so some of what it ships may not work as its author tested. Look for a release of @test/older that supports 0.7.3.',
    );
  });

  it('handles a caret range that excludes the running CLI', () => {
    const integration = makeIntegration('@test/caret', {
      name: '@test/caret',
      version: '1.0.0',
      peerDependencies: {'@astryxdesign/cli': '^1.0.0'},
    });
    const result = checkCliPeerVersion(integration, '0.6.5', tmpDir);
    expect(result).not.toBeNull();
    expect(result.message).toContain('^1.0.0');
  });

  it('returns null for a caret range the CLI satisfies', () => {
    const integration = makeIntegration('@test/caret-ok', {
      name: '@test/caret-ok',
      version: '1.0.0',
      peerDependencies: {'@astryxdesign/cli': '^0.6.0'},
    });
    expect(checkCliPeerVersion(integration, '0.6.5', tmpDir)).toBeNull();
  });

  it('warns for an optional peer the CLI does not satisfy', () => {
    // Optional peers are still peers: the integration needs a newer CLI to
    // work fully. The warning is about the CLI version, not about whether
    // the peer is required for install.
    const integration = makeIntegration('@test/optional', {
      name: '@test/optional',
      version: '1.0.0',
      peerDependencies: {'@astryxdesign/cli': '>=0.9.0'},
      peerDependenciesMeta: {'@astryxdesign/cli': {optional: true}},
    });
    const result = checkCliPeerVersion(integration, '0.6.5', tmpDir);
    expect(result).not.toBeNull();
    expect(result.severity).toBe('warning');
  });

  it('handles a prerelease CLI version gracefully', () => {
    const integration = makeIntegration('@test/prerelease', {
      name: '@test/prerelease',
      version: '1.0.0',
      peerDependencies: {'@astryxdesign/cli': '>=0.7.0'},
    });
    // A canary like 0.7.0-canary.abc123 should satisfy >=0.7.0
    expect(checkCliPeerVersion(integration, '0.7.0-canary.abc123', tmpDir)).toBeNull();
    // A canary below the floor should warn
    const result = checkCliPeerVersion(integration, '0.6.5-canary.xyz', tmpDir);
    expect(result).not.toBeNull();
  });

  it('returns null when __packageDir is missing', () => {
    const integration = {name: '@test/no-dir', version: '1.0.0'};
    expect(checkCliPeerVersion(integration, '0.6.5', tmpDir)).toBeNull();
  });

  it('returns null when package.json cannot be read', () => {
    const integration = {
      name: '@test/bad-dir',
      version: '1.0.0',
      __packageDir: path.join(tmpDir, 'nonexistent'),
    };
    expect(checkCliPeerVersion(integration, '0.6.5', tmpDir)).toBeNull();
  });
});

describe('cliVersion', () => {
  it('returns a valid semver string', () => {
    const ver = cliVersion();
    expect(ver).toMatch(/^\d+\.\d+\.\d+/);
  });
});

describe('in a project', () => {
  /**
   * A project that installs @acme/widgets with the given CLI peer range.
   * @param {string} range
   */
  function project(range) {
    const root = fs.mkdtempSync(path.join(tmpDir, 'project-'));
    fs.writeFileSync(
      path.join(root, 'package.json'),
      JSON.stringify({
        name: 'app',
        version: '1.0.0',
        dependencies: {'@acme/widgets': '^1.0.0'},
      }),
    );
    fs.writeFileSync(path.join(root, 'package-lock.json'), '{}\n');
    const pkg = path.join(root, 'node_modules', '@acme', 'widgets');
    fs.mkdirSync(pkg, {recursive: true});
    fs.writeFileSync(
      path.join(pkg, 'package.json'),
      JSON.stringify({
        name: '@acme/widgets',
        version: '1.0.0',
        peerDependencies: {'@astryxdesign/cli': range},
      }),
    );
    fs.writeFileSync(path.join(pkg, 'astryx.integration.mjs'), 'export default {};\n');
    return root;
  }

  /** @param {string} cwd */
  async function validate(cwd) {
    const {status, stdout} = await runCli(
      ['doctor', 'integration', 'validate', '@acme/widgets', '--json'],
      {cwd},
    );
    return {status, issues: JSON.parse(stdout).data.issues};
  }

  it('doctor integration validate warns, and still exits 0, when the CLI is below the range', async () => {
    const {status, issues} = await validate(project('>=99.0.0'));
    expect(status).toBe(0);
    expect(issues).toContainEqual(
      expect.objectContaining({
        code: 'cli_peer_version',
        severity: 'warning',
        message: `@acme/widgets needs @astryxdesign/cli >=99.0.0, but this CLI is ${cliVersion()}, so some of what it ships may not load. Upgrade the CLI: \`npm install @astryxdesign/cli@latest\`.`,
      }),
    );
  });

  it('says nothing when the CLI is in the range', async () => {
    const {status, issues} = await validate(project(`>=${cliVersion()}`));
    expect(status).toBe(0);
    expect(issues.map((/** @type {{code: string}} */ i) => i.code)).not.toContain(
      'cli_peer_version',
    );
  });
});
