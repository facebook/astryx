// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'integration add',
  displayName: 'astryx integration add',
  namespace: 'cli',
  summary: 'Add one working contribution to an integration package',
  description:
    'Writes the complete minimum shape the selected contribution needs, creates the integration manifest on first use, declares the root only after a valid contribution exists, and verifies the result through the same discovery contract the packed-package check uses.',
  fn: 'integrationAdd',
  args: [
    {
      name: 'kind',
      param: 'kind',
      required: true,
      description: 'component, doc, template, codemod, agent-doc, or theme',
    },
    {
      name: 'name',
      param: 'name',
      required: true,
      description:
        'Contribution name; for agent-doc this is the literal guidance line',
    },
  ],
  options: [
    {
      flag: '--dry-run',
      param: 'options.dryRun',
      description: 'Validate and show planned writes without changing files',
    },
    {
      flag: '--type <type>',
      param: 'options.templateType',
      choices: ['page', 'block'],
      description: 'Template type (page or block); only valid for template',
    },
    {
      flag: '--replaces <topic>',
      param: 'options.replaces',
      description: 'Replace an existing doc topic; only valid for doc',
    },
    {
      flag: '--extends <topic>',
      param: 'options.extends',
      description: 'Extend an existing doc topic; only valid for doc',
    },
    {
      flag: '--to <version>',
      param: 'options.to',
      description: 'Target version for a codemod; required for codemod',
    },
  ],
  examples: [
    {
      label: 'Add a component',
      cli: 'astryx integration add component AcmeWidget',
    },
    {label: 'Add a doc topic', cli: 'astryx integration add doc deploying'},
    {
      label: 'Add a page template',
      cli: 'astryx integration add template dashboard',
    },
    {
      label: 'Add a codemod',
      cli: 'astryx integration add codemod rename-widget --to 1.2.0',
    },
    {
      label: 'Add agent guidance',
      cli: "astryx integration add agent-doc 'Run acme verify before finishing.'",
    },
    {label: 'Add a source theme', cli: 'astryx integration add theme ocean'},
    {
      label: 'Preview',
      cli: 'astryx integration add component AcmeWidget --dry-run --json',
    },
  ],
  exitCodes: [
    {code: 0, when: 'the contribution is written or the dry run succeeds'},
    {
      code: 1,
      when: 'the kind, name, options, package, or target files are invalid or conflict',
    },
  ],
  related: ['integration pack', 'doctor integration validate', 'theme add'],
};
