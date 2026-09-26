// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Resolve a CI-owned baseline maintenance capture before publication.
 * @input GitHub workflow/run/job/artifact identity and the downloaded manifest
 * @output An exact source artifact, or a refusal; never a pixel acceptance
 * @position Trusted source boundary for ci.yml's publication-only maintenance job
 */

import {validateReleasePlan} from './visual-gate/lib/compare.mjs';

function refuse(message) {
  throw new Error(`Visual maintenance source refused: ${message}`);
}

function positiveInteger(value, label) {
  if (!/^[1-9][0-9]*$/.test(String(value))) refuse(`${label} is invalid`);
  const result = Number(value);
  if (!Number.isSafeInteger(result)) refuse(`${label} is invalid`);
  return result;
}

/** Resolve only the named attempt's completed canonical capture on main. */
export async function resolveVisualMaintenanceSource({
  github,
  owner,
  repo,
  runId,
  runAttempt,
}) {
  const id = positiveInteger(runId, 'run id');
  const attempt = positiveInteger(runAttempt, 'run attempt');
  const repository = `${owner}/${repo}`;
  const [{data: workflow}, {data: run}] = await Promise.all([
    github.rest.actions.getWorkflow({owner, repo, workflow_id: 'ci.yml'}),
    github.rest.actions.getWorkflowRunAttempt({
      owner,
      repo,
      run_id: id,
      attempt_number: attempt,
    }),
  ]);
  if (
    workflow.path !== '.github/workflows/ci.yml' ||
    run.workflow_id !== workflow.id ||
    run.path !== workflow.path ||
    run.id !== id ||
    run.run_attempt !== attempt ||
    run.repository?.full_name !== repository ||
    run.head_repository?.full_name !== repository ||
    !Number.isSafeInteger(run.repository?.id) ||
    run.head_repository?.id !== run.repository.id ||
    run.event !== 'workflow_dispatch' ||
    run.head_branch !== 'main' ||
    !/^[0-9a-f]{40}$/.test(run.head_sha ?? '') ||
    run.status !== 'completed' ||
    !['success', 'failure'].includes(run.conclusion)
  ) {
    refuse('expected an exact completed main CI maintenance attempt');
  }

  const {data: comparison} = await github.rest.repos.compareCommitsWithBasehead(
    {
      owner,
      repo,
      basehead: `${run.head_sha}...main`,
    },
  );
  if (!['identical', 'ahead'].includes(comparison.status)) {
    refuse('capture commit is not reachable from main');
  }

  const jobs = await github.paginate(
    github.rest.actions.listJobsForWorkflowRunAttempt,
    {owner, repo, run_id: id, attempt_number: attempt, per_page: 100},
  );
  const captures = jobs.filter(job => job.name === 'Stable visual regression');
  if (
    captures.length !== 1 ||
    captures[0].status !== 'completed' ||
    !['success', 'failure'].includes(captures[0].conclusion) ||
    !captures[0].steps?.some(
      step =>
        step.name === 'Validate canonical baseline capture' &&
        step.conclusion === 'success',
    )
  ) {
    refuse(
      'the named attempt did not complete a canonical maintenance capture',
    );
  }

  const artifacts = await github.paginate(
    github.rest.actions.listWorkflowRunArtifacts,
    {owner, repo, run_id: id, per_page: 100},
  );
  const name = `visual-baseline-capture-${id}-${attempt}`;
  const matches = artifacts.filter(artifact => artifact.name === name);
  if (matches.length !== 1)
    refuse('expected one exact maintenance capture artifact');
  const artifact = matches[0];
  const source = artifact.workflow_run;
  if (
    !Number.isSafeInteger(artifact.id) ||
    artifact.id <= 0 ||
    artifact.expired !== false ||
    source?.id !== id ||
    source.repository_id !== run.repository.id ||
    source.head_repository_id !== run.repository.id ||
    source.head_branch !== 'main' ||
    source.head_sha !== run.head_sha
  ) {
    refuse(
      'capture artifact identity does not match the trusted source attempt',
    );
  }
  return {
    artifactId: artifact.id,
    runId: id,
    runAttempt: attempt,
    sha: run.head_sha,
  };
}

/**
 * A complete capture may have a failed comparison when the browser changes.
 * Preserve that explicit maintenance recovery without blessing a partial capture
 * or weakening gate.mjs accept's existing failed-verdict pruning restriction.
 */
export function validateVisualMaintenanceCapture({
  manifest,
  verdict,
  sha,
  runId,
  runAttempt,
}) {
  const context = manifest?.context;
  if (
    !/^[0-9a-f]{40}$/.test(sha ?? '') ||
    context?.sha !== sha ||
    context.ref !== 'refs/heads/main' ||
    String(context.runId) !== String(positiveInteger(runId, 'run id')) ||
    String(context.runAttempt) !==
      String(positiveInteger(runAttempt, 'run attempt'))
  ) {
    refuse('capture manifest does not match the resolved source identity');
  }
  const plan = validateReleasePlan(context.releasePlan, manifest);
  if (!plan.keys.length) refuse('canonical capture is empty');
  if (
    verdict?.context?.sha !== context.sha ||
    verdict.context.ref !== context.ref ||
    String(verdict.context.runId) !== String(context.runId) ||
    String(verdict.context.runAttempt) !== String(context.runAttempt) ||
    JSON.stringify(verdict.context.releasePlan) !== JSON.stringify(plan) ||
    !['pass', 'changed', 'failed'].includes(verdict.status)
  ) {
    refuse('capture verdict does not match its canonical source plan');
  }
}
