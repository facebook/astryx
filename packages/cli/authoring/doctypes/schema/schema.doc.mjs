// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SchemaDoc for the `SchemaDoc` doc-type itself — the self-describing
 * entry that documents how to author a schema/object `.doc.mjs`. Colocated
 * with the type it describes (`type.ts`).
 * @position packages/cli/authoring/doctypes/schema — doc-type documentation
 */

/** @type {import('@astryxdesign/cli/authoring').SchemaDoc} */
export const doc = {
  type: 'schema',
  name: 'schema-doc',
  displayName: 'SchemaDoc',
  namespace: 'authoring',
  description:
    'The doc-type for documenting an authored/received OBJECT shape (astryx.config, ' +
    'a codemod payload, the doc-types themselves). Colocated as a `.doc.mjs` next to ' +
    'the schema it describes. Fields nest recursively, so a whole shape is one tree.',
  appliesTo: '<schema>.doc.mjs',
  fields: [
    {
      name: 'type',
      type: "'schema'",
      description: 'Doc-kind discriminant. Marks the file as a schema doc.',
    },
    {
      name: 'name',
      type: 'string',
      description:
        'URL-safe identifier, used as the docs slug within its namespace.',
      required: true,
      example: "'config'",
    },
    {
      name: 'displayName',
      type: 'string',
      description: 'Human-readable title.',
      required: true,
      example: "'Astryx Config'",
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
        "Docs namespace path (e.g. 'cli' | 'authoring'). Defaults are applied by the docs index; set explicitly to place the schema.",
    },
    {
      name: 'aliases',
      type: 'string[]',
      description:
        'Alternate slugs that also resolve to this doc (back-compat).',
    },
    {
      name: 'appliesTo',
      type: 'string',
      description:
        "What this schema applies to, e.g. 'astryx.config.{ts,mjs,js}' | 'AstryxConfig'.",
    },
    {
      name: 'fields',
      type: 'SchemaFieldDoc[]',
      description:
        "The fields that make up the shape. Object-typed fields nest their members recursively via each field's own `fields`, so the whole shape is one tree.",
      required: true,
      fields: [
        {
          name: 'fields[].name',
          type: 'string',
          description:
            "Field name, or a dotted path for a nested field (e.g. 'hooks.postCodemod').",
          required: true,
        },
        {
          name: 'fields[].type',
          type: 'string',
          description:
            "TypeScript type signature as a string, e.g. 'string[]' | \"'a' | 'b'\".",
          required: true,
        },
        {
          name: 'fields[].description',
          type: 'string',
          description: 'What the field is for, in 1-2 sentences.',
          required: true,
        },
        {
          name: 'fields[].required',
          type: 'boolean',
          description:
            "True if the field must be provided. Omit (don't set false) if optional.",
        },
        {
          name: 'fields[].default',
          type: 'string',
          description: 'Default value as a string, if any.',
        },
        {
          name: 'fields[].example',
          type: 'string',
          description: 'A short inline example value.',
        },
        {
          name: 'fields[].deprecated',
          type: 'string',
          description: 'Deprecation reason, if the field is deprecated.',
        },
        {
          name: 'fields[].fields',
          type: 'SchemaFieldDoc[]',
          description:
            'Nested object fields, for object-typed fields. Recursive.',
        },
      ],
    },
    {
      name: 'examples',
      type: '{ label?: string; code: string }[]',
      description: 'Full example objects/snippets.',
      fields: [
        {
          name: 'examples[].label',
          type: 'string',
          description: 'Optional heading shown above the snippet.',
        },
        {
          name: 'examples[].code',
          type: 'string',
          description: 'The example source.',
          required: true,
        },
      ],
    },
    {
      name: 'notes',
      type: 'ReferenceContentBlock[]',
      description:
        'Freeform prose/notes rendered after the field table. Same block union as ReferenceDoc (prose, heading, code, table, list, token-ref).',
    },
  ],
  examples: [
    {
      label: 'A small schema doc with a nested object field',
      code: `/** @type {import('@astryxdesign/cli/authoring').SchemaDoc} */
export const doc = {
  type: 'schema',
  name: 'integration',
  displayName: 'Astryx Integration',
  namespace: 'cli',
  description: 'The astryx.integration.* manifest that registers the components a package provides.',
  appliesTo: 'astryx.integration.{ts,mjs,js}',
  fields: [
    {name: 'name', type: 'string', description: 'Package name.', required: true},
    {
      name: 'components',
      type: '{ dir: string }',
      description: 'Where component sources live.',
      fields: [
        {name: 'components.dir', type: 'string', description: 'Glob root for XDS*.tsx files.', required: true},
      ],
    },
  ],
};`,
    },
  ],
  notes: [
    {
      type: 'prose',
      text: 'SchemaFieldDoc is recursive: an object-typed field lists its members in its own `fields`, so an entire nested shape (including paths like `hooks.postCodemod` or `experimental.xle.components`) is documented as one tree.',
    },
    {
      type: 'prose',
      text: 'Name nested fields with a dotted path from the root (e.g. `hooks.postCodemod`) so readers can see where each field sits in the shape.',
    },
    {
      type: 'list',
      style: 'do',
      items: [
        'Set `required: true` only for mandatory fields.',
        'Keep `type` close to the real TS type; use single quotes for string-literal unions.',
      ],
    },
    {
      type: 'list',
      style: 'dont',
      items: [
        'Set `required: false` for optional fields; omit `required` entirely instead.',
      ],
    },
  ],
};
