// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/areas`: the commands that pick among candidates, one
 * doc per node of each area's tree.
 *
 * Adopts each node doc whose `namespace` is `cli/areas`; each node's doc comes
 * from its own descriptor. The docs tree reads this namespace only when at
 * least one area is registered, so it never shows an empty level.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'areas',
  title: 'Answer-picking areas',
  summary:
    'How commands that pick among candidates answer: each node, what it handles, and what it does not.',
  keywords: ['areas', 'nodes', 'dispatcher', 'searcher', 'ranking'],
  placement: {parent: 'namespace:cli', slot: 'reference', order: 30},
  slots: {
    nodes: {title: 'Nodes', accepts: {kinds: ['generic']}},
  },
  adopts: [
    {
      source: {group: 'cli/areas', kinds: ['generic']},
      into: 'nodes',
    },
  ],
};
