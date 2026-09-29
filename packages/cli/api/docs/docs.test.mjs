// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Dispatcher-level tests for docs() — the argument-shape routing that
 * sits above the list/detail/section leaves. The leaves have their own tests;
 * this pins the router: docs() -> list, docs(topic) -> detail,
 * docs(topic, section) -> section, plus the unknown-topic/section error codes.
 * Runs against the real CLI-bundled docs (no cwd/project needed).
 */

import {describe, it, expect} from 'vitest';
import {docs} from './docs.mjs';
import {AstryxError} from '../error.mjs';

const SLOW = 30_000;

describe('docs() dispatcher routing', () => {
  it('no topic -> docs.list', async () => {
    const r = await docs();
    expect(r.type).toBe('docs.list');
    expect(Array.isArray(r.data)).toBe(true);
    expect(r.data.length).toBeGreaterThan(0);
  }, SLOW);

  it('empty topic -> docs.list (falsy topic routes to list)', async () => {
    expect((await docs('')).type).toBe('docs.list');
  }, SLOW);

  it('topic only -> docs.detail, the whole doc', async () => {
    const {data} = await docs();
    expect((await docs(data[0].topic)).type).toBe('docs.detail');
  }, SLOW);

  it('topic + index -> docs.index', async () => {
    const {data} = await docs();
    const r = await docs(data[0].topic, undefined, {index: true});
    expect(r.type).toBe('docs.index');
  }, SLOW);

  it('topic + section -> docs.detail.section', async () => {
    const {data} = await docs();
    let routed = null;
    for (const {topic} of data) {
      const detail = await docs(topic);
      const sections = detail.data.sections;
      if (Array.isArray(sections) && sections.length > 0) {
        routed = await docs(topic, sections[0].title);
        break;
      }
    }
    expect(routed).not.toBeNull();
    expect(routed.type).toBe('docs.detail.section');
  }, SLOW);

  it('unknown topic -> ERR_UNKNOWN_TOPIC', async () => {
    await expect(docs('zzz-not-a-real-topic')).rejects.toBeInstanceOf(AstryxError);
    await expect(docs('zzz-not-a-real-topic')).rejects.toMatchObject({
      code: 'ERR_UNKNOWN_TOPIC',
    });
  }, SLOW);

  it('known topic + unknown section -> ERR_UNKNOWN_SECTION', async () => {
    const {data} = await docs();
    const topic = data[0].topic;
    await expect(docs(topic, 'zzz-not-a-real-section')).rejects.toMatchObject({
      code: 'ERR_UNKNOWN_SECTION',
    });
  }, SLOW);

  it("lists the docs tree's namespaces in meta, so every data entry reads as a topic", async () => {
    const res = await docs();
    expect(res.meta.namespaces.map(entry => entry.topic)).toEqual(['cli', 'unorganized']);
    for (const entry of res.data) {
      expect((await docs(entry.topic)).type).toBe('docs.detail');
    }
  }, SLOW);

  it('a section of a typed doc -> ERR_UNKNOWN_SECTION, suggesting the doc itself', async () => {
    const err = await docs('cli/api/functions/search', 'x').catch(e => e);
    expect(err.code).toBe('ERR_UNKNOWN_SECTION');
    expect(err.message).toContain('astryx docs cli/api/functions/search');
    expect(err.suggestions.map(s => s.name)).toEqual(['cli/api/functions/search']);
  }, SLOW);

  it('a namespace route -> docs.node, one level of children', async () => {
    const r = await docs('cli/api');
    expect(r.type).toBe('docs.node');
    expect(r.data).toMatchObject({
      id: 'astryx:artifact:v1/%40astryxdesign%2Fcli/namespace/api',
      route: 'cli/api',
      kind: 'namespace',
      package: '@astryxdesign/cli',
      breadcrumb: [{route: 'cli', title: 'Astryx CLI'}],
      content: [],
    });
    expect(r.data.slots.flatMap(slot => slot.children.map(c => c.route))).toEqual([
      'cli/api/functions',
      'cli/api/schemas',
      'cli/api/enums',
    ]);
  }, SLOW);

  it('a typed doc route -> docs.node with its content', async () => {
    const r = await docs('cli/api/functions/search');
    expect(r.type).toBe('docs.node');
    expect(r.data).toMatchObject({
      id: 'astryx:artifact:v1/%40astryxdesign%2Fcli/function/search',
      kind: 'function',
      title: 'search()',
      slots: [],
    });
    expect(r.data.breadcrumb.map(link => link.route)).toEqual([
      'cli',
      'cli/api',
      'cli/api/functions',
    ]);
    expect(JSON.stringify(r.data.content)).toContain(
      '`astryx search` runs it. Read it with `astryx docs cli/commands/search`.',
    );
  }, SLOW);

  it('a guide the tree places reads like a topic: the whole doc, its index, a section', async () => {
    expect((await docs('cli/integrations')).type).toBe('docs.detail');
    const index = await docs('cli/integrations', undefined, {index: true});
    expect(index).toMatchObject({type: 'docs.index', data: {name: 'cli/integrations'}});
    expect(index.data.sections.length).toBeGreaterThan(1);
    expect((await docs('cli/integrations', 'components')).type).toBe(
      'docs.detail.section',
    );
  }, SLOW);

  it('every read carries its moves (spec:AST-047)', async () => {
    const root = (await docs('cli')).data;
    expect(root.links).toEqual({up: 'astryx docs'});
    const leaf = (await docs('cli/api/functions/search')).data;
    expect(leaf.links.up).toBe('astryx docs cli/api/functions');
    expect(leaf.links.previous).toMatch(/^astryx docs cli\/api\/functions\/[a-z-]+$/);
    expect(leaf.links.next).toMatch(/^astryx docs cli\/api\/functions\/[a-z-]+$/);
    const index = await docs('cli/integrations', undefined, {index: true});
    // A guide moves across its namespace's slot, as any tree node does.
    expect(index.data.links).toEqual({
      up: 'astryx docs cli',
      next: 'astryx docs cli/writing-docs',
    });
    const first = (await docs('cli/integrations', index.data.sections[0].id)).data;
    expect(first.links).toEqual({
      up: 'astryx docs cli/integrations --index',
      next: `astryx docs cli/integrations ${index.data.sections[1].id}`,
    });
    const last = index.data.sections.at(-1).id;
    const end = (await docs('cli/integrations', last)).data;
    expect(end.links.next).toBeUndefined();
    expect(end.links.previous).toBe(
      `astryx docs cli/integrations ${index.data.sections.at(-2).id}`,
    );
    // A flat topic's home is the Unorganized level, and it moves across it.
    const flat = (await docs('principles')).data.links;
    expect(flat.up).toBe('astryx docs unorganized');
    expect(flat.previous).toMatch(/^astryx docs [a-z-]+$/);
    expect(flat.next).toMatch(/^astryx docs [a-z-]+$/);
    const home = (await docs('unorganized')).data;
    expect(home).toMatchObject({id: null, kind: 'namespace', links: {up: 'astryx docs'}});
    expect(home.slots[0].children.map(child => child.route)).toEqual(
      (await docs()).data.map(entry => entry.topic),
    );
  }, SLOW);

  it('names a node by its doc identity; a generated level has id null', async () => {
    const level = (await docs('cli/api/functions')).data;
    expect(level).toHaveProperty('id', null);
    expect(level.route).toBe('cli/api/functions');
  }, SLOW);

  it("offers a typed doc's related docs as moves", async () => {
    const fn = (await docs('cli/api/functions/search')).data;
    expect(fn.links.related).toContain('astryx docs cli/commands/search');
    const cmd = (await docs('cli/commands/search')).data;
    expect(cmd.links.related).toContain('astryx docs cli/api/functions/search');
  }, SLOW);

  it('a topic read returns the whole doc; index returns its sections', async () => {
    expect((await docs('principles')).type).toBe('docs.detail');
    const index = await docs('principles', undefined, {index: true});
    expect(index.type).toBe('docs.index');
    expect(index.data.sections.length).toBeGreaterThan(1);
    expect((await docs('principles', undefined, {dense: true})).type).toBe(
      'docs.detail',
    );
  }, SLOW);

  it("the guide's old flat name is gone, and its error names the new route", async () => {
    await expect(docs('cli-integrations')).rejects.toMatchObject({
      code: 'ERR_UNKNOWN_TOPIC',
      suggestions: [expect.objectContaining({name: 'cli/integrations'})],
    });
    expect((await docs()).data.map(entry => entry.topic)).not.toContain(
      'cli-integrations',
    );
  }, SLOW);

  it('a section of a namespace -> ERR_UNKNOWN_SECTION, naming its children', async () => {
    const err = await docs('cli', 'commands').catch(e => e);
    expect(err).toBeInstanceOf(AstryxError);
    expect(err.code).toBe('ERR_UNKNOWN_SECTION');
    expect(err.suggestions.map(s => s.name)).toEqual([
      'cli/integrations',
      'cli/writing-docs',
      'cli/commands',
      'cli/api',
    ]);
  }, SLOW);

  it('an unknown route suggests the children of the deepest namespace it reaches', async () => {
    const err = await docs('cli/api/functions/serch').catch(e => e);
    expect(err.code).toBe('ERR_UNKNOWN_TOPIC');
    expect(err.suggestions.map(s => s.name)).toContain('cli/api/functions/search');
    expect(err.suggestions.every(s => s.name.startsWith('cli/api/functions/'))).toBe(true);
  }, SLOW);

  it('non-string topic -> ERR_UNKNOWN_TOPIC (not a raw TypeError)', async () => {
    for (const bad of [123, {}, ['tokens'], true]) {
      const err = await docs(/** @type {any} */ (bad)).catch(e => e);
      expect(err).toBeInstanceOf(AstryxError);
      expect(err.code).toBe('ERR_UNKNOWN_TOPIC');
    }
  }, SLOW);

  it('non-string section -> ERR_UNKNOWN_SECTION (not a raw TypeError)', async () => {
    const {data} = await docs();
    const topic = data[0].topic;
    for (const bad of [456, {}, ['x']]) {
      const err = await docs(topic, /** @type {any} */ (bad)).catch(e => e);
      expect(err).toBeInstanceOf(AstryxError);
      expect(err.code).toBe('ERR_UNKNOWN_SECTION');
    }
  }, SLOW);
});
