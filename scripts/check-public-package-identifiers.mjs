// Copyright (c) Meta Platforms, Inc. and affiliates.

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const INTERNAL_HOST =
  /(?:internalfb\.com|internalmeta\.com|fburl\.com|registry\.facebook\.net)/iu;
const INTERNAL_DIFF = /(^|[^A-Za-z0-9_])D[0-9]{6,}(?![A-Za-z0-9_])/u;

function publishedPackageDirectories(root) {
  const directories = [];
  for (const parent of ['packages', path.join('packages', 'themes')]) {
    const absoluteParent = path.join(root, parent);
    for (const entry of fs.readdirSync(absoluteParent, {withFileTypes: true})) {
      if (!entry.isDirectory()) continue;
      const packageDirectory = path.join(absoluteParent, entry.name);
      const packageFile = path.join(packageDirectory, 'package.json');
      if (!fs.existsSync(packageFile)) continue;
      const manifest = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
      if (manifest.private || manifest.astryx?.canaryOnly) continue;
      directories.push(packageDirectory);
    }
  }
  return directories.sort();
}

function packedFiles(root, packageDirectory) {
  const output = execFileSync(
    'npm',
    [
      'pack',
      `./${path.relative(root, packageDirectory)}`,
      '--dry-run',
      '--json',
      '--ignore-scripts',
    ],
    {cwd: root, encoding: 'utf8'},
  );
  const result = JSON.parse(output);
  if (
    !Array.isArray(result) ||
    result.length !== 1 ||
    !Array.isArray(result[0].files)
  ) {
    throw new Error(
      `npm pack returned an unexpected manifest for ${path.relative(root, packageDirectory)}`,
    );
  }
  return result[0].files.map(file => file.path);
}

function findingInLine(line) {
  if (INTERNAL_HOST.test(line)) return 'internal host reference';
  if (INTERNAL_DIFF.test(line)) return 'internal diff identifier';
  return null;
}

export function scanPackage(root, packageDirectory) {
  const findings = [];
  for (const relativeFile of packedFiles(root, packageDirectory)) {
    const file = path.resolve(packageDirectory, relativeFile);
    if (!file.startsWith(`${path.resolve(packageDirectory)}${path.sep}`)) {
      throw new Error(
        `npm pack listed a file outside ${path.relative(root, packageDirectory)}`,
      );
    }
    const contents = fs.readFileSync(file);
    if (contents.includes(0)) continue;
    const lines = contents.toString('utf8').split(/\r?\n/u);
    for (const [index, line] of lines.entries()) {
      const kind = findingInLine(line);
      if (kind) {
        findings.push({
          file: path.relative(root, file).split(path.sep).join('/'),
          line: index + 1,
          kind,
        });
      }
    }
  }
  return findings;
}

export function scanPublishedPackages(root) {
  return publishedPackageDirectories(root).flatMap(packageDirectory =>
    scanPackage(root, packageDirectory),
  );
}

function main() {
  const root = path.resolve(process.cwd());
  const findings = scanPublishedPackages(root);
  if (findings.length > 0) {
    for (const finding of findings) {
      console.error(`${finding.file}:${finding.line}: ${finding.kind}`);
    }
    console.error(
      `Published-package identifier check failed with ${findings.length} finding(s).`,
    );
    process.exitCode = 1;
    return;
  }
  console.log('Published-package identifier check passed.');
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  main();
}
