// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file globalSetup for the `node` test project.
 * @input Shared ensureCoreBuilt helper and authored Sandbox template descriptors.
 * @output Builds Core and regenerates the Sandbox template registry and route
 *   wrappers once, before any test worker forks.
 * @position Referenced by vitest.config.ts's `node` project. The build-theme
 *   suites need a compiled Core; the Sandbox route contract imports generated
 *   template metadata and scans ignored wrappers that do not exist in a fresh
 *   checkout. Run both prerequisites here, serially and before the test workers,
 *   rather than depending on an unrelated build job or local generated files.
 *
 * SYNC: When modified, update this header.
 */

import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {ensureCoreBuilt} from './packages/cli/clients/cli/commands/ensure-core-built.mjs';

export default function setup() {
  ensureCoreBuilt();
  // The ignored registry and ~700 physical page wrappers are build outputs,
  // not fixtures to check in. The route-manifest test must see the same inputs
  // as `pnpm -F @astryxdesign/sandbox build` on a clean CI checkout.
  execFileSync(
    process.execPath,
    [fileURLToPath(new URL('./scripts/sync-templates.js', import.meta.url))],
    {
      cwd: fileURLToPath(new URL('.', import.meta.url)),
      maxBuffer: 32 * 1024 * 1024,
    },
  );
}
