// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Active release branch authority and receipt validation.
 *
 * @input  .release marker/plan files, release refs, expected branch/head inputs
 * @output fail-closed validation receipts bound to branch + commit + plan digest
 * @position single authority used by release CI, stable publishing, and branch cleanup
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {expandWorkspaceDirs} from '../lib/workspace-globs.mjs';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const RELEASE_DIR = '.release';
const MARKER_FILE = 'active.json';
const PLAN_FILE = 'plan.json';
const SHA_RE = /^[0-9a-f]{40}$/;
const VERSION_RE = /^\d+\.\d+\.\d+$/;
const BRANCH_RE = /^release\/v(\d+\.\d+\.\d+)$/;

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function computePlanDigest(plan) {
  return sha256(canonicalJson(plan));
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function changesetEntries(root) {
  const dir = path.join(root, '.changeset');
  return fs
    .readdirSync(dir)
    .filter(name => name.endsWith('.md') && !['README.md'].includes(name))
    .sort()
    .map(name => {
      const relative = `.changeset/${name}`;
      return {
        path: relative,
        sha256: sha256(fs.readFileSync(path.join(root, relative))),
      };
    });
}

function buildPlan({root, version, branch, cutSha}) {
  return {
    schemaVersion: 1,
    version,
    branch,
    cutSha,
    changesets: changesetEntries(root),
  };
}

function buildMarker(plan) {
  return {
    schemaVersion: 1,
    state: 'active',
    version: plan.version,
    branch: plan.branch,
    cutSha: plan.cutSha,
    planDigest: computePlanDigest(plan),
  };
}

function validateIdentity(marker, plan) {
  const errors = [];
  if (marker?.schemaVersion !== 1)
    errors.push('marker schemaVersion must be 1');
  if (marker?.state !== 'active') errors.push('marker state must be active');
  if (!VERSION_RE.test(marker?.version ?? ''))
    errors.push('marker version must be X.Y.Z');
  const branchMatch = BRANCH_RE.exec(marker?.branch ?? '');
  if (!branchMatch) errors.push('marker branch must be release/vX.Y.Z');
  if (branchMatch && branchMatch[1] !== marker.version)
    errors.push('marker branch version must match marker version');
  if (!SHA_RE.test(marker?.cutSha ?? ''))
    errors.push('marker cutSha must be a full SHA');
  if (!/^[0-9a-f]{64}$/.test(marker?.planDigest ?? ''))
    errors.push('marker planDigest must be a SHA-256 digest');
  if (plan?.schemaVersion !== 1) errors.push('plan schemaVersion must be 1');
  for (const key of ['version', 'branch', 'cutSha']) {
    if (plan?.[key] !== marker?.[key])
      errors.push(`plan ${key} must match marker`);
  }
  if (computePlanDigest(plan) !== marker?.planDigest)
    errors.push('plan digest does not match marker');
  const seen = new Set();
  for (const entry of plan?.changesets ?? []) {
    if (
      !entry ||
      !/^\.changeset\/[A-Za-z0-9._-]+\.md$/.test(entry.path ?? '')
    ) {
      errors.push('plan contains an invalid Changeset path');
      continue;
    }
    if (seen.has(entry.path)) errors.push(`plan repeats ${entry.path}`);
    seen.add(entry.path);
    if (!/^[0-9a-f]{64}$/.test(entry.sha256 ?? ''))
      errors.push(`plan has an invalid digest for ${entry.path}`);
  }
  return errors;
}

/**
 * Does this manifest belong to the stable cut? Private and canary-only
 * packages publish outside it (or not at all), so their changes never block or
 * enter a stable release.
 *
 * @param {{name?: string, private?: boolean, astryx?: {canaryOnly?: boolean}}} manifest
 * @returns {boolean}
 */
function isStableReleasePackage(manifest) {
  return (
    manifest?.name?.startsWith('@astryxdesign/') === true &&
    manifest.private !== true &&
    manifest.astryx?.canaryOnly !== true
  );
}

function publishablePackages(root) {
  return expandWorkspaceDirs(root)
    .map(dir => path.join(dir, 'package.json'))
    .filter(file => fs.existsSync(file))
    .map(file => ({file, manifest: readJson(file)}))
    .filter(({manifest}) => isStableReleasePackage(manifest));
}

function validateReleaseState({
  root,
  marker,
  plan,
  mode,
  releaseBranch,
  releaseVersion,
  releaseTag,
  expectedPlanDigest,
  refName,
  expectedHead,
  checkoutSha,
  remoteHead,
  activeBranches,
}) {
  const errors = validateIdentity(marker, plan);
  if (releaseBranch !== marker.branch)
    errors.push('release-branch input does not match marker');
  if (releaseVersion !== undefined && releaseVersion !== marker.version)
    errors.push('release-version input does not match marker');
  if (releaseTag !== undefined && releaseTag !== `v${marker.version}`)
    errors.push('release-tag input does not match marker version');
  if (
    expectedPlanDigest !== undefined &&
    expectedPlanDigest !== marker.planDigest
  )
    errors.push('plan-digest input does not match marker');
  if (activeBranches.length !== 1 || activeBranches[0] !== marker.branch)
    errors.push(
      `exactly one active release branch is required; found ${activeBranches.join(',') || 'none'}`,
    );
  if (!SHA_RE.test(expectedHead ?? ''))
    errors.push('expected-head must be a full SHA');
  if (!SHA_RE.test(checkoutSha ?? ''))
    errors.push('checkout SHA must be a full SHA');
  if (expectedHead !== checkoutSha)
    errors.push('checked-out commit does not match expected head');
  if (remoteHead && remoteHead !== expectedHead)
    errors.push('release branch moved after the expected head was recorded');

  if (mode === 'check') {
    if (releaseVersion === undefined)
      errors.push('release check requires release-version');
    if (expectedPlanDigest === undefined)
      errors.push('release check requires plan-digest');
  }

  if (mode === 'publish') {
    if (releaseVersion === undefined)
      errors.push('stable publish requires release-version');
    if (releaseTag === undefined)
      errors.push('stable publish requires release-tag');
    if (expectedPlanDigest === undefined)
      errors.push('stable publish requires plan-digest');
    if (refName !== `v${marker.version}`)
      errors.push('stable publish must run from the version tag');
    if (releaseTag !== undefined && refName !== releaseTag)
      errors.push('checked-out tag does not match release-tag input');
  } else if (refName !== marker.branch) {
    errors.push('release validation must run from the marked release branch');
  }

  const current = new Map(
    changesetEntries(root).map(entry => [entry.path, entry.sha256]),
  );
  if (mode === 'cut') {
    for (const entry of plan.changesets) {
      if (current.get(entry.path) !== entry.sha256)
        errors.push(`cut Changeset differs or is missing: ${entry.path}`);
    }
    if (current.size !== plan.changesets.length)
      errors.push('cut Changeset set differs from the recorded plan');
  } else {
    if (current.size !== 0)
      errors.push('versioned release must consume every branch Changeset');
    for (const {manifest, file} of publishablePackages(root)) {
      if (manifest.version !== marker.version)
        errors.push(
          `${path.relative(root, file)} is ${manifest.version}, expected ${marker.version}`,
        );
    }
  }
  return errors;
}

function git(root, args) {
  return execFileSync('git', args, {cwd: root, encoding: 'utf8'}).trim();
}

function fileDigestAtRef(root, ref, file) {
  try {
    return sha256(execFileSync('git', ['show', `${ref}:${file}`], {cwd: root}));
  } catch {
    return null;
  }
}

function changesetMapAtRef(root, ref) {
  const files = git(root, [
    'ls-tree',
    '-r',
    '--name-only',
    ref,
    '--',
    '.changeset',
  ]);
  return new Map(
    files
      .split('\n')
      .filter(
        file =>
          file.startsWith('.changeset/') &&
          file.endsWith('.md') &&
          file !== '.changeset/README.md',
      )
      .map(file => [file, fileDigestAtRef(root, ref, file)]),
  );
}

function isPackageManifestPath(file) {
  return /^packages\/(?:[^/]+|themes\/[^/]+)\/package\.json$/.test(file);
}

function releaseOutputPathsAtRef(root, plan, releaseRef) {
  return git(root, ['diff', '--name-only', plan.cutSha, releaseRef, '--'])
    .split('\n')
    .filter(Boolean);
}

function releaseOutputMapAtRef(root, plan, releaseRef) {
  return new Map(
    releaseOutputPathsAtRef(root, plan, releaseRef)
      .filter(isReleaseOutputPath)
      .filter(file => !isPackageManifestPath(file) && file !== 'pnpm-lock.yaml')
      .map(file => [file, fileDigestAtRef(root, releaseRef, file)]),
  );
}

function jsonAtRef(root, ref, file) {
  try {
    return JSON.parse(git(root, ['show', `${ref}:${file}`]));
  } catch {
    return null;
  }
}

function manifestMapAtRef(root, ref, files) {
  return new Map([...files].map(file => [file, jsonAtRef(root, ref, file)]));
}

function currentManifestMap(root, files) {
  return new Map(
    [...files].map(file => {
      const absolute = path.join(root, file);
      return [file, fs.existsSync(absolute) ? readJson(absolute) : null];
    }),
  );
}

function currentOutputMap(root, files) {
  return new Map(
    [...files].map(file => {
      const absolute = path.join(root, file);
      return [
        file,
        fs.existsSync(absolute) ? sha256(fs.readFileSync(absolute)) : null,
      ];
    }),
  );
}

function markerAtRef(root, ref) {
  return JSON.parse(
    git(root, ['show', `${ref}:${RELEASE_DIR}/${MARKER_FILE}`]),
  );
}

function validateRefMarker(marker, branch) {
  const match = BRANCH_RE.exec(branch);
  if (
    marker?.schemaVersion !== 1 ||
    !['active', 'closed'].includes(marker?.state) ||
    !match ||
    marker.branch !== branch ||
    marker.version !== match[1] ||
    !SHA_RE.test(marker.cutSha ?? '') ||
    !/^[0-9a-f]{64}$/.test(marker.planDigest ?? '')
  ) {
    throw new Error(
      `release branch ${branch} has an invalid or mismatched marker`,
    );
  }
}

function listActiveBranches(root) {
  const refs = git(root, [
    'for-each-ref',
    '--format=%(refname:short)',
    'refs/remotes/origin/release/v*',
  ]);
  if (!refs) return [];
  const active = [];
  for (const ref of refs.split('\n').filter(Boolean)) {
    let marker;
    try {
      marker = markerAtRef(root, ref);
    } catch {
      throw new Error(`release branch ${ref} has no readable marker`);
    }
    const branch = ref.replace(/^origin\//, '');
    validateRefMarker(marker, branch);
    if (marker.state === 'active') active.push(branch);
  }
  return active.sort();
}

const RELEASE_OUTPUT_PATTERNS = [
  /^packages\/(?:[^/]+|themes\/[^/]+)\/package\.json$/,
  /^packages\/(?:[^/]+|themes\/[^/]+)\/CHANGELOG\.md$/,
  /^packages\/cli\/assets\/codemods\/registry\.mjs$/,
  /^packages\/cli\/assets\/codemods\/__tests__\/registry\.test\.mjs$/,
  /^packages\/cli\/assets\/codemods\/transforms\/(?:next|v\d+\.\d+\.\d+)\//,
  /^pnpm-lock\.yaml$/,
];

function isReleaseOutputPath(file) {
  return RELEASE_OUTPUT_PATTERNS.some(pattern => pattern.test(file));
}

function validateReleaseDiff(entries, {plan, baseChangesets} = {}) {
  const errors = [];
  const planned = plan
    ? new Map(plan.changesets.map(entry => [entry.path, entry.sha256]))
    : null;
  const deletedChangesets = new Set();
  for (const entry of entries) {
    const [status, ...files] = entry.split('\t');
    const isMove = status?.startsWith('R') || status?.startsWith('C');
    const expectedPaths = isMove ? 2 : 1;
    if (
      !status ||
      files.length !== expectedPaths ||
      files.some(file => !file)
    ) {
      errors.push(`invalid diff entry: ${entry}`);
      continue;
    }
    for (const file of files) {
      if (!file.startsWith('.changeset/') && !isReleaseOutputPath(file))
        errors.push(`release bump contains a non-generated path: ${file}`);
      if (file.startsWith('.changeset/')) {
        if (status !== 'D')
          errors.push(
            `release bump may only delete planned Changesets: ${file}`,
          );
        else {
          deletedChangesets.add(file);
          if (planned && !planned.has(file))
            errors.push(`release bump deletes an unplanned Changeset: ${file}`);
        }
      }
    }
  }
  if (planned && baseChangesets) {
    for (const [file, digest] of planned) {
      if (baseChangesets.get(file) !== digest)
        errors.push(
          `frozen Changeset differs or is missing at branch base: ${file}`,
        );
      if (!deletedChangesets.has(file))
        errors.push(`release bump did not delete frozen Changeset: ${file}`);
    }
    for (const file of baseChangesets.keys()) {
      if (!planned.has(file))
        errors.push(`release branch contains an unplanned Changeset: ${file}`);
    }
  }
  return errors;
}

const VERSION_DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
];

function expectedSyncedManifest({file, cut, base, release}) {
  if (!cut || !base || !release)
    return {error: `release sync cannot read manifest history: ${file}`};

  const releaseFromCut = structuredClone(cut);
  releaseFromCut.version = release.version;
  const expected = structuredClone(base);
  expected.version = release.version;

  for (const field of VERSION_DEPENDENCY_FIELDS) {
    const cutValues = cut[field] ?? {};
    const releaseValues = release[field] ?? {};
    const names = new Set([
      ...Object.keys(cutValues),
      ...Object.keys(releaseValues),
    ]);
    for (const name of names) {
      if (canonicalJson(cutValues[name]) === canonicalJson(releaseValues[name]))
        continue;
      if (!name.startsWith('@astryxdesign/'))
        return {
          error: `published manifest contains a non-version release change: ${file} ${field}.${name}`,
        };
      releaseFromCut[field] ??= {};
      if (releaseValues[name] === undefined) delete releaseFromCut[field][name];
      else releaseFromCut[field][name] = releaseValues[name];

      if (
        canonicalJson(base[field]?.[name]) === canonicalJson(cutValues[name])
      ) {
        expected[field] ??= {};
        if (releaseValues[name] === undefined) delete expected[field][name];
        else expected[field][name] = releaseValues[name];
      }
    }
  }

  if (canonicalJson(releaseFromCut) !== canonicalJson(release))
    return {
      error: `published manifest contains a non-version release change: ${file}`,
    };
  return {expected};
}

function validateReleaseSync({
  entries,
  plan,
  baseChangesets,
  headChangesets,
  releaseOutputs,
  headOutputs,
  cutManifests = new Map(),
  baseManifests = new Map(),
  releaseManifests = new Map(),
  headManifests = new Map(),
}) {
  const errors = [];
  const planned = new Set(plan.changesets.map(entry => entry.path));
  for (const entry of entries) {
    const [status, ...files] = entry.split('\t');
    if (!status || files.length !== 1 || !files[0]) {
      errors.push(`invalid sync diff entry: ${entry}`);
      continue;
    }
    const file = files[0];
    if (file.startsWith('.changeset/')) {
      if (status !== 'D' || !planned.has(file))
        errors.push(`release sync may only delete frozen Changesets: ${file}`);
    } else if (isPackageManifestPath(file)) {
      if (!releaseManifests.has(file))
        errors.push(
          `release sync changed an unplanned package manifest: ${file}`,
        );
    } else if (
      !isReleaseOutputPath(file) &&
      !/^\.github\/pages\/assets\/(?:manifest\.json|reset\.css|astryx\.css|theme\.css)$/.test(
        file,
      )
    ) {
      errors.push(`release sync contains a non-bookkeeping path: ${file}`);
    }
  }
  for (const file of planned) {
    if (baseChangesets.has(file) && headChangesets.has(file))
      errors.push(`release sync did not delete frozen Changeset: ${file}`);
  }
  for (const [file, digest] of baseChangesets) {
    if (planned.has(file)) continue;
    if (headChangesets.get(file) !== digest)
      errors.push(`release sync changed post-cut Changeset: ${file}`);
  }
  for (const file of headChangesets.keys()) {
    if (!baseChangesets.has(file))
      errors.push(
        `release sync added a Changeset instead of preserving main: ${file}`,
      );
  }
  for (const [file, digest] of releaseOutputs) {
    if (headOutputs.get(file) !== digest)
      errors.push(`release sync output differs from published branch: ${file}`);
  }
  for (const [file, release] of releaseManifests) {
    const result = expectedSyncedManifest({
      file,
      cut: cutManifests.get(file),
      base: baseManifests.get(file),
      release,
    });
    if (result.error) {
      errors.push(result.error);
      continue;
    }
    const head = headManifests.get(file);
    if (!head || head.version !== release.version)
      errors.push(`release sync manifest has the wrong version: ${file}`);
    if (canonicalJson(head) !== canonicalJson(result.expected))
      errors.push(`release sync changed non-version manifest fields: ${file}`);
  }
  return errors;
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const values = {};
  for (let index = 0; index < rest.length; index += 1) {
    const key = rest[index];
    if (!key.startsWith('--')) throw new Error(`unexpected argument ${key}`);
    const value = rest[index + 1];
    if (value == null || value.startsWith('--'))
      throw new Error(`${key} needs a value`);
    values[key.slice(2)] = value;
    index += 1;
  }
  return {command, values};
}

function required(values, key) {
  if (!values[key]) throw new Error(`--${key} is required`);
  return values[key];
}

function versionTagExists(root, version) {
  try {
    execFileSync(
      'git',
      ['rev-parse', '--verify', '--quiet', `refs/tags/v${version}`],
      {cwd: root, stdio: 'ignore'},
    );
    return true;
  } catch {
    return false;
  }
}

function writeAuthority(root, values, refresh) {
  const version = required(values, 'version');
  const branch = required(values, 'branch');
  const cutSha = required(values, 'cut-sha');
  if (
    !VERSION_RE.test(version) ||
    branch !== `release/v${version}` ||
    !SHA_RE.test(cutSha)
  )
    throw new Error(
      'version, branch, and cut SHA do not form a valid release identity',
    );
  const dir = path.join(root, RELEASE_DIR);
  const markerPath = path.join(dir, MARKER_FILE);
  const planPath = path.join(dir, PLAN_FILE);
  const markerExists = fs.existsSync(markerPath);
  const planExists = fs.existsSync(planPath);

  if (refresh) {
    if (!markerExists || !planExists)
      throw new Error(
        'release refresh requires an existing active marker and plan',
      );
    const existingMarker = readJson(markerPath);
    const existingPlan = readJson(planPath);
    const identityErrors = validateIdentity(existingMarker, existingPlan);
    if (identityErrors.length) throw new Error(identityErrors.join('\n'));
    for (const [key, value] of [
      ['version', version],
      ['branch', branch],
      ['cutSha', cutSha],
    ]) {
      if (existingMarker[key] !== value)
        throw new Error(`release refresh cannot change ${key}`);
    }
  } else {
    if (markerExists || planExists)
      throw new Error(
        'release authority already exists; a release branch cannot be reused',
      );
    if (versionTagExists(root, version))
      throw new Error(
        `version v${version} already has an immutable tag; use a new release branch and version`,
      );
  }

  fs.mkdirSync(dir, {recursive: true});
  const plan = buildPlan({root, version, branch, cutSha});
  const marker = buildMarker(plan);
  fs.writeFileSync(planPath, `${JSON.stringify(plan, null, 2)}\n`);
  fs.writeFileSync(markerPath, `${JSON.stringify(marker, null, 2)}\n`);
  console.log(
    JSON.stringify({branch, version, cutSha, planDigest: marker.planDigest}),
  );
}

function main() {
  const {command, values} = parseArgs(process.argv.slice(2));
  const root = path.resolve(values.root ?? ROOT);
  if (command === 'create' || command === 'refresh') {
    writeAuthority(root, values, command === 'refresh');
    return;
  }
  if (command === 'list-active') {
    console.log(listActiveBranches(root).join(','));
    return;
  }
  if (command === 'inspect-ref') {
    const ref = required(values, 'ref');
    const marker = markerAtRef(root, ref);
    const branch = ref.replace(/^origin\//, '');
    validateRefMarker(marker, branch);
    console.log(JSON.stringify(marker));
    return;
  }
  if (command === 'validate-diff') {
    const base = required(values, 'base');
    const head = required(values, 'head');
    const marker = markerAtRef(root, base);
    const plan = JSON.parse(
      git(root, ['show', `${base}:${RELEASE_DIR}/${PLAN_FILE}`]),
    );
    const raw = git(root, ['diff', '--name-status', `${base}...${head}`]);
    const errors = [
      ...validateIdentity(marker, plan),
      ...validateReleaseDiff(raw ? raw.split('\n') : [], {
        plan,
        baseChangesets: changesetMapAtRef(root, base),
      }),
    ];
    if (errors.length) throw new Error(errors.join('\n'));
    console.log(
      JSON.stringify({
        base,
        head,
        planDigest: marker.planDigest,
        files: raw ? raw.split('\n').length : 0,
      }),
    );
    return;
  }
  if (command === 'validate-sync') {
    const base = required(values, 'base');
    const releaseRef = required(values, 'release-ref');
    const marker = markerAtRef(root, releaseRef);
    const plan = JSON.parse(
      git(root, ['show', `${releaseRef}:${RELEASE_DIR}/${PLAN_FILE}`]),
    );
    const errors = validateIdentity(marker, plan);
    if (releaseRef !== `v${marker.version}`)
      errors.push('release sync must use the immutable version tag');
    const releaseHead = git(root, ['rev-parse', releaseRef]);
    const branchHead = git(root, ['rev-parse', `origin/${marker.branch}`]);
    if (releaseHead !== branchHead)
      errors.push('version tag does not match the active release branch head');
    const activeBranches = required(values, 'active-branches')
      .split(',')
      .filter(Boolean)
      .sort();
    if (activeBranches.length !== 1 || activeBranches[0] !== marker.branch)
      errors.push('release sync requires exactly the marked active branch');
    const raw = git(root, [
      'diff',
      '--name-status',
      '--find-renames',
      base,
      'HEAD',
    ]);
    const releaseOutputs = releaseOutputMapAtRef(root, plan, releaseRef);
    const releaseManifestFiles = releaseOutputPathsAtRef(
      root,
      plan,
      releaseRef,
    ).filter(isPackageManifestPath);
    const cutManifests = manifestMapAtRef(
      root,
      plan.cutSha,
      releaseManifestFiles,
    );
    const baseManifests = manifestMapAtRef(root, base, releaseManifestFiles);
    const releaseManifests = manifestMapAtRef(
      root,
      releaseRef,
      releaseManifestFiles,
    );
    errors.push(
      ...validateReleaseSync({
        entries: raw ? raw.split('\n') : [],
        plan,
        baseChangesets: changesetMapAtRef(root, base),
        headChangesets: new Map(
          changesetEntries(root).map(entry => [entry.path, entry.sha256]),
        ),
        releaseOutputs,
        headOutputs: currentOutputMap(root, releaseOutputs.keys()),
        cutManifests,
        baseManifests,
        releaseManifests,
        headManifests: currentManifestMap(root, releaseManifestFiles),
      }),
    );
    if (errors.length) throw new Error(errors.join('\n'));
    console.log(
      JSON.stringify({
        branch: marker.branch,
        head: releaseHead,
        version: marker.version,
        planDigest: marker.planDigest,
        base,
        releaseRef,
      }),
    );
    return;
  }
  if (command !== 'validate')
    throw new Error(
      'command must be create, refresh, list-active, inspect-ref, validate-diff, validate-sync, or validate',
    );

  const marker = readJson(path.join(root, RELEASE_DIR, MARKER_FILE));
  const plan = readJson(path.join(root, RELEASE_DIR, PLAN_FILE));
  const activeBranches = required(values, 'active-branches')
    .split(',')
    .filter(Boolean)
    .sort();
  const errors = validateReleaseState({
    root,
    marker,
    plan,
    mode: required(values, 'mode'),
    releaseBranch: required(values, 'release-branch'),
    releaseVersion: values['release-version'],
    releaseTag: values['release-tag'],
    expectedPlanDigest: values['plan-digest'],
    refName: required(values, 'ref-name'),
    expectedHead: required(values, 'expected-head'),
    checkoutSha: required(values, 'checkout-sha'),
    remoteHead: values['remote-head'],
    activeBranches,
  });
  if (errors.length) throw new Error(errors.join('\n'));
  const receipt = {
    branch: marker.branch,
    head: values['expected-head'],
    version: marker.version,
    planDigest: marker.planDigest,
    mode: values.mode,
  };
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      Object.entries(receipt)
        .map(([key, value]) => `${key}=${value}\n`)
        .join(''),
    );
  }
  console.log(JSON.stringify(receipt));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(`release authority validation failed: ${error.message}`);
    process.exit(1);
  }
}

export {
  buildMarker,
  buildPlan,
  canonicalJson,
  computePlanDigest,
  isStableReleasePackage,
  listActiveBranches,
  validateIdentity,
  validateRefMarker,
  validateReleaseDiff,
  validateReleaseState,
  validateReleaseSync,
  versionTagExists,
  writeAuthority,
};
