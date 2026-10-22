// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `icon()` (AST-084 FR6, FR7): ranking, set and limit options, one
 * icon, the set list, and errors, over the synthetic fixture.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {icon} from './icon.mjs';
import {iconUse} from './use/use.mjs';
import {ICON_NAMES} from '../../authoring/doctypes/icon-set/icon-names.mjs';
import {rankIcons, scoreIcon} from './_records.mjs';
import {
  glyphsData,
  writeIconSetProject,
} from '../../test-utils/icon-set-fixture.mjs';

/** @type {string} */
let tmp;
/** @type {string} */
let cwd;
beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-icon-api-'));
  cwd = writeIconSetProject(tmp);
});
afterEach(() => {
  fs.rmSync(tmp, {recursive: true, force: true});
});

/** @param {string} query @param {object} [options] */
async function search(query, options = {}) {
  const result = await icon(query, {cwd, ...options});
  if (result.type !== 'icon.search') throw new Error(result.type);
  return result.data;
}

describe('icon.search ranking', () => {
  const icons = glyphsData().icons;
  const byId = (/** @type {string} */ id) =>
    /** @type {any} */ (icons.find(each => each.id === id));

  it('scores each tier: definition, exact in the leading reading, exact in the other, prefix, partial', () => {
    expect(scoreIcon('close', byId('x'), 'meaning', ['close'])).toEqual({
      score: 100,
      reason: 'definition "close"',
    });
    expect(scoreIcon('trash', byId('trash'), 'name')).toEqual({
      score: 90,
      reason: 'id "trash"',
    });
    expect(scoreIcon('trash', byId('trash'), 'meaning')).toEqual({
      score: 80,
      reason: 'id "trash"',
    });
    expect(scoreIcon('delete', byId('trash'))).toEqual({
      score: 90,
      reason: 'word "delete"',
    });
    expect(scoreIcon('delete', byId('trash'), 'name')?.score).toBe(80);
    expect(scoreIcon('garb', byId('trash'))?.score).toBe(60);
    expect(scoreIcon('arbag', byId('trash'))?.score).toBe(40);
    expect(scoreIcon('ma', byId('search'))?.score).toBe(60);
    expect(scoreIcon('zebra', byId('trash'))).toBeNull();
  });

  it('a fill outranks a word match of the same text', async () => {
    const data = await search('search');
    expect(data.matches[0]).toMatchObject({id: 'search', score: 100});
  });

  it('ties keep id order, so the answer is stable', async () => {
    const data = await search('remove');
    expect(data.matches.map(match => match.id)).toEqual(['trash', 'x']);
  });

  it('ties keep set order: the project set first', () => {
    const set = (/** @type {string} */ name) =>
      /** @type {any} */ ({
        name,
        package: `@acme/${name}`,
        data: {module: `@acme/${name}`, icons: [byId('x')]},
      });
    expect(rankIcons([set('b'), set('a')], 'close').map(m => m.set)).toEqual([
      'b',
      'a',
    ]);
  });

  it("equal scores keep set order before tag position: the project's set leads", () => {
    const glyphs = /** @type {any} */ ({
      name: 'glyphs',
      package: '@acme/glyphs',
      data: {
        module: '@acme/glyphs',
        icons: [{id: 'bin', export: 'BinIcon', words: ['garbage', 'delete']}],
      },
    });
    const other = /** @type {any} */ ({
      name: 'other',
      package: '@acme/other',
      data: {
        module: '@acme/other',
        icons: [{id: 'trash', export: 'TrashIcon', words: ['delete']}],
      },
    });
    const ranked = rankIcons([glyphs, other], 'delete');
    expect(ranked.map(m => [m.set, m.id])).toEqual([
      ['glyphs', 'bin'],
      ['other', 'trash'],
    ]);
    expect(ranked[0].score).toBe(ranked[1].score);
  });

  it('returns every field, with the import line', async () => {
    const data = await search('delete');
    expect(data).toMatchObject({query: 'delete', matchCount: 1});
    expect(data.matches[0]).toEqual({
      set: 'glyphs',
      id: 'trash',
      package: '@acme/glyphs',
      module: '@acme/glyphs',
      export: 'TrashIcon',
      import: "import {TrashIcon} from '@acme/glyphs';",
      words: ['delete', 'remove', 'bin', 'garbage'],
      definitions: [],
      variants: [
        {variant: 'solid', module: '@acme/glyphs', export: 'TrashSolidIcon'},
      ],
      reason: 'word "delete"',
      score: 90,
    });
  });

  it('no match is an empty list, not an error', async () => {
    expect(await search('zebra')).toEqual({
      query: 'zebra',
      matchCount: 0,
      matches: [],
    });
  });

  it('--limit caps the list; matchCount counts every match', async () => {
    const data = await search('remove', {limit: 1});
    expect(data.matches).toHaveLength(1);
    expect(data.matchCount).toBe(2);
    await expect(icon('remove', {cwd, limit: 0})).rejects.toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
    });
  });

  it('--set keeps one set, and an unknown set is ERR_NOT_FOUND', async () => {
    expect(
      (await search('close', {set: '@acme/glyphs/glyphs'})).matchCount,
    ).toBe(1);
    await expect(icon('close', {cwd, set: 'glyps'})).rejects.toMatchObject({
      code: 'ERR_NOT_FOUND',
      suggestions: expect.arrayContaining([
        expect.objectContaining({name: 'glyphs'}),
      ]),
    });
  });

  it('a project with no icon set answers an empty list', async () => {
    fs.rmSync(path.join(cwd, 'node_modules'), {recursive: true});
    expect((await search('close')).matches).toEqual([]);
  });
});

