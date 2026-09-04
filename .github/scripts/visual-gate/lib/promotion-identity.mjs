// Copyright (c) Meta Platforms, Inc. and affiliates.

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const SHA = /^[0-9a-f]{40}$/;
const REPO = 'facebook/astryx';

const FAILURE_DESCRIPTIONS = {
  'actions-response-invalid':
    'Recovery refused: the CI run response was invalid.',
  'invalid-head': 'Recovery refused: the resolved PR head was invalid.',
  'invalid-merge': 'Recovery refused: the resolved merge commit was invalid.',
  'invalid-pr': 'Recovery refused: the PR number was invalid.',
  'latest-ci-mismatch':
    'Recovery refused: acceptance is not from the latest completed CI attempt.',
  'active-ci-retry':
    'Visual promotion deferred: a newer CI retry is still active.',
  'merge-not-main':
    'Recovery refused: the merge commit is not reachable from main.',
  'pointer-invalid':
    'Recovery refused: the current acceptance pointer was invalid.',
  'pointer-missing':
    'Recovery refused: the current acceptance pointer was missing.',
  'pr-not-main': 'Recovery refused: the PR was not merged into main.',
  'pr-not-merged': 'Recovery refused: the PR is not merged.',
  'record-identity-mismatch':
    'Recovery refused: the acceptance record identity did not match.',
  'record-missing':
    'Recovery refused: the immutable acceptance record was missing.',
  superseded:
    'Recovery refused: a newer acceptance superseded the reviewed record.',
  'wrong-pr-response':
    'Recovery refused: GitHub returned the wrong PR identity.',
};

function refuse(code, message) {
  const error = new Error(`visual promotion refused: ${message}`);
  error.code = code;
  throw error;
}

export function promotionFailure(error) {
  const code =
    typeof error?.code === 'string' && FAILURE_DESCRIPTIONS[error.code]
      ? error.code
      : 'infrastructure-failure';
  return {
    code,
    description:
      FAILURE_DESCRIPTIONS[code] ??
      'Visual promotion validation failed before publication.',
  };
}

export function recoveryComplete({
  publicationConfirmed,
  gateOutcome,
  releaseOutcome,
}) {
  return (
    publicationConfirmed === true &&
    gateOutcome === 'success' &&
    releaseOutcome === 'success'
  );
}

export function recoveryOperationResult({
  jobResult,
  recoveryComplete: complete,
  mutationDeferred = false,
  failureDescription = null,
}) {
  if (
    jobResult === 'failure' ||
    jobResult === 'cancelled' ||
    Boolean(failureDescription)
  ) {
    return 'failure';
  }
  if (jobResult === 'success' && complete === true) return 'success';
  if (mutationDeferred === true && jobResult === 'success') {
    return 'deferred';
  }
  return 'failure';
}

export function promotionStatusProjection({
  headKnown,
  validationOk,
  acceptanceFound,
  promotionResult,
  mutationDeferred = false,
  deferredDescription = null,
  failureDescription,
}) {
  if (!headKnown) return null;
  if (validationOk && !acceptanceFound) return null;
  // Terminal trusted-operation outcomes always outrank deferral. A late retry
  // must never turn a failed/cancelled publisher into a pending status.
  if (promotionResult === 'failure' || promotionResult === 'cancelled') {
    return {
      state: 'failure',
      description:
        String(failureDescription ?? '').slice(0, 140) ||
        'Visual promotion failed; inspect the linked workflow run.',
    };
  }
  if (validationOk && acceptanceFound && promotionResult === 'success') {
    return {
      state: 'success',
      description: 'Accepted pixels promoted to the visual baseline.',
    };
  }
  if (
    validationOk &&
    acceptanceFound &&
    mutationDeferred &&
    promotionResult === 'deferred' &&
    !failureDescription
  ) {
    return {
      state: 'pending',
      description:
        String(deferredDescription ?? '').slice(0, 140) ||
        FAILURE_DESCRIPTIONS['active-ci-retry'],
    };
  }
  return {
    state: 'failure',
    description:
      String(failureDescription ?? '').slice(0, 140) ||
      'Visual promotion failed; inspect the linked workflow run.',
  };
}

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    refuse('infrastructure-failure', `cannot read ${file}: ${error.message}`);
  }
}

