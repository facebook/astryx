// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The doc for one answer-picking node, read by `astryx docs` at
 * `cli/areas/<area>-<id>`. The node's descriptor is the doc's only source.
 * @input a node defined with defineSearcher or defineDispatcher
 * @output a generic doc in the `cli/areas` namespace
 * @position foundation/areas; foundation/discovery/cli-self-docs.mjs loads it
 */

/** The namespace every node doc declares. */
export const AREA_DOC_NAMESPACE = 'cli/areas';

/** @param {unknown} value */
const json = value => JSON.stringify(value);

/**
 * @param {import('./areas.type.mjs').AreaNode<unknown, unknown, unknown>} node
 */
export function nodeDoc(node) {
  /** @type {any[]} */
  const notes = [];
  /** @type {[string, string][]} */
  const facts = [
    ['Area', node.area],
    ['Kind', node.kind],
  ];
  if (node.kind === 'dispatcher') {
    facts.push(
      ['Routes to', node.children.join(', ')],
      ['Floor', String(node.floor)],
      ['Fallback', node.fallback],
    );
  }
  facts.push(['Weights', node.weights ?? 'none'], ['Tests', node.tests]);
  notes.push({
    type: 'table',
    headers: ['Field', 'Value'],
    rows: facts.map(([field, value]) => [field, value]),
  });
  notes.push({type: 'heading', level: 3, text: 'Handles'});
  notes.push({
    type: 'table',
    headers: ['Input', node.kind === 'dispatcher' ? 'Route' : 'Answer'],
    rows: node.handles.map(example => [
      json(example.input),
      json(example.expect),
    ]),
  });
  notes.push({type: 'heading', level: 3, text: 'Does not handle'});
  notes.push({
    type: 'table',
    headers: ['Input', 'Why'],
    rows: node.declines.map(example => [json(example.input), example.note]),
  });
  return {
    type: 'generic',
    name: `${node.area}-${node.id}`,
    displayName: `${node.area} / ${node.id}`,
    summary: node.summary,
    description: `${node.summary} A ${node.kind} in the ${node.area} area.`,
    keywords: [node.area, node.id, node.kind],
    namespace: AREA_DOC_NAMESPACE,
    notes,
  };
}