describe('icon.search: an exact query reads as a name or a meaning', () => {
  /**
   * @param {Array<[string, string[]]>} icons id and words
   * @returns {any}
   */
  const set = icons => ({
    name: 'lines',
    package: '@acme/lines',
    data: {
      module: '@acme/lines',
      icons: icons.map(([id, words]) => ({
        id,
        export: `${id.replace(/(^|-)(\w)/g, (_, _s, c) => c.toUpperCase())}Icon`,
        words,
      })),
    },
  });
  /** @param {any} s @param {string} q */
  const ranked = (s, q) =>
    rankIcons([s], q).map(m => [m.id, m.score, m.reason]);

  it('meaning wins: `delete` finds trash before the icon that draws the Delete key', () => {
    // The shape of a large outline library's data: an icon's own id words
    // come first, then its tags.
    const lines = set([
      ['delete', ['delete', 'backspace', 'key']],
      ['trash', ['trash', 'delete', 'remove', 'bin']],
    ]);
    expect(ranked(lines, 'delete')).toEqual([
      ['trash', 90, 'word "delete"'],
      ['delete', 80, 'id "delete"'],
    ]);
  });

  it('a word many icons are named for stays a name: `user` keeps the user icon ahead of one only tagged user', () => {
    const lines = set([
      ['contact', ['contact', 'user', 'person']],
      ['user', ['user', 'person', 'account']],
      ['user-plus', ['user', 'plus', 'add']],
    ]);
    expect(ranked(lines, 'user')).toEqual([
      ['user', 90, 'id "user"'],
      ['user-plus', 90, 'word "user"'],
      ['contact', 80, 'word "user"'],
    ]);
  });

  it('within the leading reading the tag listed earlier wins, and a tie in counts lets meaning lead', () => {
    const lines = set([
      ['eraser', ['eraser', 'rubber', 'clear', 'delete']],
      ['trash', ['trash', 'delete', 'remove', 'bin']],
      ['delete', ['delete', 'backspace', 'key']],
      ['x', ['x', 'close', 'delete']],
    ]);
    expect(ranked(lines, 'delete').map(([id, score]) => [id, score])).toEqual([
      ['trash', 90],
      ['x', 90],
      ['eraser', 90],
      ['delete', 80],
    ]);
    const both = set([
      ['bin', ['bin', 'trash']],
      ['trash', ['trash', 'bin']],
    ]);
    // 1 name (trash) and 1 meaning (bin, tagged trash): meaning leads.
    expect(ranked(both, 'trash').map(([id, score]) => [id, score])).toEqual([
      ['bin', 90],
      ['trash', 80],
    ]);
  });

  it("an icon definition the set's map names comes first", () => {
    const lines = set([['trash', ['trash', 'delete']]]);
    lines.data.icons.push({
      id: 'x',
      export: 'XIcon',
      words: ['x', 'close'],
    });
    lines.data.map = {close: 'x'};
    expect(ranked(lines, 'close')[0]).toEqual(['x', 100, 'definition "close"']);
  });

  it('an icon matches the words of every definition it is mapped to, after its own words', () => {
    // The data file lists only the icon's own name; `delete`'s words
    // (trash, bin, discard) and its name come from the definition.
    const lines = set([
      ['basket', ['basket']],
      ['pile', ['pile', 'discard']],
    ]);
    lines.data.map = {delete: 'basket'};
    expect(ranked(lines, 'bin')).toEqual([['basket', 90, 'word "bin"']]);
    // The icon's own tag ranks before a definition word.
    expect(ranked(lines, 'discard').map(([id]) => id)).toEqual([
      'pile',
      'basket',
    ]);
    // The record still shows the icon's own words.
    expect(rankIcons([lines], 'bin')[0].words).toEqual(['basket']);
  });
});

