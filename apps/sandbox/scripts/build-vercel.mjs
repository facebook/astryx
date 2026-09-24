// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Build the standalone Sandbox static export for Vercel's Other preset.
 * @input Workspace source packages and the project-root Vercel build environment.
 * @output apps/sandbox/out with /sandbox asset paths; no Next adapter or server.
 * @position Sandbox project build, independent of the docsite Vercel project.
 */

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const sandboxBuildSteps = [
  {name: 'build plugin', args: ['-F', '@astryxdesign/build', 'build']},
  {name: 'core', args: ['-F', '@astryxdesign/core', 'build']},
  {name: 'lab', args: ['-F', '@astryxdesign/lab', 'build']},
  {name: 'charts', args: ['-F', '@astryxdesign/charts', 'build']},
  {
    name: 'Sandbox theme dependencies',
    args: ['-F', '@astryxdesign/sandbox', 'build:deps'],
  },
  {name: 'CLI theme templates', args: ['bundle:cli-themes']},
  {name: 'CLI API types', args: ['-F', '@astryxdesign/cli', 'sync:api-types']},
  {
    name: 'Sandbox static export',
    args: ['-F', '@astryxdesign/sandbox', 'build'],
  },
];

export function buildVercelSandbox(
  root,
  run = execFileSync,
  environment = process.env,
) {
  if (environment.NEXT_ADAPTER_PATH || environment.NEXT_ADAPTER_VERCEL_CONFIG) {
    throw new Error(
      'Sandbox Vercel project must use Framework Preset=Other, not the Next adapter',
    );
  }
  for (const step of sandboxBuildSteps) {
    const env =
      step.name === 'Sandbox static export'
        ? {
            ...environment,
            SANDBOX_BASE_PATH: '/sandbox',
            SANDBOX_TEMPLATE_ASSETS_BASE_PATH: '/sandbox/template-assets',
            NODE_OPTIONS:
              `${environment.NODE_OPTIONS ?? ''} --max-old-space-size=4096`.trim(),
          }
        : environment;
    try {
      run('pnpm', step.args, {cwd: root, stdio: 'inherit', env});
    } catch (error) {
      throw new Error(
        `${step.name} build failed (${error.status ?? error.signal ?? 'unknown exit'})`,
        {
          cause: error,
        },
      );
    }
  }
  const index = path.join(root, 'apps/sandbox/out/index.html');
  if (!fs.existsSync(index))
    throw new Error('Sandbox static export has no out/index.html');
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const root = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../..',
  );
  buildVercelSandbox(root);
}
