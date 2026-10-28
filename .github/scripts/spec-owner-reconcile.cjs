// Copyright (c) Meta Platforms, Inc. and affiliates.

'use strict';
/* global Buffer, module, process, require */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {classifyChanges} = require('./change-scope.cjs');
const {
  DECISION_STATUS_PREFIX,
  GATE_STATUS_CONTEXT,
  READY_STATUS_PREFIX,
  canonicalRunUrl,
  decisionStatusDescription,
  describeOwnerCommandProblem,
  newestGateRun,
  parseDecisionStatuses,
  parseOwnerCommandIntent,
  parseOwnerDecisionDispatch,
  parseAuthority,
  parseKind,
  parseOwnerFile,
  parseReadyAttestations,
  requiredApprovalGroups,
  resolveOwnerDecision,
} = require('./spec-owner-decision.cjs');
const {
  CONTENT_STATUS_CONTEXT,
  approvedDescription,
  contentStatusDescription,
  fingerprintSpecContent,
  parseOwnerCommandTarget,
  readContentClock,
  waitingDescription,
} = require('./spec-owner-content.cjs');
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

function isSpecPath(filePath) {
  const scope = classifyChanges([{filename: filePath}]);
  return scope.touchesKnowledgeRecords || scope.touchesDesignAssets;
}

