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
  namespace: 'authoring',
  description:
    'The astryx.integration.* manifest that sits beside an integration ' +
    "package's package.json. It can preserve a stable provider identity across a package rename, " +
    "and points the CLI at the package's components, templates, codemods, doc topics, " +
    'source themes, managed agent guidance, issue tracker, and the command its users run the CLI with. Every field is optional.',
  appliesTo: 'astryx.integration.{ts,mjs,js}',
  fields: [
    {
      name: 'providerId',
      type: 'string',
      description:
        'The name that marks this package as the source of everything it contributes. Leave it out to use the package name from package.json. Set it to the old name only during a rename, so the IDs of what the package already contributed stay the same. If two packages use the same name here, the one you are working on wins; otherwise the one the CLI reads first wins, and the CLI warns about the other.',
      example: "'@acme/widgets'",
    },
    {
      name: 'components',
      type: 'string',
      description:
        'The folder that holds your components and their docs, relative to package.json.',
      example: "'./src/components'",
    },
    {
      name: 'templates',
      type: 'string',
      description:
        'The folder that holds your templates, relative to package.json.',
      example: "'./src/templates'",
    },
    {
      name: 'codemods',
      type: 'string',
      description:
        'The folder that holds your codemods, relative to package.json.',
      example: "'./codemods'",
    },
    {
      name: 'docs',
      type: 'string',
      description:
        'The folder that holds your doc topics, relative to package.json. Every {topic}.doc.{ts,mjs,js} in it shows up in `astryx docs` next to the built-in topics; a topic can also set `replaces` or `extends` to take over a built-in topic or add to it.',
      example: "'./docs'",
    },
    {
      name: 'themes',
      type: 'string',
      description:
        'The folder that holds your themes, relative to package.json, with one folder per theme. Each theme folder has the theme source and a matching .doc.mjs file with the same name. Installed themes show up in `astryx theme list`; `theme add` imports their built package exports, and `theme eject` creates an editable local fork.',
      example: "'./themes'",
    },
    {
      name: 'agentDocs',
      type: '{ append?: readonly string[] }',
      description:
        'Lines of guidance your package adds to the end of the agent instructions the CLI manages. The CLI owns the heading, labels, bullets, and which files it writes.',
      example: "{ append: ['Run acme verify.'] }",
    },
    {
      name: 'issuesUrl',
      type: 'string',
      description: 'Where to file issues/feedback for this integration.',
      example: "'https://github.com/acme/widgets/issues'",
    },
    {
      name: 'cliCommand',
      type: 'string',
      description:
        'The command your users run the Astryx CLI with, when it is not their package manager, such as a wrapper your company ships. Every command the CLI prints in an app that loads your package starts with it, in place of `npx astryx` or `pnpm exec astryx`: hints, errors, Doctor fixes, and doc text. One line, without a subcommand. If two loaded packages set different commands, neither is used and `astryx doctor` warns. An invalid value is ignored with an `invalid_cli_command` warning, and the rest of the manifest still loads. JSON output keeps commands bare.',
      example: "'acme astryx'",
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
        'The provider name defaults to the package name in package.json. ' +
        'During a rename, set `providerId` to the old package name so the IDs ' +
        'of what the package already contributed stay the same. The package ' +
        'version always comes from package.json.',
    },
    {
      type: 'prose',
      text:
        '`agentDocs.append` may contain at most eight lines. Each line is a ' +
        'trimmed, non-blank string of at most 240 Unicode code points with no ' +
        'line separators, control characters, NUL, or Astryx/XDS managed-marker ' +
        'text. The configured project may contain at most 32 integration lines ' +
        'total. Start a command in a line with the word astryx alone, with no ' +
        'runner in front: the block names the command the app runs once, at its top.',
    },
    {
      type: 'prose',
      text: "Set `cliCommand` only when your users run the CLI with a command other than their package manager's, such as `acme astryx`. The CLI picks the command it prints in this order: the `cliCommand` of the loaded integrations when they name one command, then the command a host tool names, then the package manager's. Two different `cliCommand` values cancel out, and `astryx doctor` warns in its `cli-command` check. See `astryx docs cli/integrations/building-blocks/configuration/cli-command`.",
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
