// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for the doc load boundary. `parseDoc` dispatches on the
 * stamped `type` to the per-kind parsers and falls back to legacy shape-sniffing
 * for unstamped docs — its acceptance set matches the old permissive
 * `ComponentDocSchema` exactly, so every existing `.doc.*` keeps loading. Zod is
 * sealed inside the parsers; authors write a plain object and stamp `type`
 * directly (no factory). The end-to-end `loadComponentDoc` cases lock that both
 * the stamped default export and the legacy `export const docs = {}` load.
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {parseDoc} from './parse.mjs';
import {parseComponent} from './component/parse.mjs';
import {parseHook} from './hook/parse.mjs';
import {parseReference} from './reference/parse.mjs';
import {loadComponentDoc} from '../../foundation/discovery/component-loader.mjs';

const goodComponent = {
  type: 'component',
  name: 'Widget',
  displayName: 'Widget',
  description: 'A small widget.',
  props: [
    {name: 'label', type: 'string', description: 'Visible label.', required: true},
    {name: 'size', type: "'sm' | 'md'", description: 'Control size.', default: "'md'"},
  ],
};

const goodFunction = {
  type: 'function',
  name: 'useThing',
  displayName: 'useThing',
  description: 'A thing hook.',
  params: [{name: 'input', type: 'string', description: 'The input.', required: true}],
  returns: [{name: 'value', type: 'string', description: 'The result.'}],
};

const goodGeneric = {
  type: 'generic',
  name: 'Theming',
  displayName: 'Theming',
  description: 'How theming works.',
};

