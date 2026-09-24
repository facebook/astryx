// Copyright (c) Meta Platforms, Inc. and affiliates.

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

import {resolveVercelPreview} from './vercel-preview.mjs';

export const PR_ANALYSIS_MARKER = '<!-- astryx-pr-analysis -->';

function headMarker(sha) {
  return `<!-- astryx-pr-head:${sha} -->`;
}

const FULL_SHA = /^[0-9a-f]{40}$/;
const REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const GENERATOR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'generate-pr-comment.js',
);

function refuse(message) {
  throw new Error(`PR preview refused: ${message}`);
}

function positiveInteger(value, name) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0) {
    refuse(`${name} must be a positive integer`);
  }
  return number;
}

function fullSha(value, name) {
  const sha = String(value ?? '');
  if (!FULL_SHA.test(sha)) refuse(`${name} must be a full lowercase SHA`);
  return sha;
}

function repository(value, name) {
  const repo = String(value ?? '');
  if (!REPOSITORY.test(repo)) refuse(`${name} is invalid`);
  return repo;
}

function nonempty(value, name) {
  const string = String(value ?? '');
  if (!string) refuse(`${name} is missing`);
  return string;
}

function runRepository(run) {
  return repository(run?.head_repository?.full_name, 'source head repository');
}

function runRepositoryId(run) {
  return nonempty(run?.head_repository?.id, 'source head repository id');
}

function identityFromPullAndRun({pull, run, baseRepository}) {
  if (run?.event !== 'pull_request') {
    refuse('source run is not backed by a pull request');
  }
  if (run?.name && run.name !== 'CI') {
    refuse(`source workflow is ${run.name}, not CI`);
  }

  const expectedBase = repository(baseRepository, 'base repository');
  const sourceRunId = positiveInteger(run.id, 'source run id');
  const sourceRunAttempt = positiveInteger(
    run.run_attempt,
    'source run attempt',
  );
  const headSha = fullSha(run.head_sha, 'source head');
  const headRef = nonempty(run.head_branch, 'source head branch');
  const headRepository = runRepository(run);
  const headRepositoryId = runRepositoryId(run);

  if (pull?.state !== 'open') refuse('pull request is not open');
  if (pull?.head?.sha !== headSha)
    refuse('pull request head does not match source run');
  if (pull?.head?.ref !== headRef)
    refuse('pull request branch does not match source run');
  if (pull?.head?.repo?.full_name !== headRepository) {
    refuse('pull request repository does not match source run');
  }
  if (String(pull?.head?.repo?.id ?? '') !== headRepositoryId) {
    refuse('pull request repository id does not match source run');
  }
  if (pull?.base?.repo?.full_name !== expectedBase) {
    refuse('pull request targets another repository');
  }

  const sourcePull = run.pull_requests?.find(
    candidate =>
      Number(candidate.number) === Number(pull.number) &&
      candidate.head?.sha === headSha,
  );
  // The source run records the tested base. Live main may have advanced by the
  // time its report is published; that is not a new CI attempt. Fork runs may
  // omit this association, so absence is explicit rather than replaced by main.
  const testedBaseSha = sourcePull?.base?.sha
    ? fullSha(sourcePull.base.sha, 'source pull request base')
    : null;

  return {
    prNumber: positiveInteger(pull.number, 'pull request number'),
    testedBaseSha,
    headSha,
    headRef,
    headRepository,
    headRepositoryId,
    baseRepository: expectedBase,
    baseSha: fullSha(pull.base.sha, 'pull request base'),
    sourceRunId,
    sourceRunAttempt,
    sourceConclusion: String(run.conclusion ?? ''),
    draft: pull.draft === true,
  };
}

function sameIdentity(actual, expected) {
  for (const key of [
    'prNumber',
    'headSha',
    'headRef',
    'headRepository',
    'headRepositoryId',
    'baseRepository',
    'sourceRunId',
    'sourceRunAttempt',
    'sourceConclusion',
  ]) {
    if (String(actual[key]) !== String(expected[key])) {
      refuse(`${key} does not match the trusted source identity`);
    }
  }
}

export function validatePullRequestSourceRun({pull, run, baseRepository}) {
  return identityFromPullAndRun({pull, run, baseRepository});
}

