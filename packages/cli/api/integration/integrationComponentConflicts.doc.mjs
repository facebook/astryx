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
    'Check integration component names, replaces declarations, and documented props.',
  description:
    'Loads one local or installed integration, compares its component names with ' +
    'Core, and returns non-blocking conflicts with the exact package-qualified ' +
    "component command required to keep an intentional overlap. Each component's " +
    'replaces is checked too: its findings are issues, errors for a package that ' +
    'declares the CLI range that turns replacement on and warnings otherwise. ' +
    "Each component doc's props are compared with the component's TypeScript props, " +
    "read with the project's own `typescript`: a documented prop the code lacks, a " +
    'prop the package declares that the doc omits, a wrong `required`, or a type ' +
    'that does not match, a field such as `status.type` included (compared ' +
    'loosely: union order, whitespace, quotes, parameter names and alias spelling ' +
    'do not count, a callback may leave out trailing parameters, and `Name = …` ' +
    'must match in both parts). Those findings are warnings ' +
    'in `propDrift`; without TypeScript it is `skipped` with a reason.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'integrationComponentConflicts(pkg?: string, options?: IntegrationAuthoringOptions): Promise<IntegrationComponentConflictResponse>',
  keywords: [
    'integration',
    'component',
    'conflict',
    'authoring',
    'doctor',
    'props',
    'drift',
  ],
  params: [
    {name: 'pkg', type: 'string', description: 'Installed package; omit for the local package.'},
    {name: 'options.cwd', type: 'string', description: 'Resolution directory.'},
  ],
  returns: [
    {
      type: 'integration.component-conflicts',
      description:
        '`validated` (false when no integration manifest was found, so nothing was inspected), integration identity, structural and replaces issues, and Core component-name conflicts with package-qualified commands. An active replacement that keeps the Core name it replaces is not a conflict. When the manifest loads and declares a components root, `propDrift` holds the props comparison: `status` (`checked` | `skipped`), `reason` when skipped, `typescript`, `components` compared, `findings` ({component, prop, kind: `not_in_code` | `not_in_doc` | `required_mismatch` | `type_mismatch`, severity: `warning`, message, doc, source, docType?, codeType?, docRequired?, codeRequired?}) and `unchecked` ({component, doc, reason}).',
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
