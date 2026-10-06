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
    'Sends a gap report to every configured handler: the project config handler first, then each integration handler in config order. Optional structured context carries product and task context, behavior, workaround, affected versions, reproduction or code location, and release impact. ' +
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
      name: 'options.context.product',
      type: 'string',
      description:
        'Optional product or surface where the gap was encountered (up to 8000 characters).',
    },
    {
      name: 'options.context.task',
      type: 'string',
      description:
        'Optional task or workflow the caller was trying to complete (up to 8000 characters).',
    },
    {
      name: 'options.context.observedBehavior',
      type: 'string',
      description:
        'Optional observed behavior in the current implementation (up to 8000 characters).',
    },
    {
      name: 'options.context.expectedBehavior',
      type: 'string',
      description:
        'Optional behavior that would have supported the task (up to 8000 characters).',
    },
    {
      name: 'options.context.workaround',
      type: 'GapReportWorkaround',
      description:
        'Optional workaround type, caller-estimated cost, and description. Type and cost are open strings so public integrations can use their own general vocabulary.',
    },
    {
      name: 'options.context.workaround.type',
      type: 'string',
      description:
        'Optional general workaround kind, such as manual, custom_code, or none (up to 8000 characters).',
    },
    {
      name: 'options.context.workaround.cost',
      type: 'string',
      description:
        'Optional caller-estimated time, complexity, or maintenance cost (up to 8000 characters).',
    },
    {
      name: 'options.context.workaround.description',
      type: 'string',
      description:
        'Optional explanation of the workaround or why it is insufficient (up to 8000 characters).',
    },
    {
      name: 'options.context.affectedVersions',
      type: 'string[]',
      description:
        'Optional additional versions where the gap was observed (up to 20 unique values, 120 characters each). The selected target package and installed version remain automatic.',
    },
    {
      name: 'options.context.reproduction',
      type: 'string',
      description:
        'Optional reproduction steps, command, or minimal description (up to 8000 characters).',
    },
    {
      name: 'options.context.codeLocation',
      type: 'string',
      description:
        'Optional file, symbol, route, or other code location (up to 8000 characters).',
    },
    {
      name: 'options.context.impact',
      type: 'GapReportImpact',
      description:
        'Optional release-blocking boolean and impact description (up to 8000 characters).',
    },
    {
      name: 'options.context.impact.releaseBlocking',
      type: 'boolean',
      description:
        "Whether the gap blocks the caller's release. Omit it when unknown.",
    },
    {
      name: 'options.context.impact.description',
      type: 'string',
      description:
        'Optional affected users, scope, timing, or severity (up to 8000 characters).',
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
      when: 'component is over 120 characters, category is over 80, reason is over 2000, detail or a context text field is not a string or is over 8000 characters, context has an unknown or invalid field, or affectedVersions is not a string array of at most 20 unique values of at most 120 characters each',
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
    {
      label: 'Include structured triage context',
      code: "const receipt = await gapReport('Button', {category: 'api_friction', reason: 'Selection state is hard to preserve', context: {product: 'Admin dashboard', task: 'Edit a saved filter', observedBehavior: 'Selection resets when the dialog reopens', expectedBehavior: 'Selection remains until explicitly cleared', workaround: {type: 'custom_code', cost: 'high', description: 'Mirror state outside the component'}, affectedVersions: ['0.6.5'], codeLocation: 'src/filters/EditFilter.tsx', impact: {releaseBlocking: true, description: 'Blocks the next dashboard release'}}});",
    },
  ],
  command: 'gap-report',
  related: ['component', 'discover', 'swizzle'],
};
