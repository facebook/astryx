/**
 * @file upgrade command — Full version-to-version upgrade pipeline
 *
 * `xds upgrade` detects the consumer's @xds/core version, bumps all
 * @xds/* dependencies, installs them, and runs codemods to migrate
 * breaking API changes.
 *
 * Pipeline (--apply):
 *   1. Detect current version from package.json (or --from)
 *   2. Bump all @xds/* deps in package.json to --to version
 *   3. Run package manager install (yarn/npm/pnpm/bun)
 *   4. Run codemods for the version range
 *   5. Refresh agent docs (AGENTS.md / CLAUDE.md) if present
 *
 * Options:
 *   --apply              Write changes to disk (default: dry-run)
 *   --from <version>     Previous version (overrides package.json detection)
 *   --to <version>       Target version (default: latest in registry)
 *   --force              Run codemods even if versions appear up to date
 *   --codemod <name>     Run a specific transform only (skips version check)
 *   --codemod-only       Skip version bump + install, run codemods only
 *   --path <dir>         Source directory (default: ./src)
 *   --install-deps       Auto-install jscodeshift without prompting (for CI/LLM)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {execSync} from 'node:child_process';
import * as p from '@clack/prompts';
import {ensureJscodeshift} from '../codemods/ensure-jscodeshift.mjs';
import {
  getTransformsBetween,
  latestVersion,
  versions,
} from '../codemods/registry.mjs';
import {runCodemods} from '../codemods/runner.mjs';
import {installAgentDocs, discoverAgentDocs} from './agent-docs.mjs';
import {detectPackageManager, getRunPrefix} from '../utils/package-manager.mjs';
import {jsonOut, jsonError} from '../lib/json.mjs';

/**
 * Detect the installed @xds/core version from the consumer's package.json.
 * @returns {string|null}
 */
function detectCurrentVersion() {
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const deps = {
      ...pkg.peerDependencies,
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };
    const version = deps['@xds/core'];
    if (!version) return null;
    // Strip semver range chars (^, ~, >=, etc.)
    return version.replace(/^[^\d]*/, '');
  } catch {
    return null;
  }
}

/**
 * Bump all @xds/* dependencies in the consumer's package.json to the target version.
 * Preserves the existing semver range prefix (^, ~, etc.).
 *
 * @param {string} targetVersion - Version to bump to (e.g. '0.0.5')
 * @returns {{bumped: string[], pkgPath: string}|null} List of bumped package names, or null if no package.json
 */
