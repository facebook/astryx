// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file globalSetup for the `node` test project.
 * @input Uses the shared ensureCoreBuilt / ensureChartsBuilt helpers.
 * @output Builds @astryxdesign/core and @astryxdesign/charts once, before any
 *   test worker forks.
 * @position Referenced by vitest.config.ts's `node` project. The build-theme
 *   suites need a compiled @astryxdesign/core (`astryx theme build` imports its
 *   compiled theme entry). Building here — once, in the main process, before
 *   Vitest spawns parallel workers — means every suite's beforeAll sees dist
 *   already present and short-circuits, so no two workers ever clean and build
 *   core concurrently. That collision is what nondeterministically broke a
 *   build-theme suite under Vitest 4's reworked pool scheduling ("Could not resolve dist/index.js").
 *
 *   Charts is built for the same reason: the `node` project resolves workspace
 *   packages through their published `exports` (dist, not src), and
 *   @astryxdesign/vega's source imports @astryxdesign/charts for the shared
 *   categorical palette. Without a built charts, every vega suite dies at
 *   import with "Failed to resolve entry for package @astryxdesign/charts".
 *   `ensureChartsBuilt` already runs `ensureCoreBuilt` first.
 *
 * SYNC: When modified, update this header.
 */

import {ensureChartsBuilt} from './packages/cli/clients/cli/commands/ensure-core-built.mjs';

export default function setup() {
  ensureChartsBuilt();
}
