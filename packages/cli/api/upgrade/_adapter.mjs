// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file upgrade adapter — shared version-detection + codemod machinery.
 *
 * The engine the upgrade leaves (list/status/run) sit on. It owns the I/O and
 * resolution for the command: detecting the installed core version, refreshing
 * the managed agent-docs block, selecting codemods from the registry, loading
 * the consumer's project/integrations, and executing the core/integration
 * codemod runners. Leaves call these helpers and PROJECT the results into their
 * one response type; the dispatcher (`upgrade.mjs`) routes.
 *
 * Progress is emitted through the shared `logger` (silent by default), so the
 * CLI keeps its exact output while a programmatic caller stays quiet.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {ensureJscodeshift} from '../../assets/codemods/ensure-jscodeshift.mjs';
import {getTransformsBetween, latestVersion} from '../../assets/codemods/registry.mjs';
import {runCodemods} from '../../assets/codemods/runner.mjs';
import {
  discoverIntegrationCodemods,
  selectIntegrationCodemods,
} from '../../assets/codemods/integration-discovery.mjs';
import {runIntegrationCodemods} from '../../assets/codemods/integration-runner.mjs';
import {
  installAgentDocs,
  inspectAgentDocs,
  renderAgentDocsBlock,
} from '../../foundation/agent-docs/agent-docs.mjs';
import {formatCliCommand} from '../../foundation/env/package-manager.mjs';
import {Project} from '../../foundation/config/project.mjs';
import {
  loadIntegrations,
  markProviderConflicts,
} from '../../foundation/integrations/integrations.mjs';
import {warnOnIntegrationIssues} from '../../foundation/integrations/integration-warnings.mjs';
import {logger} from '../logger.mjs';

// Re-exported for the run leaf's lightweight agent-docs inspection path
// (config_fixable short-circuit, where the full render cannot load config).
export { inspectAgentDocs };

const execFileAsync = promisify(execFile);

/**
 * @typedef {object} CoreTransformEntry
 * @property {string} name
 * @property {import('../../authoring/codemod/type').CodemodTransform} transform
 * @property {{title: string, description?: string, pr?: string, codemodType?: string}} meta
 * @property {boolean} [optional]
 */
/** @typedef {{version: string, transforms: CoreTransformEntry[]}} CoreVersionManifest */

/**
 * @typedef {object} UpgradeOptions
 * @property {boolean} [list]
 * @property {string} [from]
 * @property {boolean} [apply]
 * @property {boolean} [force]
 * @property {string} [codemod]
 * @property {string[]} [skipCodemod]
 * @property {string[]} [integration]
 * @property {string} [path]
 * @property {boolean} [installDeps]
 * @property {boolean} [registry]
 */

/**
 * Detect the installed target version from node_modules.
 * @param {string} cwd
 * @returns {{version: string, packageName: string}|null}
 */
export function detectInstalledTargetVersion(cwd) {
  for (const packageName of ['@astryxdesign/core', '@xds/core']) {
    const pkgPath = path.resolve(
      cwd,
      'node_modules',
      ...packageName.split('/'),
      'package.json',
    );
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (pkg.version) return {version: pkg.version, packageName};
    } catch {
      // Missing/unreadable — try the next supported package name.
    }
  }
  return null;
}

/**
 * @param {(string | null | undefined | false)[] | undefined} files
 * @returns {string[]}
 */
export function uniqueFiles(files) {
  return [
    ...new Set(
      (files ?? []).filter(/** @returns {f is string} */ f => Boolean(f)),
    ),
  ];
}

/**
 * Run app code with its stdout writes sent to stderr. Stdout carries only the
 * command's own output, so a hook that prints cannot corrupt `--json`.
 * @template T
 * @param {() => T | Promise<T>} fn
 * @returns {Promise<T>}
 */
async function withStdoutOnStderr(fn) {
  const realWrite = process.stdout.write;
  process.stdout.write = /** @type {any} */ (
    function (/** @type {any} */ chunk, /** @type {any[]} */ ...rest) {
      return process.stderr.write(chunk, ...rest);
    }
  );
  try {
    return await fn();
  } finally {
    process.stdout.write = realWrite;
  }
}

/**
 * Run the app config's post-codemod hooks (config.hooks.postCodemod).
 * Dry-run PREVIEWS (buildCommand still called, so a throw fails); apply executes.
 * @param {import('../../authoring/config/type').PostCodemodHook[]} hooks
 * @param {{packageDir: string, files: string[], apply: boolean}} context
 */
