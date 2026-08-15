// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx cdn template`. The terminal binding of the
 * `cdnTemplate()` function (referenced via `fn`); its args/flags map to that
 * function's params so a converter can build Commander config + --help from one
 * source of truth.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'cdn template',
  displayName: 'astryx cdn template',
  namespace: 'cli',
  summary: 'Write the no-build-step CDN starter page into your project',
  description:
    'Writes cdn.template.html: a working page that loads Astryx from a public CDN — no bundler, ' +
    'no install, no build step — annotated with the parts that are load-bearing (the theme ' +
    'attribute, the import map, the ?external pin that keeps one React copy, createElement in ' +
    'place of JSX). Open it in a browser and it renders. Every CDN URL is pinned to your ' +
    'installed Astryx version. Leaves an existing file untouched unless --overwrite.',
  fn: 'cdnTemplate',
  args: [{name: 'path', param: 'options.targetPath', required: false}],
  options: [
    {
      flag: '-f, --overwrite',
      param: 'options.overwrite',
      description: 'Replace an existing file',
    },
  ],
  examples: [
    {label: 'Write it at the project root', cli: 'astryx cdn template'},
    {label: 'Somewhere else', cli: 'astryx cdn template public/demo.html'},
  ],
  exitCodes: [
    {code: 0, when: 'success, including when an existing file was left untouched'},
    {code: 1, when: 'the target path escapes the project'},
  ],
  related: ['theme template', 'template', 'init'],
};
