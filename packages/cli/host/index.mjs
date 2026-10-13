// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Supported programmatic entry for hosts that run the unchanged Astryx
 * CLI from a compatible package set.
 *
 * @position host — public `@astryxdesign/cli/host` boundary over the
 *   package-private runtime implementation.
 */

export {runHostedCli} from '../foundation/runtime/package-set.mjs';
