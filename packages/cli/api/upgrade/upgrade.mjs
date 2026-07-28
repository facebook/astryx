// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file upgrade API — full version-to-version upgrade pipeline.
 *
 * `upgrade(options)` runs codemods that migrate source from a previous Astryx
 * version to the currently installed one, and refreshes the managed agent-docs
 * block. It performs the side effects (in `--apply`) and returns a receipt:
 *   - `upgrade.list`   — available codemods (no run)
 *   - `upgrade.status` — up_to_date | no_codemods | config_fixable short-circuits
 *   - `upgrade.run`    — the terminal run receipt
 * Errors throw AstryxError (stable code). Human progress is emitted through the
 * injected `logger` (silent by default), so the CLI keeps its exact output and
 * a programmatic caller stays quiet.
 *
 * Pipeline (--apply): detect installed core → refresh agent-docs (every path) →
 * run CORE codemods (before Project.load, so a core CONFIG codemod can repair an
 * otherwise-invalid config) → load config → discover + run INTEGRATION codemods
 * → post-codemod hooks. Integration DISCOVERY errors skip that integration;
 * EXECUTION errors abort.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {ensureJscodeshift} from '../../codemods/ensure-jscodeshift.mjs';
import {getTransformsBetween, latestVersion} from '../../codemods/registry.mjs';
import {runCodemods} from '../../codemods/runner.mjs';
import {
  discoverIntegrationCodemods,
  selectIntegrationCodemods,
} from '../../codemods/integration-discovery.mjs';
import {runIntegrationCodemods} from '../../codemods/integration-runner.mjs';
import {installAgentDocs, inspectAgentDocs} from '../../lib/agent-docs/agent-docs.mjs';
import {getCliInvocation, formatCliCommand} from '../../utils/package-manager.mjs';
import {isValidSemver, semverGte} from '../../utils/semver.mjs';
import {Project} from '../../lib/project.mjs';
import {loadIntegrations} from '../../lib/integrations.mjs';
import {warnOnIntegrationIssues} from '../../lib/integration-warnings.mjs';
import {ERROR_CODES} from '../../lib/error-codes.mjs';
import {AstryxError} from '../error.mjs';
import {noopLogger} from '../../lib/term-log.mjs';

const execFileAsync = promisify(execFile);

/**
 * Detect the installed target version from node_modules.
 * @param {string} cwd
 * @returns {{version: string, packageName: string}|null}
 */
