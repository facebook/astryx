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
  namespace: 'cli/commands',
  summary: 'Report a missing component or feature to the package that owns it',
  description:
    'Reports a missing component, variant, layout, styling, accessibility, API, or documentation capability to the package that owns it: the --package you name, else the integration whose component replaces it, else the one package that provides the component, else Core. ' +
    'Every configured handler receives the report: the project config handler first, then each integration handler in config order. Public handlers run only with --confirm-public; internal handlers always run. A failing handler does not stop the others. ' +
    "With no handler it files a GitHub issue for the owning package, only with --confirm-public (without it nothing is sent), or returns the package's issues URL when that is not on GitHub. " +
    'The report records whether an agent or a person ran it.',
  fn: 'gapReport',
  args: [
    {
      name: 'component',
      param: 'component',
      required: false,
      description:
        'Component or design-system area the gap is about, up to 120 characters. Required unless --list-categories is set.',
    },
  ],
  options: [
    {
      flag: '--category <category>',
      param: 'options.category',
      description:
        'Gap category (run --list-categories for values). Required unless --list-categories is set.',
    },
    {
      flag: '--reason <reason>',
      param: 'options.reason',
      description:
        'What capability was missing or difficult, up to 2000 characters. Required unless --list-categories is set.',
    },
    {
      flag: '--additional-context <text>',
      param: 'options.detail',
      description: 'Optional additional context, up to 8000 characters',
    },
    {
      flag: '--package <pkg>',
      param: 'options.package',
      description:
        'Package that owns the gap: @astryxdesign/core or a loaded integration. Overrides automatic routing, which picks the integration whose component replaces the named Core component, else the one package that provides it, else Core; needed when more than one package provides the component',
    },
    {
      flag: '--confirm-public',
      param: 'options.confirmPublic',
      description:
        'Allow public delivery: public handlers run, and with no handler it files a GitHub issue with your gh login',
    },
    {
      flag: '--list-categories',
      param: 'options.listCategories',
      description:
        'List valid report categories without filing; the component and the other gap-report options are ignored',
    },
  ],
  examples: [
    {label: 'List categories', cli: 'astryx gap-report --list-categories'},
    {
      label: 'Prepare a report (nothing public happens without --confirm-public)',
      cli: "astryx gap-report Button --category missing_variant --reason 'Need a compact size'",
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
