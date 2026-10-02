// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as path from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {runCli} from '../../../test-utils/run-cli.mjs';

const SLOW = 60_000;

/** @type {string} */
let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(
    path.join(process.cwd(), '.astryx-docs-flatten-test-'),
  );
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

function scaffoldGuide() {
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'consumer'}),
  );
  fs.writeFileSync(
    path.join(tmpDir, 'astryx.config.mjs'),
    "export default {integrations: ['@acme/kit']};\n",
  );
  const packageDir = path.join(tmpDir, 'node_modules', '@acme', 'kit');
  fs.mkdirSync(path.join(packageDir, 'docs'), {recursive: true});
  fs.writeFileSync(
    path.join(packageDir, 'package.json'),
    JSON.stringify({name: '@acme/kit', version: '1.0.0'}),
  );
  fs.writeFileSync(
    path.join(packageDir, 'astryx.integration.mjs'),
    "export default {docs: './docs'};\n",
  );
  const namespace = {
    type: 'namespace',
    name: 'acme',
    title: 'Acme docs',
    summary: 'Build with the Acme kit.',
    slots: {guides: {title: 'Guides', accepts: {kinds: ['generic']}}},
  };
  const guide = {
    type: 'generic',
    name: 'themes',
    title: 'Theme building',
    description: 'Build an Acme theme.',
    placement: {parent: 'namespace:acme', slot: 'guides'},
    sections: [
      {
        title: 'Create the theme',
        content: [
          {
            type: 'prose',
            text: 'Child guide body marker: compile the ocean palette.',
          },
        ],
      },
    ],
  };
  for (const [file, doc] of [
    ['acme.doc.mjs', namespace],
    ['themes.doc.mjs', guide],
  ]) {
    fs.writeFileSync(
      path.join(packageDir, 'docs', file),
      `export const docs = ${JSON.stringify(doc, null, 2)};\n`,
    );
  }
}

/**
 * @param {any} node
 * @param {string} route
 * @returns {any | undefined}
 */
function findRoute(node, route) {
  if (node.route === route) return node;
  for (const slot of node.slots ?? []) {
    for (const child of slot.children) {
      const found = findRoute(child, route);
      if (found) return found;
    }
  }
  return undefined;
}

describe('astryx docs --full --flatten', () => {
  it('compiles a namespace and descendant bodies under nested headings', async () => {
    const compiled = await runCli(['docs', 'cli/api', '--full', '--flatten']);

    expect(compiled.status).toBe(0);
    expect(compiled.stdout).toMatch(/^# API$/m);
    expect(compiled.stdout).toMatch(/^## Functions$/m);
    expect(compiled.stdout).toMatch(/^### search\(\)$/m);
    expect(compiled.stdout).toContain(
      '`astryx search` runs it. Read it with `astryx docs cli/commands/search`.',
    );

    const unchanged = await runCli(['docs', 'cli/api', '--full']);
    expect(unchanged.status).toBe(0);
    expect(unchanged.stdout).not.toContain('`astryx search` runs it.');
  }, SLOW);

  it("includes a child guide's full body instead of only its summary", async () => {
    scaffoldGuide();

    const compiled = await runCli(
      ['docs', 'acme', '--full', '--flatten'],
      tmpDir,
    );
    expect(compiled.status).toBe(0);
    expect(compiled.stdout).toMatch(/^# Acme docs$/m);
    expect(compiled.stdout).toMatch(/^## Theme building$/m);
    expect(compiled.stdout).toMatch(/^### Create the theme$/m);
    expect(compiled.stdout).toContain(
      'Child guide body marker: compile the ocean palette.',
    );

    const unchanged = await runCli(['docs', 'acme', '--full'], tmpDir);
    expect(unchanged.status).toBe(0);
    expect(unchanged.stdout).not.toContain('Child guide body marker');
  }, SLOW);

  it('returns the same full subtree as nested JSON', async () => {
    const result = await runCli([
      'docs',
      'cli/api',
      '--full',
      '--flatten',
      '--json',
    ]);

    expect(result.status).toBe(0);
    const response = JSON.parse(result.stdout);
    expect(response.type).toBe('docs.tree');
    const search = findRoute(response.data, 'cli/api/functions/search');
    expect(JSON.stringify(search?.content)).toContain('`astryx search` runs it.');
  }, SLOW);

  it('refuses flag combinations that cannot compile a namespace', async () => {
    const missingFull = await runCli([
      'docs',
      'cli/api',
      '--flatten',
      '--json',
    ]);
    expect(missingFull.status).toBe(1);
    expect(JSON.parse(missingFull.stdout).code).toBe('ERR_INVALID_ARGUMENT');

    const topic = await runCli([
      'docs',
      'theme',
      '--full',
      '--flatten',
      '--json',
    ]);
    expect(topic.status).toBe(1);
    expect(JSON.parse(topic.stdout).code).toBe('ERR_INVALID_ARGUMENT');
  }, SLOW);
});
