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

  it('topic only -> docs.detail', async () => {
    const {data} = await docs();
    const topic = data[0].topic;
    const r = await docs(topic);
    expect(r.type).toBe('docs.detail');
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

  it('lists the docs tree\'s top-level namespaces after the topics', async () => {
    const {data} = await docs();
    const namespaces = data.filter(entry => entry.kind === 'namespace');
    expect(namespaces.map(entry => entry.topic)).toEqual(['cli']);
    expect(data.at(-1)?.topic).toBe('cli');
    expect(data[0].kind).toBeUndefined();
  }, SLOW);

  it('a namespace route -> docs.node, one level of children', async () => {
    const r = await docs('cli/api');
    expect(r.type).toBe('docs.node');
    expect(r.data).toMatchObject({
      id: '@astryxdesign/cli/namespace/api',
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
      id: '@astryxdesign/cli/function/search',
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

  it('a guide the tree places is a topic, read by its route', async () => {
    expect((await docs('cli/integrations')).type).toBe('docs.detail');
    const index = await docs('cli/integrations', undefined, {index: true});
    expect(index).toMatchObject({type: 'docs.index', data: {name: 'cli/integrations'}});
    expect((await docs('cli/integrations', 'components')).type).toBe(
      'docs.detail.section',
    );
  }, SLOW);

  it('the guide\'s old flat name is gone', async () => {
    await expect(docs('cli-integrations')).rejects.toMatchObject({
      code: 'ERR_UNKNOWN_TOPIC',
    });
  }, SLOW);

  it('a section of a namespace -> ERR_UNKNOWN_SECTION, naming its children', async () => {
    const err = await docs('cli', 'commands').catch(e => e);
    expect(err).toBeInstanceOf(AstryxError);
    expect(err.code).toBe('ERR_UNKNOWN_SECTION');
    expect(err.suggestions.map(s => s.name)).toEqual([
      'cli/integrations',
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