function formatTime(iso) {
  return new Date(iso).toISOString().replace('.000Z', 'Z');
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
  now = () => new Date(),
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

  const designOwners = parseOwnerFile(
    fs.readFileSync(path.join(workspace, '.github/DESIGNOWNERS'), 'utf8'),
  );
  const engineeringOwners = parseOwnerFile(
    fs.readFileSync(path.join(workspace, '.github/ENGOWNERS'), 'utf8'),
  );
  const allOwners = new Set([...engineeringOwners, ...designOwners]);
  if (!isAuthorizedEvent(context.eventName, context.payload, allOwners)) {
    core.info('Ignoring an event from someone outside the eligible owners.');
    return;
  }

  // A review app may relay an owner's decision as a repository dispatch. It
  // decides the gate exactly like that owner's exact-head command, so it is
  // held to the same eligibility before any API work.
  let relayedDecision = null;
  if (context.eventName === 'repository_dispatch') {
    const relayed = parseOwnerDecisionDispatch(context.payload, {
      appLogin: env.SPEC_DECISION_APP,
    });
    if (relayed.problem) {
      core.info(`Ignoring a relayed owner decision: ${relayed.problem}.`);
      return;
    }
    if (!allOwners.has(relayed.decision.owner)) {
      core.info(
        'Ignoring a relayed decision for someone outside the eligible owners.',
      );
      return;
    }
    relayedDecision = relayed.decision;
  }

  const pullNumber = Number(
    context.payload.pull_request?.number ??
      context.payload.issue?.number ??
      context.payload.inputs?.pr ??
      relayedDecision?.pr,
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

  /** A spec path's text at `ref`, or null when the path is absent there. */
  async function readSpecContent(fullName, ref, filePath) {
    const [repoOwner, repoName] = fullName.split('/');
    try {
      const {data} = await github.rest.repos.getContent({
        owner: repoOwner,
        repo: repoName,
        path: filePath,
        ref,
      });
      if (Array.isArray(data)) return null;
      if (data.content == null) return `blob:${data.sha}`;
      return Buffer.from(data.content, 'base64').toString('utf8');
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  /** When the workflow first recorded this head: its earliest gate status. */
  function headArrival(headStatuses) {
    const times = headStatuses
      .filter(
        status =>
          status.context === GATE_STATUS_CONTEXT &&
          status.creator?.login === 'github-actions[bot]',
      )
      .map(status => status.created_at)
      .filter(time => time && !Number.isNaN(Date.parse(time)))
      .sort();
    return times[0] ?? null;
  }

  /**
   * The content clock of the newest earlier head the workflow recorded, when
   * that head carried the same spec content. Earlier heads are the pull
   * request's commits and the heads a force-push replaced.
   */
  async function carriedContentClock(fingerprint) {
    let earlier = [];
    try {
      const commits = await github.paginate(github.rest.pulls.listCommits, {
        owner,
        repo,
        pull_number: pullNumber,
        per_page: 100,
      });
      earlier = commits.map(commit => commit.sha).reverse();
    } catch (error) {
      core.warning(`Could not list commits: ${error.message}`);
    }
    try {
      const result = await github.graphql(
        `query($owner: String!, $repo: String!, $number: Int!) {
          repository(owner: $owner, name: $repo) {
            pullRequest(number: $number) {
              timelineItems(itemTypes: [HEAD_REF_FORCE_PUSHED_EVENT], last: 20) {
                nodes { ... on HeadRefForcePushedEvent { beforeCommit { oid } } }
              }
            }
          }
        }`,
        {owner, repo, number: pullNumber},
      );
      const replaced =
        result?.repository?.pullRequest?.timelineItems?.nodes ?? [];
      earlier.push(
        ...replaced
          .map(node => node?.beforeCommit?.oid)
          .filter(Boolean)
          .reverse(),
      );
    } catch (error) {
      core.warning(`Could not read force-pushes: ${error.message}`);
    }
    const seen = new Set([initialHead.toLowerCase()]);
    for (const sha of earlier.slice(0, 30)) {
      if (seen.has(sha.toLowerCase())) continue;
      seen.add(sha.toLowerCase());
      const earlierStatuses = await listStatuses(sha);
      if (
        !earlierStatuses.some(
          status =>
            status.context === CONTENT_STATUS_CONTEXT &&
            status.creator?.login === 'github-actions[bot]',
        )
      ) {
        continue;
      }
      return readContentClock(earlierStatuses, fingerprint);
    }
    return null;
  }

  /** The newest eligible approval that no longer counts, for the details. */
  function latestStaleApproval({
    reviews: ownerReviews,
    comments: allComments,
    owners: eligible,
    approvesCurrentContent,
    postedAfterContent,
  }) {
    const stale = [];
    for (const review of ownerReviews) {
      if (review.state !== 'APPROVED') continue;
      if (approvesCurrentContent(review.commit_id)) continue;
      stale.push(review.submitted_at);
    }
    for (const comment of allComments) {
      if (!eligible.has(comment.user?.login?.toLowerCase() ?? '')) continue;
      const target = parseOwnerCommandTarget(comment.body);
      if (!target?.approved) continue;
      const counts = target.sha
        ? approvesCurrentContent(target.sha)
        : postedAfterContent(comment);
      if (!counts) stale.push(comment.created_at);
    }
    return stale.filter(Boolean).sort().at(-1) ?? null;
  }

  /** The gate's details: the run summary its status links to. */
  async function writeDetails({
    statusText,
    records: changedRecords,
    requiredGroups: groups,
    currentContent,
    contentSince,
    staleApprovalAt,
    commandProblem,
  }) {
    if (typeof core.summary?.addRaw !== 'function') return;
    const groupFor = record => {
      const authority = parseAuthority(record.headContent, record.path);
      if (
        authority !== 'current' &&
        parseAuthority(record.baseContent, record.previousPath) !== 'current'
      ) {
        return 'none (draft)';
      }
      const kind = parseKind(
        record.headContent ?? record.baseContent,
        record.path,
      );
      return kind === 'design' || kind === 'theme'
        ? 'design or eng owner'
        : 'eng owner';
    };
    const rows = changedRecords.map(record => {
      const text = record.headContent ?? record.baseContent ?? '';
      const id = text.match(/^id:\s*(.+)$/m)?.[1]?.trim() ?? record.path;
      const title = text.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? '';
      const before =
        record.baseContent == null
          ? 'new'
          : (parseAuthority(record.baseContent, record.previousPath) ?? '?');
      const after =
        record.headContent == null
          ? 'removed'
          : (parseAuthority(record.headContent, record.path) ?? '?');
      const change = before === after ? after : `${before} → ${after}`;
      return `| \`${id}\` | ${title} | ${change} | ${groupFor(record)} |`;
    });
    const lines = [`### ${statusText}`, ''];
    if (staleApprovalAt) {
      lines.push(
        `Spec changed after approval at ${formatTime(staleApprovalAt)}; reply \`/spec ok\` again.`,
        '',
      );
    }
    if (commandProblem) {
      lines.push(`Your owner command decided nothing: ${commandProblem}.`, '');
    }
    if (groups.spec || groups.design || groups.theme) {
      lines.push(
        'Approve with a comment on the pull request:',
        '',
        '```',
        '/spec ok',
        '```',
        '',
      );
    }
    lines.push(
      '| Record | Title | Authority | Needs approval from |',
      '| --- | --- | --- | --- |',
      ...rows,
      '',
      '<details><summary>Changed spec paths and content fingerprint</summary>',
      '',
      ...Object.keys(currentContent.files).map(filePath => `- \`${filePath}\``),
      '',
      `Fingerprint \`${currentContent.fingerprint}\`, unchanged since ${formatTime(contentSince)}. Commits that leave these paths' text unchanged (other paths, merges from main, rebases, the draft → current flip) keep an approval.`,
      '',
      '</details>',
    );
    try {
      await core.summary.addRaw(lines.join('\n')).write();
    } catch (error) {
      core.warning(`Could not write the gate details: ${error.message}`);
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
  // approval group (.github/DESIGNOWNERS). An engineering owner marking their
  // own pull request ready is not an approval by anyone else.
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

  if (relayedDecision && relayedDecision.headSha !== initialHead) {
    core.info(
      `The relayed decision names ${relayedDecision.headSha.slice(0, 7)}, which is not the current head; it decides nothing.`,
    );
  } else if (relayedDecision) {
    await createStatus({
      sha: initialHead,
      context: `${DECISION_STATUS_PREFIX}${relayedDecision.owner}`,
      state: relayedDecision.approved ? 'success' : 'failure',
      description: decisionStatusDescription({
        approved: relayedDecision.approved,
        at: now().toISOString(),
        requestKey: relayedDecision.requestKey,
      }),
    });
    if (!relayedDecision.approved) await disableAutoMerge(initialPr);
  }

  const commentAuthor = context.payload.comment?.user?.login?.toLowerCase();
  const reviewAuthor = context.payload.review?.user?.login?.toLowerCase();
  const explicitRevoke =
    context.eventName === 'issue_comment' &&
    commentAuthor &&
    allOwners.has(commentAuthor) &&
    parseOwnerCommandTarget(context.payload.comment.body ?? '')?.approved ===
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

  // A malformed owner command decides nothing. Say why in the gate's
  // details rather than in another pull-request comment.
  const commandProblem =
    context.eventName === 'issue_comment' && commentAuthor
      ? describeOwnerCommandProblem(
          parseOwnerCommandIntent(context.payload.comment?.body),
        )
      : null;

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

  const requiredGroups = requiredApprovalGroups(records, {
    complete: scope.complete,
    touchesDesignAssets: scope.touchesDesignAssets,
  });
  const ownerApprovalRequired =
    requiredGroups.spec || requiredGroups.design || requiredGroups.theme;
  if (requiredGroups.spec && engineeringOwners.length === 0) {
    throw new Error('No ENGOWNERS are configured.');
  }
  if (
    (requiredGroups.design || requiredGroups.theme) &&
    engineeringOwners.length === 0 &&
    designOwners.length === 0
  ) {
    throw new Error('No ENGOWNERS or DESIGNOWNERS are configured.');
  }
  const designApprovers = [...new Set([...engineeringOwners, ...designOwners])];
  const themeApprovers = [...new Set([...engineeringOwners, ...designOwners])];
  const readyAttestations = parseReadyAttestations(statuses, {
    repository,
    headSha: initialHead,
    owners: designOwners,
  });
  const relayedDecisions = parseDecisionStatuses(statuses, {
    repository,
    headSha: initialHead,
    owners: [...allOwners],
  });

  // --- The spec content an approval binds (DEC-14). ---
  const specPaths = [
    ...new Set(
      snapshot.files.flatMap(file =>
        [file.filename, file.previous_filename].filter(
          filePath => filePath && isSpecPath(filePath),
        ),
      ),
    ),
  ].sort();
  const contentBySha = new Map();
  async function specContentAt(sha) {
    const key = sha.toLowerCase();
    if (!contentBySha.has(key)) {
      const entries = await Promise.all(
        specPaths.map(async filePath => ({
          path: filePath,
          content: await readSpecContent(pr.head.repo.full_name, sha, filePath),
        })),
      );
      contentBySha.set(key, fingerprintSpecContent(entries));
    }
    return contentBySha.get(key);
  }
  const currentContent = await specContentAt(initialHead);
  const contentSince =
    readContentClock(statuses, currentContent.fingerprint) ??
    (await carriedContentClock(currentContent.fingerprint)) ??
    headArrival(statuses) ??
    now().toISOString();
  const contentDescription = contentStatusDescription(
    currentContent.fingerprint,
    contentSince,
  );
  if (
    !statuses.some(
      status =>
        status.context === CONTENT_STATUS_CONTEXT &&
        status.description === contentDescription,
    )
  ) {
    await createStatus({
      sha: initialHead,
      context: CONTENT_STATUS_CONTEXT,
      state: 'success',
      description: contentDescription,
    });
  }

  // A review or a SHA command approves the content of its commit. Only
  // commits an eligible owner named are read.
  const authorLogin = pr.user.login.toLowerCase();
  const ownerReviews = reviews.filter(review => {
    const login = review.user?.login?.toLowerCase();
    // GitHub refuses an author's approving review; never count one anyway.
    return login && login !== authorLogin && allOwners.has(login);
  });
  const namedShas = new Set([
    ...ownerReviews.map(review => review.commit_id?.toLowerCase()),
    ...comments
      .filter(comment =>
        allOwners.has(comment.user?.login?.toLowerCase() ?? ''),
      )
      .map(comment => parseOwnerCommandTarget(comment.body)?.sha),
  ]);
  const sameContent = new Set([initialHead.toLowerCase()]);
  for (const sha of [...namedShas].filter(Boolean).slice(0, 20)) {
    if (sameContent.has(sha)) continue;
    const content = await specContentAt(sha);
    if (content.fingerprint === currentContent.fingerprint) {
      sameContent.add(sha);
    }
  }
  const approvesCurrentContent = sha =>
    sha != null && sameContent.has(sha.toLowerCase());
  const postedAfterContent = comment =>
    Date.parse(comment.created_at) >= Date.parse(contentSince);

  const decisionInput = {
    reviews: ownerReviews,
    comments,
    relayedDecisions,
    dismissalEvents: timeline,
    headSha: initialHead,
    approvesCurrentContent,
    postedAfterContent,
  };
  // A ready-for-review attestation is the design group's own self-attestation
  // path. It is not evidence for the non-design or theme groups.
  const specDecision = requiredGroups.spec
    ? resolveOwnerDecision({...decisionInput, owners: engineeringOwners})
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
  const missingGroups = {
    spec: !specDecision.approved,
    design: !designDecision.approved,
    theme: !themeDecision.approved,
  };
  const statusText =
    ownerApprovalRequired && !approved
      ? waitingDescription(missingGroups)
      : ownerApprovalRequired
        ? approvedDescription(approvingOwners)
        : 'Draft-only knowledge change; owner approval is not required.';
  await writeDetails({
    statusText,
    records,
    requiredGroups,
    currentContent,
    contentSince,
    staleApprovalAt: approved
      ? null
      : latestStaleApproval({
          reviews: ownerReviews,
          comments,
          owners: allOwners,
          approvesCurrentContent,
          postedAfterContent,
        }),
    commandProblem,
  });

  if (ownerApprovalRequired && !approved) {
    await disableAutoMerge(pr);
    if (!(await isCurrentRun(initialHead))) return;
    await ensureLabel(
      pr,
      env.REVIEW_LABEL,
      'd4c5f9',
      'Current knowledge records await owner approval',
    );
    await setFinalStatus(initialHead, 'pending', statusText);
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

  const successDescription = statusText;

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
