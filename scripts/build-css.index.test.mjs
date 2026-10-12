// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build-css.index.test.mjs
 * The stylesheet index build-css.mjs writes beside each package stylesheet,
 * read back through `subsetStylesheet`: each module is credited with its own
 * rules and every variable group it reads, a subset is the stylesheet minus
 * the rules no listed module uses, and the build refuses an index that would
 * drop or misplace a rule.
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';
import {subsetStylesheet} from '../packages/core/src/stylesheet.ts';
import {
  collectStyleXModules,
  indexStylesheet,
  renderStylesheet,
} from './build-css.mjs';

const temporaryRoots = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map(root => fs.rm(root, {recursive: true, force: true})),
  );
});

const STYLEX = `import * as stylex from '@stylexjs/stylex';\n`;

/** Writes `files` under a fresh source root and builds its stylesheet. */
async function build(files, extra = () => ({})) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'astryx-css-index-'));
  temporaryRoots.push(root);
  const src = path.join(root, 'src');
  const dist = path.join(root, 'dist');
  await fs.mkdir(dist, {recursive: true});
  for (const [name, code] of Object.entries(files)) {
    await fs.mkdir(path.dirname(path.join(root, name)), {recursive: true});
    await fs.writeFile(path.join(root, name), code);
  }
  const target = {
    src,
    aliases: {},
    outFile: 'fixture.css',
    banner: 'Fixture',
    ...extra(root),
  };
  const {rules, modules} = await collectStyleXModules(target);
  const stylesheet = renderStylesheet(target, rules);
  const index = indexStylesheet(target, stylesheet, modules);
  const sheet = path.join(dist, 'fixture.css');
  await fs.writeFile(sheet, stylesheet);
  await fs.writeFile(`${sheet}.json`, JSON.stringify(index));
  return {
    target,
    modules,
    stylesheet,
    index,
    subset: names =>
      subsetStylesheet(
        sheet,
        names.map(name => path.join(dist, name)),
      ),
  };
}

const ruleLines = css => css.split('\n').filter(line => line.startsWith('  '));

const FIXTURE = {
  'src/tokens.stylex.ts': `${STYLEX}export const colors = stylex.defineVars({'--ink': 'black', '--paper': 'white'});\n`,
  'src/breakpoints.stylex.ts': `${STYLEX}export const breakpoints = stylex.defineConsts({wide: '@media (min-width: 800px)'});\n`,
  'src/Card/Card.tsx': `${STYLEX}import {colors} from '../tokens.stylex';\nimport {breakpoints} from '../breakpoints.stylex';\nconst styles = stylex.create({root: {color: colors['--ink'], padding: {default: 4, ':hover': 8, [breakpoints.wide]: 12}}});\nexport const card = () => stylex.props(styles.root);\n`,
  'src/Badge/Badge.tsx': `${STYLEX}const styles = stylex.create({root: {padding: 4, margin: 0}});\nexport const badge = () => stylex.props(styles.root);\n`,
  'src/Ink/Ink.tsx': `${STYLEX}const styles = stylex.create({root: {color: 'red'}});\nexport const ink = () => stylex.props(styles.root);\n`,
  'src/Plain.ts': 'export const plain = 1;\n',
  'src/Typed.ts': `import type {colors} from './tokens.stylex';\nexport type Ink = typeof colors;\n`,
};

describe('build-css stylesheet index', () => {
  it('credits a module with the variable groups it reads, and only those', async () => {
    const {subset} = await build(FIXTURE);

    expect(subset(['Card/Card.js'])).toMatch(/--ink:black/);
    expect(subset(['Badge/Badge.js'])).not.toMatch(/--ink/);
    expect(subset(['Typed.js', 'Plain.js'])).not.toMatch(/--ink/);
    // The definition module itself also carries its group.
    expect(subset(['tokens.stylex.js'])).toMatch(/--ink:black/);
  });

  it('returns the stylesheet byte for byte for every module, and its wrapper alone for none', async () => {
    const {index, stylesheet, subset} = await build(FIXTURE);

    expect(subset(Object.keys(index.modules))).toBe(stylesheet);
    const empty = subset([]);
    expect(ruleLines(empty)).toEqual([]);
    expect(empty).toBe(
      '/* Fixture */\n/* Auto-generated. Do not edit manually. */\n\n@layer astryx-base {\n}\n',
    );
  });

  it("keeps each retained rule's text, specificity padding and order", async () => {
    const {target, modules, stylesheet, subset} = await build(FIXTURE);
    const whole = ruleLines(stylesheet);

    for (const names of [
      ['Ink/Ink.js'],
      ['Badge/Badge.js'],
      ['Ink/Ink.js', 'Card/Card.js'],
      ['Badge/Badge.js', 'tokens.stylex.js'],
    ]) {
      const kept = ruleLines(subset(names));
      expect(kept.length).toBeGreaterThan(0);
      expect(kept).toEqual(whole.filter(line => kept.includes(line)));
    }

    // Compiled alone, Ink's rule would lose the padding the levels below it
    // give it in the whole sheet; the subset keeps the whole sheet's text.
    const inkFile = [...modules.keys()].find(file => file.endsWith('Ink.tsx'));
    const alone = ruleLines(
      renderStylesheet(target, modules.get(inkFile).rules),
    );
    expect(ruleLines(subset(['Ink/Ink.js']))).not.toEqual(alone);
  });

  it('depends only on which modules are listed', async () => {
    const {subset} = await build(FIXTURE);

    expect(subset(['Badge/Badge.js', 'Card/Card.js', 'Badge/Badge.js'])).toBe(
      subset(['Card/Card.js', 'Badge/Badge.js']),
    );
  });

  it('fails the build when a module rule is missing from the stylesheet', async () => {
    const {target, modules, stylesheet} = await build(FIXTURE);
    const dropped = stylesheet.replace(/\n {2}[^\n]*--ink:black[^\n]*/, '');

    expect(() => indexStylesheet(target, dropped, modules)).toThrow(
      /does not hold/,
    );
  });

  it('fails the build when the stylesheet holds a rule no module renders with', async () => {
    const {target, modules, stylesheet} = await build(FIXTURE);
    const extra = stylesheet.replace(
      '@layer astryx-base {\n',
      '@layer astryx-base {\n  .orphan{color:blue}\n',
    );

    expect(() => indexStylesheet(target, extra, modules)).toThrow(
      /no module renders with/,
    );
  });

  it("leaves a provider's group to the provider and indexes the package's own", async () => {
    const {stylesheet, subset} = await build(
      {
        'provider/Base.ts': `import {shared} from '../shared/shared.stylex';\nexport const value = shared['--tone'];\n`,
        'shared/shared.stylex.ts': `${STYLEX}export const shared = stylex.defineVars({'--tone': 'red'});\n`,
        'src/own.stylex.ts': `${STYLEX}export const own = stylex.defineVars({'--hue': 'blue'});\n`,
        'src/Chart/Chart.tsx': `${STYLEX}import {shared} from '@probe/shared.stylex';\nimport {own} from '../own.stylex';\nconst styles = stylex.create({root: {color: shared['--tone'], borderColor: own['--hue']}});\nexport const chart = () => stylex.props(styles.root);\n`,
      },
      root => ({
        aliases: {'@probe/*': [path.join(root, 'shared', '*')]},
        provider: {src: path.join(root, 'provider'), aliases: {}},
      }),
    );

    expect(stylesheet).not.toMatch(/--tone:red/);
    expect(subset(['Chart/Chart.js'])).toMatch(/--hue:blue/);
  });
});
