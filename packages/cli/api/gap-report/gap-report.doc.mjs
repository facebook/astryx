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
  displayName: 'gapReport()',
  summary: 'Route a design-system gap through the fan-out handler composition.',
  description:
    'Creates a normalized gap report and fans it out to every effective handler: the project config handler first, then each loaded integration handler in config order, deduplicated by handle function identity. Each handler receives a structuredClone of the report and an AbortSignal, then runs in its own worker with a 30 s timeout and stdout redirected to stderr. A timed-out worker is terminated before the next handler starts, so process.exit, process.exitCode, and late continuations cannot affect the CLI process. A public handler requires confirmPublic per handler; internal handlers always run. When no handlers exist, a built-in GitHub/routed-only fallback runs. The aggregate response carries ordered deliveries with per-handler outcomes.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'gapReport(component?: string, options?: GapReportOptions): Promise<GapReportCategoriesResponse | GapReportReceiptResponse>',
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
        'Component or general design-system area. Required unless listCategories is true.',
    },
    {
      name: 'options.category',
      type: 'GapReportCategory',
      description: 'Fixed category from the reported category vocabulary.',
    },
    {
      name: 'options.reason',
      type: 'string',
      description: 'What capability was missing or difficult.',
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
        'Explicit owning package when automatic routing is ambiguous.',
    },
    {
      name: 'options.confirmPublic',
      type: 'boolean',
      description:
        'Explicitly consent to invoking public handlers or creating a GitHub issue.',
      default: 'false',
    },
    {
      name: 'options.listCategories',
      type: 'boolean',
      description: 'Return categories without resolving a route or writing.',
      default: 'false',
    },
    {
      name: 'options.cwd',
      type: 'string',
      description:
        'Directory used to load project config and component ownership.',
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
        'An aggregate receipt with per-handler deliveries, filedCount/routedOnlyCount totals, and overall status.',
    },
  ],
  throws: [
    {
      code: 'ERR_UNKNOWN_CATEGORY',
      when: 'category is not one of the fixed gap-report values',
    },
    {
      code: 'ERR_INVALID_ARGUMENT',
      when: 'a field value is invalid',
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
      when: 'no handler and no issues URL available',
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
      label: 'Confirm public filing',
      code: "await gapReport('Button', {category: 'docs_gap', reason: 'Missing keyboard example', confirmPublic: true});",
    },
  ],
  command: 'gap-report',
  related: ['component', 'discover', 'swizzle'],
};
