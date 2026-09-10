// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SchemaDoc for the `astryx.integration.*` manifest (AstryxIntegration).
 * Colocated with the schema (`type.ts` + `parse.mjs`) it documents.
 * @position packages/cli/authoring/integration — schema documentation
 */

/** @type {import('@astryxdesign/cli/authoring').SchemaDoc} */
export const doc = {
  type: 'schema',
  name: 'integration',
  displayName: 'Astryx Integration',
  namespace: 'cli',
  description:
    'The astryx.integration.* manifest that sits beside an integration ' +
    "package's package.json. Points the CLI at the package's components, " +
    'templates, codemods, doc topics, and managed agent guidance, and where to ' +
    'file issues. Every field is optional.',
  appliesTo: 'astryx.integration.{ts,mjs,js}',
  fields: [
    {
      name: 'components',
      type: 'string',
      description:
        'Relative path to the components/docs root (resolved to absolute).',
      example: "'./src/components'",
    },
    {
      name: 'templates',
      type: 'string',
      description:
        'Relative path to the templates root (resolved to absolute).',
      example: "'./src/templates'",
    },
    {
      name: 'codemods',
      type: 'string',
      description: 'Relative path to the codemods root (resolved to absolute).',
      example: "'./codemods'",
    },
    {
      name: 'docs',
      type: 'string',
      description:
        'Relative path to the reference-docs (topics) root (resolved to absolute). Every {topic}.doc.{ts,mjs,js} under it is served by `astryx docs` beside the built-in topics; a topic may also declare `replaces` or `extends` to take the place of a built-in one or merge onto it.',
      example: "'./docs'",
    },
    {
      name: 'agentDocs',
      type: '{ append?: readonly string[] }',
      description:
        'Static package guidance appended to the end of the managed agent block. The CLI owns the section heading, package labels, bullets, target files, and writes.',
      example: "{ append: ['Run acme verify.'] }",
    },
    {
      name: 'issuesUrl',
      type: 'string',
      description: 'Where to file issues/feedback for this integration.',
      example: "'https://github.com/acme/widgets/issues'",
    },
  ],
  examples: [
    {
      label: 'Typical',
      code: `export default {
  components: './src/components',
  templates: './src/templates',
  codemods: './codemods',
  docs: './docs',
  agentDocs: {
    append: ['Run acme verify before finishing.'],
  },
  issuesUrl: 'https://github.com/acme/widgets/issues',
};`,
    },
  ],
  notes: [
    {
      type: 'prose',
      text:
        "Identity, the integration's name and version, comes from the " +
        "package's package.json, not from this manifest. The manifest only " +
        'declares where the CLI finds each kind of artifact.',
    },
    {
      type: 'prose',
      text:
        '`agentDocs.append` may contain at most eight lines. Each line is a ' +
        'trimmed, non-blank string of at most 240 Unicode code points with no ' +
        'line separators, control characters, NUL, or Astryx/XDS managed-marker ' +
        'text. The configured project may contain at most 32 integration lines ' +
        'total.',
    },
    {
      type: 'prose',
      text:
        'Validate the manifest with `astryx doctor integration validate`. At the ' +
        'load boundary, a known field of the wrong type is an error, issuesUrl ' +
        'must be a valid URL, and unknown fields become warnings so an older CLI ' +
        'can still load the fields it understands. Before publishing, also run ' +
        '`templates`, `components`, and `docs` under the same `doctor integration` ' +
        'group. Those leaves compare authored identities with Core and explain ' +
        'whether an overlap is intentional or needs a rename.',
    },
  ],
};
