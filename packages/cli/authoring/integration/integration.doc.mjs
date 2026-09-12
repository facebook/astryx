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
    'templates, template replacements, codemods, doc topics, source themes, and ' +
    'managed agent guidance, and where to file issues. Every field is optional.',
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
      name: 'templateReplacements',
      type: 'Record<string, string>',
      description:
        "Maps each exact integration template id to the exact Core template id it replaces. Find Core ids with `astryx --json template --list --package @astryxdesign/core`. Unqualified lookup selects a valid replacement; use `--package @astryxdesign/core` for the original. Invalid declarations fail closed, later explicitly configured packages win with a warning, and explicit configuration wins over autolinking. If only autolinked packages conflict, the dependency listed later in package.json wins with a warning. CLIs from 0.5.3 onward ignore this field when unknown and preserve understood contributions; Versions 0.5.2 and earlier reject unknown manifest keys and drop the integration. Replacement selection starts in 0.7.0. `__proto__` is unsupported and reserved as a `templateReplacements` map key. An ordinary `{'__proto__': 'shell-side-nav'}` literal uses JavaScript's special prototype-setter form; because the string value is neither an object nor null, it does not change the prototype, creates no own key, and disappears before validation. Observable own keys created with computed-property syntax or deserialization are rejected. Template discovery otherwise accepts that directory id.",
      example: "{'acme-app-shell': 'shell-side-nav'}",
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
        'Relative path to a source-theme catalog root containing manifest.json plus one directory per theme slug. Installed themes appear in `astryx theme list` and can be copied with `astryx theme add`.',
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
  templateReplacements: {
    'acme-app-shell': 'shell-side-nav',
  },
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
