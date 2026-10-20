// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file FunctionDoc for integration doc-relationship diagnostics. */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'integrationDocConflicts',
  namespace: 'cli/api',
  displayName: 'integrationDocConflicts()',
  summary:
    "Check an integration's docs: the docs tree they add, every link, and overlaps with Core topics.",
  description:
    'Loads one local or installed integration and classifies Core doc overlaps as ' +
    'intentional replacements, intentional extensions, or accidental same-name ' +
    'conflicts that need an explicit relationship or a rename. `copiedPassages` lists each ' +
    'pair of topics that repeat 10 or more words of prose word for word: two of the ' +
    "package's topics, or one of them and a Core topic other than the one it replaces. " +
    'Code and examples are not compared. The list never fails the check.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'integrationDocConflicts(pkg?: string, options?: IntegrationAuthoringOptions): Promise<IntegrationDocConflictResponse>',
  keywords: ['integration', 'docs', 'replace', 'extend', 'authoring', 'doctor'],
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
      type: 'integration.doc-conflicts',
      description:
        '`validated` (false when no integration manifest was found, so nothing was inspected), integration identity, structural issues, classified Core doc relationships, and `copiedPassages`.',
    },
  ],
  examples: [
    {
      label: 'Check the local integration',
      code: 'await integrationDocConflicts();',
    },
  ],
  command: 'doctor integration docs',
  related: ['validateIntegration', 'docs'],
};
