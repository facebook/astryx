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

const GATE_STATUS_CONTEXT = 'spec-owner-approval';
const READY_STATUS_PREFIX = 'spec-owner-ready/';
const TRUSTED_STATUS_CREATOR = 'github-actions[bot]';

// The workflow trigger filters comments with GitHub's `startsWith` against the
// raw body, which neither trims nor lowercases. Every parser below applies the
// same precondition, so a comment the trigger drops can never be read as a
// decision by a run started for some other event.
const OWNER_COMMAND_PREFIXES = ['/approve-spec', '/revoke-spec'];

function isDispatchableOwnerCommand(body) {
  return (
    typeof body === 'string' &&
    OWNER_COMMAND_PREFIXES.some(prefix => body.startsWith(prefix))
  );
}

function parseOwnerCommand(body, headSha) {
  if (!isDispatchableOwnerCommand(body)) return null;
  // The command prefix must match the trigger exactly, but a commit SHA is
  // case-insensitive everywhere else in git and GitHub. Accept either casing
  // rather than silently ignoring a copy-pasted uppercase head.
  const match = body
    .trim()
    .match(/^\/(approve|revoke)-spec\s+([0-9a-fA-F]{40})$/);
  if (!match || headSha.toLowerCase() !== match[2].toLowerCase()) return null;
  return match[1] === 'approve';
}

/**
 * Recognize that a comment was meant as an owner command, whatever it names.
 * Only the exact-head form in `parseOwnerCommand` decides the gate; this looser
 * shape exists so a near-miss command is answered instead of ignored.
 */
function parseOwnerCommandIntent(body) {
  if (!isDispatchableOwnerCommand(body)) return null;
  const match = body
    .trimEnd()
    .match(/^\/(approve|revoke)-spec(?![-\w])([\s\S]*)$/);
  if (!match) return null;
  return {verb: match[1], argument: match[2].trim()};
}

/**
 * Explain why a recognized owner command does not decide the gate, or return
 * null when it does. The reasons are the two silent failures owners hit: a
 * command that names no full head SHA, and one that names a superseded commit.
 */
function describeOwnerCommandProblem(intent, headSha) {
  if (!intent) return null;
  if (!intent.argument) {
    return 'it did not name a commit';
  }
  if (!/^[0-9a-f]{40}$/i.test(intent.argument)) {
    return 'it did not name exactly one full 40-character commit SHA';
  }
  if (intent.argument.toLowerCase() !== headSha.toLowerCase()) {
    return `it named ${intent.argument.slice(0, 7)}, which is not the current head`;
  }
  return null;
}

function candidateTime(candidate) {
  const value = Date.parse(candidate.at);
  return Number.isNaN(value) ? Number.NEGATIVE_INFINITY : value;
}

function candidatePriority(candidate) {
  if (candidate.approved === false || candidate.approved === null) return 2;
  return candidate.source === 'ready' ? 0 : 1;
}

function latestDismissalAt(review, dismissalEvents) {
  const timestamps = [review.updated_at];
  for (const event of dismissalEvents) {
    if (
      event.event === 'review_dismissed' &&
      event.dismissed_review?.review_id === review.id
    ) {
      timestamps.push(event.created_at);
    }
  }
  return timestamps
    .filter(Boolean)
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0];
}