function detectInstalledTargetVersion(cwd) {
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
function uniqueFiles(files) {
  return [
    ...new Set(
      (files ?? []).filter(/** @returns {f is string} */ f => Boolean(f)),
    ),
  ];
}

/**
 * Run the app config's post-codemod hooks (config.hooks.postCodemod).
 * Dry-run PREVIEWS (buildCommand still called, so a throw fails); apply executes.
 * @param {import('../../types/config').PostCodemodHook[]} hooks
 * @param {{packageDir: string, files: string[], apply: boolean}} context
 * @param {import('../../lib/term-log.mjs').CliLogger} logger
 */
async function runPostCodemodHooks(hooks, context, logger) {
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

    const cmd = await hook.buildCommand({packageDir, files});
    if (!cmd) {
      logger.info(`Post-codemod hook ${label} produced no command; skipping.`);
      continue;
    }

    if (!apply) {
      const preview = [cmd.command, ...(cmd.args ?? [])].join(' ');
      logger.info(`Post-codemod hook ${label} (dry run): ${preview}`);
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
    logger.success(`Post-codemod hook ${label} completed.`);
  }
}

/**
 * Refresh (or, in dry-run, report) the managed agent-docs block after a version
 * bump. The block documents the INSTALLED library, so it must be re-synced on
 * EVERY upgrade path, including the no-codemods short-circuits (#4168).
 *
 * @param {{cwd: string, installedVersion: string, apply: boolean, logger?: import('../../lib/term-log.mjs').CliLogger}} ctx
 * @returns {import('../../types/upgrade').AgentDocsSummary}
 */
export function refreshAgentDocs({cwd, installedVersion, apply, logger = noopLogger}) {
  const inspection = inspectAgentDocs(cwd, installedVersion);
  /** @type {import('../../types/upgrade').AgentDocsSummary} */
  const summary = {
    status: inspection.status,
    installedVersion,
    fromVersions: inspection.blockVersions,
    files: [],
    refreshed: false,
    action: 'none',
  };

  // Never initialized — don't silently create docs during an upgrade; nudge.
  if (inspection.status === 'missing') {
    summary.action = 'nudge-init';
    logger.warn(
      `No Astryx agent-docs block found — AI agents have no component index. Run \`${formatCliCommand('astryx init --features agents')}\` to install it.`,
    );
    return summary;
  }

  if (inspection.status === 'current') return summary;

  // Stale.
  summary.files = inspection.staleFiles;
  const fromLabel = summary.fromVersions.length
    ? `v${summary.fromVersions.join(', v')}`
    : 'an unknown version';

  if (!apply) {
    summary.action = 'would-refresh';
    logger.warn(
      `Agent docs are stale: block is at ${fromLabel}, installed is v${installedVersion}. Re-run with --apply to refresh (${summary.files.join(', ')}).`,
    );
    return summary;
  }

  // Apply: rewrite only files that already carry a marker (onlyReplace).
  try {
    const written = installAgentDocs(cwd, {onlyReplace: true});
    summary.refreshed = written.length > 0;
    summary.files = written;
    if (summary.refreshed) {
      summary.action = 'refreshed';
      logger.success(
        `Agent docs refreshed → v${installedVersion} (from ${fromLabel}): ${written.join(', ')}`,
      );
    } else {
      summary.action = 'error';
      logger.warn(
        `Agent docs look stale but couldn't be refreshed — the <!-- ASTRYX:START -->/<!-- ASTRYX:END --> markers may be malformed. Run \`${formatCliCommand('astryx init --features agents')}\` to reinstall the block.`,
      );
    }
  } catch {
    summary.action = 'error';
    logger.warn(
      `Could not refresh agent docs. Run \`${formatCliCommand('astryx init --features agents')}\` to update them manually.`,
    );
  }
  return summary;
}

/**
 * @typedef {object} CoreTransformEntry
 * @property {string} name
 * @property {import('../../types/codemod').CodemodTransform} transform
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
 */

/**
 * Run the upgrade pipeline. Returns the terminal receipt; throws AstryxError on
 * failure. Progress is emitted through `logger` (silent by default).
 *
 * @param {UpgradeOptions} [options]
 * @param {{cwd?: string, logger?: import('../../lib/term-log.mjs').CliLogger}} [ctx]
 * @returns {Promise<import('../../types/upgrade').UpgradeListResponse | import('../../types/upgrade').UpgradeStatusResponse | import('../../types/upgrade').UpgradeRunResponse>}
 */
export async function upgrade(options = {}, {cwd = process.cwd(), logger = noopLogger} = {}) {
  // Resolve the source dir against the API's cwd (not process.cwd()) so a
  // programmatic caller in another directory scans the right tree. The runners
  // do path.resolve(srcPath); an already-absolute path is idempotent there, so
  // this is byte-identical for the CLI (where cwd === process.cwd()).
  const path_ = path.resolve(cwd, options.path ?? './src');
  const apply = options.apply ?? false;
  logger.intro('Upgrade');

  if (!options.list && !options.from) {
    const msg = `Missing required --from. Install the target version first, then run \`${getCliInvocation()} upgrade --from <old-version>\`.`;
    logger.error(msg);
    logger.outro('Aborted');
    throw new AstryxError(msg, undefined, ERROR_CODES.ERR_INVALID_ARGUMENT);
  }

  if (!options.list && !isValidSemver(options.from)) {
    const msg = `Invalid --from value: "${options.from}". Expected a semver string like 0.0.5.`;
    logger.error(msg);
    logger.outro('Aborted');
    throw new AstryxError(msg, undefined, ERROR_CODES.ERR_INVALID_VERSION);
  }

  if (options.list) {
    const codemods = [];
    const manifests = /** @type {CoreVersionManifest[]} */ (
      await getTransformsBetween('0.0.0', latestVersion)
    );
    for (const {version, transforms} of manifests) {
      for (const {name, meta, optional} of transforms) {
        codemods.push({name, title: meta.title, version, pr: meta.pr, optional: !!optional});
      }
    }
    logger.step('Available codemods:');
    for (const {name, title, pr, optional} of codemods) {
      logger.info(`  ${name} — ${title}${optional ? ' (optional)' : ''} (${pr})`);
    }
    logger.outro('Done');
    return {
      type: 'upgrade.list',
      data: codemods.map(({name, title, version, optional}) => ({name, title, version, optional})),
    };
  }

  const currentVersion = /** @type {string} */ (options.from);
  const installed = detectInstalledTargetVersion(cwd);
  if (!installed) {
    const msg = `Could not find installed @astryxdesign/core (or legacy @xds/core). Install the target version first, then rerun \`${getCliInvocation()} upgrade --from <old-version>\`.`;
    logger.error(msg);
    logger.outro('Aborted');
    throw new AstryxError(msg, undefined, ERROR_CODES.ERR_VERSION_DETECT);
  }
  const targetVersion = installed.version;

  logger.info(`From version: ${currentVersion}`);
  logger.info(`Installed target: ${targetVersion} (${installed.packageName})`);

  // Sync the managed agent-docs block FIRST — it documents the installed library
  // independent of codemods, so refresh on every path (issue #4168).
  const agentDocs = refreshAgentDocs({cwd, installedVersion: targetVersion, apply: apply || false, logger});

  if (!options.force && semverGte(currentVersion, targetVersion)) {
    logger.success('Already up to date — no codemods to run.');
    logger.info('Use --force to run codemods anyway.');
    logger.outro('Done');
    return {type: 'upgrade.status', data: {status: 'up_to_date', from: currentVersion, to: targetVersion, agentDocs}};
  }

  const versionManifests = /** @type {CoreVersionManifest[]} */ ([
    ...(await getTransformsBetween(currentVersion, targetVersion)),
  ]);

  const coreConfigCodemodNames = [];
  for (const {transforms} of versionManifests) {
    for (const t of transforms) {
      if (options.codemod && t.name !== options.codemod) continue;
      if (t.meta?.codemodType === 'config') coreConfigCodemodNames.push(t.name);
    }
  }
  const hasCoreConfigCodemod = coreConfigCodemodNames.length > 0;

  const skipCodemods = new Set(options.skipCodemod ?? []);

  let totalTransforms = 0;
  let totalOptional = 0;
  for (const {transforms} of versionManifests) {
    for (const t of transforms) {
      if (options.codemod && t.name !== options.codemod) continue;
      if (skipCodemods.has(t.name)) continue;
      if (t.optional && !options.codemod) totalOptional++;
      else totalTransforms++;
    }
  }

  const ready = await ensureJscodeshift({installDeps: options.installDeps, silent: logger === noopLogger});
  if (!ready) {
    const msg = 'jscodeshift is required but could not be installed.';
    logger.outro('Aborted');
    throw new AstryxError(msg, undefined, ERROR_CODES.ERR_DEP_MISSING);
  }

  // CORE codemods run FIRST (before loading config) so a core CONFIG codemod can
  // repair a config the strict loader would otherwise reject.
  const codemodResult = await runCodemods(versionManifests, {
    apply: apply,
    path: path_,
    codemod: options.codemod,
    skipCodemods,
    silent: logger === noopLogger,
  });
  const coreResult = codemodResult && 'totalFilesChanged' in codemodResult ? codemodResult : null;

  /** @type {Array<import('../../lib/integrations.mjs').LoadedIntegration>} */
  let integrations;
  /** @type {import('../../types/config').PostCodemodHook[]} */
  let postCodemodHooks;
  /** @type {Array<{version: string, codemods: import('../../types/codemod').CodemodEntry[]}>} */
  let integrationVersionGroups;
  try {
    const project = await Project.load(cwd);
    postCodemodHooks = project.config.hooks?.postCodemod ?? [];
    const integrationSpecs = uniqueFiles([
      ...(project.integrations ?? []),
      ...(options.integration ?? []),
    ]);
    integrations = await loadIntegrations(integrationSpecs);
  } catch (err) {
    const configErr = /** @type {Error} */ (err);
    // Graceful dry-run catch: a config that fails strict validation is expected
    // & fixable ONLY when dry-run AND a pending core config codemod previewed a
    // change (the codemod that would repair it).
    const codemodWouldFixConfig = hasCoreConfigCodemod && (coreResult?.totalFilesChanged ?? 0) > 0;
    if (!apply && codemodWouldFixConfig) {
      const codemodFlags = coreConfigCodemodNames.map(name => `--codemod ${name}`).join(' ');
      const suggestedCommand = `astryx upgrade --from ${currentVersion} ${codemodFlags} --apply`;
      const guidance =
        'Your astryx.config currently fails strict validation, but a pending ' +
        'config codemod would repair it. This dry run previewed the fix without ' +
        'writing. Re-run with --apply to apply it, or run just the config codemod(s) ' +
        'now:';
      logger.warn(guidance);
      logger.info(`  ${formatCliCommand(suggestedCommand)}`);
      logger.info('Integrations are skipped in this preview; they will be processed on the --apply run.');
      logger.outro('Dry run complete');
      return {
        type: 'upgrade.status',
        data: {
          status: 'config_fixable',
          from: currentVersion,
          to: targetVersion,
          configError: configErr.message,
          configCodemods: coreConfigCodemodNames,
          suggestedCommand,
          message: guidance,
          note: 'Integrations are skipped in this preview; they will be processed on the --apply run.',
          agentDocs,
        },
      };
    }
    // Genuine config error: abort.
    logger.error(configErr.message);
    logger.outro('Aborted');
    throw new AstryxError(configErr.message, undefined, ERROR_CODES.ERR_INVALID_ARGUMENT);
  }

  if (integrations.length > 0) {
    logger.info(`Integrations: ${integrations.map(i => i.name ?? i.__spec).join(', ')}`);
  }

  // Non-blocking nudge for integration validation issues (suppressed for
  // programmatic/--json callers, i.e. the silent logger).
  try {
    await warnOnIntegrationIssues(integrations, {json: logger === noopLogger});
  } catch {
    // Never let the nudge break the upgrade.
  }

  /** @type {Map<string, Array<import('../../types/codemod').CodemodEntry>>} */
  const integrationCodemodsByVersion = new Map();
  for (const integration of integrations) {
    if (!integration?.codemods) continue;
    try {
      const byVersion = await discoverIntegrationCodemods([integration]);
      for (const [version, rawList] of byVersion) {
        const list = /** @type {Array<import('../../types/codemod').CodemodEntry>} */ (/** @type {unknown} */ (rawList));
        const existing = integrationCodemodsByVersion.get(version);
        if (existing) existing.push(...list);
        else integrationCodemodsByVersion.set(version, [...list]);
      }
    } catch {
      // Skip this integration's codemods (definition error); nudge above surfaces it.
    }
  }
  integrationVersionGroups = /** @type {Array<{version: string, codemods: import('../../types/codemod').CodemodEntry[]}>} */ (
    selectIntegrationCodemods(integrationCodemodsByVersion, currentVersion, targetVersion)
  );
  const hasIntegrationCodemods = integrationVersionGroups.some(g => g.codemods.length > 0);

  for (const {codemods} of integrationVersionGroups) {
    for (const c of codemods) {
      if (options.codemod && c.id !== options.codemod) continue;
      if (skipCodemods.has(c.id)) continue;
      if (c.codemod.isOptional && !options.codemod) totalOptional++;
      else totalTransforms++;
    }
  }

  if (versionManifests.length === 0 && !hasIntegrationCodemods) {
    logger.success('No codemods available for this version range.');
    logger.outro('Done');
    return {type: 'upgrade.status', data: {status: 'no_codemods', from: currentVersion, to: targetVersion, agentDocs}};
  }

  if (totalTransforms === 0 && totalOptional === 0) {
    const msg = `Codemod "${options.codemod}" not found. Use --list to see available codemods.`;
    logger.error(msg);
    logger.outro('Aborted');
    throw new AstryxError(msg, undefined, ERROR_CODES.ERR_UNKNOWN_CODEMOD);
  }

  if (totalTransforms > 0) {
    logger.step(`${totalTransforms} codemod${totalTransforms === 1 ? '' : 's'} to run${apply ? '' : ' (dry run)'}`);
  } else {
    logger.step('No automatic codemods to run for this version range.');
  }

  /**
   * @type {{from: string, to: string, codemods: number, integrations: string[], agentDocsRefreshed: boolean, agentDocs: import('../../types/upgrade').AgentDocsSummary, filesChanged?: number, transformsApplied?: number, errors?: Array<{file: string, codemod: string, error: string}>}}
   */
  const receipt = {
    from: currentVersion,
    to: targetVersion,
    codemods: totalTransforms,
    integrations: integrations.map(i => i.name ?? i.__spec),
    agentDocsRefreshed: agentDocs.refreshed,
    agentDocs,
  };

  let integrationResult = null;
  if (hasIntegrationCodemods) {
    logger.step('Applying integration codemods...');
    const jscodeshift = (await import('jscodeshift')).default;
    integrationResult = runIntegrationCodemods(integrationVersionGroups, {
      apply: apply,
      path: path_,
      codemod: options.codemod,
      skipCodemods,
      jscodeshift,
      silent: logger === noopLogger,
    });
  }

  const mergedFilesChanged = (coreResult?.totalFilesChanged ?? 0) + (integrationResult?.totalFilesChanged ?? 0);
  const mergedTransformsApplied = (coreResult?.totalTransformsApplied ?? 0) + (integrationResult?.totalTransformsApplied ?? 0);
  const mergedWrittenFiles = [...(coreResult?.writtenFiles ?? []), ...(integrationResult?.writtenFiles ?? [])];
  const mergedErrors = [...(coreResult?.errors ?? []), ...(integrationResult?.errors ?? [])];

  if (postCodemodHooks.length > 0 && mergedFilesChanged > 0) {
    const files = uniqueFiles(mergedWrittenFiles).map(file => path.relative(cwd, file));
    try {
      await runPostCodemodHooks(postCodemodHooks, {packageDir: cwd, files, apply: apply || false}, logger);
    } catch (err) {
      const hookErr = /** @type {Error} */ (err);
      const msg = `Post-codemod hook failed: ${hookErr.message}`;
      logger.error(msg);
      logger.outro('Upgrade failed');
      throw new AstryxError(msg, undefined, ERROR_CODES.ERR_CODEMOD_FAILED);
    }
  }

  receipt.filesChanged = mergedFilesChanged;
  receipt.transformsApplied = mergedTransformsApplied;
  receipt.errors = mergedErrors;

  if (receipt.errors?.length > 0) {
    const msg = `Upgrade completed with ${receipt.errors.length} codemod error${receipt.errors.length === 1 ? '' : 's'}.`;
    logger.outro('Upgrade failed');
    throw new AstryxError(msg, undefined, ERROR_CODES.ERR_CODEMOD_FAILED);
  }

  logger.outro(apply ? 'Upgrade complete' : 'Dry run complete');
  return {
    type: 'upgrade.run',
    data: /** @type {import('../../types/upgrade').UpgradeRunResponse['data']} */ (/** @type {unknown} */ (receipt)),
  };
}