export async function runPostCodemodHooks(hooks, context) {
  if (!hooks || hooks.length === 0) return;
  const {packageDir, files, apply} = context;

  for (let i = 0; i < hooks.length; i++) {
    const hook = hooks[i];
    const label = hook.name ?? `postCodemod[${i}]`;
    if (typeof hook.buildCommand !== 'function') {
      throw new Error(
        `Post-codemod hook ${label} is missing a buildCommand function.`,
      );
    }

    const cmd = await withStdoutOnStderr(() =>
      hook.buildCommand({packageDir, files}),
    );
    if (!cmd) {
      logger.log(`Post-codemod hook ${label} produced no command; skipping.`);
      continue;
    }

    if (!apply) {
      const preview = [cmd.command, ...(cmd.args ?? [])].join(' ');
      logger.log(`Post-codemod hook ${label} (dry run): ${preview}`);
      continue;
    }

    await execFileAsync(
      cmd.command,
      cmd.args ?? [],
      /** @type {import('node:child_process').ExecFileOptions & {encoding: 'utf-8'}} */ ({
        cwd: cmd.options?.cwd ?? packageDir,
        timeout: cmd.options?.timeout ?? 300_000,
        stdio: 'pipe',
        encoding: 'utf-8',
        ...cmd.options,
        env: {...process.env, ...(cmd.options?.env ?? {})},
      }),
    );
    logger.log(`✓ Post-codemod hook ${label} completed.`);
  }
}

/**
 * @typedef {object} AgentDocsRefreshPlan
 * @property {string} cwd
 * @property {string|null} renderedBlock
 * @property {import('./upgrade.type.mjs').AgentDocsSummary} summary
 */

/**
 * Compute the expected managed block and report staleness without writing.
 * Apply-mode callers commit the prepared bytes only after codemods and hooks
 * succeed.
 *
 * @param {{cwd: string, installedVersion: string, apply: boolean, fresh?: boolean}} ctx
 * @returns {Promise<AgentDocsRefreshPlan>}
 */
export async function prepareAgentDocsRefresh({
  cwd,
  installedVersion,
  apply,
  fresh = false,
}) {
  const initial = inspectAgentDocs(cwd, installedVersion);
  /** @type {import('./upgrade.type.mjs').AgentDocsSummary} */
  const summary = {
    status: initial.status,
    installedVersion,
    fromVersions: initial.blockVersions,
    files: [],
    refreshed: false,
    action: 'none',
  };

  if (initial.status === 'missing') {
    summary.action = 'nudge-init';
    logger.warn(
      `No Astryx agent-docs block found — AI agents have no component index. Run \`${formatCliCommand('astryx init --features agents')}\` to install it.`,
    );
    return {cwd, renderedBlock: null, summary};
  }

  let renderedBlock;
  try {
    renderedBlock = await renderAgentDocsBlock(cwd, {
      installedVersion,
      fresh,
    });
  } catch {
    summary.action = 'error';
    summary.files = initial.files.map(file => file.path);
    logger.warn(
      `Could not render the expected agent docs. Run \`${formatCliCommand('astryx init --features agents')}\` to update them manually.`,
    );
    return {cwd, renderedBlock: null, summary};
  }

  const inspection = inspectAgentDocs(cwd, installedVersion, renderedBlock);
  summary.status = inspection.status;
  summary.fromVersions = inspection.blockVersions;
  summary.files = inspection.staleFiles;
  if (inspection.status === 'current') return {cwd, renderedBlock, summary};

  summary.action = 'would-refresh';
  if (!apply) {
    logger.warn(
      `Agent docs differ from the installed Astryx and integration configuration. Re-run with --apply to refresh (${summary.files.join(', ')}).`,
    );
  }
  return {cwd, renderedBlock, summary};
}

/**
 * Commit a prepared agent-doc refresh.
 * @param {AgentDocsRefreshPlan} plan
 * @returns {import('./upgrade.type.mjs').AgentDocsSummary}
 */
