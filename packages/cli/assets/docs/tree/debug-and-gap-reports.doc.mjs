// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/debug-and-gap-reports`: receive a record
 * of each CLI run with `debug`, and handle `astryx gap-report` with
 * `gapReport`, both named exports of the integration manifest.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'debug-and-gap-reports',
  placement: {parent: 'namespace:integrations', slot: 'contribute', order: 70},
  title: 'Debug and gap reports',
  category: 'guide',
  keywords: ['gap report', 'debug handler'],
  description:
    'Receive a record of each CLI run in apps that use your package, and handle the gap reports they send about it.',
  sections: [
    {
      id: 'record-runs-with-debug',
      title: 'Record runs with debug',
      content: [
        {
          type: 'prose',
          text: 'Export a `debug` function from `astryx.integration.mjs`, and the CLI calls it once for every command run in each app that has your package installed.',
        },
        {
          type: 'code',
          lang: 'js',
          code: `// astryx.integration.mjs
import {appendFileSync} from 'node:fs';

/** @param {import('@astryxdesign/cli/authoring').DebugEvent} event */
export function debug(event) {
  if (event.outcome !== 'ok') {
    appendFileSync('acme-failed-runs.ndjson', JSON.stringify(event) + '\\n');
  }
}

export default {
  components: './components',
};`,
        },
        {
          type: 'prose',
          text: 'The event is a `DebugEvent` with `command`, `outcome`, `exitCode`, `durationMs`, `error`, and more, its values scrubbed (`redacted: true`). Every field is in {@link generic:authoring}.',
        },
        {
          type: 'prose',
          text: "Keep the function synchronous: the CLI calls it as the process exits and never waits for a promise. The app's own `debug` handler runs first, then yours. A handler that throws is skipped, and the command's output and exit code stay the same.",
        },
        {
          type: 'prose',
          text: '`debug` is a named export, not a manifest field, so a CLI that does not know it ignores it and loads the rest of your manifest.',
        },
      ],
    },
    {
      id: 'turn-off-debug-in-an-app',
      title: 'Turn off debug in an app',
      content: [
        {
          type: 'prose',
          text: "An app can refuse every integration's `debug` handler and keep its own. It sets `inheritDebug` in its package.json:",
        },
        {
          type: 'code',
          lang: 'json',
          code: '{"astryx": {"inheritDebug": false}}',
        },
        {
          type: 'prose',
          text: 'From then on, your handler no longer runs in that app.',
        },
      ],
    },
    {
      id: 'handle-gap-reports',
      title: 'Handle gap reports',
      content: [
        {
          type: 'prose',
          text: 'Export a `gapReport` handler, and `astryx gap-report` in an app sends it each gap report, such as a missing component or variant. The handler files the report and returns a receipt.',
        },
        {
          type: 'code',
          lang: 'js',
          code: `/** @type {import('@astryxdesign/cli/authoring').GapReportHandler} */
export const gapReport = {
  audience: 'public',
  async handle(report, {signal}) {
    if (report.target.package !== '@acme/astryx-widgets') return {status: 'skipped'};
    const body = JSON.stringify(report);
    const response = await fetch('https://tracker.example.com/issues', {method: 'POST', body, signal});
    const {url} = await response.json();
    return {status: 'filed', url};
  },
};`,
        },
        {
          type: 'prose',
          text: 'Every handler in the app gets every report, so check `report.target.package` and skip reports about other packages. The receipt `status` is one of:',
        },
        {
          type: 'table',
          headers: ['`status`', 'Meaning'],
          rows: [
            [
              '`filed`',
              'You created or queued the report. Return `url` or `message`.',
            ],
            [
              '`routed_only`',
              'You point the caller to where to file it. `url` is required.',
            ],
            ['`skipped`', 'You chose not to act, for example on a duplicate.'],
          ],
        },
        {
          type: 'prose',
          text: 'The CLI waits 30 seconds, then aborts `signal`. A throw, a timeout, or an invalid receipt fails your delivery, and the command exits 1; the other handlers still run. Like `debug`, `gapReport` is a named export that older CLIs ignore.',
        },
      ],
    },
    {
      id: 'ask-before-filing-in-public',
      title: 'Ask before filing in public',
      content: [
        {
          type: 'prose',
          text: "Set `audience: 'public'` when your handler writes somewhere the public can read. The CLI runs it only when the caller passes `--confirm-public`; an `'internal'` handler always runs.",
        },
        {
          type: 'code',
          lang: 'bash',
          code: "npx astryx gap-report AcmeCarousel --category missing_variant --reason 'Need a vertical layout'",
        },
        {
          type: 'code',
          lang: 'text',
          code: `handlerType: integration
handler:     @acme/astryx-widgets
audience:    public
status:      consent_required
message:     Rerun with --confirm-public to file this report.`,
        },
        {
          type: 'prose',
          text: 'With `--confirm-public`, the same delivery reads `status: filed` and shows your `url`. The report goes to the package named by `--package`, else the package that owns the component, else Core.',
        },
      ],
    },
    {
      id: 'fall-back-to-issues-url',
      title: 'Fall back to issuesUrl',
      content: [
        {
          type: 'prose',
          text: "When the app has no `gapReport` handler at all, the CLI routes the report to the target package's `issuesUrl` from its manifest instead.",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'A GitHub issues URL, such as `https://github.com/acme/widgets/issues`, gets an issue filed with the GitHub CLI, `gh`, once the caller passes `--confirm-public`.',
            'Any other URL comes back as a `routed_only` receipt for the caller to open.',
            'With no `issuesUrl`, the command fails: `Package "@acme/astryx-widgets" provides neither a report handler nor an issues URL.`',
          ],
        },
        {
          type: 'prose',
          text: 'One handler anywhere in the app, from the app or from any package, turns the fallback off for every report. See {@link command:gap-report}.',
        },
      ],
    },
  ],
};
