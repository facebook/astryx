// Copyright (c) Meta Platforms, Inc. and affiliates.

'use strict';
/* global module */

// Trusted helper for review-signal.yml, review-clear.yml, and the spec owner
// gate. The workflows load it from the trusted workflow SHA through the API, so
// keep it dependency-free CommonJS.

function isSafeSpace(filePath) {
  return (
    /^packages\/lab\//.test(filePath) ||
    /^apps\/(sandbox|storybook)\//.test(filePath)
  );
}

function classifyReviewSignalPaths(changedFiles) {
  let hasSafeBoundaryRename = false;
  const files = changedFiles.filter(file => {
    if (
      typeof file.previous_filename === 'string' &&
      isSafeSpace(file.filename) !== isSafeSpace(file.previous_filename)
    ) {
      hasSafeBoundaryRename = true;
    }
    const sides = [file.filename, file.previous_filename].filter(
      value => typeof value === 'string' && value.length > 0,
    );
    return sides.length === 0 || !sides.every(isSafeSpace);
  });
  const paths = [
    ...new Set(
      files.flatMap(file =>
        [file.filename, file.previous_filename].filter(
          value => typeof value === 'string' && value.length > 0,
        ),
      ),
    ),
  ];
  return {files, hasSafeBoundaryRename, paths};
}

function resolveReviewApprovals({reviews, headSha, engOwners, designOwners}) {
  const latestByUser = new Map();
  for (const review of reviews) {
    const login = review.user?.login?.toLowerCase();
    if (
      !login ||
      review.commit_id !== headSha ||
      review.state === 'COMMENTED' ||
      !['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'].includes(review.state)
    ) {
      continue;
    }
    latestByUser.set(login, review.state);
  }

  let codeApproved = false;
  let designApproved = false;
  let codeWithdrawn = false;
  for (const [login, state] of latestByUser) {
    if (state === 'APPROVED') {
      if (engOwners.includes(login)) codeApproved = true;
      if (designOwners.includes(login)) designApproved = true;
      continue;
    }
    if (
      (state === 'CHANGES_REQUESTED' || state === 'DISMISSED') &&
      engOwners.includes(login)
    ) {
      codeWithdrawn = true;
    }
  }
  return {
    codeApproved,
    codeWithdrawn: !codeApproved && codeWithdrawn,
    designApproved,
  };
}

/**
 * Which gate statuses a pull request owns. Commit statuses are keyed by
 * repository, SHA, and context, never by pull request, so a context is shared
 * by every pull request with the same head. The default branch's protection
 * governs a pull request that targets it and every rung of a native stack whose
 * trunk is the default branch; only those publish the required contexts. Any
 * other pull request publishes contexts scoped to its own number, so a
 * decision made against another base never lands on a required context.
 */
function gateScope(pr) {
  const defaultBranch = pr?.base?.repo?.default_branch;
  if (typeof defaultBranch !== 'string' || defaultBranch.length === 0) {
    throw new Error(
      `Could not read the default branch for pull request #${pr?.number}.`,
    );
  }
  const stackTrunk =
    typeof pr.stack?.base?.ref === 'string' ? pr.stack.base.ref : null;
  const targetsDefaultBranch = pr.base.ref === defaultBranch;
  return {
    defaultBranch,
    stackTrunk,
    targetsDefaultBranch,
    governed: targetsDefaultBranch || stackTrunk === defaultBranch,
    // Gate automation lands only a pull request that targets the default
    // branch directly; stacked pull requests merge through their stack.
    autoMergeEligible: targetsDefaultBranch && pr.stack == null,
  };
}

function gateContext(requiredContext, pr) {
  return gateScope(pr).governed
    ? requiredContext
    : `${requiredContext}/stacked-pr-${pr.number}`;
}

/** The facts a gate decision depends on; any change invalidates it. */
function pullIdentity(pr) {
  return {
    number: pr?.number ?? null,
    state: pr?.state ?? null,
    mergedAt: pr?.merged_at ?? null,
    headRepo: pr?.head?.repo?.full_name ?? null,
    headSha: pr?.head?.sha ?? null,
    baseRef: pr?.base?.ref ?? null,
    baseSha: pr?.base?.sha ?? null,
    defaultBranch: pr?.base?.repo?.default_branch ?? null,
    stackTrunk: pr?.stack?.base?.ref ?? null,
  };
}

function samePullIdentity(left, right) {
  const a = pullIdentity(left);
  const b = pullIdentity(right);
  return Object.keys(a).every(key => a[key] === b[key]);
}

/**
 * Other open pull requests that share this head and also read the required
 * contexts. `candidates` are full pull request objects (the list endpoints
 * omit `stack`). When any exist, no single run can decide the shared context.
 */
function governedSiblings(pr, candidates) {
  return candidates
    .filter(
      candidate =>
        candidate.number !== pr.number &&
        candidate.state === 'open' &&
        candidate.head?.sha === pr.head.sha &&
        gateScope(candidate).governed,
    )
    .map(candidate => candidate.number)
    .sort((left, right) => left - right);
}

// Git quotes a path containing a control character, a double quote, a
// backslash, or a non-ASCII byte.
function gitQuotesPath(filePath) {
  return !/^[\x20-\x7e]*$/.test(filePath) || /["\\]/.test(filePath);
}

/**
 * Whether a unified diff describes exactly the listed changed files. The file
 * list and the diff come from separate requests, so a push, a retarget, or an
 * inconsistent response between them would otherwise decide one change from
 * another's content. Every file whose paths git leaves unquoted must have its
 * own `diff --git a/<previous> b/<current>` header (renames and deletions
 * included); files with quoted paths are matched by count against the headers
 * left over, which must all be quoted.
 */
function diffMatchesFiles(diff, files) {
  const remaining = String(diff)
    .split('\n')
    .filter(line => line.startsWith('diff --git '));
  if (remaining.length !== files.length) return false;
  let quotedFiles = 0;
  for (const file of files) {
    const previous = file.previous_filename || file.filename;
    if (gitQuotesPath(previous) || gitQuotesPath(file.filename)) {
      quotedFiles += 1;
      continue;
    }
    const index = remaining.indexOf(
      `diff --git a/${previous} b/${file.filename}`,
    );
    if (index < 0) return false;
    remaining.splice(index, 1);
  }
  return (
    remaining.length === quotedFiles &&
    remaining.every(header => header.includes('"'))
  );
}

/** Whether two changed-file listings describe the same change. */
function sameFileList(left, right) {
  const key = file =>
    [
      file.filename,
      file.previous_filename ?? '',
      file.status,
      file.sha ?? '',
    ].join('\0');
  const a = left.map(key).sort();
  const b = right.map(key).sort();
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

module.exports = {
  classifyReviewSignalPaths,
  diffMatchesFiles,
  gateContext,
  gateScope,
  governedSiblings,
  isSafeSpace,
  pullIdentity,
  resolveReviewApprovals,
  sameFileList,
  samePullIdentity,
};
