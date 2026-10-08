// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `doctor()` / `astryx doctor`. Colocated with the API
 * function it documents; the shape source of truth stays in `doctor.type.mjs`.
 * @position packages/cli/api/doctor — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'doctor',
  namespace: 'cli/api',
  displayName: 'doctor()',
  summary:
    "Check a project's Astryx setup and get a pass/warn/fail report per check. Use it as a CI gate or before debugging a broken install.",
  description:
    'Runs a series of diagnostics: Node version, ' +
    '@astryxdesign/core install and version alignment with the CLI, installed ' +
    'themes and wiring, astryx.config validity, integrations linked from ' +
    'package.json without a config entry, core peer dependencies, ' +
    'integration provider identity and contribution issues, agent docs, the ' +
    'detected package manager, and the health of the docs the CLI reads (authoring ' +
    'and CLI docs, the docs tree, doc size), and returns a structured ' +
    'report. Theme checks run when the generated app module exists; without one, doctor reports that the CLI manages no themes and names theme add --import. Earlier descriptor-less copies are a non-failing upgrade warning. It never installs, writes, or mutates. It imports astryx.config, executes every added theme source while validating private inputs, and loads every recorded built theme module to prove its runtime imports work, including themes from installed packages. Local theme source also runs during build-freshness checks. Stylesheets are parsed without execution. Config and theme top-level code therefore run, so use doctor only with project code you trust.',
  importPath: '@astryxdesign/cli/api',
  signature: 'doctor(options?: DoctorOptions): Promise<DoctorResponse>',
  keywords: ['doctor', 'diagnose', 'health', 'check', 'verify', 'environment'],
  params: [
    {
      name: 'options.cwd',
      type: 'string',
      description:
        'Directory to diagnose. A missing directory is not an error; it shows up in the checks (e.g. core-installed: fail).',
      default: 'process.cwd()',
    },
  ],
  returns: [
    {
      type: 'doctor',
      description:
        'The diagnostic report: `data.checks`, each with a stable id, label, `status` (`pass` | `warn` | `fail` | `info`), a one-line message, and an optional `fix` (always present on `warn` and `fail`; some `info` checks carry one too); plus `data.summary` with counts per status.',
    },
  ],
  examples: [
    {
      label: 'Fail a CI step on any failed check',
      code: 'const r = await doctor();\nif (r.data.summary.fail > 0) process.exitCode = 1;',
    },
    {
      label: 'Diagnose a directory',
      code: "await doctor({cwd: '/path/to/app'});",
    },
  ],
  command: 'doctor',
  related: ['init', 'upgrade'],
};
