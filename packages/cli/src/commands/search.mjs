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
 *   astryx search button --detail        Verbose (include import / reason)
 *   astryx search button --json          Typed JSON envelope
 */

import {getRunPrefix} from '../utils/package-manager.mjs';
import {jsonOut, humanLog} from '../lib/json.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {search as searchApi, SEARCH_DOMAINS} from '../api/search.mjs';

const DOMAIN_LABEL = {
  component: 'component',
  hook: 'hook',
  doc: 'docs',
  template: 'template',
};

export function registerSearch(program) {
  program
    .command('search <query>')
    .description('Search components, hooks, docs, and templates in one ranked list')
    .option('--type <domain>', `Filter to one domain (${SEARCH_DOMAINS.join('|')})`)
    .option('--limit <n>', 'Max number of results (default 20)')
    .option('--detail', 'Verbose output (include import paths and match reason)')
    .action(async (query, options) => {
      const json = program.opts().json || false;

      let limit = 20;
      if (options.limit != null) {
        const parsed = Number.parseInt(options.limit, 10);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          cliError(`Invalid --limit value "${options.limit}". Must be a positive integer.`);
          return;
        }
        limit = parsed;
      }

      let result;
      try {
        result = await searchApi(query, {
          cwd: process.cwd(),
          type: options.type,
          limit,
        });
      } catch (e) {
        cliError(e.message, {suggestions: e.suggestions});
        return;
      }

      if (json) return jsonOut(result.type, result.data);

      // ── Text output ──────────────────────────────────────────────
      const run = getRunPrefix();
      const {query: q, results} = result.data;

      // No matches is a valid, successful outcome — clean message, exit 0.
      if (results.length === 0) {
        humanLog('');
        humanLog(`No results for "${q}".`);
        humanLog('');
        humanLog(`Try a broader term, or browse: ${run} astryx component --list`);
        humanLog('');
        return;
      }

      humanLog('');
      humanLog(`Results for "${q}" (${results.length}):`);
      humanLog('');
      for (const r of results) {
        const tag = `[${DOMAIN_LABEL[r.domain] || r.domain}]`.padEnd(12);
        const display = r.domain === 'template' && r.displayName ? r.displayName : r.name;
        humanLog(`  ${tag} ${display}`);
        if (r.description) {
          humanLog(`               ${r.description}`);
        }
        humanLog(`               → ${run} ${r.command}`);
        if (options.detail) {
          if (r.import) humanLog(`               import: ${r.import}`);
          humanLog(`               match: ${r.reason} (score ${r.score})`);
        }
        humanLog('');
      }
    });
}

// Re-export the API for external consumers.
export {search, SEARCH_DOMAINS} from '../api/search.mjs';
