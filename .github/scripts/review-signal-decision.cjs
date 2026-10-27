// Copyright (c) Meta Platforms, Inc. and affiliates.

'use strict';
/* global module */

// Trusted-base helper for review-signal.yml. Keep dependency-free CommonJS.

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

// GitHub's collaborator-permission API reports `admin`, `write`, `read`, or
// `none`; maintain and custom write-based roles report `write`. Anything else,
// including a missing or malformed response, is not write access.
function hasWritePermission(permissionResponse) {
  const permission = permissionResponse?.permission;
  return permission === 'admin' || permission === 'write';
}

// The review app is configured by its exact GitHub login (for example
// `name[bot]`). An unset or malformed value disables the review-app path.
function normalizeReviewApp(value) {
  const login = String(value ?? '')
    .trim()
    .toLowerCase();
  return /^[a-z0-9][a-z0-9-]*\[bot\]$/.test(login) ? login : '';
}

function resolveReviewApprovals({
  reviews,
  headSha,
  engOwners,
  designOwners,
  reviewApp = '',
  authorHasWrite = false,
}) {
  const app = normalizeReviewApp(reviewApp);
  const latestByUser = new Map();
  let appState = null;
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
    if (app && login === app) {
      // Only the app itself can author a review under its `[bot]` login, but
      // also require GitHub's Bot account type so a lookalike never counts.
      if (review.user?.type === 'Bot') appState = review.state;
      continue;
    }
    latestByUser.set(login, review.state);
  }

  let ownerApproved = false;
  let designApproved = false;
  let ownerWithdrawn = false;
  for (const [login, state] of latestByUser) {
    if (state === 'APPROVED') {
      if (engOwners.includes(login)) ownerApproved = true;
      if (designOwners.includes(login)) designApproved = true;
      continue;
    }
    if (
      (state === 'CHANGES_REQUESTED' || state === 'DISMISSED') &&
      engOwners.includes(login)
    ) {
      ownerWithdrawn = true;
    }
  }

  // The review app decides the engineering gate only for a write-access
  // author, only by its latest exact-head verdict, and never over an
  // engineering owner's exact-head request for changes.
  const appCounts = Boolean(app) && authorHasWrite === true;
  const appApproved = appCounts && appState === 'APPROVED' && !ownerWithdrawn;
  const appWithdrawn =
    appCounts && (appState === 'CHANGES_REQUESTED' || appState === 'DISMISSED');
  const codeApproved = ownerApproved || appApproved;
  let codeApprovedBy = null;
  if (ownerApproved) codeApprovedBy = 'owner';
  else if (appApproved) codeApprovedBy = 'review-app';
  return {
    codeApproved,
    codeApprovedBy,
    codeWithdrawn: !codeApproved && (ownerWithdrawn || appWithdrawn),
    designApproved,
  };
}

module.exports = {
  classifyReviewSignalPaths,
  hasWritePermission,
  isSafeSpace,
  normalizeReviewApp,
  resolveReviewApprovals,
};
