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
  parseOwnerCommandIntent,
  parseAuthority,
  parseKind,
  parseOwnerFile,
  parseReadyAttestations,
  requiredApprovalGroups,
  resolveOwnerDecision,
} = require('./spec-owner-decision.cjs');
const {
  approvedDescription,
  fingerprintSpecContent,
  mirrorDescription,
  parseOwnerCommandTarget,
  waitingDescription,
} = require('./spec-owner-content.cjs');
const {
  REVIEW_GATE_CONTEXT,
  composeReviewGate,
  readCodeGate,
} = require('./review-signal-decision.cjs');
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

  /**
   * Publish the spec decision: `spec-owner-approval` as a mirror, then the
   * one review gate composed with the code review. `text` is what a
   * contributor reads on the review gate.
   */
  // The owners whose approval decided the gate, once the decision is known.
  let approvedBy = [];
  async function setFinalStatus(headSha, state, text, missing = null) {
    const approvers = state === 'success' ? approvedBy : [];
    if (!(await isPublishable(headSha))) return false;
    await createStatus({
      sha: headSha,
      context: GATE_STATUS_CONTEXT,
      state,
      description: mirrorDescription({state, missing, approvers}),
    });
    await publishReviewGate(headSha, {
      satisfied: state === 'success',
      text: state === 'success' && approvers.length === 0 ? null : text,
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

  /**
   * What the details say about earlier owner acts: the newest approval whose
   * spec content no longer matches, and a standing revocation.
   */
  function ownerActNotes({
    reviews: ownerReviews,
    comments: allComments,
    owners: eligible,
    approvesCurrentContent,
  }) {
    const stale = [];
    const latestByOwner = new Map();
    for (const review of ownerReviews) {
      if (
        review.state === 'APPROVED' &&
        !approvesCurrentContent(review.commit_id)
      ) {
        stale.push(review.submitted_at);
      }
    }
    for (const comment of allComments) {
      const login = comment.user?.login?.toLowerCase() ?? '';
      if (!eligible.has(login)) continue;
      const target = parseOwnerCommandTarget(comment.body);
      if (!target) continue;
      if (target.approved && !approvesCurrentContent(target.sha)) {
        stale.push(comment.created_at);
      }
      const previous = latestByOwner.get(login);
      if (
        !previous ||
        Date.parse(comment.created_at) >= Date.parse(previous.at)
      ) {
        latestByOwner.set(login, {
          approved: target.approved,
          at: comment.created_at,
        });
      }
    }
    const revoked = [...latestByOwner.entries()]
      .filter(([, act]) => act.approved === false)
      .sort((x, y) => Date.parse(y[1].at) - Date.parse(x[1].at))[0];
    return {
      staleApprovalAt: stale.filter(Boolean).sort().at(-1) ?? null,
      revokedBy: revoked ? {owner: revoked[0], at: revoked[1].at} : null,
    };
  }

  /** The gate's details: the run summary its statuses link to. */
  async function writeDetails({
    statusText,
    headSha,
    approvalRequired,
    approved: isApproved,
    records: changedRecords,
    currentContent,
    notes,
    commandProblem,
  }) {
    if (typeof core.summary?.addRaw !== 'function') return;
    const groupFor = record => {
      const current =
        parseAuthority(record.headContent, record.path) === 'current' ||
        parseAuthority(record.baseContent, record.previousPath) === 'current';
      if (!current) return 'none (draft)';
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
    // `<sha>` in the status text is literal, not markup.
    const lines = [`### ${statusText.replace(/</g, '&lt;')}`, ''];
    if (!isApproved && notes.revokedBy) {
      lines.push(
        `Approval revoked by @${notes.revokedBy.owner} at ${formatTime(notes.revokedBy.at)}.`,
        '',
      );
    } else if (!isApproved && notes.staleApprovalAt) {
      lines.push(
        `Spec changed after approval at ${formatTime(notes.staleApprovalAt)}; approve the current head again.`,
        '',
      );
    }
    if (commandProblem) {
      lines.push(`Your owner command decided nothing: ${commandProblem}.`, '');
    }
    if (approvalRequired && !isApproved) {
      lines.push(
        'Approve the current spec text with a comment on the pull request:',
        '',
        '```',
        `/approve-spec ${headSha}`,
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
      `Fingerprint \`${currentContent.fingerprint}\`. An approval of any commit with this fingerprint counts, so commits that leave these paths' text unchanged (other paths, merges from main, rebases, the draft → current flip) keep it.`,
      '',
      '</details>',
    );
    try {
      await core.summary.addRaw(lines.join('\n')).write();
    } catch (error) {
      core.warning(`Could not write the gate details: ${error.message}`);
    }
  }

  /**
   * Compose the one review gate a contributor sees from the code half that
   * review-signal published and this run's spec decision. With no code half
   * yet, review-signal composes it when it publishes.
   */
  async function publishReviewGate(headSha, spec) {
    const live = await listStatuses(headSha);
    const code = readCodeGate(live);
    if (!code) return;
    const gate = composeReviewGate({
      codeGated: code.gated,
      codeDescription: code.description,
      spec,
    });
    const current = live.find(status => status.context === REVIEW_GATE_CONTEXT);
    if (
      current?.state === gate.state &&
      current?.description === gate.description
    ) {
      return;
    }
    if (!(await isLiveHeadWritable(headSha))) return;
    await createStatus({
      sha: headSha,
      context: REVIEW_GATE_CONTEXT,
      state: gate.state,
      description: gate.description,
    });
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

  const decisionInput = {
    reviews: ownerReviews,
    comments,
    dismissalEvents: timeline,
    headSha: initialHead,
    approvesCurrentContent,
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
    headSha: initialHead,
    approvalRequired: ownerApprovalRequired,
    approved,
    records,
    currentContent,
    notes: ownerActNotes({
      reviews: ownerReviews,
      comments,
      owners: allOwners,
      approvesCurrentContent,
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
    await setFinalStatus(initialHead, 'pending', statusText, missingGroups);
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
  approvedBy = ownerApprovalRequired ? approvingOwners : [];

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
