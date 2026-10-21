// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build's block picker: re-ranks the blocks build would name for a
 * request with checked-in word weights, and keeps build's own count.
 *
 * @input The request, build's signals for it (`kitSignals`: the blocks the kit
 *   names, search's block results with their scores and coverage), the block
 *   ids the project can scaffold, and the picker weights (`blocks.weights.json`
 *   beside this file, read by the adapter): a vocabulary of words and word
 *   pairs with their weight (x1024), the block ids it scores, a bias per block
 *   and a sparse row of weights per word (x64), and five combiner numbers.
 * @output `pickBlocks(...)`: block ids, best first, as many as build's own list.
 * @position api/build/blocks; tree.mjs's main searcher calls it between
 *   kitSignals (kit/signals.mjs) and kitAnswer (kit/answer.mjs). Pure: no file, network, or environment access.
 *
 * How it scores. The request's words and adjacent word pairs, each weighted
 * (1 + ln count) x its vocabulary weight and scaled to unit length, give every
 * block a linear score (its bias plus the weighted words' rows). The
 * candidates are build's own blocks and search's first 100 block results
 * (each a block search returned, with its real score and reason); a block
 * build does not name joins only if it shares a content word with the
 * request (its display name and description against the request's words).
 * Each candidate's final score combines five numbers: search's score / 100,
 * the share of the request search matched, whether build names it, 1 / (1 +
 * its place in build's list, then search's), and the block's log-share of the
 * linear scores. Ties keep that order. A block the request names (its name,
 * or the component its name starts with, written out, joined, or plural), a
 * block the weights do not know, and a block whose package is not Core's keep
 * the slot build gave them; the picker's best fill the other slots, so the
 * kit never lists more blocks than build's own.
 */

import {pluralOf} from '../../search/_query.mjs';
import {wordsOf} from '../../search/_words.mjs';

/**
 * @typedef {object} BlockPickerWeights
 * @property {Record<string, number>} vocab word or word pair -> weight x1024
 * @property {string[]} classes the block ids the words score
 * @property {number[]} bias one per class, x64
 * @property {Record<string, number[]>} words word -> [class index, weight x64, ...]
 * @property {number[]} theta the five combiner numbers
 *
 * @typedef {import('../kit/signals.mjs').BlockScore} BlockScore
 */

/** The linear score of a block the words do not score. */
const UNSCORED = -30;

/**
 * The words and adjacent word pairs of a request, with their weights, in the
 * order they first appear; only those in the vocabulary.
 * @param {string} request
 * @param {BlockPickerWeights} weights
 * @returns {Map<string, number>}
 */
function features(request, weights) {
  const tokens =
    String(request ?? '')
      .toLowerCase()
      .match(/[a-z0-9]{2,}/g) ?? [];
  const all = [...tokens];
  for (let i = 0; i + 1 < tokens.length; i++)
    all.push(`${tokens[i]} ${tokens[i + 1]}`);
  /** @type {Map<string, number>} */
  const counts = new Map();
  for (const f of all) {
    if (Object.hasOwn(weights.vocab, f))
      counts.set(f, (counts.get(f) ?? 0) + 1);
  }
  /** @type {Map<string, number>} */
  const x = new Map();
  for (const [f, c] of counts)
    x.set(f, ((1 + Math.log(c)) * weights.vocab[f]) / 1024);
  return x;
}

/**
 * Every class's linear score for a request, and the log of the normalizer.
 * @param {string} request
 * @param {BlockPickerWeights} weights
 * @returns {{z: number[], lse: number}}
 */
function linearScores(request, weights) {
  const x = features(request, weights);
  let sq = 0;
  for (const v of x.values()) sq += v * v;
  const norm = Math.sqrt(sq);
  const z = weights.bias.slice();
  if (norm > 0) {
    for (const [f, v] of x) {
      const row = Object.hasOwn(weights.words, f) ? weights.words[f] : null;
      if (!row) continue;
      for (let k = 0; k < row.length; k += 2)
        z[row[k]] += (v / norm) * row[k + 1];
    }
  }
  for (let c = 0; c < z.length; c++) z[c] /= 64;
  let max = -Infinity;
  for (const v of z) if (v > max) max = v;
  let sum = 0;
  for (const v of z) sum += Math.exp(v - max);
  return {z, lse: max + Math.log(sum)};
}

/** How many of search's block results are candidates. */
const SEARCH_POOL = 100;

/** Words too common to tie a block to a request. */
const STOP = new Set(
  (
    'a an the and or of for to in on with by at from as is are be this that ' +
    'it its my our your their me we you i into via per each all any some page ' +
    'app screen ui view build make create need want like show shows showing ' +
    'using use one two new add list item items basic simple showcase example ' +
    'default variant'
  ).split(' '),
);

/**
 * A word with a plural or verb ending removed (words over four letters).
 * @param {string} w
 * @returns {string}
 */
function stemOf(w) {
  for (const end of ['ing', 'ies', 'es', 's', 'ed']) {
    if (w.length > 4 && w.endsWith(end))
      return w.slice(0, -end.length) + (end === 'ies' ? 'y' : '');
  }
  return w;
}

/**
 * The content words of a text: lowercase words of three or more letters, not
 * in {@link STOP}, stemmed.
 * @param {string} text
 * @returns {Set<string>}
 */
function contentWords(text) {
  const words =
    String(text)
      .toLowerCase()
      .match(/[a-z0-9]{3,}/g) ?? [];
  return new Set(words.filter(w => !STOP.has(w)).map(stemOf));
}

/**
 * Whether a request names a block: a run of one to three adjacent words of
 * the request, joined, is the block's name, the start of its name that names
 * its component (at least four letters, whole words), or the plural of either.
 * @param {string[]} words the request's lowercase words
 * @param {string} block
 * @returns {boolean}
 */
function names(words, block) {
  const parts = wordsOf(block);
  /** @type {Set<string>} */
  const forms = new Set();
  for (let n = 1; n <= parts.length; n++) {
    const form = parts.slice(0, n).join('');
    if (form.length >= 4) forms.add(form);
  }
  for (let i = 0; i < words.length; i++) {
    let run = '';
    for (let n = 0; n < 3 && i + n < words.length; n++) {
      run += words[i + n];
      for (const form of forms)
        if (run === form || pluralOf(run, form)) return true;
    }
  }
  return false;
}

/**
 * The blocks build names for a request, re-ranked by the picker.
 * @param {string} request
 * @param {{kitBlocks: string[], searched: BlockScore[], foreign: string[], blockText: Map<string, string>}} signals
 *   build's signals: the kit's blocks, search's block results [id, score,
 *   matched, total] in order, the blocks whose package is not Core's, and
 *   each searched block's display name and description
 * @param {BlockPickerWeights} weights
 * @returns {string[]} as many blocks as build's own list: a block the request
 *   names, one the weights do not know, or one an integration ships keeps its
 *   slot; the picker's best, from build's blocks and search's, fill the others
 */
export function pickBlocks(request, signals, weights) {
  const own = signals.kitBlocks;
  if (own.length === 0) return [];
  const {z, lse} = linearScores(request, weights);
  const classIndex = new Map(weights.classes.map((c, i) => [c, i]));
  /** @type {Map<string, BlockScore>} */
  const found = new Map();
  for (const s of signals.searched) if (!found.has(s[0])) found.set(s[0], s);
  const foreign = new Set(signals.foreign);
  const words = wordsOf(request);
  const keeps = own.map(
    b => !classIndex.has(b) || foreign.has(b) || names(words, b),
  );
  /** @type {Map<string, number>} */
  const place = new Map();
  for (const b of [...own, ...signals.searched.map(s => s[0])])
    if (!place.has(b)) place.set(b, place.size);
  const requestWords = contentWords(request);
  const shares = (/** @type {string} */ b) => {
    for (const w of contentWords(
      `${wordsOf(b).join(' ')} ${signals.blockText.get(b) ?? ''}`,
    ))
      if (requestWords.has(w)) return true;
    return false;
  };
  const pool = own.filter((_, k) => !keeps[k]);
  for (const [b] of signals.searched.slice(0, SEARCH_POOL)) {
    if (own.includes(b) || pool.includes(b)) continue;
    if (!classIndex.has(b) || foreign.has(b) || !shares(b)) continue;
    pool.push(b);
  }
  const [t0, t1, t2, t3, t4] = weights.theta;
  const scored = pool
    .map((b, pos) => {
      const s = found.get(b);
      const c = classIndex.get(b);
      const at = place.get(b);
      const f0 = s ? s[1] / 100 : 0;
      const f1 = s ? (s[2] ?? 0) / Math.max(s[3] ?? 0, 1) : 0;
      const f2 = own.includes(b) ? 1 : 0;
      const f3 = at === undefined ? 0 : 1 / (1 + at);
      const f4 = (c === undefined ? UNSCORED : z[c]) - lse;
      return {b, pos, s: t0 * f0 + t1 * f1 + t2 * f2 + t3 * f3 + t4 * f4};
    })
    .sort((a, b) => b.s - a.s || a.pos - b.pos);
  let next = 0;
  return own.map((b, k) => (keeps[k] ? b : scored[next++].b));
}
