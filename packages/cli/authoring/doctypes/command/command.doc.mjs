// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SchemaDoc for the `CommandDoc` doc-type — how to author the TERMINAL
 * binding of an operation. A command is a FunctionDoc exposed on the CLI, so it
 * references the function via `fn` and only carries CLI-surface facts. Colocated
 * with the type it describes (`type.ts`).
 * @position packages/cli/authoring/doctypes/command — doc-type documentation
 */

/** @type {import('@astryxdesign/cli/authoring').SchemaDoc} */
export const doc = {
  type: 'schema',
  name: 'command-doc',
  displayName: 'CommandDoc',
  namespace: 'authoring',
  description:
    'The doc-type for a CLI command: the terminal binding of an operation. A command ' +
    'is not its own behavior; it is a FunctionDoc exposed on the CLI, referenced via `fn`, ' +
    'carrying only CLI-surface facts (args, flags, subcommands, examples, exit codes). ' +
    'A `defineCommand` converter turns it into Commander config + `--help`.',
  appliesTo: 'clients/cli/commands/<name>.doc.mjs',
  fields: [
    {
      name: 'type',
      type: "'command'",
      description: 'Doc-kind discriminant. Marks the file as a command doc.',
    },
    {
      name: 'name',
      type: 'string',
      description: "Command path, e.g. 'search' | 'theme build'.",
      required: true,
    },
    {
      name: 'displayName',
      type: 'string',
      description: "Human-readable display name, e.g. 'astryx search'.",
      required: true,
    },
    {
      name: 'summary',
      type: 'string',
      description:
        'One-line summary → Commander `.description()` + the docs listing.',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description: 'Longer help body / when-to-use.',
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
      name: 'fn',
      type: 'string',
      description:
        'Name of the FunctionDoc (and `@astryxdesign/cli/api` export) this command wraps.',
      example: "'search'",
    },
    {
      name: 'args',
      type: 'CommandArgDoc[]',
      description: 'Positional arguments.',
      fields: [
        {
          name: 'args[].name',
          type: 'string',
          description: 'Argument name.',
          required: true,
        },
        {
          name: 'args[].param',
          type: 'string',
          description:
            'FunctionDoc param this arg binds to (inherits its description).',
        },
        {
          name: 'args[].description',
          type: 'string',
          description:
            'Override description (else inherited from the referenced param).',
        },
        {
          name: 'args[].required',
          type: 'boolean',
          description: 'Whether the positional argument must be supplied.',
        },
        {
          name: 'args[].variadic',
          type: 'boolean',
          description:
            'Whether the argument collects a variable number of values.',
        },
      ],
    },
    {
      name: 'options',
      type: 'CommandOptionDoc[]',
      description: 'Flags/options.',
      fields: [
        {
          name: 'options[].flag',
          type: 'string',
          description:
            "Commander flag spec, e.g. '-l, --limit <n>' | '--json'.",
          required: true,
        },
        {
          name: 'options[].param',
          type: 'string',
          description:
            'FunctionDoc param this flag maps to (inherits its description).',
        },
        {
          name: 'options[].description',
          type: 'string',
          description:
            'Override/explicit description (required when `cliOnly`).',
        },
        {
          name: 'options[].choices',
          type: 'string[]',
          description: 'Allowed values for the flag.',
        },
        {
          name: 'options[].default',
          type: 'string',
          description: 'Default value as a string.',
        },
        {
          name: 'options[].cliOnly',
          type: 'boolean',
          description:
            'True for CLI-only flags with no function param (e.g. --json).',
        },
      ],
    },
    {
      name: 'subcommands',
      type: 'string[]',
      description:
        'Subcommand names (for command groups like `theme` / `layout`).',
    },
    {
      name: 'examples',
      type: 'CommandExampleDoc[]',
      description: 'Terminal examples.',
      fields: [
        {
          name: 'examples[].label',
          type: 'string',
          description: 'Optional heading shown above the invocation.',
        },
        {
          name: 'examples[].cli',
          type: 'string',
          description:
            "A full terminal invocation, e.g. 'astryx search button --json'.",
          required: true,
        },
        {
          name: 'examples[].output',
          type: 'string',
          description: 'Optional sample output.',
        },
      ],
    },
    {
      name: 'exitCodes',
      type: '{ code: number; when: string }[]',
      description: 'Documented exit codes.',
      fields: [
        {
          name: 'exitCodes[].code',
          type: 'number',
          description: 'The process exit code.',
          required: true,
        },
        {
          name: 'exitCodes[].when',
          type: 'string',
          description: 'The condition that produces this exit code.',
          required: true,
        },
      ],
    },
    {
      name: 'related',
      type: 'string[]',
      description: 'Related command names.',
    },
    {
      name: 'notes',
      type: 'ReferenceContentBlock[]',
      description: 'Freeform prose/notes.',
    },
  ],
  examples: [
    {
      label: 'A command that wraps the search() function',
      code: `/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'search',
  displayName: 'astryx search',
  summary: 'Find components, hooks, docs, and templates.',
  namespace: 'cli',
  fn: 'search',
  args: [{name: 'query', param: 'query', required: true}],
  options: [
    {flag: '--type <domain>', param: 'options.type', choices: ['component', 'hook', 'doc', 'template']},
    {flag: '--json', cliOnly: true, description: 'Emit the typed JSON envelope.'},
  ],
  examples: [{label: 'Terminal', cli: 'astryx search button --json'}],
  exitCodes: [{code: 1, when: 'The --type value is not a known domain.'}],
  related: ['discover'],
};`,
    },
  ],
  notes: [
    {
      type: 'prose',
      text: 'A command carries only CLI-surface facts. Behavior, parameters, returns, and thrown errors live in the FunctionDoc it points at via `fn`; the function does not know it has a CLI.',
    },
    {
      type: 'prose',
      text: "Bind an arg/option to a function param via `param` so it inherits that param's description. Use `cliOnly: true` for flags with no function param (e.g. `--json`); those must supply their own `description`.",
    },
  ],
};
