// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Automatic gap-report routing and delivery — fan-out composition.
 *
 * Resolves the report target from the configured project, then fans the
 * normalized report out to every effective handler: project config first,
 * then each loaded integration in astryx.config order. Each handler is
 * isolated in a worker: stdout→stderr, process exit contained, 30 s timeout,
 * one throw/timeout/exit = that handler's failed delivery; later handlers still
 * run. A public handler is skipped (consent_required) unless confirmPublic.
 *
 * When the effective handler set is empty, a built-in GitHub/routed-only
 * fallback runs. Any handlers present suppress the built-in fallback.
 */

import {Worker} from 'node:worker_threads';
import {AstryxError} from '../error.mjs';
import {Project} from '../../foundation/config/project.mjs';
import {CORE_PACKAGE} from '../../foundation/discovery/component-discovery.mjs';
import {captureEnv} from '../../foundation/debug/event.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';
import {parseGapReportReceipt} from '../../authoring/gap-report/parse.mjs';

/** @typedef {import('../../authoring/gap-report/type').GapReportHandler} GapReportHandler */
/** @typedef {import('../../authoring/gap-report/type').GapReport} GapReport */

const HANDLER_TIMEOUT_MS = 30_000;
const HANDLER_ABORT_GRACE_MS = 25;
const HANDLER_WORKER = new URL('./gap-report-worker.mjs', import.meta.url);

/** Fixed category vocabulary retained from the original CLI surface. */
export const GAP_REPORT_CATEGORIES = Object.freeze([
  Object.freeze({value: 'missing_component', label: 'Missing component'}),
  Object.freeze({value: 'missing_variant', label: 'Missing variant or prop'}),
  Object.freeze({value: 'layout_gap', label: 'Layout gap'}),
  Object.freeze({value: 'styling_gap', label: 'Styling gap'}),
  Object.freeze({value: 'a11y_gap', label: 'Accessibility gap'}),
  Object.freeze({value: 'api_friction', label: 'API friction'}),
  Object.freeze({value: 'docs_gap', label: 'Documentation gap'}),
  Object.freeze({value: 'other', label: 'Other'}),
]);

export const PUBLIC_CONFIRMATION_MESSAGE =
  'Rerun with --confirm-public to file this report.';

/**
 * @typedef {object} ReportTarget
 * @property {string} package
 * @property {string|null} version
 * @property {string|null} issuesUrl
 */

/**
 * @typedef {(
 *   | {kind: 'handler', handlerType: 'project'|'integration', handlerName: string, handler: GapReportHandler, modulePath: string, handlerSource: 'project'|'integration'}
 *   | {kind: 'malformed', handlerType: 'integration', handlerName: string, error: string}
 * )} HandlerEntry
 */

/** @param {string} value @returns {number} */
function characterCount(value) {
  return Array.from(value).length;
}

/**
 * @param {unknown} value
 * @param {string} label
 * @param {number} max
 * @returns {string}
 */
