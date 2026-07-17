// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  createComponentDoc,
  createFunctionDoc,
  createDoc,
  ComponentDocSchema,
  ComponentDocKindSchema,
  FunctionDocKindSchema,
  GenericDocKindSchema,
} from './doc.mjs';
import {loadComponentDoc} from './lib/component-loader.mjs';

// The factories are stamp-only (like createConfig / createBlockTemplate): they
// inject a `type` discriminant and are otherwise identity, performing NO
// runtime validation. Validation happens at the LOAD boundary
// (loadComponentDoc runs the loaded value through ComponentDocSchema), so the
// rejection cases assert the schema rejects rather than the factory throwing.

const goodComponent = {
  name: 'Widget',
  displayName: 'Widget',
  description: 'A small widget.',
  props: [
    {name: 'label', type: 'string', description: 'Visible label.', required: true},
    {name: 'size', type: "'sm' | 'md'", description: 'Control size.', default: "'md'"},
  ],
};

const goodFunction = {
  name: 'useThing',
  displayName: 'useThing',
  description: 'A thing hook.',
  params: [{name: 'input', type: 'string', description: 'The input.', required: true}],
  returns: [{name: 'value', type: 'string', description: 'The result.'}],
};

const goodGeneric = {
  name: 'Theming',
  displayName: 'Theming',
  description: 'How theming works.',
};

describe('doc factories (stamp-only)', () => {
  it('createComponentDoc stamps type: component and is otherwise identity', () => {
    const doc = createComponentDoc(goodComponent);
    expect(doc.type).toBe('component');
    const {type, ...rest} = doc;
    expect(rest).toEqual(goodComponent);
  });

  it('createFunctionDoc stamps type: function and is otherwise identity', () => {
    const doc = createFunctionDoc(goodFunction);
    expect(doc.type).toBe('function');
    const {type, ...rest} = doc;
    expect(rest).toEqual(goodFunction);
  });

  it('createDoc stamps type: generic and is otherwise identity', () => {
    const doc = createDoc(goodGeneric);
    expect(doc.type).toBe('generic');
    const {type, ...rest} = doc;
    expect(rest).toEqual(goodGeneric);
  });

  it('does NOT validate — stamps invalid shapes unchanged', () => {
    const bogus = {group: 'Buttons'}; // no name
    expect(createComponentDoc(bogus)).toEqual({...bogus, type: 'component'});
  });
});

describe('per-kind schemas (new stamped format)', () => {
  it('ComponentDocKindSchema accepts a valid component doc', () => {
    expect(() =>
      ComponentDocKindSchema.parse(createComponentDoc(goodComponent)),
    ).not.toThrow();
  });

  it('ComponentDocKindSchema rejects a missing name with a readable message', () => {
    expect(() =>
      ComponentDocKindSchema.parse({type: 'component', name: '', props: []}),
    ).toThrow(/name is required/);
  });

  it('ComponentDocKindSchema rejects a prop missing its type with a readable message', () => {
    expect(() =>
      ComponentDocKindSchema.parse({
        type: 'component',
        name: 'Widget',
        props: [{name: 'label', description: 'no type'}],
      }),
    ).toThrow(/type/);
  });

  it('ComponentDocKindSchema surfaces the custom message for an empty prop type', () => {
    expect(() =>
      ComponentDocKindSchema.parse({
        type: 'component',
        name: 'Widget',
        props: [{name: 'label', type: '', description: 'empty type'}],
      }),
    ).toThrow(/prop type is required/);
  });

  it('FunctionDocKindSchema accepts a valid function doc', () => {
    expect(() =>
      FunctionDocKindSchema.parse(createFunctionDoc(goodFunction)),
    ).not.toThrow();
  });

  it('FunctionDocKindSchema rejects a function doc missing returns', () => {
    expect(() =>
      FunctionDocKindSchema.parse({
        type: 'function',
        name: 'useThing',
        params: [],
      }),
    ).toThrow();
  });

  it('GenericDocKindSchema accepts a valid generic doc', () => {
    expect(() =>
      GenericDocKindSchema.parse(createDoc(goodGeneric)),
    ).not.toThrow();
  });

  it('keeps nested rich blobs loose (usage/theming/playground passthrough)', () => {
    const doc = createComponentDoc({
      ...goodComponent,
      usage: {description: 'Use it.', anatomy: [{name: 'root'}]},
      theming: {targets: [{className: 'astryx-widget'}]},
      playground: {defaults: {label: 'Hi'}},
      examples: [{title: 'Basic', code: '<Widget />'}],
    });
    expect(() => ComponentDocKindSchema.parse(doc)).not.toThrow();
  });

  it('accepts parent + relatedDocs on the shared base', () => {
    const doc = createComponentDoc({
      ...goodComponent,
      parent: 'WidgetGroup',
      relatedDocs: ['Gauge', 'useThing'],
      group: 'Widgets',
    });
    const parsed = ComponentDocKindSchema.parse(doc);
    expect(parsed.parent).toBe('WidgetGroup');
    expect(parsed.relatedDocs).toEqual(['Gauge', 'useThing']);
  });
});