export async function resolveWorkflowRunPullRequest({
  github,
  owner,
  repo,
  run,
}) {
  const baseRepository = `${owner}/${repo}`;
  let candidates;
  const directNumbers = [
    ...new Set(
      (run?.pull_requests ?? [])
        .map(pull => Number(pull?.number))
        .filter(number => Number.isSafeInteger(number) && number > 0),
    ),
  ];

  if (directNumbers.length > 0) {
    candidates = await Promise.all(
      directNumbers.map(async pullNumber => {
        const {data} = await github.rest.pulls.get({
          owner,
          repo,
          pull_number: pullNumber,
        });
        return data;
      }),
    );
  } else {
    const headOwner = nonempty(
      run?.head_repository?.owner?.login,
      'source head repository owner',
    );
    const headRef = nonempty(run?.head_branch, 'source head branch');
    const {data} = await github.rest.pulls.list({
      owner,
      repo,
      state: 'open',
      head: `${headOwner}:${headRef}`,
      per_page: 100,
    });
    candidates = data;
  }

  const matches = [];
  const seen = new Set();
  for (const pull of candidates) {
    if (seen.has(pull?.number)) continue;
    seen.add(pull?.number);
    try {
      matches.push(identityFromPullAndRun({pull, run, baseRepository}));
    } catch {
      // A candidate is not authority. Only the exact run/PR/repository identity
      // accepted above may reach a privileged mutation.
    }
  }
  if (
    matches.length === 0 &&
    candidates.every(pull => pull?.state !== 'open')
  ) {
    // A source run can be rerun after its pull request merges. No privileged
    // work remains when there is no open candidate, so finish without turning
    // the trusted default-branch workflow red.
    return null;
  }
  if (matches.length !== 1) {
    refuse(
      `expected exactly one current pull request for source run ${run?.id}; found ${matches.length}`,
    );
  }
  return matches[0];
}

export async function confirmSourceRunIdentity({
  github,
  owner,
  repo,
  expected,
}) {
  const sourceRunId = positiveInteger(expected.sourceRunId, 'source run id');
  const prNumber = positiveInteger(expected.prNumber, 'pull request number');
  const [{data: run}, {data: pull}] = await Promise.all([
    github.rest.actions.getWorkflowRun({owner, repo, run_id: sourceRunId}),
    github.rest.pulls.get({owner, repo, pull_number: prNumber}),
  ]);
  const actual = identityFromPullAndRun({
    pull,
    run,
    baseRepository: `${owner}/${repo}`,
  });
  sameIdentity(actual, expected);
  return actual;
}

export function validateAnalysisMetadata(metadata, identity) {
  if (String(metadata?.prNumber) !== String(identity.prNumber)) {
    refuse('analysis pull request does not match');
  }
  if (
    metadata?.headSha !== undefined &&
    metadata.headSha !== identity.headSha
  ) {
    refuse('analysis head does not match');
  }
  if (
    metadata?.headRepository !== undefined &&
    metadata.headRepository !== identity.headRepository
  ) {
    refuse('analysis head repository does not match');
  }
  if (
    metadata?.baseRepository !== undefined &&
    metadata.baseRepository !== identity.baseRepository
  ) {
    refuse('analysis base repository does not match');
  }
  if (String(metadata?.runId) !== String(identity.sourceRunId)) {
    refuse('analysis source run does not match');
  }
  if (
    metadata?.runAttempt !== undefined &&
    String(metadata.runAttempt) !== String(identity.sourceRunAttempt)
  ) {
    refuse('analysis source run attempt does not match');
  }
  if (
    !/^[0-9a-f]{7,40}$/.test(String(metadata?.shortHash ?? '')) ||
    !identity.headSha.startsWith(metadata.shortHash)
  ) {
    refuse('analysis short hash does not match');
  }
  return metadata;
}

function previewState(storybook, sandbox) {
  if (storybook && sandbox) return 'both';
  if (storybook) return 'storybook';
  if (sandbox) return 'sandbox';
  return 'none';
}

