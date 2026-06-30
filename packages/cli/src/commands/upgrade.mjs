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
 *   --from <version>     Previous version before the dependency upgrade
 *   --apply              Write changes to disk (default: dry-run)
 *   --force              Run codemods even when from >= installed version
 *   --codemod <name>     Run a specific transform only
 *   --integration <spec> Load an explicit integration package or file
 *   --path <dir>         Source directory (default: ./src)
 *   --install-deps       Auto-install jscodeshift without prompting (for CI/LLM)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import * as p from '@clack/prompts';
import {ensureJscodeshift} from '../codemods/ensure-jscodeshift.mjs';
import {getTransformsBetween, latestVersion} from '../codemods/registry.mjs';
import {runCodemods} from '../codemods/runner.mjs';
import {
  discoverIntegrationCodemods,
  selectIntegrationCodemods,
} from '../codemods/integration-discovery.mjs';
import {runIntegrationCodemods} from '../codemods/integration-runner.mjs';
import {installAgentDocs, discoverAgentDocs} from './agent-docs.mjs';
import {getRunPrefix} from '../utils/package-manager.mjs';
import {isValidSemver, semverGte} from '../utils/semver.mjs';
import {jsonOut, jsonError} from '../lib/json.mjs';
import {loadConfig} from '../lib/config.mjs';
import {loadIntegrations} from '../lib/integrations.mjs';
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
          'Missing required --from. Install the target version first, then run `astryx upgrade --from <old-version>`.';
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
          'Could not find installed @astryxdesign/core (or legacy @xds/core). Install the target version first, then rerun `astryx upgrade --from <old-version>`.';
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

      let integrations;
      let postCodemodHooks;
      let integrationCodemodsByVersion;
      try {
        const config = await loadConfig(process.cwd());
        postCodemodHooks = config.hooks?.postCodemod ?? [];
        const integrationSpecs = uniqueFiles([
          ...(config.integrations ?? []),
          ...(options.integration ?? []),
        ]);
        integrations = await loadIntegrations(integrationSpecs);
        // Discover file-based integration codemods up front. A broken
        // integration (bad export, invalid schema, duplicate id) is a hard
        // error here so the upgrade fails before mutating any files.
        integrationCodemodsByVersion =
          await discoverIntegrationCodemods(integrations);
      } catch (err) {
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

      // Resolve transforms. Core built-in codemods come from the registry;
      // file-based integration codemods are discovered separately and run
      // alongside them, ordered by version.
      const versionManifests = [
        ...(await getTransformsBetween(currentVersion, targetVersion)),
      ];
      const integrationVersionGroups = selectIntegrationCodemods(
        integrationCodemodsByVersion,
        currentVersion,
        targetVersion,
      );
      const hasIntegrationCodemods = integrationVersionGroups.some(
        g => g.codemods.length > 0,
      );

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

      // Count transforms (optional codemods only count when explicitly requested)
      let totalTransforms = 0;
      let totalOptional = 0;
      for (const {transforms} of versionManifests) {
        for (const t of transforms) {
          if (options.codemod && t.name !== options.codemod) continue;
          if (t.optional && !options.codemod) {
            totalOptional++;
          } else {
            totalTransforms++;
          }
        }
      }
      for (const {codemods} of integrationVersionGroups) {
        for (const c of codemods) {
          if (options.codemod && c.id !== options.codemod) continue;
          if (c.codemod.isOptional && !options.codemod) {
            totalOptional++;
          } else {
            totalTransforms++;
          }
        }
      }

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

      // Ensure jscodeshift is available
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

      // Run codemods
      const codemodResult = await runCodemods(versionManifests, {
        apply: options.apply,
        path: options.path,
        codemod: options.codemod,
        silent: json,
      });

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
              `Could not update agent docs. Run \`${getRunPrefix()} astryx init --features agents\` to update manually.`,
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
