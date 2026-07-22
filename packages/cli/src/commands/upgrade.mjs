// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file upgrade command — Full version-to-version upgrade pipeline
 *
 * `astryx upgrade` runs codemods that migrate source code from a previous
 * Astryx version to the currently installed version.
 *
 * Consumers should bump/install their Astryx packages first, then run:
 *   astryx upgrade --from <old-version> --path <source-dir> --apply
 *
 * Pipeline (--apply):
 *   1. Read installed @astryxdesign/core (or legacy @xds/core) version
 *   2. Run codemods for --from → installed version
 *   3. Refresh agent docs (AGENTS.md / CLAUDE.md) if present
 *
 * Options:
 *   --from <version>       Previous version before the dependency upgrade
 *   --apply                Write changes to disk (default: dry-run)
 *   --force                Run codemods even when from >= installed version
 *   --codemod <name>       Run a specific transform only
 *   --skip-codemod <name…> Exclude named codemods (variadic). Use this to
 *                          re-run past a codemod that failed at execution time.
 *   --integration <spec>   Load an explicit integration package or file
 *   --path <dir>           Source directory (default: ./src)
 *   --install-deps         Auto-install jscodeshift without prompting (for CI/LLM)
 *
 * Integration error policy:
 *   - A DISCOVERY/definition error for an integration (bad manifest/export,
 *     duplicate ids, missing root) SKIPS that integration's codemods and warns
 *     (via the integration-issue nudge) — it does NOT hard-fail the upgrade.
 *   - An EXECUTION-time failure (a transform THROWS while rewriting files)
 *     ABORTS the upgrade (nonzero exit) so a partial write never proceeds.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import * as p from '../lib/term-log.mjs';
import {ensureJscodeshift} from '../codemods/ensure-jscodeshift.mjs';
import {getTransformsBetween, latestVersion} from '../codemods/registry.mjs';
import {runCodemods} from '../codemods/runner.mjs';
import {
  discoverIntegrationCodemods,
  selectIntegrationCodemods,
} from '../codemods/integration-discovery.mjs';
import {runIntegrationCodemods} from '../codemods/integration-runner.mjs';
import {installAgentDocs, discoverAgentDocs} from './agent-docs.mjs';
import {getCliInvocation, formatCliCommand} from '../utils/package-manager.mjs';
import {isValidSemver, semverGte} from '../utils/semver.mjs';
import {jsonOut, jsonError} from '../lib/json.mjs';
import {Project} from '../lib/project.mjs';
import {loadIntegrations} from '../lib/integrations.mjs';
import {warnOnIntegrationIssues} from '../lib/integration-warnings.mjs';
import {ERROR_CODES} from '../lib/error-codes.mjs';

const execFileAsync = promisify(execFile);

/**
 * Detect the installed target version from node_modules.
 * @returns {{version: string, packageName: string}|null}
 */
function detectInstalledTargetVersion() {
  for (const packageName of ['@astryxdesign/core', '@xds/core']) {
    const pkgPath = path.resolve(
      process.cwd(),
      'node_modules',
      ...packageName.split('/'),
      'package.json',
    );
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (pkg.version) return {version: pkg.version, packageName};
    } catch {
      // Missing or unreadable package.json — try the next supported package name.
    }
  }
  return null;
}

function uniqueFiles(files) {
  return [...new Set((files ?? []).filter(Boolean))];
}

/**
 * Run the app config's post-codemod hooks (config.hooks.postCodemod).
 *
 * Each hook's `buildCommand({packageDir, files})` returns a command to run
 * (or a nullish value to skip). In dry-run mode we only PREVIEW — buildCommand
 * is called (so a throw still fails the run) but the command is never executed.
 * In apply mode the commands run in order via execFile; a nonzero exit (or a
 * buildCommand throw) fails the upgrade.
 *
 * @param {import('../types/config').PostCodemodHook[]} hooks
 * @param {{packageDir: string, files: string[], apply: boolean}} context
 * @param {boolean} silent
 */