export function applyAgentDocsRefresh(plan) {
  const {cwd, renderedBlock, summary} = plan;
  if (summary.action !== 'would-refresh' || renderedBlock == null)
    return summary;

  try {
    const written = installAgentDocs(cwd, {
      onlyReplace: true,
      renderedBlock,
    });
    summary.refreshed = written.length > 0;
    summary.files = written;
    summary.action = summary.refreshed ? 'refreshed' : 'error';
    if (summary.refreshed) {
      logger.log(`✓ Agent docs refreshed → ${written.join(', ')}`);
    } else {
      logger.warn(
        `Agent docs look stale but couldn't be refreshed. Run \`${formatCliCommand('astryx init --features agents')}\` to reinstall the block.`,
      );
    }
  } catch {
    summary.action = 'error';
    summary.refreshed = false;
    logger.warn(
      `Could not refresh agent docs. Run \`${formatCliCommand('astryx init --features agents')}\` to update them manually.`,
    );
  }
  return summary;
}

/**
 * Every registered codemod (oldest→newest) for `upgrade --list`. Registry walk
 * + flatten; nothing is run.
 * @returns {Promise<Array<{name: string, title: string, version: string, pr?: string, optional: boolean}>>}
 */
export async function collectAllCodemods() {
  const codemods = [];
  const manifests = /** @type {CoreVersionManifest[]} */ (
    await getTransformsBetween('0.0.0', latestVersion)
  );
  for (const {version, transforms} of manifests) {
    for (const {name, meta, optional} of transforms) {
      codemods.push({name, title: meta.title, version, pr: meta.pr, optional: !!optional});
    }
  }
  return codemods;
}

/**
 * Core version manifests for the (from, to] range.
 * @param {string} from
 * @param {string} to
 * @returns {Promise<CoreVersionManifest[]>}
 */
export async function getCoreVersionManifests(from, to) {
  return /** @type {CoreVersionManifest[]} */ ([
    ...(await getTransformsBetween(from, to)),
  ]);
}

/**
 * Ensure jscodeshift is available before running codemods.
 * @param {{installDeps?: boolean}} [options]
 * @returns {Promise<boolean>}
 */
export async function ensureCodemodDeps({installDeps} = {}) {
  return ensureJscodeshift({installDeps, silent: logger.silent});
}

/**
 * Run the CORE registry codemods. Runs BEFORE the config is loaded so a core
 * CONFIG codemod can repair a config the strict loader would otherwise reject.
 * @param {CoreVersionManifest[]} versionManifests
 * @param {{apply: boolean, path: string, codemod?: string, skipCodemods: Set<string>}} options
 */
export async function runCoreCodemods(versionManifests, {apply, path: srcPath, codemod, skipCodemods}) {
  return runCodemods(versionManifests, {
    apply,
    path: srcPath,
    codemod,
    skipCodemods,
    silent: logger.silent,
  });
}

/**
 * One installed package at one version; two specs that reach it share this.
 * @param {{name: string, version?: string}} integration
 * @returns {string}
 */
function packageIdentity(integration) {
  return `${integration.name}\u0000${integration.version ?? ''}`;
}

/**
 * Load the consumer project's config + integrations. Throws on invalid config;
 * the run leaf decides between the config_fixable preview and a hard abort.
 * @param {string} cwd
 * @param {string[]} [extraIntegrationSpecs] explicit `--integration` specs
 * @returns {Promise<{postCodemodHooks: import('../../authoring/config/type').PostCodemodHook[], integrations: import('../../foundation/integrations/integrations.mjs').LoadedIntegration[]}>}
 */
