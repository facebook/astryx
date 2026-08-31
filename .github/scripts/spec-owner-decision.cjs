// Copyright (c) Meta Platforms, Inc. and affiliates.

'use strict';
/* global module, require */

/* eslint-disable @typescript-eslint/no-require-imports */
const {
  parseAuthority,
  parseKind,
  parseOwnerFile,
} = require('./knowledge-frontmatter.cjs');
/* eslint-enable @typescript-eslint/no-require-imports */

function parseOwnerCommand(body, headSha) {
  const match = body
    .trim()
    .match(/^\/(approve|revoke)-spec\s+([0-9a-f]{40})$/i);
  if (!match || headSha !== match[2].toLowerCase()) return null;
  return match[1].toLowerCase() === 'approve';
}

function resolveOwnerDecision({reviews, comments, owners, headSha}) {
  const allowed = new Set(owners.map(owner => owner.toLowerCase()));
  const latestByOwner = new Map();

  function consider(login, candidate) {
    if (!allowed.has(login)) return;
    const previous = latestByOwner.get(login);
    if (!previous || new Date(candidate.at) > new Date(previous.at)) {
      latestByOwner.set(login, candidate);
    }
  }

  for (const review of reviews) {
    const login = review.user?.login?.toLowerCase();
    if (!login || review.commit_id !== headSha) continue;
    if (
      !['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'].includes(review.state)
    ) {
      continue;
    }
    consider(login, {
      approved:
        review.state === 'APPROVED'
          ? true
          : review.state === 'CHANGES_REQUESTED'
            ? false
            : null,
      at: review.submitted_at ?? review.updated_at ?? review.created_at,
      source: 'review',
      owner: login,
    });
  }

  for (const comment of comments) {
    const login = comment.user?.login?.toLowerCase();
    if (!login) continue;
    const approved = parseOwnerCommand(comment.body ?? '', headSha);
    if (approved == null) continue;
    consider(login, {
      approved,
      at: comment.created_at,
      source: 'command',
      owner: login,
    });
  }

  const decisions = [...latestByOwner.values()];
  const rejected = decisions.find(decision => decision.approved === false);
  if (rejected) return rejected;
  return (
    decisions.find(decision => decision.approved === true) ?? {
      approved: false,
      at: null,
      source: null,
      owner: null,
    }
  );
}

function isDesignVersion(content, filePath) {
  return parseKind(content, filePath) === 'design';
}

function requiredApprovalGroups(
  records,
  {complete = true, touchesDesignAssets = false} = {},
) {
  if (!complete) return {spec: true, design: true};
  const groups = {spec: false, design: touchesDesignAssets};
  for (const record of records) {
    const versions = [
      {content: record.baseContent, path: record.previousPath ?? record.path},
      {content: record.headContent, path: record.path},
    ];
    for (const version of versions) {
      if (parseAuthority(version.content, version.path) !== 'current') continue;
      groups[
        isDesignVersion(version.content, version.path) ? 'design' : 'spec'
      ] = true;
    }
  }
  return groups;
}

function requiresOwnerApproval(records, options = {}) {
  const groups = requiredApprovalGroups(records, options);
  return groups.spec || groups.design;
}

module.exports = {
  parseAuthority,
  parseKind,
  parseOwnerFile,
  requiredApprovalGroups,
  requiresOwnerApproval,
  parseOwnerCommand,
  resolveOwnerDecision,
};
