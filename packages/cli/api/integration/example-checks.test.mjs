// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {validateIntegration} from './validate-integration.mjs';
import {integrationCheck} from './check/check.mjs';

/** @type {string} */
let dir;

/** @param {Record<string, string>} files */
function write(files) {
  for (const [rel, text] of Object.entries(files)) {
    const file = path.join(dir, rel);
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, text);
  }
}

/** @param {string} name @param {string} [extra] */
const componentDoc = (name, extra = '') =>
  `export default {type: 'component', name: '${name}', displayName: '${name}', description: 'A part.', props: []${extra}};\n`;

/** @param {string} name */
const componentSource = name => `export function ${name}() { return null; }\n`;

/** @param {string} name @param {string} fields */
const blockDoc = (name, fields) =>
  `export default {type: 'block', name: '${name}', displayName: '${name}', description: 'A block.'${fields}};\n`;

/**
 * The example notes validate lists, by code.
 * @param {string[]} [codes]
 */
async function notesOf(codes) {
  const {data} = await validateIntegration(undefined, {cwd: dir});
  return (data.notes ?? []).filter(note => !codes || codes.includes(note.code));
}

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-examples-'));
  write({
    'package.json': JSON.stringify({name: '@acme/kit', version: '1.0.0'}),
    'astryx.integration.mjs':
      "export default {components: './components', templates: './templates'};\n",
    'components/AcmeCard.doc.mjs': componentDoc('AcmeCard'),
    'components/AcmeCard.tsx': componentSource('AcmeCard'),
  });
});

afterEach(() => {
  fs.rmSync(dir, {recursive: true, force: true});
});

describe('component_without_example', () => {
  it('lists a component no showcase shows, with a template to paste, for the next minor', async () => {
    write({
      // Named like a showcase, but sets no exampleFor: a standalone block.
      'templates/AcmeCardShowcase.doc.mjs': blockDoc('AcmeCardShowcase', ''),
      'templates/AcmeCardShowcase.tsx': 'export default () => null;\n',
    });

    const notes = await notesOf(['component_without_example']);
    expect(notes).toHaveLength(1);
    expect(notes[0].next).toBe(true);
    expect(notes[0].message).toContain('components/AcmeCard.doc.mjs');
    expect(notes[0].message).toContain('templates/acme-card-showcase.doc.mjs');
    expect(notes[0].message).toContain(
      "exampleFor: 'AcmeCard', isShowcase: true, aspectRatio: 16 / 10",
    );
  });

  it.each([
    ['an exampleFor without isShowcase', ", exampleFor: 'AcmeCard'", 1],
    [
      'an exampleFor with isShowcase',
      ", exampleFor: 'AcmeCard', isShowcase: true",
      0,
    ],
    ['an alsoShowcaseFor', ", alsoShowcaseFor: ['AcmeCard']", 0],
  ])(
    'counts a block with %s as the example: %i note(s)',
    async (_, fields, count) => {
      // Each case its own file: a doc module is read once per path.
      const name = `card-${count}-${fields.length}`;
      write({
        [`templates/${name}.doc.mjs`]: blockDoc(name, fields),
        [`templates/${name}.tsx`]: 'export default () => null;\n',
      });
      expect(await notesOf(['component_without_example'])).toHaveLength(count);
    },
  );

  it('exempts hidden docs, parts kept off the overview and Utility components', async () => {
    write({
      'templates/.keep': '',
      'components/AcmeCard.doc.mjs': componentDoc(
        'AcmeCard',
        ', isHiddenFromOverview: true',
      ),
      'components/AcmeProvider.doc.mjs': componentDoc(
        'AcmeProvider',
        ", category: 'Utility'",
      ),
      'components/AcmeProvider.tsx': componentSource('AcmeProvider'),
      'components/AcmeSecret.doc.mjs': componentDoc(
        'AcmeSecret',
        ', hidden: true',
      ),
      'components/AcmeSecret.tsx': componentSource('AcmeSecret'),
    });

    expect(await notesOf(['component_without_example'])).toEqual([]);
  });

  it('names the templates root to add when the manifest has none', async () => {
    write({
      'astryx.integration.mjs':
        "export default {components: './components'};\n",
    });

    const [note] = await notesOf(['component_without_example']);
    expect(note.message).toContain("add `templates: './templates'`");
  });
});

