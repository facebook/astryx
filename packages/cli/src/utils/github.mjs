/**
 * @file GitHub utilities for XDS CLI
 *
 * Shared helpers for interacting with the GitHub CLI (`gh`).
 * Used by gap-report and swizzle commands.
 *
 * Gap reporting can be configured via xds.config.mjs:
 *   gapReport: false                                — disable entirely
 *   gapReport: { command: './scripts/report-gap.sh' } — run custom script (receives JSON on stdin)
 *
 * Or via environment variable:
 *   XDS_GAP_REPORT=off                              — disable entirely
 *   XDS_GAP_REPORT=./scripts/report-gap.sh          — run custom script
 */

import {execFileSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

/** Default target repository for gap report issues. */
const DEFAULT_REPO = 'facebookexperimental/xds';

/** Gap report category options. */
export const GAP_CATEGORIES = [
  {value: 'missing_component', label: 'Missing component'},
  {value: 'missing_variant', label: 'Missing variant or prop'},
  {value: 'layout_gap', label: 'Layout gap'},
  {value: 'styling_gap', label: 'Styling gap'},
  {value: 'a11y_gap', label: 'Accessibility gap'},
  {value: 'api_friction', label: 'API friction'},
  {value: 'docs_gap', label: 'Documentation gap'},
  {value: 'other', label: 'Other'},
];

/**
 * Load gap report configuration.
 *
 * Priority: env var > xds.config.mjs > default (GitHub issue)
 *
 * Returns { enabled: boolean, command?: string }
 *   - enabled: false → gap reporting disabled
 *   - command: string → run this script instead of creating a GitHub issue
 *   - neither → default behavior (GitHub issue to facebookexperimental/xds)
 */
export function loadGapReportConfig() {
  // 1. Check environment variable
  const envVar = process.env.XDS_GAP_REPORT;
  if (envVar) {
    if (envVar === 'off' || envVar === 'false' || envVar === '0') {
      return {enabled: false};
    }
    // Treat as custom command
    return {enabled: true, command: envVar};
  }

  // 2. Check xds.config.mjs
  const configPath = path.join(process.cwd(), 'xds.config.mjs');
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      const match = content.match(/gapReport\s*:\s*(.+?)[\s,}]/s);
      if (match) {
        const value = match[1].trim();
        if (value === 'false') {
          return {enabled: false};
        }
        // Look for command property in object literal
        const cmdMatch = content.match(
          /gapReport\s*:\s*\{[^}]*command\s*:\s*['"](.+?)['"]/s,
        );
        if (cmdMatch) {
          return {enabled: true, command: cmdMatch[1]};
        }
      }
    } catch {
      // Config parse error — fall through to defaults
    }
  }

  // 3. Default
  return {enabled: true};
}

/**
 * Check if `gh` CLI is installed and authenticated.
 * Returns true if ready, false otherwise.
 */
export function checkGhCli() {
  try {
    execFileSync('gh', ['auth', 'status'], {stdio: 'ignore'});
    return true;
  } catch {
    return false;
  }
}

/**
 * Idempotently create the `gap-report` and `gap-analysis` labels.
 * Uses `--force` to avoid errors if labels already exist.
 */
function ensureGapReportLabel() {
  try {
    execFileSync(
      'gh',
      [
        'label',
        'create',
        'gap-report',
        '--repo',
        DEFAULT_REPO,
        '--color',
        'D4C5F9',
        '--description',
        'Auto-filed gap report from swizzle/gap-report CLI',
        '--force',
      ],
      {stdio: 'ignore'},
    );
    execFileSync(
      'gh',
      [
        'label',
        'create',
        'gap-analysis',
        '--repo',
        DEFAULT_REPO,
        '--color',
        '0E8A16',
        '--description',
        'Curated gap analysis summary',
        '--force',
      ],
      {stdio: 'ignore'},
    );
  } catch {
    // Best-effort — labels may already exist or user may lack permissions
  }
}

/**
 * Run a custom gap report command, piping report data as JSON to stdin.
 *
 * @param {string} command  Script path to execute
 * @param {object} report   Report data (component, category, intention, detail, source)
 * @returns {string} stdout from the command
 */
function runCustomCommand(command, report) {
  const resolved = path.resolve(process.cwd(), command);
  const json = JSON.stringify(report, null, 2);

  const result = execFileSync(resolved, [], {
    input: json,
    encoding: 'utf-8',
  });

  return result.trim();
}

/**
 * Create a gap report — either via GitHub issue or custom command.
 *
 * @param {object} opts
 * @param {string} opts.component  Component name (e.g. "Button")
 * @param {string} opts.category   One of GAP_CATEGORIES values
 * @param {string} opts.intention  What the user was trying to achieve
 * @param {string} [opts.detail]   Additional context
 * @param {string} [opts.source]   Who filed it: "interactive", "llm-auto", "cli"
 * @returns {string|null} URL of the created issue (or custom command output), null if disabled
 */
export function createGapReport({
  component,
  category,
  intention,
  detail,
  source = 'cli',
}) {
  const config = loadGapReportConfig();

  if (!config.enabled) {
    return null;
  }

  const categoryLabel =
    GAP_CATEGORIES.find(c => c.value === category)?.label ?? category;

  const report = {
    component,
    category,
    categoryLabel,
    intention,
    detail: detail || null,
    source,
    timestamp: new Date().toISOString(),
  };

  // Custom command mode — pipe JSON to the script
  if (config.command) {
    return runCustomCommand(config.command, report);
  }

  // Default mode — create GitHub issue
  ensureGapReportLabel();

  const title = `[gap] ${component}: ${intention.slice(0, 70)}`;

  const body = [
    '| Field | Value |',
    '|-------|-------|',
    `| **Component** | ${component} |`,
    `| **Category** | ${categoryLabel} |`,
    `| **Source** | ${source} |`,
    `| **Timestamp** | ${report.timestamp} |`,
    '',
    '## User Intention',
    '',
    intention,
    ...(detail
      ? ['', '## Additional Context', '', detail]
      : []),
  ].join('\n');

  const result = execFileSync(
    'gh',
    [
      'issue',
      'create',
      '--repo',
      DEFAULT_REPO,
      '--title',
      title,
      '--body',
      body,
      '--label',
      'gap-report',
    ],
    {encoding: 'utf-8'},
  );

  return result.trim();
}
