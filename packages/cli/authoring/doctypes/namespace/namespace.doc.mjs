// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SchemaDoc for NamespaceDoc, the authored hierarchy and layout owner.
 * @position packages/cli/authoring/doctypes/namespace — doc-type documentation
 */

/** @type {import('@astryxdesign/cli/authoring').SchemaDoc} */
export const doc = {
  type: 'schema',
  name: 'namespace-doc',
  displayName: 'NamespaceDoc',
  namespace: 'authoring',
  description:
    'Declares named navigation slots and renderer-neutral layout blocks for already-discovered docs. It never scans folders or copies child documents.',
  appliesTo: '<namespace>.doc.mjs',
  fields: [
    {
      name: 'type',
      type: "'namespace'",
      description: 'Doc-kind discriminant.',
      required: true,
    },
    {
      name: 'name',
      type: 'string',
      description:
        'Stable provider-local identity. Moving the namespace does not change this value.',
      required: true,
    },
    {
      name: 'title',
      type: 'string',
      description: 'Human-readable page title.',
      required: true,
    },
    {
      name: 'summary',
      type: 'string',
      description: 'One-line summary used in listings and search results.',
      required: true,
    },
    {
      name: 'placement',
      type: 'DocPlacement',
      description:
        'Optional canonical parent request: {parent, slot?, order?}. Invalid explicit placement fails compilation instead of falling back.',
    },
    {
      name: 'aliases',
      type: 'string[]',
      description:
        'Prior names or routes that must keep resolving to this doc.',
    },
    {
      name: 'audience',
      type: "'public' | 'internal'",
      description: "Bundle audience. Defaults to 'public'.",
      default: "'public'",
    },
    {
      name: 'keywords',
      type: 'string[]',
      description: 'Search terms not already present in the title or summary.',
    },
    {
      name: 'slots',
      type: 'Record<string, NamespaceSlot>',
      description:
        'Named placement and collection targets. Each slot declares a title and accepted doc kinds; configured providers require an explicit extension slot.',
      required: true,
    },
    {
      name: 'adopts',
      type: 'NamespaceAdoptionRule[]',
      description:
        'Provider-local rules that adopt otherwise-unplaced docs from a logical discovery group. They never scan a folder.',
    },
    {
      name: 'blocks',
      type: 'ReferenceContentBlock[]',
      description:
        'Ordered layout content. V1 adds only workflow, collection, and reference to the existing prose, heading, code, table, list, and token-ref blocks.',
    },
  ],
  examples: [
    {
      label: 'A CLI namespace with one adopted source group',
      code: `/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'cli',
  title: 'Astryx CLI',
  summary: 'Commands, APIs, and integration authoring.',
  slots: {
    guides: {title: 'Guides', accepts: {kinds: ['namespace', 'generic']}},
    reference: {
      title: 'Reference',
      accepts: {kinds: ['namespace', 'command']},
    },
  },
  adopts: [{
    source: {group: 'cli-commands', kinds: ['command']},
    into: 'reference',
  }],
  blocks: [
    {type: 'collection', source: {slot: 'guides'}, presentation: 'cards'},
    {type: 'collection', source: {slot: 'reference'}, presentation: 'compact'},
  ],
};`,
    },
  ],
  notes: [
    {
      type: 'prose',
      text: 'Child docs request one canonical home with placement. Collections store and render stable references to those docs; they never create a second identity or parent.',
    },
    {
      type: 'list',
      style: 'dont',
      items: [
        'Use a directory as implicit navigation.',
        'Put JSX, HTML, ANSI, callbacks, or custom renderer code in a doc.',
        'Use choice, callout, or checklist blocks before the full block-extension contract exists.',
      ],
    },
  ],
};
