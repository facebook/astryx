// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'integrationAddDoc',
  displayName: 'integrationAddDoc()',
  summary: 'Add a complete reference-doc contribution.',
  description:
    'Creates a valid generic topic, declares the docs root on first use, and supports an intentional replaces or extends relationship.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'integrationAddDoc(name: string, options?: IntegrationAddDocOptions): Promise<IntegrationAddResponse>',
  keywords: ['integration', 'doc', 'topic', 'author', 'api'],
  params: [
    {
      name: 'name',
      type: 'string',
      description: 'URL-safe topic name.',
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
      description: 'Return the exact write plan without changing files.',
      default: 'false',
    },
    {
      name: 'options.replaces',
      type: 'string',
      description: 'Existing topic this topic replaces.',
    },
    {
      name: 'options.extends',
      type: 'string',
      description: 'Existing topic this topic extends.',
    },
  ],
  returns: [
    {
      type: 'integration.add',
      description: 'The shared typed authoring receipt.',
    },
  ],
  examples: [
    {
      label: 'Add a replacement topic',
      code: "await integrationAddDoc('getting-started-meta', {replaces: 'getting-started'});",
    },
  ],
  command: 'integration add doc',
  related: ['integrationAdd', 'integrationPackCheck'],
};
