// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Core's own guides pass the doc-quality checks `integration check --strict`
 * holds every integration to (architecture:cli-surface DEC-8): no two guides
 * repeat a passage word for word.
 */

import {describe, expect, it} from 'vitest';

import {
  builtinGuideFiles,
  loadTopicModule,
} from '../foundation/discovery/docs-discovery.mjs';
import {
  BOILERPLATE_TOPICS,
  MIN_CONTENT_WORDS,
  PASSAGE_WORDS,
  contentWords,
  trimBoilerplate,
  proseWords,
  sharedPassages,
} from '../foundation/discovery/copied-passages.mjs';

/** @returns {Promise<{name: string, words: ReturnType<typeof proseWords>}[]>} */
async function coreGuides() {
  const guides = [];
  for (const file of builtinGuideFiles()) {
    const doc = /** @type {any} */ (await loadTopicModule(file));
    if (typeof doc?.name === 'string') {
      guides.push({name: doc.name, words: proseWords(doc)});
    }
  }
  return guides;
}

describe("Core's guides", () => {
  it('repeat no passage word for word', async () => {
    const guides = await coreGuides();
    /** @type {Map<string, Set<number>>} */
    const sharing = new Map();
    guides.forEach(({words}, at) => {
      for (let i = 0; i + PASSAGE_WORDS <= words.length; i++) {
        if (words[i].block !== words[i + PASSAGE_WORDS - 1].block) continue;
        const key = words
          .slice(i, i + PASSAGE_WORDS)
          .map(each => each.word)
          .join(' ');
        const topics = sharing.get(key) ?? new Set();
        topics.add(at);
        sharing.set(key, topics);
      }
    });
    const copies = [];
    for (let a = 0; a < guides.length; a++) {
      for (let b = a + 1; b < guides.length; b++) {
        const {words} = guides[a];
        const boilerplate = (/** @type {number} */ at) =>
          (sharing.get(
            words
              .slice(at, at + PASSAGE_WORDS)
              .map(each => each.word)
              .join(' '),
          )?.size ?? 0) >= BOILERPLATE_TOPICS;
        for (const shared of sharedPassages(words, guides[b].words)) {
          // The same trimming findCopiedPassages applies.
          const run = trimBoilerplate(shared, boilerplate);
          if (!run) continue;
          const {start, length} = run;
          if (contentWords(words, start, length) >= MIN_CONTENT_WORDS) {
            copies.push(
              `${guides[a].name} and ${guides[b].name}: "${words
                .slice(start, start + length)
                .map(each => each.word)
                .join(' ')}"`,
            );
          }
        }
      }
    }
    expect(
      copies,
      'Keep the fact in the guide that owns it and link to it from the other.',
    ).toEqual([]);
  });
});
