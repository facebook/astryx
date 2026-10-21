// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file GET /api/search?q=<query>: `astryx search <query>`, run by the site.
 * @input The query, as `astryx search` takes it.
 * @output The CLI's search response, each result with the site path it opens.
 * @position Called by the search panel (lib/cliSearchSource.ts).
 *
 * The site's search is the CLI's: this calls `search()` from
 * `@astryxdesign/cli/api`, the function behind `astryx search --json`, in this
 * site's project, so the panel gives the CLI's results in the CLI's order and
 * every change to the CLI's search reaches the site. Nothing here ranks.
 */

import type * as CliApi from '@astryxdesign/cli/api';
import {searchResultHref} from '../../../lib/searchLinks.mjs';
import type {SearchLinkTables} from '../../../lib/searchLinks.mjs';
import links from '../../../generated/searchLinks.json';
import admitted from '../../../generated/integrationPackages.json';
import docsiteConfig from '../../../../astryx.config.mjs';

/** Packages this build documents: Core, the CLI's docs and themes, and the
 *  integrations it admits (canary: all configured; latest: stable ones). */
const DOCUMENTED = new Set([
  '@astryxdesign/core',
  '@astryxdesign/cli',
  ...admitted.packages,
]);

/**
 * The CLI's API, loaded by Node at run time rather than bundled: the CLI
 * reads its docs, templates and the installed packages from disk, as
 * `astryx search` does (next.config.mjs traces those files in).
 */
let cli: Promise<typeof CliApi> | null = null;
const loadCli = () =>
  (cli ??= import(/* webpackIgnore: true */ '@astryxdesign/cli/api'));

/** Whether this build leaves out an integration the site's project has. */
const FILTERED = docsiteConfig.integrations.some(
  (name: string) => !DOCUMENTED.has(name),
);

/** How many results the panel shows: `astryx search`'s default. */
const LIMIT = 20;

/** Longest query the API accepts. */
const MAX_QUERY = 200;

export async function GET(request: Request): Promise<Response> {
  const query = new URL(request.url).searchParams.get('q')?.trim() ?? '';
  if (query === '' || query.length > MAX_QUERY) {
    return Response.json(
      {error: `q must be 1 to ${MAX_QUERY} characters`},
      {status: 400},
    );
  }
  const {search} = await loadCli();
  // When this build leaves out an integration, ask for more and drop its
  // results before cutting to the panel's 20; otherwise this is exactly
  // `astryx search <query>`.
  const response = await search(query, {
    cwd: process.cwd(),
    ...(FILTERED ? {limit: LIMIT * 4} : {}),
  });
  const results = response.data.results
    .filter(result => result.package == null || DOCUMENTED.has(result.package))
    .slice(0, LIMIT)
    .map(result => ({
      ...result,
      href: searchResultHref(result, links as SearchLinkTables),
    }));
  return Response.json(
    {...response, data: {...response.data, results}},
    {
      // A query's answer changes only when the site is rebuilt.
      headers: {'Cache-Control': 'public, max-age=300, s-maxage=86400'},
    },
  );
}
