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
    'Placement, compatibility aliases, and audience: fields every authored doc kind declares for the docs graph. The docs graph is not built yet, so nothing reads them: a reference topic that sets one fails to load, and other doc kinds accept them and ignore them.',
  appliesTo: 'Every supported .doc.mjs object',
  fields: [
    {
      name: 'placement',
      type: 'DocPlacement',
      description:
        'Requests one canonical parent in the docs graph. Not read yet: a topic that sets it fails to load.',
      fields: [
        {
          name: 'placement.parent',
          type: 'string',
          description: 'Stable reference to the requested parent namespace.',
          required: true,
        },
        {
          name: 'placement.slot',
          type: 'string',
          description: 'Named slot owned by the parent namespace.',
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
        'Prior names or routes the docs graph will keep resolving to this doc, without creating another identity. Not read yet: a topic that sets it fails to load.',
    },
    {
      name: 'audience',
      type: "'public' | 'internal'",
      description:
        "Which docs bundle includes this doc ('public' when omitted). Not read yet: a topic that sets it fails to load.",
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
