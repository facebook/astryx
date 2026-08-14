// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SchemaDoc for the `EnumDoc` doc-type — how to author a doc for a closed
 * vocabulary (error codes, response-type discriminants). Colocated with the
 * type it describes (`type.ts`).
 * @position packages/cli/authoring/doctypes/enum — doc-type documentation
 */

/** @type {import('@astryxdesign/cli/authoring').SchemaDoc} */
export const doc = {
  type: 'schema',
  name: 'enum-doc',
  displayName: 'EnumDoc',
  namespace: 'authoring',
  description:
    'The doc-type for a closed vocabulary: a fixed set of literal values such as ' +
    'error codes or response-type discriminants. Colocated as a `.doc.mjs` next to ' +
    'the source of truth it documents.',
  appliesTo: '<enum>.doc.mjs',
  fields: [
    {
      name: 'type',
      type: "'enum'",
      description: 'Doc-kind discriminant. Marks the file as an enum doc.',
    },
    {
      name: 'name',
      type: 'string',
      description:
        'URL-safe identifier, used as the docs slug within its namespace.',
      required: true,
      example: "'error-codes'",
    },
    {
      name: 'displayName',
      type: 'string',
      description: 'Human-readable title.',
      required: true,
      example: "'Error Codes'",
    },
    {
      name: 'description',
      type: 'string',
      description: 'One-line summary shown in listings.',
      required: true,
    },
    {
      name: 'namespace',
      type: 'string',
      description:
        "Docs namespace path. Defaults to 'cli' when applied by the docs index.",
    },
    {
      name: 'aliases',
      type: 'string[]',
      description: 'Alternate slugs that also resolve to this doc.',
    },
    {
      name: 'members',
      type: 'EnumMemberDoc[]',
      description: 'The enumerated members: one entry per literal value.',
      required: true,
      fields: [
        {
          name: 'members[].value',
          type: 'string',
          description:
            "The literal value, e.g. 'ERR_UNKNOWN_TOPIC' | 'component.list'.",
          required: true,
        },
        {
          name: 'members[].description',
          type: 'string',
          description: 'What the value means / when it occurs.',
          required: true,
        },
        {
          name: 'members[].deprecated',
          type: 'string',
          description: 'Deprecation reason, if deprecated.',
        },
      ],
    },
  ],
  examples: [
    {
      label: 'Error-codes enum doc',
      code: `/** @type {import('@astryxdesign/cli/authoring').EnumDoc} */
export const doc = {
  type: 'enum',
  name: 'error-codes',
  displayName: 'Error Codes',
  namespace: 'cli',
  description: 'Stable error codes thrown by the CLI/API and surfaced in the JSON envelope.',
  members: [
    {value: 'ERR_UNKNOWN_TOPIC', description: 'The requested docs topic does not exist.'},
    {value: 'ERR_INVALID_ARGUMENT', description: 'A required argument was missing or malformed.'},
    {value: 'ERR_LEGACY', description: 'Old alias.', deprecated: 'Use ERR_INVALID_ARGUMENT.'},
  ],
};`,
    },
  ],
  notes: [
    {
      type: 'prose',
      text: 'An enum doc is the human-readable mirror of a closed vocabulary defined elsewhere in source (e.g. an ERROR_CODES map or a response-type union). Keep the members in sync with that source of truth.',
    },
    {
      type: 'prose',
      text: 'Mark a value with `deprecated` (a migration hint) rather than deleting it, so old codes stay documented while readers are pointed at the replacement.',
    },
  ],
};
