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
        'The result envelope: `data.validated`, false when nothing was validated — with no `package.json` at all, `data.issues` carries one `no_package` error-severity issue so the command exits 1; with a `package.json` but no integration manifest, `data.issues` is empty, which means "not looked at", not "healthy"; `data.name` and `data.version` of the validated package (both null when `data.validated` is false; `data.name` is `(local package)` when the local package.json has no readable name), plus `data.issues`, an AstryxIntegrationIssue[] of {code, severity: `warning` | `error`, message, fix?, file?, line?}: `fix` is the change that resolves the issue, and `file` and `line` where it is, relative to the package, when the check knows them; and `data.notes` when there are any: {code, message} information that fails nothing, such as `invalid_cli_command` for a `cliCommand` that was ignored as malformed. When the manifest loads, `data.docTypes` holds the doc type check: `status` (`checked` | `skipped`), `reason` when skipped, `typescript`, `docs` (doc values checked), `findings` ({doc, line, export, type, field, problem: `unknown_field` | `missing_field` | `wrong_type`, severity: `warning`, message, fix}), `unchecked` ({doc, reason}: a doc that could not be fully checked, or a root its reader cannot read), and `fixtures` when the components or docs root holds test fixture docs under `__tests__`: how many, none of them checked. When the manifest loads, `data.docNames` lists the component doc names it could not judge: `status` (`checked`), `findings` (always empty; a doc name its source provably does not export is a `doc_name_mismatch` issue) and `unchecked` ({file, name, reason}: a doc whose `name` differs from the name it is listed under and whose source exports cannot all be read, such as a re-export from another package). When the manifest loads, `data.blockComponents` lists the component names templates give in `exampleFor` or `componentsUsed` that could not be judged: `status` (`checked`), `findings` (always empty; a name neither the package nor Core has, and the template does not import, is an `unknown_block_component` issue) and `unchecked` ({file, name, reason}: a name the template may reach through anything other than named imports and re-exports from Core, React, StyleX, local helpers or the entry of the package itself, such as an import from another package, a default or namespace import, an alias of or member read off an imported binding, require() or a dynamic import(), or a local module that cannot be read, or any name Core would have to resolve when Core is not installed).',
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
