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
  describeOwnerCommandProblem,
  newestGateRun,
  parseOwnerCommand,
  parseOwnerCommandIntent,
  parseOwnerFile,
  parseReadyAttestations,
  requiredApprovalGroups,
  resolveOwnerDecision,
} = require('./spec-owner-decision.cjs');
/* eslint-enable @typescript-eslint/no-require-imports */

function isCommandComment(eventName, payload) {
  if (eventName !== 'issue_comment') return true;
  return parseOwnerCommandIntent(payload.comment?.body) !== null;
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

function ownerCommandHelpMarker(headSha) {
  return `<!-- spec-owner-command-help:${headSha} -->`;
}

function ownerCommandHelpBody({verb, headSha, problem}) {
  return [
    ownerCommandHelpMarker(headSha),
    `That \`/${verb}-spec\` comment did not change \`${GATE_STATUS_CONTEXT}\`: ${problem}.`,
    '',
    'The gate only accepts the exact current head, so post this instead:',
    '',
    `    /${verb}-spec ${headSha}`,
    '',
    'A new commit invalidates the command, so repeat it after any push.',
  ].join('\n');
}

function isSettled(pr) {
  return Boolean(pr.merged_at) || pr.state === 'closed';
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
  // A boolean workflow_dispatch input arrives as a real boolean; a string
  // input arrives as text. Only an explicit true opts in.
  const backfillOnly =
    context.eventName === 'workflow_dispatch' &&
    String(context.payload.inputs?.backfill ?? 'false') === 'true';
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

  /**
   * The freshest possible answer to "may this head still be written at all".
   * A settled or moved head is never writable, whichever run is current: an
   * approval that lands after the merge it claims to gate is not evidence.
   * Any read that throws propagates and nothing is published.
   */
  async function isLiveHeadWritable(headSha) {
    const live = await getPullRequest();
    if (isSettled(live)) {
      core.info(
        'The pull request settled while this run reconciled; leaving the head status as it merged.',
      );
      return false;
    }
    if (live.head.sha !== headSha) {
      core.info(
        'The head moved while this run reconciled; leaving the status to the run for the new head.',
      );
      return false;
    }
    return true;
  }

  /**
   * The last read before a terminal write. GitHub has no conditional status
   * write, so the window cannot be closed — it can only be made as small as
   * one API call and made to fail closed. Read the run currency first and the
   * live pull request last, so the head/settlement facts are the freshest
   * thing known at the moment of the write.
   */
  async function isPublishable(headSha) {
    if (!(await isCurrentRun(headSha))) return false;
    return isLiveHeadWritable(headSha);
  }

  async function restoreNewerStatus(headSha) {
    const newest = await newestRun(headSha);
    if (newest === null || newest.runId <= runId) return false;
    // Yielding is still a write. A newer run's status is no more publishable
    // on a merged or moved head than this run's own would be, so the restore
    // takes the same live guard — and still reports the yield, because this
    // run's claim on the head is over either way.
    if (await isLiveHeadWritable(headSha)) {
      await createStatus({
        sha: headSha,
        context: GATE_STATUS_CONTEXT,
        state: newest.status.state,
        description: newest.status.description,
        targetUrl: newest.status.target_url,
      });
    }
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
    if (isSettled(current)) return null;
    if (!(await isCurrentRun(headSha))) return null;
    return current;
  }

  async function setFinalStatus(headSha, state, description) {
    if (!(await isPublishable(headSha))) return false;
    await createStatus({
      sha: headSha,
      context: GATE_STATUS_CONTEXT,
      state,
      description,
    });
    // The write cannot be undone, so verify what it landed on. A success that
    // raced a merge is reported loudly and stops this run before auto-merge.
    const after = await getPullRequest();
    if (isSettled(after) || after.head.sha !== headSha) {
      core.warning(
        `Published ${state} for ${headSha.slice(0, 7)} as the pull request settled or moved; treat that status as unverified.`,
      );
      return false;
    }
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
  // Nothing about a merged or closed head is still being decided. Reconciling
  // one can only publish a decision that arrives after the merge it claims to
  // gate, so stop before writing any status.
  if (isSettled(initialPr)) {
    core.info(
      'The pull request is already merged or closed; the gate does not rewrite a settled head.',
    );
    return;
  }
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
  // Only a DESIGNOWNER author may self-attest a head, and only for the design
  // approval group (.github/DESIGNOWNERS). A spec or engineering owner marking
  // their own pull request ready is not an approval by anyone else.
  if (
    context.eventName === 'pull_request_target' &&
    context.payload.action === 'ready_for_review' &&
    actor &&
    actor === initialPr.user.login.toLowerCase() &&
    designOwners.includes(actor) &&
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

  // A near-miss owner command used to do nothing at all, so an owner could
  // believe they had approved a head the gate never read. Answer it once per
  // head with the exact command instead of leaving it silent.
  if (context.eventName === 'issue_comment' && commentAuthor) {
    const intent = parseOwnerCommandIntent(context.payload.comment?.body);
    const problem = describeOwnerCommandProblem(intent, initialHead);
    const marker = ownerCommandHelpMarker(initialHead);
    if (problem && !comments.some(entry => entry.body?.includes(marker))) {
      await github.rest.issues.createComment({
        owner,
        repo,
        issue_number: pullNumber,
        body: ownerCommandHelpBody({
          verb: intent.verb,
          headSha: initialHead,
          problem,
        }),
      });
      core.info(
        `Answered an inexact ${intent.verb} command on ${initialHead}.`,
      );
    }
  }

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
    owners: designOwners,
  });
  const decisionInput = {
    reviews,
    comments,
    dismissalEvents: timeline,
    headSha: initialHead,
  };
  // A ready-for-review attestation is the design group's own self-attestation
  // path. It is not evidence for the spec or theme groups, which stay on real
  // exact-head reviews and commands.
  const specDecision = requiredGroups.spec
    ? resolveOwnerDecision({...decisionInput, owners: specOwners})
    : {approved: true, owner: null};
  const designDecision = requiredGroups.design
    ? resolveOwnerDecision({
        ...decisionInput,
        readyAttestations,
        owners: designApprovers,
      })
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

  // A backfill exists to give an old head its missing status before the
  // context becomes required. Landing the pull request is a separate decision
  // its author has not asked this run to make.
  if (backfillOnly) {
    core.info('Backfill run: published the gate status without auto-merge.');
    return;
  }

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
