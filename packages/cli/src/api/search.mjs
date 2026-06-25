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
import {discoverTemplates} from './template.mjs';
import {AstryxError} from './error.mjs';

const DOCS_DIR = path.join(CLI_ROOT, 'docs');

/** Valid domain filters for `--type`. */
export const SEARCH_DOMAINS = ['component', 'hook', 'doc', 'template'];

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

  // ── Prose / description signals (whole-word boundary) ───────────
  if (term.length >= 3) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${escaped}\\b`);
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
  return templates.map(t => ({
    domain: 'template',
    name: t.dirName,
    keywords: Array.isArray(t.componentsUsed) ? t.componentsUsed : [],
    description: t.description || '',
    _displayName: t.name,
    _kind: t.type, // 'page' | 'block'
  }));
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

  const scored = [];
  for (const candidate of all) {
    const hit = scoreCandidate(term, candidate);
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
