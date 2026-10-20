// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Copied passages: prose that two docs repeat word for word. One fact has one
 * owner, so a passage repeated in a second doc goes stale in one of them the
 * next time the other is edited.
 *
 * Only prose is compared: code, examples, names, titles, keywords, and links
 * are left out, and a run must be at least {@link PASSAGE_WORDS} words long,
 * so a reported passage is always a real copy, never a shared phrase.
 */

import {builtinGuideFiles, loadTopicModule} from './docs-discovery.mjs';

/** The shortest run of identical words reported as a copy. */
export const PASSAGE_WORDS = 10;

/**
 * A copy carries at least this many distinct content words, so a run of
 * glue words ("and it is in the way that you can…") is a phrase, not a fact.
 */
export const MIN_CONTENT_WORDS = 4;

/**
 * A run that this many topics share is boilerplate, such as a lead-in every
 * guide of a series opens with, not a copy of one topic's fact.
 */
export const BOILERPLATE_TOPICS = 3;

/** English function words, which say nothing about what a passage states. */
const FUNCTION_WORDS = new Set(
  (
    'a about above after again all also an and any are as at be because been before being below between both but by ' +
    'can could did do does doing down during each either else every few for from further had has have having he her here ' +
    'him his how i if in into is it its itself just may me might more most must my no nor not now of off on once only or ' +
    'other our out over own same she should so some such than that the their them then there these they this those through ' +
    'to too under until up us very was we were what when where which while who whom why will with would you your'
  ).split(' '),
);

/**
 * The number of distinct content words in a run: words that are not function
 * words, with surrounding punctuation set aside.
 *
 * @param {{word: string}[]} words
 * @param {number} start
 * @param {number} length
 */
export function contentWords(words, start, length) {
  const found = new Set();
  for (const {word} of words.slice(start, start + length)) {
    const bare = word.replace(/^[^a-z0-9@]+|[^a-z0-9]+$/g, '');
    if (bare && !FUNCTION_WORDS.has(bare)) found.add(bare);
  }
  return found.size;
}

/** Fields that hold identifiers or code rather than prose. */
const SKIP_KEYS = new Set([
  'aliases',
  'audience',
  'category',
  'code',
  'example',
  'examples',
  'extends',
  'id',
  'import',
  'keywords',
  'label',
  'lang',
  'name',
  'placement',
  'projection',
  'props',
  'relationships',
  'replaces',
  'source',
  'title',
  'type',
]);

/** Blocks whose content is code, or another doc's content included by name. */
const SKIP_BLOCKS = new Set(['code', 'example', 'reference']);

/**
 * The words a passage is compared by: lowercase, with links and Markdown
 * emphasis set aside.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function passageWords(text) {
  return text
    .toLowerCase()
    .replace(/\{@link [^}]*\}/g, ' ')
    .replace(/[`*]/g, '')
    .split(/[^a-z0-9'@./-]+/)
    .filter(Boolean);
}

/**
 * Each prose word of a doc, in order, with the title of the section it is in
 * (null before the first section) and the number of the string it came from.
 * A passage never runs from one string into the next, so two fields that
 * happen to sit side by side are not read as one sentence.
 *
 * @param {unknown} doc an authored doc object
 * @returns {{word: string, section: string | null, block: number}[]}
 */
export function proseWords(doc) {
  /** @type {{word: string, section: string | null, block: number}[]} */
  const words = [];
  let block = 0;
  /**
   * @param {unknown} value
   * @param {string | null} section
   */
  const walk = (value, section) => {
    if (typeof value === 'string') {
      block++;
      for (const word of passageWords(value)) {
        words.push({word, section, block});
      }
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) walk(item, section);
      return;
    }
    if (value == null || typeof value !== 'object') return;
    const record = /** @type {Record<string, unknown>} */ (value);
    if (typeof record.type === 'string' && SKIP_BLOCKS.has(record.type)) return;
    if (Array.isArray(record.sections)) {
      for (const [key, field] of Object.entries(record)) {
        if (key !== 'sections' && !SKIP_KEYS.has(key)) walk(field, section);
      }
      for (const each of record.sections) {
        const title =
          typeof each?.title === 'string' ? each.title : (section ?? null);
        walk(each, title);
      }
      return;
    }
    for (const [key, field] of Object.entries(record)) {
      if (!SKIP_KEYS.has(key)) walk(field, section);
    }
  };
  walk(doc, null);
  return words;
}

