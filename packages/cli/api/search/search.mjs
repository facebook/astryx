// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the unified `search` command.
 *
 * Returns the same typed envelope { type, data } that `xds --json search`
 * outputs. The CLI command handler is a thin wrapper around this function.
 *
 * `search(query)` is the single "I'm looking for X" entry point across ALL
 * content domains — components, hooks, docs topics, templates (page + block),
 * and themes. Finding the right thing otherwise takes separate list calls
 * (`component --list`, `hook --list`, `docs`, `template --list`, `theme list`)
 * plus manual scanning; this collapses them into one ranked, typed result set.
 *
 * Scoring is keyword + fuzzy ranking (NOT semantic / embeddings — that is a
 * deliberate future follow-up). It reuses the same signal weighting as the
 * component fuzzy resolver in lib/string-utils.mjs:
 *
 *   100  exact name match
 *    95  name is the term's plural or stem form ("buttons" -> Button)
 *    90  exact keyword match
 *    88  keyword is the term's plural or stem form
 *    80  name Levenshtein distance 1 (one-word lookups, words of 5+ letters)
 *    70  keyword word prefix / distance 1 (distance: one-word lookups, 5+ letters)
 *    60  name word prefix (>=4 chars, >=50% coverage)
 *    60  exact weak-keyword match
 *    50  description / prose mentions the term
 *    45  usage guidance mentions the term
 *    40  name Levenshtein distance 2 (one-word lookups, 8+ letters)
 *    40  weak-keyword word prefix
 *    30  keyword Levenshtein distance 2 (one-word lookups, 8+ letters)
 *    20  name Levenshtein distance 3 (one-word lookups, 11+ letters)
 *
 * Name + keyword signals always outweigh description/prose, so an exact match
 * sorts above an incidental mention.
 *
 * A term matches inside a name or keyword only at the start of one of its
 * words: "dash" finds "dashboard" and "input" finds "TextInput", but "file"
 * does not find "profile". Edit distance is typo tolerance, so it applies only
 * to a one-word lookup, where a typo is the likely explanation, and only to
 * words long enough that one edit rarely makes another real word. In a
 * sentence, a near miss is usually a different word: "site" is not "side",
 * "cable" is not "table".
 *
 * A multi-word query has a reserved top tier (see {@link scoreQuery}): the
 * whole query as a candidate's name or keyword (190-200), then the whole query
 * as a phrase inside a doc's title or one of its headings (170), then a whole
 * title of two words or more inside the query (160-169), then a candidate that
 * matches every word of the query, at least one of them by name or keyword
 * (151-159). Below those sits everything else: a partial match, or every word
 * matched only in prose or through the components a page renders. A section titled "Light/Dark Mode" answers `dark
 * mode` better than any doc that merely names `mode` in code, however exactly;
 * "Dark mode" answers `how do I add dark mode`; and a guide whose title and
 * description hold both words of `troubleshoot integration` answers it better
 * than a doc named `integration`.
 *
 * Description and guidance are separate tiers on purpose. A component's own
 * one-line description saying "notification" is a claim about what it IS; the
 * same word inside another component's best-practice advice is a passing
 * mention. Scored equally, `Toast` — "a brief, non-blocking notification" —
 * ties with `Card`, `Dialog` and `Item`, which merely mention notifications in
 * their guidance, and ties break alphabetically, so Toast falls off the end of
 * its own best query.
 *
 * `keywords` carry AUTHORED intent — a block's `componentsUsed`, a page's
 * `category` words. `weakKeywords` are DERIVED: the components a page template
 * happens to render, scraped out of its JSX. Derived signal is deliberately
 * capped below the confident-match gate on its own, because breadth is not
 * relevance. At full keyword strength every rendered component is an
 * independent 90-point shot with no penalty for how many a template has, so
 * the broadest pages (a theme showcase rendering one of everything) win
 * queries they have nothing to do with.
 */

import {readDocView} from '../../foundation/doc-compiler/read.mjs';
import {findCoreDir} from '../../foundation/fs/paths.mjs';
import {
  discoverComponents,
  discoverValidIntegrationComponents,
  findComponentReadme,
  resolveImportPath,
  resolveIntegrationImportPath,
  CORE_PACKAGE,
} from '../../foundation/discovery/component-discovery.mjs';
import {
  discoverHooks,
  findHookDoc,
} from '../../foundation/discovery/hook-discovery.mjs';
import {
  loadComponentReplacements,
  loadIntegrationsSafely,
} from '../component/_adapter.mjs';
import {levenshteinDistance} from '../../foundation/text/string-utils.mjs';
import {discoverTemplates, extractComponents} from '../template/template.mjs';
import {templateLookupIds} from '../../foundation/discovery/template-adapter.mjs';
import {listAvailableThemes} from '../theme/_adapter.mjs';
import {
  guideEntry,
  loadDocsCatalog,
  lowerTopic,
  projectTree,
  holdsOwnName,
} from '../docs/_adapter.mjs';
import {unlinkText} from '../../foundation/doc-compiler/links.mjs';
import {nodeView} from '../docs/node/node.mjs';
import {
  sectionKey,
  sectionSummary,
} from '../../foundation/discovery/docs-section-key.mjs';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';
import {setResultCoverage} from './coverage.mjs';

/**
 * A search candidate gathered from one content domain. Extra underscore-
 * prefixed fields carry domain-specific payload used only by {@link toResult}.
 * @typedef {object} Candidate
 * @property {'component'|'hook'|'doc'|'template'|'theme'} domain
 * @property {string} name
 * @property {string[]} [aliases] - Other names the candidate answers to, scored
 *   with the same name signals: a theme's display name.
 * @property {string[]} [keywords]
 * @property {string[]} [weakKeywords]
 * @property {string} [description]
 * @property {string[]} [prose]
 * @property {string[]} [guidance]
 * @property {string[]} [titles] - A doc's title and the headings inside it:
 *   the lines a reader scans to pick it. The whole query standing in one of
 *   them, or one of them standing whole in the query, is a top-tier match.
 * @property {string} [_import]
 * @property {string} [_title]
 * @property {string} [_topic] - A doc result's topic or docs-tree route.
 * @property {string} [_section] - A doc result's section key, when it is one section.
 * @property {string} [_command] - The command that reads exactly this doc part.
 * @property {string} [_parent] - The command that opens the level above a doc
 *   part: its topic's section list, or the docs-tree namespace it sits in.
 * @property {string} [_package] - The npm package that owns the candidate:
 *   Core's package for its components, hooks, and templates, the integration's
 *   for what it contributed, and for a doc part the package that wrote it.
 * @property {string} [_displayName]
 * @property {'page'|'block'} [_kind]
 * @property {string} [_resultName]
 * @property {string} [_commandName]
 */

/**
 * Synonym / intent map: product-language terms an agent is likely to type,
 * expanded to the catalog's vocabulary so oblique queries still rank. Keys and
 * values are matched bidirectionally (typing any value also pulls in the key
 * and its siblings). Lowercase, single words or short phrases. Exported for
 * `build`, whose page ranker expands a query with the same vocabulary.
 */