function bumpXdsDeps(targetVersion) {
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  if (!fs.existsSync(pkgPath)) return null;

  const raw = fs.readFileSync(pkgPath, 'utf-8');
  const pkg = JSON.parse(raw);
  const bumped = [];

  for (const depField of ['dependencies', 'devDependencies']) {
    const deps = pkg[depField];
    if (!deps) continue;

    for (const name of Object.keys(deps)) {
      if (!name.startsWith('@xds/')) continue;

      const current = deps[name];
      // Preserve range prefix (^, ~, >=, etc.)
      const prefix = current.match(/^([^\d]*)/)?.[1] ?? '^';
      const newRange = `${prefix}${targetVersion}`;

      if (current !== newRange) {
        deps[name] = newRange;
        bumped.push(name);
      }
    }
  }

  if (bumped.length === 0) return {bumped: [], pkgPath};

  // Write back with same formatting (detect indent from original)
  const indent = raw.match(/^(\s+)"/m)?.[1] ?? '  ';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, indent) + '\n');
  return {bumped, pkgPath};
}

/**
 * Get the install command for the detected package manager.
 * @returns {string}
 */
function getInstallCommand() {
  const pm = detectPackageManager();
  switch (pm) {
    case 'yarn': return 'yarn install';
    case 'pnpm': return 'pnpm install';
    case 'bun': return 'bun install';
    case 'npm':
    default: return 'npm install';
  }
}

/**
 * List all available codemods across all versions.
 */
async function listCodemods() {
  for (const version of versions) {
    const manifests = await getTransformsBetween('0.0.0', version);
    for (const {transforms} of manifests) {
      for (const {name, meta} of transforms) {
        p.log.info(`  ${name} — ${meta.title} (${meta.pr})`);
      }
    }
  }
}

export function registerUpgrade(program) {
  program
    .command('upgrade')
    .description('Run codemods to migrate between XDS versions')
    .option('--apply', 'Write changes to disk (default: dry-run)', false)
    .option('--from <version>', 'Previous version (overrides package.json detection)')
    .option('--to <version>', 'Target version', latestVersion)
    .option('--force', 'Run codemods even if versions appear up to date', false)
    .option('--codemod <name>', 'Run a specific transform only')
    .option('--codemod-only', 'Skip version bump and install, run codemods only', false)
    .option('--path <dir>', 'Source directory to scan', './src')
    .option('--install-deps', 'Auto-install jscodeshift without prompting', false)
    .option('--list', 'List available codemods', false)
    .action(async (options) => {
      const json = program.opts().json || false;
      if (!json) p.intro('XDS Upgrade');

      if (options.list) {
        const codemods = [];
        for (const version of versions) {
          const manifests = await getTransformsBetween('0.0.0', version);
          for (const {transforms} of manifests) {
            for (const {name, meta, optional} of transforms) {
              codemods.push({name, title: meta.title, version, pr: meta.pr, optional: !!optional});
            }
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

      // When --codemod is specified, skip version detection entirely —
      // the user asked for a specific transform, just run it.
      const skipVersionCheck = !!options.codemod;

      // --codemod-only skips version bump + install but still uses --from/--to
      // for codemod resolution. Useful for canary testing or running codemods
      // independently of dependency changes.
      const skipBump = options.codemodOnly || skipVersionCheck;

      // Detect current version (--from overrides package.json)
      const currentVersion = options.from ?? detectCurrentVersion();
      if (!currentVersion && !skipVersionCheck) {
        const msg = 'Could not detect @xds/core version. Make sure package.json is in the current directory, or use --from <version>.';
        if (json) return jsonError(msg);
        p.log.error(msg);
        p.outro('Aborted');
        process.exitCode = 1;
        return;
      }

      const targetVersion = options.to;

      if (!skipVersionCheck) {
        if (!json) {
          p.log.info(`Current version: ${currentVersion}`);
          p.log.info(`Target version:  ${targetVersion}`);
        }

        if (!options.force && currentVersion >= targetVersion) {
          if (!json) {
            p.log.success('Already up to date — no codemods to run.');
            p.log.info('Use --force to run codemods anyway, or --from <version> to specify the previous version.');
            p.outro('Done');
          }
          return;
        }
      }

      // Resolve transforms
      const versionManifests = await getTransformsBetween(
        skipVersionCheck ? '0.0.0' : currentVersion,
        targetVersion,
      );

      if (versionManifests.length === 0) {
        if (!json) {
          p.log.success('No codemods available for this version range.');
          p.outro('Done');
        }
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
        if (json) return jsonError(msg);
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

      const receipt = {from: currentVersion, to: targetVersion, codemods: totalTransforms, depsUpdated: [], agentDocsRefreshed: false};

      // Bump @xds/* deps and install before running codemods
      if (options.apply && !skipBump) {
        const result = bumpXdsDeps(targetVersion);
        if (result && result.bumped.length > 0) {
          receipt.depsUpdated = result.bumped;
          if (!json) p.log.info(`Bumped ${result.bumped.join(', ')} → ${targetVersion}`);

          const installCmd = getInstallCommand();
          if (!json) p.log.step(`Running ${installCmd}...`);
          try {
            execSync(installCmd, {stdio: 'inherit', cwd: process.cwd()});
            if (!json) p.log.success('Dependencies installed.');
          } catch {
            if (!json) p.log.warn('Install failed — codemods will still run against existing code.');
          }
        }
      }

      // Ensure jscodeshift is available
      const ready = await ensureJscodeshift({installDeps: options.installDeps});
      if (!ready) {
        if (json) return jsonError('jscodeshift is required but could not be installed.');
        p.outro('Aborted');
        process.exitCode = 1;
        return;
      }

      // Run codemods
      await runCodemods(versionManifests, {
        apply: options.apply,
        path: options.path,
        codemod: options.codemod,
      });

      // Refresh agent docs if any exist (AGENTS.md, CLAUDE.md, .claude/CLAUDE.md, etc.)
      // Always update after --apply; also update during dry-run if files exist,
      // since the index reflects the installed CLI version, not the codemods.
      const existingDocs = discoverAgentDocs(process.cwd());
      if (existingDocs.length > 0) {
        try {
          const written = installAgentDocs(process.cwd());
          receipt.agentDocsRefreshed = true;
          if (!json) p.log.success(`Agent docs updated: ${written.join(', ')}`);
        } catch {
          if (!json) {
            p.log.warn(
              `Could not update agent docs. Run \`${getRunPrefix()} xds agent-docs\` to update manually.`,
            );
          }
        }
      }

      if (json) return jsonOut('upgrade.run', receipt);
      p.outro(options.apply ? 'Upgrade complete' : 'Dry run complete');
    });
}
