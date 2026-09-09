#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Activate the required visual-acceptance status without stranding PRs.
 *
 * Dry-run by default. `--apply` derives each open head's scope, backfills
 * no-scope heads as success and stable-visual heads as pending, then requires
 * the context. Re-running only replaces missing or legacy grandfathered states;
 * it never overwrites a verdict produced by the live workflow.
 */

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {classifyVisualScope} from '../visual-scope.mjs';

const REPO = 'facebook/astryx';
const BRANCH = 'main';
const CONTEXT = 'visual-acceptance';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

export function buildActivationPlan(openPulls, requiredContexts) {
  const unique = [...new Map(openPulls.map(pr => [pr.head.sha, pr])).values()];
  const backfill = unique
    .filter(pr => !pr.visualStatus || pr.visualStatus.description.startsWith('Grandfathered during'))
    .map(pr => ({
      number: pr.number,
      sha: pr.head.sha,
      state: pr.hasStableVisual ? 'pending' : 'success',
      description: pr.hasStableVisual
        ? 'Stable visual result pending; rerun CI after activation.'
        : 'No stable visual scope.',
    }));
  return {backfill, addRequiredContext: !requiredContexts.includes(CONTEXT)};
}

function gh(args, input) {
  return execFileSync('gh', ['api', ...args], {
    encoding: 'utf8',
    input: input === undefined ? undefined : JSON.stringify(input),
    maxBuffer: 16 * 1024 * 1024,
  });
}

function paged(endpoint) {
  return JSON.parse(gh([endpoint, '--paginate', '--slurp'])).flat();
}

function headManifests(pr, files) {
  const paths = new Set();
  for (const file of files) {
    const theme = file.match(/^packages\/themes\/([^/]+)\//);
    const pkg = file.match(/^packages\/([^/]+)\//);
    if (theme) paths.add(`packages/themes/${theme[1]}/package.json`);
    else if (pkg) paths.add(`packages/${pkg[1]}/package.json`);
  }
  const manifests = {};
  for (const manifestPath of paths) {
    try {
      const encoded = manifestPath.split('/').map(encodeURIComponent).join('/');
      const response = JSON.parse(
        gh([`repos/${pr.head.repo.full_name}/contents/${encoded}?ref=${pr.head.sha}`]),
      );
      if (!Array.isArray(response) && response.content) {
        manifests[manifestPath] = JSON.parse(Buffer.from(response.content, 'base64').toString());
      }
    } catch (error) {
      if (!String(error.stderr ?? error.message).includes('404')) throw error;
    }
  }
  return manifests;
}

function readState() {
  const pullPages = JSON.parse(
    gh([`repos/${REPO}/pulls?state=open&per_page=100`, '--paginate', '--slurp']),
  );
  const pulls = [];
  for (const pr of pullPages.flat()) {
    const combined = JSON.parse(gh([`repos/${REPO}/commits/${pr.head.sha}/status`]));
    const visualStatus = combined.statuses.find(status => status.context === CONTEXT) ?? null;
    if (visualStatus && !visualStatus.description.startsWith('Grandfathered during')) {
      pulls.push({number: pr.number, head: pr.head, visualStatus, hasStableVisual: false});
      continue;
    }
    const files = paged(`repos/${REPO}/pulls/${pr.number}/files?per_page=100`).map(
      file => file.filename,
    );
    const scope = classifyVisualScope(files, ROOT, headManifests(pr, files));
    pulls.push({...pr, visualStatus, hasStableVisual: scope.hasStableVisual});
  }
  const protection = JSON.parse(
    gh([`repos/${REPO}/branches/${BRANCH}/protection/required_status_checks`]),
  );
  return {pulls, contexts: protection.contexts ?? []};
}

function apply(plan) {
  for (const {sha, number, state, description} of plan.backfill) {
    gh(
      ['--method', 'POST', `repos/${REPO}/statuses/${sha}`, '--input', '-'],
      {state, context: CONTEXT, description: `${description} (PR #${number})`},
    );
  }
  if (plan.addRequiredContext) {
    gh([
      '--method',
      'POST',
      `repos/${REPO}/branches/${BRANCH}/protection/required_status_checks/contexts`,
      '-f',
      `contexts[]=${CONTEXT}`,
    ]);
  }
  const protection = JSON.parse(
    gh([`repos/${REPO}/branches/${BRANCH}/protection/required_status_checks`]),
  );
  if (!(protection.contexts ?? []).includes(CONTEXT)) {
    throw new Error(`${CONTEXT} is still not required on ${BRANCH}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const state = readState();
  const plan = buildActivationPlan(state.pulls, state.contexts);
  process.stdout.write(
    `${JSON.stringify(
      {
        repo: REPO,
        branch: BRANCH,
        context: CONTEXT,
        headsToReconcile: plan.backfill.length,
        pending: plan.backfill.filter(item => item.state === 'pending').length,
        success: plan.backfill.filter(item => item.state === 'success').length,
        addRequiredContext: plan.addRequiredContext,
      },
      null,
      2,
    )}\n`,
  );
  if (process.argv.includes('--apply')) {
    apply(plan);
    process.stdout.write(`Activated required status ${CONTEXT} on ${BRANCH}.\n`);
  } else {
    process.stdout.write('Dry run only; pass --apply to reconcile and activate.\n');
  }
}
