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
import {pathToFileURL} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import * as p from '@clack/prompts';
import {ensureJscodeshift} from '../codemods/ensure-jscodeshift.mjs';
import {
  getTransformsBetween,
  latestVersion,
} from '../codemods/registry.mjs';
import {runCodemods} from '../codemods/runner.mjs';
import {installAgentDocs, discoverAgentDocs} from './agent-docs.mjs';
import {getRunPrefix} from '../utils/package-manager.mjs';
import {isValidSemver, semverGte, semverGt} from '../utils/semver.mjs';
import {jsonOut, jsonError} from '../lib/json.mjs';
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


function isPathSpec(spec) {
  return (
    spec.startsWith('.') ||
    spec.startsWith('/') ||
    spec.endsWith('.mjs') ||
    spec.endsWith('.js')
  );
}

function resolvePackageDir(packageName) {
  const parts = packageName.split('/');
  return path.resolve(process.cwd(), 'node_modules', ...parts);
}

function resolveIntegrationFile(spec) {
  if (isPathSpec(spec)) {
    return path.resolve(process.cwd(), spec);
  }

  const packageDir = resolvePackageDir(spec);
  const pkgPath = path.join(packageDir, 'package.json');
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  } catch {
    throw new Error(
      `Could not find installed integration package "${spec}" at ${pkgPath}. Install it first or pass a direct integration file path.`,
    );
  }

  const manifestPath = pkg.astryx?.integration ?? pkg.xds?.integration;
  if (!manifestPath) {
    throw new Error(
      `Package "${spec}" does not declare astryx.integration (or legacy xds.integration) in package.json.`,
    );
  }
  return path.resolve(packageDir, manifestPath);
}

async function loadIntegrations(specs) {
  const integrations = [];
  for (const spec of specs) {
    const file = resolveIntegrationFile(spec);
    const mod = await import(pathToFileURL(file).href);
    const integration = mod.default ?? mod.integration ?? mod;
    if (!integration || typeof integration !== 'object') {
      throw new Error(`Integration ${spec} did not export an object.`);
    }
    const integrationDir = path.dirname(file);
    if (Array.isArray(integration.codemods)) {
      for (const codemod of integration.codemods) {
        if (typeof codemod.transform === 'string') {
          const transformPath = path.resolve(integrationDir, codemod.transform);
          const transformMod = await import(pathToFileURL(transformPath).href);
          codemod.transform =
            transformMod.default ?? transformMod.transform ?? transformMod;
        }
      }
    }
    integrations.push({
      ...integration,
      __file: file,
      __dir: integrationDir,
      __spec: spec,
    });
  }
  return integrations;
}

function normalizeIntegrationTransforms(integration, from, to) {
  const transforms = [];
  for (const entry of integration.codemods ?? []) {
    const entryFrom = entry.from ?? '0.0.0';
    const entryTo = entry.to ?? to;
    if (semverGte(from, entryTo) || semverGt(entryFrom, to)) continue;
    if (!entry.name)
      throw new Error(
        `Integration ${integration.name ?? integration.__spec} has a codemod without a name.`,
      );
    if (!entry.transform)
      throw new Error(`Integration codemod ${entry.name} is missing transform.`);
    const directTransform =
      typeof entry.transform === 'function' ? entry.transform : null;
    if (!directTransform)
      throw new Error(
        `Integration codemod ${entry.name} did not resolve to a function.`,
      );
    transforms.push({
      name: entry.name,
      meta: {
        title: entry.title ?? `${integration.name ?? integration.__spec}: ${entry.name}`,
        description: entry.description ?? '',
        pr: entry.pr,
        fileExtensions: entry.fileExtensions,
      },
      optional: !!entry.optional,
      transform: directTransform,
    });
  }
  return transforms.length ? [{version: to, transforms}] : [];
}

function uniqueFiles(files) {
  return [...new Set((files ?? []).filter(Boolean))];
}

async function runPostCodemodHooks(integrations, context, silent) {
  const hooks = integrations.flatMap(integration =>
    (integration.postCodemod ?? []).map(hook => ({integration, hook})),
  );
  if (hooks.length === 0) return;

  const log = silent
    ? {info() {}, warn() {}, success() {}, error() {}}
    : p.log;

  const run = async (command, args, options = {}) => {
    await execFileAsync(command, args, {
      cwd: options.cwd ?? context.packageDir,
      timeout: options.timeoutMs ?? 300_000,
      stdio: 'pipe',
      encoding: 'utf-8',
      env: {...process.env, ...(options.env ?? {})},
    });
  };

  const ctx = {...context, run};
  for (const {integration, hook} of hooks) {
    const label = `${integration.name ?? integration.__spec}:${hook.name ?? 'postCodemod'}`;
    try {
      if (typeof hook.run === 'function') {
        await hook.run(ctx);
      } else if (typeof hook.command === 'function') {
        const cmd = await hook.command(ctx);
        if (cmd) {
          await run(cmd.command, cmd.args ?? [], {
            cwd: cmd.cwd,
            timeoutMs: cmd.timeoutMs,
            env: cmd.env,
          });
        }
      } else {
        log.warn(`Integration hook ${label} has no run() or command() function; skipping.`);
        continue;
      }
      log.success(`Post-codemod hook ${label} completed.`);
    } catch (err) {
      log.warn(`Post-codemod hook ${label} failed: ${err.message}`);
    }
  }
}

/**
 * Register the `upgrade` command (codemod-driven version migration).
 */
