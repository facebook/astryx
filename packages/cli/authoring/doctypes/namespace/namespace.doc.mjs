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
    "Declares one level of the docs tree: named slots, and adoption rules for already-discovered docs. It never scans folders, lists its children, or copies child documents: a child names its parent with `placement`, or a namespace adopts a discovery group. `astryx docs <route>` lists each slot's children one level down. The CLI keeps its namespace docs in its docs tree directory; an integration ships its own in its docs directory, and they appear in `astryx docs` beside the CLI's.",
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
        'Optional canonical parent: {parent, slot?, order?}. `parent` names a namespace of the same package as `namespace:<name>`. An invalid placement withdraws the namespace with a diagnostic; it never falls back.',
    },
    {
      name: 'aliases',
      type: 'string[]',
      description:
        'Prior names or routes the docs tree will keep resolving to this doc. Not read yet.',
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
      type: '(ReferenceContentBlock | GraphContentBlock)[]',
      description:
        'Ordered layout content for the namespace page. Graph-only workflow, collection, and reference blocks are available here without widening the stable ReferenceContentBlock union used by existing topic renderers. Not rendered yet: `astryx docs <route>` lists every slot and its children in order.',
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
};`,
    },
  ],
  notes: [
    {
      type: 'prose',
      text: "The docs tree reads namespace docs from the CLI and from every configured integration. An integration's namespace doc is a top-level level of the tree, and its guides name it with `placement`; a doc can be placed only in a namespace of its own package. When two packages claim one route, the CLI's own docs win, then integrations in configured order, and `astryx doctor` names the loser.",
    },
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