/**
 * Whether the `size` words from `at` all come from one string.
 * @param {{block?: number}[]} words
 * @param {number} at
 * @param {number} size
 */
function inOneString(words, at, size) {
  return words[at].block === words[at + size - 1].block;
}

/**
 * The runs of at least `size` words that both docs have, each inside one
 * string of each doc, longest first, as its start in `mine` and its length.
 *
 * @param {{word: string, block?: number}[]} mine
 * @param {{word: string, block?: number}[]} other
 * @param {number} [size]
 * @returns {{start: number, length: number}[]}
 */
export function sharedPassages(mine, other, size = PASSAGE_WORDS) {
  if (mine.length < size || other.length < size) return [];
  const theirs = other.map(each => each.word);
  /** @type {Map<string, number[]>} */
  const starts = new Map();
  for (let i = 0; i + size <= theirs.length; i++) {
    if (!inOneString(other, i, size)) continue;
    const key = theirs.slice(i, i + size).join(' ');
    const list = starts.get(key);
    if (list) list.push(i);
    else starts.set(key, [i]);
  }
  const words = mine.map(each => each.word);
  /** @type {{start: number, length: number}[]} */
  const runs = [];
  let i = 0;
  while (i + size <= words.length) {
    const found = inOneString(mine, i, size)
      ? starts.get(words.slice(i, i + size).join(' '))
      : undefined;
    if (!found) {
      i++;
      continue;
    }
    let best = size;
    for (const j of found) {
      let length = size;
      while (
        i + length < words.length &&
        j + length < theirs.length &&
        mine[i + length].block === mine[i].block &&
        other[j + length].block === other[j].block &&
        words[i + length] === theirs[j + length]
      ) {
        length++;
      }
      best = Math.max(best, length);
    }
    runs.push({start: i, length: best});
    i += best;
  }
  return runs.sort((a, b) => b.length - a.length);
}

/**
 * @typedef {{name: string, words: {word: string, section: string | null, block: number}[], replaces: string | null}} GuideWords
 */

/**
 * Each run of {@link PASSAGE_WORDS} words inside one string of a doc, joined.
 * @param {{word: string, block: number}[]} words
 * @returns {Set<string>}
 */
function windows(words) {
  /** @type {Set<string>} */
  const keys = new Set();
  for (let i = 0; i + PASSAGE_WORDS <= words.length; i++) {
    if (!inOneString(words, i, PASSAGE_WORDS)) continue;
    keys.add(
      words
        .slice(i, i + PASSAGE_WORDS)
        .map(each => each.word)
        .join(' '),
    );
  }
  return keys;
}

/**
 * Guides with an index from each run of words to the guides that have it, so
 * a topic is compared in full only with the guides it shares a run with.
 * @typedef {{guides: GuideWords[], index: Map<string, number[]>}} IndexedGuides
 */

/**
 * @param {GuideWords[]} guides
 * @returns {IndexedGuides}
 */
function indexGuides(guides) {
  /** @type {Map<string, number[]>} */
  const index = new Map();
  guides.forEach((guide, at) => {
    for (const key of windows(guide.words)) {
      const list = index.get(key);
      if (list) list.push(at);
      else index.set(key, [at]);
    }
  });
  return {guides, index};
}

/**
 * The indexes of the guides that share at least one run with `words`.
 * @param {{word: string, block: number}[]} words
 * @param {IndexedGuides} indexed
 * @returns {number[]}
 */
function candidates(words, indexed) {
  /** @type {Set<number>} */
  const found = new Set();
  for (const key of windows(words)) {
    for (const at of indexed.index.get(key) ?? []) found.add(at);
  }
  return [...found].sort((a, b) => a - b);
}

/** @type {Promise<IndexedGuides> | null} */
let coreGuides = null;

/**
 * @param {string} file
 * @returns {Promise<any>} the doc, or null for one that does not load (the
 *   load problem is reported elsewhere)
 */
async function loadQuietly(file) {
  try {
    return await loadTopicModule(file);
  } catch {
    return null;
  }
}

