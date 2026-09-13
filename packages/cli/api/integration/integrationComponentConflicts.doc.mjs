// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file FunctionDoc for integration component-conflict diagnostics. */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'integrationComponentConflicts',
  displayName: 'integrationComponentConflicts()',
  summary: 'Validate component replacement declarations against Core.',
  description:
    'Loads one local or installed integration, validates every component replacement ' +
    'target and duplicate declaration, and classifies valid replacements and accidental ' +
    'same-name overlaps. Valid replacements become the unqualified default while the ' +
    'original remains available through an explicit Core package selection.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'integrationComponentConflicts(pkg?: string, options?: IntegrationAuthoringOptions): Promise<IntegrationComponentConflictResponse>',
  keywords: ['integration', 'component', 'conflict', 'authoring', 'doctor'],
  params: [
    {
      name: 'pkg',
      type: 'string',
      description: 'Installed package; omit for the local package.',
    },
    {name: 'options.cwd', type: 'string', description: 'Resolution directory.'},
  ],
  returns: [
    {
      type: 'integration.component-conflicts',
      description:
        "`data` is `{name, version, replacements?, conflicts, issues}`. The additive optional `replacements` array contains `{name, relationship: 'replaces', target, integrationPackage, message, command}` entries and is populated only when the package's complete component contribution set is valid and can become effective. The existing `conflicts` entries keep their stable `{name, severity: 'warning', integrationPackage, message, command}` contract and can add optional `relationship: 'accidental'` and `target`. `issues` contains structural errors such as an invalid declaration, a missing Core target, a replacement named after a different Core component, or more than one component in the package replacing one target.",
    },
  ],
  examples: [
    {
      label: 'Check the local integration',
      code: 'await integrationComponentConflicts();',
    },
  ],
  command: 'doctor integration components',
  related: ['integrationTemplateConflicts', 'component'],
};
