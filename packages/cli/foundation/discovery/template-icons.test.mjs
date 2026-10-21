// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Template icon mapping (AST-084 FR9, FR10): a template's declared
 * icon definitions, an installed set's icons and reviewed matches, a kept
 * icon, a variant, a name collision, and no set. Nothing is guessed from
 * names or words.
 */

import {describe, expect, it} from 'vitest';
import {mapTemplateIcons, matchIcon} from './template-icons.mjs';
import {glyphsData} from '../../test-utils/icon-set-fixture.mjs';

const SET = /** @type {any} */ ({
  name: 'glyphs',
  package: '@acme/glyphs',
  data: {
    ...glyphsData(),
    module: '@acme/glyphs',
    map: {close: 'x', search: 'search', delete: 'trash', home: 'home'},
  },
});

/** @type {any} */
const SELECTED = {status: 'selected', set: SET, reason: 'only set'};

/**
 * @param {string} source
 * @param {Record<string, string>} [declared]
 * @param {any} [choice]
 * @param {any[]} [sets]
 */
const map = (source, declared = {}, choice = SELECTED, sets = [SET]) =>
  mapTemplateIcons(source, {sets, choice}, declared);

describe('matchIcon', () => {
  it("maps by the project set's map for the declared definition, and never by name", () => {
    expect(
      matchIcon(
        {
          setName: null,
          export: 'BinIcon',
          id: 'BinIcon',
          definitions: ['delete'],
        },
        SET,
      ),
    ).toMatchObject({by: 'definition', icon: {id: 'trash'}});
    // Same id as a set icon, but no definition: not mapped.
    expect(
      matchIcon(
        {setName: null, export: 'HomeIcon', id: 'home', definitions: []},
        SET,
      ),
    ).toBeNull();
    // A definition the set does not map: not mapped.
    expect(
      matchIcon(
        {
          setName: null,
          export: 'PencilIcon',
          id: 'PencilIcon',
          definitions: ['edit'],
        },
        SET,
      ),
    ).toBeNull();
  });
});

describe('mapTemplateIcons', () => {
  const SOURCE = [
    "import React from 'react';",
    "import {CloseGlyph, PencilGlyph, HomeGlyph as House} from '@acme/library';",
    "import {BinGlyph} from '@acme/library/solid';",
    '',
    'export default function Page() {',
    '  const icons = {CloseGlyph};',
    '  return <div><CloseGlyph className="x" /><PencilGlyph /><House /><BinGlyph />{icons.CloseGlyph}</div>;',
    '}',
    '',
  ].join('\n');
  const DECLARED = {
    CloseGlyph: 'close',
    PencilGlyph: 'edit',
    HomeGlyph: 'home',
    BinGlyph: 'delete',
  };

  it('rewrites each declared icon the set maps, every reference too, and keeps the rest', () => {
    const {source, icons} = map(SOURCE, DECLARED);
    expect(source).toContain(
      "import {XIcon, HomeIcon, TrashIcon} from '@acme/glyphs';",
    );
    expect(source).toContain("import {PencilGlyph} from '@acme/library';");
    expect(source).not.toContain('@acme/library/solid');
    expect(source).toContain('<XIcon className="x" />');
    expect(source).toContain('<HomeIcon />');
    expect(source).toContain('<PencilGlyph />');
    // A property name keeps its text; a shorthand property keeps its key.
    expect(source).toContain('const icons = {CloseGlyph: XIcon};');
    expect(source).toContain('{icons.CloseGlyph}');
    expect(icons.status).toBe('selected');
    expect(
      icons.mapped.map(each => [
        each.source.export,
        each.target.export,
        each.by,
      ]),
    ).toEqual([
      ['CloseGlyph', 'XIcon', 'definition'],
      ['HomeGlyph', 'HomeIcon', 'definition'],
      ['BinGlyph', 'TrashIcon', 'definition'],
    ]);
    expect(icons.kept).toEqual([
      expect.objectContaining({
        module: '@acme/library',
        export: 'PencilGlyph',
        reason: expect.stringContaining('"edit"'),
      }),
    ]);
  });

  it('an undeclared import is not an icon: it is left alone and not reported', () => {
    const source =
      "import {CloseGlyph} from '@acme/library';\nexport const A = () => <CloseGlyph />;\n";
    expect(map(source)).toEqual({
      source,
      icons: expect.objectContaining({mapped: [], kept: []}),
    });
  });

  it('imports under an alias when the mapped name is taken', () => {
    const {source} = map(
      "import {CloseGlyph} from '@acme/library';\nconst XIcon = 1;\nexport const A = () => <CloseGlyph />;\n",
      {CloseGlyph: 'close'},
    );
    expect(source).toContain("import {XIcon as XIcon2} from '@acme/glyphs';");
    expect(source).toContain('<XIcon2 />');
    expect(source).toContain('const XIcon = 1;');
  });

  it('without a project icon set the source is unchanged and the report says why', () => {
    for (const status of ['none', 'ambiguous']) {
      const {source, icons} = map(SOURCE, DECLARED, {status, reason: 'why'});
      expect(source).toBe(SOURCE);
      expect(icons).toEqual({
        status,
        set: null,
        reason: 'why',
        mapped: [],
        kept: [],
      });
    }
  });

  it('leaves imports from the project set alone', () => {
    const source =
      "import {XIcon} from '@acme/glyphs';\nexport const A = () => <XIcon />;\n";
    expect(map(source, {XIcon: 'close'})).toEqual({
      source,
      icons: expect.objectContaining({mapped: [], kept: []}),
    });
  });
});

