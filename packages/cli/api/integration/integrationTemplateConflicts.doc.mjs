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
  summary: 'Validate integration template replacements and Core id overlaps.',
  description:
    'Loads one local or installed integration, validates its template replacement ' +
    'declarations against the built-in Core page and block templates, and reports ' +
    'intentional replacements, missing targets, ambiguous declarations, type ' +
    'mismatches, and undeclared same-id conflicts.',
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
        'The integration identity, structural and replacement-declaration issues, intentional Core replacements, and undeclared same-id conflicts.',
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
