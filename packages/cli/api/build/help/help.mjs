// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build.help leaf — the "how to build a page" playbook signal.
 *
 * `build` with no query returns this envelope: a pure marker that the command
 * renderer expands into the workflow playbook prose. It carries no data beyond
 * `playbook: true`, so the JSON shape stays environment-agnostic and stable.
 */

/**
 * The page-building playbook signal (emitted when `build` runs with no query).
 *
 * @returns {import('../../../types/build').BuildHelpResponse}
 */
export function buildHelp() {
  return {type: 'build.help', data: {playbook: true}};
}
