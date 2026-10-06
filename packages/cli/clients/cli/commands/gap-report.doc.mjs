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
    'Reports a missing component, variant, layout, styling, accessibility, API, or documentation capability to the package that owns it: the --package you name, else the one package that provides the component, else Core. Optional structured context records the product and task, observed and expected behavior, workaround, affected versions, reproduction or code location, and release impact. ' +
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
      flag: '--product-context <text>',
      param: 'options.context.product',
      description: 'Optional product or surface context, up to 8000 characters',
    },
    {
      flag: '--task-context <text>',
      param: 'options.context.task',
      description: 'Optional task or workflow context, up to 8000 characters',
    },
    {
      flag: '--observed-behavior <text>',
      param: 'options.context.observedBehavior',
      description: 'Optional observed behavior, up to 8000 characters',
    },
    {
      flag: '--expected-behavior <text>',
      param: 'options.context.expectedBehavior',
      description: 'Optional expected behavior, up to 8000 characters',
    },
    {
      flag: '--workaround-type <type>',
      param: 'options.context.workaround.type',
      description:
        'Optional general workaround kind, such as manual, custom_code, or none',
    },
    {
      flag: '--workaround-cost <cost>',
      param: 'options.context.workaround.cost',
      description:
        'Optional caller-estimated workaround cost, such as time, complexity, or maintenance burden',
    },
    {
      flag: '--workaround-description <text>',
      param: 'options.context.workaround.description',
      description: 'Optional workaround description, up to 8000 characters',
    },
    {
      flag: '--affected-version <version...>',
      param: 'options.context.affectedVersions',
      description:
        'Optional additional affected versions (up to 20 values, 120 characters each); the target package version is still detected automatically',
    },
    {
      flag: '--reproduction <text>',
      param: 'options.context.reproduction',
      description:
        'Optional reproduction steps or command, up to 8000 characters',
    },
    {
      flag: '--code-location <location>',
      param: 'options.context.codeLocation',
      description:
        'Optional file, symbol, route, or other code location, up to 8000 characters',
    },
    {
      flag: '--release-blocking',
      param: 'options.context.impact.releaseBlocking',
      description: "Mark the gap as blocking the caller's release",
    },
    {
      flag: '--impact <text>',
      param: 'options.context.impact.description',
      description:
        'Optional release impact, affected users, scope, timing, or severity, up to 8000 characters',
    },
    {
      flag: '--package <pkg>',
      param: 'options.package',
      description:
        'Package that owns the gap: @astryxdesign/core or a loaded integration. Overrides automatic routing; needed when more than one package provides the component',
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
      label:
        'Prepare a report (nothing public happens without --confirm-public)',
      cli: "astryx gap-report Button --category missing_variant --reason 'Need a compact size'",
    },
    {
      label: 'Include structured triage context',
      cli: "astryx gap-report Button --category api_friction --reason 'Selection state is hard to preserve' --product-context 'Admin dashboard' --task-context 'Edit a saved filter' --observed-behavior 'Selection resets when the dialog reopens' --expected-behavior 'Selection remains until explicitly cleared' --workaround-type custom_code --workaround-cost high --workaround-description 'Mirror state outside the component' --affected-version 0.6.5 --code-location src/filters/EditFilter.tsx --release-blocking --impact 'Blocks the next dashboard release'",
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