export const SYNONYMS = {
  dashboard: [
    'overview',
    'analytics',
    'kpi',
    'kpis',
    'metrics',
    'stats',
    'reporting',
    'insights',
    'control',
  ],
  login: ['signin', 'auth', 'authentication', 'sso', 'credentials', 'account'],
  signup: ['register', 'registration', 'onboarding'],
  payment: ['checkout', 'billing', 'card', 'pay', 'purchase', 'order'],
  pricing: ['plans', 'plan', 'tiers', 'tier', 'subscription', 'subscriptions'],
  chat: ['messaging', 'message', 'messages', 'conversation', 'inbox', 'dm'],
  settings: ['preferences', 'config', 'configuration', 'account'],
  calendar: ['schedule', 'scheduling', 'events', 'event', 'month', 'agenda'],
  table: ['list', 'rows', 'records', 'grid', 'spreadsheet', 'datatable'],
  gallery: ['photos', 'photo', 'images', 'image', 'pictures'],
  hero: ['banner', 'splash', 'headline', 'landing'],
  form: ['fields', 'input', 'inputs', 'survey'],
  profile: ['bio', 'avatar', 'user'],
  documentation: ['docs', 'reference', 'guide', 'api'],
  navigation: ['nav', 'menu', 'sidebar'],
};

// Flatten into a token -> Set(expansions) lookup (bidirectional).
const SYNONYM_INDEX = (() => {
  /** @type {Map<string, Set<string>>} */
  const idx = new Map();
  /**
   * @param {string} a
   * @param {string} b
   */
  const add = (a, b) => {
    let set = idx.get(a);
    if (!set) {
      set = new Set();
      idx.set(a, set);
    }
    set.add(b);
  };
  for (const [key, vals] of Object.entries(SYNONYMS)) {
    for (const v of vals) {
      add(key, v);
      add(v, key);
      for (const v2 of vals) if (v2 !== v) add(v, v2);
    }
  }
  return idx;
})();

/**
 * Light stemmer: strips common English suffixes so "charts"/"charting" and
 * "chart" share a root. Deliberately crude (no Porter) — good enough to bridge
 * plural/gerund gaps without a dependency.
 * @param {string} w
 * @returns {string}
 */
export function stem(w) {
  let s = w;
  for (const suf of ['ing', 'ed', 'ies', 'es', 's']) {
    if (s.length > suf.length + 2 && s.endsWith(suf)) {
      s = suf === 'ies' ? s.slice(0, -3) + 'y' : s.slice(0, -suf.length);
      break;
    }
  }
  return s;
}

/**
 * The forms of a word that count as the same word: itself, its stem, and its
 * singular when it ends in a plural suffix — so "tables" is "table",
 * "statuses" is "status", and "filtering" is "filter".
 * @param {string} w - Lowercase word.
 * @returns {Set<string>}
 */
function wordForms(w) {
  const forms = new Set([w, stem(w)]);
  if (w.length > 3 && w.endsWith('s')) forms.add(w.slice(0, -1));
  if (w.length > 4 && w.endsWith('es')) forms.add(w.slice(0, -2));
  if (w.length > 4 && w.endsWith('ies')) forms.add(w.slice(0, -3) + 'y');
  return forms;
}

/**
 * Whether two lowercase words are the same word, up to plural and stem form.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function sameWord(a, b) {
  if (a === b) return true;
  const forms = wordForms(a);
  for (const f of wordForms(b)) if (forms.has(f)) return true;
  return false;
}

/**
 * The lowercase words of a name or keyword: split at non-alphanumerics and at
 * camelCase boundaries, so "TextInput" is ["text", "input"] and
 * "Dashboard - Analytics" is ["dashboard", "analytics"].
 * @param {string} text
 * @returns {string[]}
 */
function wordsOf(text) {
  return String(text)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/**
 * Whether a term is found inside a name or keyword: it is one of its words, or
 * the start of one (a truncation), and covers at least half of the whole
 * string. Four letters minimum, so a short term never matches by accident.
 * @param {string} term - Lowercase term.
 * @param {string} text - The name or keyword as authored.
 * @returns {boolean}
 */
function startsAWordOf(term, text) {
  if (term.length < 4) return false;
  if (term.length / String(text).length < 0.5) return false;
  return wordsOf(text).some(w => w.startsWith(term) || sameWord(term, w));
}

/**
 * The fewest letters both words need before an edit distance counts as a
 * typo, by distance. Below them, one edit usually makes a different word.
 */
const TYPO_MIN_LENGTH = {1: 5, 2: 8, 3: 11};

/**
 * @param {string} a
 * @param {string} b
 * @param {number} dist
 */
const isTypo = (a, b, dist) =>
  dist > 0 &&
  dist <= 3 &&
  Math.min(a.length, b.length) >=
    TYPO_MIN_LENGTH[/** @type {1 | 2 | 3} */ (dist)];

/** Valid domain filters for `--type`. */
export const SEARCH_DOMAINS = ['component', 'hook', 'doc', 'template', 'theme'];

/**
 * The domains a search reads without @astryxdesign/core. An open search outside
 * an app covers these alone.
 */
const CORELESS_DOMAINS = ['doc', 'theme'];

/**
 * Filler words stripped from multi-word queries so natural-language phrasing
 * ("a page where you can see business stats") ranks on its content words.
 * Exported for `build`, whose page ranker strips the same words.
 */
export const STOPWORDS = new Set([
  'a',
  'an',
  'the',
  'of',
  'for',
  'to',
  'with',
  'and',
  'or',
  'in',
  'on',
  'at',
  'by',
  'that',
  'this',
  'my',
  'your',
  'our',
  'their',
  'is',
  'are',
  'be',
  'it',
  'its',
  'as',
  'from',
  'page',
  'screen',
  'app',
  'application',
  'view',
  'where',
  'you',
  'can',
  'some',
  'like',
  'just',
  'basically',
  'kinda',
  'want',
  'wants',
  'need',
  'needs',
  'something',
  'thing',
  'things',
  'build',
  'make',
  'create',
  'i',
  'me',
  'we',
  'us',
  'so',
  'up',
  'out',
  'over',
  'side',
  'one',
  'big',
]);

/**
 * Split a query into meaningful content tokens (lowercased, stopwords + very
 * short words removed). Empty for single-word queries (callers fall back to
 * whole-phrase scoring).
 * @param {string} term - Already-lowercased query.
 * @returns {string[]}
 */
export function tokenizeQuery(term) {
  return (
    term
      .split(/\s+/)
      // Strip only leading/trailing punctuation; keep joined identifiers intact
      // (e.g. "foo_bar" stays one token) so gibberish stays gibberish.
      .map(t => t.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, ''))
      .filter(t => t.length >= 2 && !STOPWORDS.has(t))
  );
}

/**
 * Score a candidate against a query, handling multi-word natural language.
 * Tries the whole phrase (so exact/near matches still win) AND a per-token
 * pass (so "data table with filters" matches `table-page` via table+filter),
 * and returns whichever is stronger.
 *
 * @param {string} term - Lowercased full query.
 * @param {string[]} tokens - Content tokens from tokenizeQuery(term).
 * @param {object} candidate
 * @returns {{score: number, reason: string} | null}
 */
/**
 * Minimum per-token score (in the multi-word pass) to count as a real match.
 * 50 = a genuine name/keyword/description hit; below that is loose Levenshtein
 * fuzz that would otherwise turn gibberish queries into noise.
 *
 * Guidance (45) is deliberately BELOW this floor, so it never counts as one of
 * the matched concepts in a multi-word query. Measured: letting it count moved
 * `nested menu` from SideNav to List and `explain why a field is required` from
 * Field to TextInput — in both cases a component whose guidance happens to
 * mention the other word displaced the one that IS the answer. Breadth is not
 * relevance, the same reason `weakKeywords` are capped. Guidance still decides
 * single-word queries and still breaks ties, which is where it earns its place.
 */
const MIN_TOKEN_SCORE = 50;

/**
 * Best score for a token against a candidate, fanning out through synonyms
 * (synonym hits are discounted so a direct hit always wins).
 * @param {string} tok
 * @param {Candidate} candidate
 * @param {{fuzzy?: boolean}} [opts]
 * @returns {{score: number, reason: string} | null}
 */
