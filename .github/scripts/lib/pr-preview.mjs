// Copyright (c) Meta Platforms, Inc. and affiliates.

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

export const PR_ANALYSIS_MARKER = '<!-- astryx-pr-analysis -->';
export const PREVIEW_RESULT_VERSION = 1;

const FULL_SHA = /^[0-9a-f]{40}$/;
const SHA256 = /^[0-9a-f]{64}$/;
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

  return {
    prNumber: positiveInteger(pull.number, 'pull request number'),
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

function targetPaths(prNumber) {
  return {
    storybook: `pr/${prNumber}/`,
    sandbox: `pr/${prNumber}/sandbox/`,
  };
}

function resultIdentity(identity) {
  return {
    repository: repository(identity.baseRepository, 'base repository'),
    pullRequest: {
      number: positiveInteger(identity.prNumber, 'pull request number'),
      headSha: fullSha(identity.headSha, 'pull request head'),
      headRef: nonempty(identity.headRef, 'pull request branch'),
      headRepository: repository(
        identity.headRepository,
        'pull request head repository',
      ),
      headRepositoryId: nonempty(
        identity.headRepositoryId,
        'pull request head repository id',
      ),
    },
    sourceRun: {
      id: positiveInteger(identity.sourceRunId, 'source run id'),
      attempt: positiveInteger(identity.sourceRunAttempt, 'source run attempt'),
      conclusion: String(identity.sourceConclusion ?? ''),
    },
  };
}

export function createUnavailableDeploymentResult(identity, reason) {
  const normalized = resultIdentity(identity);
  const paths = targetPaths(normalized.pullRequest.number);
  return {
    version: PREVIEW_RESULT_VERSION,
    status: 'unavailable',
    reason: nonempty(reason, 'unavailable reason'),
    ...normalized,
    pagesCommit: null,
    targets: {
      storybook: {
        available: false,
        path: paths.storybook,
        indexSha256: null,
      },
      sandbox: {
        available: false,
        path: paths.sandbox,
        indexSha256: null,
      },
    },
  };
}

export function createPreviewPublicationManifest(
  identity,
  {storybookIndexSha256 = null, sandboxIndexSha256 = null} = {},
) {
  const normalized = resultIdentity(identity);
  const paths = targetPaths(normalized.pullRequest.number);
  const target = (targetPath, digest) => {
    if (digest !== null && !SHA256.test(String(digest))) {
      refuse('preview index digest is invalid');
    }
    return {
      available: digest !== null,
      path: targetPath,
      indexSha256: digest,
    };
  };
  return {
    version: PREVIEW_RESULT_VERSION,
    ...normalized,
    targets: {
      storybook: target(paths.storybook, storybookIndexSha256),
      sandbox: target(paths.sandbox, sandboxIndexSha256),
    },
  };
}

export function createPublishedDeploymentResult(
  identity,
  {storybookIndexSha256 = null, sandboxIndexSha256 = null, pagesCommit},
) {
  return {
    ...createPreviewPublicationManifest(identity, {
      storybookIndexSha256,
      sandboxIndexSha256,
    }),
    status: 'published',
    reason: null,
    pagesCommit: fullSha(pagesCommit, 'gh-pages commit'),
  };
}

export function writeDeploymentResult(file, value) {
  fs.mkdirSync(path.dirname(path.resolve(file)), {recursive: true});
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

export function validateDeploymentResult(value, expected) {
  const identity = resultIdentity(expected);
  if (value?.version !== PREVIEW_RESULT_VERSION) {
    refuse('deployment result version is invalid');
  }
  if (!['published', 'unavailable'].includes(value.status)) {
    refuse('deployment result status is invalid');
  }
  if (value.repository !== identity.repository) {
    refuse('deployment base repository does not match');
  }
  for (const [key, expectedValue] of Object.entries(identity.pullRequest)) {
    if (String(value.pullRequest?.[key]) !== String(expectedValue)) {
      refuse(`deployment pull request ${key} does not match`);
    }
  }
  for (const [key, expectedValue] of Object.entries(identity.sourceRun)) {
    if (String(value.sourceRun?.[key]) !== String(expectedValue)) {
      refuse(`deployment source run ${key} does not match`);
    }
  }

  const paths = targetPaths(identity.pullRequest.number);
  for (const name of ['storybook', 'sandbox']) {
    const target = value.targets?.[name];
    if (target?.path !== paths[name] || typeof target.available !== 'boolean') {
      refuse(`deployment ${name} target is invalid`);
    }
    if (target.available) {
      if (
        value.status !== 'published' ||
        !SHA256.test(target.indexSha256 ?? '')
      ) {
        refuse(`deployment ${name} proof is invalid`);
      }
      if (identity.sourceRun.conclusion !== 'success') {
        refuse(`deployment ${name} cannot be available for failed source CI`);
      }
    } else if (target.indexSha256 !== null) {
      refuse(`deployment ${name} has a digest without availability`);
    }
  }
  if (value.status === 'published') {
    fullSha(value.pagesCommit, 'deployment gh-pages commit');
  } else {
    if (value.pagesCommit !== null)
      refuse('unavailable deployment has a commit');
    if (value.targets.storybook.available || value.targets.sandbox.available) {
      refuse('unavailable deployment advertises a target');
    }
  }
  return value;
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

function pagesURL(identity, targetPath) {
  const [owner, repo] = identity.baseRepository.split('/');
  return `https://${owner}.github.io/${repo}/${targetPath}`;
}

function safeCurrentBody({identity, runUrl, message: overrideMessage}) {
  const conclusion = identity.sourceConclusion;
  const message =
    overrideMessage ??
    (conclusion === 'success'
      ? 'The current CI run completed, but its trusted analysis is unavailable. Preview links are not shown.'
      : `The current CI run concluded ${conclusion || 'without a result'}. Current analysis and preview links are unavailable.`);
  return `## PR Analysis Report\n${PR_ANALYSIS_MARKER}\n\n> **Current run:** ${message}\n\n---\n\n<sub>Generated by PR Enrichment workflow | <a href="${runUrl}" target="_blank" rel="noopener noreferrer">View current CI run</a></sub>\n`;
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

function trustedDeployment({deploymentResultPath, identity, core}) {
  try {
    if (!fs.existsSync(deploymentResultPath)) return null;
    return validateDeploymentResult(readJSON(deploymentResultPath), identity);
  } catch (error) {
    core.warning(
      `Ignoring untrusted or stale preview result: ${error.message}`,
    );
    return null;
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
  deploymentResultPath = 'preview-deployment/preview-deployment.json',
  visualPath = 'trusted-visual/verdict.json',
  visualPublished = false,
  visualReportPath = '',
  createIfMissing = true,
  fallbackMessage,
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
  const deployment = trustedDeployment({
    deploymentResultPath,
    identity,
    core,
  });
  const storybook = deployment?.targets.storybook.available === true;
  const sandbox = deployment?.targets.sandbox.available === true;
  const comments = await allComments(github, owner, repo, identity.prNumber);
  const botComments = comments.filter(comment => comment.user?.type === 'Bot');
  const botComment =
    botComments.find(comment => comment.body?.includes(PR_ANALYSIS_MARKER)) ??
    botComments.find(comment => comment.body?.includes('PR Analysis Report'));
  if (!botComment && !createIfMissing) {
    core.info(
      `No existing PR Analysis Report to reconcile on #${identity.prNumber}.`,
    );
    return {action: 'none', body: null, identity, deployment};
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
      ...(storybook
        ? [
            '--storybook-url',
            pagesURL(identity, deployment.targets.storybook.path),
          ]
        : []),
      ...(sandbox
        ? ['--sandbox-url', pagesURL(identity, deployment.targets.sandbox.path)]
        : []),
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
      body = execute(process.execPath, args, {encoding: 'utf8'});
    } catch (error) {
      core.warning(`Could not render current analysis: ${error.message}`);
      body = safeCurrentBody({identity, runUrl, message: fallbackMessage});
    }
  } else {
    body = safeCurrentBody({identity, runUrl, message: fallbackMessage});
  }

  if (botComment) {
    await github.rest.issues.updateComment({
      owner,
      repo,
      comment_id: botComment.id,
      body,
    });
    core.info(`Updated PR Analysis Report on #${identity.prNumber}.`);
    return {action: 'updated', body, identity, deployment};
  }

  await github.rest.issues.createComment({
    owner,
    repo,
    issue_number: identity.prNumber,
    body,
  });
  core.info(`Posted PR Analysis Report on #${identity.prNumber}.`);
  return {action: 'created', body, identity, deployment};
}
