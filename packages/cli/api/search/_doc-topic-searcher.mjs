// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The doc-topic searcher: a query that names a doc topic (its route, the
 * route's last segment, or the topic's own title, dashes and spaces read alike
 * and whatever the plural) is answered with that topic and its own sections
 * first, then every other lexical match in the lexical order. Nothing is added
 * or dropped, and every result keeps its lexical score and reason
 * (spec:AST-083 FR1); the topic's sections are the one move allowed across a
 * kind (FR2's exception).
 * @input {query, options} and the gathered catalog
 * @output the search response, the lexical response's shape and size
 * @position api/search; tree.mjs's root sends a query here before the
 *   classifier when namedTopic finds the topic
 */

import {routeKit} from '../../foundation/route/route.mjs';
import {rankLexical} from './_lexical.mjs';
import {samePhrase} from './_query.mjs';
import {searchedComponentsOf} from './_result.mjs';

/** @type {import('./tree.mjs').SearchKit} */
const {defineSearcher} = routeKit;

/**
 * The doc topic the whole query names, if any: its route, the route's last
 * segment, or its own title.
 * @param {string} query
 * @param {import('./_adapter.mjs').SearchCatalog} catalog
 * @returns {string | null} the topic's route
 */
export function namedTopic(query, catalog) {
  const term = String(query).trim().toLowerCase();
  if (!term) return null;
  for (const c of catalog.all) {
    if (c.domain !== 'doc' || c._section != null) continue;
    const topic = String(c._topic ?? c.name).toLowerCase();
    const names = [topic, topic.slice(topic.lastIndexOf('/') + 1)];
    if (c.titles?.[0]) names.push(String(c.titles[0]));
    if (names.some(n => samePhrase(term, n))) return String(c.name);
  }
  return null;
}

export const docTopic = defineSearcher({
  id: 'doc-topic',
  summary:
    'Answers a query that names a doc topic with that topic and its own sections first, then the rest in lexical order.',
  run: (request, catalog) => {
    const topic = namedTopic(request.query, catalog);
    if (topic == null) return null;
    const {limit = 20} = request.options;
    const lexical = rankLexical(
      request.query,
      {...request.options, limit: Number.MAX_SAFE_INTEGER},
      catalog,
    );
    const all = lexical.data.results;
    const own = (/** @type {any} */ r) =>
      r.domain === 'doc' && r.name === topic;
    // Only an entry of another kind that matched the words in passing (its
    // prose or description) steps behind the topic's sections; docs and every
    // name or keyword match keep the lexical order.
    const passing = (/** @type {any} */ r) =>
      r.domain !== 'doc' && /mentions/.test(String(r.reason ?? ''));
    const last = all.map(own).lastIndexOf(true);
    const head = all.slice(0, last + 1);
    const ordered = [
      ...head.filter(r => !passing(r)),
      ...head.filter(passing),
      ...all.slice(last + 1),
    ];
    const response = {
      ...lexical,
      data: {...lexical.data, results: ordered.slice(0, limit)},
    };
    const searched = searchedComponentsOf.get(lexical);
    if (searched) searchedComponentsOf.set(response, searched);
    return /** @type {import('./search.type.mjs').SearchResponse} */ (response);
  },
});