async function runPostCodemodHooks(hooks, context, silent) {
  if (!hooks || hooks.length === 0) return;

  const log = silent ? {info() {}, warn() {}, success() {}, error() {}} : p.log;
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
      log.info(`Post-codemod hook ${label} produced no command; skipping.`);
      continue;
    }

    if (!apply) {
      const preview = [cmd.command, ...(cmd.args ?? [])].join(' ');
      log.info(`Post-codemod hook ${label} (dry run): ${preview}`);
      continue;
    }

    await execFileAsync(cmd.command, cmd.args ?? [], {
      cwd: cmd.options?.cwd ?? packageDir,
      timeout: cmd.options?.timeout ?? 300_000,
      stdio: 'pipe',
      encoding: 'utf-8',
      ...cmd.options,
      env: {...process.env, ...(cmd.options?.env ?? {})},
    });
    log.success(`Post-codemod hook ${label} completed.`);
  }
}

/**
 * Register the `upgrade` command (codemod-driven version migration).
 */
export function registerUpgrade(program) {
  program
    .command('upgrade')
    .description('Run codemods to migrate between versions')
    .option(
      '--from <version>',
      'Previous version before the dependency upgrade',
    )
    .option('--apply', 'Write changes to disk (default: dry-run)', false)
    .option(
      '--force',
      'Run codemods even if --from is newer than the installed version',
      false,
    )
    .option('--codemod <name>', 'Run a specific transform only')
    .option(
      '--skip-codemod <name...>',
      'Exclude named codemods (repeatable). Re-run past a failed codemod by skipping it.',
    )
    .option(
      '--integration <package-or-file>',
      'Explicit integration package name or integration file path (repeatable)',
      (value, previous) => [...(previous ?? []), value],
      [],
    )
    .option('--path <dir>', 'Source directory to scan', './src')
    .option(
      '--install-deps',
      'Auto-install jscodeshift without prompting',
      false,
    )
    .option('--list', 'List available codemods', false)
    .action(async options => {
      const json = program.opts().json || false;
      if (!json) p.intro('Upgrade');

      if (!options.list && !options.from) {
        const msg =
          `Missing required --from. Install the target version first, then run \`${getCliInvocation()} upgrade --from <old-version>\`.`;
        if (json)
          return jsonError(msg, undefined, ERROR_CODES.ERR_INVALID_ARGUMENT);
        p.log.error(msg);
        p.outro('Aborted');
        process.exitCode = 1;
        return;
      }

      // Validate --from upfront so callers don't silently accept typos.
      if (!options.list && !isValidSemver(options.from)) {
        const msg = `Invalid --from value: "${options.from}". Expected a semver string like 0.0.5.`;
        if (json)
          return jsonError(msg, undefined, ERROR_CODES.ERR_INVALID_VERSION);
        p.log.error(msg);
        p.outro('Aborted');
        process.exitCode = 1;
        return;
      }
      if (options.list) {
        const codemods = [];
        // Walk the registry once from 0.0.0 → latest. Earlier this looped
        // over every version and re-walked getTransformsBetween('0.0.0', v),
        // so each codemod was printed once per release that included it
        // (31 unique × 9 ≈ 201 lines on the current registry).
        const manifests = await getTransformsBetween('0.0.0', latestVersion);
        for (const {version, transforms} of manifests) {
          for (const {name, meta, optional} of transforms) {
            codemods.push({
              name,
              title: meta.title,
              version,
              pr: meta.pr,
              optional: !!optional,
            });
          }
        }
        if (json)
          return jsonOut(
            'upgrade.list',
            codemods.map(({name, title, version, optional}) => ({
              name,
              title,
              version,
              optional,
            })),
          );
        p.log.step('Available codemods:');
        for (const {name, title, pr, optional} of codemods) {
          p.log.info(
            `  ${name} — ${title}${optional ? ' (optional)' : ''} (${pr})`,
          );
        }
        p.outro('Done');
        return;
      }

      const currentVersion = options.from;
      const installed = detectInstalledTargetVersion();
      if (!installed) {
        const msg =
          `Could not find installed @astryxdesign/core (or legacy @xds/core). Install the target version first, then rerun \`${getCliInvocation()} upgrade --from <old-version>\`.`;
        if (json)
          return jsonError(msg, undefined, ERROR_CODES.ERR_VERSION_DETECT);
        p.log.error(msg);
        p.outro('Aborted');
        process.exitCode = 1;
        return;
      }
      const targetVersion = installed.version;

      if (!json) {
        p.log.info(`From version: ${currentVersion}`);
        p.log.info(
          `Installed target: ${targetVersion} (${installed.packageName})`,
        );
      }

      // ───────────────────────────────────────────────────────────────────
      // PIPELINE ORDERING
      //
      // CORE codemods run BEFORE the consumer's config is loaded. `Project.load`
      // STRICT-validates astryx.config.* and THROWS on unknown keys — but a core
      // CONFIG codemod (e.g. v0.1.3 migrate-layout-components, signalled by
      // `meta.codemodType === 'config'`) is precisely what repairs an otherwise
      // -invalid config. Loading first created a chicken-and-egg: the config was
      // rejected before the codemod that would fix it ever ran. Core codemods
      // read files directly (config codemods via runConfigCodemod read
      // astryx.config.*; code codemods scan --path), so they do NOT need the
      // loaded config. We run them here, then load config, then sequence the
      // integration codemods (which DO require a valid loaded config).
      // ───────────────────────────────────────────────────────────────────

      if (!options.force && semverGte(currentVersion, targetVersion)) {
        if (json) {
          return jsonOut('upgrade.status', {
            status: 'up_to_date',
            from: currentVersion,
            to: targetVersion,
          });
        }
        p.log.success('Already up to date — no codemods to run.');
        p.log.info('Use --force to run codemods anyway.');
        p.outro('Done');
        return;
      }

      // Resolve CORE transforms from the registry. These do not need the loaded
      // config. Integration codemods are discovered later, AFTER the config
      // loads successfully (they require a valid config to resolve).
      const versionManifests = [
        ...(await getTransformsBetween(currentVersion, targetVersion)),
      ];

      // Does the selected core set include >=1 CONFIG codemod? A config codemod
      // is the established convention `meta.codemodType === 'config'` (see
      // `toUnifiedEntry` in runner.mjs). This drives the graceful dry-run catch
      // around `Project.load` below: a fixable config error is only "expected"
      // when a pending core config codemod would repair it.
      const coreConfigCodemodNames = [];
      for (const {transforms} of versionManifests) {
        for (const t of transforms) {
          if (options.codemod && t.name !== options.codemod) continue;
          if (t.meta?.codemodType === 'config') {
            coreConfigCodemodNames.push(t.name);
          }
        }
      }
      const hasCoreConfigCodemod = coreConfigCodemodNames.length > 0;

      // Codemods explicitly excluded via --skip-codemod, matched by the same
      // identifier the run loop uses (core transform `t.name`, integration
      // codemod `c.id`). Lets a user re-run past a codemod that failed at
      // execution time.
      const skipCodemods = new Set(options.skipCodemod ?? []);

      // Count CORE transforms (optional codemods only count when explicitly
      // requested). Integration counts are added after discovery below.
      let totalTransforms = 0;
      let totalOptional = 0;
      for (const {transforms} of versionManifests) {
        for (const t of transforms) {
          if (options.codemod && t.name !== options.codemod) continue;
          if (skipCodemods.has(t.name)) continue;
          if (t.optional && !options.codemod) {
            totalOptional++;
          } else {
            totalTransforms++;
          }
        }
      }

      // Ensure jscodeshift is available before running any codemod.
      const ready = await ensureJscodeshift({
        installDeps: options.installDeps,
        silent: json,
      });
      if (!ready) {
        if (json)
          return jsonError(
            'jscodeshift is required but could not be installed.',
            undefined,
            ERROR_CODES.ERR_DEP_MISSING,
          );
        p.outro('Aborted');
        process.exitCode = 1;
        return;
      }

      // STEP 3 — Run CORE codemods FIRST (before loading config). In --apply,
      // core config codemods WRITE the repaired config to disk; in dry-run they
      // only PREVIEW. This is what makes the v0.1.3 config codemod reachable on
      // a config that the strict loader would otherwise reject.
      const codemodResult = await runCodemods(versionManifests, {
        apply: options.apply,
        path: options.path,
        codemod: options.codemod,
        skipCodemods,
        silent: json,
      });

      // STEP 4 — Load the consumer's config (STRICT validation; unchanged). On
      // --apply this now sees the repaired config the core codemod just wrote.
      // We need `hooks.postCodemod` and the configured integration specs from
      // here. Wrap in a graceful dry-run catch (see below).
      // Assigned inside the try below; every catch branch returns, so these
      // are always set before any later read.
      let integrations;
      let postCodemodHooks;
      let integrationVersionGroups;
      try {
        const project = await Project.load(process.cwd());
        postCodemodHooks = project.config.hooks?.postCodemod ?? [];
        const integrationSpecs = uniqueFiles([
          ...(project.integrations ?? []),
          ...(options.integration ?? []),
        ]);
        integrations = await loadIntegrations(integrationSpecs);
      } catch (err) {
        // GRACEFUL DRY-RUN CATCH. A config that fails strict validation is the
        // EXPECTED, fixable case ONLY when we are in dry-run AND a pending core
        // config codemod just PREVIEWED a change to the config — i.e. the very
        // codemod that would repair it. (Merely having a config codemod in the
        // range is not enough: it may be a no-op on this config, in which case
        // the validation error is genuine and we must abort. A config codemod
        // that THREW reports zero would-change files, so it also fails this
        // gate and aborts below — preserving the strictness contract.) This is
        // the reason this PR reorders the pipeline.
        const codemodWouldFixConfig =
          hasCoreConfigCodemod && (codemodResult?.totalFilesChanged ?? 0) > 0;
        if (!options.apply && codemodWouldFixConfig) {
          const codemodFlags = coreConfigCodemodNames
            .map(name => `--codemod ${name}`)
            .join(' ');
          // Canonical (bare) form — this is a structured, machine-executable
          // field in the --json envelope. The human print below is made
          // install-aware via formatCliCommand.
          const suggestedCommand = `astryx upgrade --from ${currentVersion} ${codemodFlags} --apply`;
          const guidance =
            'Your astryx.config currently fails strict validation, but a pending ' +
            'config codemod would repair it. This dry run previewed the fix without ' +
            'writing. Re-run with --apply to apply it, or run just the config codemod(s) ' +
            'now:';
          if (json) {
            return jsonOut('upgrade.status', {
              status: 'config_fixable',
              from: currentVersion,
              to: targetVersion,
              configError: err.message,
              configCodemods: coreConfigCodemodNames,
              suggestedCommand,
              message: guidance,
              note: 'Integrations are skipped in this preview; they will be processed on the --apply run.',
            });
          }
          p.log.warn(guidance);
          p.log.info(`  ${formatCliCommand(suggestedCommand)}`);
          p.log.info(
            'Integrations are skipped in this preview; they will be processed on the --apply run.',
          );
          p.outro('Dry run complete');
          return;
        }
        // Genuine config error (apply mode, OR dry-run with no pending core
        // config codemod that would fix it): abort as before.
        if (json)
          return jsonError(
            err.message,
            undefined,
            ERROR_CODES.ERR_INVALID_ARGUMENT,
          );
        p.log.error(err.message);
        p.outro('Aborted');
        process.exitCode = 1;
        return;
      }

      if (!json && integrations.length > 0) {
        p.log.info(
          `Integrations: ${integrations.map(i => i.name ?? i.__spec).join(', ')}`,
        );
      }

      // Non-blocking nudge: if any configured integration has validation
      // issues, print one compact line to stderr pointing at
      // validate-integration. Best-effort; suppressed in --json mode. This
      // depends on integrations being loaded, so it lives after the successful
      // config load (it is skipped on the graceful dry-run path above, where
      // integrations were never loaded).
      try {
        await warnOnIntegrationIssues(integrations, {json});
      } catch {
        // Never let the nudge break the upgrade.
      }

      // STEP 5 — Discover + run INTEGRATION codemods (only reached on a
      // successful config load). A broken integration (bad export, invalid
      // schema, duplicate id, missing root) is a DEFINITION error: skip that
      // integration's codemods and warn (via the nudge above), rather than
      // hard-failing the upgrade. An EXECUTION-time failure (a transform
      // throwing) is handled later by the codemod-error gate, which still
      // aborts the upgrade.
      const integrationCodemodsByVersion = new Map();
      for (const integration of integrations) {
        if (!integration?.codemods) continue;
        try {
          const byVersion = await discoverIntegrationCodemods([integration]);
          for (const [version, list] of byVersion) {
            const existing = integrationCodemodsByVersion.get(version);
            if (existing) existing.push(...list);
            else integrationCodemodsByVersion.set(version, [...list]);
          }
        } catch {
          // Skip this integration's codemods; the validate-integration nudge
          // above surfaces the underlying issue. Best-effort, non-blocking.
        }
      }
      integrationVersionGroups = selectIntegrationCodemods(
        integrationCodemodsByVersion,
        currentVersion,
        targetVersion,
      );
      const hasIntegrationCodemods = integrationVersionGroups.some(
        g => g.codemods.length > 0,
      );

      // Add integration transforms to the run counts.
      for (const {codemods} of integrationVersionGroups) {
        for (const c of codemods) {
          if (options.codemod && c.id !== options.codemod) continue;
          if (skipCodemods.has(c.id)) continue;
          if (c.codemod.isOptional && !options.codemod) {
            totalOptional++;
          } else {
            totalTransforms++;
          }
        }
      }

      // No codemods at all for this range (neither core nor integration).
      if (versionManifests.length === 0 && !hasIntegrationCodemods) {
        if (json) {
          return jsonOut('upgrade.status', {
            status: 'no_codemods',
            from: currentVersion,
            to: targetVersion,
          });
        }
        p.log.success('No codemods available for this version range.');
        p.outro('Done');
        return;
      }

      // A named `--codemod` that matched nothing (across core + integration).
      if (totalTransforms === 0 && totalOptional === 0) {
        const msg = `Codemod "${options.codemod}" not found. Use --list to see available codemods.`;
        if (json)
          return jsonError(msg, undefined, ERROR_CODES.ERR_UNKNOWN_CODEMOD);
        p.log.error(msg);
        p.outro('Aborted');
        process.exitCode = 1;
        return;
      }

      if (!json) {
        if (totalTransforms > 0) {
          p.log.step(
            `${totalTransforms} codemod${totalTransforms === 1 ? '' : 's'} to run${options.apply ? '' : ' (dry run)'}`,
          );
        } else {
          p.log.step('No automatic codemods to run for this version range.');
        }
      }

      const receipt = {
        from: currentVersion,
        to: targetVersion,
        codemods: totalTransforms,
        integrations: integrations.map(i => i.name ?? i.__spec),
        agentDocsRefreshed: false,
      };

      // Run file-based integration codemods alongside the core registry
      // codemods (config codemods first, then code codemods), ordered by
      // version. Their results are merged into the receipt below.
      let integrationResult = null;
      if (hasIntegrationCodemods) {
        if (!json) p.log.step('Applying integration codemods...');
        const jscodeshift = (await import('jscodeshift')).default;
        integrationResult = runIntegrationCodemods(integrationVersionGroups, {
          apply: options.apply,
          path: options.path,
          codemod: options.codemod,
          skipCodemods,
          jscodeshift,
          silent: json,
        });
      }


      // Merge core + integration codemod results into a single accounting so
      // hooks, receipts, and error gating see both.
      const mergedFilesChanged =
        (codemodResult?.totalFilesChanged ?? 0) +
        (integrationResult?.totalFilesChanged ?? 0);
      const mergedTransformsApplied =
        (codemodResult?.totalTransformsApplied ?? 0) +
        (integrationResult?.totalTransformsApplied ?? 0);
      const mergedWrittenFiles = [
        ...(codemodResult?.writtenFiles ?? []),
        ...(integrationResult?.writtenFiles ?? []),
      ];
      const mergedErrors = [
        ...(codemodResult?.errors ?? []),
        ...(integrationResult?.errors ?? []),
      ];

      // Post-codemod hooks come from the app config (config.hooks.postCodemod).
      // They run only when codemods actually changed files. In apply mode the
      // commands execute (nonzero exit fails the upgrade); in dry-run mode we
      // only preview the resolved command (a buildCommand throw still fails).
      const changedFileCount = mergedFilesChanged;
      if (postCodemodHooks.length > 0 && changedFileCount > 0) {
        const absoluteChangedFiles = uniqueFiles(mergedWrittenFiles);
        const files = absoluteChangedFiles.map(file =>
          path.relative(process.cwd(), file),
        );
        try {
          await runPostCodemodHooks(
            postCodemodHooks,
            {
              packageDir: process.cwd(),
              files,
              apply: options.apply,
            },
            json,
          );
        } catch (err) {
          if (json)
            return jsonError(
              `Post-codemod hook failed: ${err.message}`,
              {receipt},
              ERROR_CODES.ERR_CODEMOD_FAILED,
            );
          p.log.error(`Post-codemod hook failed: ${err.message}`);
          p.outro('Upgrade failed');
          process.exitCode = 1;
          return;
        }
      }

      // Refresh agent docs if any exist (AGENTS.md, CLAUDE.md, .claude/CLAUDE.md, etc.)
      // Always update after --apply; also update during dry-run if files exist,
      // since the index reflects the installed CLI version, not the codemods.
      const existingDocs = discoverAgentDocs(process.cwd());
      if (existingDocs.length > 0) {
        try {
          // onlyReplace: only update files that already have Astryx markers.
          // Don't inject into files that never had Astryx content.
          const written = installAgentDocs(process.cwd(), {onlyReplace: true});
          receipt.agentDocsRefreshed = written.length > 0;
          if (!json && written.length > 0)
            p.log.success(`Agent docs updated: ${written.join(', ')}`);
        } catch {
          if (!json) {
            p.log.warn(
              `Could not update agent docs. Run \`${getCliInvocation()} init --features agents\` to update manually.`,
            );
          }
        }
      }

      receipt.filesChanged = mergedFilesChanged;
      receipt.transformsApplied = mergedTransformsApplied;
      receipt.errors = mergedErrors;

      if (receipt.errors?.length > 0) {
        const msg = `Upgrade completed with ${receipt.errors.length} codemod error${receipt.errors.length === 1 ? '' : 's'}.`;
        if (json) {
          return jsonError(msg, {receipt}, ERROR_CODES.ERR_CODEMOD_FAILED);
        }
        p.outro('Upgrade failed');
        process.exitCode = 1;
        return;
      }

      if (json) {
        return jsonOut('upgrade.run', receipt);
      }
      p.outro(options.apply ? 'Upgrade complete' : 'Dry run complete');
    });
}
