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
  displayName: 'doctor()',
  summary: 'Read-only project + environment health check.',
  description:
    'Runs a series of side-effect-free diagnostics: Node version, ' +
    '@astryxdesign/core install and version alignment with the CLI, installed ' +
    'themes and wiring, astryx.config validity, agent docs, core peer ' +
    'dependencies, and the detected package manager, and returns a structured ' +
    'report. It only reads (never installs, writes, or mutates), so it is safe ' +
    'as a CI gate and for agents to invoke.',
  importPath: '@astryxdesign/cli/api',
  signature: 'doctor(options?: DoctorOptions): Promise<DoctorResponse>',
  keywords: ['doctor', 'diagnose', 'health', 'check', 'verify', 'environment'],
  params: [
    {
      name: 'options.cwd',
      type: 'string',
      description: 'Directory to diagnose.',
    },
  ],
  returns: [
    {
      type: 'doctor',
      description:
        'The diagnostic report: `data.checks`, each with a stable id, label, `status` (`pass` | `warn` | `fail` | `info`), a one-line message, and a `fix` when the status is not `pass`; plus `data.summary` with counts per status.',
    },
  ],
  examples: [
    {label: 'Run diagnostics', code: 'const r = await doctor();'},
    {
      label: 'Diagnose a directory',
      code: "await doctor({cwd: '/path/to/app'});",
    },
  ],
  command: 'doctor',
  related: ['init', 'upgrade'],
};