export function resolvePullRequestIdentity({
  pull,
  requestedPr,
  repository = REPO,
  baseRef = 'main',
  compareStatus,
}) {
  const pr = Number(requestedPr);
  if (!Number.isSafeInteger(pr) || pr <= 0)
    refuse('invalid-pr', 'invalid PR number');
  if (pull?.number !== pr)
    refuse('wrong-pr-response', `GitHub returned the wrong PR for #${pr}`);
  if (pull.state !== 'closed' || pull.merged !== true || !pull.merged_at) {
    refuse('pr-not-merged', `PR #${pr} is not merged`);
  }
  if (pull.base?.ref !== baseRef || pull.base?.repo?.full_name !== repository) {
    refuse(
      'pr-not-main',
      `PR #${pr} was not merged into ${repository}:${baseRef}`,
    );
  }
  if (!SHA.test(pull.head?.sha ?? ''))
    refuse('invalid-head', 'resolved head SHA is invalid');
  if (!SHA.test(pull.merge_commit_sha ?? '')) {
    refuse('invalid-merge', 'resolved merge SHA is invalid');
  }
  if (!['ahead', 'identical'].includes(compareStatus)) {
    refuse(
      'merge-not-main',
      `merge ${pull.merge_commit_sha} is not reachable from ${baseRef}`,
    );
  }
  return {
    pr,
    headSha: pull.head.sha,
    mergeSha: pull.merge_commit_sha,
  };
}

export function resolveAcceptanceIdentity({
  pages,
  pr,
  head,
  missingOk = false,
  expectedRecordRel = null,
  repository = REPO,
}) {
  if (!Number.isSafeInteger(pr) || pr <= 0 || !SHA.test(head)) {
    refuse('invalid-head', 'invalid PR/head');
  }
  const root = path.join(pages, 'visual-gate', 'acceptances', String(pr), head);
  const pointerFile = path.join(root, 'current.json');
  if (!fs.existsSync(pointerFile)) {
    if (missingOk) return {found: false};
    refuse('pointer-missing', 'current visual acceptance pointer is missing');
  }
  const pointer = readJSON(pointerFile);
  const expectedRel = `${pointer?.run}/${pointer?.attempt}/acceptance.json`;
  if (
    pointer?.version !== 1 ||
    !Number.isSafeInteger(pointer.run) ||
    pointer.run <= 0 ||
    !Number.isSafeInteger(pointer.attempt) ||
    pointer.attempt <= 0 ||
    pointer.record !== expectedRel
  ) {
    refuse('pointer-invalid', 'current visual acceptance pointer is invalid');
  }
  if (expectedRecordRel && pointer.record !== expectedRecordRel) {
    refuse(
      'superseded',
      'a newer visual acceptance superseded the reviewed record',
    );
  }
  const recordPath = path.join(root, pointer.record);
  if (!fs.existsSync(recordPath))
    refuse('record-missing', 'visual acceptance record is missing');
  const record = readJSON(recordPath);
  if (
    record?.repo !== repository ||
    record.pr !== pr ||
    record.headSha !== head ||
    record.run?.id !== pointer.run ||
    record.run?.attempt !== pointer.attempt
  ) {
    refuse(
      'record-identity-mismatch',
      'visual acceptance record identity does not match this merged head',
    );
  }
  return {
    found: true,
    recordPath,
    recordRel: pointer.record,
    runId: pointer.run,
    runAttempt: pointer.attempt,
  };
}

export function resolveCIState(workflowRuns, accepted) {
  if (!Array.isArray(workflowRuns)) {
    refuse('actions-response-invalid', 'GitHub Actions response is invalid');
  }
  const identity = run => {
    if (
      run?.name !== 'CI' ||
      !Number.isSafeInteger(run.id) ||
      run.id <= 0 ||
      !Number.isSafeInteger(run.run_attempt) ||
      run.run_attempt <= 0
    ) {
      return null;
    }
    return {
      id: run.id,
      attempt: run.run_attempt,
      status: run.status,
      conclusion: run.conclusion ?? null,
    };
  };
  const compare = (first, second) =>
    first.id - second.id || first.attempt - second.attempt;
  const ci = workflowRuns.map(identity).filter(Boolean);
  // A cancelled retry produces no new evidence. The last non-cancelled terminal
  // attempt remains the completed identity until another attempt completes.
  const latestCompleted = ci
    .filter(run => run.status === 'completed' && run.conclusion !== 'cancelled')
    .sort(compare)
    .at(-1);
  if (
    !latestCompleted ||
    latestCompleted.id !== accepted.runId ||
    latestCompleted.attempt !== accepted.runAttempt
  ) {
    refuse(
      'latest-ci-mismatch',
      'accepted evidence is not from the latest completed CI attempt',
    );
  }
  const newerActive = ci
    .filter(
      run => run.status !== 'completed' && compare(run, latestCompleted) > 0,
    )
    .sort(compare)
    .at(-1);
  return {
    latestCompleted: {
      id: latestCompleted.id,
      attempt: latestCompleted.attempt,
    },
    newerActive: newerActive
      ? {
          id: newerActive.id,
          attempt: newerActive.attempt,
          status: newerActive.status,
        }
      : null,
  };
}

