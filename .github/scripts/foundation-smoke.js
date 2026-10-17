#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Repository entry for the same foundation guard shipped to adopters.
 * @input Built Sandbox by default, or the shared guard's URL/Storybook options.
 * @output Browser measurements and the shared guard's pass/fail exit code.
 * @position CI wrapper; consumer behavior lives in the CLI asset.
 */

const path = require('node:path');
const guard = require('../../packages/cli/assets/checks/foundation-smoke.mjs');
module.exports = guard;

if (require.main === module) {
  if (
    !process.argv.some(arg =>
      ['--url', '--sandbox-dir', '--storybook-dir'].includes(arg.split('=')[0]),
    )
  ) {
    process.argv.push(
      '--sandbox-dir',
      path.resolve(__dirname, '../../apps/sandbox/out'),
    );
  }
  guard.run().catch(error => {
    console.error(`Foundation smoke check failed: ${error.message}`);
    process.exitCode = 1;
  });
}