describe('ComponentDocSchema (load-boundary, both formats)', () => {
  it('accepts a stamped component doc via the per-kind schema', () => {
    expect(() =>
      ComponentDocSchema.parse(createComponentDoc(goodComponent)),
    ).not.toThrow();
  });

  it('accepts a stamped function doc', () => {
    expect(() =>
      ComponentDocSchema.parse(createFunctionDoc(goodFunction)),
    ).not.toThrow();
  });

  it('accepts a stamped generic doc', () => {
    expect(() =>
      ComponentDocSchema.parse(createDoc(goodGeneric)),
    ).not.toThrow();
  });

  it('accepts the OLD loose single-component shape (no type)', () => {
    expect(() => ComponentDocSchema.parse(goodComponent)).not.toThrow();
  });

  it('accepts the OLD loose multi-component shape (components[])', () => {
    const multi = {
      name: 'Table',
      displayName: 'Table',
      components: [{name: 'TableRow', displayName: 'Table Row', description: 'A row.'}],
    };
    expect(() => ComponentDocSchema.parse(multi)).not.toThrow();
  });

  it('accepts the OLD loose sub-component shape (subComponentOf)', () => {
    const sub = {
      name: 'GaugeItem',
      subComponentOf: 'Gauge',
      displayName: 'Gauge Item',
      description: 'A gauge item.',
      props: [{name: 'item', type: 'Item', description: 'The item.'}],
    };
    expect(() => ComponentDocSchema.parse(sub)).not.toThrow();
  });

  it('accepts the OLD loose standalone-hook shape (params + returns, no type)', () => {
    const hook = {
      name: 'useThing',
      displayName: 'useThing',
      params: [{name: 'q', type: 'string', description: 'query'}],
      returns: [{name: 'value', type: 'boolean', description: 'match'}],
    };
    expect(() => ComponentDocSchema.parse(hook)).not.toThrow();
  });

  it('accepts BOTH parent and legacy subComponentOf', () => {
    const withParent = {name: 'A', parent: 'B', props: []};
    const withSubComponentOf = {
      name: 'A',
      subComponentOf: 'B',
      description: 'sub',
      props: [],
    };
    expect(() => ComponentDocSchema.parse(withParent)).not.toThrow();
    expect(() => ComponentDocSchema.parse(withSubComponentOf)).not.toThrow();
  });

  it('accepts BOTH relatedDocs and legacy relatedComponents/relatedHooks', () => {
    const legacy = {
      name: 'useThing',
      displayName: 'useThing',
      params: [],
      returns: [],
      relatedComponents: ['Gauge'],
      relatedHooks: ['useOther'],
    };
    const modern = {...goodComponent, relatedDocs: ['Gauge', 'useThing']};
    expect(() => ComponentDocSchema.parse(legacy)).not.toThrow();
    expect(() =>
      ComponentDocSchema.parse(createComponentDoc(modern)),
    ).not.toThrow();
  });

  it('passes through loose extras (usage, playground, theming, importPath, showcase)', () => {
    const loose = {
      ...goodComponent,
      usage: {description: 'Use it wisely.'},
      playground: {defaults: {label: 'Hi'}},
      theming: {targets: [{className: 'astryx-widget'}]},
      keywords: ['widget', 'thing'],
      category: 'Content',
      isHiddenFromOverview: true,
      importPath: '@astryxdesign/core/Widget',
      showcase: 'WidgetHero',
    };
    const parsed = ComponentDocSchema.parse(loose);
    expect(parsed.importPath).toBe('@astryxdesign/core/Widget');
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
});

describe('loadComponentDoc (load boundary)', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-doc-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, {recursive: true, force: true});
  });

  const docModule = () => JSON.stringify(path.resolve(import.meta.dirname, 'doc.mjs'));

  it('loads a .doc.ts fixture via jiti (createComponentDoc default export)', async () => {
    const file = path.join(tmpDir, 'Widget.doc.ts');
    fs.writeFileSync(
      file,
      [
        `import {createComponentDoc} from ${docModule()};`,
        'export default createComponentDoc({',
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
    expect(docs.type).toBe('component');
    expect(docs.name).toBe('Widget');
    expect(docs.props).toHaveLength(1);
  });

  it('loads a .doc.ts fixture via jiti (createFunctionDoc default export)', async () => {
    const file = path.join(tmpDir, 'useThing.doc.ts');
    fs.writeFileSync(
      file,
      [
        `import {createFunctionDoc} from ${docModule()};`,
        'export default createFunctionDoc({',
        "  name: 'useThing',",
        "  displayName: 'useThing',",
        "  params: [{name: 'input', type: 'string', description: 'The input.'}],",
        "  returns: [{name: 'value', type: 'string', description: 'The result.'}],",
        '});',
      ].join('\n'),
    );
    const docs = await loadComponentDoc(file);
    expect(docs.type).toBe('function');
    expect(docs.params).toHaveLength(1);
    expect(docs.returns).toHaveLength(1);
  });

  it('loads a .doc.ts fixture via jiti (createDoc generic default export)', async () => {
    const file = path.join(tmpDir, 'Theming.doc.ts');
    fs.writeFileSync(
      file,
      [
        `import {createDoc} from ${docModule()};`,
        'export default createDoc({',
        "  name: 'Theming',",
        "  displayName: 'Theming',",
        "  description: 'How theming works.',",
        '});',
      ].join('\n'),
    );
    const docs = await loadComponentDoc(file);
    expect(docs.type).toBe('generic');
    expect(docs.name).toBe('Theming');
  });

  it('REGRESSION: loads the OLD loose `export const docs = {}` format', async () => {
    const file = path.join(tmpDir, 'Legacy.doc.mjs');
    fs.writeFileSync(
      file,
      [
        'export const docs = {',
        "  name: 'Legacy',",
        "  displayName: 'Legacy',",
        "  description: 'A loose named-export doc.',",
        "  relatedComponents: ['Gauge'],",
        "  relatedHooks: ['useThing'],",
        "  importPath: '@astryxdesign/core/Legacy',",
        "  props: [{name: 'value', type: 'string', description: 'A value.'}],",
        '};',
      ].join('\n'),
    );
    const docs = await loadComponentDoc(file);
    expect(docs.name).toBe('Legacy');
    expect(docs.props[0].name).toBe('value');
    expect(docs.relatedComponents).toEqual(['Gauge']);
    expect(docs.importPath).toBe('@astryxdesign/core/Legacy');
  });

  it('REGRESSION: loads the OLD loose standalone-hook `docs` format', async () => {
    const file = path.join(tmpDir, 'useLegacy.doc.mjs');
    fs.writeFileSync(
      file,
      [
        'export const docs = {',
        "  name: 'useLegacy',",
        "  displayName: 'useLegacy',",
        "  params: [{name: 'q', type: 'string', description: 'query'}],",
        "  returns: [{name: 'value', type: 'boolean', description: 'match'}],",
        "  relatedHooks: ['useThing'],",
        '};',
      ].join('\n'),
    );
    const docs = await loadComponentDoc(file);
    expect(docs.name).toBe('useLegacy');
    expect(docs.returns[0].name).toBe('value');
  });

  it('throws a readable error for an invalid doc', async () => {
    const file = path.join(tmpDir, 'Bad.doc.mjs');
    fs.writeFileSync(file, 'export default {group: "Buttons"};\n');
    await expect(loadComponentDoc(file)).rejects.toThrow(/is invalid|name/);
  });
});