export function assertLatestCompletedCI(workflowRuns, accepted) {
  return resolveCIState(workflowRuns, accepted);
}

function flag(args, name) {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? null : args[index + 1];
}

function githubJSON(endpoint) {
  return JSON.parse(execFileSync('gh', ['api', endpoint], {encoding: 'utf8'}));
}

export function expandCIHistory(workflowRuns, loadAttempt) {
  if (!Array.isArray(workflowRuns)) {
    refuse('actions-response-invalid', 'GitHub Actions response is invalid');
  }
  const byRun = new Map();
  for (const run of workflowRuns) {
    if (
      run?.name !== 'CI' ||
      !Number.isSafeInteger(run.id) ||
      !Number.isSafeInteger(run.run_attempt)
    ) {
      continue;
    }
    const prior = byRun.get(run.id);
    if (!prior || run.run_attempt > prior.run_attempt) byRun.set(run.id, run);
  }
  const currentRuns = [...byRun.values()].sort((a, b) => b.id - a.id);
  const history = [];
  let foundCompleted = false;
  for (const current of currentRuns) {
    history.push(current);
    if (current.status === 'completed' && current.conclusion !== 'cancelled') {
      break;
    }
    for (let attempt = current.run_attempt - 1; attempt >= 1; attempt -= 1) {
      const prior = loadAttempt(current.id, attempt);
      history.push(prior);
      if (prior.status === 'completed' && prior.conclusion !== 'cancelled') {
        foundCompleted = true;
        break;
      }
    }
    if (foundCompleted) break;
  }
  return history;
}

function loadCIHistory(head) {
  const response = githubJSON(
    `repos/${REPO}/actions/runs?event=pull_request&head_sha=${head}&per_page=100`,
  );
  return expandCIHistory(response.workflow_runs, (runId, attempt) =>
    githubJSON(`repos/${REPO}/actions/runs/${runId}/attempts/${attempt}`),
  );
}

function resolveFromGitHub(args) {
  const pages = path.resolve(flag(args, 'pages'));
  const pr = Number(flag(args, 'pr'));
  const head = flag(args, 'head') ?? '';
  const missingOkValue = flag(args, 'missing-ok') ?? 'false';
  if (!['true', 'false'].includes(missingOkValue)) {
    refuse('infrastructure-failure', 'missing-ok must be true or false');
  }
  const resolved = resolveAcceptanceIdentity({
    pages,
    pr,
    head,
    missingOk: missingOkValue === 'true',
    expectedRecordRel: flag(args, 'expected-record-rel'),
  });
  if (!resolved.found) return resolved;

  let runs;
  try {
    runs = loadCIHistory(head);
  } catch (error) {
    refuse(
      'infrastructure-failure',
      `cannot resolve the latest completed CI run: ${error.message}`,
    );
  }
  const ciState = resolveCIState(runs, resolved);
  return {
    ...resolved,
    latestCompleted: ciState.latestCompleted,
    newerActive: ciState.newerActive,
    deferred: ciState.newerActive !== null,
    deferredDescription:
      ciState.newerActive === null
        ? null
        : FAILURE_DESCRIPTIONS['active-ci-retry'],
  };
}

if (
  process.argv[1] &&
  fs.realpathSync(process.argv[1]) ===
    fs.realpathSync(fileURLToPath(import.meta.url))
) {
  try {
    const [command, ...args] = process.argv.slice(2);
    if (command !== 'resolve-acceptance') {
      refuse(
        'infrastructure-failure',
        'usage: promotion-identity.mjs resolve-acceptance [flags]',
      );
    }
    process.stdout.write(
      `${JSON.stringify({ok: true, ...resolveFromGitHub(args)})}\n`,
    );
  } catch (error) {
    process.stdout.write(
      `${JSON.stringify({
        ok: false,
        ...promotionFailure(error),
        message: String(error?.message ?? error).slice(0, 500),
      })}\n`,
    );
  }
}
