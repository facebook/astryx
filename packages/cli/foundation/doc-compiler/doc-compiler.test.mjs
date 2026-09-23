// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the doc compiler: lowering, linking, the compiled-node
 * contract, the lenses, and the rule that readers go through the compiler.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import {parseDoc} from '../../authoring/doctypes/parse.mjs';
import {
  COMPILED_DOC_SCHEMA_VERSION,
  linkReferenceTopic,
  lowerReferenceTopic,
} from './compile.mjs';
import {parseCompiledReferenceNode} from './ir.mjs';
import {detailView, indexView, readerSections, sectionView} from './lenses.mjs';

const CLI_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

/**
 * @param {string} name
 * @param {any[]} sections
 * @param {object} [fields]
 */
function authored(name, sections, fields = {}) {
  return parseDoc(
    {
      name,
      title: `${name} title`,
      description: `About ${name}.`,
      ...fields,
      sections,
    },
    `${name}.doc.mjs`,
  );
}

/** @param {any} doc @param {object} [more] */
const file = (doc, more = {}) => ({file: `${doc.name}.doc.mjs`, doc, ...more});

/**
 * @param {any} base
 * @param {any[]} [extensions]
 * @param {string | null} [lang]
 */
const input = (base, extensions = [], lang = null) => ({
  id: base.doc?.name ?? 'demo',
  provider: '@acme/base',
  replaces: null,
  lang,
  base,
  extensions,
});

const prose = (/** @type {string} */ text) => ({type: 'prose', text});

const demo = () =>
  authored('demo', [
    {title: 'Quick Start', content: [prose('Start here.')]},
    {title: 'Props', content: [prose('Every prop.')]},
  ]);

describe('lowerReferenceTopic', () => {
  it('lays the overlay over authored titles and keys every section', () => {
    const overlay = {
      description: '演示。',
      sections: [
        {
          section: 'Quick Start',
          title: '快速开始',
          content: [prose('从这里开始。')],
        },
      ],
    };
    const node = lowerReferenceTopic(input(file(demo(), {overlay}), [], 'zh'));
    expect(node.schemaVersion).toBe(COMPILED_DOC_SCHEMA_VERSION);
    expect(node.doc.description).toBe('演示。');
    expect(
      node.doc.sections.map((/** @type {any} */ s) => [s.id, s.title]),
    ).toEqual([
      ['quick-start', '快速开始'],
      ['props', 'Props'],
    ]);
    expect(node.sourceTitles).toEqual({
      'quick-start': 'Quick Start',
      props: 'Props',
    });
    // Plain JSON: nothing is lost on a round trip.
    expect(JSON.parse(JSON.stringify(node))).toEqual(node);
  });

  it('merges extensions by key in order and names every provider', () => {
    const extension = authored(
      'demo-acme',
      [
        {title: 'Quick Start', content: [prose('Acme start.')]},
        {title: 'Acme Palettes', content: [prose('Palettes.')]},
      ],
      {extends: 'demo'},
    );
    const node = lowerReferenceTopic(
      input(file(demo()), [{...file(extension), provider: '@acme/ext'}]),
    );
    expect(node.doc.sections.map((/** @type {any} */ s) => s.id)).toEqual([
      'quick-start',
      'props',
      'acme-palettes',
    ]);
    expect(node.doc.sections[0].content).toEqual([prose('Acme start.')]);
    expect(node.provenance).toEqual({
      provider: '@acme/base',
      replaces: null,
      extensions: ['@acme/ext'],
    });
  });

  it('applies extensions in configuration order, so the last one wins', () => {
    const extension = (
      /** @type {string} */ name,
      /** @type {string} */ text,
    ) => ({
      ...file(
        authored(name, [{title: 'Quick Start', content: [prose(text)]}], {
          extends: 'demo',
        }),
      ),
      provider: `@acme/${name}`,
    });
    const node = lowerReferenceTopic(
      input(file(demo()), [
        extension('one', 'First.'),
        extension('two', 'Second.'),
      ]),
    );
    expect(node.doc.sections[0].content).toEqual([prose('Second.')]);
    expect(node.provenance.extensions).toEqual(['@acme/one', '@acme/two']);
  });

  it('reports problems in the order a reader meets them', () => {
    const broken = new Error('extension failed to load');
    const invalidBase = file(
      authored('demo', [{title: 'Only', content: [prose('x')]}]),
    );
    invalidBase.doc = {...invalidBase.doc, title: ''};
    expect(() =>
      lowerReferenceTopic(
        input(invalidBase, [
          {file: 'ext.doc.mjs', error: broken, provider: '@acme/ext'},
        ]),
      ),
    ).toThrow(/demo\.doc\.mjs is invalid/);

    const overlayError = new Error('overlay failed to load');
    expect(() =>
      lowerReferenceTopic(input(file(demo(), {overlayError}), [], 'zh')),
    ).toThrow(overlayError);

    expect(() =>
      lowerReferenceTopic(
        input(file(demo()), [
          {file: 'ext.doc.mjs', error: broken, provider: '@acme/ext'},
        ]),
      ),
    ).toThrow(broken);
  });
});

