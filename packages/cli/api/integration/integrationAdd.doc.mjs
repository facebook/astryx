// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'integrationAdd',
  displayName: 'integrationAdd()',
  summary: 'Add one working contribution to an integration package.',
  description:
    'Creates every file required by the selected contribution, creates the integration manifest on first use, updates an existing package files allowlist without creating one, and verifies the contribution through the same inventory contract used by integrationPackCheck.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'integrationAdd(kind: IntegrationAddKind, name: string, options?: IntegrationAddOptions): Promise<IntegrationAddResponse>',
  keywords: [
    'integration',
    'add',
    'author',
    'scaffold',
    'component',
    'doc',
    'template',
    'codemod',
    'theme',
  ],
  params: [
    {
      name: 'kind',
      type: 'IntegrationAddKind',
      description: 'Contribution kind.',
      required: true,
    },
    {
      name: 'name',
      type: 'string',
      description: 'Contribution name, or the literal agent-doc line.',
      required: true,
    },
    {
      name: 'options.cwd',
      type: 'string',
      description: 'Directory inside the integration package.',
    },
    {
      name: 'options.dryRun',
      type: 'boolean',
      description: 'Validate and return the planned receipt without writing.',
      default: 'false',
    },
    {
      name: 'options.templateType',
      type: "'page' | 'block'",
      description: 'Template type. Only valid for template.',
      default: "'page'",
    },
    {
      name: 'options.replaces',
      type: 'string',
      description: 'Existing topic to replace. Only valid for doc.',
    },
    {
      name: 'options.extends',
      type: 'string',
      description: 'Existing topic to extend. Only valid for doc.',
    },
    {
      name: 'options.to',
      type: 'string',
      description: 'Exact target semver. Required for codemod.',
    },
  ],
  returns: [
    {
      type: 'integration.add',
      description:
        'A typed receipt naming every affected project-relative path and whether writes occurred.',
    },
  ],
  examples: [
    {
      label: 'Add a component',
      code: "await integrationAdd('component', 'AcmeWidget');",
    },
    {
      label: 'Preview a doc topic',
      code: "await integrationAdd('doc', 'deploying', {dryRun: true});",
    },
  ],
  command: 'integration add',
  related: [
    'integrationAddComponent',
    'integrationAddDoc',
    'integrationAddTemplate',
    'integrationAddCodemod',
    'integrationAddAgentDoc',
    'integrationAddTheme',
    'integrationPackCheck',
    'validateIntegration',
  ],
};
