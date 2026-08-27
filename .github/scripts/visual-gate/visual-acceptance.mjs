#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Record, evaluate, and promote explicit visual acceptance.
 *
 * Labels, comments, and statuses are projections. The immutable JSON record
 * under gh-pages:visual-gate/acceptances/<pr>/<head>/ is the source of truth.
 */

import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {
  isVisualAcceptanceEndpointMaintainer,
  isVisualAcceptanceRecordMaintainer,
} from './authorization.mjs';
import {canonicalizePng} from './lib/canonical-png.mjs';
import {readStoryIndex, shotKey, storiesInPackages} from './lib/plan.mjs';
import {renderReport} from './lib/report.mjs';

const args = process.argv.slice(2);
const command = args[0];
const flag = name => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? null : args[index + 1];
};
const SHA = /^[0-9a-f]{40}$/;
const KEY = /^[A-Za-z0-9._-]{1,240}$/;
const NAME = /^[A-Za-z0-9._-]{1,120}$/;
const REPO = 'facebook/astryx';

function fail(message) {
  throw new Error(`visual acceptance refused: ${message}`);
}

function shaBytes(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function shaFile(file) {
  return shaBytes(fs.readFileSync(file));
}

function shaJSON(value) {
  return shaBytes(JSON.stringify(value));
}

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`cannot read ${file}: ${error.message}`);
  }
}

function writeJSON(file, value) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function pagesHead(pages) {
  return execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: pages,
    encoding: 'utf8',
  }).trim();
}

function validateIdentity(pr, head) {
  if (!Number.isSafeInteger(pr) || pr <= 0 || !SHA.test(head))
    fail('invalid PR/head');
}

function evidenceRoot(pages, pr, head) {
  return path.join(pages, 'pr', String(pr), 'visual', head);
}

function evidenceAt(pages, pr, head, run, attempt) {
  if (
    !Number.isSafeInteger(run) ||
    run <= 0 ||
    !Number.isSafeInteger(attempt) ||
    attempt <= 0
  ) {
    fail('invalid evidence run/attempt');
  }
  const dir = path.join(
    evidenceRoot(pages, pr, head),
    String(run),
    String(attempt),
  );
  if (!fs.existsSync(dir))
    fail(`no published evidence for run ${run}/${attempt}`);
  const evidence = readJSON(path.join(dir, 'evidence.json'));
  validateEvidence(evidence, {pr, head, run, attempt});
  return {dir, evidence};
}

function latestEvidence(pages, pr, head, {required = true} = {}) {
  const root = evidenceRoot(pages, pr, head);
  if (!fs.existsSync(root)) {
    if (!required) return null;
    fail(`no published evidence for PR #${pr}, head ${head}`);
  }
  const runs = fs
    .readdirSync(root, {withFileTypes: true})
    .filter(entry => entry.isDirectory() && /^\d+$/.test(entry.name))
    .map(entry => Number(entry.name))
    .sort((a, b) => b - a);
  if (runs.length === 0) {
    if (!required) return null;
    fail('published evidence has no run directory');
  }
  const run = runs[0];
  const runDir = path.join(root, String(run));
  const attempts = fs
    .readdirSync(runDir, {withFileTypes: true})
    .filter(entry => entry.isDirectory() && /^\d+$/.test(entry.name))
    .map(entry => Number(entry.name))
    .sort((a, b) => b - a);
  const dir =
    attempts.length > 0 ? path.join(runDir, String(attempts[0])) : runDir;
  const evidence = readJSON(path.join(dir, 'evidence.json'));
  validateEvidence(evidence, {pr, head, run});
  if (attempts.length > 0 && evidence.run.attempt !== attempts[0]) {
    fail('evidence attempt identity mismatch');
  }
  return {dir, evidence};
}

function validateCapture(capture) {
  if (
    !capture ||
    typeof capture.platform !== 'string' ||
    !capture.platform ||
    typeof capture.browser !== 'string' ||
    !capture.browser ||
    !Number.isSafeInteger(capture.viewport?.width) ||
    !Number.isSafeInteger(capture.viewport?.height) ||
    capture.viewport.width <= 0 ||
    capture.viewport.height <= 0
  ) {
    fail('evidence capture identity is incomplete');
  }
}

