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
 *    50  description mentions the term
 *    45  usage guidance mentions the term
 *    40  name Levenshtein distance 2
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
 */

import {pathToFileURL} from 'node:url';
import {findCoreDir} from '../../foundation/fs/paths.mjs';
import {resolveImportPath} from '../../foundation/discovery/component-discovery.mjs';
import {discoverHooks, findHookDoc} from '../../foundation/discovery/hook-discovery.mjs';
import {Project} from '../../foundation/config/project.mjs';
import {levenshteinDistance} from '../../foundation/text/string-utils.mjs';
import {discoverTemplates, extractComponents} from '../template/template.mjs';
import {loadDocsCatalog, loadTopicDoc} from '../docs/_adapter.mjs';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';

/**
 * A search candidate gathered from one content domain. Extra underscore-
 * prefixed fields carry domain-specific payload used only by {@link toResult}.
 * @typedef {object} Candidate
 * @property {'component'|'hook'|'doc'|'template'} domain
 * @property {string} name
 * @property {string[]} [keywords]
 * @property {string} [description]
 * @property {string[]} [prose]
 * @property {string} [_import]
 * @property {string} [_package]
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
 * 45 = a genuine name/keyword/description/guidance hit; below that is loose
 * Levenshtein fuzz that would otherwise turn gibberish queries into noise.
 *
 * It sits at the guidance tier rather than above it because build() sends
 * multi-word natural language almost exclusively, and guidance text is where
 * the reader's vocabulary usually lives — a gate above 45 would index that
 * text and then never count it.
 */
const MIN_TOKEN_SCORE = 45;

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
 * A scored hit, with how much of the query it actually covered. `matched` /
 * `total` are what let a consumer tell a candidate that answered the whole
 * question from one that caught a single incidental word.
 * @typedef {object} ScoredHit
 * @property {number} score
 * @property {string} reason
 * @property {number} matched query concepts this candidate hit
 * @property {number} total query concepts in play
 */

/**
 * @param {string} term - Lowercased full query.
 * @param {string[]} tokens - Content tokens from tokenizeQuery(term).
 * @param {Candidate} candidate
 * @returns {ScoredHit | null}
 */
