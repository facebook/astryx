/**
 * @file Codemod runner
 *
 * Orchestrates running jscodeshift transforms against source files.
 * Handles dry-run previews, file writing, and summary reporting.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as p from '@clack/prompts';

/**
 * Recursively find all source files in a directory.
 * @param {string} dir
 * @returns {string[]}
 */
function findSourceFiles(dir) {
  const results = [];
  const extensions = new Set(['.tsx', '.ts', '.jsx', '.js']);

  function walk(currentDir) {
    let entries;
    try {
      entries = fs.readdirSync(currentDir, {withFileTypes: true});
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        walk(fullPath);
      } else if (extensions.has(path.extname(entry.name))) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results.sort();
}

/**
 * Run codemods against source files.
 *
 * @param {Array<{version: string, transforms: Array}>} versionManifests
 * @param {object} options
 * @param {boolean} options.apply - Write changes to disk
 * @param {string} options.path - Source directory to scan
 * @param {string|undefined} options.codemod - Run only this specific transform
 */
export async function runCodemods(versionManifests, {apply, path: srcPath, codemod}) {
  const resolvedPath = path.resolve(srcPath);

  if (!fs.existsSync(resolvedPath)) {
    p.log.error(`Source path not found: ${resolvedPath}`);
    return;
  }

  p.log.step(`Scanning ${resolvedPath} for source files...`);
  const files = findSourceFiles(resolvedPath);

  if (files.length === 0) {
    p.log.warn('No source files found.');
    return;
  }

  p.log.info(`Found ${files.length} source file${files.length === 1 ? '' : 's'}`);

  // Dynamically import jscodeshift
  const jscodeshift = (await import('jscodeshift')).default;

  let totalFilesChanged = 0;
  let totalTransformsApplied = 0;

  for (const {version, transforms} of versionManifests) {
    p.log.step(`Applying v${version} codemods...`);

    for (const transformEntry of transforms) {
      // Filter by codemod name if specified
      if (codemod && transformEntry.name !== codemod) continue;

      const {name, transform, meta} = transformEntry;
      p.log.info(`  ${meta.title}`);

      let filesChanged = 0;

      for (const filePath of files) {
        const source = fs.readFileSync(filePath, 'utf-8');
        const api = {jscodeshift, stats: () => {}, report: () => {}};
        const file = {source, path: filePath};

        const result = transform(file, api);

        if (result != null && result !== source) {
          filesChanged++;
          totalFilesChanged++;
          totalTransformsApplied++;

          const relativePath = path.relative(process.cwd(), filePath);

          if (apply) {
            fs.writeFileSync(filePath, result, 'utf-8');
            p.log.success(`    ✓ ${relativePath}`);
          } else {
            p.log.warn(`    ~ ${relativePath} (would change)`);
          }
        }
      }

      if (filesChanged > 0) {
        const verb = apply ? 'Updated' : 'Would update';
        p.log.info(`  ${verb} ${filesChanged} file${filesChanged === 1 ? '' : 's'}`);
      }
    }
  }

  // Summary
  console.log('');
  if (totalFilesChanged === 0) {
    p.log.success('No changes needed — your code is already up to date!');
  } else if (apply) {
    p.log.success(
      `Done! Applied ${totalTransformsApplied} change${totalTransformsApplied === 1 ? '' : 's'} across ${totalFilesChanged} file${totalFilesChanged === 1 ? '' : 's'}.`,
    );
    p.log.info('Run your type checker and tests to verify the changes.');
  } else {
    p.log.warn(
      `Found ${totalTransformsApplied} change${totalTransformsApplied === 1 ? '' : 's'} across ${totalFilesChanged} file${totalFilesChanged === 1 ? '' : 's'}.`,
    );
    p.log.info('Run with --apply to write changes to disk.');
  }
}
