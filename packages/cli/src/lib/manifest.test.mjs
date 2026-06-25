// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the CLI capability manifest.
 *
 * Two jobs:
 *   1. DRIFT GUARDS — the manifest is the agent-facing contract for the whole
 *      CLI surface. These tests fail if a command is added without describing
 *      it: every registered command must appear in the manifest, every
 *      JSON-supported command must declare its response types, and every
 *      response-type key must map to a real command.
 *   2. SHAPE — each command entry carries the required fields, global options
 *      are described once, and the bare `xds --json` / `astryx manifest --json`
 *      surfaces emit valid, enriched JSON.
 */

import {describe, it, expect} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {program, JSON_SUPPORTED} from '../index.mjs';
import {buildManifest, RESPONSE_TYPES} from './manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_BIN = path.resolve(__dirname, '../../bin/astryx.mjs');

const manifest = buildManifest(program, {jsonSupported: JSON_SUPPORTED, version: '0.0.0-test'});

/** Flatten the manifest command tree into fully-qualified names. */
function flatten(cmds, out = []) {
  for (const c of cmds) {
    out.push(c);
    if (c.subcommands) flatten(c.subcommands, out);
  }
  return out;
}
const allEntries = flatten(manifest.commands);
const allNames = new Set(allEntries.map((c) => c.name));

/** Fully-qualified names of every registered, non-hidden command in the program. */
function registeredNames() {
  const names = [];
  const walk = (cmd, prefix) => {
    for (const sub of cmd.commands || []) {
      if (sub._hidden || sub.name() === 'help') continue;
      const full = prefix ? `${prefix} ${sub.name()}` : sub.name();
      names.push(full);
      walk(sub, full);
    }
  };
  walk(program, '');
  return names;
}

describe('manifest: drift guards', () => {
  it('lists every registered (non-hidden) command', () => {
    for (const name of registeredNames()) {
      expect(allNames.has(name), `manifest is missing command "${name}"`).toBe(true);
    }
  });

  it('marks every JSON_SUPPORTED command as json:true', () => {
    for (const name of JSON_SUPPORTED) {
      const entry = allEntries.find((c) => c.name === name);
      expect(entry, `JSON_SUPPORTED command "${name}" not in manifest`).toBeDefined();
      expect(entry.json, `"${name}" should be json:true`).toBe(true);
    }
  });

  it('declares response types for every JSON-supported command', () => {
    for (const name of JSON_SUPPORTED) {
      expect(
        RESPONSE_TYPES[name],
        `JSON-supported command "${name}" has no response-type entry`,
      ).toBeDefined();
      expect(RESPONSE_TYPES[name].length).toBeGreaterThan(0);
    }
  });

  it('has no response-type entry for a command that does not exist', () => {
    for (const name of Object.keys(RESPONSE_TYPES)) {
      expect(allNames.has(name), `RESPONSE_TYPES key "${name}" is not a real command`).toBe(true);
    }
  });

  it('every command with response types is json-supported', () => {
    for (const entry of allEntries) {
      if (entry.responseTypes) {
        expect(entry.json, `"${entry.name}" emits types but isn't json-supported`).toBe(true);
      }
    }
  });
});

describe('manifest: shape', () => {
  it('has top-level metadata', () => {
    expect(manifest.name).toBe('astryx');
    expect(manifest.apiVersion).toBe(1);
    expect(typeof manifest.description).toBe('string');
    expect(Array.isArray(manifest.commands)).toBe(true);
    expect(Array.isArray(manifest.globalOptions)).toBe(true);
  });

  it('describes global options once at top level (--json, --lang, --detail, --version)', () => {
    const flags = manifest.globalOptions.map((o) => o.flag).join(' ');
    expect(flags).toContain('--json');
    expect(flags).toContain('--lang');
    expect(flags).toContain('--detail');
    expect(flags).toContain('--version');
    // No duplicate --version
    const versionCount = manifest.globalOptions.filter((o) => /--version\b/.test(o.flag)).length;
    expect(versionCount).toBe(1);
  });

  it('surfaces enum choices and defaults on options', () => {
    const detail = manifest.globalOptions.find((o) => o.flag.includes('--detail'));
    expect(detail.type).toBe('enum');
    expect(detail.choices).toEqual(['full', 'compact', 'brief']);
    expect(detail.default).toBe('full');
  });

  it('each command entry carries the required fields', () => {
    for (const c of allEntries) {
      expect(typeof c.name).toBe('string');
      expect(typeof c.description).toBe('string');
      expect(Array.isArray(c.arguments)).toBe(true);
      expect(Array.isArray(c.options)).toBe(true);
      expect(typeof c.json).toBe('boolean');
    }
  });

  it('derives arguments from Commander metadata', () => {
    const component = allEntries.find((c) => c.name === 'component');
    expect(component.arguments.map((a) => a.name)).toContain('name');
    const themeBuild = allEntries.find((c) => c.name === 'theme build');
    expect(themeBuild.arguments.map((a) => a.name)).toContain('file');
    expect(themeBuild.arguments.find((a) => a.name === 'file').required).toBe(true);
  });
});

function runCli(args) {
  const res = spawnSync('node', [CLI_BIN, ...args], {encoding: 'utf-8', timeout: 20_000});
  return {status: res.status, stdout: res.stdout || '', stderr: res.stderr || ''};
}

describe('manifest: e2e', () => {
  it('astryx manifest --json emits a valid manifest envelope', () => {
    const {status, stdout} = runCli(['manifest', '--json']);
    expect(status).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.apiVersion).toBe(1);
    expect(parsed.type).toBe('manifest');
    expect(parsed.data.name).toBe('astryx');
    const names = parsed.data.commands.map((c) => c.name);
    expect(names).toContain('component');
    expect(names).toContain('theme');
    expect(names).toContain('manifest');
  });

  it('bare xds --json stays backwards-compatible AND embeds the manifest', () => {
    const {status, stdout} = runCli(['--json']);
    expect(status).toBe(0);
    const parsed = JSON.parse(stdout);
    // Back-compat: still type:'help' with name/version/commands(names)/jsonSupported
    expect(parsed.type).toBe('help');
    expect(parsed.data.name).toBe('astryx');
    expect(Array.isArray(parsed.data.commands)).toBe(true);
    expect(parsed.data.commands.every((c) => typeof c === 'string')).toBe(true);
    expect(parsed.data.commands).toContain('component');
    expect(Array.isArray(parsed.data.jsonSupported)).toBe(true);
    // Enriched: the full structured manifest is embedded.
    expect(parsed.data.manifest).toBeDefined();
    expect(parsed.data.manifest.commands.find((c) => c.name === 'component').responseTypes)
      .toContain('component.list');
  });
});
