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
 * @position api/search; tree.mjs's root sends a query here, before the
 *   classifier, only when topicOrder would move something
 */

import {routeKit} from '../../foundation/route/route.mjs';
import {rankLexical} from './_lexical.mjs';
import {samePhrase} from './_query.mjs';
import {searchedComponentsOf} from './_result.mjs';

/** @type {import('./tree.mjs').SearchKit} */
const {defineSearcher} = routeKit;

/**
 * The routes of the doc topics the whole query names: a topic's route, the
 * route's last segment, or its own title, as words whatever the plural.
 * @param {string} query
 * @param {import('./_adapter.mjs').SearchCatalog} catalog
 * @returns {Set<string>}
 */
export function topicsNamed(query, catalog) {
  const term = String(query).trim().toLowerCase();
  /** @type {Set<string>} */
  const named = new Set();
  if (!term) return named;
  for (const c of catalog.all) {
    if (c.domain !== 'doc' || c._section != null) continue;
    const route = String(c._topic ?? c.name);
    const topic = route.toLowerCase();
    const names = [topic, topic.slice(topic.lastIndexOf('/') + 1)];
    if (c.titles?.[0]) names.push(String(c.titles[0]));
    if (names.some(n => samePhrase(term, n))) named.add(route);
  }
  return named;
}

/** @type {WeakMap<object, Map<string, import('./search.type.mjs').SearchResponse | null>>} */
const memo = new WeakMap();

/**
 * The doc-topic order for a query, or null when it would move nothing. The
 * topic is the named topic the lexical ranker lists first (several topics can
 * share a name). When everything up to the topic's last own entry is either
 * the topic's own or an entry of another kind that matched only in passing (a
 * prose or description mention), the passing mentions step behind the
 * topic's last own entry; otherwise nothing moves. The response holds
 * every lexical match.
 * @param {{query: string, options: {type?: string}}} request
 * @param {import('./_adapter.mjs').SearchCatalog} catalog
 * @returns {import('./search.type.mjs').SearchResponse | null}
 */
export function topicOrder(request, catalog) {
  let byQuery = memo.get(catalog);
  if (!byQuery) memo.set(catalog, (byQuery = new Map()));
  const key = `${request.options.type ?? ''}\u0000${request.query}`;
  if (byQuery.has(key)) return byQuery.get(key) ?? null;
  /** @type {import('./search.type.mjs').SearchResponse | null} */
  let answer = null;
  const named = topicsNamed(request.query, catalog);
  if (named.size > 0) {
    const lexical = rankLexical(
      request.query,
      {...request.options, limit: Number.MAX_SAFE_INTEGER},
      catalog,
    );
    const all = lexical.data.results;
    const topic = all.find(r => r.domain === 'doc' && named.has(r.name))?.name;
    const own = (/** @type {any} */ r) =>
      r.domain === 'doc' && r.name === topic;
    const passing = (/** @type {any} */ r) =>
      r.domain !== 'doc' && /mentions/.test(String(r.reason ?? ''));
    const last = all.map(own).lastIndexOf(true);
    const head = all.slice(0, last + 1);
    // The rule holds only when everything up to the topic's last own entry is
    // the topic's own or a passing mention of another kind, so only the
    // topic's own entries ever pass a mention (spec:AST-083 FR2's exception).
    if (
      topic != null &&
      head.some(passing) &&
      head.every(r => own(r) || passing(r))
    ) {
      answer = /** @type {import('./search.type.mjs').SearchResponse} */ ({
        ...lexical,
        data: {
          ...lexical.data,
          results: [
            ...head.filter(r => !passing(r)),
            ...head.filter(passing),
            ...all.slice(last + 1),
          ],
        },
      });
      const searched = searchedComponentsOf.get(lexical);
      if (searched) searchedComponentsOf.set(answer, searched);
    }
  }
  byQuery.set(key, answer);
  return answer;
}

export const docTopic = defineSearcher({
  id: 'doc-topic',
  summary:
    "Answers a query that names a doc topic, when an entry of another kind that only mentions the words sits among the topic's sections, with the topic and its sections first, then the rest in lexical order.",
  run: (request, catalog) => {
    const ordered = topicOrder(request, catalog);
    if (!ordered) return null;
    const {limit = 20} = request.options;
    const response = {
      ...ordered,
      data: {...ordered.data, results: ordered.data.results.slice(0, limit)},
    };
    const searched = searchedComponentsOf.get(ordered);
    if (searched) searchedComponentsOf.set(response, searched);
    return /** @type {import('./search.type.mjs').SearchResponse} */ (response);
  },
});