function requiredText(value, label, max) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new AstryxError(
      `${label} is required.`,
      undefined,
      ERROR_CODES.ERR_MISSING_ARGUMENT,
    );
  }
  const normalized = value.trim();
  if (characterCount(normalized) > max) {
    throw new AstryxError(
      `${label} must be ${max} characters or fewer.`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  return normalized;
}

/**
 * @param {unknown} value
 * @returns {string|undefined}
 */
function optionalDetail(value) {
  if (value == null || value === '') return undefined;
  if (typeof value !== 'string') {
    throw new AstryxError(
      'detail must be a string.',
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  const normalized = value.trim();
  if (normalized === '') return undefined;
  if (characterCount(normalized) > 8000) {
    throw new AstryxError(
      'detail must be 8000 characters or fewer.',
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  return normalized;
}

/**
 * @param {Project} project
 * @param {string} packageName
 * @returns {ReportTarget}
 */
function targetForPackage(project, packageName) {
  if (packageName === CORE_PACKAGE) {
    return {
      package: CORE_PACKAGE,
      version: null,
      issuesUrl: project.issuesUrl({package: CORE_PACKAGE}) ?? null,
    };
  }

  const integration = project.loadedIntegrations.find(
    item => item.name === packageName || item.__spec === packageName,
  );
  if (!integration) {
    throw new AstryxError(
      `No loaded integration package named "${packageName}".`,
      project.loadedIntegrations.map(item => ({
        name: item.name,
        reason: 'loaded integration',
      })),
      ERROR_CODES.ERR_UNKNOWN_PACKAGE,
    );
  }

  return {
    package: integration.name,
    version: integration.version ?? null,
    issuesUrl: project.issuesUrl({package: integration.name}) ?? null,
  };
}

/**
 * Select the report TARGET: the package the report describes.
 * Explicit package first, then unique exact component owner, else Core.
 * Target selection does not depend on handler count.
 *
 * @param {Project} project
 * @param {string} component
 * @param {string|undefined} packageName
 * @returns {Promise<ReportTarget>}
 */
async function selectTarget(project, component, packageName) {
  if (packageName) return targetForPackage(project, packageName);

  const bareComponent = component.startsWith('XDS')
    ? component.slice(3)
    : component;
  const catalog = await project.componentCatalog();
  const selected = catalog.resolve(bareComponent);
  if (selected) return targetForPackage(project, selected.package);

  const owners = [
    ...new Set(catalog.owners(bareComponent).map(record => record.package)),
  ];

  if (owners.length > 1) {
    throw new AstryxError(
      `Component "${component}" is provided by multiple packages. Re-run with --package <pkg> to choose one.`,
      owners.map(owner => ({name: owner, reason: 'provides this component'})),
      ERROR_CODES.ERR_AMBIGUOUS_COMPONENT,
    );
  }
  if (owners.length === 1) return targetForPackage(project, owners[0]);

  return targetForPackage(project, CORE_PACKAGE);
}

/**
 * Collect the effective handler set in delivery order: project config first,
 * then integrations in config order. Valid handlers dedupe by handle identity;
 * malformed integration exports retain their position as failed deliveries.
 *
 * @param {Project} project
 * @returns {HandlerEntry[]}
 */
export function collectGapReportHandlers(project) {
  /** @type {HandlerEntry[]} */
  const entries = [];
  /** @type {Set<Function>} */
  const seen = new Set();

  const projectHandler = project.config.gapReport;
  if (projectHandler != null) {
    seen.add(projectHandler.handle);
    entries.push({
      kind: 'handler',
      handlerType: 'project',
      handlerName: 'project',
      handler: projectHandler,
      modulePath: project.configPath ?? '',
      handlerSource: 'project',
    });
  }

  for (const integration of project.loadedIntegrations) {
    if (integration.__loadError) continue;
    if (integration.__gapReportError) {
      entries.push({
        kind: 'malformed',
        handlerType: 'integration',
        handlerName: integration.name,
        error: integration.__gapReportError,
      });
      continue;
    }
    const handler = integration.__gapReport;
    if (handler == null || seen.has(handler.handle)) continue;
    seen.add(handler.handle);
    entries.push({
      kind: 'handler',
      handlerType: 'integration',
      handlerName: integration.name,
      handler,
      modulePath: integration.__manifestFile,
      handlerSource: 'integration',
    });
  }

  return entries;
}

/** @param {string} message */
function failedHandler(message) {
  return {status: /** @type {const} */ ('failed'), url: null, message};
}

/**
 * Call one handler in its own worker. The worker owns process.exit,
 * process.exitCode, stdout, and every continuation the handler creates. A
 * timeout aborts the supplied signal, gives the handler one short turn to
 * observe it, then terminates the isolate before the next handler starts.
 *
 * @param {Extract<HandlerEntry, {kind: 'handler'}>} entry
 * @param {GapReport} report cloned before this call
 * @param {number} [timeoutMs]
 * @returns {Promise<Pick<import('./gap-report.type.mjs').GapReportDelivery, 'status'|'url'|'message'>>}
 */
async function callHandler(entry, report, timeoutMs = HANDLER_TIMEOUT_MS) {
  const worker = new Worker(HANDLER_WORKER, {
    workerData: {
      modulePath: entry.modulePath,
      handlerSource: entry.handlerSource,
      report,
    },
    stdout: true,
    stderr: true,
    execArgv: process.execArgv.filter(arg => !arg.startsWith('--input-type')),
  });

  for (const stream of [worker.stdout, worker.stderr]) {
    stream?.on('data', chunk => {
      try {
        process.stderr.write(chunk);
      } catch {
        // Handler diagnostics are best effort.
      }
    });
  }

  return await new Promise(resolve => {
    let settled = false;
    let timedOut = false;
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let timeout;
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let abortGrace;
    const timeoutOutcome = failedHandler('Gap report handler timed out.');

    /** @param {Pick<import('./gap-report.type.mjs').GapReportDelivery, 'status'|'url'|'message'>} outcome */
    const finish = outcome => {
      if (settled) return;
      settled = true;
      if (timeout !== undefined) clearTimeout(timeout);
      if (abortGrace !== undefined) clearTimeout(abortGrace);
      Promise.resolve(worker.terminate())
        .catch(() => {})
        .finally(() => resolve(outcome));
    };

    const beginTimeout = () => {
      if (timeout !== undefined) clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (settled) return;
        timedOut = true;
        try {
          worker.postMessage({type: 'abort'});
        } catch {
          // The worker may have exited at the timeout boundary.
        }
        abortGrace = setTimeout(
          () => finish(timeoutOutcome),
          HANDLER_ABORT_GRACE_MS,
        );
      }, timeoutMs);
    };

    worker.on('message', message => {
      if (settled || timedOut) return;
      if (message?.kind === 'ready') {
        beginTimeout();
        return;
      }
      if (message?.kind === 'exit-code') {
        finish(failedHandler('Handler changed process.exitCode.'));
        return;
      }
      if (message?.kind === 'error') {
        finish(failedHandler(String(message.message)));
        return;
      }
      if (message?.kind !== 'result') {
        finish(failedHandler('Handler worker returned an invalid message.'));
        return;
      }

      const receipt = parseGapReportReceipt(message.value);
      if (!receipt) {
        finish(failedHandler('Handler returned an invalid receipt.'));
        return;
      }
      finish({
        status: receipt.status,
        url: receipt.url ?? null,
        message: receipt.message ?? null,
      });
    });

    worker.on('error', error => {
      if (!timedOut) {
        finish(
          failedHandler(error instanceof Error ? error.message : String(error)),
        );
      }
    });

    worker.on('exit', code => {
      if (settled) return;
      if (timedOut) {
        finish(timeoutOutcome);
        return;
      }
      finish(failedHandler(`Handler called process.exit(${String(code)}).`));
    });

    beginTimeout();
  });
}

/**
 * Deliver one report to the ordered effective handler set. This helper is
 * exported only for focused contract tests; it is not part of the package API.
 *
 * @param {HandlerEntry[]} entries
 * @param {GapReport} report
 * @param {{confirmPublic?: boolean, timeoutMs?: number}} [options]
 * @returns {Promise<import('./gap-report.type.mjs').GapReportDelivery[]>}
 */
export async function deliverGapReportHandlers(
  entries,
  report,
  {confirmPublic = false, timeoutMs = HANDLER_TIMEOUT_MS} = {},
) {
  /** @type {import('./gap-report.type.mjs').GapReportDelivery[]} */
  const deliveries = [];

  for (const entry of entries) {
    if (entry.kind === 'malformed') {
      deliveries.push({
        handlerType: entry.handlerType,
        handler: entry.handlerName,
        audience: null,
        status: 'failed',
        url: null,
        message: entry.error,
      });
      continue;
    }

    const {handler} = entry;
    if (handler.audience === 'public' && !confirmPublic) {
      deliveries.push({
        handlerType: entry.handlerType,
        handler: entry.handlerName,
        audience: handler.audience,
        status: 'consent_required',
        url: null,
        message: PUBLIC_CONFIRMATION_MESSAGE,
      });
      continue;
    }

    const outcome = await callHandler(
      entry,
      structuredClone(report),
      timeoutMs,
    );
    deliveries.push({
      handlerType: entry.handlerType,
      handler: entry.handlerName,
      audience: handler.audience,
      ...outcome,
    });
  }

  return deliveries;
}

/**
 * @param {string} issuesUrl
 * @returns {{repo: string}|null}
 */
function githubRoute(issuesUrl) {
  try {
    const url = new URL(issuesUrl);
    if (url.protocol !== 'https:' || url.hostname !== 'github.com') return null;
    const parts = url.pathname.split('/').filter(Boolean);
    if (
      parts.length < 3 ||
      parts.length > 4 ||
      parts[2] !== 'issues' ||
      (parts.length === 4 && parts[3] !== 'new')
    ) {
      return null;
    }
    return {repo: `${parts[0]}/${parts[1]}`};
  } catch {
    return null;
  }
}

/**
 * Built-in GitHub fallback — runs only when the effective handler set is empty.
 * Requires confirmPublic.
 *
 * @param {ReportTarget} target
 * @param {{component: string, categoryLabel: string, intention: string, detail?: string, source: string, timestamp: string}} report
 * @param {{repo: string}} github
 * @returns {Promise<Pick<import('./gap-report.type.mjs').GapReportDelivery, 'status'|'url'|'message'>>}
 */
async function runGithubFallback(target, report, github) {
  const {execFile} = await import('node:child_process');
  const title = `[gap] ${report.component}: ${report.intention.slice(0, 70)}`;
  const body = [
    `Component: ${report.component}`,
    `Category: ${report.categoryLabel}`,
    `Source: ${report.source}`,
    `Reported: ${report.timestamp}`,
    '',
    '## Intention',
    '',
    report.intention,
    ...(report.detail ? ['', '## Additional context', '', report.detail] : []),
  ].join('\n');

  try {
    const output = await new Promise((resolve, reject) => {
      execFile(
        'gh',
        [
          'issue',
          'create',
          '--repo',
          github.repo,
          '--title',
          title,
          '--body',
          body,
        ],
        {encoding: 'utf8', timeout: HANDLER_TIMEOUT_MS, windowsHide: true},
        (error, stdout) => {
          if (error) reject(error);
          else resolve(stdout);
        },
      );
    });

    const value = /** @type {string} */ (output).trim();
    let url = null;
    try {
      const parsedUrl = new URL(value);
      if (parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:') {
        url = value;
      }
    } catch {
      // non-URL output from gh
    }
    return {
      status: /** @type {const} */ ('filed'),
      url,
      message: url ? 'Gap report filed.' : value || 'Gap report filed.',
    };
  } catch {
    return {
      status: /** @type {const} */ ('failed'),
      url: null,
      message:
        'GitHub CLI could not create the routed issue. Install and authenticate gh, then retry.',
    };
  }
}

/**
 * Compute the aggregate status from the deliveries.
 * @param {import('./gap-report.type.mjs').GapReportDelivery[]} deliveries
 * @returns {import('./gap-report.type.mjs').GapReportAggregateStatus}
 */
function aggregateStatus(deliveries) {
  if (deliveries.length === 0) return 'skipped';

  const statuses = new Set(deliveries.map(d => d.status));

  // All consent_required
  if (statuses.size === 1 && statuses.has('consent_required'))
    return 'consent_required';
  // All skipped
  if (statuses.size === 1 && statuses.has('skipped')) return 'skipped';
  // All failed
  if (statuses.size === 1 && statuses.has('failed')) return 'failed';
  // All routed_only (no filed)
  if (
    !statuses.has('filed') &&
    statuses.has('routed_only') &&
    !statuses.has('failed')
  )
    return 'routed_only';

  const hasFiled = statuses.has('filed');
  const hasFailed = statuses.has('failed');
  const hasHandledWithoutFiling =
    statuses.has('routed_only') ||
    statuses.has('skipped') ||
    statuses.has('consent_required');

  if (hasFailed && (hasFiled || hasHandledWithoutFiling)) return 'partial';
  if (hasFailed) return 'failed';
  if (hasFiled) return 'filed';

  // Mixed non-failure (e.g. routed_only + consent_required + skipped)
  if (statuses.has('routed_only')) return 'routed_only';
  if (statuses.has('consent_required')) return 'consent_required';
  return 'skipped';
}

/**
 * List categories or route and file one gap report through the fan-out.
 *
 * @param {string|undefined} component
 * @param {import('./gap-report.type.mjs').GapReportOptions} [options]
 * @returns {Promise<import('./gap-report.type.mjs').GapReportCategoriesResponse | import('./gap-report.type.mjs').GapReportReceiptResponse>}
 */
export async function gapReport(component, options = {}) {
  if (options.listCategories) {
    return {
      type: 'gap-report.categories',
      data: GAP_REPORT_CATEGORIES.map(category => ({...category})),
    };
  }

  const resolvedComponent = requiredText(component, 'component', 120);
  const category = requiredText(options.category, 'category', 80);
  const categoryEntry = GAP_REPORT_CATEGORIES.find(
    entry => entry.value === category,
  );
  if (!categoryEntry) {
    throw new AstryxError(
      `Unknown gap category "${category}".`,
      GAP_REPORT_CATEGORIES.map(entry => ({
        name: entry.value,
        reason: entry.label,
      })),
      ERROR_CODES.ERR_UNKNOWN_CATEGORY,
    );
  }
  const intention = requiredText(options.reason, 'reason', 2000);
  const detail = optionalDetail(options.detail);
  const cwd = (await import('node:path')).resolve(options.cwd ?? process.cwd());
  const project = await Project.load(cwd);
  const target = await selectTarget(
    project,
    resolvedComponent,
    options.package,
  );

  const entries = collectGapReportHandlers(project);

  const timestamp = new Date().toISOString();
  const source = captureEnv().invocationSource;

  /** @type {GapReport} */
  const report = {
    schemaVersion: 1,
    component: resolvedComponent,
    category:
      /** @type {import('../../authoring/gap-report/type').GapReportCategory} */ (
        categoryEntry.value
      ),
    categoryLabel: categoryEntry.label,
    intention,
    ...(detail ? {detail} : {}),
    source,
    timestamp,
    target: {
      package: target.package,
      version: target.version,
      issuesUrl: target.issuesUrl,
    },
  };

  /** @type {import('./gap-report.type.mjs').GapReportDelivery[]} */
  const deliveries = [];

  if (entries.length > 0) {
    deliveries.push(
      ...(await deliverGapReportHandlers(entries, report, {
        confirmPublic: options.confirmPublic === true,
      })),
    );
  } else {
    if (!target.issuesUrl) {
      throw new AstryxError(
        `Package "${target.package}" provides neither a report handler nor an issues URL.`,
        undefined,
        ERROR_CODES.ERR_NOT_FOUND,
      );
    }

    const github = githubRoute(target.issuesUrl);
    if (github != null && options.confirmPublic !== true) {
      deliveries.push({
        handlerType: 'fallback',
        handler: 'github',
        audience: 'public',
        status: 'consent_required',
        url: null,
        message: PUBLIC_CONFIRMATION_MESSAGE,
      });
    } else if (github) {
      const outcome = await runGithubFallback(
        target,
        {
          component: resolvedComponent,
          categoryLabel: categoryEntry.label,
          intention,
          detail,
          source,
          timestamp,
        },
        github,
      );
      deliveries.push({
        handlerType: 'fallback',
        handler: 'github',
        audience: 'public',
        ...outcome,
      });
    } else {
      deliveries.push({
        handlerType: 'fallback',
        handler: 'issuesUrl',
        audience: null,
        status: 'routed_only',
        url: target.issuesUrl,
        message:
          'No automatic handler is available; open the routed URL to file this report.',
      });
    }
  }

  const filedCount = deliveries.filter(d => d.status === 'filed').length;
  const routedOnlyCount = deliveries.filter(
    d => d.status === 'routed_only',
  ).length;
  const status = aggregateStatus(deliveries);

  return {
    type: 'gap-report.file',
    data: {
      status,
      package: target.package,
      issuesUrl: target.issuesUrl,
      deliveries,
      filedCount,
      routedOnlyCount,
    },
  };
}