export function scoreQuery(term, tokens, candidate) {
  const total = Math.max(tokens.length, 1);
  /**
   * A whole-phrase hit covers the whole query by definition — the entire term
   * matched one signal — so it is stamped at full coverage.
   * @param {{score: number, reason: string} | null} hit
   */
  const whole = hit => (hit ? {...hit, matched: total, total} : null);

  const full = whole(scoreCandidate(term, candidate));

  // 0–1 content tokens: keep whole-phrase fuzzy matching (typo tolerance for
  // single words), but if stopwords left exactly one DIFFERENT token (e.g.
  // "pricing page" → "pricing"), score that token too and take the stronger.
  if (tokens.length <= 1) {
    const single = tokens.length === 1 ? whole(bestForToken(tokens[0], candidate)) : null;
    if (full && (!single || full.score >= single.score)) return full;
    return single;
  }

  // Multi-word natural language: score each content token, counting only
  // strong hits, then reward coverage so candidates matching more terms win.
  let sum = 0;
  let matched = 0;
  /** @type {string[]} */
  const hitTerms = [];
  for (const tok of tokens) {
    const h = bestForToken(tok, candidate);
    if (h && h.score >= MIN_TOKEN_SCORE) {
      sum += h.score;
      matched++;
      hitTerms.push(tok);
    }
  }
  if (matched === 0) return full;

  // Reward the AVERAGE strength of the concepts that matched (not divided by
  // total query length — that penalizes verbose / low-fidelity prompts), plus
  // a bonus per additional matched concept and a coverage term. A candidate
  // that matches several of the query's concepts beats one matching a single
  // incidental word.
  const avgMatched = sum / matched;
  const coverage = matched / tokens.length;
  const tokenScore = Math.round(avgMatched + Math.min(matched - 1, 3) * 12 + coverage * 15);

  if (full && full.score >= tokenScore) return full;
  return {
    score: tokenScore,
    reason: `matches ${matched}/${tokens.length} terms: ${hitTerms.join(', ')}`,
    matched,
    total: tokens.length,
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
 * @param {string[]} [candidate.keywords]
 * @param {string} [candidate.description]
 * @param {string[]} [candidate.prose] - Extra free-text blobs (doc section text, best practices).
 * @returns {{score: number, reason: string} | null}
 */
export function scoreCandidate(term, {name, keywords = [], description = '', prose = []}) {
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

  // ── Prose / description signals (stem-tolerant whole word) ──────
  // Match the term's stem as a whole word, tolerating plural/gerund suffixes
  // so "chart" matches "charts" and "filter" matches "filtering".
  //
  // Both tiers are considered; `consider` keeps the strongest. Guidance is
  // checked even when the description already hit, because the two are
  // separate claims and the description's higher tier wins on its own.
  if (term.length >= 3) {
    const root = stem(term);
    const escaped = root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${escaped}(s|es|ing|ed|ies)?\\b`);
    if (description && re.test(description.toLowerCase())) {
      consider(50, `description mentions "${term}"`);
    }
    for (const blob of prose) {
      if (blob && re.test(String(blob).toLowerCase())) {
        consider(45, `guidance mentions "${term}"`);
        break;
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
 * Build component candidates: name + keywords + usage/description + usage
 * guidance, for Core AND every configured integration.
 *
 * Component records come from `Project`, which is what makes an integration's
 * components searchable at all. `search` used to call `discoverComponents(coreDir)`
 * directly, so a package listed in `astryx.config.mjs` was visible to
 * `component` and `template` and invisible to the one command whose job is
 * finding things — the CLI's own search command even loaded a Project already,
 * purely to print integration warnings next to results that could not contain
 * an integration's components.
 *
 * `prose` carries features and best-practice text. It is indexed because the
 * reader's vocabulary usually lives there rather than in the one-line
 * description — `Banner` calls itself "a persistent message" and only its
 * guidance names "form errors, system updates, maintenance notices" — and it
 * is scored below the description tier because a passing mention in advice is
 * weaker evidence than a component's own summary.
 *
 * @param {Project | null} project
 * @param {string | null} coreDir
 * @returns {Promise<Candidate[]>}
 */
async function gatherComponents(project, coreDir) {
  /** @type {Array<{name: string, package: string, docPath: string|null}>} */
  let records = [];
  if (project) {
    try {
      records = await project.components();
    } catch {
      // A discovery failure contributes no components; `doctor` owns reporting.
      return [];
    }
  }

  /** @type {Candidate[]} */
  const candidates = [];
  for (const record of records) {
    /** @type {string[]} */
    let keywords = [];
    let description = '';
    /** @type {string[]} */
    let prose = [];
    /** @type {string | undefined} */
    let importPath = undefined;

    if (record.docPath) {
      const doc = await loadModuleDoc(record.docPath);
      if (doc) {
        keywords = Array.isArray(doc.keywords) ? doc.keywords : [];
        description = doc.usage?.description || doc.description || '';
        prose = [
          ...(Array.isArray(doc.features) ? doc.features : []),
          ...(Array.isArray(doc.usage?.bestPractices) ? doc.usage.bestPractices : []).map(
            (/** @type {any} */ practice) =>
              typeof practice === 'string' ? practice : (practice?.description ?? ''),
          ),
        ].filter(Boolean);
        // An integration's doc declares its own import specifier; Core's is
        // derived from the package layout.
        if (typeof doc.import === 'string') importPath = doc.import;
      }
    }
    if (importPath == null && coreDir) {
      importPath = resolveImportPath(coreDir, record.name);
    }

    candidates.push({
      domain: 'component',
      name: record.name,
      keywords,
      description,
      prose,
      _import: importPath,
      _package: record.package,
    });
  }
  return candidates;
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
    /** @type {string[]} */
    let prose = [];
    let importPath = '@astryxdesign/core/hooks';
    if (docPath) {
      const doc = await loadModuleDoc(docPath);
      if (doc) {
        keywords = Array.isArray(doc.keywords) ? doc.keywords : [];
        description = doc.usage?.description || doc.description || '';
        prose = [
          ...(Array.isArray(doc.features) ? doc.features : []),
          ...(Array.isArray(doc.usage?.bestPractices) ? doc.usage.bestPractices : []).map(
            (/** @type {any} */ practice) =>
              typeof practice === 'string' ? practice : (practice?.description ?? ''),
          ),
        ].filter(Boolean);
        importPath = doc.importPath || importPath;
      }
    }
    candidates.push({
      domain: 'hook',
      name: hookName,
      keywords,
      description,
      prose,
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
 * @param {Project | null} [project] already-loaded project, to avoid re-walking integrations
 * @returns {Promise<Candidate[]>}
 */
async function gatherDocs(cwd, project = null) {
  /** @type {Candidate[]} */
  const candidates = [];
  let entries;
  try {
    entries = (await (project ? project.docs() : loadDocsCatalog(cwd))).entries();
  } catch {
    // `loadDocsCatalog` falls back to the built-in topics when a project's
    // catalog cannot be built; take the same path rather than indexing nothing.
    try {
      entries = (await loadDocsCatalog(cwd)).entries();
    } catch {
      return candidates;
    }
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
    // Blocks ship componentsUsed; page templates don't, so derive them from the
    // source. Category words (e.g. "Dashboard - Analytics") are strong intent
    // signal for pages, which otherwise only index on name + description.
    let keywords = Array.isArray(t.componentsUsed) ? [...t.componentsUsed] : [];
    if (t.type === 'page') {
      if (t.filePath) {
        try {
          keywords = keywords.concat(extractComponents(t.filePath));
        } catch {
          // Best-effort: skip keyword enrichment if the source can't be read.
        }
      }
      if (t.category) keywords = keywords.concat(t.category.split(/[^A-Za-z0-9]+/).filter(Boolean));
    }
    return {
      domain: 'template',
      name: t.dirName,
      keywords,
      description: t.description || '',
      _displayName: t.name,
      _kind: t.type, // 'page' | 'block'
    };
  });
}

/**
 * Map a scored candidate to its public, actionable result shape. Each result
 * carries enough to act on it: the domain, name, a one-line description, how
 * much of the query it covered, and the follow-up command (and import path
 * where relevant).
 *
 * @param {Candidate} c - candidate
 * @param {ScoredHit} hit
 */
function toResult(c, hit) {
  const base = {
    domain: c.domain,
    name: c.name,
    score: hit.score,
    reason: hit.reason,
    description: c.description || '',
    // Coverage, structured. The reason string has always said "matches 1/3
    // terms"; a consumer deciding whether a hit is worth acting on should not
    // have to parse English back out of it.
    matchedTerms: hit.matched,
    queryTerms: hit.total,
  };
  switch (c.domain) {
    case 'component':
      return {
        ...base,
        import: c._import,
        package: c._package,
        command: `astryx component ${c.name}`,
      };
    case 'hook':
      return {
        ...base,
        import: c._import,
        command: `astryx hook ${c.name}`,
      };
    case 'doc':
      return {
        ...base,
        title: c._title,
        command: `astryx docs ${c.name}`,
      };
    case 'template':
      return {
        ...base,
        displayName: c._displayName,
        kind: c._kind,
        command: `astryx template ${c.name}`,
      };
    default:
      return base;
  }
}

/**
 * Unified ranked search across components, hooks, docs, and templates.
 *
 * @param {string} query - Free-text search term.
 * @param {object} [options]
 * @param {string} [options.cwd]
 * @param {'component'|'hook'|'doc'|'template'} [options.type] - Restrict to one domain.
 * @param {number} [options.limit] - Max results (default 20).
 * @returns {Promise<{type: 'search', data: {query: string, results: Array<object>}}>}
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

  // One Project for the whole search: it resolves the config and every
  // integration package, and both the component and doc gatherers need it.
  // Loading it per gatherer would repeat that walk on every query, which the
  // latency-sensitive callers (build, and any server holding the API in
  // process) pay for directly.
  let project = null;
  try {
    project = await Project.load(cwd);
  } catch {
    // No config, or a config that will not load: Core-only search still works.
  }

  // Gather candidates from each requested domain in parallel.
  /** @param {string} d */
  const wants = d => !type || type === d;
  const [components, hooks, docTopics, templates] = await Promise.all([
    wants('component') ? gatherComponents(project, coreDir) : [],
    wants('hook') ? gatherHooks(coreDir) : [],
    wants('doc') ? gatherDocs(cwd, project) : [],
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
    if (hit) scored.push(toResult(candidate, hit));
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

  const limited = scored.slice(0, limit);

  return {type: 'search', data: {query: String(query).trim(), results: limited}};
}
