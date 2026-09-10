// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file upgrade.run leaf — the terminal, side-effecting run receipt.
 *
 * Orchestrates the non-list upgrade pipeline over the shared `_adapter.mjs`
 * machinery and returns the run receipt. It also OWNS the two mid-pipeline
 * short-circuits that resolve to `upgrade.status` (no_codemods, config_fixable)
 * plus the early up_to_date exit — each delegated to the `status` leaf so the
 * status envelope + its human lines live in one place.
 *
 * Pipeline (--apply): detect installed core → run CORE codemods (before
 * Project.load, so a core CONFIG codemod can repair an otherwise-invalid
 * config) → load config → discover + run INTEGRATION codemods → reconcile
 * ShadCN-copied compositions → post-codemod hooks → render + refresh agent docs
 * from final post-upgrade state. Integration DISCOVERY errors skip that
 * integration; execution errors abort before the agent-doc write.
 */

import * as path from 'node:path';
import {
  detectInstalledTargetVersion,
  prepareAgentDocsRefresh,
  applyAgentDocsRefresh,
  inspectAgentDocs,
  uniqueFiles,
  runPostCodemodHooks,
  getCoreVersionManifests,
  ensureCodemodDeps,
  runCoreCodemods,
  loadProjectContext,
  warnIntegrationIssues,
  selectIntegrationCodemodsFor,
  runIntegrationCodemodsStep,
} from '../_adapter.mjs';
import {
  logRegistryCompositionSummary,
  reconcileRegistryCompositions,
} from '../registry/registry.mjs';
import {
  statusUpToDate,
  statusNoCodemods,
  statusConfigFixable,
} from '../status/status.mjs';
import {semverGte} from '../../../foundation/env/semver.mjs';
import {getCliInvocation} from '../../../foundation/env/package-manager.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {AstryxError} from '../../error.mjs';
import {logger} from '../../logger.mjs';
import {assertWithin, PathSafetyError} from '../../../foundation/fs/path-safety.mjs';

/**
 * Run the upgrade pipeline for a validated, non-list invocation. Returns the
 * terminal run receipt, or one of the status short-circuits; throws AstryxError
 * on failure. Progress is emitted through the shared `logger` (silent by default).
 *
 * @param {import('../_adapter.mjs').UpgradeOptions} [options]
 * @param {{cwd?: string}} [ctx]
 * @returns {Promise<import('../upgrade.type.mjs').UpgradeStatusResponse | import('../upgrade.type.mjs').UpgradeRunResponse>}
 */
