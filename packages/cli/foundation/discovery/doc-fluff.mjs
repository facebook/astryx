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
  loadCoreGuides,
  loadQuietly,
  proseStrings,
  proseWords,
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
 * Each padding phrase in a text, outside inline code, in order.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function fillerIn(text) {
  // A quoted phrase is mentioned, not used ("cut 'in order to'"), so quotes
  // are set aside along with inline code.
  const prose = text
    .replace(/`[^`]*`/g, ' ')
    .replace(/"[^"]*"|“[^”]*”|‘[^’]*’/g, ' ')
    .replace(/’/g, "'")
    // A single-quoted span opens and closes beside a non-letter, so the
    // apostrophe in "don't" or "it's" opens nothing.
    .replace(/(?<![A-Za-z])'[^']*'(?![A-Za-z])/g, ' ');
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
  return found.sort((a, b) => a.at - b.at).map(each => each.phrase);
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
 * The 1-based line of a doc file that holds the phrase, looked for from the
 * line where its own string starts, or null when that cannot be found.
 *
 * @param {string} file
 * @param {string} text the prose string the phrase is in
 * @param {string} phrase
 * @param {Map<string, string[]>} cache
 * @returns {number | null}
 */
function lineOf(file, text, phrase, cache) {
  let lines = cache.get(file);
  if (!lines) {
    try {
      lines = fs.readFileSync(file, 'utf8').split('\n');
    } catch {
      lines = [];
    }
    cache.set(file, lines);
  }
  // The string's longest plain run is written in the file as it reads, so it
  // finds where the string starts; the phrase is on that line or a later one
  // of the same string.
  const plain = (text.match(/[A-Za-z0-9 ,.;:()-]{12,}/g) ?? []).sort(
    (a, b) => b.length - a.length,
  )[0];
  const from = plain ? lines.findIndex(line => line.includes(plain)) : -1;
  if (from < 0) return null;
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(?<![a-z])${escaped}(?![a-z])`, 'i');
  const span = text.split('\n').length + 2;
  for (let at = from; at < Math.min(lines.length, from + span); at++) {
    if (pattern.test(lines[at].replace(/\\u2019|’/g, "'"))) return at + 1;
  }
  return null;
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
  /** @type {Map<string, string[]>} */
  const lines = new Map();
  /** @type {number | null} */
  let median = null;
  for (const {name, file} of topics) {
    const doc = file ? await loadQuietly(file) : null;
    if (!doc || !file) continue;
    for (const {text, section} of proseStrings(doc)) {
      for (const phrase of fillerIn(text)) {
        const line = lineOf(file, text, phrase, lines);
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
