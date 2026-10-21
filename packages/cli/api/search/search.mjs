// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the unified `search` command.
 *
 * Returns the same typed envelope { type, data } that `astryx --json search`
 * outputs. The CLI command handler is a thin wrapper around this function.
 *
 * `search(query)` is the single "I'm looking for X" entry point across all
 * content domains: components, hooks, docs topics, templates (page and
 * block), and themes. The adapter gathers every candidate (_adapter.mjs),
 * and search's tree (tree.mjs) picks the searcher that answers.
 * `searchCore(query)` is the lexical ranker alone (_lexical.mjs); `build`
 * reads it, so build's output does not move when search's tree does.
 */

import {withListingCache} from '../../foundation/fs/listing-cache.mjs';
import {
  cliPackageVersion,
  gatherCandidates,
  loadSearchData,
} from './_adapter.mjs';
import {rankLexical} from './_lexical.mjs';
import {checkSearchArgs} from './_result.mjs';
import {
  SEARCH_CATALOG_FORMAT,
  linkKey,
  rankCatalog,
} from './search-catalog.mjs';
import {linkSearchResponse} from '../component/_adapter.mjs';

// The domains a search covers (the command handler lists them), and what
// build reads from search: its word vocabulary, the components a search
// read, and the keywords of Core's components.
export {SEARCH_DOMAINS, STOPWORDS, tokenizeQuery} from './_query.mjs';
export {headingWithPhrase, titleInQuery} from './_titles.mjs';
export {scoreCandidate} from './_candidate-score.mjs';
export {scoreQuery} from './_score.mjs';
export {domainPriority} from './_priority.mjs';
export {compoundHit} from './_compound.mjs';
export {SYNONYMS} from './_synonyms.mjs';
export {sameWord, spellIdentifiers, stem} from './_words.mjs';
export {searchedComponents} from './_result.mjs';
export {componentKeywords} from './_adapter.mjs';

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
  checkSearchArgs(query, options);
  return withListingCache(
    async () =>
      /** @type {import('./search.type.mjs').SearchResponse} */ (
        await linkSearchResponse(
          /** @type {import('./search.type.mjs').SearchResponse} */ (
            await rankCatalog(query, options, {
              ...(await gatherCandidates(options)),
              data: loadSearchData(),
            })
          ),
          options.cwd ?? process.cwd(),
        )
      ),
  );
}

/**
 * The lexical ranker alone: keyword and fuzzy scoring of every candidate.
 * `build` ranks from it.
 *
 * @param {string} query
 * @param {{cwd?: string, type?: 'component'|'hook'|'doc'|'template'|'theme', limit?: number}} [options]
 * @returns {Promise<import('./search.type.mjs').SearchResponse>}
 */
export async function searchCore(query, options = {}) {
  checkSearchArgs(query, options);
  return withListingCache(async () =>
    linkSearchResponse(
      rankLexical(query, options, await gatherCandidates(options)),
      options.cwd ?? process.cwd(),
    ),
  );
}

/**
 * Everything `search()` ranks for one project, as plain JSON, so a site can
 * search with no disk: pass it to `searchCatalog()` (the CLI's browser
 * entry, `cli/search`), which answers as `search()` does from `cwd`.
 *
 * @param {{cwd?: string, type?: 'component'|'hook'|'doc'|'template'|'theme'}} [options]
 * @returns {Promise<import('./search-catalog.mjs').GatheredSearchCatalog>}
 */
export async function gatherSearchCatalog(options = {}) {
  checkSearchArgs('catalog', options);
  const cwd = options.cwd ?? process.cwd();
  return withListingCache(async () => {
    const gathered = await gatherCandidates(options);
    const position = new Map(gathered.all.map((c, i) => [c, i]));
    /** @type {Record<string, string>} */
    const linked = {};
    for (const c of gathered.all) {
      const {description} = c;
      if (
        c.domain !== 'component' ||
        typeof description !== 'string' ||
        !description.includes('{@link')
      ) {
        continue;
      }
      // Resolved as search() resolves a result's description, after ranking.
      const read = await linkSearchResponse(
        /** @type {import('./search.type.mjs').SearchResponse} */ ({
          type: 'search',
          data: {
            query: '',
            matchCount: 1,
            results: [{domain: 'component', package: c._package, description}],
          },
        }),
        cwd,
      );
      linked[linkKey(c._package, description)] = /** @type {string} */ (
        read.data.results[0].description
      );
    }
    return {
      format: SEARCH_CATALOG_FORMAT,
      version: cliPackageVersion(),
      type: options.type ?? null,
      all: gathered.all,
      components: gathered.components.map(
        c => /** @type {number} */ (position.get(c)),
      ),
      searchedComponents: gathered.searchedComponents,
      outside: gathered.outside,
      coreSkipped: gathered.coreSkipped,
      data: loadSearchData(),
      linked,
    };
  });
}
