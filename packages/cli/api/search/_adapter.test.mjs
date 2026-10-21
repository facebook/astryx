// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for search's adapter: a long-running caller reuses the gathered
 * candidates while their inputs are unchanged (gatherCandidatesReused), and
 * gathers again when an input changes, for another folder or `type`, or once
 * the reuse window passes.
 */

import {describe, it, expect} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {gatherCandidates, gatherCandidatesReused} from './_adapter.mjs';

const SLOW = 60_000;

/** A folder with only a package.json: a docs search there reads the CLI's docs. */
function scratchProject() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-gather-reuse-'));
  fs.writeFileSync(path.join(dir, 'package.json'), '{"name":"app"}');
  return dir;
}

/**
 * A gather that is then reused. Other tests running at the same time can
 * change a folder a gather read (the system temp folder, the repository
 * root), which rightly makes the next call gather again; so a reuse check
 * gathers once more and expects the call after that to reuse it.
 * @param {{cwd: string, type: string}} options
 */
async function reusedGather(options) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const gathered = await gatherCandidatesReused(options);
    if ((await gatherCandidatesReused(options)) === gathered) return gathered;
  }
  throw new Error('a gather was never reused');
}

describe('gatherCandidatesReused', () => {
  it(
    'reuses the gathered candidates while the inputs are unchanged',
    async () => {
      const cwd = scratchProject();
      const first = await reusedGather({cwd, type: 'doc'});
      expect(first.all.length).toBeGreaterThan(0);
      // The same candidates a fresh gather finds.
      expect(JSON.parse(JSON.stringify(first))).toEqual(
        JSON.parse(JSON.stringify(await gatherCandidates({cwd, type: 'doc'}))),
      );
    },
    SLOW,
  );

  it(
    'gathers again when an input file changes',
    async () => {
      const cwd = scratchProject();
      const first = await reusedGather({cwd, type: 'doc'});
      const later = new Date(Date.now() + 5_000);
      fs.utimesSync(path.join(cwd, 'package.json'), later, later);
      expect(await gatherCandidatesReused({cwd, type: 'doc'})).not.toBe(first);
      fs.writeFileSync(
        path.join(cwd, 'astryx.config.mjs'),
        'export default {};\n',
      );
      expect(await gatherCandidatesReused({cwd, type: 'doc'})).not.toBe(first);
    },
    SLOW,
  );

  it(
    'keeps one entry per folder and type',
    async () => {
      const cwd = scratchProject();
      const docs = await gatherCandidatesReused({cwd, type: 'doc'});
      const themes = await gatherCandidatesReused({cwd, type: 'theme'});
      expect(themes).not.toBe(docs);
      expect(themes.all.every(c => c.domain === 'theme')).toBe(true);
      expect(
        await gatherCandidatesReused({cwd: scratchProject(), type: 'doc'}),
      ).not.toBe(docs);
    },
    SLOW,
  );

  it(
    'gathers again when a file the gather read changes, in a linked package too',
    async () => {
      // A consumer whose integration is a symlink to a package folder
      // elsewhere, as a workspace package is.
      const dir = fs.mkdtempSync(
        path.join(process.cwd(), '.astryx-gather-reuse-'),
      );
      const pkg = fs.mkdtempSync(
        path.join(os.tmpdir(), 'astryx-linked-widgets-'),
      );
      try {
        fs.writeFileSync(path.join(dir, 'package.json'), '{"name":"consumer"}');
        fs.writeFileSync(
          path.join(dir, 'astryx.config.mjs'),
          "export default { integrations: ['@acme/widgets'] };\n",
        );
        fs.mkdirSync(
          path.join(dir, 'node_modules', '@astryxdesign', 'core', 'src'),
          {
            recursive: true,
          },
        );
        fs.mkdirSync(path.join(pkg, 'components'));
        fs.writeFileSync(
          path.join(pkg, 'package.json'),
          '{"name":"@acme/widgets","version":"1.0.0"}',
        );
        fs.writeFileSync(
          path.join(pkg, 'astryx.integration.mjs'),
          "export default { components: './components' };\n",
        );
        fs.writeFileSync(
          path.join(pkg, 'components', 'FancyGizmo.doc.mjs'),
          `export default {
            type: 'component',
            name: 'FancyGizmo',
            keywords: ['gizmo'],
            usage: {description: 'A fancy part.'},
            props: [],
          };\n`,
        );
        fs.writeFileSync(
          path.join(pkg, 'components', 'FancyGizmo.tsx'),
          'export function FancyGizmo() { return null; }\n',
        );
        fs.mkdirSync(path.join(dir, 'node_modules', '@acme'));
        fs.symlinkSync(
          pkg,
          path.join(dir, 'node_modules', '@acme', 'widgets'),
          'dir',
        );
        const options = {cwd: dir, type: 'component'};
        const first = await reusedGather(options);
        expect(first.all.map(c => c.name)).toContain('FancyGizmo');

        // A new component in the linked package: its folder changed.
        fs.writeFileSync(
          path.join(pkg, 'components', 'TinySprocket.doc.mjs'),
          `export default {
            type: 'component',
            name: 'TinySprocket',
            keywords: ['sprocket'],
            usage: {description: 'A small part.'},
            props: [],
          };\n`,
        );
        fs.writeFileSync(
          path.join(pkg, 'components', 'TinySprocket.tsx'),
          'export function TinySprocket() { return null; }\n',
        );
        expect(await gatherCandidatesReused(options)).not.toBe(first);
        const second = await reusedGather(options);
        expect(second.all.map(c => c.name)).toContain('TinySprocket');

        // An edited file the gather read: the linked package's manifest.
        const later = new Date(Date.now() + 5_000);
        fs.utimesSync(path.join(pkg, 'package.json'), later, later);
        expect(await gatherCandidatesReused(options)).not.toBe(second);
      } finally {
        fs.rmSync(dir, {recursive: true, force: true});
        fs.rmSync(pkg, {recursive: true, force: true});
      }
    },
    SLOW,
  );
});