function resolveOwnerDecision({
  reviews,
  comments,
  readyAttestations = [],
  dismissalEvents = [],
  owners,
  headSha,
}) {
  const allowed = new Set(owners.map(owner => owner.toLowerCase()));
  const latestByOwner = new Map();

  function consider(login, candidate) {
    const normalizedLogin = login.toLowerCase();
    if (!allowed.has(normalizedLogin) || !candidate.at) return;
    const normalizedCandidate = {...candidate, owner: normalizedLogin};
    const previous = latestByOwner.get(normalizedLogin);
    if (
      !previous ||
      candidateTime(normalizedCandidate) > candidateTime(previous) ||
      (candidateTime(normalizedCandidate) === candidateTime(previous) &&
        candidatePriority(normalizedCandidate) > candidatePriority(previous))
    ) {
      latestByOwner.set(normalizedLogin, normalizedCandidate);
    }
  }

  for (const attestation of readyAttestations) {
    if (attestation.headSha !== headSha) continue;
    consider(attestation.owner, {
      approved: true,
      at: attestation.at,
      source: 'ready',
    });
  }

  for (const review of reviews) {
    const login = review.user?.login?.toLowerCase();
    if (!login || review.commit_id !== headSha) continue;
    if (
      !['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'].includes(review.state)
    ) {
      continue;
    }
    const dismissedAt =
      review.state === 'DISMISSED'
        ? latestDismissalAt(review, dismissalEvents)
        : null;
    consider(login, {
      approved:
        review.state === 'APPROVED'
          ? true
          : review.state === 'CHANGES_REQUESTED'
            ? false
            : null,
      at:
        dismissedAt ??
        review.submitted_at ??
        review.updated_at ??
        review.created_at,
      source: review.state === 'DISMISSED' ? 'dismissal' : 'review',
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

function canonicalRunUrl(repository, runId, runAttempt) {
  return `https://github.com/${repository}/actions/runs/${runId}/attempts/${runAttempt}`;
}

function parseCanonicalRunId(targetUrl, repository) {
  if (typeof targetUrl !== 'string') return null;
  const prefix = `https://github.com/${repository}/actions/runs/`;
  if (!targetUrl.startsWith(prefix)) return null;
  const match = targetUrl
    .slice(prefix.length)
    .match(/^([1-9][0-9]*)\/attempts\/[1-9][0-9]*$/);
  if (!match) return null;
  try {
    return BigInt(match[1]);
  } catch {
    return null;
  }
}

function isTrustedWorkflowStatus(status, repository) {
  return (
    status.creator?.login === TRUSTED_STATUS_CREATOR &&
    parseCanonicalRunId(status.target_url, repository) !== null
  );
}

function parseReadyAttestations(statuses, {repository, headSha, owners}) {
  // A ready marker is only design-group evidence, and only from a handle that
  // is a design owner *now*. Markers published before that rule existed, or
  // by someone since removed from .github/DESIGNOWNERS, are historical noise
  // and must not authorize anything.
  const allowed = new Set((owners ?? []).map(owner => owner.toLowerCase()));
  const attestations = [];
  for (const status of statuses) {
    if (
      status.state !== 'success' ||
      !status.context?.startsWith(READY_STATUS_PREFIX) ||
      !isTrustedWorkflowStatus(status, repository)
    ) {
      continue;
    }
    const owner = status.context
      .slice(READY_STATUS_PREFIX.length)
      .toLowerCase();
    if (!/^[a-z0-9-]+$/.test(owner) || !allowed.has(owner)) continue;
    const match = status.description?.match(
      /^Owner ready at (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)\.$/,
    );
    if (!match || Number.isNaN(Date.parse(match[1]))) continue;
    attestations.push({
      approved: true,
      at: match[1],
      headSha,
      owner,
      source: 'ready',
    });
  }
  return attestations;
}

function newestGateRun(statuses, repository) {
  let newest = null;
  for (const status of statuses) {
    if (
      status.context !== GATE_STATUS_CONTEXT ||
      !isTrustedWorkflowStatus(status, repository)
    ) {
      continue;
    }
    const runId = parseCanonicalRunId(status.target_url, repository);
    if (newest === null || runId > newest.runId) {
      newest = {runId, status};
    }
  }
  return newest;
}

function approvalGroupFor(content, filePath) {
  const kind = parseKind(content, filePath);
  if (kind === 'design') return 'design';
  if (kind === 'theme') return 'theme';
  return 'spec';
}

function requiredApprovalGroups(
  records,
  {complete = true, touchesDesignAssets = false} = {},
) {
  if (!complete) return {spec: true, design: true, theme: true};
  const groups = {spec: false, design: touchesDesignAssets, theme: false};
  for (const record of records) {
    const versions = [
      {content: record.baseContent, path: record.previousPath ?? record.path},
      {content: record.headContent, path: record.path},
    ];
    for (const version of versions) {
      if (parseAuthority(version.content, version.path) !== 'current') continue;
      groups[approvalGroupFor(version.content, version.path)] = true;
    }
  }
  return groups;
}

function requiresOwnerApproval(records, options = {}) {
  const groups = requiredApprovalGroups(records, options);
  return groups.spec || groups.design || groups.theme;
}

module.exports = {
  GATE_STATUS_CONTEXT,
  OWNER_COMMAND_PREFIXES,
  READY_STATUS_PREFIX,
  canonicalRunUrl,
  describeOwnerCommandProblem,
  isDispatchableOwnerCommand,
  newestGateRun,
  parseAuthority,
  parseCanonicalRunId,
  parseKind,
  parseOwnerCommand,
  parseOwnerCommandIntent,
  parseOwnerFile,
  parseReadyAttestations,
  requiredApprovalGroups,
  requiresOwnerApproval,
  resolveOwnerDecision,
};
