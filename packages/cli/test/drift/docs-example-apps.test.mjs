// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Drift guard for the example apps the shipped docs point readers at.
 *
 * `astryx docs <topic>` renders `packages/cli/assets/docs/*.doc.mjs` verbatim,
 * so a claim about an in-repo example app is not a stale comment in our repo —
 * it is wrong instruction in someone else's terminal. The claim that rots
 * silently is the *kind* of build an app demonstrates: a doc can recommend an
 * SWC StyleX transform and cite an example that compiles StyleX with Babel,
 * and nothing in the repo notices, because the cited path still exists.
 *
 * What is checked — derived from live sources, never hardcoded: a sentence that
 * offers an in-repo example app *as* an SWC configuration must name an app that
 * actually carries one, i.e. depends on a `@stylexswc/*` compiler. The unit is
 * the sentence, not the prose block: a block may legitimately recommend SWC and
 * then name a Babel example for a different purpose, and saying so is what a
 * correction looks like.
 *
 * @position packages/cli/test/drift — colocated-docs drift harness
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {describe, it, expect} from 'vitest';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '../../../..');
const DOCS_DIR = path.join(REPO_ROOT, 'packages/cli/assets/docs');

const EXAMPLE_APP = /apps\/(example-[a-z0-9-]+)/g;
const SWC_SCOPE = '@stylexswc/';

/**
 * A sentence presents an app as an SWC setup when it says SWC and does not
 * say the app is something else. `not` / `rather than` / `instead of` are how
 * the docs disclaim a citation, so a sentence carrying one is a correction
 * about that app, not a recommendation of it.
 */
const SWC_CLAIM = /\bSWC\b/;
const DISCLAIMED = /\b(not|rather than|instead of|no SWC)\b/;

/** @returns {Promise<{file: string, doc: any}[]>} the shipped reference docs. */
async function collectShippedDocs() {
  const files = fs
    .readdirSync(DOCS_DIR)
    .filter(f => f.endsWith('.mjs'))
    .map(f => path.join(DOCS_DIR, f));
  const out = [];
  for (const f of files) {
    const mod = await import(pathToFileURL(f).href);
    const doc = mod.doc ?? mod.docs;
    if (doc != null) out.push({file: path.relative(REPO_ROOT, f), doc});
  }
  return out;
}

/** @returns {string[]} every prose string in a doc, in render order. */
function proseBlocks(doc) {
  return (doc.sections ?? []).flatMap(section =>
    (section.content ?? [])
      .filter(
        block => block?.type === 'prose' && typeof block.text === 'string',
      )
      .map(block => block.text),
  );
}

/** @returns {boolean} whether an example app compiles StyleX through SWC. */
function carriesSwcTransform(app) {
  const pkgPath = path.join(REPO_ROOT, 'apps', app, 'package.json');
  if (!fs.existsSync(pkgPath)) return false;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const deps = {...pkg.dependencies, ...pkg.devDependencies};
  return Object.keys(deps).some(name => name.startsWith(SWC_SCOPE));
}

describe('shipped docs vs the example apps they cite', () => {
  it('offers an example app as an SWC setup only when it carries one', async () => {
    const docs = await collectShippedDocs();
    expect(docs.length).toBeGreaterThan(0);

    const wrong = [];
    for (const {file, doc} of docs) {
      for (const text of proseBlocks(doc)) {
        for (const sentence of text.split(/(?<=\.)\s+/)) {
          if (!SWC_CLAIM.test(sentence) || DISCLAIMED.test(sentence)) continue;
          for (const [, app] of sentence.matchAll(EXAMPLE_APP)) {
            if (!carriesSwcTransform(app)) {
              wrong.push(
                `${file}: offers apps/${app} as an SWC configuration, but ` +
                  `that app declares no ${SWC_SCOPE}* compiler`,
              );
            }
          }
        }
      }
    }

    expect(wrong).toEqual([]);
  });

  it('(control) reads the example apps that back the claim', () => {
    // Guards the check above against silently passing because it found no apps
    // to inspect: `carriesSwcTransform` returns false for a missing package.json
    // exactly as it does for a Babel app, so the corpus has to be real.
    const apps = fs
      .readdirSync(path.join(REPO_ROOT, 'apps'), {withFileTypes: true})
      .filter(e => e.isDirectory() && e.name.startsWith('example-'))
      .map(e => e.name);

    expect(apps).toContain('example-nextjs-stylex');
    expect(carriesSwcTransform('example-nextjs-stylex')).toBe(false);
    expect(carriesSwcTransform('example-does-not-exist')).toBe(false);
  });
});
