// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Gotchas as structured data — the single source for setup failure modes.
 *
 * The gotcha list lives in `packages/cli/assets/gotchas.json` (published
 * with the CLI). This module loads it, validates every entry against the
 * schema, and renders the cheat-sheet lines. `generateCompressedIndex`
 * (agent-docs.mjs) drives its GOTCHAS section from here instead of
 * hand-writing error-preventers inline; `init`, `build`, and `doctor` can
 * consume the same data next.
 *
 * @input cliRoot: the CLI package root (assets/gotchas.json is read from it)
 * @output validated gotcha entries, or rendered one-line strings
 * @position foundation/agent-docs — beside the agent cheat-sheet generator
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

/** @type {readonly ['high', 'medium', 'low']} */
export const GOTCHA_SEVERITIES = ['high', 'medium', 'low'];

/**
 * Validate a parsed gotchas.json payload. Returns the entry list, or throws
 * an Error naming every problem so a bad edit fails loudly at generation
 * time instead of shipping a silently wrong cheat sheet.
 *
 * @param {unknown} data
 * @returns {Array<{id: string, title: string, trigger: string, fix: string, severity: 'high'|'medium'|'low'}>}
 */
export function validateGotchas(data) {
  const problems = [];
  if (data == null || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('gotchas.json: expected an object with version + gotchas.');
  }
  const {version, gotchas} = /** @type {{version?: unknown, gotchas?: unknown}} */ (data);
  if (!Number.isInteger(version) || /** @type {number} */ (version) < 1) {
    problems.push('version must be an integer >= 1');
  }
  if (!Array.isArray(gotchas) || gotchas.length === 0) {
    problems.push('gotchas must be a non-empty array');
  }
  /** @type {Array<{id: string, title: string, trigger: string, fix: string, severity: 'high'|'medium'|'low'}>} */
  const entries = [];
  const seen = new Set();
  for (const [index, entry] of (Array.isArray(gotchas) ? gotchas : []).entries()) {
    const where = `gotchas[${index}]`;
    if (entry == null || typeof entry !== 'object' || Array.isArray(entry)) {
      problems.push(`${where}: expected an object`);
      continue;
    }
    const {id, title, trigger, fix, severity} =
      /** @type {{id?: unknown, title?: unknown, trigger?: unknown, fix?: unknown, severity?: unknown}} */ (entry);
    if (typeof id !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
      problems.push(`${where}.id: expected kebab-case, got ${JSON.stringify(id)}`);
    } else if (seen.has(id)) {
      problems.push(`${where}.id: duplicate id "${id}"`);
    } else {
      seen.add(id);
    }
    for (const field of ['title', 'trigger', 'fix']) {
      if (typeof entry[field] !== 'string' || entry[field].length === 0) {
        problems.push(`${where}.${field}: expected a non-empty string`);
      }
    }
    if (!GOTCHA_SEVERITIES.includes(/** @type {string} */ (severity))) {
      problems.push(
        `${where}.severity: expected one of ${GOTCHA_SEVERITIES.join('|')}, got ${JSON.stringify(severity)}`,
      );
    }
    if (
      typeof id === 'string' &&
      typeof title === 'string' &&
      title.length > 0 &&
      typeof trigger === 'string' &&
      trigger.length > 0 &&
      typeof fix === 'string' &&
      fix.length > 0 &&
      GOTCHA_SEVERITIES.includes(/** @type {string} */ (severity))
    ) {
      entries.push({id, title, trigger, fix, severity: /** @type {'high'|'medium'|'low'} */ (severity)});
    }
  }
  if (problems.length > 0) {
    throw new Error(`gotchas.json is invalid:\n- ${problems.join('\n- ')}`);
  }
  return entries;
}

/**
 * Load and validate the gotcha list from the CLI package assets.
 *
 * @param {string} cliRoot
 * @returns {Array<{id: string, title: string, trigger: string, fix: string, severity: 'high'|'medium'|'low'}>}
 */
export function loadGotchas(cliRoot) {
  const file = path.join(cliRoot, 'assets', 'gotchas.json');
  return validateGotchas(JSON.parse(fs.readFileSync(file, 'utf-8')));
}

/** Severity rank for cheat-sheet ordering (highest first). */
const SEVERITY_RANK = {high: 0, medium: 1, low: 2};

/**
 * Render one terse cheat-sheet line per gotcha, highest severity first.
 *
 * @param {Array<{id: string, title: string, trigger: string, fix: string, severity: 'high'|'medium'|'low'}>} gotchas
 * @returns {string[]}
 */
export function renderGotchaLines(gotchas) {
  return [...gotchas]
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])
    .map(g => `- ${g.title}: ${g.fix}`);
}
