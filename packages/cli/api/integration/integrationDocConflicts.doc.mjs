// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file FunctionDoc for integration doc-relationship diagnostics. */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'integrationDocConflicts',
  displayName: 'integrationDocConflicts()',
  summary: 'Classify integration doc overlaps with Core topics.',
  description:
    'Loads one local or installed integration and classifies Core doc overlaps as ' +
    'intentional replacements, intentional extensions, or accidental same-name ' +
    'conflicts that need an explicit relationship or a rename.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'integrationDocConflicts(pkg?: string, options?: IntegrationAuthoringOptions): Promise<IntegrationDocConflictResponse>',
  keywords: ['integration', 'docs', 'replace', 'extend', 'authoring', 'doctor'],
  params: [
    {name: 'pkg', type: 'string', description: 'Installed package; omit for the local package.'},
    {name: 'options.cwd', type: 'string', description: 'Resolution directory.'},
  ],
  returns: [
    {
      type: 'integration.doc-conflicts',
      description:
        'Integration identity, structural issues, and classified Core doc relationships.',
    },
  ],
  examples: [
    {label: 'Check the local integration', code: 'await integrationDocConflicts();'},
  ],
  command: 'doctor integration docs',
  related: ['validateIntegration', 'docs'],
};