function safeCurrentBody({
  identity,
  runUrl,
  message: overrideMessage,
  previewOrigin,
}) {
  const conclusion = identity.sourceConclusion;
  const message =
    overrideMessage ??
    (conclusion === 'success'
      ? 'The current CI run completed, but its trusted analysis is unavailable.'
      : `The current CI run concluded ${conclusion || 'without a result'}. Current analysis is unavailable.`);
  const links = previewOrigin
    ? `\n\n[View Storybook for this PR](${previewOrigin}/storybook/) · [View Sandbox for this PR](${previewOrigin}/sandbox/)`
    : '\n\nThe exact-head preview is not available yet.';
  return `## PR Analysis Report\n${PR_ANALYSIS_MARKER}\n${headMarker(identity.headSha)}\n\n> **Current run:** ${message}${links}\n\n---\n\n<sub>Generated by PR Enrichment workflow | <a href="${runUrl}" target="_blank" rel="noopener noreferrer">View current CI run</a></sub>\n`;
}

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function trustedAnalysis({analysisPath, metadataPath, identity, core}) {
  try {
    if (!fs.existsSync(analysisPath) || !fs.existsSync(metadataPath))
      return false;
    validateAnalysisMetadata(readJSON(metadataPath), identity);
    readJSON(analysisPath);
    return true;
  } catch (error) {
    core.warning(`Ignoring untrusted or stale analysis: ${error.message}`);
    return false;
  }
}

async function allComments(github, owner, repo, prNumber) {
  return github.paginate(github.rest.issues.listComments, {
    owner,
    repo,
    issue_number: prNumber,
    per_page: 100,
  });
}

export async function reconcilePrComment({
  github,
  core,
  context,
  expectedIdentity,
  analysisPath = 'pr-analysis/analysis.json',
  metadataPath = 'pr-analysis/pr-meta.json',
  a11yPath = 'a11y/a11y-report.json',
  visualPath = 'trusted-visual/verdict.json',
  visualPublished = false,
  visualReportPath = '',
  createIfMissing = true,
  fallbackMessage,
  lookupPreview = resolveVercelPreview,
  generator = GENERATOR,
  execute = execFileSync,
}) {
  const {owner, repo} = context.repo;
  const identity = await confirmSourceRunIdentity({
    github,
    owner,
    repo,
    expected: expectedIdentity,
  });
  const runUrl = `${context.serverUrl}/${owner}/${repo}/actions/runs/${identity.sourceRunId}`;
  const analysisReady = trustedAnalysis({
    analysisPath,
    metadataPath,
    identity,
    core,
  });
  const previewOrigin =
    createIfMissing && !identity.draft
      ? await lookupPreview({
          github,
          owner,
          repo,
          prNumber: identity.prNumber,
          headSha: identity.headSha,
        })
      : null;
  // A Pages result cannot authorize a human preview link, even if one was
  // published by an older workflow. Both links require this exact Vercel head.
  const storybook = previewOrigin !== null;
  const sandbox = previewOrigin !== null;
  const comments = await allComments(github, owner, repo, identity.prNumber);
  const botComments = comments.filter(comment => comment.user?.type === 'Bot');
  const botComment =
    botComments.find(comment => comment.body?.includes(PR_ANALYSIS_MARKER)) ??
    botComments.find(comment => comment.body?.includes('PR Analysis Report'));
  if (!botComment && !createIfMissing) {
    core.info(
      `No existing PR Analysis Report to reconcile on #${identity.prNumber}.`,
    );
    return {action: 'none', body: null, identity};
  }

  let body;
  if (analysisReady) {
    let resolvedA11yPath = a11yPath;
    if (!fs.existsSync(resolvedA11yPath)) {
      resolvedA11yPath = path.resolve('a11y-empty.json');
      fs.writeFileSync(
        resolvedA11yPath,
        '{"components":{},"summary":{"componentsAudited":0,"totalViolations":0}}',
      );
    }
    const args = [
      generator,
      '--analysis',
      analysisPath,
      '--a11y',
      resolvedA11yPath,
      ...(fs.existsSync(visualPath)
        ? [
            '--visual',
            visualPath,
            ...(visualPublished && visualReportPath
              ? [
                  '--visual-report-url',
                  `https://${owner}.github.io/${repo}/${visualReportPath}/`,
                  '--visual-image-url',
                  `https://raw.githubusercontent.com/${owner}/${repo}/gh-pages/${visualReportPath}/`,
                ]
              : []),
          ]
        : []),
      ...(storybook ? ['--storybook-url', `${previewOrigin}/storybook/`] : []),
      ...(sandbox ? ['--sandbox-url', `${previewOrigin}/sandbox/`] : []),
      '--preview-state',
      previewState(storybook, sandbox),
      '--source-conclusion',
      identity.sourceConclusion,
      '--run-url',
      runUrl,
      '--pr-number',
      String(identity.prNumber),
    ];
    try {
      body = execute(process.execPath, args, {encoding: 'utf8'}).replace(
        PR_ANALYSIS_MARKER,
        `${PR_ANALYSIS_MARKER}\n${headMarker(identity.headSha)}`,
      );
    } catch (error) {
      core.warning(`Could not render current analysis: ${error.message}`);
      body = safeCurrentBody({
        identity,
        runUrl,
        message: fallbackMessage,
        previewOrigin,
      });
    }
  } else {
    body = safeCurrentBody({
      identity,
      runUrl,
      message: fallbackMessage,
      previewOrigin,
    });
  }

  // Vercel readiness can take minutes after the source run finishes. Check the
  // current PR and CI attempt again before changing any comment.
  await confirmSourceRunIdentity({
    github,
    owner,
    repo,
    expected: expectedIdentity,
  });
  if (botComment) {
    await github.rest.issues.updateComment({
      owner,
      repo,
      comment_id: botComment.id,
      body,
    });
    core.info(`Updated PR Analysis Report on #${identity.prNumber}.`);
    return {action: 'updated', body, identity};
  }

  await github.rest.issues.createComment({
    owner,
    repo,
    issue_number: identity.prNumber,
    body,
  });
  core.info(`Posted PR Analysis Report on #${identity.prNumber}.`);
  return {action: 'created', body, identity};
}

