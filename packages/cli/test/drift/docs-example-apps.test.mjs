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
 * What is checked, derived from live sources and never hardcoded: a prose block
 * that recommends SWC may name an in-repo example app only if that app carries
 * an SWC transform (depends on a `@stylexswc/*` compiler), or the sentence
 * naming it says outright that it does not ("no SWC example app", "not an SWC
 * setup"). The claim is block-scoped so a recommendation split across two
 * sentences is still one citation; the disclaimer is sentence-scoped and must
 * negate SWC itself, so an unrelated "not" clears nothing. Both ends of the
 * pipeline are checked: the doc source and what the shipped CLI prints.
 *
 * @position packages/cli/test/drift — colocated-docs drift harness
 */

import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {describe, it, expect} from 'vitest';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '../../../..');
const DOCS_DIR = path.join(REPO_ROOT, 'packages/cli/assets/docs');
const BIN = path.join(REPO_ROOT, 'packages/cli/clients/cli/bin/astryx.mjs');

const EXAMPLE_APP = /apps\/(example-[a-z0-9-]+)/g;
const SWC_SCOPE = '@stylexswc/';

/**
 * A block makes an SWC claim when it mentions SWC or an `@stylexswc/*` package
 * anywhere. A sentence in that block disclaims an app it names only when a
 * negator is attached to SWC itself: "no SWC", "not an SWC", "never SWC",
 * "without SWC", "rather than SWC", "instead of SWC". A negator elsewhere in
 * the sentence ("Do not skip this") is not a disclaimer.
 */
