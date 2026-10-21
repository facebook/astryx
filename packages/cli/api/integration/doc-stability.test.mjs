// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `doctor integration validate` (and so `integration check`) notes a
 * template or namespace doc that sets `stability`, which a CLI before 0.7.2
 * refuses and drops (spec:AST-017 FR27), unless the package's CLI peer range
 * admits only CLIs that read it. A note is additive data, never an issue: it
 * is not counted and never fails a check. A component doc or guide that sets
 * the field is not noted: older CLIs ignore it there.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {validateIntegration} from './validate-integration.mjs';
import {integrationCheck} from './check/check.mjs';
import {runCli} from '../../test-utils/run-cli.mjs';

/** @type {string} */
let dir;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-doc-stability-'));
});
afterEach(() => {
  fs.rmSync(dir, {recursive: true, force: true});
});

/**
 * @param {Record<string, unknown>} pkgExtra
 * @param {string} stability the field, or '' for none
 */
function writePackage(pkgExtra, stability) {
  /** @param {string} rel @param {string} text */
  const write = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), {recursive: true});
    fs.writeFileSync(path.join(dir, rel), text);
  };
  write(
    'package.json',
    JSON.stringify({name: '@acme/stab', version: '1.0.0', ...pkgExtra}),
  );
  write(
    'astryx.integration.mjs',
    "export default {templates: './templates', docs: './docs', components: './components'};\n",
  );
  write(
    'templates/stab-hero.tsx',
    'export default function StabHero() { return null; }\n',
  );
  write(
    'templates/stab-hero.doc.mjs',
    `export default {type: 'block', name: 'Stab hero', description: 'A hero block.', aspectRatio: 2, componentsUsed: []${stability}};\n`,
  );
  write(
    'docs/stabns.doc.mjs',
    `export default {type: 'namespace', name: 'stabns', title: 'Stab', summary: 'Stab docs.'${stability}, slots: {guides: {title: 'Guides', accepts: {kinds: ['generic']}}}};\n`,
  );
  write(
    'components/StabWidget.tsx',
    'export function StabWidget() { return null; }\n',
  );
  write(
    'components/StabWidget.doc.mjs',
    `/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */\nexport default {type: 'component', name: 'StabWidget', displayName: 'Stab Widget', category: 'Layout', usage: {description: 'A widget.', bestPractices: []}, props: []${stability}};\n`,
  );
}

/** @returns {Promise<any>} */
async function validated() {
  return (await validateIntegration(undefined, {cwd: dir})).data;
}

describe('olderCliNotes', () => {
  it('notes each template and namespace doc that sets stability, never as an issue', async () => {
    writePackage({}, ", stability: 'experimental'");
    const data = await validated();
    expect(
      data.olderCliNotes.map((/** @type {any} */ note) => [
        note.file,
        note.kind,
      ]),
    ).toEqual(
      expect.arrayContaining([
        ['docs/stabns.doc.mjs', 'namespace'],
        ['templates/stab-hero.doc.mjs', 'template'],
      ]),
    );
    expect(data.olderCliNotes).toHaveLength(2);
    for (const note of data.olderCliNotes) {
      expect(note.message).toContain('CLIs before 0.7.2 drop this descriptor');
      expect(note.message).toContain('">=0.7.2"');
    }
    expect(
      data.olderCliNotes.find(
        (/** @type {any} */ note) => note.kind === 'namespace',
      ).message,
    ).toContain("hide the package's doc topics");
    // Not an issue: nothing about stability is counted.
    expect(JSON.stringify(data.issues)).not.toContain('stability');
  });

  it('never fails integration check --strict', async () => {
    writePackage(
      {peerDependencies: {'@astryxdesign/cli': '>=0.6.4'}},
      ", stability: 'experimental'",
    );
    const strict = await integrationCheck({cwd: dir, strict: true});
    expect(JSON.stringify(strict.data.failures)).not.toContain('stability');
    const validate = strict.data.checks.find(each => each.check === 'validate');
    expect(
      /** @type {any} */ (validate).response.data.olderCliNotes,
    ).toHaveLength(2);
    const text = await runCli(['integration', 'check', '--strict'], dir);
    expect(text.stdout).toContain('Notes for older CLIs');
    expect(text.stdout).toContain('templates/stab-hero.doc.mjs');
  }, 60_000);

  it('notes a template that declares icons, which 0.7.1 drops', async () => {
    writePackage({}, '');
    const doc = path.join(dir, 'templates', 'stab-hero.doc.mjs');
    fs.writeFileSync(
      doc,
      fs
        .readFileSync(doc, 'utf-8')
        .replace(
          'componentsUsed: []',
          "componentsUsed: [], icons: {XIcon: 'close'}",
        ),
    );
    const data = await validated();
    expect(data.olderCliNotes).toEqual([
      expect.objectContaining({
        file: 'templates/stab-hero.doc.mjs',
        kind: 'template',
        field: 'icons',
        message: expect.stringContaining('declares `icons`: CLIs before 0.7.2'),
      }),
    ]);
  });

  it('says nothing when the CLI peer range starts at 0.7.2', async () => {
    writePackage(
      {peerDependencies: {'@astryxdesign/cli': '>=0.7.2'}},
      ", stability: 'experimental'",
    );
    expect(await validated()).not.toHaveProperty('olderCliNotes');
  });

  it('says nothing when no descriptor sets stability', async () => {
    writePackage({}, '');
    expect(await validated()).not.toHaveProperty('olderCliNotes');
  });
});
