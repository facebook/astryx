// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Fluff in docs: padding phrases that add words and no meaning, and guides
 * whose prose is mostly function words. Docs are read by people and agents
 * with a budget, so every word should carry something.
 *
 * Only prose is read (the same strings copied passages compare), and inline
 * code and quoted text are set aside, so a phrase inside a command, or one
 * quoted as an example, never counts.
 */

import fs from 'node:fs';

import {
  contentWords,
  fileWords,
  lineAtOffset,
  locateWords,
  loadCoreGuides,
  loadQuietly,
  proseStrings,
  proseWords,
  textWords,
} from './copied-passages.mjs';

/**
 * Padding phrases: each can be cut, or replaced by a shorter word, without
 * losing meaning. Only phrases that are padding in every use are listed;
 * words such as "just", "simply" or "really", and phrases such as "whether or
 * not" or "keep in mind", which carry meaning in a correct sentence ("not
 * simply a wrapper", "regardless of whether"), are not.
 */
export const FILLER_PHRASES = [
  "it's important to note",
  'it is important to note',
  'important to note that',
  "it's worth noting",
  'it is worth noting',
  'worth noting that',
  'it should be noted',
  'please note',
  'note that',
  'as mentioned above',
  'as mentioned earlier',
  'as mentioned before',
  'as noted above',
  'as you can see',
  'needless to say',
  'in order to',
  'due to the fact that',
  'for the purpose of',
  'at this point in time',
  'in other words',
  'basically',
  'essentially',
  'obviously',
];

/** What to write instead, where a phrase is not simply cut. */
const INSTEAD = {
  'in order to': 'to',
  'due to the fact that': 'because',
  'for the purpose of': 'to or for',
  'at this point in time': 'now',
};

/** A guide shorter than this many prose words is not scored for density. */
export const DENSITY_MIN_WORDS = 80;

/**
 * A guide whose share of content words is below this is mostly glue. Core's
 * own guides score from about 0.51 up, with a median near 0.62.
 */
export const MIN_DENSITY = 0.5;

/**
 * @param {string} phrase
 * @returns {RegExp}
 */
function phrasePattern(phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // "note that" is padding as a sentence opener ("Note that X"), not inside
  // one ("a note that explains").
  return phrase === 'note that'
    ? new RegExp(`(?:^|[.;:!?]\\s+)${escaped}\\b`, 'gi')
    : new RegExp(`(?<![a-z'])${escaped}(?![a-z])`, 'gi');
}

const PATTERNS = FILLER_PHRASES.map(phrase => ({
  phrase,
  pattern: phrasePattern(phrase),
}));

/**
 * Each padding phrase in a text, outside inline code and quotes, in order,
 * with its offset in the text.
 *
 * @param {string} text
 * @returns {{phrase: string, at: number}[]}
 */
