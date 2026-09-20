// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for integration template-conflict diagnostics.
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'integrationTemplateConflicts',
  displayName: 'integrationTemplateConflicts()',
  summary: 'Find integration template ids that also exist in Core.',
  description:
    'Loads one local or installed integration, compares its template ids with the ' +
    'built-in Core page and block templates, and returns non-blocking conflicts with ' +
    'the exact package-qualified CLI command required to keep an intentional overlap.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'integrationTemplateConflicts(pkg?: string, options?: IntegrationAuthoringOptions): Promise<IntegrationTemplateConflictResponse>',
  keywords: ['integration', 'template', 'conflict', 'authoring', 'doctor'],
  params: [
    {
      name: 'pkg',
      type: 'string',
      description:
        'Installed integration package; omit to inspect the local package.',
    },
    {
      name: 'options.cwd',
      type: 'string',
      description:
        'Directory used to resolve the local or installed integration.',
    },
  ],
  returns: [
    {
      type: 'integration.template-conflicts',
      description:
        'The integration identity, structural issues, and every Core template-id conflict with a package-qualified command.',
    },
  ],
  examples: [
    {
      label: 'Check the local integration',
      code: 'await integrationTemplateConflicts();',
    },
    {
      label: 'Check an installed integration',
      code: "await integrationTemplateConflicts('@acme/widgets');",
    },
  ],
  command: 'doctor integration templates',
  related: ['validateIntegration', 'template'],
};
