// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the CLI peer version warning.
 */

import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {checkCliPeerVersion, cliVersion} from './cli-peer-version.mjs';

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
    expect(checkCliPeerVersion(integration, '0.6.5')).toBeNull();
  });

  it('returns null when the CLI satisfies the peer range', () => {
    const integration = makeIntegration('@test/satisfied', {
      name: '@test/satisfied',
      version: '1.0.0',
      peerDependencies: {'@astryxdesign/cli': '>=0.6.0'},
    });
    expect(checkCliPeerVersion(integration, '0.6.5')).toBeNull();
  });

  it('warns when the CLI is below the peer range', () => {
    const integration = makeIntegration('@test/needs-newer', {
      name: '@test/needs-newer',
      version: '2.0.0',
      peerDependencies: {'@astryxdesign/cli': '>=0.8.0'},
    });
    const result = checkCliPeerVersion(integration, '0.6.5');
    expect(result).not.toBeNull();
    expect(result.severity).toBe('warning');
    expect(result.code).toBe('cli_peer_version');
    expect(result.message).toContain('@test/needs-newer');
    expect(result.message).toContain('>=0.8.0');
    expect(result.message).toContain('0.6.5');
    expect(result.message).toContain('npm install');
  });

  it('handles a caret range that excludes the running CLI', () => {
    const integration = makeIntegration('@test/caret', {
      name: '@test/caret',
      version: '1.0.0',
      peerDependencies: {'@astryxdesign/cli': '^1.0.0'},
    });
    const result = checkCliPeerVersion(integration, '0.6.5');
    expect(result).not.toBeNull();
    expect(result.message).toContain('^1.0.0');
  });

  it('returns null for a caret range the CLI satisfies', () => {
    const integration = makeIntegration('@test/caret-ok', {
      name: '@test/caret-ok',
      version: '1.0.0',
      peerDependencies: {'@astryxdesign/cli': '^0.6.0'},
    });
    expect(checkCliPeerVersion(integration, '0.6.5')).toBeNull();
  });

  it('returns null for an optional peer that is not satisfied (still warns)', () => {
    // Optional peers are still peers: the integration needs a newer CLI to
    // work fully. The warning is about the CLI version, not about whether
    // the peer is required for install.
    const integration = makeIntegration('@test/optional', {
      name: '@test/optional',
      version: '1.0.0',
      peerDependencies: {'@astryxdesign/cli': '>=0.9.0'},
      peerDependenciesMeta: {'@astryxdesign/cli': {optional: true}},
    });
    const result = checkCliPeerVersion(integration, '0.6.5');
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
    expect(checkCliPeerVersion(integration, '0.7.0-canary.abc123')).toBeNull();
    // A canary below the floor should warn
    const result = checkCliPeerVersion(integration, '0.6.5-canary.xyz');
    expect(result).not.toBeNull();
  });

  it('returns null when __packageDir is missing', () => {
    const integration = {name: '@test/no-dir', version: '1.0.0'};
    expect(checkCliPeerVersion(integration, '0.6.5')).toBeNull();
  });

  it('returns null when package.json cannot be read', () => {
    const integration = {
      name: '@test/bad-dir',
      version: '1.0.0',
      __packageDir: path.join(tmpDir, 'nonexistent'),
    };
    expect(checkCliPeerVersion(integration, '0.6.5')).toBeNull();
  });
});

describe('cliVersion', () => {
  it('returns a valid semver string', () => {
    const ver = cliVersion();
    expect(ver).toMatch(/^\d+\.\d+\.\d+/);
  });
});