/** Run parseDoc and return the thrown message (asserting it throws). */
function reason(value, label = 'doc') {
  try {
    parseDoc(value, label);
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
  throw new Error('expected parseDoc to throw');
}

describe('per-kind parsers (stamped format)', () => {
  it('parseComponent accepts a valid component doc', () => {
    expect(() => parseComponent(goodComponent)).not.toThrow();
  });

  it('parseComponent rejects a missing name with a readable message', () => {
    expect(() =>
      parseComponent({type: 'component', name: '', props: []}),
    ).toThrow(/name is required/);
  });

  it('parseComponent rejects a prop missing its type', () => {
    expect(() =>
      parseComponent({
        type: 'component',
        name: 'Widget',
        props: [{name: 'label', description: 'no type'}],
      }),
    ).toThrow(/type/);
  });

  it('parseComponent surfaces the custom message for an empty prop type', () => {
    expect(() =>
      parseComponent({
        type: 'component',
        name: 'Widget',
        props: [{name: 'label', type: '', description: 'empty type'}],
      }),
    ).toThrow(/prop type is required/);
  });

  it('parseHook accepts a valid function doc', () => {
    expect(() => parseHook(goodFunction)).not.toThrow();
  });

  it('parseHook rejects a function doc missing returns', () => {
    expect(() =>
      parseHook({type: 'function', name: 'useThing', params: []}),
    ).toThrow();
  });

  it('parseReference accepts a valid generic doc', () => {
    expect(() => parseReference(goodGeneric)).not.toThrow();
  });

  it('keeps nested rich blobs loose (usage/theming/playground passthrough)', () => {
    expect(() =>
      parseComponent({
        ...goodComponent,
        usage: {description: 'Use it.', anatomy: [{name: 'root'}]},
        theming: {targets: [{className: 'astryx-widget'}]},
        playground: {defaults: {label: 'Hi'}},
        examples: [{title: 'Basic', code: '<Widget />'}],
      }),
    ).not.toThrow();
  });

  it('accepts parent + relatedDocs on the shared base', () => {
    const parsed = parseComponent({
      ...goodComponent,
      parent: 'WidgetGroup',
      relatedDocs: ['Gauge', 'useThing'],
      group: 'Widgets',
    });
    expect(parsed.parent).toBe('WidgetGroup');
    expect(parsed.relatedDocs).toEqual(['Gauge', 'useThing']);
  });
});

describe('parseDoc (load boundary, both formats)', () => {
  it('accepts a stamped component doc', () => {
    expect(() => parseDoc(goodComponent)).not.toThrow();
  });

  it('accepts a stamped function doc', () => {
    expect(() => parseDoc(goodFunction)).not.toThrow();
  });

  it('accepts a stamped generic doc', () => {
    expect(() => parseDoc(goodGeneric)).not.toThrow();
  });

  it('accepts the OLD loose single-component shape (no type)', () => {
    const {type, ...loose} = goodComponent;
    expect(() => parseDoc(loose)).not.toThrow();
  });

  it('accepts the OLD loose multi-component shape (components[])', () => {
    const multi = {
      name: 'Table',
      displayName: 'Table',
      components: [
        {name: 'TableRow', displayName: 'Table Row', description: 'A row.'},
      ],
    };
    expect(() => parseDoc(multi)).not.toThrow();
  });

  it('accepts the OLD loose sub-component shape (subComponentOf)', () => {
    const sub = {
      name: 'GaugeItem',
      subComponentOf: 'Gauge',
      displayName: 'Gauge Item',
      description: 'A gauge item.',
      props: [{name: 'item', type: 'Item', description: 'The item.'}],
    };
    expect(() => parseDoc(sub)).not.toThrow();
  });

  it('accepts the OLD loose standalone-hook shape (params + returns, no type)', () => {
    const hook = {
      name: 'useThing',
      displayName: 'useThing',
      params: [{name: 'q', type: 'string', description: 'query'}],
      returns: [{name: 'value', type: 'boolean', description: 'match'}],
    };
    expect(() => parseDoc(hook)).not.toThrow();
  });

  it('accepts BOTH parent and legacy subComponentOf', () => {
    const withParent = {name: 'A', parent: 'B', props: []};
    const withSubComponentOf = {
      name: 'A',
      subComponentOf: 'B',
      description: 'sub',
      props: [],
    };
    expect(() => parseDoc(withParent)).not.toThrow();
    expect(() => parseDoc(withSubComponentOf)).not.toThrow();
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
    expect(() => parseDoc(legacy)).not.toThrow();
    expect(() => parseDoc(modern)).not.toThrow();
  });

  it('passes through loose extras (usage, playground, theming, importPath, showcase)', () => {
    const {type, ...base} = goodComponent;
    const parsed = parseDoc({
      ...base,
      usage: {description: 'Use it wisely.'},
      playground: {defaults: {label: 'Hi'}},
      theming: {targets: [{className: 'astryx-widget'}]},
      keywords: ['widget', 'thing'],
      category: 'Content',
      isHiddenFromOverview: true,
      importPath: '@astryxdesign/core/Widget',
      showcase: 'WidgetHero',
    });
    expect(parsed.importPath).toBe('@astryxdesign/core/Widget');
    expect(parsed.showcase).toBe('WidgetHero');
  });

  it('rejects a doc with no name', () => {
    expect(() => parseDoc({props: []})).toThrow();
  });

  it('rejects an empty name with a readable message', () => {
    expect(reason({name: '', props: []})).toMatch(/name is required/);
  });
});

describe('loadComponentDoc (end-to-end load boundary)', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-doc-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, {recursive: true, force: true});
  });

  it('loads a stamped component .doc.mjs default export', async () => {
    const file = path.join(tmpDir, 'Widget.doc.mjs');
    fs.writeFileSync(
      file,
      [
        'export default {',
        "  type: 'component',",
        "  name: 'Widget',",
        "  displayName: 'Widget',",
        "  description: 'A small widget.',",
        '  props: [',
        "    {name: 'label', type: 'string', description: 'Visible label.', required: true},",
        '  ],',
        '};',
      ].join('\n'),
    );
    const docs = await loadComponentDoc(file);
    expect(docs.type).toBe('component');
    expect(docs.name).toBe('Widget');
    expect(docs.props).toHaveLength(1);
  });

  it('loads a stamped function .doc.mjs default export', async () => {
    const file = path.join(tmpDir, 'useThing.doc.mjs');
    fs.writeFileSync(
      file,
      [
        'export default {',
        "  type: 'function',",
        "  name: 'useThing',",
        "  displayName: 'useThing',",
        "  params: [{name: 'input', type: 'string', description: 'The input.'}],",
        "  returns: [{name: 'value', type: 'string', description: 'The result.'}],",
        '};',
      ].join('\n'),
    );
    const docs = await loadComponentDoc(file);
    expect(docs.type).toBe('function');
    expect(docs.params).toHaveLength(1);
    expect(docs.returns).toHaveLength(1);
  });

  it('loads a stamped generic .doc.mjs default export', async () => {
    const file = path.join(tmpDir, 'Theming.doc.mjs');
    fs.writeFileSync(
      file,
      [
        'export default {',
        "  type: 'generic',",
        "  name: 'Theming',",
        "  displayName: 'Theming',",
        "  description: 'How theming works.',",
        '};',
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
