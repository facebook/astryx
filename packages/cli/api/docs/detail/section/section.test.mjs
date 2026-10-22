// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for the docs.detail.section leaf. Locks the happy path,
 * case-insensitive title match, ERR_UNKNOWN_SECTION, and the empty-section guard
 * (regression: '' matched every title via .includes(''), silently returning the
 * first section).
 */

import {describe, it, expect} from 'vitest';
import {section} from './section.mjs';
import {AstryxError} from '../../../error.mjs';
import {
  guideEntry,
  loadDocsCatalog,
  lowerTopic,
  projectTree,
} from '../../_adapter.mjs';

/** A guide with dense and Chinese overlays, read like a topic. */
const GUIDE = 'foundations/principles';

const SLOW = 30_000;

describe('docs.detail.section leaf', () => {
  it('resolves a named section (case-insensitive) into a docs.detail.section envelope', async () => {
    const res = await section('foundations/all-tokens', 'spacing');
    expect(res.type).toBe('docs.detail.section');
    expect(res.data.title.toLowerCase()).toContain('spacing');
  }, SLOW);

  it('throws ERR_UNKNOWN_SECTION for an unknown section', async () => {
    let err;
    try {
      await section('foundations/spacing', 'zzzznope');
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(AstryxError);
    expect(err.code).toBe('ERR_UNKNOWN_SECTION');
    expect(err.suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: expect.any(String),
          reason: 'available section',
        }),
      ]),
    );
    expect(err.suggestions.some(suggestion => /\s/u.test(suggestion.name))).toBe(
      true,
    );
  }, SLOW);

  it('does not return the first section for an empty section name', async () => {
    await expect(section('foundations/spacing', '')).rejects.toMatchObject({
      code: 'ERR_UNKNOWN_SECTION',
    });
    await expect(section('foundations/spacing', '   ')).rejects.toMatchObject({
      code: 'ERR_UNKNOWN_SECTION',
    });
  }, SLOW);

  it('reads a section by its stable key', async () => {
    const catalog = await loadDocsCatalog();
    const tree = await projectTree(catalog);
    const {doc} = await lowerTopic(
      catalog,
      guideEntry(/** @type {any} */ (tree.get(GUIDE)), catalog),
    );
    const target = doc.sections[doc.sections.length - 1];
    const res = await section(GUIDE, target.id);
    expect(res.data.title).toBe(target.title);
    expect(res.data.id).toBe(target.id);
  }, SLOW);

  it('keeps a previously accepted ambiguous query on its first match', async () => {
    const res = await section(GUIDE, 'e');
    expect(res.type).toBe('docs.detail.section');
    expect(res.data).toBeDefined();
  }, SLOW);

  it.each([null, 'zh', 'dense'])(
    'inlines token refs when a section is read on its own (lang %s)',
    async lang => {
      const catalog = await loadDocsCatalog();
      const tree = await projectTree(catalog);
      let checked = 0;
      // Every guide under Foundations: the value pages read their tables
      // through token references.
      const guides = [...tree.nodes.values()].filter(
        node => node.kind === 'generic' && node.route.startsWith('foundations/'),
      );
      for (const node of guides) {
        const entry = guideEntry(node, catalog);
        const {doc} = await lowerTopic(catalog, entry);
        for (const own of doc.sections) {
          if (!own.content.some(block => block.type === 'token-ref')) continue;
          const res = await section(node.route, own.id, lang ? {lang} : {});
          expect(res.data.content.length).toBeGreaterThan(0);
          expect(res.data.content.some(block => block.type === 'token-ref')).toBe(
            false,
          );
          expect(JSON.stringify(res.data.content)).not.toContain('[token-ref:');
          checked += 1;
        }
      }
      expect(checked).toBeGreaterThan(0);
    },
    SLOW,
  );
});
