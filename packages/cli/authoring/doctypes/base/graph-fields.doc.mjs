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
    'Optional placement, compatibility aliases, and audience fields shared by every authored documentation kind.',
  appliesTo: 'Every supported .doc.mjs object',
  fields: [
    {
      name: 'placement',
      type: 'DocPlacement',
      description:
        'Requests one canonical parent. The compiler fails invalid explicit placement instead of silently using Unorganized.',
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
        'Prior names or routes retained for compatibility. Aliases do not create another identity.',
    },
    {
      name: 'audience',
      type: "'public' | 'internal'",
      description: 'Bundle audience. Omit for public documentation.',
      default: "'public'",
    },
  ],
};
