// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for the `astryx cdn` command group. A parent group with no
 * behavior of its own; it dispatches to the template subcommand, which carries
 * the actual args, flags, and wrapped function.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'cdn',
  displayName: 'astryx cdn',
  namespace: 'cli',
  summary: 'Use Astryx from a CDN, with no build step',
  description:
    'The CDN command group, for pages with no bundler: prototypes, embeds, docs pages, a ' +
    'reproduction you can send someone. Running astryx cdn with no subcommand prints the ' +
    'subcommand list; the work happens in template, which writes a working annotated page.',
  subcommands: ['template'],
  examples: [{label: 'Write the starter page', cli: 'astryx cdn template'}],
  exitCodes: [
    {code: 0, when: 'success (help shown, or a subcommand succeeded)'},
    {code: 1, when: 'an unknown subcommand'},
  ],
  related: ['theme template', 'template', 'init'],
};