function bestForToken(tok, candidate, opts = {}) {
  let best = scoreCandidate(tok, candidate, opts);
  const syns = SYNONYM_INDEX.get(tok);
  if (syns) {
    for (const s of syns) {
      const h = scoreCandidate(s, candidate, opts);
      if (h) {
        const score = Math.round(h.score * 0.85);
        if (!best || score > best.score)
          best = {score, reason: `${h.reason} (~${tok})`};
      }
    }
  }
  return best;
}

/**
 * The score of a whole-query phrase inside a doc's title or heading: a keyword
 * substring hit (70) promoted by the same 100 as the exact tier. Below an
 * exact name or keyword (190-200), above the token-sum path (~151 at most).
 */
const TITLE_PHRASE_SCORE = 170;

/**
 * The score of a whole title inside a longer query, before its coverage bonus:
 * one step below {@link TITLE_PHRASE_SCORE}. The bonus (one per query term the
 * candidate matches, at most 9) orders the sections that share a common title,
 * so "best practices for spacing" puts Spacing's Best Practices first.
 */
const TITLE_IN_QUERY_SCORE = 160;

/**
 * The score of a candidate that matches every content word of a multi-word
 * query, before a bonus of up to 8 for how strong its strongest match is: just
 * above anything that matches only some of the words. The token-sum path tops
 * out near 150 for a partial match (a 100 on one word, the per-word bonus, and
 * the coverage term), so an AND-match with one keyword-strength hit (see
 * {@link STRONG_TOKEN_SCORE}) always outranks an OR-match, and stays below the
 * title tiers.
 */
const FULL_COVERAGE_SCORE = 151;

/**
 * The strongest single-word hit an every-word match needs to take that tier: a
 * keyword substring. Two passing mentions in prose, or the components a page
 * happens to render, are breadth, not relevance; they stay on the token sum,
 * below an exact name or keyword hit on one of the words.
 */
const STRONG_TOKEN_SCORE = 70;

/**
 * The words of a title or query, lowercased, without punctuation or code ticks.
 * @param {string} text
 * @returns {string[]}
 */
