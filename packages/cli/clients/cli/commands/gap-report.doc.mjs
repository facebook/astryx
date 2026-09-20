// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx gap-report`.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'gap-report',
  displayName: 'astryx gap-report',
  namespace: 'cli',
  summary: 'Route a design-system gap to its owning package',
  description:
    'Reports a missing component, variant, layout, styling, accessibility, API, or documentation capability. The command selects an explicit package first, then a unique component owner, then Core. The report fans out to every effective handler: project config first, then each loaded integration in config order. Public handlers require --confirm-public per handler; internal handlers always run. A handler failure is isolated and does not prevent later handlers.',
  fn: 'gapReport',
  args: [{name: 'component', param: 'component', required: false}],
  options: [
    {
      flag: '--category <category>',
      param: 'options.category',
      description: 'Gap category (run --list-categories for values)',
    },
    {
      flag: '--reason <reason>',
      param: 'options.reason',
      description: 'What capability was missing or difficult',
    },
    {
      flag: '--additional-context <text>',
      param: 'options.detail',
      description: 'Optional additional context',
    },
    {
      flag: '--package <pkg>',
      param: 'options.package',
      description: 'Route to a specific loaded package',
    },
    {
      flag: '--confirm-public',
      param: 'options.confirmPublic',
      description: 'Consent to public handlers or GitHub issue creation',
    },
    {
      flag: '--list-categories',
      param: 'options.listCategories',
      description: 'List valid report categories without filing',
    },
  ],
  examples: [
    {label: 'List categories', cli: 'astryx gap-report --list-categories'},
    {
      label: 'Route an agent report',
      cli: "astryx gap-report Button --category missing_variant --reason 'Need a compact size'",
    },
    {
      label: 'Confirm public filing',
      cli: "astryx gap-report Button --category docs_gap --reason 'Missing keyboard example' --confirm-public",
    },
  ],
  exitCodes: [
    {
      code: 0,
      when: 'filed, routed-only, confirmation required, skipped, or categories listed',
    },
    {
      code: 1,
      when: 'failed or partial delivery, invalid input, or ambiguous routing',
    },
  ],
  related: ['component', 'discover', 'swizzle'],
};
