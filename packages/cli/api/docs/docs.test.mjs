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