function validateShot(shot, key) {
  if (
    !shot ||
    typeof shot.storyId !== 'string' ||
    !shot.storyId ||
    typeof shot.theme !== 'string' ||
    !shot.theme ||
    !['light', 'dark'].includes(shot.mode) ||
    !Array.isArray(shot.reasons)
  ) {
    fail(`accepted shot plan is incomplete for ${key}`);
  }
}

function validateEvidence(evidence, expected) {
  if (
    evidence?.version !== 1 ||
    evidence.repo !== REPO ||
    evidence.pr !== expected.pr ||
    evidence.headSha !== expected.head ||
    !SHA.test(evidence.testedSha ?? '') ||
    !SHA.test(evidence.baseSha ?? '') ||
    evidence.run?.id !== expected.run ||
    !Number.isSafeInteger(evidence.run?.attempt) ||
    evidence.run.attempt <= 0 ||
    (expected.attempt !== undefined &&
      evidence.run.attempt !== expected.attempt)
  ) {
    fail('evidence identity mismatch');
  }
  if (
    !['pass', 'changed', 'failed', 'skipped'].includes(evidence.verdict?.status)
  ) {
    fail('evidence verdict is invalid');
  }
  if (!Array.isArray(evidence.deltas) || evidence.deltas.length > 5000) {
    fail('evidence delta list is invalid');
  }
  if (evidence.verdict.status === 'skipped') {
    const counts = evidence.verdict.counts;
    if (evidence.capture !== null || evidence.deltas.length !== 0) {
      fail('skipped evidence must not claim a capture or deltas');
    }
    if (
      typeof evidence.verdict.reason !== 'string' ||
      !evidence.verdict.reason.trim() ||
      !Number.isSafeInteger(counts?.total) ||
      counts.total <= 0 ||
      ['unchanged', 'changed', 'added', 'removed', 'failed'].some(
        name => counts[name] !== 0,
      )
    ) {
      fail('skipped evidence must carry a trusted reason and count');
    }
    if (
      evidence.verdict.context?.sha !== evidence.testedSha ||
      evidence.verdict.context?.headSha !== evidence.headSha ||
      evidence.verdict.context?.baseSha !== evidence.baseSha ||
      String(evidence.verdict.context?.runId ?? '') !==
        String(evidence.run.id) ||
      String(evidence.verdict.context?.runAttempt ?? '') !==
        String(evidence.run.attempt)
    ) {
      fail('skipped evidence run identity mismatch');
    }
  } else {
    validateCapture(evidence.capture);
  }
  const seen = new Set();
  for (const delta of evidence.deltas) {
    if (
      !KEY.test(delta?.key ?? '') ||
      !['changed', 'added', 'removed'].includes(delta.kind)
    ) {
      fail(`invalid evidence delta ${JSON.stringify(delta)}`);
    }
    if (seen.has(delta.key)) fail(`duplicate evidence key ${delta.key}`);
    seen.add(delta.key);
    if (delta.kind === 'removed') {
      if (delta.shot !== null)
        fail(`removed key ${delta.key} must not carry a shot plan`);
    } else {
      validateShot(delta.shot, delta.key);
    }
  }
}

function validateReason(reason) {
  const clean = String(reason ?? '').trim();
  if (
    clean.length < 12 ||
    clean.length > 500 ||
    /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(clean)
  ) {
    fail('reason must be 12–500 printable characters');
  }
  if (
    /^(looks? good|intentional|approved|accept(ed)?|lgtm)[.! ]*$/i.test(clean)
  ) {
    fail(
      'reason must explain why the pixels are correct, not merely approve them',
    );
  }
  return clean;
}

