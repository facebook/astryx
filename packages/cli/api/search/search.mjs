// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the unified `search` command.
 *
 * Returns the same typed envelope { type, data } that `xds --json search`
 * outputs. The CLI command handler is a thin wrapper around this function.
 *
 * `search(query)` is the single "I'm looking for X" entry point across ALL
 * content domains — components, hooks, docs topics, and templates (page +
 * block). Today, finding the right thing requires four separate list calls
 * (`component --list`, `hook --list`, `docs`, `template --list`) plus manual
 * scanning; this collapses them into one ranked, typed result set.
 *
 * Scoring is keyword + fuzzy ranking (NOT semantic / embeddings — that is a
 * deliberate future follow-up). It reuses the same signal weighting as the
 * component fuzzy resolver in lib/string-utils.mjs:
 *
 *   100  exact name match
 *    90  exact keyword match
 *    80  name Levenshtein distance 1
 *    70  keyword substring / distance 1
 *    60  name substring (>=4 chars, >=50% coverage)
 *    60  exact weak-keyword match
 *    50  description / prose mentions the term
 *    45  usage guidance mentions the term
 *    40  name Levenshtein distance 2
 *    40  weak-keyword substring
 *    30  keyword Levenshtein distance 2
 *    20  name Levenshtein distance 3
 *
 * Name + keyword signals always outweigh description/prose, so an exact match
 * sorts above an incidental mention.
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

import {pathToFileURL} from 'node:url';
import {findCoreDir} from '../../foundation/fs/paths.mjs';
import {
  discoverComponents,
  discoverIntegrationComponents,
  findComponentReadme,
  resolveImportPath,
} from '../../foundation/discovery/component-discovery.mjs';
import {discoverHooks, findHookDoc} from '../../foundation/discovery/hook-discovery.mjs';
import {loadIntegrationsSafely} from '../component/_adapter.mjs';
import {levenshteinDistance} from '../../foundation/text/string-utils.mjs';
import {discoverTemplates, extractComponents} from '../template/template.mjs';
import {loadDocsCatalog, loadTopicDoc} from '../docs/_adapter.mjs';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';
import {setResultCoverage} from './coverage.mjs';

/**
 * A search candidate gathered from one content domain. Extra underscore-
 * prefixed fields carry domain-specific payload used only by {@link toResult}.
 * @typedef {object} Candidate
 * @property {'component'|'hook'|'doc'|'template'} domain
 * @property {string} name
 * @property {string[]} [keywords]
 * @property {string[]} [weakKeywords]
 * @property {string} [description]
 * @property {string[]} [prose]
 * @property {string[]} [guidance]
 * @property {string} [_import]
 * @property {string} [_title]
 * @property {string} [_displayName]
 * @property {'page'|'block'} [_kind]
 */

/**
 * Synonym / intent map: product-language terms an agent is likely to type,
 * expanded to the catalog's vocabulary so oblique queries still rank. Keys and
 * values are matched bidirectionally (typing any value also pulls in the key
 * and its siblings). Lowercase, single words or short phrases.
 */
