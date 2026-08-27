#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Classify changed files by release channel for visual CI.
 *
 * @input  newline-separated paths on stdin (normally a base...head git diff)
 * @output JSON, and optionally GitHub outputs
 *
 * Visual baselines belong to the stable product. A package marked
 * `astryx.canaryOnly` deliberately has no stable visual baseline: Lab/charts/
 * richtext/vega still typecheck, test and build Storybook, but random or
 * experimental pixels are not a release decision and should not create a red
 * check everyone learns to ignore.
 *
 * This reads package metadata rather than naming today's canary packages, so a
 * package changing release channel changes classification in one place — its
 * own package.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** @param {string} file */
function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/** @param {string} repoRoot @param {string} file @param {Record<string, object>} manifests */
function readPackage(repoRoot, file, manifests) {
  if (Object.hasOwn(manifests, file)) return manifests[file];
  const absolute = path.join(repoRoot, file);
  return fs.existsSync(absolute) ? readJSON(absolute) : null;
}

/**
 * @param {string[]} files
 * @param {string} repoRoot
 * @param {Record<string, object>} manifests - trusted snapshots keyed by repo-relative path
 */
export function classifyVisualScope(files, repoRoot = ROOT, manifests = {}) {
  const paths = files.map(file => file.trim()).filter(Boolean);
  const stableCoreFiles = paths.filter(
    file =>
      /^packages\/core\/src\/.*\.(ts|tsx|css)$/.test(file) &&
      !/\.(test|doc)\./.test(file),
  );

  const stableThemes = new Set();
  const canaryPackages = new Set();

  for (const file of paths) {
    const pkgMatch = file.match(/^packages\/([^/]+)\//);
    if (pkgMatch) {
      const relativeManifest = path.join('packages', pkgMatch[1], 'package.json');
      const pkg = readPackage(repoRoot, relativeManifest, manifests);
      if (pkg?.astryx?.canaryOnly === true) {
        canaryPackages.add(pkg.name ?? pkgMatch[1]);
      }
    }

    const themeMatch = file.match(/^packages\/themes\/([^/]+)\/(?:src\/|package\.json$)/);
    if (!themeMatch) continue;
    const relativeManifest = path.join(
      'packages',
      'themes',
      themeMatch[1],
      'package.json',
    );
    const pkg = readPackage(repoRoot, relativeManifest, manifests);
    if (!pkg) continue;
    if (pkg.private === true || pkg.astryx?.canaryOnly === true) {
      if (pkg.astryx?.canaryOnly === true) {
        canaryPackages.add(pkg.name ?? themeMatch[1]);
      }
      continue;
    }
    stableThemes.add(themeMatch[1]);
  }

  return {
    hasStableVisual: stableCoreFiles.length > 0 || stableThemes.size > 0,
    stableCoreFiles,
    stableThemes: [...stableThemes].sort(),
    canaryPackages: [...canaryPackages].sort(),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = fs.readFileSync(0, 'utf8').split('\n');
  const manifestsFlag = process.argv.indexOf('--manifests');
  const manifests =
    manifestsFlag === -1 ? {} : readJSON(path.resolve(process.argv[manifestsFlag + 1]));
  const result = classifyVisualScope(files, ROOT, manifests);
  process.stdout.write(`${JSON.stringify(result)}\n`);

  const output = process.argv[process.argv.indexOf('--github-output') + 1];
  if (process.argv.includes('--github-output') && output) {
    const outputValue = values => {
      if (values.some(value => /[\r\n]/.test(value))) {
        throw new Error('visual scope output contains a line break');
      }
      return values.join(',');
    };
    fs.appendFileSync(
      output,
      [
        `stable_themes=${outputValue(result.stableThemes)}`,
        `canary_packages=${outputValue(result.canaryPackages)}`,
        `has_stable_visual=${result.hasStableVisual}`,
      ].join('\n') + '\n',
    );
  }
}
