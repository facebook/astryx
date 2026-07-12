// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file globalSetup for the `node` test project.
 * @input Uses the shared ensureCoreBuilt helper.
 * @output Builds @astryxdesign/core once, before any test worker forks.
 * @position Referenced by vitest.config.ts's `node` project. The build-theme
 *   suites need a compiled @astryxdesign/core (`astryx theme build` imports its
 *   compiled theme entry). Building here — once, in the main process, before
 *   Vitest spawns parallel workers — means every suite's beforeAll sees dist
 *   already present and short-circuits, so no two workers ever run core's
 *   `rimraf dist && build` concurrently. That concurrent-build collision is
 *   what nondeterministically broke a build-theme suite under Vitest 4's
 *   reworked pool scheduling ("Could not resolve dist/index.js").
 *
 * SYNC: When modified, update this header.
 */

import {ensureCoreBuilt} from './packages/cli/src/commands/ensure-core-built.mjs';

export default function setup() {
  ensureCoreBuilt();
}
