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

module.exports = {
  classifyReviewSignalPaths,
  isSafeSpace,
  resolveReviewApprovals,
};
