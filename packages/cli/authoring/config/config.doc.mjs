// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SchemaDoc for the `astryx.config.*` file (AstryxConfig). Colocated with
 * the schema (`type.ts` + `parse.mjs`) it documents.
 * @position packages/cli/authoring/config — schema documentation
 */

/** @type {import('@astryxdesign/cli/authoring').SchemaDoc} */
export const doc = {
  type: 'schema',
  name: 'config',
  displayName: 'Astryx Config',
  namespace: 'cli',
  description:
    'The optional astryx.config.* file at your project root. Declares which ' +
    'integrations to load, where to route issue links, post-codemod hooks, and ' +
    'experimental layout components. All fields are optional; {} is valid.',
  appliesTo: 'astryx.config.{ts,mjs,js}',
  fields: [
    {
      name: 'integrations',
      type: 'string[]',
      description:
        'Package names of Astryx integrations to load alongside core.',
      example: "['@acme/astryx-widgets']",
    },
    {
      name: 'issuesUrl',
      type: 'string',
      description: 'URL that "report an issue" affordances link to.',
    },
    {
      name: 'hooks',
      type: '{ postCodemod?: PostCodemodHook[] }',
      description: 'Lifecycle hooks.',
      fields: [
        {
          name: 'hooks.postCodemod',
          type: 'PostCodemodHook[]',
          description:
            'Commands run after an upgrade applies codemods (e.g. re-run your formatter). Each hook returns a command to execute, or null to skip.',
        },
      ],
    },
    {
      name: 'experimental',
      type: '{ xle?: { components?: Record<string, XleComponent> } }',
      description: 'Unstable features; may change without a breaking bump.',
      fields: [
        {
          name: 'experimental.xle.components',
          type: 'Record<string, XleComponent>',
          description:
            'Custom components the layout expander (XLE) may emit, keyed by tag.',
        },
      ],
    },
  ],
  examples: [
    {
      label: 'Minimal',
      code: "export default {\n  integrations: ['@acme/astryx-widgets'],\n};",
    },
  ],
  notes: [
    {
      type: 'prose',
      text: 'The config is validated at load with a strict schema: unknown keys are errors, so a typo fails fast rather than being silently ignored.',
    },
  ],
};