function snapshotBundle({pages, evidenceDir, evidence}) {
  const baselineShots = path.join(pages, 'visual-gate', 'baseline', 'shots');
  return evidence.deltas.map(delta => {
    const beforeFile = path.join(baselineShots, `${delta.key}.png`);
    const afterFile = path.join(evidenceDir, 'after', `${delta.key}.png`);
    const currentBeforeSha256 = fs.existsSync(beforeFile)
      ? shaFile(beforeFile)
      : null;
    const beforeSha256 = delta.beforeSha256 ?? null;
    const afterSha256 = fs.existsSync(afterFile) ? shaFile(afterFile) : null;
    if (beforeSha256 !== null && !/^[0-9a-f]{64}$/.test(beforeSha256)) {
      fail(`invalid reviewed preimage for ${delta.key}`);
    }
    if (currentBeforeSha256 !== beforeSha256) {
      fail(`reviewed baseline is stale for ${delta.key}`);
    }
    if (delta.kind === 'changed' && (!beforeSha256 || !afterSha256)) {
      fail(`changed key ${delta.key} lacks before/after evidence`);
    }
    if (delta.kind === 'added' && (beforeSha256 || !afterSha256)) {
      fail(`added key ${delta.key} has invalid preimage/evidence`);
    }
    if (delta.kind === 'removed' && (!beforeSha256 || afterSha256)) {
      fail(`removed key ${delta.key} has invalid preimage/evidence`);
    }
    return {
      key: delta.key,
      kind: delta.kind,
      beforeSha256,
      afterSha256,
      shot: delta.shot,
    };
  });
}

function sameBundle(first, second) {
  return shaJSON(first) === shaJSON(second);
}

function recordPath(pages, pr, head, run, attempt) {
  return path.join(
    pages,
    'visual-gate',
    'acceptances',
    String(pr),
    head,
    String(run),
    String(attempt),
    'acceptance.json',
  );
}

function pointerPath(pages, pr, head) {
  return path.join(
    pages,
    'visual-gate',
    'acceptances',
    String(pr),
    head,
    'current.json',
  );
}

function accept() {
  const pages = path.resolve(flag('pages') ?? '.');
  const pr = Number(flag('pr'));
  const head = flag('head') ?? '';
  const runId = Number(flag('run-id'));
  const runAttempt = Number(flag('run-attempt'));
  const approver = flag('approver') ?? '';
  const approverId = Number(flag('approver-id'));
  const permission = flag('permission') ?? '';
  const effectivePermission = flag('effective-permission') ?? 'none';
  const roleName = flag('role-name');
  const commentId = Number(flag('comment-id'));
  const reason = validateReason(flag('reason'));

  validateIdentity(pr, head);
  if (!approver || !Number.isSafeInteger(approverId) || approverId <= 0)
    fail('invalid approver');
  if (!isVisualAcceptanceEndpointMaintainer({effectivePermission})) {
    fail('approver must have effective maintain/admin permission');
  }
  if (!Number.isSafeInteger(commentId) || commentId <= 0)
    fail('invalid comment id');

  const {dir: evidenceDir, evidence} = evidenceAt(
    pages,
    pr,
    head,
    runId,
    runAttempt,
  );
  if (evidence.verdict.status !== 'changed' || evidence.deltas.length === 0) {
    fail('current visual bundle has no delta to accept');
  }
  const manifestFile = path.join(
    pages,
    'visual-gate',
    'baseline',
    'manifest.json',
  );
  const manifest = readJSON(manifestFile);
  const keys = snapshotBundle({pages, evidenceDir, evidence});
  const output = recordPath(pages, pr, head, runId, runAttempt);
  const destination = path.dirname(output);

  const pointer = {
    version: 1,
    run: runId,
    attempt: runAttempt,
    record: `${runId}/${runAttempt}/acceptance.json`,
  };
  if (fs.existsSync(output)) {
    const existing = readJSON(output);
    validateAcceptance(existing, {
      pr,
      head,
      run: runId,
      attempt: runAttempt,
      dir: destination,
    });
    if (sameBundle(existing.keys, keys)) {
      writeJSON(pointerPath(pages, pr, head), pointer);
      process.stdout.write(`Acceptance already recorded at ${output}\n`);
      return;
    }
    fail('this head already has a different acceptance record');
  }

  for (const entry of keys) {
    if (!entry.afterSha256) continue;
    const source = path.join(evidenceDir, 'after', `${entry.key}.png`);
    const target = path.join(destination, 'after', `${entry.key}.png`);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.copyFileSync(source, target);
  }

  writeJSON(output, {
    version: 1,
    repo: REPO,
    pr,
    headSha: head,
    testedSha: evidence.testedSha,
    baseSha: evidence.baseSha,
    run: evidence.run,
    capture: evidence.capture,
    baseline: {
      ghPagesCommit: pagesHead(pages),
      manifestDigest: shaJSON(manifest),
    },
    keys,
    decision: {
      approver,
      approverId,
      permission,
      effectivePermission,
      roleName,
      reason,
      commentId,
      at: new Date().toISOString(),
    },
  });
  writeJSON(pointerPath(pages, pr, head), pointer);
  process.stdout.write(
    `Accepted ${keys.length} visual delta(s) for PR #${pr}, head ${head}, run ${runId}/${runAttempt}.\n`,
  );
}