export async function reconcileEarlyPreviewComment({
  github,
  owner,
  repo,
  prNumber,
  headSha,
  origin,
  lookupPreview = resolveVercelPreview,
}) {
  const currentOrigin = await lookupPreview({
    github,
    owner,
    repo,
    prNumber,
    headSha,
    waitMs: 0,
  });
  if (currentOrigin !== origin) return {action: 'none'};

  const comments = await allComments(github, owner, repo, prNumber);
  const existing = comments.find(
    comment =>
      comment.user?.type === 'Bot' &&
      comment.body?.includes(PR_ANALYSIS_MARKER),
  );
  const links = `[View Storybook for this PR](${origin}/storybook/) · [View Sandbox for this PR](${origin}/sandbox/)`;
  const marker = headMarker(headSha);
  let body = `## PR Analysis Report\n${PR_ANALYSIS_MARKER}\n${marker}\n\n> **Preview ready:** Storybook and Sandbox were built with this PR's docsite. CI analysis and visual evidence will be added when available.\n\n${links}\n`;
  if (existing?.body.includes(marker)) {
    if (
      existing.body.includes(`${origin}/storybook/`) &&
      existing.body.includes(`${origin}/sandbox/`)
    ) {
      return {action: 'unchanged'};
    }
    const oldOrigins = new Set(
      existing.body.match(
        /https:\/\/astryx-[a-z0-9]{9}-fbopensource\.vercel\.app/g,
      ) ?? [],
    );
    if (
      oldOrigins.size === 1 &&
      existing.body.includes('View Storybook for this PR') &&
      existing.body.includes('View Sandbox for this PR')
    ) {
      // A same-head Vercel redeploy changes only the deployment origin. Keep
      // the already-enriched CI, a11y, and canonical visual evidence intact.
      body = existing.body.replaceAll([...oldOrigins][0], origin);
    } else if (
      !existing.body.includes('View Storybook for this PR') &&
      !existing.body.includes('View Sandbox for this PR')
    ) {
      // CI may finish before Vercel. Add the now-ready links without discarding
      // current-head analysis or immutable visual evidence from that report.
      body = existing.body
        .replace(/^> \*\*Preview availability:\*\*[^\n]*\n\n/m, '')
        .replace('The exact-head preview is not available yet.', '')
        .replace(marker, `${marker}\n\n${links}`);
    }
  }

  const {data: current} = await github.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });
  if (
    current.state !== 'open' ||
    current.draft ||
    current.head?.sha !== headSha
  ) {
    return {action: 'none'};
  }
  if (existing) {
    await github.rest.issues.updateComment({
      owner,
      repo,
      comment_id: existing.id,
      body,
    });
    return {action: 'updated', body};
  }
  await github.rest.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body,
  });
  return {action: 'created', body};
}
