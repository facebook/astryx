// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SchemaDoc for GapReportHandler, the handler `astryx gap-report` calls.
 * @input The GapReportHandler type beside it (`type.ts`), which `parse.mjs`
 *   validates.
 * @output The `gap-report-handler` section of `astryx docs authoring`.
 * @position packages/cli/authoring/gap-report — schema documentation
 */

/** @type {import('@astryxdesign/cli/authoring').SchemaDoc} */
export const doc = {
  type: 'schema',
  name: 'gap-report-handler',
  displayName: 'GapReportHandler',
  namespace: 'authoring',
  description:
    'A handler for `astryx gap-report`: a plain object with an `audience` and a `handle` function. Set it as `gapReport` in astryx.config, or export it as `gapReport` from an integration manifest. Every handler runs: the project handler first, then each integration handler in config order.',
  appliesTo:
    '`gapReport` in astryx.config.*, or the `gapReport` named export of astryx.integration.*',
  fields: [
    {
      name: 'audience',
      type: "'internal' | 'public'",
      description:
        'Whether the destination is internal to your organization or public. A public handler runs only when the caller agrees; an internal handler always runs.',
      required: true,
    },
    {
      name: 'handle',
      type: '(report: GapReport, context: GapReportHandlerContext) => GapReportHandlerReceipt | Promise<GapReportHandlerReceipt>',
      description:
        'Gets the report and returns a receipt. It can be async, and the CLI waits at most 30 seconds for it. A throw, a timeout, or an invalid receipt is a failed delivery, and the other handlers still run.',
      required: true,
      fields: [
        {
          name: 'report',
          type: 'GapReport',
          description: 'The report. Each handler gets its own copy.',
          required: true,
          fields: [
            {
              name: 'report.schemaVersion',
              type: '1',
              description: 'Version of the report shape.',
              required: true,
            },
            {
              name: 'report.component',
              type: 'string',
              description: 'The component the gap is about.',
              required: true,
            },
            {
              name: 'report.category',
              type: 'GapReportCategory',
              description:
                "The kind of gap: 'missing_component', 'missing_variant', 'layout_gap', 'styling_gap', 'a11y_gap', 'api_friction', 'docs_gap', or 'other'.",
              required: true,
            },
            {
              name: 'report.categoryLabel',
              type: 'string',
              description: 'A readable name for the category.',
              required: true,
            },
            {
              name: 'report.intention',
              type: 'string',
              description: 'What the caller was trying to do.',
              required: true,
            },
            {
              name: 'report.detail',
              type: 'string',
              description: 'More detail, when the caller gave some.',
            },
            {
              name: 'report.context',
              type: 'GapReportContext',
              description:
                'Structured triage context. Omitted when the caller gave none, so reports from existing calls keep their previous shape.',
              fields: [
                {
                  name: 'report.context.product',
                  type: 'string',
                  description:
                    'The product or surface where the gap was encountered.',
                },
                {
                  name: 'report.context.task',
                  type: 'string',
                  description:
                    'The task or workflow the caller was trying to complete.',
                },
                {
                  name: 'report.context.observedBehavior',
                  type: 'string',
                  description: 'What happened in the current implementation.',
                },
                {
                  name: 'report.context.expectedBehavior',
                  type: 'string',
                  description: 'What would have supported the task.',
                },
                {
                  name: 'report.context.workaround',
                  type: 'GapReportWorkaround',
                  description: 'The workaround the caller is using, when any.',
                  fields: [
                    {
                      name: 'report.context.workaround.type',
                      type: 'string',
                      description:
                        'A general workaround kind, such as manual, custom_code, or none. This is an open string, not a package-specific label list.',
                    },
                    {
                      name: 'report.context.workaround.cost',
                      type: 'string',
                      description:
                        'The caller-estimated time, complexity, or maintenance cost.',
                    },
                    {
                      name: 'report.context.workaround.description',
                      type: 'string',
                      description:
                        'What the workaround does or why it is insufficient.',
                    },
                  ],
                },
                {
                  name: 'report.context.affectedVersions',
                  type: 'string[]',
                  description:
                    'Additional design-system or product versions where the gap was observed. The target package and installed version remain in report.target.',
                },
                {
                  name: 'report.context.reproduction',
                  type: 'string',
                  description:
                    'Steps, command, or minimal description that reproduces the gap.',
                },
                {
                  name: 'report.context.codeLocation',
                  type: 'string',
                  description:
                    'A file, symbol, route, or other code location related to the gap.',
                },
                {
                  name: 'report.context.impact',
                  type: 'GapReportImpact',
                  description:
                    'The release impact of leaving the gap unresolved.',
                  fields: [
                    {
                      name: 'report.context.impact.releaseBlocking',
                      type: 'boolean',
                      description:
                        "Whether the gap blocks the caller's release.",
                    },
                    {
                      name: 'report.context.impact.description',
                      type: 'string',
                      description:
                        'The affected users, scope, timing, or severity.',
                    },
                  ],
                },
              ],
            },
            {
              name: 'report.source',
              type: 'DebugInvocationSource',
              description:
                "Who sent the report: 'human', 'ai', 'automation', or 'unknown'.",
              required: true,
            },
            {
              name: 'report.timestamp',
              type: 'string',
              description: 'When the report was sent, as ISO 8601.',
              required: true,
            },
            {
              name: 'report.target',
              type: 'GapReportTarget',
              description: 'The package the report is about.',
              required: true,
              fields: [
                {
                  name: 'report.target.package',
                  type: 'string',
                  description: 'The package name.',
                  required: true,
                },
                {
                  name: 'report.target.version',
                  type: 'string',
                  description:
                    'The installed version. Null when it is not known.',
                  required: true,
                },
                {
                  name: 'report.target.issuesUrl',
                  type: 'string',
                  description:
                    'Where the package takes issues. Null when it does not say.',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          name: 'context',
          type: 'GapReportHandlerContext',
          description: 'The context of this call.',
          required: true,
          fields: [
            {
              name: 'context.signal',
              type: 'AbortSignal',
              description: 'Aborted when the handler runs past 30 seconds.',
              required: true,
            },
          ],
        },
      ],
    },
  ],
  examples: [
    {
      label: 'A project handler in astryx.config',
      code:
        'export default {\n' +
        '  gapReport: {\n' +
        "    audience: 'internal',\n" +
        '    async handle(report, {signal}) {\n' +
        '      const url = await fileIssue(report, {signal});\n' +
        "      return {status: 'filed', url};\n" +
        '    },\n' +
        '  },\n' +
        '};',
    },
  ],
  notes: [
    {
      type: 'table',
      headers: ['Receipt field', 'Type', 'Required', 'Description'],
      rows: [
        [
          'status',
          "'filed' | 'routed_only' | 'skipped'",
          'yes',
          "'filed': the handler created or queued the report. 'routed_only': it points to a place to file the report, and must return `url`. 'skipped': it chose not to act, for example on a duplicate.",
        ],
        [
          'url',
          'string',
          'no',
          'An http or https URL. Required when status is routed_only.',
        ],
        [
          'message',
          'string',
          'no',
          'A readable message of at most 2000 characters.',
        ],
      ],
    },
    {
      type: 'prose',
      text: 'The receipt is strict: an unknown field, a URL that is not http or https, or a filed or routed_only receipt with neither `url` nor `message` is invalid.',
    },
  ],
};
