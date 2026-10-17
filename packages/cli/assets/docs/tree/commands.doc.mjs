// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/commands`: every command the CLI ships.
 *
 * Adopts each command doc whose `namespace` is `cli/commands`, so a new
 * command appears here with no edit to this file.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'commands',
  title: 'Commands',
  summary:
    'Every command and subcommand: usage, options, examples, exit codes, and what it does outside a project.',
  keywords: ['commands', 'usage', 'options', 'flags'],
  placement: {parent: 'namespace:cli', slot: 'reference', order: 10},
  slots: {
    commands: {title: 'Commands', accepts: {kinds: ['command']}},
  },
  adopts: [
    {source: {group: 'cli/commands', kinds: ['command']}, into: 'commands'},
  ],
};
