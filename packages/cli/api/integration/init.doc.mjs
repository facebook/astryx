// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'integrationInit',
  namespace: 'cli/api',
  displayName: 'integrationInit()',
  summary:
    'Create or complete the package.json for an Astryx integration package and install the required dev dependencies.',
  description:
    'Writes the package.json fields that `integrationAdd` needs (name, version, and — for new packages only — an empty exports map) without overwriting existing values, then installs the CLI and Core: one the package does not declare is added as a dev dependency, and one it already declares (in dependencies, devDependencies, or optionalDependencies) is installed where it is declared, never moved. The Core peer is written by `integrationAdd` on the first component, template, or theme, not by init. Idempotent: re-running on an initialized package with satisfied deps returns an unchanged receipt and does not invoke the package manager. Use `noInstall` to skip the install step. On install failure, package.json is rolled back to its byte-identical original state.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'integrationInit(options?: IntegrationInitOptions, ctx?: {cwd?: string}): Promise<IntegrationInitResponse>',
  keywords: [
    'integration',
    'init',
    'create',
    'package',
    'scaffold',
    'author',
  ],
  params: [
    {
      name: 'options.name',
      type: 'string',
      description:
        'Package name (e.g. @acme/astryx-widgets). Default: the current directory name. Cannot differ from an existing package name.',
    },
    {
      name: 'options.dryRun',
      type: 'boolean',
      description:
        'Preview what would change without writing files or installing.',
      default: 'false',
    },
    {
      name: 'options.noInstall',
      type: 'boolean',
      description:
        'Skip the dependency install step (write package.json only).',
      default: 'false',
    },
  ],
  returns: [
    {
      type: 'integration.init',
      description:
        'A receipt: name (resolved package name), packageCreated (true when the file was created, false when updated or unchanged), fieldsAdded (package.json fields that were added), installed (whether the install step ran and succeeded), dryRun (whether this was a dry run), and notes (informational notes, e.g. when an existing package has no exports map).',
    },
  ],
  throws: [
    {
      code: 'ERR_INVALID_ARGUMENT',
      when: 'the package name is not a valid npm name (characters outside lowercase letters, digits, dots, underscores, and hyphens; more than 214 characters; or the reserved node_modules or favicon.ico), the name argument differs from the existing package name, or the existing package.json cannot be parsed or is not a JSON object',
    },
    {
      code: 'ERR_INSTALL_FAILED',
      when: 'the package manager cannot be started (spawn failure), the install exits non-zero, or the install times out after 120 s; package.json is rolled back to its original state',
    },
  ],
  examples: [
    {
      label: 'Initialize in the current directory',
      code: "import {integrationInit} from '@astryxdesign/cli/api';\nconst receipt = await integrationInit();",
    },
    {
      label: 'Initialize with a specific name, skip install',
      code: "const receipt = await integrationInit({name: '@acme/astryx-widgets', noInstall: true});",
    },
  ],
};