export async function loadProjectContext(cwd, extraIntegrationSpecs = []) {
  // The CLI debug preflight may already have imported this config before core
  // CONFIG codemods run. Upgrade needs the bytes now on disk, not that module
  // cache entry; ordinary Project discovery remains cached by default.
  const project = await Project.load(cwd, {fresh: true});
  const postCodemodHooks = project.config.hooks?.postCodemod ?? [];
  const configuredSpecs = new Set(project.integrations ?? []);
  // Configured packages come from Project, which has already resolved provider
  // identity over configured, autolinked, and local packages. Loading them
  // again here would let upgrade run codemods from a package Project set aside.
  const configured = project.loadedIntegrations.filter(
    integration =>
      !integration.__autolinked && configuredSpecs.has(integration.__spec),
  );
  // A package that lists itself runs its installed copy's released codemods,
  // never the work in progress being authored, so that copy stands in for it.
  const local = project.loadedIntegrations.find(
    integration => integration.__local,
  );
  const selfListed = local != null && configured.includes(local);
  if (local != null && selfListed && project.configPath) {
    const installed = await loadIntegrations([local.__spec], {
      cwd: path.dirname(project.configPath),
      resolveProviders: false,
    });
    configured.splice(configured.indexOf(local), 1, ...installed);
  }
  const extraSpecs = uniqueFiles(extraIntegrationSpecs ?? []).filter(
    spec => !configuredSpecs.has(spec),
  );
  const extras =
    extraSpecs.length === 0
      ? []
      : await loadIntegrations(extraSpecs, {resolveProviders: false});
  // Naming the package being authored with --integration asks for its
  // installed copy too, so the local package must not claim against it.
  const localStandsIn =
    local != null &&
    (selfListed || extras.some(extra => extra.name === local.name));
  // Autolinked packages and the package being authored join the pass only as
  // claimants: every other command uses them for their provider IDs, but
  // upgrade has never run their codemods and still does not. An extra that
  // names one of them opts it in, so the extra stands in for that claimant.
  const extraIdentities = new Set(extras.map(packageIdentity));
  const claimantsOnly = project.loadedIntegrations.filter(
    integration =>
      (integration.__autolinked || (integration.__local && !localStandsIn)) &&
      !extraIdentities.has(packageIdentity(integration)),
  );
  const resolved = markProviderConflicts([
    ...configured,
    ...claimantsOnly,
    ...extras,
  ]);
  // Claimants leave by package directory, not object identity: the pass can
  // return one as a new conflict entry, and upgrade must not warn that a
  // package every other command uses contributes nothing.
  const claimantDirs = new Set(
    claimantsOnly.map(integration => integration.__packageDir),
  );
  const integrations = resolved.filter(
    integration =>
      integration.__packageDir == null ||
      !claimantDirs.has(integration.__packageDir),
  );
  return {postCodemodHooks, integrations};
}

/**
 * Non-blocking nudge for integration validation issues. Never throws (a broken
 * nudge must not fail the upgrade) and is suppressed for --json/programmatic
 * callers (the silent logger).
 * @param {Array<import('../../foundation/integrations/integrations.mjs').LoadedIntegration>} integrations
 * @returns {Promise<void>}
 */
export async function warnIntegrationIssues(integrations) {
  try {
    await warnOnIntegrationIssues(integrations, {json: logger.silent});
  } catch {
    // Never let the nudge break the upgrade.
  }
}

/**
 * Discover + select the integration codemods that apply in the (from, to]
 * range. An integration whose codemods fail to load is SKIPPED (a definition
 * error is surfaced by the nudge, not a hard failure of the upgrade).
 * @param {Array<import('../../foundation/integrations/integrations.mjs').LoadedIntegration>} integrations
 * @param {string} from
 * @param {string} to
 * @returns {Promise<Array<{version: string, codemods: import('../../authoring/codemod/type').CodemodEntry[]}>>}
 */
export async function selectIntegrationCodemodsFor(integrations, from, to) {
  /** @type {Map<string, Array<import('../../authoring/codemod/type').CodemodEntry>>} */
  const integrationCodemodsByVersion = new Map();
  for (const integration of integrations) {
    if (!integration?.codemods) continue;
    try {
      const byVersion = await discoverIntegrationCodemods([integration]);
      for (const [version, rawList] of byVersion) {
        const list = /** @type {Array<import('../../authoring/codemod/type').CodemodEntry>} */ (/** @type {unknown} */ (rawList));
        const existing = integrationCodemodsByVersion.get(version);
        if (existing) existing.push(...list);
        else integrationCodemodsByVersion.set(version, [...list]);
      }
    } catch {
      // Skip this integration's codemods (definition error); nudge above surfaces it.
    }
  }
  return /** @type {Array<{version: string, codemods: import('../../authoring/codemod/type').CodemodEntry[]}>} */ (
    selectIntegrationCodemods(integrationCodemodsByVersion, from, to)
  );
}

/**
 * Run the file-based INTEGRATION codemods (config codemods first, then code).
 * @param {Array<{version: string, codemods: import('../../authoring/codemod/type').CodemodEntry[]}>} versionGroups
 * @param {{apply: boolean, path: string, codemod?: string, skipCodemods: Set<string>}} options
 */
export async function runIntegrationCodemodsStep(versionGroups, {apply, path: srcPath, codemod, skipCodemods}) {
  const jscodeshift = (await import('jscodeshift')).default;
  return runIntegrationCodemods(versionGroups, {
    apply,
    path: srcPath,
    codemod,
    skipCodemods,
    jscodeshift,
    silent: logger.silent,
  });
}
