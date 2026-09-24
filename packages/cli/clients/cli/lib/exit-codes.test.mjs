// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Every CommandDoc's exit codes reach generated help and the manifest.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {describe, it, expect} from 'vitest';
import {program, JSON_SUPPORTED} from '../index.mjs';
import {buildManifest} from './manifest.mjs';
import {runCli} from '../../../test-utils/run-cli.mjs';

const COMMANDS = path.join(path.dirname(fileURLToPath(import.meta.url)), '../commands');

/** @type {any[]} */
const commandDocs = [];
for (const file of fs.readdirSync(COMMANDS).sort()) {
  if (!file.endsWith('.doc.mjs')) continue;
  const {doc} = await import(pathToFileURL(path.join(COMMANDS, file)).href);
  if (doc?.type === 'command') commandDocs.push(doc);
}

const manifest = buildManifest(program, {jsonSupported: JSON_SUPPORTED, version: '0.0.0-test'});
/** @type {Map<string, any>} */
const entries = new Map();
const walk = (/** @type {any} */ c) => {
  entries.set(c.name, c);
  (c.subcommands || []).forEach(walk);
};
manifest.commands.forEach(walk);

// `manifest` is registered by hand in index.mjs, not through defineCommand.
const HAND_REGISTERED = new Set(['manifest']);

describe('command exit codes', () => {
  it('every CommandDoc documents its exit codes', () => {
    expect(commandDocs.length).toBeGreaterThan(30);
    for (const doc of commandDocs) {
      expect(doc.exitCodes?.length, doc.name).toBeGreaterThan(0);
    }
  });

  it.each(commandDocs.filter((d) => !HAND_REGISTERED.has(d.name)).map((d) => [d.name, d]))(
    '`astryx %s --help` lists the documented exit codes',
    async (name, doc) => {
      const {status, stdout} = await runCli([...name.split(' '), '--help']);
      expect(status).toBe(0);
      const section = stdout.slice(stdout.indexOf('\nExit codes:\n'));
      expect(section.startsWith('\nExit codes:\n'), stdout).toBe(true);
      for (const {code, when} of doc.exitCodes) {
        expect(section).toContain(`\n  ${code}  ${when}\n`);
      }
    },
  );

  it('the manifest carries every command exit code', () => {
    for (const doc of commandDocs) {
      expect(entries.get(doc.name)?.exitCodes, doc.name).toEqual(
        doc.exitCodes.map(({code, when}) => ({code, when})),
      );
    }
  });
});
