// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx layout expand` tells the caller, in JSON and in text, when demo
 * media in a spliced template block was replaced with placeholders. Printed
 * code stays verbatim and valid TSX: the disclosure follows it as a comment.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import ts from 'typescript';
import {runCli} from '../../../test-utils/run-cli.mjs';
import {discoverTemplates} from '../../../api/template/template.mjs';

const SLOW = 60_000;
const DISCLOSURE = /demo media/i;

/** @param {string} name */
const hintKey = name => name.toLowerCase().replace(/[^a-z0-9]/g, '');

/** @param {string} source */
const tsxErrors = source =>
  /** @type {any} */ (
    ts.createSourceFile('out.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  ).parseDiagnostics.map((/** @type {ts.Diagnostic} */ d) =>
    ts.flattenDiagnosticMessageText(d.messageText, ' '),
  );

/** A `{hint}` for a template block whose source carries demo media. */
async function mediaBlockHint() {
  const blocks = /** @type {Array<{dirName: string, type: string, filePath: string}>} */ (
    await discoverTemplates()
  ).filter(t => t.type === 'block' && t.filePath && fs.existsSync(t.filePath));
  const seen = new Map();
  for (const t of blocks) seen.set(hintKey(t.dirName), (seen.get(hintKey(t.dirName)) ?? 0) + 1);
  const found = blocks.find(
    t =>
      seen.get(hintKey(t.dirName)) === 1 &&
      /\/template-assets\/[\w.-]+\.\w+/.test(fs.readFileSync(t.filePath, 'utf-8')),
  );
  if (!found) throw new Error('no template block carries demo media');
  return hintKey(found.dirName);
}

describe('layout expand discloses replaced demo media', () => {
  let cwd;
  beforeEach(() => {
    // Inside the workspace so @astryxdesign/core resolves.
    cwd = fs.mkdtempSync(path.join(process.cwd(), '.xle-media-receipt-'));
  });
  afterEach(() => fs.rmSync(cwd, {recursive: true, force: true}));

  it('--json carries demoMediaReplaced; the text receipt states it for the written file', async () => {
    const expr = `V > {${await mediaBlockHint()}}`;
    const json = await runCli(['layout', 'expand', expr, './a', '--json'], cwd);
    expect(json.status).toBe(0);
    const {data} = JSON.parse(json.stdout);
    expect(data.demoMediaReplaced).toBeGreaterThan(0);

    const human = await runCli(['layout', 'expand', expr, './b'], cwd);
    expect(human.status).toBe(0);
    expect(human.stdout).toContain(
      `Replaced ${data.demoMediaReplaced} Astryx demo media reference`,
    );
    expect(human.stdout).toContain(path.join('b', 'GeneratedLayout.tsx'));
  }, SLOW);

  it('prints the code verbatim, then states the count in a comment that keeps it valid TSX', async () => {
    const expr = `V > {${await mediaBlockHint()}}`;
    const {data} = JSON.parse((await runCli(['layout', 'expand', expr, '--json'], cwd)).stdout);

    const human = await runCli(['layout', 'expand', expr], cwd);
    expect(human.status).toBe(0);
    expect(human.stdout.startsWith(data.code)).toBe(true);
    expect(human.stdout.slice(data.code.length).trim()).toMatch(
      new RegExp(`^// Replaced ${data.demoMediaReplaced} Astryx demo media references? in the code above: [^\\n]+$`),
    );
    expect(tsxErrors(human.stdout)).toEqual([]);
  }, SLOW);

  it('says nothing about demo media when none was replaced', async () => {
    const json = await runCli(['layout', 'expand', 'V > B"Save"', '--json'], cwd);
    const {data} = JSON.parse(json.stdout);
    expect(data.demoMediaReplaced).toBe(0);

    const written = await runCli(['layout', 'expand', 'V > B"Save"', './a'], cwd);
    expect(written.status).toBe(0);
    expect(written.stdout).not.toMatch(DISCLOSURE);
    const printed = await runCli(['layout', 'expand', 'V > B"Save"'], cwd);
    expect(printed.status).toBe(0);
    expect(printed.stdout).toBe(`${data.code}\n`);
  }, SLOW);
});
