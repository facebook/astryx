// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build.help leaf — the "how to build a page" playbook.
 *
 * `build` with no query returns this envelope. The playbook is data — steps,
 * rules, and related lookups — so a `--json` or programmatic caller gets the
 * same guidance the terminal shows. Commands are bare subcommands with no
 * package-manager prefix, which keeps the JSON environment-agnostic; the CLI
 * renders each one with the caller's invocation, as it does build.kit's
 * `hint.commands`.
 */

/**
 * The page-building playbook (emitted when `build` runs with no query).
 *
 * @returns {import('../build.type.mjs').BuildHelpResponse}
 */
export function buildHelp() {
  return {
    type: 'build.help',
    data: {
      playbook: true,
      title: 'How to build a page with Astryx',
      steps: [
        {
          title: "Find a starting point for what you're building",
          commands: [{command: 'build "<what you\'re building>"'}],
          returns:
            'the closest [page] template, the [block]s that cover parts, and the [component]s to fill the gaps, with a recommended start',
        },
        {
          title: 'If a [page] template matches, scaffold it and adapt',
          commands: [{command: 'template <name> [path]'}],
        },
        {
          title: 'If nothing matches exactly, compose',
          commands: [
            {
              command: 'template <name> --skeleton',
              purpose: "study a close page's layout",
            },
            {
              command: 'template <BlockName>',
              purpose: 'drop in each block from the kit',
            },
            {
              command: 'component <Name>',
              purpose: 'fill remaining gaps (read props)',
            },
          ],
        },
      ],
      rules: [
        'No <div>/raw HTML for layout — use VStack/HStack/Grid/Stack/Card etc.',
        'No style={{}} — use component props, and design tokens for values.',
        'Wrap the app in <Theme theme={...}> and import core reset.css + astryx.css.',
      ],
      related: [
        {command: 'docs tokens', purpose: 'the design tokens'},
        {
          command: 'search <query>',
          purpose: 'a neutral lookup of any component, doc, or template',
        },
      ],
    },
  };
}
