// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SchemaDoc for graph metadata shared by every authored doc kind.
 * @position packages/cli/authoring/doctypes/base — doc-type documentation
 */

/** @type {import('@astryxdesign/cli/authoring').SchemaDoc} */
export const doc = {
  type: 'schema',
  name: 'authored-doc-graph-fields',
  displayName: 'Authored doc graph fields',
  namespace: 'authoring',
  description:
    "Fields every authored doc kind can declare for the docs tree: `placement`, plus two reserved fields, `aliases` and `audience`. The docs tree reads `placement` for every guide, the CLI's and each integration's. Nothing reads `aliases` or `audience` today: a reference topic outside the docs tree that sets one fails to load, and other doc kinds accept them and ignore them.",
  appliesTo: 'Every supported .doc.mjs object',
  fields: [
    {
      name: 'placement',
      type: 'DocPlacement',
      description:
        "Names the doc's one parent in the docs tree: a namespace of the same package, one of its slots, and an order. Read for every guide, the CLI's and each integration's: a guide with `placement` gets a route in the tree instead of a flat topic name, and cannot also `replaces` or `extends` a topic. In the CLI's own topic directory a topic that sets it fails to load: the CLI keeps its guides in its docs tree directory. Commands, API functions, schemas, and enums do not set it: the tree adopts each by its `namespace`.",
      fields: [
        {
          name: 'placement.parent',
          type: 'string',
          description:
            'The parent namespace: `namespace:<name>` in the same package.',
          required: true,
        },
        {
          name: 'placement.slot',
          type: 'string',
          description:
            "A slot the parent namespace declares; it must accept this doc's kind. Optional when the parent has one slot.",
        },
        {
          name: 'placement.order',
          type: 'number',
          description: 'Integer sibling order within the slot.',
        },
      ],
    },
    {
      name: 'aliases',
      type: 'string[]',
      description:
        'Reserved: prior names or routes the docs tree will keep resolving to this doc, without creating another identity. Nothing reads it today, and a topic that sets it fails to load.',
    },
    {
      name: 'audience',
      type: "'public' | 'internal'",
      description:
        "Reserved: which docs bundle includes this doc ('public' when omitted). Nothing reads it today, and a topic that sets it fails to load.",
      default: "'public'",
    },
  ],
  notes: [
    {
      type: 'prose',
      text: 'Unknown fields: `component`, `function`, `generic`, `schema`, `command` and `enum` docs accept a field they do not know, and nothing reads it, so a doc written for a newer CLI still loads here. `page`, `block` and `namespace` docs refuse one, as do `theme` descriptors. Sections and content blocks refuse one in every doc.',
    },
  ],
};