describe('icon.detail', () => {
  it('reads one icon with every variant import and the envelope package', async () => {
    const result = await icon('glyphs/trash', {cwd});
    expect(result.type).toBe('icon.detail');
    if (result.type !== 'icon.detail') return;
    expect(result.package).toBe('@acme/glyphs');
    expect(result.data.variants).toEqual([
      {
        variant: 'solid',
        module: '@acme/glyphs',
        export: 'TrashSolidIcon',
        import: "import {TrashSolidIcon} from '@acme/glyphs';",
      },
    ]);
    expect((await icon('@acme/glyphs/glyphs/x', {cwd})).type).toBe(
      'icon.detail',
    );
  });

  it('an unknown set or icon is ERR_NOT_FOUND with suggestions', async () => {
    await expect(icon('nope/trash', {cwd})).rejects.toMatchObject({
      code: 'ERR_NOT_FOUND',
    });
    const error = await icon('glyphs/trashcan', {cwd}).catch(e => e);
    expect(error.suggestions[0].name).toBe('glyphs/trash');
    await expect(icon('glyphs/trashcan', {cwd})).rejects.toMatchObject({
      code: 'ERR_NOT_FOUND',
      suggestions: expect.arrayContaining([
        expect.objectContaining({name: 'glyphs/trash'}),
      ]),
    });
  });
});

describe('icon.list', () => {
  it('lists each set with how many icon definitions its map covers', async () => {
    const result = await icon(undefined, {cwd, list: true});
    if (result.type !== 'icon.list') throw new Error(result.type);
    expect(result.data).toMatchObject({
      status: 'selected',
      projectSet: '@acme/glyphs/glyphs',
      withdrawn: [],
    });
    const [set] = result.data.sets;
    expect(set).toMatchObject({
      name: 'glyphs',
      package: '@acme/glyphs',
      license: 'MIT',
      iconCount: 4,
      default: {variant: 'outline'},
      variants: ['outline', 'solid'],
      project: true,
    });
    expect(set.coverage.builtIn.mapped).toBe(2);
    expect(set.coverage.builtIn.total).toBe(ICON_NAMES.length);
    expect(set.coverage.builtIn.missing).toContain('chevronDown');
    expect(set.coverage.builtIn.missing).not.toContain('close');
    expect(set.coverage.astryx.total).toBeGreaterThan(ICON_NAMES.length);
    expect(set.coverage.own).toEqual([]);
  });

  it('refuses a query with --list and no query without it', async () => {
    await expect(icon('x', {cwd, list: true})).rejects.toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
    });
    await expect(icon('', {cwd})).rejects.toMatchObject({
      code: 'ERR_MISSING_ARGUMENT',
    });
  });
});

describe('a withdrawn set, named', () => {
  it('search --set, detail, use, and list say it is withdrawn and why, not that no set has the name', async () => {
    const dir = writeIconSetProject(path.join(tmp, 'withdrawn'), {
      packages: [{}, {name: '@acme/lines', data: '{nope'}],
      config: {experimental: {iconSet: 'lines'}},
    });
    const withdrawn =
      /Icon set "lines" is installed but withdrawn: .*not valid JSON/;
    await expect(icon('close', {cwd: dir, set: 'lines'})).rejects.toMatchObject(
      {code: 'ERR_NOT_FOUND', message: expect.stringMatching(withdrawn)},
    );
    await expect(icon('lines/x', {cwd: dir})).rejects.toMatchObject({
      code: 'ERR_NOT_FOUND',
      message: expect.stringMatching(withdrawn),
    });
    await expect(iconUse('lines', {cwd: dir})).rejects.toMatchObject({
      code: 'ERR_NOT_FOUND',
      message: expect.stringMatching(withdrawn),
    });
    const listed = await icon(undefined, {cwd: dir, list: true});
    if (listed.type !== 'icon.list') throw new Error(listed.type);
    expect(listed.data.status).toBe('withdrawn');
    expect(listed.data.reason).toMatch(
      /names "lines", which is installed but withdrawn: .*not valid JSON/,
    );
    // A name no installed set has, valid or withdrawn, still says so.
    await expect(icon('close', {cwd: dir, set: 'nope'})).rejects.toMatchObject({
      message: expect.stringMatching(/No installed icon set named "nope"/),
    });
  });
});
