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
    "package's package.json. It can preserve a stable provider identity across a package rename, " +
    "and points the CLI at the package's components, templates, codemods, doc topics, " +
    'source themes, managed agent guidance, and issue tracker. Every field is optional.',
  appliesTo: 'astryx.integration.{ts,mjs,js}',
  fields: [
    {
      name: 'providerId',
      type: 'string',
      description:
        'Stable logical provider ID. Omit to use package.json#name; set it to the prior package name only when an explicit rename must preserve artifact IDs. If two packages claim the same ID, the package being authored is used, otherwise the first-loaded one, and the CLI warns about the other.',
      example: "'@acme/widgets'",
    },
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
      name: 'themes',
      type: 'string',
      description:
        'Relative path to a source-theme root with one directory per theme slug. Each directory contains a source module and mandatory same-stem, strongly typed .doc.mjs descriptor. Installed themes appear in `astryx theme list` and can be copied with `astryx theme add`.',
      example: "'./themes'",
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
  themes: './themes',
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
        'Provider identity defaults to package.json#name. During an explicit ' +
        'package rename, set `providerId` to the prior canonical package name so ' +
        'existing artifact IDs remain stable. Package version always comes from package.json.',
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
      text: 'A themes root is forward-compatible but version-gated: a CLI released before this field ignores it with a warning and continues loading every contribution kind it understands. That older CLI cannot list or add the contributed themes.',
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