const SWC_CLAIM = /\bSWC\b|@stylexswc\//;
const SWC_NEGATED =
  /\b(?:no|not|never|without|rather than|instead of)\s+(?:an?\s+|the\s+)?(?:SWC\b|`?@stylexswc\/)/;

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
function carriesSwcTransform(app, root = REPO_ROOT) {
  const pkgPath = path.join(root, 'apps', app, 'package.json');
  if (!fs.existsSync(pkgPath)) return false;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const deps = {...pkg.dependencies, ...pkg.devDependencies};
  return Object.keys(deps).some(name => name.startsWith(SWC_SCOPE));
}

/**
 * The rule itself, over one prose block.
 *
 * @param {string} text one prose block
 * @param {string} where label used in the report
 * @param {(app: string) => boolean} hasSwc
 * @returns {string[]} one message per app offered as SWC that carries none
 */
function badSwcCitations(text, where, hasSwc = carriesSwcTransform) {
  if (!SWC_CLAIM.test(text)) return [];
  const wrong = [];
  for (const sentence of text.split(/(?<=\.)\s+/)) {
    if (SWC_NEGATED.test(sentence)) continue;
    for (const [, app] of sentence.matchAll(EXAMPLE_APP)) {
      if (!hasSwc(app)) {
        wrong.push(
          `${where}: offers apps/${app} as an SWC configuration, but ` +
            `that app declares no ${SWC_SCOPE}* compiler`,
        );
      }
    }
  }
  return wrong;
}

/** Writes `apps/<name>/package.json` under a throwaway root. @returns {string} */
function fixtureRoot(apps) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-docs-apps-'));
  for (const [name, pkg] of Object.entries(apps)) {
    const dir = path.join(root, 'apps', name);
    fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg));
  }
  return root;
}

describe('shipped docs vs the example apps they cite', () => {
  it('offers an example app as an SWC setup only when it carries one', async () => {
    const docs = await collectShippedDocs();
    expect(docs.length).toBeGreaterThan(0);

    const wrong = docs.flatMap(({file, doc}) =>
      proseBlocks(doc).flatMap(text => badSwcCitations(text, file)),
    );

    expect(wrong).toEqual([]);
  });

  it('renders no such citation through `astryx docs styling`', () => {
    // The doc source is the input; this is the output a reader actually gets.
    // The renderer separates blocks with a blank line.
    const res = spawnSync('node', [BIN, 'docs', 'styling'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    expect(res.status).toBe(0);
    expect(res.stdout).toMatch(/@stylexswc\/nextjs-plugin/);

    const wrong = res.stdout
      .split(/\n\s*\n/)
      .flatMap(block => badSwcCitations(block, 'astryx docs styling'));
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

  it('(control) reads an SWC compiler from either dependency field', () => {
    // Controls for the scope test itself: `@stylexjs/` and `@stylexswc/` differ
    // by two characters, and the whole rule rests on telling them apart.
    const root = fixtureRoot({
      'example-swc-dep': {dependencies: {'@stylexswc/nextjs-plugin': '^0.7.0'}},
      'example-swc-dev': {
        devDependencies: {'@stylexswc/rs-compiler': '^0.7.0'},
      },
      'example-babel': {devDependencies: {'@stylexjs/babel-plugin': '^0.19.0'}},
      'example-empty': {name: 'no deps at all'},
    });

    expect(carriesSwcTransform('example-swc-dep', root)).toBe(true);
    expect(carriesSwcTransform('example-swc-dev', root)).toBe(true);
    expect(carriesSwcTransform('example-babel', root)).toBe(false);
    expect(carriesSwcTransform('example-empty', root)).toBe(false);
  });

  it('(control) checks every app a sentence names, not just the first', () => {
    const hasSwc = app => app === 'example-swc';
    const both =
      'Use SWC: see apps/example-swc and apps/example-babel for the setup.';

    expect(badSwcCitations(both, 'fixture', hasSwc)).toEqual([
      'fixture: offers apps/example-babel as an SWC configuration, but ' +
        'that app declares no @stylexswc/* compiler',
    ]);
    expect(
      badSwcCitations('Use SWC: see apps/example-swc.', 'fixture', hasSwc),
    ).toEqual([]);
  });

  it('(control) scans prose only, and no other block type cites an app as SWC', async () => {
    // `proseBlocks` drops tables, lists and code, so a citation in a table cell
    // is invisible to the rule. That is a bounded gap only while no non-prose
    // block makes the claim — which is what the second half asserts, over the
    // live corpus.
    const docs = await collectShippedDocs();
    const nonProse = docs.flatMap(({file, doc}) =>
      (doc.sections ?? []).flatMap(section =>
        (section.content ?? [])
          .filter(block => block?.type !== 'prose')
          .map(block => ({file, text: JSON.stringify(block)})),
      ),
    );
    expect(nonProse.length).toBeGreaterThan(0);

    const escaped = nonProse.flatMap(({file, text}) =>
      badSwcCitations(text, `${file} (non-prose)`),
    );
    expect(escaped).toEqual([]);
  });

  const babelOnly = () => false;

  it.each([
    [
      'a "not" that is not about SWC',
      'Do not skip this: apps/example-babel is the complete SWC setup.',
    ],
    [
      'a claim split across sentences',
      'The working path is SWC. See apps/example-babel.',
    ],
    [
      'a negation of something other than SWC',
      'Not every bundler needs this, but apps/example-babel is the SWC reference.',
    ],
    [
      'an SWC negation in a different sentence from the app',
      'The repo ships no SWC example app. See apps/example-babel for the setup.',
    ],
  ])('still flags %s', (_, text) => {
    expect(badSwcCitations(text, 'fixture', babelOnly)).toHaveLength(1);
  });

  it.each([
    [
      'the app is called out as not the SWC one',
      'Use SWC. The repo ships no SWC example app: apps/example-babel compiles StyleX with Babel.',
    ],
    [
      'the app is called out as not an SWC setup',
      'Use SWC. apps/example-babel is not an SWC setup; copy the snippet above.',
    ],
    [
      'the app is called out as using something instead of SWC',
      'Use SWC. apps/example-babel uses Babel instead of SWC.',
    ],
    [
      'the block makes no SWC claim at all',
      'See apps/example-babel for the PostCSS layer setup.',
    ],
  ])('clears a citation when %s', (_, text) => {
    expect(badSwcCitations(text, 'fixture', babelOnly)).toEqual([]);
  });
});
