// Copyright (c) Meta Platforms, Inc. and affiliates.

'use strict';
/* global Buffer, module, process, require */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {classifyChanges} = require('./change-scope.cjs');
const {
  GATE_STATUS_CONTEXT,
  READY_STATUS_PREFIX,
  canonicalRunUrl,
  newestGateRun,
  parseOwnerCommand,
  parseOwnerFile,
  parseReadyAttestations,
  requiredApprovalGroups,
  resolveOwnerDecision,
} = require('./spec-owner-decision.cjs');
/* eslint-enable @typescript-eslint/no-require-imports */

function isCommandComment(eventName, payload) {
  if (eventName !== 'issue_comment') return true;
  return /^\/(approve|revoke)-spec [0-9a-f]{40}$/i.test(
    payload.comment?.body?.trim() ?? '',
  );
}

function isAuthorizedEvent(eventName, payload, owners) {
  if (eventName === 'issue_comment') {
    const login = payload.comment?.user?.login?.toLowerCase();
    return Boolean(
      login && owners.has(login) && isCommandComment(eventName, payload),
    );
  }
  if (eventName === 'pull_request_review') {
    const login = payload.review?.user?.login?.toLowerCase();
    return Boolean(login && owners.has(login));
  }
  return true;
}

function labelNames(pr) {
  return new Set(pr.labels.map(label => label.name));
}

