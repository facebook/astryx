// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `validateIntegration()` / `astryx validate-integration`.
 * Colocated with the API function it documents; the shape source of truth stays
 * in `validate-integration.type.mjs`.
 * @position packages/cli/api/integration — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'validateIntegration',
  displayName: 'validateIntegration()',
  summary:
    'Validate a single Astryx integration package and report its issues.',
  description:
    'Validates exactly ONE integration at a time: the local package rooted at ' +
    'cwd (no `pkg`), or an installed package resolved from cwd/node_modules ' +
    '(`pkg` given). It loads and schema-checks the manifest, verifies each ' +
    'declared contribution root exists, and runs the codemod/template/component ' +
    'validators, returning every finding as an AstryxIntegrationIssue. A missing ' +
    'local manifest is guidance (name null, no issues), not an error, so callers ' +
    'can stay exit-0 in a non-integration directory.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'validateIntegration(pkg?: string, options?: ValidateIntegrationOptions): Promise<ValidateIntegrationResponse>',
  keywords: ['integration', 'validate', 'manifest', 'lint', 'check'],
  params: [
    {
      name: 'pkg',
      type: 'string',
      description:
        'Installed package name to validate; omit to validate the package rooted at cwd.',
    },
    {
      name: 'options.cwd',
      type: 'string',
      description:
        'Directory to resolve the local package / node_modules from.',
    },
  ],
  returns: [
    {
      type: 'integration.validate',
      description:
        'The result envelope: `data.name` and `data.version` of the validated package (both null when no local manifest is found), plus `data.issues`, an AstryxIntegrationIssue[] of {code, severity: `warning` | `error`, message}.',
    },
  ],
  examples: [
    {
      label: 'Validate the local package',
      code: 'const r = await validateIntegration();',
    },
    {
      label: 'Validate an installed package',
      code: "await validateIntegration('@acme/astryx-integration');",
    },
  ],
  command: 'validate-integration',
  related: ['summarizeIssues', 'doctor', 'upgrade'],
};