export function registerUpgrade(program) {
  program
    .command('upgrade')
    .description('Run codemods to migrate between versions')
    .option('--from <version>', 'Previous version before the dependency upgrade')
    .option('--apply', 'Write changes to disk (default: dry-run)', false)
    .option('--force', 'Run codemods even if --from is newer than the installed version', false)
    .option('--codemod <name>', 'Run a specific transform only')
    .option(
      '--integration <package-or-file>',
      'Explicit integration package name or integration file path (repeatable)',
      (value, previous) => [...(previous ?? []), value],
      [],
    )
    .option('--path <dir>', 'Source directory to scan', './src')
    .option('--install-deps', 'Auto-install jscodeshift without prompting', false)
    .option('--list', 'List available codemods', false)
    .action(async (options) => {
      const json = program.opts().json || false;
      if (!json) p.intro('Upgrade');

      if (!options.list && !options.from) {
        const msg = 'Missing required --from. Install the target version first, then run `astryx upgrade --from <old-version>`.';
        if (json) return jsonError(msg, undefined, ERROR_CODES.ERR_INVALID_ARGUMENT);
        p.log.error(msg);
        p.outro('Aborted');
        process.exitCode = 1;
        return;
      }

      // Validate --from upfront so callers don't silently accept typos.
      if (!options.list && !isValidSemver(options.from)) {
        const msg = `Invalid --from value: "${options.from}". Expected a semver string like 0.0.5.`;
        if (json) return jsonError(msg, undefined, ERROR_CODES.ERR_INVALID_VERSION);
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
            codemods.push({name, title: meta.title, version, pr: meta.pr, optional: !!optional});
          }
        }
        if (json) return jsonOut('upgrade.list', codemods.map(({name, title, version, optional}) => ({name, title, version, optional})));
        p.log.step('Available codemods:');
        for (const {name, title, pr, optional} of codemods) {
          p.log.info(`  ${name} — ${title}${optional ? ' (optional)' : ''} (${pr})`);
        }
        p.outro('Done');
        return;
      }

      const currentVersion = options.from;
      const installed = detectInstalledTargetVersion();
      if (!installed) {
        const msg = 'Could not find installed @astryxdesign/core (or legacy @xds/core). Install the target version first, then rerun `astryx upgrade --from <old-version>`.';
        if (json) return jsonError(msg, undefined, ERROR_CODES.ERR_VERSION_DETECT);
        p.log.error(msg);
        p.outro('Aborted');
        process.exitCode = 1;
        return;
      }
      const targetVersion = installed.version;

      if (!json) {
        p.log.info(`From version: ${currentVersion}`);
        p.log.info(`Installed target: ${targetVersion} (${installed.packageName})`);
      }

      let integrations;
      try {
        integrations = await loadIntegrations(options.integration ?? []);
      } catch (err) {
        if (json) return jsonError(err.message, undefined, ERROR_CODES.ERR_INVALID_ARGUMENT);
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

      // Resolve transforms
      const versionManifests = [
        ...(await getTransformsBetween(currentVersion, targetVersion)),
        ...integrations.flatMap(integration =>
          normalizeIntegrationTransforms(integration, currentVersion, targetVersion),
        ),
      ];

      if (versionManifests.length === 0) {
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

      if (totalTransforms === 0 && totalOptional === 0) {
        const msg = `Codemod "${options.codemod}" not found. Use --list to see available codemods.`;
        if (json) return jsonError(msg, undefined, ERROR_CODES.ERR_UNKNOWN_CODEMOD);
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

      const receipt = {from: currentVersion, to: targetVersion, codemods: totalTransforms, integrations: integrations.map(i => i.name ?? i.__spec), agentDocsRefreshed: false};

      // Ensure jscodeshift is available
      const ready = await ensureJscodeshift({installDeps: options.installDeps, silent: json});
      if (!ready) {
        if (json) return jsonError('jscodeshift is required but could not be installed.', undefined, ERROR_CODES.ERR_DEP_MISSING);
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

      if (options.apply && integrations.length > 0) {
        const codemodDir = path.resolve(options.path);
        const absoluteChangedFiles = uniqueFiles(codemodResult?.writtenFiles ?? []);
        const changedFiles = absoluteChangedFiles.map(file =>
          path.relative(process.cwd(), file),
        );
        const packageChangedFiles = absoluteChangedFiles
          .filter(file => file.startsWith(process.cwd() + path.sep))
          .map(file => path.relative(process.cwd(), file));
        await runPostCodemodHooks(
          integrations,
          {
            packageDir: process.cwd(),
            codemodDir,
            changedFiles,
            absoluteChangedFiles,
            packageChangedFiles,
            apply: options.apply,
          },
          json,
        );
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
          if (!json && written.length > 0) p.log.success(`Agent docs updated: ${written.join(', ')}`);
        } catch {
          if (!json) {
            p.log.warn(
              `Could not update agent docs. Run \`${getRunPrefix()} astryx agent-docs\` to update manually.`,
            );
          }
        }
      }

      if (json) {
        if (codemodResult && typeof codemodResult === 'object') {
          receipt.filesChanged = codemodResult.totalFilesChanged ?? 0;
          receipt.transformsApplied = codemodResult.totalTransformsApplied ?? 0;
          receipt.errors = codemodResult.errors ?? [];
        }
        return jsonOut('upgrade.run', receipt);
      }
      p.outro(options.apply ? 'Upgrade complete' : 'Dry run complete');
    });
}
