// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `gapReport()` / `astryx gap-report`.
 * @position packages/cli/api/gap-report — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'gapReport',
  namespace: 'cli/api',
  displayName: 'gapReport()',
  summary:
    'Report a missing or hard-to-use design-system capability to the package that owns it.',
  description:
    'Sends a gap report to every configured handler: the project config handler first, then each integration handler in config order. ' +
    'Each handler has 30 s to finish, and its output goes to stderr. Public handlers run only with confirmPublic; internal handlers always run. ' +
    "With no handler, it files a GitHub issue for the owning package only with confirmPublic (without it nothing is sent), or returns the package's issues URL when that is not on GitHub. " +
    'The report records whether an agent or a person ran it, and the response lists each handler outcome in order.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'gapReport(component: string | undefined, options?: GapReportOptions): Promise<GapReportCategoriesResponse | GapReportReceiptResponse>',
  keywords: [
    'gap',
    'report',
    'feedback',
    'issue',
    'integration',
    'routing',
    'handler',
    'fan-out',
  ],
  params: [
    {
      name: 'component',
      type: 'string',
      description:
        'Component or general design-system area, up to 120 characters. Required unless listCategories is true.',
    },
    {
      name: 'options.category',
      type: 'GapReportCategory',
      description:
        'Fixed category from the reported category vocabulary. Required unless listCategories is true.',
    },
    {
      name: 'options.reason',
      type: 'string',
      description:
        'What capability was missing or difficult, up to 2000 characters. Required unless listCategories is true.',
    },
    {
      name: 'options.detail',
      type: 'string',
      description: 'Optional additional context (up to 8000 characters).',
    },
    {
      name: 'options.package',
      type: 'string',
      description:
        'Package that owns the gap: @astryxdesign/core, or a loaded integration by package name or config entry. Overrides automatic owner routing; required when more than one package provides the component.',
    },
    {
      name: 'options.confirmPublic',
      type: 'boolean',
      description:
        'Allow public delivery: public handlers run, and with no handler a GitHub issue is filed through the gh CLI.',
      default: 'false',
    },
    {
      name: 'options.listCategories',
      type: 'boolean',
      description:
        'Return categories without resolving a route or writing; the component and every other option are ignored.',
      default: 'false',
    },
    {
      name: 'options.cwd',
      type: 'string',
      description:
        'Directory used to load project config and component ownership.',
      default: 'process.cwd()',
    },
  ],
  returns: [
    {
      type: 'gap-report.categories',
      description: 'The fixed category values and labels.',
    },
    {
      type: 'gap-report.file',
      description:
        'Receipt: status (filed, partial, failed, routed_only, consent_required, skipped), package, issuesUrl, ordered deliveries (handlerType, handler, audience, status, url, message), filedCount, and routedOnlyCount.',
    },
  ],
  throws: [
    {
      code: 'ERR_MISSING_ARGUMENT',
      when: 'component, category, or reason is missing, blank, or not a string (unless listCategories is true)',
    },
    {
      code: 'ERR_UNKNOWN_CATEGORY',
      when: 'category is not one of the fixed gap-report values',
    },
    {
      code: 'ERR_INVALID_ARGUMENT',
      when: 'component is over 120 characters, category is over 80, reason is over 2000, or detail is not a string or is over 8000 characters',
    },
    {
      code: 'ERR_AMBIGUOUS_COMPONENT',
      when: 'more than one package owns the named component',
    },
    {
      code: 'ERR_UNKNOWN_PACKAGE',
      when: 'the explicitly selected package is not loaded',
    },
    {
      code: 'ERR_NOT_FOUND',
      when: 'no report handler is configured and the owning package has no issues URL',
    },
  ],
  examples: [
    {
      label: 'List categories',
      code: 'const categories = await gapReport(undefined, {listCategories: true});',
    },
    {
      label: 'Route without public mutation',
      code: "const receipt = await gapReport('Button', {category: 'missing_variant', reason: 'Need a compact size'});",
    },
    {
      label: 'Name the owning package',
      code: "const receipt = await gapReport('Button', {category: 'docs_gap', reason: 'Missing keyboard example', package: '@astryxdesign/core'});",
    },
  ],
  command: 'gap-report',
  related: ['component', 'discover', 'swizzle'],
};