function state() {
  const pages = path.resolve(flag('pages') ?? '.');
  const pr = Number(flag('pr'));
  const head = flag('head') ?? '';
  validateIdentity(pr, head);

  const found = latestEvidence(pages, pr, head, {required: false});
  let result;
  if (!found) {
    result = {
      state: 'pending',
      reason: 'capture',
      description: 'Stable visual capture is still running.',
    };
  } else if (found.evidence.verdict.status === 'pass') {
    result = {
      state: 'success',
      reason: 'clean',
      description: 'Stable visual capture is clean.',
    };
  } else if (found.evidence.verdict.status === 'failed') {
    result = {
      state: 'failure',
      reason: 'capture',
      description: 'Stable visual capture failed.',
    };
  } else if (found.evidence.verdict.status === 'skipped') {
    result = {
      state: 'success',
      reason: 'deferred',
      description: 'Broad stable scope is deferred to the release gate.',
    };
  } else {
    let current;
    try {
      current = snapshotBundle({
        pages,
        evidenceDir: found.dir,
        evidence: found.evidence,
      });
    } catch (error) {
      if (!String(error.message).includes('reviewed baseline is stale'))
        throw error;
      result = {
        state: 'pending',
        reason: 'capture',
        description: 'The visual baseline changed; recapture this head.',
      };
    }
    if (!result) {
      const file = recordPath(
        pages,
        pr,
        head,
        found.evidence.run.id,
        found.evidence.run.attempt,
      );
      const accepted = fs.existsSync(file) ? readJSON(file) : null;
      if (accepted)
        validateAcceptance(accepted, {
          pr,
          head,
          run: found.evidence.run.id,
          attempt: found.evidence.run.attempt,
          dir: path.dirname(file),
        });
      result =
        accepted && sameBundle(accepted.keys, current)
          ? {
              state: 'success',
              reason: 'accepted',
              description: 'Current visual bundle was explicitly accepted.',
            }
          : {
              state: 'pending',
              reason: 'decision',
              description: 'Stable visual changes await /accept-visual.',
            };
    }
  }
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

function validateAcceptance(value, expected = {}) {
  if (
    value?.version !== 1 ||
    value.repo !== REPO ||
    !Number.isSafeInteger(value.pr) ||
    value.pr <= 0 ||
    (expected.pr && value.pr !== expected.pr) ||
    !SHA.test(value.headSha ?? '') ||
    (expected.head && value.headSha !== expected.head) ||
    !SHA.test(value.testedSha ?? '') ||
    !SHA.test(value.baseSha ?? '') ||
    !Number.isSafeInteger(value.run?.id) ||
    value.run.id <= 0 ||
    (expected.run && value.run.id !== expected.run) ||
    !Number.isSafeInteger(value.run?.attempt) ||
    value.run.attempt <= 0 ||
    (expected.attempt && value.run.attempt !== expected.attempt) ||
    !Array.isArray(value.keys) ||
    value.keys.length === 0 ||
    !value.decision?.approver ||
    !Number.isSafeInteger(value.decision?.approverId) ||
    value.decision.approverId <= 0 ||
    !isVisualAcceptanceRecordMaintainer({
      permission: value.decision?.permission,
      effectivePermission: value.decision?.effectivePermission,
    }) ||
    !Number.isSafeInteger(value.decision?.commentId) ||
    value.decision.commentId <= 0 ||
    !value.decision?.reason
  ) {
    fail('acceptance record is invalid');
  }
  validateCapture(value.capture);
  const seen = new Set();
  for (const entry of value.keys) {
    if (
      !KEY.test(entry?.key ?? '') ||
      !['changed', 'added', 'removed'].includes(entry.kind)
    ) {
      fail('acceptance record contains an invalid key');
    }
    if (seen.has(entry.key)) fail(`acceptance record repeats ${entry.key}`);
    seen.add(entry.key);
    if (entry.kind === 'removed') {
      if (entry.afterSha256 !== null || entry.shot !== null)
        fail(`removed key ${entry.key} is invalid`);
    } else {
      if (!/^[0-9a-f]{64}$/.test(entry.afterSha256 ?? ''))
        fail(`after hash is invalid for ${entry.key}`);
      validateShot(entry.shot, entry.key);
      if (expected.dir) {
        const archived = path.join(expected.dir, 'after', `${entry.key}.png`);
        if (
          !fs.existsSync(archived) ||
          shaFile(archived) !== entry.afterSha256
        ) {
          fail(`archived AFTER is missing or changed for ${entry.key}`);
        }
      }
    }
    if (
      entry.beforeSha256 !== null &&
      !/^[0-9a-f]{64}$/.test(entry.beforeSha256)
    ) {
      fail(`before hash is invalid for ${entry.key}`);
    }
  }
}

function readTrustedScope() {
  const scope = readJSON(path.resolve(flag('scope')));
  if (
    scope?.hasStableVisual !== true ||
    typeof scope.broadStableVisual !== 'boolean' ||
    !Array.isArray(scope.stableComponents) ||
    !Array.isArray(scope.stableThemes) ||
    !scope.stableComponents.every(name => NAME.test(name)) ||
    !scope.stableThemes.every(name => NAME.test(name))
  ) {
    fail('trusted visual scope is invalid');
  }
  return scope;
}

function readTrustedBaseline() {
  const baseline = readJSON(
    path.join(path.resolve(flag('baseline')), 'manifest.json'),
  );
  if (
    !baseline?.shots ||
    typeof baseline.shots !== 'object' ||
    Array.isArray(baseline.shots)
  ) {
    fail('trusted visual baseline is invalid');
  }
  const entries = Object.entries(baseline.shots);
  if (entries.length === 0 || entries.length > 5000) {
    fail(`trusted visual baseline has invalid size ${entries.length}`);
  }
  return {baseline, entries};
}

function trustedDefer() {
  const scope = readTrustedScope();
  if (!scope.broadStableVisual) fail('trusted visual scope is not broad');

  const {entries} = readTrustedBaseline();
  const output = path.resolve(flag('output'));
  const pr = Number(flag('pr'));
  const head = flag('head') ?? '';
  const base = flag('base') ?? '';
  const runId = Number(flag('run-id'));
  const runAttempt = Number(flag('run-attempt'));
  validateIdentity(pr, head);
  if (!SHA.test(base)) fail('invalid base SHA');
  if (
    !Number.isSafeInteger(runId) ||
    runId <= 0 ||
    !Number.isSafeInteger(runAttempt) ||
    runAttempt <= 0
  ) {
    fail('invalid evidence run/attempt');
  }

  const total = entries.length;
  const reason =
    'Broad stable scope is deferred to the daily release gate. ' +
    `It covers ${total} trusted baseline shot${total === 1 ? '' : 's'} ` +
    'instead of recapturing them for this PR.';
  const verdict = {
    version: 1,
    status: 'skipped',
    generatedAt: new Date().toISOString(),
    reason,
    context: {
      sha: head,
      headSha: head,
      baseSha: base,
      runId: String(runId),
      runAttempt: String(runAttempt),
      trustedScope: scope,
    },
    counts: {
      total,
      unchanged: 0,
      changed: 0,
      added: 0,
      removed: 0,
      failed: 0,
    },
    components: scope.stableComponents,
    changes: [],
    added: [],
    removed: [],
    failures: [],
  };
  const evidence = {
    version: 1,
    repo: REPO,
    pr,
    headSha: head,
    testedSha: head,
    baseSha: base,
    run: {id: runId, attempt: runAttempt},
    capture: null,
    deltas: [],
    verdict,
  };
  validateEvidence(evidence, {
    pr,
    head,
    run: runId,
    attempt: runAttempt,
  });

  fs.rmSync(output, {recursive: true, force: true});
  writeJSON(path.join(output, 'evidence.json'), evidence);
  writeJSON(path.join(output, 'verdict.json'), verdict);
  fs.writeFileSync(path.join(output, 'index.html'), renderReport(verdict));
  process.stdout.write(
    `Deferred ${total} trusted baseline shot${total === 1 ? '' : 's'} for PR #${pr}, run ${runId}/${runAttempt}.\n`,
  );
}

function trustedPlan() {
  const scope = readTrustedScope();
  if (scope.broadStableVisual)
    fail('broad stable scope must be deferred instead of captured');
  const {entries: baselineEntries} = readTrustedBaseline();
  const storybookDir = path.resolve(flag('storybook-dir'));
  const output = path.resolve(flag('output'));

  const baselineThemes = [
    ...new Set(baselineEntries.map(([, shot]) => shot.theme)),
  ].filter(Boolean);
  const shots = [];

  if (scope.stableComponents.length > 0 || scope.stableThemes.length > 0) {
    const indexed = storiesInPackages(readStoryIndex(storybookDir, []), [
      'Core',
    ]);
    const stories = new Map();
    const newTheme = scope.stableThemes.some(
      theme => !baselineThemes.includes(theme),
    );
    for (const [, shot] of baselineEntries) {
      if (
        newTheme ||
        scope.stableThemes.includes(shot.theme) ||
        scope.stableComponents.includes(shot.component)
      ) {
        stories.set(shot.storyId, shot);
      }
    }
    for (const story of indexed) {
      if (scope.stableComponents.includes(story.component))
        stories.set(story.id, story);
    }
    const themes =
      scope.stableThemes.length > 0 ? scope.stableThemes : baselineThemes;
    for (const story of stories.values()) {
      for (const theme of themes) {
        for (const mode of ['light', 'dark']) {
          const shot = {
            storyId: story.storyId ?? story.id,
            title: story.title,
            name: story.name,
            component: story.component,
            theme,
            mode,
            reasons: ['trusted:pr-scope'],
          };
          shots.push({...shot, key: shotKey(shot)});
        }
      }
    }
  }
  const unique = [...new Map(shots.map(shot => [shot.key, shot])).values()];
  if (unique.length === 0 || unique.length > 5000) {
    fail(`trusted visual plan has invalid size ${unique.length}`);
  }
  writeJSON(output, unique);
  process.stdout.write(
    `Wrote ${unique.length} trusted PR shot(s) to ${output}.\n`,
  );
}

function plan() {
  const acceptanceFile = path.resolve(flag('acceptance'));
  const acceptance = readJSON(acceptanceFile);
  validateAcceptance(acceptance, {dir: path.dirname(acceptanceFile)});
  const output = path.resolve(flag('output'));
  const shots = acceptance.keys
    .filter(entry => entry.kind !== 'removed')
    .map(entry => ({...entry.shot, key: entry.key}));
  writeJSON(output, shots);
  process.stdout.write(
    `Wrote ${shots.length} post-merge shot(s) to ${output}.\n`,
  );
}

function sameViewport(first, second) {
  return first?.width === second?.width && first?.height === second?.height;
}

function promote() {
  const pages = path.resolve(flag('pages'));
  const acceptanceFile = path.resolve(flag('acceptance'));
  const capture = path.resolve(flag('capture'));
  const mergeSha = flag('merge-sha') ?? '';
  if (!SHA.test(mergeSha)) fail('invalid merge SHA');

  const acceptance = readJSON(acceptanceFile);
  validateAcceptance(acceptance, {dir: path.dirname(acceptanceFile)});
  const manifestFile = path.join(
    pages,
    'visual-gate',
    'baseline',
    'manifest.json',
  );
  const manifest = readJSON(manifestFile);
  const baselineShots = path.join(pages, 'visual-gate', 'baseline', 'shots');
  const captureManifest = readJSON(path.join(capture, 'manifest.json'));
  const acceptedDir = path.dirname(acceptanceFile);
  const alreadyRecorded = (manifest.decisions ?? []).some(
    decision =>
      decision.pr === acceptance.pr &&
      decision.headSha === acceptance.headSha &&
      decision.mergeSha === mergeSha,
  );

  if (captureManifest.context?.sha !== mergeSha) {
    fail(
      `capture was produced for ${captureManifest.context?.sha ?? 'an unknown commit'}, not ${mergeSha}`,
    );
  }
  if (
    captureManifest.platform !== acceptance.capture.platform ||
    captureManifest.browser !== acceptance.capture.browser ||
    !sameViewport(captureManifest.viewport, acceptance.capture.viewport)
  ) {
    fail('post-merge capture environment does not match the reviewed capture');
  }

  const actions = [];
  for (const entry of acceptance.keys) {
    const baselineFile = path.join(baselineShots, `${entry.key}.png`);
    const currentBefore = fs.existsSync(baselineFile)
      ? shaFile(baselineFile)
      : null;
    if (currentBefore === entry.afterSha256 && alreadyRecorded) {
      actions.push({entry, baselineFile, alreadyPromoted: true});
      continue;
    }
    if (currentBefore !== entry.beforeSha256) {
      fail(
        `baseline conflict for ${entry.key}: expected ${entry.beforeSha256}, found ${currentBefore}`,
      );
    }
    if (entry.kind === 'removed') {
      actions.push({entry, baselineFile, remove: true});
      continue;
    }

    const acceptedAfter = path.join(acceptedDir, 'after', `${entry.key}.png`);
    const recaptured = path.join(capture, 'shots', `${entry.key}.png`);
    const capturedShot = captureManifest.shots?.[entry.key];
    if (
      !fs.existsSync(acceptedAfter) ||
      shaFile(acceptedAfter) !== entry.afterSha256
    ) {
      fail(
        `archived AFTER does not match its decision record for ${entry.key}`,
      );
    }
    if (!fs.existsSync(recaptured) || !capturedShot) {
      fail(`post-merge capture is missing ${entry.key}`);
    }
    const rawRecapturedSha256 = shaFile(recaptured);
    if (capturedShot.sha256 !== rawRecapturedSha256) {
      fail(`post-merge manifest hash does not match ${entry.key}`);
    }
    let canonical;
    try {
      canonical = canonicalizePng(fs.readFileSync(recaptured));
    } catch (error) {
      fail(
        `post-merge capture is not a valid PNG for ${entry.key}: ${error.message}`,
      );
    }
    const canonicalSha256 = shaBytes(canonical.bytes);
    if (canonicalSha256 !== entry.afterSha256) {
      fail(
        `canonical post-merge hash does not match accepted AFTER for ${entry.key}`,
      );
    }
    for (const field of ['storyId', 'theme', 'mode']) {
      if (capturedShot[field] !== entry.shot[field]) {
        fail(
          `post-merge ${field} does not match accepted plan for ${entry.key}`,
        );
      }
    }
    if (
      capturedShot.width !== canonical.width ||
      capturedShot.height !== canonical.height
    ) {
      fail(`post-merge dimensions do not match ${entry.key}`);
    }
    actions.push({
      entry,
      baselineFile,
      canonicalBytes: canonical.bytes,
      capturedShot: {...capturedShot, sha256: canonicalSha256},
    });
  }

  if (actions.every(action => action.alreadyPromoted)) {
    process.stdout.write(
      `Accepted visual bundle for PR #${acceptance.pr} was already promoted.\n`,
    );
    return;
  }

  for (const action of actions) {
    if (action.alreadyPromoted) continue;
    if (action.remove) {
      if (fs.existsSync(action.baselineFile)) fs.rmSync(action.baselineFile);
      delete manifest.shots[action.entry.key];
    } else {
      fs.writeFileSync(action.baselineFile, action.canonicalBytes);
      manifest.shots[action.entry.key] = action.capturedShot;
    }
  }

  manifest.capturedAt = captureManifest.capturedAt;
  manifest.platform = captureManifest.platform;
  manifest.browser = captureManifest.browser;
  manifest.viewport = captureManifest.viewport;
  manifest.context = {sha: mergeSha};
  manifest.decisions = [
    ...(manifest.decisions ?? []),
    {
      at: new Date().toISOString(),
      actor: acceptance.decision.approver,
      reason: acceptance.decision.reason,
      pr: acceptance.pr,
      headSha: acceptance.headSha,
      mergeSha,
      promoted: acceptance.keys
        .filter(entry => entry.kind !== 'removed')
        .map(entry => entry.key),
      pruned: acceptance.keys
        .filter(entry => entry.kind === 'removed')
        .map(entry => entry.key),
    },
  ].slice(-200);
  writeJSON(manifestFile, manifest);
  process.stdout.write(
    `Promoted accepted visual bundle for PR #${acceptance.pr}.\n`,
  );
}

switch (command) {
  case 'accept':
    accept();
    break;
  case 'state':
    state();
    break;
  case 'trusted-defer':
    trustedDefer();
    break;
  case 'trusted-plan':
    trustedPlan();
    break;
  case 'plan':
    plan();
    break;
  case 'promote':
    promote();
    break;
  default:
    fail(
      'usage: visual-acceptance.mjs <accept|state|trusted-defer|trusted-plan|plan|promote>',
    );
}