async function reconcileSpecOwnerGate({
  github,
  context,
  core,
  workspace = process.env.GITHUB_WORKSPACE,
  env = process.env,
}) {
  const {owner, repo} = context.repo;
  const repository = `${owner}/${repo}`;
  if (
    context.eventName === 'pull_request_review' &&
    context.payload.pull_request?.head?.repo?.full_name !== repository
  ) {
    core.info(
      'Skipping fork pull request review; use an exact-head owner command to reconcile.',
    );
    return;
  }

  const specOwners = env.SPEC_OWNERS.split(',').map(ownerName =>
    ownerName.toLowerCase(),
  );
  const designOwners = parseOwnerFile(
    fs.readFileSync(path.join(workspace, '.github/DESIGNOWNERS'), 'utf8'),
  );
  const engineeringOwners = parseOwnerFile(
    fs.readFileSync(path.join(workspace, '.github/ENGOWNERS'), 'utf8'),
  );
  const allOwners = new Set([
    ...specOwners,
    ...engineeringOwners,
    ...designOwners,
  ]);
  if (!isAuthorizedEvent(context.eventName, context.payload, allOwners)) {
    core.info('Ignoring an event from someone outside the eligible owners.');
    return;
  }

  const pullNumber = Number(
    context.payload.pull_request?.number ??
      context.payload.issue?.number ??
      context.payload.inputs?.pr,
  );
  if (!pullNumber) {
    throw new Error('Could not resolve a pull request number.');
  }

  const runId = BigInt(String(context.runId));
  const runUrl = canonicalRunUrl(
    repository,
    String(context.runId),
    String(context.runAttempt),
  );

  async function getPullRequest() {
    const {data} = await github.rest.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
    });
    return data;
  }

  async function listStatuses(headSha) {
    return github.paginate(github.rest.repos.listCommitStatusesForRef, {
      owner,
      repo,
      ref: headSha,
      per_page: 100,
    });
  }

  async function createStatus({
    sha,
    context: statusContext,
    state,
    description,
    targetUrl = runUrl,
  }) {
    await github.rest.repos.createCommitStatus({
      owner,
      repo,
      sha,
      context: statusContext,
      state,
      description: description.slice(0, 140),
      target_url: targetUrl,
    });
  }

  async function newestRun(headSha) {
    return newestGateRun(await listStatuses(headSha), repository);
  }

  async function restoreNewerStatus(headSha) {
    const newest = await newestRun(headSha);
    if (newest === null || newest.runId <= runId) return false;
    await createStatus({
      sha: headSha,
      context: GATE_STATUS_CONTEXT,
      state: newest.status.state,
      description: newest.status.description,
      targetUrl: newest.status.target_url,
    });
    core.info(
      `Run ${context.runId} yielded to newer run ${newest.runId.toString()}.`,
    );
    return true;
  }

  async function isCurrentRun(headSha) {
    const newest = await newestRun(headSha);
    return newest === null || newest.runId <= runId;
  }

  async function currentPullForRun(headSha) {
    const current = await getPullRequest();
    if (current.head.sha !== headSha) return null;
    if (!(await isCurrentRun(headSha))) return null;
    return current;
  }

  async function setFinalStatus(headSha, state, description) {
    if (!(await isCurrentRun(headSha))) return false;
    await createStatus({
      sha: headSha,
      context: GATE_STATUS_CONTEXT,
      state,
      description,
    });
    return !(await restoreNewerStatus(headSha));
  }

  async function removeLabel(name) {
    try {
      await github.rest.issues.removeLabel({
        owner,
        repo,
        issue_number: pullNumber,
        name,
      });
    } catch (error) {
      if (error.status !== 404) throw error;
    }
  }

  async function ensureLabel(pr, name, color, description) {
    try {
      await github.rest.issues.getLabel({owner, repo, name});
    } catch (error) {
      if (error.status !== 404) throw error;
      try {
        await github.rest.issues.createLabel({
          owner,
          repo,
          name,
          color,
          description,
        });
      } catch (createError) {
        if (createError.status !== 422) throw createError;
      }
    }
    if (!labelNames(pr).has(name)) {
      await github.rest.issues.addLabels({
        owner,
        repo,
        issue_number: pullNumber,
        labels: [name],
      });
    }
  }

  async function disableAutoMerge(pr, {requireOwnership = true} = {}) {
    if (requireOwnership && !labelNames(pr).has(env.AUTO_MERGE_LABEL)) {
      return;
    }
    if (pr.auto_merge) {
      await github.graphql(
        `mutation($id: ID!) {
          disablePullRequestAutoMerge(input: {pullRequestId: $id}) {
            pullRequest { number }
          }
        }`,
        {id: pr.node_id},
      );
    }
    await removeLabel(env.AUTO_MERGE_LABEL);
  }

  async function readText(fullName, ref, filePath) {
    const [repoOwner, repoName] = fullName.split('/');
    try {
      const {data} = await github.rest.repos.getContent({
        owner: repoOwner,
        repo: repoName,
        path: filePath,
        ref,
      });
      if (Array.isArray(data) || !data.content) {
        throw new Error(
          `Knowledge record ${filePath} could not be read as text.`,
        );
      }
      return Buffer.from(data.content, 'base64').toString('utf8');
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async function fetchSnapshot() {
    const before = await getPullRequest();
    const headSha = before.head.sha;
    const [files, reviews, comments, timeline, statuses] = await Promise.all([
      github.paginate(github.rest.pulls.listFiles, {
        owner,
        repo,
        pull_number: pullNumber,
        per_page: 100,
      }),
      github.paginate(github.rest.pulls.listReviews, {
        owner,
        repo,
        pull_number: pullNumber,
        per_page: 100,
      }),
      github.paginate(github.rest.issues.listComments, {
        owner,
        repo,
        issue_number: pullNumber,
        per_page: 100,
      }),
      github.paginate(github.rest.issues.listEventsForTimeline, {
        owner,
        repo,
        issue_number: pullNumber,
        per_page: 100,
      }),
      listStatuses(headSha),
    ]);
    const after = await getPullRequest();
    if (after.head.sha !== headSha) return null;

    const scope = classifyChanges(files, {expectedCount: after.changed_files});
    const knowledgeChanges = files.filter(
      file =>
        scope.complete &&
        (classifyChanges([{filename: file.filename}]).touchesKnowledgeRecords ||
          (file.previous_filename &&
            classifyChanges([{filename: file.previous_filename}])
              .touchesKnowledgeRecords)),
    );
    const records = await Promise.all(
      knowledgeChanges.map(async file => {
        const previousPath = file.previous_filename || file.filename;
        const baseIsTextRecord = previousPath.endsWith('.md');
        const headIsTextRecord = file.filename.endsWith('.md');
        return {
          path: file.filename,
          previousPath,
          baseContent:
            !baseIsTextRecord || file.status === 'added'
              ? null
              : await readText(
                  after.base.repo.full_name,
                  after.base.sha,
                  previousPath,
                ),
          headContent:
            !headIsTextRecord || file.status === 'removed'
              ? null
              : await readText(
                  after.head.repo.full_name,
                  after.head.sha,
                  file.filename,
                ),
        };
      }),
    );
    const latest = await getPullRequest();
    if (latest.head.sha !== headSha) return null;
    return {
      pr: latest,
      files,
      reviews,
      comments,
      timeline,
      statuses,
      scope,
      records,
    };
  }

  const initialPr = await getPullRequest();
  const initialHead = initialPr.head.sha;
  await createStatus({
    sha: initialHead,
    context: GATE_STATUS_CONTEXT,
    state: 'pending',
    description: `Reconciling exact head ${initialHead.slice(0, 7)}.`,
  });
  if (await restoreNewerStatus(initialHead)) return;

  const actor = context.actor?.toLowerCase();
  const eventHead = context.payload.pull_request?.head?.sha;
  const eventTime = context.payload.pull_request?.updated_at;
  if (
    context.eventName === 'pull_request_target' &&
    context.payload.action === 'ready_for_review' &&
    actor &&
    actor === initialPr.user.login.toLowerCase() &&
    allOwners.has(actor) &&
    eventHead === initialHead &&
    eventTime &&
    !Number.isNaN(Date.parse(eventTime))
  ) {
    await createStatus({
      sha: initialHead,
      context: `${READY_STATUS_PREFIX}${actor}`,
      state: 'success',
      description: `Owner ready at ${new Date(eventTime).toISOString()}.`,
    });
  }

  const commentAuthor = context.payload.comment?.user?.login?.toLowerCase();
  const reviewAuthor = context.payload.review?.user?.login?.toLowerCase();
  const explicitRevoke =
    context.eventName === 'issue_comment' &&
    commentAuthor &&
    allOwners.has(commentAuthor) &&
    parseOwnerCommand(context.payload.comment.body ?? '', initialHead) ===
      false;
  const currentReviewDismissal =
    context.eventName === 'pull_request_review' &&
    context.payload.action === 'dismissed' &&
    reviewAuthor &&
    allOwners.has(reviewAuthor) &&
    context.payload.review.commit_id === initialHead;
  if (explicitRevoke || currentReviewDismissal) {
    await disableAutoMerge(initialPr);
  }

  const snapshot = await fetchSnapshot();
  if (snapshot === null || snapshot.pr.head.sha !== initialHead) {
    core.info(
      'The pull request head changed while this run was reading state.',
    );
    return;
  }
  if (!(await isCurrentRun(initialHead))) {
    core.info(`Run ${context.runId} yielded before mutation.`);
    return;
  }

  const {pr, scope, records, reviews, comments, timeline, statuses} = snapshot;
  if (!scope.touchesKnowledgeRecords) {
    await disableAutoMerge(pr);
    await removeLabel(env.REVIEW_LABEL);
    await setFinalStatus(
      initialHead,
      'success',
      'No knowledge records changed.',
    );
    return;
  }

  if (scope.specOnly) {
    await createStatus({
      sha: initialHead,
      context: 'visual-acceptance',
      state: 'success',
      description: 'Spec-only change — no visual scope.',
    });
  }

  const requiredGroups = requiredApprovalGroups(records, {
    complete: scope.complete,
    touchesDesignAssets: scope.touchesDesignAssets,
  });
  const ownerApprovalRequired =
    requiredGroups.spec || requiredGroups.design || requiredGroups.theme;
  if (requiredGroups.design && designOwners.length === 0) {
    throw new Error('No DESIGNOWNERS are configured.');
  }
  if (
    requiredGroups.theme &&
    engineeringOwners.length === 0 &&
    designOwners.length === 0
  ) {
    throw new Error('No ENGOWNERS or DESIGNOWNERS are configured.');
  }
  const designApprovers = [...new Set([...specOwners, ...designOwners])];
  const themeApprovers = [...new Set([...engineeringOwners, ...designOwners])];
  const readyAttestations = parseReadyAttestations(statuses, {
    repository,
    headSha: initialHead,
  });
  const decisionInput = {
    reviews,
    comments,
    readyAttestations,
    dismissalEvents: timeline,
    headSha: initialHead,
  };
  const specDecision = requiredGroups.spec
    ? resolveOwnerDecision({...decisionInput, owners: specOwners})
    : {approved: true, owner: null};
  const designDecision = requiredGroups.design
    ? resolveOwnerDecision({...decisionInput, owners: designApprovers})
    : {approved: true, owner: null};
  const themeDecision = requiredGroups.theme
    ? resolveOwnerDecision({...decisionInput, owners: themeApprovers})
    : {approved: true, owner: null};
  const approved =
    specDecision.approved && designDecision.approved && themeDecision.approved;
  const approvingOwners = [
    specDecision.owner,
    designDecision.owner,
    themeDecision.owner,
  ]
    .filter(Boolean)
    .filter((ownerName, index, owners) => owners.indexOf(ownerName) === index);
  const requiredOwnerDescription = [
    requiredGroups.spec ? `a spec owner (${specOwners.join(',')})` : null,
    requiredGroups.design
      ? `a design approver (${designApprovers.join(',')})`
      : null,
    requiredGroups.theme
      ? `a theme approver (${themeApprovers.join(',')})`
      : null,
  ]
    .filter(Boolean)
    .join(' and ');

  if (ownerApprovalRequired && !approved) {
    await disableAutoMerge(pr);
    if (!(await isCurrentRun(initialHead))) return;
    await ensureLabel(
      pr,
      env.REVIEW_LABEL,
      'd4c5f9',
      'Current knowledge records await owner approval',
    );
    await setFinalStatus(
      initialHead,
      'pending',
      `Waiting for ${requiredOwnerDescription} on ${initialHead.slice(0, 7)}.`,
    );
    return;
  }

  if (pr.draft) {
    await disableAutoMerge(pr);
    if (!(await isCurrentRun(initialHead))) return;
    await removeLabel(env.REVIEW_LABEL);
    await setFinalStatus(
      initialHead,
      'success',
      'Draft PR; owner gate is not blocking.',
    );
    return;
  }

  const successDescription = ownerApprovalRequired
    ? `Approved by ${approvingOwners
        .map(name => `@${name}`)
        .join(' and ')} for ${initialHead.slice(0, 7)}.`
    : 'Draft-only knowledge change; owner approval is not required.';

  if (!scope.specOnly) {
    await disableAutoMerge(pr);
    if (!(await isCurrentRun(initialHead))) return;
    await removeLabel(env.REVIEW_LABEL);
    await setFinalStatus(initialHead, 'success', successDescription);
    return;
  }

  // Owner approval is the gate decision; auto-merge is an optional convenience.
  // Publish the truthful terminal status first so an integration permission
  // failure cannot leave an approved head stuck on "Reconciling".
  if (!(await setFinalStatus(initialHead, 'success', successDescription))) {
    return;
  }
  await removeLabel(env.REVIEW_LABEL);

  let enabledAutoMergeByThisRun = false;
  if (!pr.auto_merge) {
    const beforeEnable = await currentPullForRun(initialHead);
    if (beforeEnable === null || beforeEnable.auto_merge) return;
    await ensureLabel(
      beforeEnable,
      env.AUTO_MERGE_LABEL,
      'bfdadc',
      'Auto-merge was enabled by the spec owner gate',
    );
    const afterLabel = await currentPullForRun(initialHead);
    if (afterLabel === null || afterLabel.auto_merge) return;
    try {
      await github.graphql(
        `mutation($id: ID!, $oid: GitObjectID!) {
          enablePullRequestAutoMerge(input: {
            pullRequestId: $id,
            mergeMethod: SQUASH,
            expectedHeadOid: $oid
          }) {
            pullRequest { number }
          }
        }`,
        {id: pr.node_id, oid: initialHead},
      );
      enabledAutoMergeByThisRun = true;
      core.info(`Enabled squash auto-merge for spec-only PR #${pullNumber}.`);
    } catch (error) {
      // Leave the conservative ownership marker intact. The failure may be an
      // ambiguous response after a successful enable, or a newer run for the
      // same or a newer head may already be using the global marker. A stale
      // marker with auto-merge off is harmless: later reconciliation observes the real PR
      // state and can retry or remove it without racing a newer owner.
      core.warning(`Could not enable auto-merge: ${error.message}`);
      return;
    }
  }

  if (enabledAutoMergeByThisRun) {
    const afterEnable = await newestRun(initialHead);
    if (
      afterEnable !== null &&
      afterEnable.runId > runId &&
      afterEnable.status.state !== 'success'
    ) {
      await disableAutoMerge(await getPullRequest(), {
        requireOwnership: false,
      });
      return;
    }
  }
}

module.exports = {isCommandComment, reconcileSpecOwnerGate};
