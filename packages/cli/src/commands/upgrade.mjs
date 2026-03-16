/**
 * @file upgrade command — Run version-to-version codemods
 *
 * `xds upgrade` detects the consumer's @xds/core version and runs
 * all codemods needed to migrate to the target version.
 *
 * Options:
 *   --apply         Write changes to disk (default: dry-run)
 *   --to <version>  Target version (default: latest in registry)
 *   --codemod <name> Run a specific transform only
 *   --path <dir>    Source directory (default: ./src)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as p from '@clack/prompts';
import {ensureJscodeshift} from '../codemods/ensure-jscodeshift.mjs';
import {
  getTransformsBetween,
  latestVersion,
  versions,
} from '../codemods/registry.mjs';
import {runCodemods} from '../codemods/runner.mjs';
import {installAgentDocs} from './agent-docs.mjs';

/**
 * Detect the installed @xds/core version from the consumer's package.json.
 * @returns {string|null}
 */
function detectCurrentVersion() {
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const deps = {
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
    .option('--to <version>', 'Target version', latestVersion)
    .option('--codemod <name>', 'Run a specific transform only')
    .option('--path <dir>', 'Source directory to scan', './src')
    .option('--list', 'List available codemods', false)
    .action(async (options) => {
      p.intro('XDS Upgrade');

      if (options.list) {
        p.log.step('Available codemods:');
        await listCodemods();
        p.outro('Done');
        return;
      }

      // Detect current version
      const currentVersion = detectCurrentVersion();
      if (!currentVersion) {
        p.log.error(
          'Could not detect @xds/core version. Make sure package.json is in the current directory.',
        );
        p.outro('Aborted');
        process.exitCode = 1;
        return;
      }

      const targetVersion = options.to;
      p.log.info(`Current version: ${currentVersion}`);
      p.log.info(`Target version:  ${targetVersion}`);

      if (currentVersion >= targetVersion) {
        p.log.success('Already up to date — no codemods to run.');
        p.outro('Done');
        return;
      }

      // Resolve transforms
      const versionManifests = await getTransformsBetween(
        currentVersion,
        targetVersion,
      );

      if (versionManifests.length === 0) {
        p.log.success('No codemods available for this version range.');
        p.outro('Done');
        return;
      }

      // Count transforms
      let totalTransforms = 0;
      for (const {transforms} of versionManifests) {
        for (const t of transforms) {
          if (!options.codemod || t.name === options.codemod) {
            totalTransforms++;
          }
        }
      }

      if (totalTransforms === 0) {
        p.log.error(
          `Codemod "${options.codemod}" not found. Use --list to see available codemods.`,
        );
        p.outro('Aborted');
        process.exitCode = 1;
        return;
      }

      p.log.step(
        `${totalTransforms} codemod${totalTransforms === 1 ? '' : 's'} to run${options.apply ? '' : ' (dry run)'}`,
      );

      // Ensure jscodeshift is available
      const ready = await ensureJscodeshift();
      if (!ready) {
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

      // Refresh agent docs (AGENTS.md / CLAUDE.md) with updated component index
      if (options.apply) {
        try {
          installAgentDocs(process.cwd());
          p.log.success('Agent docs updated to match new version.');
        } catch {
          p.log.warn(
            'Could not update agent docs. Run `npx xds init --features agents` to update manually.',
          );
        }
      }

      p.outro(options.apply ? 'Upgrade complete' : 'Dry run complete');
    });
}