const SYNONYMS = {
  dashboard: ['overview', 'analytics', 'kpi', 'kpis', 'metrics', 'stats', 'reporting', 'insights', 'control'],
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


/** Valid domain filters for `--type`. */
export const SEARCH_DOMAINS = ['component', 'hook', 'doc', 'template'];

/**
 * Filler words stripped from multi-word queries so natural-language phrasing
 * ("a page where you can see business stats") ranks on its content words.
 */
const STOPWORDS = new Set([
  'a', 'an', 'the', 'of', 'for', 'to', 'with', 'and', 'or', 'in', 'on', 'at',
  'by', 'that', 'this', 'my', 'your', 'our', 'their', 'is', 'are', 'be', 'it',
  'its', 'as', 'from', 'page', 'screen', 'app', 'application', 'view', 'where',
  'you', 'can', 'some', 'like', 'just', 'basically', 'kinda', 'want', 'wants',
  'need', 'needs', 'something', 'thing', 'things', 'build', 'make', 'create',
  'i', 'me', 'we', 'us', 'so', 'up', 'out', 'over', 'side', 'one', 'big',
]);

/**
 * Split a query into meaningful content tokens (lowercased, stopwords + very
 * short words removed). Empty for single-word queries (callers fall back to
 * whole-phrase scoring).
 * @param {string} term - Already-lowercased query.
 * @returns {string[]}
 */
export function tokenizeQuery(term) {
  return term
    .split(/\s+/)
    // Strip only leading/trailing punctuation; keep joined identifiers intact
    // (e.g. "foo_bar" stays one token) so gibberish stays gibberish.
    .map(t => t.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, ''))
    .filter(t => t.length >= 2 && !STOPWORDS.has(t));
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
 * @returns {{score: number, reason: string} | null}
 */
function bestForToken(tok, candidate) {
  let best = scoreCandidate(tok, candidate);
  const syns = SYNONYM_INDEX.get(tok);
  if (syns) {
    for (const s of syns) {
      const h = scoreCandidate(s, candidate);
      if (h) {
        const score = Math.round(h.score * 0.85);
        if (!best || score > best.score) best = {score, reason: `${h.reason} (~${tok})`};
      }
    }
  }
  return best;
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
  const full = scoreCandidate(term, candidate);

  // 0–1 content tokens: keep whole-phrase fuzzy matching (typo tolerance for
  // single words), but if stopwords left exactly one DIFFERENT token (e.g.
  // "pricing page" → "pricing"), score that token too and take the stronger.
  if (tokens.length <= 1) {
    const single = tokens.length === 1 ? bestForToken(tokens[0], candidate) : null;
    if (full && (!single || full.score >= single.score)) return asFull(full);
    return single ? asFull(single) : null;
  }

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

  // Multi-word natural language: score each content token, counting only
  // strong hits, then reward coverage so candidates matching more terms win.
  let strongest = 0;
  let matched = 0;
  /** @type {string[]} */
  const hitTerms = [];
  for (const tok of tokens) {
    const h = bestForToken(tok, candidate);
    if (h && h.score >= MIN_TOKEN_SCORE) {
      if (h.score > strongest) strongest = h.score;
      matched++;
      hitTerms.push(tok);
    }
  }
  if (matched === 0) return full ? asFull(full) : null;

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
  const tokenScore = Math.round(strongest + Math.min(matched - 1, 3) * 12 + coverage * 15);

  if (full && full.score >= tokenScore) return asFull(full);
  return {
    score: tokenScore,
    reason: `matches ${matched}/${tokens.length} terms: ${hitTerms.join(', ')}`,
    matched,
    total,
  };
}

/**
 * Score a single candidate against the search term across name, keywords,
 * and prose signals. Returns the best (highest) score plus a human reason,
 * or null if nothing matched above the floor.
 *
 * @param {string} term - Lowercased search term.
 * @param {object} candidate
 * @param {string} candidate.name - Primary identifier (component/hook name, topic, template name).
 * @param {string[]} [candidate.keywords] - Authored intent (componentsUsed, category words).
 * @param {string[]} [candidate.weakKeywords] - Derived signal (components a page renders).
 * @param {string} [candidate.description]
 * @param {string[]} [candidate.prose] - Extra free-text blobs (doc section text, best practices).
 * @param {string[]} [candidate.guidance] - Usage guidance (features, best practices) — scored a tier below description.
 * @returns {{score: number, reason: string} | null}
 */
export function scoreCandidate(
  term,
  {name, keywords = [], weakKeywords = [], description = '', prose = [], guidance = []},
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

  const nameLower = name.toLowerCase();

  // ── Name signals ────────────────────────────────────────────────
  if (nameLower === term) {
    consider(100, 'exact name');
  } else {
    // Substring (both directions), min 4 chars, >=50% coverage.
    const shorter = term.length < nameLower.length ? term : nameLower;
    const longer = term.length < nameLower.length ? nameLower : term;
    if (shorter.length >= 4 && longer.includes(shorter) && shorter.length / longer.length >= 0.5) {
      consider(60, `name contains "${shorter}"`);
    }
    const dist = levenshteinDistance(term, nameLower);
    if (dist === 1) consider(80, `similar name (distance ${dist})`);
    else if (dist === 2) consider(40, `similar name (distance ${dist})`);
    else if (dist === 3) consider(20, `similar name (distance ${dist})`);
  }

  // ── Keyword signals ─────────────────────────────────────────────
  for (const kw of keywords) {
    const kwLower = String(kw).toLowerCase();
    if (kwLower === term) {
      consider(90, `keyword "${kw}"`);
      continue;
    }
    const s = term.length < kwLower.length ? term : kwLower;
    const l = term.length < kwLower.length ? kwLower : term;
    if (s.length >= 4 && l.includes(s) && s.length / l.length >= 0.5) {
      consider(70, `keyword "${kw}"`);
    }
    const dist = levenshteinDistance(term, kwLower);
    if (dist === 1) consider(70, `keyword "${kw}" (distance ${dist})`);
    else if (dist === 2) consider(30, `keyword "${kw}" (distance ${dist})`);
  }

  // ── Weak keyword signals (derived, not authored) ─────────────────
  // Capped at 60 so one incidental component match cannot clear the
  // confident-match gate on its own; it still counts toward multi-term
  // coverage, which is where "this page renders that" is real evidence.
  // No Levenshtein tier — fuzzy matching a derived signal is pure noise.
  for (const kw of weakKeywords) {
    const kwLower = String(kw).toLowerCase();
    if (kwLower === term) {
      consider(60, `renders ${kw}`);
      continue;
    }
    const s = term.length < kwLower.length ? term : kwLower;
    const l = term.length < kwLower.length ? kwLower : term;
    if (s.length >= 4 && l.includes(s) && s.length / l.length >= 0.5) {
      consider(40, `renders ${kw}`);
    }
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
 * Load a doc module's `docs`/`doc` export, swallowing errors.
 * @param {string} docPath
 * @param {string} [exportName]
 * @returns {Promise<any>}
 */
async function loadModuleDoc(docPath, exportName = 'docs') {
  try {
    const mod = await import(pathToFileURL(docPath).href);
    return mod[exportName] ?? null;
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
  const practices = Array.isArray(doc.usage?.bestPractices) ? doc.usage.bestPractices : [];
  return [...features, ...practices]
    .map(entry =>
      typeof entry === 'string'
        ? entry
        : [entry?.title, entry?.text, entry?.description, entry?.do, entry?.dont]
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
 * @param {string} cwd
 * @returns {Promise<Candidate[]>}
 */
async function gatherIntegrationComponents(cwd) {
  const loadedIntegrations = await loadIntegrationsSafely(cwd);
  /** @type {Candidate[]} */
  const candidates = [];
  for (const integration of loadedIntegrations) {
    for (const rec of discoverIntegrationComponents(integration)) {
      const doc = await loadModuleDoc(rec.docPath);
      candidates.push({
        domain: 'component',
        name: rec.name,
        keywords: doc && Array.isArray(doc.keywords) ? doc.keywords : [],
        description: doc ? doc.usage?.description || doc.description || '' : '',
        guidance: guidanceFrom(doc),
        _import: rec.package,
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
  const [core, integrations] = await Promise.all([
    gatherCoreComponents(coreDir),
    gatherIntegrationComponents(cwd),
  ]);
  return [...core, ...integrations];
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
      const doc = await loadModuleDoc(docPath);
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
      _import: importPath,
    });
  }
  return candidates;
}

/**
 * Build doc-topic candidates: topic name + description + section prose.
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
  let entries;
  try {
    entries = (await loadDocsCatalog(cwd)).entries();
  } catch {
    return candidates;
  }
  for (const entry of entries) {
    let doc = null;
    try {
      doc = await loadTopicDoc(entry);
    } catch {
      // A topic that cannot be loaded is reported by the commands that own
      // integration issues; search just cannot index it.
    }
    let description = '';
    /** @type {string[]} */
    const prose = [];
    if (doc) {
      description = doc.description || '';
      for (const section of doc.sections || []) {
        if (section.title) prose.push(section.title);
        for (const block of section.content || []) {
          if (block.type === 'prose' && block.text) prose.push(block.text);
        }
      }
    }
    candidates.push({
      domain: 'doc',
      name: entry.name,
      keywords: [],
      description,
      prose,
      _title: doc?.title || entry.title || entry.name,
    });
  }
  return candidates;
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
    // Blocks ship an authored componentsUsed; page templates don't, so derive
    // them from the source. Category words (e.g. "Dashboard - Analytics") are
    // strong intent signal for pages, which otherwise only index on name +
    // description.
    //
    // Authored signal and derived signal are kept apart: componentsUsed and
    // category words are a deliberate statement of what the template is for,
    // while scraped JSX tags only say what it happens to render. See the
    // scoring table at the top of this file for why the derived set is capped.
    const keywords = Array.isArray(t.componentsUsed) ? [...t.componentsUsed] : [];
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
      if (t.category) keywords.push(...t.category.split(/[^A-Za-z0-9]+/).filter(Boolean));
    }
    return {
      domain: 'template',
      name: t.dirName,
      keywords,
      weakKeywords,
      description: t.description || '',
      _displayName: t.name,
      _kind: t.type, // 'page' | 'block'
    };
  });
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
    name: c.name,
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
      result = {
        ...base,
        title: c._title,
        command: `astryx docs ${c.name}`,
      };
      break;
    case 'template':
      result = {
        ...base,
        displayName: c._displayName,
        kind: c._kind,
        command: `astryx template ${c.name}`,
      };
      break;
    default:
      result = base;
  }
  return setResultCoverage(result, matchedTerms, queryTerms);
}

/**
 * Unified ranked search across components, hooks, docs, and templates.
 *
 * @param {string} query - Free-text search term.
 * @param {object} [options]
 * @param {string} [options.cwd]
 * @param {'component'|'hook'|'doc'|'template'} [options.type] - Restrict to one domain.
 * @param {number} [options.limit] - Max results (default 20).
 * @returns {Promise<{type: 'search', data: {query: string, matchCount: number, results: Array<object>}}>}
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
  if (
    limit != null &&
    (!Number.isInteger(limit) || limit <= 0)
  ) {
    throw new AstryxError(
      `Invalid limit "${limit}". Must be a positive integer.`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }

  const term = String(query).trim().toLowerCase();
  const tokens = tokenizeQuery(term);

  const coreDir = findCoreDir(cwd);
  if (!coreDir) {
    throw new AstryxError('Could not find @astryxdesign/core package');
  }

  // Gather candidates from each requested domain in parallel.
  /** @param {string} d */
  const wants = d => !type || type === d;
  const [components, hooks, docTopics, templates] = await Promise.all([
    wants('component') ? gatherComponents(coreDir, cwd) : [],
    wants('hook') ? gatherHooks(coreDir) : [],
    wants('doc') ? gatherDocs(cwd) : [],
    wants('template') ? gatherTemplates(cwd) : [],
  ]);

  const all = [...components, ...hooks, ...docTopics, ...templates];

  // Score every candidate on its own merits. The consumer groups results by
  // role (page / block / component) and takes the top of each, so there's no
  // cross-role competition to engineer — a target page only needs to be the
  // strongest PAGE, not outrank every component.
  const scored = [];
  for (const candidate of all) {
    const hit = scoreQuery(term, tokens, candidate);
    if (hit) scored.push(toResult(candidate, hit.score, hit.reason, hit.matched, hit.total));
  }

  // Sort by score desc, then domain (stable order), then name.
  /** @type {Record<string, number>} */
  const domainOrder = {component: 0, hook: 1, doc: 2, template: 3};
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

  return {
    type: 'search',
    data: {
      query: String(query).trim(),
      matchCount: scored.length,
      results: limited,
    },
  };
}
