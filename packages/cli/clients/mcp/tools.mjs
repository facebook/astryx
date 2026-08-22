// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The MCP tool set: `search` and `get`, over `api/`.
 *
 * The surface is deliberately the SAME two tools the hosted server ships
 * (PR #2513), so this client re-binds an already-shipped contract to a new data
 * source instead of proposing a new tool surface.
 *
 * The history is easy to misread, so state it precisely: the #2306 bake-off was
 * won by CLI + search (9.6/10), not by any MCP variant, and its "What We're
 * Shipping" section recommended the SIX-tool server (#2228). What happened next
 * went the other way — #2228 was closed unmerged and #2513 shipped the two-tool
 * hybrid (9.3/10). Two tools is therefore what exists today; it is not what the
 * bake-off crowned, and picking it here is a deference to the shipped contract,
 * not a claim that the six-tool shape was judged wrong.
 *
 * Every answer is resolved through `api/` against the caller's `cwd`, so it
 * reflects the version, theme and integrations actually installed.
 *
 * @input tool arguments from `tools/call`
 * @output plain data, serialized as MCP text content by the handler
 * @position packages/cli/clients/mcp — tool layer, over api/
 */

import {component, docs, hook, search, template} from '../../api/index.mjs';
import {readInstalledCoreVersion} from './project-context.mjs';

/** @typedef {import('../../api/search/search.type.mjs').SearchResultEntry} SearchResultEntry */

/**
 * Fetch one artifact once its domain is known.
 *
 * Dispatching on a KNOWN domain matters. `component()` and `hook()` are
 * separate resolvers, but both are lenient: `component()` runs a score-threshold
 * fuzzy search, so `component('spacing')` cheerfully returns the Stack
 * component, and `hook('Button')` resolves too. Only `docs()` and `template()`
 * are strict. So a try-each-in-turn chain would hand the model a confidently
 * wrong artifact, which is worse than a miss.
 * @type {Record<string, (name: string, section: string|undefined, cwd: string) => Promise<{type: string, data: unknown}>>}
 */
const FETCH_BY_DOMAIN = {
  component: (name, _section, cwd) => component(name, {cwd}),
  hook: (name, _section, cwd) => hook(name, {cwd}),
  doc: (name, section) => docs(name, section),
  template: (name, _section, cwd) => template(name, {cwd, show: true}),
};

/**
 * Build the tool set bound to one project directory.
 * @param {{cwd: string}} options
 * @returns {import('./server.mjs').McpTool[]}
 */
export function createTools({cwd}) {
  return [
    {
      name: 'search',
      description:
        'Search the Astryx design system installed in this project: components, ' +
        'hooks, doc topics and page templates, in one ranked list. Returns brief ' +
        'results; call get(name) for full detail.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'What you are looking for, in natural language (e.g. "success message", "sortable table").',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return (default 20).',
          },
        },
        required: ['query'],
      },
      run: async args => {
        const query = args.query;
        if (typeof query !== 'string' || query.trim() === '') {
          throw new Error('search requires a non-empty "query" string.');
        }
        const limit = typeof args.limit === 'number' ? args.limit : undefined;
        // Forward any provided number — 0 and NaN included — so the api's own
        // "positive integer" validation answers rather than a silent default.
        const {data} = await search(query, {
          cwd,
          ...(limit !== undefined ? {limit} : {}),
        });
        return data;
      },
    },
    {
      name: 'get',
      description:
        'Get full detail for one Astryx component, hook, doc topic or template ' +
        'by name, as installed in this project. Use search(query) first if the ' +
        'exact name is not known.',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description:
              'Component name (e.g. "Button"), hook (e.g. "useToast"), doc topic (e.g. "spacing"), or template slug.',
          },
          section: {
            type: 'string',
            description:
              'For doc topics only: return just this section, to keep large topics inside the context budget.',
          },
        },
        required: ['name'],
      },
      run: async args => {
        const name = args.name;
        if (typeof name !== 'string' || name.trim() === '') {
          throw new Error('get requires a non-empty "name" string.');
        }
        const section =
          typeof args.section === 'string' ? args.section : undefined;

        // `search` is the project's own classifier: every hit is tagged with
        // its domain, so an exact name match tells us what `name` IS before we
        // fetch it.
        const {data} = await search(name, {cwd});
        const results = /** @type {SearchResultEntry[]} */ (data.results ?? []);
        const target = results.find(
          r => r.name.toLowerCase() === name.toLowerCase(),
        );

        if (!target) {
          const near = results
            .slice(0, 5)
            .map(r => r.name)
            .join(', ');
          throw new Error(
            `No Astryx component, hook, doc topic or template named "${name}" ` +
              `is available in this project.` +
              (near ? ` Closest matches: ${near}.` : ''),
          );
        }

        const fetch = FETCH_BY_DOMAIN[target.domain];
        if (!fetch) {
          throw new Error(
            `"${name}" resolved to an unsupported domain: ${target.domain}.`,
          );
        }

        // Fetch by the hit's canonical name, not the caller's: the match above
        // is case-insensitive, but template() resolves by exact dirName, so
        // the caller's casing could 404 on an artifact search just confirmed.
        const response = await fetch(target.name, section, cwd);
        return {
          kind: target.domain,
          name: target.name,
          coreVersion: readInstalledCoreVersion(cwd),
          type: response.type,
          data: response.data,
        };
      },
    },
  ];
}