describe('linking and lenses', () => {
  const tokens = () =>
    lowerReferenceTopic(
      input(
        file(
          authored('tokens', [
            {
              title: 'Spacing',
              previewType: 'spacing-bar',
              content: [
                {type: 'table', headers: ['Token'], rows: [['--space-1']]},
              ],
            },
          ]),
          {overlay: {sections: [{section: 'Spacing', title: '间距'}]}},
        ),
        [],
        'zh',
      ),
    );
  const guide = () =>
    lowerReferenceTopic(
      input(
        file(
          authored('guide', [
            {
              title: 'By Title',
              content: [
                {type: 'token-ref', topic: 'tokens', section: 'SPACING'},
              ],
            },
            {
              title: 'By Key',
              content: [
                {type: 'token-ref', topic: 'tokens', section: 'spacing'},
              ],
            },
            {
              title: 'No Topic',
              content: [{type: 'token-ref', topic: 'nope', section: 'x'}],
            },
            {
              title: 'No Section',
              content: [{type: 'token-ref', topic: 'tokens', section: 'nope'}],
            },
          ]),
        ),
        [],
        'zh',
      ),
    );
  const targets = async (/** @type {string} */ name) =>
    name === 'tokens' ? tokens() : null;

  it('resolves a reference by key or authored title in the reading language', async () => {
    const detail = detailView(await linkReferenceTopic(guide(), targets));
    const [byTitle, byKey, noTopic, noSection] = detail.sections;
    for (const section of [byTitle, byKey]) {
      expect(section.content).toEqual([
        {type: 'table', headers: ['Token'], rows: [['--space-1']]},
      ]);
      expect(section.previewType).toBe('spacing-bar');
    }
    expect(noTopic.content).toEqual([
      prose('[token-ref: unknown topic "nope"]'),
    ]);
    expect(noSection.content).toEqual([
      prose('[token-ref: section "nope" not found in "tokens"]'),
    ]);
  });

  it('reads the index and section lookups without linking', () => {
    const node = guide();
    expect(indexView(node).sections.map(s => s.id)).toEqual([
      'by-title',
      'by-key',
      'no-topic',
      'no-section',
    ]);
    expect(readerSections(node).map(s => s.title)).toEqual([
      'By Title',
      'By Key',
      'No Topic',
      'No Section',
    ]);
    expect(() => sectionView(node, node.doc.sections[0])).toThrow(
      /before it was linked/,
    );
  });
});

describe('parseCompiledReferenceNode', () => {
  const node = () => lowerReferenceTopic(input(file(demo())));

  it('returns a valid node as given', () => {
    const value = JSON.parse(JSON.stringify(node()));
    expect(parseCompiledReferenceNode(value)).toBe(value);
  });

  it('names an unsupported schema version', () => {
    expect(() =>
      parseCompiledReferenceNode({...node(), schemaVersion: 99}),
    ).toThrow(/schema version 99 is not supported/);
  });

  it('rejects a node that lost an authored title or duplicated a key', () => {
    expect(() =>
      parseCompiledReferenceNode({...node(), sourceTitles: {}}),
    ).toThrow(/no authored title for section "quick-start"/);
    const twice = node();
    twice.doc.sections[1] = {...twice.doc.sections[1], id: 'quick-start'};
    twice.sourceTitles['quick-start'] = 'Quick Start';
    expect(() => parseCompiledReferenceNode(twice)).toThrow(
      /two sections have the key/,
    );
  });

  it('rejects a malformed token reference resolution', () => {
    const bad = node();
    bad.doc.sections[0] = {
      ...bad.doc.sections[0],
      content: [
        {
          type: 'token-ref',
          topic: 't',
          section: 's',
          resolved: {status: 'maybe'},
        },
      ],
    };
    expect(() => parseCompiledReferenceNode(bad)).toThrow(
      /token reference to "t"/,
    );
  });
});

describe('readers go through the compiler', () => {
  /** Doc work that belongs to discovery and the compiler, never to a reader. */
  const COMPILER_ONLY =
    /\b(mergeTopic|withSectionKeys|linkReferenceTopic|linkReferenceSection|lowerReferenceTopic)\s*\(/;
  const ALLOWED = new Set([
    'api/docs/_adapter.mjs',
    'api/docs/detail/detail.mjs',
    'api/docs/detail/section/section.mjs',
  ]);

  /** @param {string} dir @returns {string[]} */
  const sources = dir =>
    fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory())
        return entry.name === 'node_modules' ? [] : sources(full);
      return entry.name.endsWith('.mjs') && !entry.name.endsWith('.test.mjs')
        ? [full]
        : [];
    });

  it('keeps merging, keying and linking out of api/ and clients/', () => {
    const offenders = ['api', 'clients']
      .flatMap(dir => sources(path.join(CLI_ROOT, dir)))
      .map(full => path.relative(CLI_ROOT, full).split(path.sep).join('/'))
      .filter(rel => !ALLOWED.has(rel))
      .filter(rel =>
        COMPILER_ONLY.test(fs.readFileSync(path.join(CLI_ROOT, rel), 'utf8')),
      );
    expect(offenders).toEqual([]);
  });
});
