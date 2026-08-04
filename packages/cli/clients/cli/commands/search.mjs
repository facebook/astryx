// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file search command — unified ranked search across all content domains.
 *
 * One "I'm looking for X" entry point spanning components, hooks, docs topics,
 * and templates (page + block). Results are ranked by relevance and tagged
 * with their domain, with a follow-up command so the user knows what to run
 * next.
 *
 * Usage:
 *   astryx search button                 Ranked results across all domains
 *   astryx search modal --type component Filter to a single domain
 *   astryx search forms --limit 5        Cap the result count
 *   astryx search button --verbose       Verbose (include import / reason)
 *   astryx search button --json          Typed JSON envelope
 */

import {getCliInvocation, formatCliCommand} from '../../../foundation/env/package-manager.mjs';
import {jsonOut} from '../../../foundation/response/json.mjs';
import {emit, section, text, records} from '../formatters/index.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {search as searchApi, SEARCH_DOMAINS} from '../../../api/search/search.mjs';

/**
 * @param {import('commander').Command} program
 */
export function registerSearch(program) {
  program
    .command('search <query>')
    .description('Search components, hooks, docs, and templates in one ranked list')
    .option('--type <domain>', `Filter to one domain (${SEARCH_DOMAINS.join('|')})`)
    .option('--limit <n>', 'Max number of results (default 20)')
    .option('--verbose', 'Verbose output (include import paths and match reason)')
    .action(async (/** @type {string} */ query, /** @type {{type?: import('../../../api/search/search.type.mjs').SearchDomain, limit?: string, verbose?: boolean}} */ options) => {
      const json = program.opts().json || false;

      // Parse --limit to a number; the API validates it (positive integer) and
      // throws ERR_INVALID_ARGUMENT, so we pass NaN through rather than
      // pre-rejecting with a generic code here.
      const limit =
        options.limit != null ? Number.parseInt(options.limit, 10) : 20;

      /** @type {import('../../../api/search/search.type.mjs').SearchResponse} */
      let result;
      try {
        result = /** @type {import('../../../api/search/search.type.mjs').SearchResponse} */ (
          await searchApi(query, {
            cwd: process.cwd(),
            type: options.type,
            limit,
          })
        );
      } catch (e) {
        const err = /** @type {import('../../../api/error.mjs').AstryxError} */ (e);
        cliError(err.message, {suggestions: err.suggestions, code: err.code});
        return;
      }

      if (json) return jsonOut(result);

      // ── Text output ──────────────────────────────────────────────
      const run = getCliInvocation();
      const {query: q, results} = result.data;

      // No matches is a valid, successful outcome — clean message, exit 0.
      if (results.length === 0) {
        emit(
          text(`No results for "${q}".`),
          text(`Try a broader term, or browse: ${run} component --list`),
        );
        return;
      }

      // The text view is just a projection of the JSON: one record per result,
      // fields in a fixed order (missing ones skipped), command prefixed for the
      // caller's package manager. Ranked order is preserved (best match first).
      const fields = options.verbose
        ? ['name', 'domain', 'displayName', 'score', 'reason', 'import', 'description', 'command']
        : ['name', 'domain', 'displayName', 'import', 'description', 'command'];

      emit(
        section(`Results for "${q}" (${results.length})`),
        records(results, {fields, format: {command: formatCliCommand}}),
      );
    });
}

// Re-export the API for external consumers.
export {search, SEARCH_DOMAINS} from '../../../api/search/search.mjs';
