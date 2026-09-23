// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {docs} from '../docs.mjs';
import {index} from './index.mjs';
import {loadDocsCatalog} from '../_adapter.mjs';

const SLOW = 60_000;

describe('docs.index leaf', () => {
  it('lists each section by key, title, and summary', async () => {
    const res = await index('theme');
    expect(res.type).toBe('docs.index');
    expect(res.data).toMatchObject({name: 'theme', title: expect.any(String)});
    const keys = res.data.sections.map(s => s.id);
    expect(new Set(keys).size).toBe(keys.length);
    for (const entry of res.data.sections) {
      expect(Object.keys(entry)).toEqual(['id', 'title', 'summary']);
      expect(entry.summary.length).toBeLessThanOrEqual(240);
    }
  }, SLOW);

  it('names the sections the full topic has, with the same keys', async () => {
    const full = await docs('theme', undefined, {detail: 'full'});
    const {data} = await index('theme');
    expect(data.sections.map(s => [s.id, s.title])).toEqual(
      full.data.sections.map(s => [s.id, s.title]),
    );
  }, SLOW);

  it('keeps every key the same in every language', async () => {
    const english = (await index('theme')).data.sections.map(s => s.id);
    for (const lang of ['zh', 'dense']) {
      const localized = await index('theme', {lang});
      expect(localized.data.sections.map(s => s.id)).toEqual(english);
    }
  }, SLOW);

  it('lists keys every section can be read by', async () => {
    const catalog = await loadDocsCatalog();
    for (const entry of catalog.entries()) {
      const {data} = await index(entry.name);
      for (const {id, title} of data.sections) {
        const read = await docs(entry.name, id);
        expect(read.data.title).toBe(title);
      }
    }
  }, SLOW);
});

describe('docs() topic reads', () => {
  it('returns the index by default and for compact or brief detail', async () => {
    expect((await docs('theme')).type).toBe('docs.index');
    expect((await docs('theme', undefined, {detail: 'compact'})).type).toBe(
      'docs.index',
    );
    expect((await docs('theme', undefined, {detail: 'brief'})).type).toBe(
      'docs.index',
    );
  }, SLOW);

  it('returns the whole topic for full detail', async () => {
    const res = await docs('theme', undefined, {detail: 'full'});
    expect(res.type).toBe('docs.detail');
    expect(res.data.sections[0].content.length).toBeGreaterThan(0);
  }, SLOW);
});