function phraseWords(text) {
  return unlinkText(text).toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

/**
 * Whether two words are the same word, allowing a plural on either side, so
 * `data attributes selector` still reads "Data attribute selectors".
 * @param {string} a
 * @param {string} b
 */
function samePhraseWord(a, b) {
  return (
    a === b ||
    `${a}s` === b ||
    `${b}s` === a ||
    `${a}es` === b ||
    `${b}es` === a
  );
}

/**
 * Whether `plural` is the plural of `word`: `integrations` of `integration`,
 * `boxes` of `box`. `es` only follows s, x, z, ch, or sh, so `notes` is not a
 * plural of `not`.
 * @param {string} plural
 * @param {string} word
 */
function pluralOf(plural, word) {
  if (word.length < 3) return false;
  if (plural === `${word}s`) return true;
  return /(?:s|x|z|ch|sh)$/.test(word) && plural === `${word}es`;
}

/**
 * The first title or heading that holds every word of the query, in order and
 * side by side, or null.
 * @param {string} term - Lowercased full query.
 * @param {string[] | undefined} titles
 * @returns {string | null}
 */
export function headingWithPhrase(term, titles) {
  const query = phraseWords(term);
  if (query.length < 2 || !titles) return null;
  for (const title of titles) {
    const words = phraseWords(String(title ?? ''));
    for (let i = 0; i + query.length <= words.length; i++) {
      if (query.every((word, j) => samePhraseWord(words[i + j], word)))
        return title;
    }
  }
  return null;
}

/**
 * The first title or heading of two words or more that the query holds whole,
 * in order and side by side, or null. A question such as "how do I add dark
 * mode" names the "Dark mode" section outright, around words no title has.
 * @param {string} term - Lowercased full query.
 * @param {string[] | undefined} titles
 * @returns {string | null}
 */
export function titleInQuery(term, titles) {
  const query = phraseWords(term);
  if (!titles) return null;
  for (const title of titles) {
    const words = phraseWords(String(title ?? ''));
    if (words.length < 2 || words.length > query.length) continue;
    for (let i = 0; i + words.length <= query.length; i++) {
      if (words.every((word, j) => samePhraseWord(query[i + j], word)))
        return title;
    }
  }
  return null;
}

/**
 * @param {string} term - Lowercased full query.
 * @param {string[]} tokens - Content tokens from tokenizeQuery(term).
 * @param {Candidate} candidate
 * @returns {{score: number, reason: string, matched: number, total: number} | null}
 *   `matched`/`total` are the query concepts this candidate answered, out of
 *   the concepts the query had. Callers that must distinguish "matched one word
 *   of three" from "matched all three" — `build`, which gates its pages group
 *   on coverage — cannot recover that from the score, because a single strong
 *   hit and a broad weak one land on the same number.
 */
export function scoreQuery(term, tokens, candidate) {
  const total = Math.max(tokens.length, 1);
  // A whole-phrase hit answered the whole query by definition.
  const asFull = (/** @type {{score: number, reason: string}} */ hit) => ({
    ...hit,
    matched: total,
    total,
  });
  // Typo tolerance is for one-word lookups. In a multi-word query a near miss
  // is usually a different word, not a typo.
  const fuzzy = tokens.length <= 1;
  const full = scoreCandidate(term, candidate, {fuzzy});
  // A query of several words keeps its phrase tiers below even when stopwords
  // leave one content word: "make an integration" is still the phrase an
  // author declares as a keyword, and "build an integration" still names a
  // title outright, though each tokenizes to `integration` alone.
  const phrase = phraseWords(term).length >= 2;

  /** 0–1 content tokens: whole-phrase fuzzy matching (typo tolerance for
   *  single words), but if stopwords left exactly one DIFFERENT token (e.g.
   *  "pricing page" → "pricing"), score that token too and take the stronger. */
  const fewTokens = () => {
    const single =
      tokens.length === 1 ? bestForToken(tokens[0], candidate, {fuzzy}) : null;
    if (full && (!single || full.score >= single.score)) return asFull(full);
    return single ? asFull(single) : null;
  };
  if (tokens.length <= 1 && !phrase) return fewTokens();

  // The full (untokenized) query matching a candidate's name or a declared
  // keyword VERBATIM — full.score 90 or 100, the only two scoreCandidate
  // outcomes at or above that mark — is a deliberate, explicit label the
  // author chose for exactly this multi-word concept. Promote it to a
  // reserved top tier, safely above the token-sum path's ceiling below
  // (~151: 100 avg + 36 bonus + 15 coverage), so it always outranks a
  // candidate that merely happens to contain several of the query's
  // individual words. Without this, "table of contents" never surfaces
  // Outline (which declares that exact phrase as a keyword) because dozens
  // of Table-related templates each match "table" and "contents" separately
  // and accumulate a higher raw score (#5239).
  if (full && full.score >= 90) {
    return asFull({score: full.score + 100, reason: full.reason});
  }

  // The whole query standing as a phrase in a doc's title or one of its
  // headings is the next tier down, and still above the token-sum path. The
  // reader named what the section is about, in order: `dark mode` is the
  // "Light/Dark Mode" section. Without this, the title scores a keyword
  // substring (70) and loses to a doc that happens to name `mode` exactly in
  // a code tick (90 on one token, 98 with coverage), so API enum docs outrank
  // the guide section.
  const heading = headingWithPhrase(term, candidate.titles);
  if (heading != null) {
    return asFull({
      score: TITLE_PHRASE_SCORE,
      reason: `title "${heading}" holds the whole query`,
    });
  }
  if (tokens.length <= 1) return fewTokens();

  // Multi-word natural language: score each content token, counting only
  // strong hits, then reward coverage so candidates matching more terms win.
  let strongest = 0;
  let matched = 0;
  let tokenSum = 0;
  /** @type {string[]} */
  const hitTerms = [];
  for (const tok of tokens) {
    const h = bestForToken(tok, candidate, {fuzzy});
    if (h && h.score >= MIN_TOKEN_SCORE) {
      if (h.score > strongest) strongest = h.score;
      matched++;
      hitTerms.push(tok);
      tokenSum += h.score;
    }
  }
  // The reverse of the title tier, a step lower: the query holds a whole title
  // of two words or more, so the reader asked a question around the section's
  // name ("how do I add dark mode"). Coverage breaks ties between sections
  // that share a title such as "Best Practices".
  const named = titleInQuery(term, candidate.titles);
  if (named != null) {
    return {
      score: TITLE_IN_QUERY_SCORE + Math.min(matched, 9),
      reason: `the query names the title "${named}"`,
      matched,
      total,
    };
  }
  if (matched === 0) return full ? asFull(full) : null;

  const reason = `matches ${matched}/${tokens.length} terms: ${hitTerms.join(', ')}`;

  // Every word matched is its own tier. Summed per word, a doc that matches
  // both words of `troubleshoot integration` in its title and description
  // (50 + bonus + coverage = 77) lost to thirty docs that each match
  // `integration` alone, by name or in a code tick (98-108). The reader asked for
  // both; a candidate that has both comes first, ordered among its peers by
  // how strong its matches are. It needs one keyword-strength hit:
  // every word mentioned in prose, or rendered by a page, is breadth, and
  // stays on the token sum below an exact hit on one word.
  //
  // The TOTAL quality of matches orders candidates within this tier, not
  // just the strongest single hit. A doc matching both words by keyword
  // (90 + 90 = 180) outranks one matching keyword + prose (90 + 50 = 140).
  // Before this, every all-word match whose strongest hit was a keyword (90)
  // scored 157, burying the better match among dozens of ties.
  if (matched === tokens.length && strongest >= STRONG_TOKEN_SCORE) {
    return {
      score:
        FULL_COVERAGE_SCORE +
        Math.min(
          Math.floor(
            (tokenSum - matched * MIN_TOKEN_SCORE) / (matched * 5),
          ),
          8,
        ),
      reason,
      matched,
      total,
    };
  }

  // Base the score on the STRONGEST concept that matched, plus a bonus per
  // additional matched concept and a coverage term.
  //
  // Deliberately not the mean, and deliberately not divided by total query
  // length. Dividing by total length penalizes verbose / low-fidelity prompts.
  // Dividing by the number of MATCHED tokens (what this used to do) made the
  // score non-monotonic: a second, weaker hit could drag the mean down by more
  // than the coverage bonus added it back, so matching fewer terms well beat
  // matching more terms partially. Concretely, `build "file browser"` scored
  // two form wizards matching only "file" at 98, above the actual file browser
  // matching both terms at 97 — and 98 clears the PAGE_DIRECT gate, so the
  // wrong template was returned as a confident match.
  //
  // Taking the max keeps both properties: a verbose prompt is still scored on
  // the concepts it did hit, and matching a superset of another candidate's
  // terms can never score lower, since every term of the expression is
  // non-decreasing in the set of matched tokens.
  const coverage = matched / tokens.length;
  const tokenScore = Math.round(
    strongest + Math.min(matched - 1, 3) * 12 + coverage * 15,
  );
  if (full && full.score >= tokenScore) return asFull(full);
  return {score: tokenScore, reason, matched, total};
}

/**
 * Score a single candidate against the search term across name, keywords,
 * and prose signals. Returns the best (highest) score plus a human reason,
 * or null if nothing matched above the floor.
 *
 * @param {string} term - Lowercased search term.
 * @param {object} candidate
 * @param {string} candidate.name - Primary identifier (component/hook name, topic, template name).
 * @param {string[]} [candidate.aliases] - Other names, scored like the name (a theme's display name).
 * @param {string} [candidate.domain] - A component, hook, or template name
 *   also matches typed as words: `command palette` is CommandPalette.
 * @param {string[]} [candidate.keywords] - Authored intent (componentsUsed, category words).
 * @param {string[]} [candidate.weakKeywords] - Derived signal (components a page renders).
 * @param {string} [candidate.description]
 * @param {string[]} [candidate.prose] - Extra free-text blobs (doc section text, best practices).
 * @param {string[]} [candidate.guidance] - Usage guidance (features, best practices) — scored a tier below description.
 * @param {{fuzzy?: boolean}} [opts] - `fuzzy`: allow edit-distance (typo) matches. Default true; multi-word queries pass false.
 * @returns {{score: number, reason: string} | null}
 */
export function scoreCandidate(
  term,
  {
    name,
    aliases = [],
    domain,
    keywords = [],
    weakKeywords = [],
    description = '',
    prose = [],
    guidance = [],
  },
  {fuzzy = true} = {},
) {
  let best = 0;
  let reason = '';
  /**
   * @param {number} score
   * @param {string} why
   */
  const consider = (score, why) => {
    if (score > best) {
      best = score;
      reason = why;
    }
  };

  // ── Name signals ────────────────────────────────────────────────
  // An alias is a name too: a theme answers to its display name as well as
  // its slug.
  for (const candidateName of [name, ...aliases.filter(Boolean)]) {
    const nameLower = candidateName.toLowerCase();
    // A placed guide's name is its route, and the route's last segment is its
    // name too, as a flat topic's is: `codemods` is cli/integrations/codemods.
    const leafLower = nameLower.slice(nameLower.lastIndexOf('/') + 1);

    // A plural of the name is the name: `integration` is the `integrations`
    // guides, `tab` the `tabs` doc.
    // A component, hook, or template name typed as words is its name:
    // `command palette` is CommandPalette. A doc's name is a route or key,
    // matched as written.
    const spelled =
      domain !== 'doc' &&
      !/[\s_-]/.test(nameLower) &&
      nameLower === term.replace(/\s+/g, '');
    if (nameLower === term || leafLower === term || spelled) {
      consider(100, 'exact name');
    } else if (pluralOf(nameLower, term) || pluralOf(term, nameLower)) {
      // One point under the exact spelling, so the doc named `tokens` still
      // outranks the Token component for `tokens`.
      consider(99, 'plural of the name');
    } else {
      if (sameWord(term, nameLower)) consider(95, `name "${candidateName}"`);
      // The term is a word of the name, or starts one: "input" in TextInput.
      else if (startsAWordOf(term, candidateName)) {
        consider(60, `name contains "${term}"`);
      }
      if (fuzzy) {
        const dist = levenshteinDistance(term, nameLower);
        if (isTypo(term, nameLower, dist)) {
          consider(
            dist === 1 ? 80 : dist === 2 ? 40 : 20,
            `similar name (distance ${dist})`,
          );
        }
      }
    }
  }

  // ── Keyword signals ─────────────────────────────────────────────
  for (const kw of keywords) {
    const kwLower = String(kw).toLowerCase();
    if (kwLower === term) {
      consider(90, `keyword "${kw}"`);
      continue;
    }
    if (sameWord(term, kwLower)) {
      consider(88, `keyword "${kw}"`);
      continue;
    }
    if (startsAWordOf(term, kw)) consider(70, `keyword "${kw}"`);
    if (fuzzy) {
      const dist = levenshteinDistance(term, kwLower);
      if (isTypo(term, kwLower, dist) && dist <= 2) {
        consider(dist === 1 ? 70 : 30, `keyword "${kw}" (distance ${dist})`);
      }
    }
  }

  // ── Weak keyword signals (derived, not authored) ─────────────────
  // Capped at 60 so one incidental component match cannot clear the
  // confident-match gate on its own; it still counts toward multi-term
  // coverage, which is where "this page renders that" is real evidence.
  // No Levenshtein tier — fuzzy matching a derived signal is pure noise.
  for (const kw of weakKeywords) {
    const kwLower = String(kw).toLowerCase();
    if (kwLower === term || sameWord(term, kwLower)) {
      consider(60, `renders ${kw}`);
      continue;
    }
    if (startsAWordOf(term, kw)) consider(40, `renders ${kw}`);
  }

  // ── Prose / description / guidance signals (stem-tolerant whole word) ──
  // Match the term's stem as a whole word, tolerating plural/gerund suffixes
  // so "chart" matches "charts" and "filter" matches "filtering".
  if (term.length >= 3) {
    const root = stem(term);
    const escaped = root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${escaped}(s|es|ing|ed|ies)?\\b`);
    if (description && re.test(description.toLowerCase())) {
      consider(50, `description mentions "${term}"`);
    } else {
      let matchedProse = false;
      for (const blob of prose) {
        if (blob && re.test(String(blob).toLowerCase())) {
          consider(50, `docs mention "${term}"`);
          matchedProse = true;
          break;
        }
      }
      // A tier below prose: guidance is what a component says about USING it,
      // so the term appearing there is weaker evidence than the component's own
      // summary. Only consulted when nothing stronger matched.
      if (!matchedProse) {
        for (const blob of guidance) {
          if (blob && re.test(String(blob).toLowerCase())) {
            consider(45, `guidance mentions "${term}"`);
            break;
          }
        }
      }
    }
  }

  return best > 0 ? {score: best, reason} : null;
}

/**
 * A component or hook doc, compiled, or null when it cannot be read.
 * @param {string} docPath
 * @param {string} [exportName]
 * @param {'components' | 'hooks'} [root]
 * @returns {Promise<any>}
 */
async function loadModuleDoc(
  docPath,
  exportName = 'docs',
  root = 'components',
) {
  try {
    // Support both the stamped default export and the legacy named export.
    return (
      (await readDocView(docPath, {
        root,
        loader: 'native',
        exports: ['default', exportName],
      })) ?? null
    );
  } catch {
    return null;
  }
}

/**
 * Build component candidates from core's own tree: name + keywords +
 * usage/description from the component's .doc.mjs.
 * @param {string} coreDir
 * @returns {Promise<Candidate[]>}
 */
/**
 * Usage guidance from a component doc: its feature list and its best-practice
 * advice, flattened to plain strings.
 *
 * This is where a reader's vocabulary usually lives. `Banner` calls itself "a
 * persistent message" and only its guidance names "form errors, system
 * updates, maintenance notices" — so a search for the words people actually
 * type finds nothing without it.
 *
 * @param {any} doc
 * @returns {string[]}
 */
function guidanceFrom(doc) {
  if (!doc) return [];
  const features = Array.isArray(doc.features) ? doc.features : [];
  const practices = Array.isArray(doc.usage?.bestPractices)
    ? doc.usage.bestPractices
    : [];
  return [...features, ...practices]
    .map(entry =>
      typeof entry === 'string'
        ? entry
        : [
            entry?.title,
            entry?.text,
            entry?.description,
            entry?.do,
            entry?.dont,
          ]
            .filter(Boolean)
            .join(' '),
    )
    .filter(Boolean);
}

/**
 * Build component candidates from core's own tree: name + keywords +
 * usage/description from the component's .doc.mjs.
 * @param {string} coreDir
 * @returns {Promise<Candidate[]>}
 */
async function gatherCoreComponents(coreDir) {
  const grouped = discoverComponents(coreDir);
  const names = Object.values(grouped).flat();
  /** @type {Candidate[]} */
  const candidates = [];
  for (const comp of names) {
    const readme = findComponentReadme(coreDir, comp);
    /** @type {string[]} */
    let keywords = [];
    let description = '';
    /** @type {string[]} */
    let guidance = [];
    if (readme && readme.endsWith('.doc.mjs')) {
      const doc = await loadModuleDoc(readme);
      if (doc) {
        keywords = Array.isArray(doc.keywords) ? doc.keywords : [];
        description = doc.usage?.description || doc.description || '';
        guidance = guidanceFrom(doc);
      }
    }
    candidates.push({
      domain: 'component',
      name: comp,
      keywords,
      description,
      guidance,
      _package: CORE_PACKAGE,
      _import: resolveImportPath(coreDir, comp),
    });
  }
  return candidates;
}

/**
 * Build component candidates contributed by the project's configured
 * integrations (astryx.config's `integrations`): name + keywords +
 * usage/description from each component's .doc.mjs, same as core. Without
 * this, an integration component is invisible to `search`/`build` even
 * though `component --list`/`component <Name>` already resolve it — the two
 * discovery paths silently disagreed.
 * @param {import('../../foundation/integrations/integrations.mjs').LoadedIntegration[]} loadedIntegrations
 * @returns {Promise<Candidate[]>}
 */
async function gatherIntegrationComponents(loadedIntegrations) {
  /** @type {Candidate[]} */
  const candidates = [];
  for (const integration of loadedIntegrations) {
    const {components} = await discoverValidIntegrationComponents(integration);
    for (const rec of components) {
      const doc = await loadModuleDoc(rec.docPath);
      candidates.push({
        domain: 'component',
        name: rec.name,
        keywords: doc && Array.isArray(doc.keywords) ? doc.keywords : [],
        description: doc ? doc.usage?.description || doc.description || '' : '',
        guidance: guidanceFrom(doc),
        _package: rec.package ?? integration.name,
        // Exactly what `component` reports: a doc may state its own specifier
        // (one entry point exporting several components), and only when it
        // does not do we resolve the subpath against the owning package's
        // exports — read off the integration, which the loader already parsed.
        // Reporting the bare package name here handed out a path that does not
        // resolve, and disagreed with what `component <Name>` said about the
        // very same component.
        _import: resolveIntegrationImportPath(
          {
            exportsMap: integration.__packageExports,
            packageDir: integration.__packageDir,
            docPath: rec.docPath,
            packageName: rec.package,
          },
          rec.name,
          doc?.import,
        ),
      });
    }
  }
  return candidates;
}

/**
 * Build component candidates: core's own tree plus every configured
 * integration's components.
 * @param {string} coreDir
 * @param {string} cwd
 * @returns {Promise<Candidate[]>}
 */
async function gatherComponents(coreDir, cwd) {
  const loadedIntegrations = await loadIntegrationsSafely(cwd);
  const [core, integrations, replacements] = await Promise.all([
    gatherCoreComponents(coreDir),
    gatherIntegrationComponents(loadedIntegrations),
    loadComponentReplacements(coreDir, loadedIntegrations),
  ]);
  // An active replacement answers to the Core name it replaces, so a search
  // for that name finds the replacement and not the Core original
  // (spec:AST-035 FR11).
  /** @type {Map<string, string>} */
  const targetOf = new Map(
    replacements.active.map(active => [
      `${active.package}\0${active.name}`,
      active.target,
    ]),
  );
  return [
    ...core.filter(candidate => !replacements.forTarget(candidate.name)),
    ...integrations.map(candidate => {
      const target = targetOf.get(`${candidate._package}\0${candidate.name}`);
      return target == null
        ? candidate
        : {...candidate, aliases: [...(candidate.aliases ?? []), target]};
    }),
  ];
}

/**
 * The components each search response was scored against, by response:
 * `build` reads them to tell a part of a page from a page without gathering
 * them again. Module-private, so they never enter search's JSON.
 * @type {WeakMap<object, {name: string, keywords: string[]}[]>}
 */
const searchedComponentsOf = new WeakMap();

/**
 * The components (name and keywords) a search response was scored against, or
 * null when that search was narrowed away from components.
 * @param {object} response
 * @returns {{name: string, keywords: string[]}[] | null}
 */
export function searchedComponents(response) {
  return searchedComponentsOf.get(response) ?? null;
}

/**
 * Every component the project can use, Core's and its integrations', with the
 * keywords its own doc declares: the discovery and doc reads search's own
 * candidates use, without the import paths and prose a result carries. `build`
 * reads it to tell a part of a page from a page when its search was narrowed
 * away from components.
 * @param {string} coreDir
 * @param {string} cwd
 * @returns {Promise<{name: string, keywords: string[]}[]>}
 */
export async function componentKeywords(coreDir, cwd) {
  /** @param {any} doc */
  const keywordsOf = doc => (Array.isArray(doc?.keywords) ? doc.keywords : []);
  const core = Object.values(discoverComponents(coreDir))
    .flat()
    .map(async name => {
      const readme = findComponentReadme(coreDir, name);
      const doc =
        readme && readme.endsWith('.doc.mjs')
          ? await loadModuleDoc(readme)
          : null;
      return {name, keywords: keywordsOf(doc)};
    });
  const loadedIntegrations = await loadIntegrationsSafely(cwd);
  const replacements = await loadComponentReplacements(
    coreDir,
    loadedIntegrations,
  );
  const integrations = loadedIntegrations.map(
    async integration => {
      const {components} = await discoverValidIntegrationComponents(integration);
      return Promise.all(
        components.map(async rec => ({
          name: rec.name,
          keywords: keywordsOf(await loadModuleDoc(rec.docPath)),
        })),
      );
    },
  );
  return [
    ...(await Promise.all(core)).filter(
      component => !replacements.forTarget(component.name),
    ),
    ...(await Promise.all(integrations)).flat(),
  ];
}

/**
 * Build hook candidates: name + keywords + usage/description from the hook's
 * .doc.mjs.
 * @param {string} coreDir
 * @returns {Promise<Candidate[]>}
 */
async function gatherHooks(coreDir) {
  const grouped = discoverHooks(coreDir);
  const names = Object.values(grouped).flat();
  /** @type {Candidate[]} */
  const candidates = [];
  for (const hookName of names) {
    const docPath = findHookDoc(coreDir, hookName);
    /** @type {string[]} */
    let keywords = [];
    let description = '';
    let importPath = '@astryxdesign/core/hooks';
    if (docPath) {
      const doc = await loadModuleDoc(docPath, 'docs', 'hooks');
      if (doc) {
        keywords = Array.isArray(doc.keywords) ? doc.keywords : [];
        description = doc.usage?.description || doc.description || '';
        importPath = doc.importPath || importPath;
      }
    }
    candidates.push({
      domain: 'hook',
      name: hookName,
      keywords,
      description,
      _package: CORE_PACKAGE,
      _import: importPath,
    });
  }
  return candidates;
}

/**
 * Build doc candidates at the grain a reader reads them: each section of a
 * topic, whose command reads just that section; each topic as a whole, whose
 * command lists its sections; and each docs-tree node by its route. The tree's
 * guides split into sections like topics, and its typed docs also match by
 * their own name, so `assertResponse` finds `cli/api/functions/assert-response`.
 *
 * Reads the project's catalog rather than the CLI's own docs directory, so a
 * topic an integration contributed (or replaced) is searchable exactly like a
 * built-in one — otherwise the replacement is served by `astryx docs` but
 * invisible to the command whose job is finding it.
 * @param {string} cwd
 * @returns {Promise<Candidate[]>}
 */
async function gatherDocs(cwd) {
  /** @type {Candidate[]} */
  const candidates = [];
  let catalog;
  try {
    catalog = await loadDocsCatalog(cwd);
  } catch {
    return candidates;
  }
  let tree = null;
  try {
    tree = await projectTree(catalog);
  } catch {
    // `astryx doctor` reports a tree that fails to build; search still
    // indexes the topics.
  }
  for (const entry of catalog.entries()) {
    // A topic whose name opens another doc (spec:AST-046 FR11) is not
    // offered: every hit's command must open the hit.
    if (tree && !holdsOwnName(tree, catalog, entry)) continue;
    let lowered = null;
    try {
      lowered = await lowerTopic(catalog, entry);
    } catch {
      // A topic that cannot be loaded is reported by the commands that own
      // integration issues; search just cannot index it.
    }
    const doc = lowered?.doc ?? null;
    // A flat topic lives in the Unorganized level; its hits say so, and name
    // the package each section came from.
    const home = tree?.get(entry.name);
    const placed = home?.ref?.flatTopic === entry.name ? home : null;
    /** @type {Map<string, string>} */
    const packages = new Map([
      [entry.providerId ?? entry.package, entry.package],
      ...entry.extensions.map(
        ext => /** @type {[string, string]} */ ([ext.providerId ?? ext.package, ext.package]),
      ),
    ]);
    candidates.push(
      ...topicCandidates(
        entry.name,
        doc,
        entry.title,
        '',
        placed && tree
          ? [
              ...tree.ancestors(placed).map(a => a.title),
              doc?.title || entry.title || entry.name,
            ].join(' › ')
          : undefined,
        placed ? `astryx docs ${placed.parent}` : undefined,
        entry.package,
        key =>
          packages.get(lowered?.sectionProviders?.[key] ?? '') ?? entry.package,
      ),
    );
  }
  if (tree == null) return candidates;
  for (const node of tree.nodes.values()) {
    // A flat topic is indexed above, as a topic.
    if (node.ref?.flatTopic) continue;
    // A tree hit names where it lives: its ancestors' titles, then its own.
    const path = [...tree.ancestors(node).map(a => a.title), node.title];
    if (node.kind === 'generic') {
      let doc = null;
      try {
        doc = (await lowerTopic(catalog, guideEntry(node))).doc;
      } catch {
        // As above: the owning commands report it.
      }
      candidates.push(
        ...topicCandidates(
          node.route,
          doc,
          node.title,
          node.summary,
          path.join(' › '),
          node.parent == null ? undefined : `astryx docs ${node.parent}`,
          node.provider,
        ),
      );
      continue;
    }
    const selfDoc = /** @type {any} */ (node.ref)?.selfDoc;
    // A typed doc's content is what `astryx docs <route>` prints. The first
    // column of its tables names what the doc defines (an error code, an
    // option, a parameter), so each is a keyword the doc answers to.
    /** @type {any[]} */
    const content = (await nodeView(catalog, tree, node)).content ?? [];
    /** @type {string[]} */
    const defined = [];
    for (const block of content) {
      if (block.type !== 'table' || !Array.isArray(block.rows)) continue;
      for (const row of block.rows)
        if (row[0] != null) defined.push(plain(row[0]));
    }
    candidates.push({
      domain: 'doc',
      name: node.name,
      keywords: [
        node.route.slice(node.route.lastIndexOf('/') + 1),
        ...(Array.isArray(selfDoc?.keywords) ? selfDoc.keywords : []),
        // A namespace doc's own keywords, which it declares for search.
        ...(Array.isArray(node.keywords) ? node.keywords : []),
        ...defined,
        ...codeTerms({content}),
      ],
      description: node.summary || '',
      prose: sectionProse({title: node.title, content}),
      titles: [node.title],
      _topic: node.route,
      _title: path.join(' › '),
      _command: `astryx docs ${node.route}`,
      _parent: node.parent == null ? 'astryx docs' : `astryx docs ${node.parent}`,
      _package: node.provider,
    });
  }
  return candidates;
}

/**
 * The words one section says: its prose, headings, and list items.
 * @param {any} section
 * @returns {string[]}
 */
function sectionProse(section) {
  /** @type {string[]} */
  const prose = [];
  if (section?.title) prose.push(section.title);
  for (const block of section?.content || []) {
    if ((block.type === 'prose' || block.type === 'heading') && block.text) {
      prose.push(block.text);
    } else if (block.type === 'list' && Array.isArray(block.items)) {
      for (const item of block.items) {
        const text = typeof item === 'string' ? item : item?.text;
        if (typeof text === 'string') prose.push(text);
      }
    } else if (block.type === 'table' && Array.isArray(block.rows)) {
      for (const row of block.rows) prose.push(row.map(plain).join(' '));
    } else if (block.type === 'code' && typeof block.code === 'string') {
      prose.push([block.label, block.code].filter(Boolean).join(' '));
    }
  }
  return prose;
}

/**
 * The identifiers a doc part names in code ticks (`token-ref`,
 * `ERR_UNKNOWN_SECTION`). Each is a keyword: a reader who types one exactly
 * wants the part that defines or explains it.
 * @param {any} part - a section, or `{content}` of a typed doc
 * @returns {string[]}
 */
function codeTerms(part) {
  /** @type {Set<string>} */
  const terms = new Set();
  /** @param {unknown} text */
  const scan = text => {
    for (const m of String(text ?? '').matchAll(/`([^`\s]{2,40})`/g)) {
      terms.add(m[1]);
    }
  };
  for (const block of part?.content || []) {
    if (block.type === 'prose') scan(block.text);
    else if (block.type === 'list' && Array.isArray(block.items)) {
      for (const item of block.items) {
        scan(typeof item === 'string' ? item : item?.text);
      }
    } else if (block.type === 'table' && Array.isArray(block.rows)) {
      for (const row of block.rows) for (const cell of row) scan(cell);
    }
  }
  return [...terms];
}

/**
 * The headings inside a section. Each names a subsection, so a query that
 * names one should find the section as surely as one that names its title.
 * @param {any} section
 * @returns {string[]}
 */
function headings(section) {
  return (section?.content || [])
    .filter(
      (/** @type {any} */ block) => block.type === 'heading' && block.text,
    )
    .map((/** @type {any} */ block) => String(block.text));
}

/**
 * A table cell as plain words, without its code ticks.
 * @param {unknown} cell
 * @returns {string}
 */
function plain(cell) {
  return unlinkText(String(cell ?? '')).replaceAll('`', '');
}

/**
 * The candidates one topic yields: the topic itself, and one per section when
 * it has more than one. A topic's command lists its sections, and a section's
 * command reads only that section, so a hit never costs a whole-topic read.
 * @param {string} name - the topic name, or a placed guide's route
 * @param {any} doc - the lowered topic, or null when it did not load
 * @param {string} [title]
 * @param {string} [summary]
 * @param {string} [path] - where the topic lives in the docs tree, as titles
 *   joined by ` › `; a flat topic is its own title
 * @param {string} [parent] - the command that opens the level above the
 *   topic: its namespace, or the Unorganized level for a flat topic
 * @param {string} [pkg] - the npm package that authored the topic
 * @param {(key: string) => string} [sectionPackage] - the npm package a
 *   section came from: an extension's section names the extension's package
 * @returns {Candidate[]}
 */
function topicCandidates(
  name,
  doc,
  title,
  summary = '',
  path,
  parent,
  pkg,
  sectionPackage,
) {
  /** @type {any[]} */
  const sections = doc?.sections ?? [];
  const docTitle = path || doc?.title || title || name;
  const split = sections.length > 1;
  // A placed guide also answers to its last route segment's words:
  // `quick start` is cli/integrations/quick-start.
  const leaf = name.slice(name.lastIndexOf('/') + 1);
  /** @type {Candidate[]} */
  const out = [
    {
      domain: 'doc',
      name,
      keywords: [
        ...(leaf !== name ? [leaf.replaceAll('-', ' ')] : []),
        ...(doc?.title || title ? [doc?.title || title] : []),
        ...(Array.isArray(doc?.keywords) ? doc.keywords : []),
      ],
      description: doc?.description || summary,
      prose: split
        ? sections.map(section => section.title).filter(Boolean)
        : sections.flatMap(sectionProse),
      titles: [
        doc?.title || title || name,
        // A topic read whole answers for the headings inside it.
        ...(split ? [] : sections.flatMap(s => [s.title, ...headings(s)])),
      ].filter(Boolean),
      _topic: name,
      _title: docTitle,
      _command: split ? `astryx docs ${name} --index` : `astryx docs ${name}`,
      ...(parent ? {_parent: parent} : {}),
      ...(pkg ? {_package: pkg} : {}),
    },
  ];
  if (!split) return out;
  for (const section of sections) {
    const key = sectionKey(section);
    out.push({
      domain: 'doc',
      name: key,
      keywords: [
        ...(section.title ? [section.title] : []),
        ...headings(section),
        ...codeTerms(section),
      ],
      description: sectionSummary(section),
      prose: sectionProse(section),
      titles: [section.title, ...headings(section)].filter(Boolean),
      _topic: name,
      _section: key,
      _title: `${docTitle} › ${section.title}`,
      _command: `astryx docs ${name} ${key}`,
      _parent: `astryx docs ${name} --index`,
      ...((sectionPackage?.(key) ?? pkg) ? {_package: sectionPackage?.(key) ?? pkg} : {}),
    });
  }
  return out;
}

/**
 * Build template candidates (page + block) from the template discovery API.
 * @param {string} cwd
 * @returns {Promise<Candidate[]>}
 */
async function gatherTemplates(cwd) {
  let templates;
  try {
    templates = await discoverTemplates(cwd);
  } catch {
    return [];
  }
  return templates.map(t => {
    // A replacement's target is its canonical unqualified lookup id. Keep the
    // integration-owned id as a keyword and response label, but score and print
    // commands against the id that `template()` resolves back to this entry.
    // This matters for replacement chains: one replacement's own id can be the
    // target of another, so using that shadowed id as the command would select
    // the other template.
    const commandName = t.replaces ?? t.dirName;
    // Blocks ship an authored componentsUsed; page templates don't, so derive
    // them from the source. Category words (e.g. "Dashboard - Analytics") are
    // strong intent signal for pages, which otherwise only index on name +
    // description.
    //
    // Authored signal and derived signal are kept apart: componentsUsed and
    // category words are a deliberate statement of what the template is for,
    // while scraped JSX tags only say what it happens to render. See the
    // scoring table at the top of this file for why the derived set is capped.
    const keywords = Array.isArray(t.componentsUsed)
      ? [...t.componentsUsed]
      : [];
    keywords.push(...templateLookupIds(t).filter(id => id !== commandName));
    /** @type {string[]} */
    let weakKeywords = [];
    if (t.type === 'page') {
      if (t.filePath) {
        try {
          weakKeywords = extractComponents(t.filePath);
        } catch {
          // Best-effort: skip keyword enrichment if the source can't be read.
        }
      }
      if (t.category)
        keywords.push(...t.category.split(/[^A-Za-z0-9]+/).filter(Boolean));
    }
    return {
      domain: 'template',
      name: commandName,
      keywords,
      weakKeywords,
      description: t.description || '',
      // A template's own keywords name the many ideas it serves, so they score
      // as its prose does, not as a name: one of them matching one word of a
      // short idea is not a direct match.
      prose: t.keywords ?? [],
      _displayName: t.name,
      _package: t.package ?? CORE_PACKAGE,
      _kind: t.type, // 'page' | 'block'
      _resultName: t.dirName,
      _commandName: commandName,
    };
  });
}

/**
 * Build theme candidates from bundled and integration-provided themes. Without
 * this, an integration's themes are invisible to `search` even though
 * `theme list` and `discover` already resolve them.
 *
 * A theme's slug and display name are its names, and its description is prose
 * (`spec:AST-050/FR14`). A theme declares no keywords, so a word it shares with
 * the query only through its description is a description mention: read as a
 * keyword, every word of the description would outrank the components and docs
 * that declare that word.
 * @param {string} cwd
 * @returns {Promise<Candidate[]>}
 */
async function gatherThemes(cwd) {
  let themes;
  try {
    themes = await listAvailableThemes(cwd);
  } catch {
    return [];
  }
  return themes.map(t => ({
    domain: 'theme',
    name: t.slug,
    aliases: t.displayName ? [t.displayName] : [],
    description: t.description || '',
    _displayName: t.displayName,
    _package: t.package,
  }));
}

/**
 * Map a scored candidate to its public, actionable result shape. Each result
 * carries enough to act on it: the domain, name, a one-line description, and
 * the follow-up command (and import path where relevant).
 *
 * @param {Candidate} c - candidate
 * @param {number} score
 * @param {string} reason
 * @param {number} matchedTerms - Query concepts this result answered.
 * @param {number} queryTerms - Query concepts there were to answer.
 */
function toResult(c, score, reason, matchedTerms, queryTerms) {
  const base = {
    domain: c.domain,
    name: c._resultName ?? c.name,
    package: c._package,
    score,
    reason,
    description: c.description || '',
  };
  let result;
  switch (c.domain) {
    case 'component':
      result = {
        ...base,
        import: c._import,
        command: `astryx component ${c.name}`,
      };
      break;
    case 'hook':
      result = {
        ...base,
        import: c._import,
        command: `astryx hook ${c.name}`,
      };
      break;
    case 'doc':
      // A doc result names its topic or route, plus the section when the
      // hit is one section; its command reads exactly that part.
      result = {
        ...base,
        name: c._topic ?? c.name,
        ...(c._section ? {section: c._section} : {}),
        title: c._title,
        command: c._command ?? `astryx docs ${c.name}`,
        ...(c._parent ? {parent: c._parent} : {}),
      };
      break;
    case 'template':
      result = {
        ...base,
        displayName: c._displayName,
        kind: c._kind,
        command: `astryx template ${c._commandName ?? c.name} --type ${c._kind}`,
      };
      break;
    case 'theme':
      result = {
        ...base,
        displayName: c._displayName,
        command: `astryx theme add --import ${c.name}`,
      };
      break;
    default:
      result = base;
  }
  return setResultCoverage(result, matchedTerms, queryTerms);
}

/**
 * Unified ranked search across components, hooks, docs, templates, and themes.
 *
 * @param {string} query - Free-text search term.
 * @param {object} [options]
 * @param {string} [options.cwd]
 * @param {'component'|'hook'|'doc'|'template'|'theme'} [options.type] - Restrict to one domain.
 * @param {number} [options.limit] - Max results (default 20).
 * @returns {Promise<import('./search.type.mjs').SearchResponse>}
 */
export async function search(query, options = {}) {
  const {cwd = process.cwd(), type, limit = 20} = options;

  if (!query || !String(query).trim()) {
    throw new AstryxError(
      'A search query is required',
      [{name: 'astryx search button', reason: 'example'}],
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }

  if (type && !SEARCH_DOMAINS.includes(type)) {
    throw new AstryxError(
      `Unknown --type "${type}"`,
      SEARCH_DOMAINS.map(d => ({name: d, reason: 'valid type'})),
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }

  // Validate limit here (not just in the CLI) so direct API callers get the same
  // contract: a non-positive or non-integer limit is an error, never a silent
  // "return everything". (Previously `limit <= 0` fell through to the full set.)
  if (limit != null && (!Number.isInteger(limit) || limit <= 0)) {
    throw new AstryxError(
      `Invalid limit "${limit}". Must be a positive integer.`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }

  const term = String(query).trim().toLowerCase();
  const tokens = tokenizeQuery(term);

  // `astryx docs` reads docs without @astryxdesign/core, and `astryx theme
  // list` reads themes without it (bundled themes need no project), so a
  // search of either must too. Every other domain reads core: asked for by
  // name, it is an error without core; an open search then covers the docs
  // and themes alone.
  const needsCore = !type || !CORELESS_DOMAINS.includes(type);
  const coreDir = needsCore ? findCoreDir(cwd) : null;
  if (type && needsCore && !coreDir) {
    throw new AstryxError(
      'Could not find @astryxdesign/core package',
      undefined,
      ERROR_CODES.ERR_CORE_NOT_FOUND,
    );
  }

  // Gather candidates from each requested domain in parallel.
  /** @param {string} d */
  const wants = d =>
    (!type && (coreDir != null || CORELESS_DOMAINS.includes(d))) || type === d;
  const [components, hooks, docTopics, templates, themes] = await Promise.all([
    wants('component')
      ? gatherComponents(/** @type {string} */ (coreDir), cwd)
      : [],
    wants('hook') ? gatherHooks(/** @type {string} */ (coreDir)) : [],
    wants('doc') ? gatherDocs(cwd) : [],
    wants('template') ? gatherTemplates(cwd) : [],
    wants('theme') ? gatherThemes(cwd) : [],
  ]);

  const all = [...components, ...hooks, ...docTopics, ...templates, ...themes];

  // Score every candidate on its own merits. The consumer groups results by
  // role (page / block / component) and takes the top of each, so there's no
  // cross-role competition to engineer — a target page only needs to be the
  // strongest PAGE, not outrank every component.
  const scored = [];
  for (const candidate of all) {
    const hit = scoreQuery(term, tokens, candidate);
    if (hit)
      scored.push(
        toResult(candidate, hit.score, hit.reason, hit.matched, hit.total),
      );
  }

  // Sort by score desc, then domain (stable order), then name.
  /** @type {Record<string, number>} */
  const domainOrder = {component: 0, hook: 1, doc: 2, template: 3, theme: 4};
  scored.sort(
    (a, b) =>
      b.score - a.score ||
      (domainOrder[a.domain] ?? 9) - (domainOrder[b.domain] ?? 9) ||
      a.name.localeCompare(b.name),
  );

  // `results` is bounded by `limit` so a caller (and the recorded run that
  // quotes it) never carries an unbounded payload. `matchCount` is the number
  // of matches that bound was applied TO — reporting `results.length` there
  // would report the cap back as if it were the answer, so a query matching
  // 57 things and one matching exactly 20 would be indistinguishable.
  const limited = scored.slice(0, limit);

  /** @type {import('./search.type.mjs').SearchResponse} */
  const response = {
    type: 'search',
    data: {
      query: String(query).trim(),
      matchCount: scored.length,
      // toResult gives every domain its command and domain fields.
      results: /** @type {import('./search.type.mjs').SearchResultEntry[]} */ (
        limited
      ),
    },
  };
  if (wants('component')) {
    searchedComponentsOf.set(
      response,
      components.map(c => ({name: c.name, keywords: c.keywords ?? []})),
    );
  }
  return response;
}