export function fillerAt(text) {
  // A quoted phrase is mentioned, not used ("cut 'in order to'"), so quotes
  // are set aside along with inline code. Each mask keeps the text's length,
  // so an offset in the masked text is an offset in the text.
  const blank = (/** @type {string} */ span) => ' '.repeat(span.length);
  const prose = text
    .replace(/`[^`]*`/g, blank)
    .replace(/"[^"]*"|“[^”]*”|‘[^’]*’/g, blank)
    .replace(/’/g, "'")
    // A single-quoted span opens and closes beside a non-letter, so the
    // apostrophe in "don't" or "it's" opens nothing.
    .replace(/(?<![A-Za-z])'[^']*'(?![A-Za-z])/g, blank);
  /** @type {{phrase: string, at: number}[]} */
  const found = [];
  for (const {phrase, pattern} of PATTERNS) {
    for (const match of prose.matchAll(pattern)) {
      // A phrase inside a longer listed one ("note that" in "worth noting
      // that") is the longer one's.
      const at = match.index + match[0].toLowerCase().indexOf(phrase);
      if (
        !found.some(each => at >= each.at && at < each.at + each.phrase.length)
      ) {
        found.push({phrase, at});
      }
    }
  }
  return found.sort((a, b) => a.at - b.at);
}

/**
 * Each padding phrase in a text, outside inline code and quotes, in order.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function fillerIn(text) {
  return fillerAt(text).map(each => each.phrase);
}

/**
 * The share of a doc's prose words that are content words.
 *
 * @param {{word: string}[]} words
 * @returns {number}
 */
export function density(words) {
  if (words.length === 0) return 1;
  let content = 0;
  for (let i = 0; i < words.length; i++) {
    if (contentWords(words, i, 1) === 1) content++;
  }
  return content / words.length;
}

/**
 * The median density of Core's own guides of at least
 * {@link DENSITY_MIN_WORDS} words.
 *
 * @returns {Promise<number>}
 */
export async function coreDensityMedian() {
  const {guides} = await loadCoreGuides();
  const scores = guides
    .filter(guide => guide.words.length >= DENSITY_MIN_WORDS)
    .map(guide => density(guide.words))
    .sort((a, b) => a - b);
  return scores.length === 0 ? 0 : scores[Math.floor(scores.length / 2)];
}

/**
 * Fluff in a package's topics: every padding phrase, with its section and
 * file line, and every topic of at least {@link DENSITY_MIN_WORDS} words
 * whose density is below {@link MIN_DENSITY}.
 *
 * @param {{records: {name: string, path: string}[], guides?: {name: string, ref?: {topicFile?: string}}[]}} discovered
 *   the package's docs, as discoverIntegrationDocs returns them
 * @returns {Promise<import('../../api/integration/authoring-checks.type.mjs').DocFluff[]>}
 */
export async function findFluff(discovered) {
  const topics = [
    ...discovered.records.map(record => ({
      name: record.name,
      file: record.path,
    })),
    ...(discovered.guides ?? []).map(guide => ({
      name: guide.name,
      file: guide.ref?.topicFile,
    })),
  ];
  /** @type {import('../../api/integration/authoring-checks.type.mjs').DocFluff[]} */
  const found = [];
  /** @type {number | null} */
  let median = null;
  for (const {name, file} of topics) {
    const doc = file ? await loadQuietly(file) : null;
    if (!doc || !file) continue;
    /** @type {{word: string, line: number}[]} */
    let source = [];
    try {
      source = fileWords(fs.readFileSync(file, 'utf8'));
    } catch {
      // No line numbers; each finding still names its section.
    }
    // Each string is found by its whole run of words, from where the last
    // one was found, so two strings that open alike keep their own lines.
    let cursor = 0;
    for (const {text, section} of proseStrings(doc)) {
      const words = textWords(text);
      let index = locateWords(source, words, cursor);
      if (index < 0) index = locateWords(source, words);
      if (index >= 0) cursor = index + words.length;
      for (const {phrase, at} of fillerAt(text)) {
        const line = index < 0 ? null : lineAtOffset(source, index, words, at);
        const where = section ? ` (section "${section}")` : '';
        const instead = /** @type {Record<string, string>} */ (INSTEAD)[phrase];
        found.push({
          topic: name,
          kind: 'phrase',
          phrase,
          section,
          file,
          line,
          density: null,
          message:
            `"${name}"${where} pads its prose with "${phrase}"` +
            `${line == null ? '' : ` (line ${line})`}. ` +
            (instead
              ? `Write "${instead}" instead.`
              : 'Cut it; the sentence says the same without it.'),
        });
      }
    }
    const words = proseWords(doc);
    if (words.length < DENSITY_MIN_WORDS) continue;
    const score = density(words);
    if (score >= MIN_DENSITY) continue;
    median ??= await coreDensityMedian();
    found.push({
      topic: name,
      kind: 'density',
      phrase: null,
      section: null,
      file,
      line: null,
      density: Math.round(score * 100) / 100,
      message:
        `"${name}" is mostly glue: ${Math.round(score * 100)}% of its ${words.length} prose words carry content, ` +
        `under the ${Math.round(MIN_DENSITY * 100)}% floor (Core's guides have a median of ${Math.round(median * 100)}%). ` +
        'Cut filler and restated context until each sentence states one thing.',
    });
  }
  return found;
}
