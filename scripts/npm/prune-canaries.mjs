// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file prune-canaries.mjs
 *
 * Removes old npm canary versions for @astryxdesign/* packages.
 *
 * npm keeps every published version visible on the Versions tab. Canary builds
 * are useful while they point at recent main commits, but old canaries are not a
 * compatibility contract. This script keeps the newest canaries and optionally
 * unpublishes the older ones that still fit npm's ordinary 72-hour unpublish
 * window. Older canaries are reported but skipped by default because npm may
 * reject those removals under its registry policy.
 *
 * @input  npm registry metadata for @astryxdesign/* packages
 * @output dry-run report, or npm unpublish calls when --yes is passed
 * @position leaf — invoked manually or by the canary cleanup workflow
 */

import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {expandWorkspaceDirs} from '../lib/workspace-globs.mjs';

export const DEFAULT_TAG = 'canary';
export const DEFAULT_MAX_UNPUBLISH_AGE_HOURS = 72;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

function usage() {
  return `Usage: node scripts/npm/prune-canaries.mjs [options]

Options:
  --yes                         Actually run npm unpublish. Default is dry-run.
  --dry-run                     Report only. This is the default.
  --current-version <version>   Keep all canaries for this base version. Defaults
                                to the package's latest stable version from npm.
  --tag <tag>                   Prerelease/dist-tag name to prune. Default: ${DEFAULT_TAG}.
  --package <name>              Limit to one package. Can be repeated.
  --registry <url>              npm registry URL. Default: https://registry.npmjs.org.
  --max-unpublish-age-hours <n> Skip versions older than this many hours unless
                                --include-older is set. Default: ${DEFAULT_MAX_UNPUBLISH_AGE_HOURS}.
  --include-older               Attempt versions outside the ordinary npm
                                unpublish window. Use only after confirming the
                                package satisfies npm's policy for older versions.
  --help                        Show this help.
`;
}

function readNumber(value, flag) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`${flag} must be a non-negative integer, got "${value}"`);
  }
  return n;
}

export function parseArgs(argv) {
  const options = {
    dryRun: true,
    includeOlder: false,
    currentVersion: undefined,
    maxUnpublishAgeHours: DEFAULT_MAX_UNPUBLISH_AGE_HOURS,
    packageNames: [],
    registry: 'https://registry.npmjs.org',
    tag: DEFAULT_TAG,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--yes':
        options.dryRun = false;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--include-older':
        options.includeOlder = true;
        break;
      case '--current-version':
        options.currentVersion = argv[++i];
        break;
      case '--max-unpublish-age-hours':
        options.maxUnpublishAgeHours = readNumber(argv[++i], arg);
        break;
      case '--package':
        options.packageNames.push(argv[++i]);
        break;
      case '--registry':
        options.registry = argv[++i];
        break;
      case '--tag':
        options.tag = argv[++i];
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!options.tag) throw new Error('--tag must be non-empty');
  if (options.packageNames.some(name => !name)) {
    throw new Error('--package must be followed by a package name');
  }

  return options;
}

function registryPackageUrl(registry, packageName) {
  const base = registry.replace(/\/+$/, '');
  const encodedName = encodeURIComponent(packageName).replace(/^%40/, '@');
  return `${base}/${encodedName}`;
}

export function getCanaryBaseVersion(version, tag = DEFAULT_TAG) {
  const marker = `-${tag}.`;
  const markerIndex = version.indexOf(marker);
  return markerIndex === -1 ? null : version.slice(0, markerIndex);
}

export function isTaggedCanaryVersion(version, tag = DEFAULT_TAG) {
  return getCanaryBaseVersion(version, tag) !== null;
}

function ageHours(isoTimestamp, nowMs) {
  return (nowMs - Date.parse(isoTimestamp)) / (1000 * 60 * 60);
}

export function selectCanaryVersions(metadata, options = {}) {
  const tag = options.tag ?? DEFAULT_TAG;
  const includeOlder = options.includeOlder ?? false;
  const maxUnpublishAgeHours =
    options.maxUnpublishAgeHours ?? DEFAULT_MAX_UNPUBLISH_AGE_HOURS;
  const nowMs = options.nowMs ?? Date.now();

  const versions = Array.isArray(metadata.versions)
    ? metadata.versions
    : Object.keys(metadata.versions ?? {});
  const time = metadata.time ?? {};
  const activeTaggedVersion = metadata['dist-tags']?.[tag];
  const currentVersion =
    options.currentVersion ?? metadata['dist-tags']?.latest;

  const canaries = versions
    .filter(version => isTaggedCanaryVersion(version, tag))
    .map(version => ({
      version,
      baseVersion: getCanaryBaseVersion(version, tag),
      publishedAt: time[version],
    }))
    .filter(entry => entry.publishedAt)
    .sort((a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt));

  const retained = new Set();
  for (const entry of canaries) {
    if (entry.baseVersion === currentVersion) retained.add(entry.version);
  }
  if (activeTaggedVersion) retained.add(activeTaggedVersion);

  const candidates = canaries.filter(entry => !retained.has(entry.version));
  const toUnpublish = [];
  const skippedTooOld = [];

  for (const entry of candidates) {
    const hours = ageHours(entry.publishedAt, nowMs);
    const candidate = {...entry, ageHours: hours};
    if (!includeOlder && hours > maxUnpublishAgeHours) {
      skippedTooOld.push(candidate);
    } else {
      toUnpublish.push(candidate);
    }
  }

  return {
    activeTaggedVersion,
    canaries,
    currentVersion,
    retainedVersions: [...retained],
    skippedTooOld,
    toUnpublish,
  };
}