describe('icons another installed set ships', () => {
  const OTHER = /** @type {any} */ ({
    name: 'lines',
    package: '@acme/lines',
    data: {
      schemaVersion: 1,
      module: '@acme/lines',
      axes: {appearances: ['outline', 'solid']},
      default: {appearance: 'outline'},
      map: {close: 'cross'},
      icons: [
        {
          id: 'cross',
          export: 'CrossIcon',
          words: ['cross'],
          variants: [{appearance: 'solid', export: 'CrossSolidIcon'}],
        },
        {id: 'bin', export: 'BinIcon', words: ['bin']},
      ],
    },
  });

  it("maps by the source set's map, with no declaration, and keeps the variant's appearance", () => {
    const {source, icons} = map(
      "import {CrossIcon, CrossSolidIcon, BinIcon} from '@acme/lines';\nexport const A = () => <><CrossIcon /><CrossSolidIcon /><BinIcon /></>;\n",
      {},
      SELECTED,
      [SET, OTHER],
    );
    expect(
      icons.mapped.map(each => [each.source.export, each.target.export]),
    ).toEqual([
      ['CrossIcon', 'XIcon'],
      ['CrossSolidIcon', 'XIcon'],
    ]);
    // bin draws no definition the lines set maps: kept.
    expect(icons.kept.map(each => each.export)).toEqual(['BinIcon']);
    expect(source).toContain("import {BinIcon} from '@acme/lines';");
  });

  it('a reviewed exact match beats the definition, and a likely one is only suggested', () => {
    const REVIEWED = /** @type {any} */ ({
      ...SET,
      data: {
        ...SET.data,
        icons: SET.data.icons.map((/** @type {any} */ icon) =>
          icon.id === 'home'
            ? {
                ...icon,
                matches: [
                  {set: 'lines', export: 'CrossIcon', confidence: 'exact'},
                  {set: 'lines', export: 'BinIcon', confidence: 'likely'},
                ],
              }
            : icon,
        ),
      },
    });
    const {icons} = map(
      "import {CrossIcon, BinIcon} from '@acme/lines';\nexport const A = () => <><CrossIcon /><BinIcon /></>;\n",
      {},
      {status: 'selected', set: REVIEWED, reason: 'only set'},
      [REVIEWED, OTHER],
    );
    expect(icons.mapped).toEqual([
      expect.objectContaining({
        target: expect.objectContaining({id: 'home'}),
        by: 'match',
      }),
    ]);
    expect(icons.kept).toEqual([
      expect.objectContaining({
        export: 'BinIcon',
        suggestion: expect.objectContaining({id: 'home', confidence: 'likely'}),
      }),
    ]);
  });
});
