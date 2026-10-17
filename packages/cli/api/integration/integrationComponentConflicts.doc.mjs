// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file FunctionDoc for integration component-conflict diagnostics. */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'integrationComponentConflicts',
  namespace: 'cli/api',
  displayName: 'integrationComponentConflicts()',
  summary:
    'Check integration component names and replaces declarations against Core.',
  description:
    'Loads one local or installed integration, compares its component names with ' +
    'Core, and returns non-blocking conflicts with the exact package-qualified ' +
    "component command required to keep an intentional overlap. Each component's " +
    'replaces is checked too: its findings are issues, errors for a package that ' +
    'declares the CLI range that turns replacement on and warnings otherwise.',
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
        '`validated` (false when no integration manifest was found, so nothing was inspected), integration identity, structural and replaces issues, and Core component-name conflicts with package-qualified commands. An active replacement that keeps the Core name it replaces is not a conflict.',
    },
  ],
  examples: [
    {label: 'Check the local integration', code: 'await integrationComponentConflicts();'},
  ],
  command: 'doctor integration components',
  related: ['integrationTemplateConflicts', 'component'],
};