function getWorkspacePackageVersionMap(root) {
  const versions = new Map();
  for (const dir of expandWorkspaceDirs(root)) {
    const manifestPath = path.join(dir, 'package.json');
    if (!fs.existsSync(manifestPath)) continue;

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (!manifest.name?.startsWith('@astryxdesign/')) continue;
    if (manifest.private && !manifest.astryx?.canaryOnly) continue;
    if (manifest.version) versions.set(manifest.name, manifest.version);
  }
  return versions;
}

function getWorkspacePackageNames(root) {
  return [...getWorkspacePackageVersionMap(root).keys()].sort();
}

function getWorkspaceCurrentCanaryBaseVersion(root) {
  const coreManifestPath = path.join(root, 'packages/core/package.json');
  if (!fs.existsSync(coreManifestPath)) return undefined;

  const coreManifest = JSON.parse(fs.readFileSync(coreManifestPath, 'utf8'));
  return coreManifest.version;
}

async function fetchPackageMetadata(packageName, registry) {
  const response = await fetch(registryPackageUrl(registry, packageName), {
    headers: {accept: 'application/json'},
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${packageName} metadata: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}

function npmUnpublish(packageName, version, registry) {
  return spawnSync(
    'npm',
    ['unpublish', `${packageName}@${version}`, '--registry', registry],
    {stdio: 'inherit'},
  );
}

function plural(count, singular, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export async function pruneCanaries(options) {
  const packageNames =
    options.packageNames.length > 0
      ? options.packageNames
      : getWorkspacePackageNames(ROOT);

  const workspaceVersions = getWorkspacePackageVersionMap(ROOT);
  const currentCanaryBaseVersion = getWorkspaceCurrentCanaryBaseVersion(ROOT);

  let unpublished = 0;
  let failures = 0;

  for (const packageName of packageNames) {
    const metadata = await fetchPackageMetadata(packageName, options.registry);
    const selection = selectCanaryVersions(metadata, {
      ...options,
      currentVersion:
        options.currentVersion ??
        currentCanaryBaseVersion ??
        workspaceVersions.get(packageName),
    });

    console.log(`\n${packageName}`);
    console.log(
      `  ${plural(selection.canaries.length, 'canary', 'canaries')} found; keeping ${plural(selection.retainedVersions.length, 'version')}`,
    );

    console.log(
      `  Retention: keeping ${selection.currentVersion ? `all ${selection.currentVersion} canaries` : 'only the active dist-tag canary'}; pruning older base versions`,
    );

    if (selection.skippedTooOld.length > 0) {
      console.log(
        `  Skipping ${plural(selection.skippedTooOld.length, 'version')} older than ${options.maxUnpublishAgeHours}h; use --include-older only after checking npm policy.`,
      );
    }

    if (selection.toUnpublish.length === 0) {
      console.log('  Nothing to unpublish.');
      continue;
    }

    for (const entry of selection.toUnpublish) {
      const spec = `${packageName}@${entry.version}`;
      const age = `${entry.ageHours.toFixed(1)}h`;
      if (options.dryRun) {
        console.log(`  [dry-run] Would unpublish ${spec} (${age} old)`);
        continue;
      }

      console.log(`  Unpublishing ${spec} (${age} old)`);
      const result = npmUnpublish(packageName, entry.version, options.registry);
      if (result.status === 0) {
        unpublished += 1;
      } else {
        failures += 1;
        console.error(`  Failed to unpublish ${spec}`);
      }
    }
  }

  if (options.dryRun) {
    console.log(
      '\nDry run complete. Re-run with --yes to unpublish eligible versions.',
    );
  } else {
    console.log(`\nUnpublished ${plural(unpublished, 'version')}.`);
  }

  if (failures > 0) {
    throw new Error(`Failed to unpublish ${plural(failures, 'version')}`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }
  await pruneCanaries(options);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(`\n✗ ${error.message}`);
    process.exit(1);
  });
}