describe('template_category', () => {
  it('lists a category written as a path, with a "<Group> - <Variant>" one', async () => {
    write({
      'templates/card.doc.mjs': blockDoc(
        'card',
        ", category: 'components/AcmeCard', exampleFor: 'AcmeCard', isShowcase: true",
      ),
      'templates/card.tsx': 'export default () => null;\n',
      'templates/fine.doc.mjs': blockDoc('fine', ", category: 'Acme - Cards'"),
      'templates/fine.tsx': 'export default () => null;\n',
      'templates/none.doc.mjs': blockDoc('none', ''),
      'templates/none.tsx': 'export default () => null;\n',
      // Core's own forms: one word, and a variant with a slash.
      'templates/word.doc.mjs': blockDoc('word', ", category: 'Settings'"),
      'templates/word.tsx': 'export default () => null;\n',
      'templates/slash.doc.mjs': blockDoc(
        'slash',
        ", category: 'Table - Index/Detail'",
      ),
      'templates/slash.tsx': 'export default () => null;\n',
    });

    const notes = await notesOf(['template_category']);
    expect(notes).toHaveLength(1);
    expect(notes[0].message).toContain("category 'components/AcmeCard'");
    expect(notes[0].message).toContain(
      "Fix: category: 'Components - AcmeCard'",
    );
  });
});

describe('showcase_not_standalone', () => {
  it('lists a showcase that imports server-only code or reads process.env, and allows live data', async () => {
    write({
      'templates/card.doc.mjs': blockDoc(
        'card',
        ", exampleFor: 'AcmeCard', isShowcase: true",
      ),
      'templates/card.tsx': [
        "import {headers} from 'next/headers';",
        "import fs from 'node:fs';",
        'export default async function Card() {',
        "  const res = await fetch('/api/graphql');",
        '  return process.env.SECRET;',
        '}',
        '',
      ].join('\n'),
      'templates/live.doc.mjs': blockDoc(
        'live',
        ", exampleFor: 'AcmeCard', isShowcase: true",
      ),
      'templates/live.tsx': [
        "import type {Headers} from 'next/headers';",
        "// import fs from 'node:fs';",
        '/* const key = process.env.SECRET; */',
        'export default function Live() {',
        "  if (process.env.NODE_ENV !== 'production') fetch('/api/graphql');",
        '  return null;',
        '}',
        '',
      ].join('\n'),
    });

    const notes = await notesOf(['showcase_not_standalone']);
    expect(notes).toHaveLength(1);
    expect(notes[0].message).toContain('templates/card.tsx');
    expect(notes[0].message).toContain("imports 'next/headers'");
    expect(notes[0].message).toContain("imports 'node:fs'");
    expect(notes[0].message).toContain('reads process.env');
    expect(notes[0].message).toContain(
      'Fetching live data through the app is fine',
    );
  });
});

describe('template_asset_not_packed', () => {
  it('lists an asset the files field leaves out, and one that does not exist', async () => {
    write({
      'package.json': JSON.stringify({
        name: '@acme/kit',
        version: '1.0.0',
        files: ['components', 'templates', 'astryx.integration.mjs'],
      }),
      'assets/cat.png': 'png',
      'templates/cat.png': 'png',
      'templates/card.doc.mjs': blockDoc(
        'card',
        ", exampleFor: 'AcmeCard', isShowcase: true",
      ),
      'templates/card.tsx': [
        "const outside = new URL('../assets/cat.png', import.meta.url);",
        "const inside = new URL('./cat.png', import.meta.url);",
        "const missing = new URL('./dog.png', import.meta.url);",
        'export default () => null;',
        '',
      ].join('\n'),
    });

    const notes = await notesOf(['template_asset_not_packed']);
    expect(notes.map(note => note.message)).toEqual([
      expect.stringContaining(
        'loads assets/cat.png, which the package.json `files` field leaves out of the package, so the template breaks once installed. Fix: add "assets" to `files`.',
      ),
      expect.stringContaining('loads templates/dog.png, which does not exist.'),
    ]);
  });

  it.each([
    [['templates/**/*', 'astryx.integration.mjs']],
    [['templates', '*.png']],
    [['./assets/', 'templates/']],
  ])('counts what npm packs under %j', async files => {
    write({
      'package.json': JSON.stringify({
        name: '@acme/kit',
        version: '1.0.0',
        files,
      }),
      'assets/cat.png': 'png',
      'templates/cat.png': 'png',
      'templates/card.doc.mjs': blockDoc(
        'card',
        ", exampleFor: 'AcmeCard', isShowcase: true",
      ),
      'templates/card.tsx': [
        "const inside = new URL('./cat.png', import.meta.url);",
        files.includes('templates/**/*')
          ? ''
          : "const outside = new URL('../assets/cat.png', import.meta.url);",
        'export default () => null;',
        '',
      ].join('\n'),
    });
    expect(await notesOf(['template_asset_not_packed'])).toEqual([]);
  });
});

describe('integration check', () => {
  it('fails --strict --next on the example notes, never plain --strict', async () => {
    // This folder has no TypeScript, so --strict fails on that skip; the
    // example notes are not among its failures.
    const strict = await integrationCheck({cwd: dir, strict: true});
    expect(strict.data.upcoming).toBeGreaterThan(0);
    expect(strict.data.failures.map(failure => failure.code)).not.toContain(
      'component_without_example',
    );

    const next = await integrationCheck({cwd: dir, strict: true, next: true});
    expect(next.data.failed).toBe(true);
    expect(next.data.failures.map(failure => failure.code)).toContain(
      'component_without_example',
    );
  });
});
