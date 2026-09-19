// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file FunctionDoc for integration component-conflict diagnostics. */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'integrationComponentConflicts',
  displayName: 'integrationComponentConflicts()',
  summary: 'Find integration component names that also exist in Core.',
  description:
    'Loads one local or installed integration, compares its component names with ' +
    'Core, and returns non-blocking conflicts with the exact package-qualified ' +
    'component command required to keep an intentional overlap.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'integrationComponentConflicts(pkg?: string, options?: IntegrationAuthoringOptions): Promise<IntegrationComponentConflictResponse>',
  keywords: ['integration', 'component', 'conflict', 'authoring', 'doctor'],
  params: [
    {name: 'pkg', type: 'string', description: 'Installed package; omit for the local package.'},
    {name: 'options.cwd', type: 'string', description: 'Resolution directory.'},
  ],
  returns: [
    {
      type: 'integration.component-conflicts',
      description:
        'Integration identity, structural issues, and Core component-name conflicts with package-qualified commands.',
    },
  ],
  examples: [
    {label: 'Check the local integration', code: 'await integrationComponentConflicts();'},
  ],
  command: 'doctor integration components',
  related: ['integrationTemplateConflicts', 'component'],
};
