// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `validateIntegration()` / `astryx doctor integration validate`.
 * Colocated with the API function it documents; the shape source of truth stays
 * in `validate-integration.type.mjs`.
 * @position packages/cli/api/integration — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'validateIntegration',
  namespace: 'cli/api',
  displayName: 'validateIntegration()',
  summary:
    'Validate a single Astryx integration package and report its issues.',
  description:
    'Validates exactly ONE integration at a time: the local package rooted at ' +
    'cwd (no `pkg`), or an installed package resolved from cwd/node_modules ' +
    '(`pkg` given). It loads and schema-checks the manifest, verifies each ' +
    'declared contribution root exists, and runs the codemod/template/component/' +
    'docs/theme validators, returning every finding as an AstryxIntegrationIssue. A missing ' +
    'local manifest is guidance (name null, no issues), not an error, so callers ' +
    'can stay exit-0 in a non-integration directory. It also checks every doc the ' +
    'package ships under its roots (component, template, docs topic, theme, and translation, served or not) against ' +
    "the published authoring type for its kind, as `tsc` would, with the project's " +
    'own `typescript` (or, where `typescript` is missing or has no JavaScript compiler ' +
    'API, as TypeScript 7 does, the `@typescript/typescript6` it installs): an unknown ' +
    'field, a missing required field, or a value outside ' +
    "a field's type is a warning in `docTypes` naming the field and a fix. A test " +
    'fixture under `__tests__` in the components or docs root is counted, not checked. ' +
    'Without TypeScript, `docTypes` is `skipped` with a reason.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'validateIntegration(pkg?: string, options?: ValidateIntegrationOptions): Promise<ValidateIntegrationResponse>',
  keywords: [
    'integration',
    'validate',
    'manifest',
    'lint',
    'check',
    'types',
    'typecheck',
  ],
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
        'The result envelope: `data.validated`, false when nothing was validated — with no `package.json` at all, `data.issues` carries one `no_package` error-severity issue so the command exits 1; with a `package.json` but no integration manifest, `data.issues` is empty, which means "not looked at", not "healthy"; `data.name` and `data.version` of the validated package (both null when `data.validated` is false; `data.name` is `(local package)` when the local package.json has no readable name), plus `data.issues`, an AstryxIntegrationIssue[] of {code, severity: `warning` | `error`, message, fix?, file?, line?}: `fix` is the change that resolves the issue, and `file` and `line` where it is, relative to the package, when the check knows them; and `data.notes` when there are any: {code, message} information that fails nothing, such as `invalid_cli_command` for a `cliCommand` that was ignored as malformed. When the manifest loads, `data.docTypes` holds the doc type check: `status` (`checked` | `skipped`), `reason` when skipped, `typescript`, `docs` (doc values checked), `findings` ({doc, line, export, type, field, problem: `unknown_field` | `missing_field` | `wrong_type`, severity: `warning`, message, fix}), `unchecked` ({doc, reason}: a doc that could not be fully checked, or a root its reader cannot read), and `fixtures` when the components or docs root holds test fixture docs under `__tests__`: how many, none of them checked. When the manifest loads, `data.publicImports` is `{status: \'checked\', findings, unchecked}`, listed only (since 0.7.3): neither is counted, and neither fails this command or `integration check --strict`. `findings` names each import apps cannot use, as {code, severity: `info`, message, fix?}: `component_import_not_exported`, `component_import_other_package`, `example_import_not_exported`, `template_import_not_exported`, `template_import_outside_root`, `template_private_import`; they fail `--strict` from the next minor release. `unchecked` lists each import the check could not judge, as {file, specifier, reason}: a deep path into build output not built yet in a package with no `exports`, a template import of Core when `@astryxdesign/core` is not installed beside the package (a `packages/core` of the workspace under another name does not count), or every import of the package\'s own name when package.json has no `name`. `integration check` counts the unchecked as not compared.',
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
  command: 'doctor integration validate',
  related: ['summarizeIssues', 'integrationTemplateConflicts', 'upgrade'],
};
