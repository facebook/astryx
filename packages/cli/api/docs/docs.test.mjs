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
import {formatCliCommand} from '../../foundation/env/package-manager.mjs';
import {GUIDE_ORDER} from '../../foundation/doc-compiler/tree.mjs';

const SLOW = 30_000;

/** A guide with several sections, read like a topic. */
const GUIDE = 'foundations/principles';

/**
 * The first guide a namespace places, read from the tree rather than named,
 * so a restructure of the guides does not break the reads under test.
 * @param {any} node the data of a docs.node read
 * @returns {string}
 */
function placedGuide(node) {
  const guide = node.slots
    .flatMap((/** @type {any} */ slot) => slot.children)
    .find((/** @type {any} */ child) => child.kind === 'generic');
  if (guide == null) throw new Error(`${node.route} places no guide`);
  return guide.route;
}

describe('docs() dispatcher routing', () => {
  it('no topic -> docs.list: no Core flat topic, the twelve guides and Reference in meta', async () => {
    const r = await docs();
    expect(r.type).toBe('docs.list');
    expect(r.data).toEqual([]);
    expect(r.meta.namespaces.length).toBe(13);
  }, SLOW);

  it('empty topic -> docs.list (falsy topic routes to list)', async () => {
    expect((await docs('')).type).toBe('docs.list');
  }, SLOW);

  it('topic only -> docs.detail, the whole doc', async () => {
    expect((await docs(GUIDE)).type).toBe('docs.detail');
  }, SLOW);

  it('topic + index -> docs.index', async () => {
    const r = await docs(GUIDE, undefined, {index: true});
    expect(r.type).toBe('docs.index');
  }, SLOW);

  it('reads a shortened section by its old key, which its title still derives', async () => {
    const r = await docs(
      'style-components/tokens-and-setup',
      'stylex-build-setup-required-for-swizzled-components',
    );
    expect(r.type).toBe('docs.detail.section');
    expect(r.data).toMatchObject({id: 'stylex-setup'});
  }, SLOW);

  it('topic + section -> docs.detail.section', async () => {
    const detail = await docs(GUIDE);
    const routed = await docs(GUIDE, detail.data.sections[0].title);
    expect(routed.type).toBe('docs.detail.section');
  }, SLOW);

  it('unknown topic -> ERR_UNKNOWN_TOPIC', async () => {
    await expect(docs('zzz-not-a-real-topic')).rejects.toBeInstanceOf(AstryxError);
    await expect(docs('zzz-not-a-real-topic')).rejects.toMatchObject({
      code: 'ERR_UNKNOWN_TOPIC',
    });
  }, SLOW);

  it('known topic + unknown section -> ERR_UNKNOWN_SECTION', async () => {
    await expect(docs(GUIDE, 'zzz-not-a-real-section')).rejects.toMatchObject({
      code: 'ERR_UNKNOWN_SECTION',
    });
  }, SLOW);

  it("lists the docs tree's roots in meta in reading order, so every data entry reads as a topic", async () => {
    const res = await docs();
    expect(res.meta.namespaces.map(entry => entry.topic)).toEqual([...GUIDE_ORDER]);
    for (const entry of res.data) {
      expect((await docs(entry.topic)).type).toBe('docs.detail');
    }
  }, SLOW);

  it('opens a route typed in another case', async () => {
    const r = await docs('REFERENCE/API');
    expect(r.type).toBe('docs.node');
    expect(r.data).toMatchObject({route: 'reference/api', links: {up: 'astryx docs reference'}});
  }, SLOW);

  it('a section of a typed doc -> ERR_UNKNOWN_SECTION, suggesting the doc itself', async () => {
    const err = await docs('reference/api/functions/search', 'x').catch(e => e);
    expect(err.code).toBe('ERR_UNKNOWN_SECTION');
    expect(err.message).toContain(
      formatCliCommand('docs reference/api/functions/search'),
    );
    expect(err.suggestions.map(s => s.name)).toEqual(['reference/api/functions/search']);
  }, SLOW);

  it('a namespace route -> docs.node, one level of children', async () => {
    const r = await docs('reference/api');
    expect(r.type).toBe('docs.node');
    expect(r.data).toMatchObject({
      id: 'astryx:artifact:v1/%40astryxdesign%2Fcli/namespace/api',
      route: 'reference/api',
      kind: 'namespace',
      package: '@astryxdesign/cli',
      breadcrumb: [{route: 'reference', title: 'Reference'}],
      // Its one block points to the host entry's guide.
      content: [
        {
          type: 'prose',
          text: expect.stringContaining('`astryx docs reference/host-entry`'),
        },
      ],
    });
    expect(r.data.slots.flatMap(slot => slot.children.map(c => c.route))).toEqual([
      'reference/api/functions',
      'reference/api/schemas',
      'reference/api/enums',
    ]);
  }, SLOW);

  it('a typed doc route -> docs.node with its content', async () => {
    const r = await docs('reference/api/functions/search');
    expect(r.type).toBe('docs.node');
    expect(r.data).toMatchObject({
      id: 'astryx:artifact:v1/%40astryxdesign%2Fcli/function/search',
      kind: 'function',
      title: 'search()',
      slots: [],
    });
    expect(r.data.breadcrumb.map(link => link.route)).toEqual([
      'reference',
      'reference/api',
      'reference/api/functions',
    ]);
    expect(JSON.stringify(r.data.content)).toContain(
      '`astryx search` runs it. Read it with `astryx docs reference/commands/search`.',
    );
  }, SLOW);

  it('a guide the tree places reads like a topic: the whole doc, its index, a section', async () => {
    // make-an-integration is a namespace of short guides; each guide reads like a topic.
    const integrations = await docs('make-an-integration');
    expect(integrations.type).toBe('docs.node');
    const guide = placedGuide(integrations.data);
    expect((await docs(guide)).type).toBe('docs.detail');
    const index = await docs(guide, undefined, {index: true});
    expect(index).toMatchObject({type: 'docs.index', data: {name: guide}});
    expect(index.data.sections.length).toBeGreaterThan(1);
    expect((await docs(guide, index.data.sections[0].id)).type).toBe(
      'docs.detail.section',
    );
  }, SLOW);

  it('every read carries its moves (spec:AST-047)', async () => {
    const root = (await docs('reference')).data;
    expect(root.links).toEqual({up: 'astryx docs'});
    const leaf = (await docs('reference/api/functions/search')).data;
    expect(leaf.links.up).toBe('astryx docs reference/api/functions');
    expect(leaf.links.previous).toMatch(/^astryx docs reference\/api\/functions\/[a-z-]+$/);
    expect(leaf.links.next).toMatch(/^astryx docs reference\/api\/functions\/[a-z-]+$/);
    const integrations = (await docs('make-an-integration')).data;
    const guide = placedGuide(integrations);
    const siblings = integrations.slots
      .find(slot => slot.children.some(child => child.route === guide))
      .children.map(child => child.route);
    const at = siblings.indexOf(guide);
    const index = await docs(guide, undefined, {index: true});
    // A guide moves across its namespace's slot, as any tree node does.
    expect(index.data.links).toEqual({
      up: 'astryx docs make-an-integration',
      ...(at > 0 ? {previous: `astryx docs ${siblings[at - 1]}`} : {}),
      ...(at < siblings.length - 1
        ? {next: `astryx docs ${siblings[at + 1]}`}
        : {}),
    });
    const first = (await docs(guide, index.data.sections[0].id)).data;
    expect(first.links).toEqual({
      up: `astryx docs ${guide} --index`,
      next: `astryx docs ${guide} ${index.data.sections[1].id}`,
    });
    const last = index.data.sections.at(-1).id;
    const end = (await docs(guide, last)).data;
    expect(end.links.next).toBeUndefined();
    expect(end.links.previous).toBe(
      `astryx docs ${guide} ${index.data.sections.at(-2).id}`,
    );
    // A former flat topic is a guide under its guide, and moves across it.
    const moved = (await docs('foundations/principles')).data.links;
    expect(moved.up).toBe('astryx docs foundations');
    expect(moved.next).toMatch(/^astryx docs foundations\/[a-z-]+$/);
    // No generated level holds Core docs any more.
    for (const level of ['guides', 'more-topics']) {
      await expect(docs(level)).rejects.toMatchObject({code: 'ERR_UNKNOWN_TOPIC'});
    }
  }, SLOW);

  it('names a node by its doc identity; a generated level has id null', async () => {
    const level = (await docs('reference/api/functions')).data;
    expect(level).toHaveProperty('id', null);
    expect(level.route).toBe('reference/api/functions');
  }, SLOW);

  it("offers a typed doc's related docs as moves", async () => {
    const fn = (await docs('reference/api/functions/search')).data;
    expect(fn.links.related).toContain('astryx docs reference/commands/search');
    const cmd = (await docs('reference/commands/search')).data;
    expect(cmd.links.related).toContain('astryx docs reference/api/functions/search');
  }, SLOW);

  it('a topic read returns the whole doc; index returns its sections', async () => {
    expect((await docs(GUIDE)).type).toBe('docs.detail');
    const index = await docs(GUIDE, undefined, {index: true});
    expect(index.type).toBe('docs.index');
    expect(index.data.sections.length).toBeGreaterThan(1);
    expect((await docs(GUIDE, undefined, {dense: true})).type).toBe(
      'docs.detail',
    );
  }, SLOW);

  it("the guide's old flat name is gone, and its error names the new route", async () => {
    const error = await docs('cli-integrations').catch(e => e);
    expect(error.code).toBe('ERR_UNKNOWN_TOPIC');
    expect(error.suggestions[0]).toMatchObject({name: 'make-an-integration'});
    expect((await docs()).data.map(entry => entry.topic)).not.toContain(
      'cli-integrations',
    );
  }, SLOW);

  it('a section no guide of a namespace has -> ERR_UNKNOWN_SECTION, naming its guides', async () => {
    const err = await docs('reference', 'zzzz-nope').catch(e => e);
    expect(err).toBeInstanceOf(AstryxError);
    expect(err.code).toBe('ERR_UNKNOWN_SECTION');
    const names = err.suggestions.map(s => s.name);
    expect(names).toContain('reference/host-entry');
    expect(names.every(name => name.startsWith('reference/'))).toBe(true);
    // It names every guide below the namespace, at any depth.
    const deep = await docs('make-an-integration', 'zzzz-nope').catch(e => e);
    expect(deep.code).toBe('ERR_UNKNOWN_SECTION');
    const below = deep.suggestions.map(s => s.name);
    expect(below).toContain('make-an-integration/quick-start');
    expect(below).toContain('make-an-integration/building-blocks/components/add-a-component');
    expect(below.every(name => name.startsWith('make-an-integration/'))).toBe(true);
  }, SLOW);

  it('an unknown route suggests the children of the deepest namespace it reaches', async () => {
    const err = await docs('reference/api/functions/serch').catch(e => e);
    expect(err.code).toBe('ERR_UNKNOWN_TOPIC');
    expect(err.suggestions.map(s => s.name)).toContain('reference/api/functions/search');
    expect(err.suggestions.every(s => s.name.startsWith('reference/api/functions/'))).toBe(true);
  }, SLOW);

  it('non-string topic -> ERR_UNKNOWN_TOPIC (not a raw TypeError)', async () => {
    for (const bad of [123, {}, ['tokens'], true]) {
      const err = await docs(/** @type {any} */ (bad)).catch(e => e);
      expect(err).toBeInstanceOf(AstryxError);
      expect(err.code).toBe('ERR_UNKNOWN_TOPIC');
    }
  }, SLOW);

  it('non-string section -> ERR_UNKNOWN_SECTION (not a raw TypeError)', async () => {
    for (const bad of [456, {}, ['x']]) {
      const err = await docs(GUIDE, /** @type {any} */ (bad)).catch(e => e);
      expect(err).toBeInstanceOf(AstryxError);
      expect(err.code).toBe('ERR_UNKNOWN_SECTION');
    }
  }, SLOW);
});