export async function run(options = {}, {cwd = process.cwd()} = {}) {
  // Resolve the source dir against the API's cwd (not process.cwd()) so a
  // programmatic caller in another directory scans the right tree. Confine it to
  // cwd: --apply rewrites files in place, so a `..`-escaping or out-of-tree
  // absolute --path must be rejected (parity with template/theme/swizzle/layout,
  // and this is the most destructive command). allowAbsolute permits an absolute
  // path that still resolves inside cwd.
  let path_;
  try {
    path_ = assertWithin(options.path ?? './src', cwd, {
      allowAbsolute: true,
      label: 'source directory',
    });
  } catch (err) {
    if (err instanceof PathSafetyError) {
      logger.error(err.message);
      logger.log('Aborted\n');
      throw new AstryxError(err.message, undefined, ERROR_CODES.ERR_PATH_TRAVERSAL);
    }
    throw err;
  }
  const apply = options.apply ?? false;

  const currentVersion = /** @type {string} */ (options.from);
  const installed = detectInstalledTargetVersion(cwd);
  if (!installed) {
    const msg = `Could not find installed @astryxdesign/core (or legacy @xds/core). Install the target version first, then rerun \`${getCliInvocation()} upgrade --from <old-version>\`.`;
    logger.error(msg);
    logger.log('Aborted\n');
    throw new AstryxError(msg, undefined, ERROR_CODES.ERR_VERSION_DETECT);
  }
  const targetVersion = installed.version;

  const reconcileCompositions = async () => {
    if (options.codemod) return null;
    const result = await reconcileRegistryCompositions(
      {apply, path: path_},
      {
        cwd,
        expectedVersion:
          installed.packageName === '@astryxdesign/core'
            ? targetVersion
            : undefined,
        requireExpectedVersion: true,
      },
    );
    if (result.summary.found > 0) {
      logRegistryCompositionSummary(result.summary);
      return result;
    }
    return null;
  };

  logger.log(`From version: ${currentVersion}`);
  logger.log(`Installed target: ${targetVersion} (${installed.packageName})`);

  // Up-to-date check — no codemods will run, safe to render agent docs now.
  if (!options.force && semverGte(currentVersion, targetVersion)) {
    const registryResult = await reconcileCompositions();
    const agentDocsPlan = await prepareAgentDocsRefresh({
      cwd,
      installedVersion: targetVersion,
      apply,
    });
    const agentDocs = apply
      ? applyAgentDocsRefresh(agentDocsPlan)
      : agentDocsPlan.summary;
    return statusUpToDate({
      from: currentVersion,
      to: targetVersion,
      agentDocs,
      ...(registryResult ? {registryCompositions: registryResult.summary} : {}),
    });
  }

  const versionManifests = await getCoreVersionManifests(currentVersion, targetVersion);

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

  const ready = await ensureCodemodDeps({installDeps: options.installDeps});
  if (!ready) {
    const msg = 'jscodeshift is required but could not be installed.';
    logger.log('Aborted\n');
    throw new AstryxError(msg, undefined, ERROR_CODES.ERR_DEP_MISSING);
  }

  // CORE codemods run FIRST (before loading config) so a core CONFIG codemod can
  // repair a config the strict loader would otherwise reject.
  const codemodResult = await runCoreCodemods(versionManifests, {
    apply,
    path: path_,
    codemod: options.codemod,
    skipCodemods,
  });
  const coreResult = codemodResult && 'totalFilesChanged' in codemodResult ? codemodResult : null;

  /** @type {Array<import('../../../foundation/integrations/integrations.mjs').LoadedIntegration>} */
  let integrations;
  /** @type {import('../../../authoring/config/type').PostCodemodHook[]} */
  let postCodemodHooks;
  try {
    const projectContext = await loadProjectContext(cwd, options.integration ?? []);
    postCodemodHooks = projectContext.postCodemodHooks;
    integrations = projectContext.integrations;
  } catch (err) {
    const configErr = /** @type {Error} */ (err);
    // Graceful dry-run catch: a config that fails strict validation is expected
    // & fixable ONLY when dry-run AND a pending core config codemod previewed a
    // change (the codemod that would repair it).
    const codemodWouldFixConfig = hasCoreConfigCodemod && (coreResult?.totalFilesChanged ?? 0) > 0;
    if (!apply && codemodWouldFixConfig) {
      // Lightweight inspection — no config/Project load (config is still broken
      // in dry-run; the codemod previewed a fix but did not write it).
      const inspection = inspectAgentDocs(cwd, targetVersion);
      return statusConfigFixable(
        {
          from: currentVersion,
          to: targetVersion,
          configError: configErr.message,
          configCodemods: coreConfigCodemodNames,
          agentDocs: /** @type {import('../upgrade.type.mjs').AgentDocsSummary} */ ({
            status: inspection.status,
            installedVersion: targetVersion,
            fromVersions: inspection.blockVersions,
            files: inspection.staleFiles,
            refreshed: false,
            action: inspection.status === 'missing' ? 'nudge-init' : 'none',
          }),
        },
      );
    }
    // Genuine config error: abort.
    logger.error(configErr.message);
    logger.log('Aborted\n');
    throw new AstryxError(configErr.message, undefined, ERROR_CODES.ERR_INVALID_ARGUMENT);
  }

  if (integrations.length > 0) {
    logger.log(`Integrations: ${integrations.map(i => i.name ?? i.__spec).join(', ')}`);
  }

  // Non-blocking nudge for integration validation issues (suppressed for
  // programmatic/--json callers, i.e. the silent logger).
  await warnIntegrationIssues(integrations);

  const integrationVersionGroups = await selectIntegrationCodemodsFor(
    integrations,
    currentVersion,
    targetVersion,
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
    const registryResult = await reconcileCompositions();
    // No codemods in range — safe to render agent docs from current state.
    const agentDocsPlan = await prepareAgentDocsRefresh({
      cwd,
      installedVersion: targetVersion,
      apply,
    });
    const agentDocs = apply
      ? applyAgentDocsRefresh(agentDocsPlan)
      : agentDocsPlan.summary;
    return statusNoCodemods({
      from: currentVersion,
      to: targetVersion,
      agentDocs,
      ...(registryResult ? {registryCompositions: registryResult.summary} : {}),
    });
  }

  if (totalTransforms === 0 && totalOptional === 0) {
    const msg = `Codemod "${options.codemod}" not found. Use --list to see available codemods.`;
    logger.error(msg);
    logger.log('Aborted\n');
    throw new AstryxError(msg, undefined, ERROR_CODES.ERR_UNKNOWN_CODEMOD);
  }

  if (totalTransforms > 0) {
    logger.log(`${totalTransforms} codemod${totalTransforms === 1 ? '' : 's'} to run${apply ? '' : ' (dry run)'}`);
  } else {
    logger.log('No automatic codemods to run for this version range.');
  }

  /**
   * @type {{from: string, to: string, codemods: number, integrations: string[], agentDocsRefreshed: boolean, agentDocs: import('../upgrade.type.mjs').AgentDocsSummary, registryCompositions?: import('../upgrade.type.mjs').RegistryCompositionSummary, filesChanged?: number, transformsApplied?: number, errors?: Array<{file: string, codemod: string, error: string}>}}
   */
  const receipt = {
    from: currentVersion,
    to: targetVersion,
    codemods: totalTransforms,
    integrations: integrations.map(i => i.name ?? i.__spec),
    agentDocsRefreshed: false,
    agentDocs: /** @type {import('../upgrade.type.mjs').AgentDocsSummary} */ ({
      status: 'current', installedVersion: targetVersion,
      fromVersions: [], files: [], refreshed: false, action: 'none',
    }),
  };

  let integrationResult = null;
  if (hasIntegrationCodemods) {
    logger.log('Applying integration codemods...');
    integrationResult = await runIntegrationCodemodsStep(integrationVersionGroups, {
      apply,
      path: path_,
      codemod: options.codemod,
      skipCodemods,
    });
  }

  const registryResult = await reconcileCompositions();

  const mergedFilesChanged = (coreResult?.totalFilesChanged ?? 0) + (integrationResult?.totalFilesChanged ?? 0);
  const mergedTransformsApplied = (coreResult?.totalTransformsApplied ?? 0) + (integrationResult?.totalTransformsApplied ?? 0);
  const mergedWrittenFiles = [
    ...(coreResult?.writtenFiles ?? []),
    ...(integrationResult?.writtenFiles ?? []),
    ...(registryResult?.writtenFiles ?? []),
  ];
  const mergedErrors = [...(coreResult?.errors ?? []), ...(integrationResult?.errors ?? [])];
  const registryFilesChanged = registryResult?.writtenFiles.length ?? 0;

  if (postCodemodHooks.length > 0 && (mergedFilesChanged > 0 || registryFilesChanged > 0)) {
    const files = uniqueFiles(mergedWrittenFiles).map(file => path.relative(cwd, file));
    try {
      await runPostCodemodHooks(postCodemodHooks, {packageDir: cwd, files, apply: apply || false});
    } catch (err) {
      const hookErr = /** @type {Error} */ (err);
      const msg = `Post-codemod hook failed: ${hookErr.message}`;
      logger.error(msg);
      logger.log('Upgrade failed\n');
      throw new AstryxError(msg, undefined, ERROR_CODES.ERR_CODEMOD_FAILED);
    }
  }

  receipt.filesChanged = mergedFilesChanged;
  receipt.transformsApplied = mergedTransformsApplied;
  receipt.errors = mergedErrors;
  if (registryResult) receipt.registryCompositions = registryResult.summary;

  if (receipt.errors?.length > 0) {
    const msg = `Upgrade completed with ${receipt.errors.length} codemod error${receipt.errors.length === 1 ? '' : 's'}.`;
    logger.log('Upgrade failed\n');
    throw new AstryxError(msg, undefined, ERROR_CODES.ERR_CODEMOD_FAILED);
  }

  // All codemods + hooks succeeded — render from final post-upgrade state.
  const agentDocsPlan = await prepareAgentDocsRefresh({
    cwd,
    installedVersion: targetVersion,
    apply,
    fresh: true,
  });
  const completedAgentDocs = apply
    ? applyAgentDocsRefresh(agentDocsPlan)
    : agentDocsPlan.summary;
  receipt.agentDocs = completedAgentDocs;
  receipt.agentDocsRefreshed = completedAgentDocs.refreshed;

  const registryOk = receipt.registryCompositions?.ok ?? true;
  logger.log(
    registryOk
      ? (apply ? 'Upgrade complete' : 'Dry run complete') + '\n'
      : 'Upgrade finished with unresolved registry items\n',
  );
  return {
    type: 'upgrade.run',
    data: /** @type {import('../upgrade.type.mjs').UpgradeRunResponse['data']} */ (/** @type {unknown} */ (receipt)),
  };
}
