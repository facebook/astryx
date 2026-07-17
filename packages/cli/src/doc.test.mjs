// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {createDoc, ComponentDocSchema} from './doc.mjs';
import {
  loadComponentDoc,
} from './lib/component-loader.mjs';

// createDoc is a pure typed-identity helper (like createConfig /
// createIntegration): it returns its argument unchanged and performs NO
// runtime validation. Validation happens at the LOAD boundary
// (loadComponentDoc runs the loaded value through ComponentDocSchema), so the
// rejection cases assert the schema rejects rather than the factory throwing.

const goodSingle = {
  name: 'Widget',
  displayName: 'Widget',
  description: 'A small widget.',
  props: [
    {name: 'label', type: 'string', description: 'Visible label.', required: true},
    {name: 'size', type: "'sm' | 'md'", description: 'Control size.', default: "'md'"},
  ],
};

describe('createDoc (typed identity)', () => {
  it('returns the doc unchanged', () => {
    expect(createDoc(goodSingle)).toBe(goodSingle);
    const minimal = {name: 'X', props: []};
    expect(createDoc(minimal)).toBe(minimal);
  });

  it('does NOT validate — returns invalid shapes unchanged', () => {
    const bogus = {group: 'Buttons'}; // no name
    expect(createDoc(bogus)).toBe(bogus);
  });
});

describe('ComponentDocSchema (load-boundary validation)', () => {
  it('accepts a valid single-component doc', () => {
    expect(() => ComponentDocSchema.parse(goodSingle)).not.toThrow();
  });

  it('accepts a multi-component doc', () => {
    const multi = {
      name: 'Table',
      displayName: 'Table',
      components: [{name: 'TableRow', displayName: 'Table Row', description: 'A row.'}],
    };
    expect(() => ComponentDocSchema.parse(multi)).not.toThrow();
  });

  it('accepts a sub-component doc', () => {
    const sub = {
      name: 'TypeaheadItem',
      subComponentOf: 'Typeahead',
      displayName: 'Typeahead Item',
      description: 'A result item.',
      props: [{name: 'item', type: 'SearchableItem', description: 'The item.'}],
    };
    expect(() => ComponentDocSchema.parse(sub)).not.toThrow();
  });

  it('accepts extra/loose fields via passthrough (usage, playground, theming)', () => {
    const loose = {
      ...goodSingle,
      usage: {description: 'Use it wisely.'},
      playground: {defaults: {label: 'Hi'}},
      theming: {targets: [{className: 'astryx-widget'}]},
      keywords: ['widget', 'thing'],
      category: 'Content',
      isHiddenFromOverview: true,
    };
    expect(() => ComponentDocSchema.parse(loose)).not.toThrow();
  });

  it('reserves an optional `showcase` field (unconsumed passthrough)', () => {
    const withShowcase = {...goodSingle, showcase: 'WidgetHero'};
    const parsed = ComponentDocSchema.parse(withShowcase);
    expect(parsed.showcase).toBe('WidgetHero');
  });

  it('rejects a doc with no name', () => {
    expect(() => ComponentDocSchema.parse({props: []})).toThrow();
  });

  it('rejects an empty name with a readable message', () => {
    expect(() => ComponentDocSchema.parse({name: '', props: []})).toThrow(
      /name is required/,
    );
  });

  it('rejects a prop missing its type', () => {
    expect(() =>
      ComponentDocSchema.parse({
        name: 'Widget',
        props: [{name: 'label', description: 'no type'}],
      }),
    ).toThrow();
  });
});

describe('loadComponentDoc (load boundary)', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-doc-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, {recursive: true, force: true});
  });

  it('loads a .doc.ts fixture via jiti (factory default export) and validates', async () => {
    const file = path.join(tmpDir, 'Widget.doc.ts');
    const docModule = path.resolve(import.meta.dirname, 'doc.mjs');
    fs.writeFileSync(
      file,
      [
        `import {createDoc} from ${JSON.stringify(docModule)};`,
        'export default createDoc({',
        "  name: 'Widget',",
        "  displayName: 'Widget',",
        "  description: 'A small widget.',",
        '  props: [',
        "    {name: 'label', type: 'string', description: 'Visible label.', required: true},",
        '  ],',
        '});',
      ].join('\n'),
    );
    const docs = await loadComponentDoc(file);
    expect(docs.name).toBe('Widget');
    expect(docs.props).toHaveLength(1);
  });

  it('loads a .doc.mjs fixture via native import (default export) and validates', async () => {
    const file = path.join(tmpDir, 'Legacy.doc.mjs');
    fs.writeFileSync(
      file,
      [
        'export default {',
        "  name: 'Legacy',",
        "  displayName: 'Legacy',",
        "  description: 'A default-exported doc.',",
        "  props: [{name: 'value', type: 'string', description: 'A value.'}],",
        '};',
      ].join('\n'),
    );
    const docs = await loadComponentDoc(file);
    expect(docs.name).toBe('Legacy');
    expect(docs.props[0].name).toBe('value');
  });

  it('throws a readable error for an invalid doc', async () => {
    const file = path.join(tmpDir, 'Bad.doc.mjs');
    fs.writeFileSync(file, 'export default {group: "Buttons"};\n');
    await expect(loadComponentDoc(file)).rejects.toThrow(/is invalid|name/);
  });
});