/** @returns {Promise<IndexedGuides>} the CLI's own guides, read and indexed once */
function loadCoreGuides() {
  coreGuides ??= (async () => {
    /** @type {GuideWords[]} */
    const guides = [];
    for (const file of builtinGuideFiles()) {
      const doc = await loadQuietly(file);
      if (typeof doc?.name === 'string') {
        guides.push({name: doc.name, words: proseWords(doc), replaces: null});
      }
    }
    return indexGuides(guides);
  })();
  return coreGuides;
}

/**
 * One entry for each pair of topics that repeat a passage word for word: two
 * of the package's own topics, or one of them and a Core topic, except the
 * Core topic it replaces (a replacement takes that topic's place, so it may
 * carry its text).
 *
 * @param {{records: {name: string, path: string, replaces?: string | null}[], guides?: {name: string, ref?: {topicFile?: string}}[]}} discovered
 *   the package's docs, as discoverIntegrationDocs returns them
 * @returns {Promise<import('../../api/integration/authoring-checks.type.mjs').CopiedPassage[]>}
 */
export async function findCopiedPassages(discovered) {
  const topics = [
    ...discovered.records.map(record => ({
      name: record.name,
      file: record.path,
      replaces: record.replaces ?? null,
    })),
    ...(discovered.guides ?? []).map(guide => ({
      name: guide.name,
      file: guide.ref?.topicFile,
      replaces: null,
    })),
  ];
  /** @type {GuideWords[]} */
  const mine = [];
  for (const each of topics) {
    const doc = each.file ? await loadQuietly(each.file) : null;
    if (doc) mine.push({...each, words: proseWords(doc)});
  }
  if (mine.length === 0) return [];
  const core = await loadCoreGuides();
  /** @type {import('../../api/integration/authoring-checks.type.mjs').CopiedPassage[]} */
  const found = [];
  /**
   * @param {GuideWords} topic
   * @param {GuideWords} other
   * @param {'package' | 'core'} owner
   */
  const compare = (topic, other, owner) => {
    const runs = sharedPassages(topic.words, other.words).filter(
      ({start, length}) =>
        contentWords(topic.words, start, length) >= MIN_CONTENT_WORDS &&
        topicsSharing(topic.words, start) < BOILERPLATE_TOPICS,
    );
    if (runs.length === 0) return;
    const [{start, length}] = runs;
    const excerpt = topic.words
      .slice(start, start + Math.min(length, 12))
      .map(each => each.word)
      .join(' ');
    const section = topic.words[start].section;
    const where = section ? ` (section "${section}")` : '';
    const more =
      runs.length > 1 ? `, and ${runs.length - 1} more passage(s)` : '';
    const named =
      owner === 'core' ? `the Core topic "${other.name}"` : `"${other.name}"`;
    const fix =
      owner === 'core'
        ? `Link to the Core topic with {@link generic:${other.name}} instead of copying it`
        : 'Keep the passage in the topic that owns it and link to it from the other with {@link generic:<topic>}';
    found.push({
      topic: topic.name,
      section,
      otherTopic: other.name,
      otherOwner: owner,
      words: length,
      passages: runs.length,
      message:
        `"${topic.name}"${where} repeats ${length} words of ${named} word for word${more}: "${excerpt}…". ` +
        `${fix}, so an edit to one cannot leave a stale copy in the other.`,
    });
  };
  const own = indexGuides(mine);
  /**
   * How many topics, the package's and Core's, have the run that starts here.
   * @param {{word: string}[]} words
   * @param {number} start
   */
  const topicsSharing = (words, start) => {
    const key = words
      .slice(start, start + PASSAGE_WORDS)
      .map(each => each.word)
      .join(' ');
    return (
      new Set(own.index.get(key) ?? []).size +
      new Set(core.index.get(key) ?? []).size
    );
  };
  mine.forEach((topic, i) => {
    for (const at of candidates(topic.words, own)) {
      if (at > i) compare(topic, mine[at], 'package');
    }
    for (const at of candidates(topic.words, core)) {
      const other = core.guides[at];
      if (topic.replaces?.toLowerCase() !== other.name.toLowerCase()) {
        compare(topic, other, 'core');
      }
    }
  });
  return found;
}
