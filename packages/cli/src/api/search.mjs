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
 *    50  description / prose mentions the term
 *    40  name Levenshtein distance 2
 *    30  keyword Levenshtein distance 2
 *    20  name Levenshtein distance 3
 *
 * Name + keyword signals always outweigh description/prose, so an exact match
 * sorts above an incidental mention.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import {findCoreDir, CLI_ROOT} from '../utils/paths.mjs';
import {
  discoverComponents,
  findComponentReadme,
  resolveImportPath,
} from '../lib/component-discovery.mjs';
import {discoverHooks, findHookDoc} from '../lib/hook-discovery.mjs';
import {levenshteinDistance} from '../lib/string-utils.mjs';
import {discoverTemplates, extractComponents} from './template.mjs';
import {AstryxError} from './error.mjs';

const DOCS_DIR = path.join(CLI_ROOT, 'docs');

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
  const idx = new Map();
  const add = (a, b) => {
    if (!idx.has(a)) idx.set(a, new Set());
    idx.get(a).add(b);
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
 */
const MIN_TOKEN_SCORE = 50;

/**
 * Best score for a token against a candidate, fanning out through synonyms
 * (synonym hits are discounted so a direct hit always wins).
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

export function scoreQuery(term, tokens, candidate) {
  const full = scoreCandidate(term, candidate);

  // 0–1 content tokens: keep whole-phrase fuzzy matching (typo tolerance for
  // single words), but if stopwords left exactly one DIFFERENT token (e.g.
  // "pricing page" → "pricing"), score that token too and take the stronger.
  if (tokens.length <= 1) {
    const single = tokens.length === 1 ? bestForToken(tokens[0], candidate) : null;
    if (full && (!single || full.score >= single.score)) return full;
    return single;
  }

  // Multi-word natural language: score each content token, counting only
  // strong hits, then reward coverage so candidates matching more terms win.
  let sum = 0;
  let matched = 0;
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
  if (term.length >= 3) {
    const root = stem(term);
    const escaped = root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${escaped}(s|es|ing|ed|ies)?\\b`);
    if (description && re.test(description.toLowerCase())) {
      consider(50, `description mentions "${term}"`);
    } else {
      for (const blob of prose) {
        if (blob && re.test(String(blob).toLowerCase())) {
          consider(50, `docs mention "${term}"`);
          break;
        }
      }
    }
  }

  return best > 0 ? {score: best, reason} : null;
}

/** Load a doc module's `docs`/`doc` export, swallowing errors. */
async function loadModuleDoc(docPath, exportName = 'docs') {
  try {
    const mod = await import(pathToFileURL(docPath).href);
    return mod[exportName] ?? null;
  } catch {
    return null;
  }
}

/**
 * Build component candidates: name + keywords + usage/description from the
 * component's .doc.mjs.
 * @param {string} coreDir
 */
async function gatherComponents(coreDir) {
  const grouped = discoverComponents(coreDir);
  const names = Object.values(grouped).flat();
  const candidates = [];
  for (const comp of names) {
    const readme = findComponentReadme(coreDir, comp);
    let keywords = [];
    let description = '';
    if (readme && readme.endsWith('.doc.mjs')) {
      const doc = await loadModuleDoc(readme);
      if (doc) {
        keywords = Array.isArray(doc.keywords) ? doc.keywords : [];
        description = doc.usage?.description || doc.description || '';
      }
    }
    candidates.push({
      domain: 'component',
      name: comp,
      keywords,
      description,
      _import: resolveImportPath(coreDir, comp),
    });
  }
  return candidates;
}

/**
 * Build hook candidates: name + keywords + usage/description from the hook's
 * .doc.mjs.
 * @param {string} coreDir
 */
async function gatherHooks(coreDir) {
  const grouped = discoverHooks(coreDir);
  const names = Object.values(grouped).flat();
  const candidates = [];
  for (const hookName of names) {
    const docPath = findHookDoc(coreDir, hookName);
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

/** Build doc-topic candidates: topic name + description + section prose. */
async function gatherDocs() {
  if (!fs.existsSync(DOCS_DIR)) return [];
  const candidates = [];
  for (const file of fs.readdirSync(DOCS_DIR)) {
    const match = file.match(/^([\w-]+)\.doc\.mjs$/);
    if (!match) continue;
    const topic = match[1];
    const doc = await loadModuleDoc(path.join(DOCS_DIR, file));
    let description = '';
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
      name: topic,
      keywords: [],
      description,
      prose,
      _title: doc?.title || topic,
    });
  }
  return candidates;
}

/** Build template candidates (page + block) from the template discovery API. */
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
 * carries enough to act on it: the domain, name, a one-line description, and
 * the follow-up command (and import path where relevant).
 *
 * @param {object} c - candidate
 * @param {number} score
 * @param {string} reason
 */
function toResult(c, score, reason) {
  const base = {
    domain: c.domain,
    name: c.name,
    score,
    reason,
    description: c.description || '',
  };
  switch (c.domain) {
    case 'component':
      return {
        ...base,
        import: c._import,
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
    throw new AstryxError('A search query is required', [
      {name: 'astryx search button', reason: 'example'},
    ]);
  }

  if (type && !SEARCH_DOMAINS.includes(type)) {
    throw new AstryxError(
      `Unknown --type "${type}"`,
      SEARCH_DOMAINS.map(d => ({name: d, reason: 'valid type'})),
    );
  }

  const term = String(query).trim().toLowerCase();
  const tokens = tokenizeQuery(term);

  const coreDir = findCoreDir(cwd);
  if (!coreDir) {
    throw new AstryxError('Could not find @astryxdesign/core package');
  }

  // Gather candidates from each requested domain in parallel.
  const wants = d => !type || type === d;
  const [components, hooks, docTopics, templates] = await Promise.all([
    wants('component') ? gatherComponents(coreDir) : [],
    wants('hook') ? gatherHooks(coreDir) : [],
    wants('doc') ? gatherDocs() : [],
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
    if (hit) scored.push(toResult(candidate, hit.score, hit.reason));
  }

  // Sort by score desc, then domain (stable order), then name.
  const domainOrder = {component: 0, hook: 1, doc: 2, template: 3};
  scored.sort(
    (a, b) =>
      b.score - a.score ||
      (domainOrder[a.domain] ?? 9) - (domainOrder[b.domain] ?? 9) ||
      a.name.localeCompare(b.name),
  );

  const limited = limit > 0 ? scored.slice(0, limit) : scored;

  return {type: 'search', data: {query: String(query).trim(), results: limited}};
}
