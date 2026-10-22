// Copyright (c) Meta Platforms, Inc. and affiliates.

'use strict';
/* global module, require */

/* eslint-disable @typescript-eslint/no-require-imports */
const {
  parseOwnerCommand,
  resolveOwnerDecision,
} = require('./spec-owner-decision.cjs');
/* eslint-enable @typescript-eslint/no-require-imports */

// An owner's approval of one head may stand for a later head only when the
// later head changes nothing the owner judged. Two kinds of change qualify:
// moving the same changes onto a newer base, and writing the approval itself
// into the records (authority, approved_by, approved_at, phase, Decider date).
// Recording the approval needs a commit, and that commit must not undo the
// approval it records. Everything else is material and needs a new decision.

const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DECIDER_LINE = /^\*\*Decider:\*\* `([^`]*)`, `([^`]*)`\s*$/;
const FRONTMATTER_FIELD = /^([a-z_]+):\s*(.*?)\s*$/;
const COMMAND_HEAD = /^\/(?:approve|revoke)-spec\s+([0-9a-fA-F]{40})$/;
// Each candidate costs a compare and a few reads; the newest approvals are
// the only realistic sources, so older ones are not examined.
const MAX_CANDIDATE_HEADS = 5;

function decisionTime(value) {
  const time = Date.parse(value ?? '');
  return Number.isNaN(time) ? null : time;
}

function commandHead(body) {
  if (typeof body !== 'string') return null;
  const match = body.trim().match(COMMAND_HEAD);
  return match ? match[1].toLowerCase() : null;
}

// When the owner's dismissed review was a request for changes, the dismissal
// lifts an objection rather than withdrawing an approval.
function dismissalOf(review, dismissalEvents) {
  const events = dismissalEvents.filter(
    event =>
      event.event === 'review_dismissed' &&
      event.dismissed_review?.review_id === review.id,
  );
  const liftsObjection =
    events.length > 0 &&
    events.every(
      event =>
        String(event.dismissed_review?.state ?? '').toLowerCase() ===
        'changes_requested',
    );
  const at = [review.updated_at, ...events.map(event => event.created_at)]
    .map(decisionTime)
    .filter(time => time !== null);
  return {liftsObjection, at: at.length > 0 ? Math.max(...at) : null};
}

/**
 * Every owner decision on any head of the pull request, in the same forms the
 * exact-head gate reads: owner commands and owner reviews. A dismissed owner
 * review counts as a rejection at its dismissal, unless it was itself a
 * request for changes.
 */
function ownerDecisionsByHead({
  reviews,
  comments,
  owners,
  dismissalEvents = [],
}) {
  const allowed = new Set(owners.map(owner => owner.toLowerCase()));
  const decisions = [];
  for (const review of reviews) {
    const login = review.user?.login?.toLowerCase();
    if (!login || !allowed.has(login) || !review.commit_id) continue;
    if (review.state === 'DISMISSED') {
      const dismissal = dismissalOf(review, dismissalEvents);
      if (dismissal.liftsObjection || dismissal.at === null) continue;
      decisions.push({
        owner: login,
        headSha: review.commit_id.toLowerCase(),
        approved: false,
        at: dismissal.at,
      });
      continue;
    }
    if (!['APPROVED', 'CHANGES_REQUESTED'].includes(review.state)) continue;
    const at = decisionTime(review.submitted_at ?? review.updated_at);
    if (at === null) continue;
    decisions.push({
      owner: login,
      headSha: review.commit_id.toLowerCase(),
      approved: review.state === 'APPROVED',
      at,
    });
  }
  for (const comment of comments) {
    const login = comment.user?.login?.toLowerCase();
    if (!login || !allowed.has(login)) continue;
    const headSha = commandHead(comment.body);
    if (!headSha) continue;
    const approved = parseOwnerCommand(comment.body, headSha);
    const at = decisionTime(comment.created_at);
    if (approved == null || at === null) continue;
    decisions.push({owner: login, headSha, approved, at});
  }
  return decisions;
}

/**
 * Earlier heads whose owner approval could stand for the current head, newest
 * approval first. A head qualifies only when the exact-head rules approve it
 * on its own, and no owner in the group rejected any head after that
 * approval: a later request for changes, revoke, or dismissal always wins.
 */
function carryCandidates({
  reviews,
  comments,
  owners,
  headSha,
  dismissalEvents = [],
}) {
  const decisions = ownerDecisionsByHead({
    reviews,
    comments,
    owners,
    dismissalEvents,
  });
  const lastRejection = Math.max(
    Number.NEGATIVE_INFINITY,
    ...decisions.filter(entry => !entry.approved).map(entry => entry.at),
  );
  const current = headSha.toLowerCase();
  const heads = [
    ...new Set(
      decisions
        .filter(entry => entry.approved && entry.headSha !== current)
        .map(entry => entry.headSha),
    ),
  ];
  const candidates = [];
  for (const candidateHead of heads) {
    const decision = resolveOwnerDecision({
      reviews,
      comments,
      dismissalEvents,
      owners,
      headSha: candidateHead,
    });
    const at = decisionTime(decision.at);
    if (!decision.approved || at === null || at <= lastRejection) continue;
    candidates.push({
      headSha: candidateHead,
      owner: decision.owner,
      at: new Date(at).toISOString(),
    });
  }
  return candidates
    .sort((left, right) => Date.parse(right.at) - Date.parse(left.at))
    .slice(0, MAX_CANDIDATE_HEADS);
}

/**
 * Compare the pull request's changed files at the approved head and the
 * current head. Returns null when the two heads change different paths, or
 * the list of paths whose bytes differ.
 */
function differingPaths(approvedFiles, headFiles) {
  if (!Array.isArray(approvedFiles) || !Array.isArray(headFiles)) return null;
  if (approvedFiles.length !== headFiles.length) return null;
  const approvedByPath = new Map(
    approvedFiles.map(file => [file.filename, file]),
  );
  if (approvedByPath.size !== approvedFiles.length) return null;
  const differing = [];
  for (const file of headFiles) {
    const approved = approvedByPath.get(file.filename);
    if (
      !approved ||
      approved.status !== file.status ||
      (approved.previous_filename ?? null) !== (file.previous_filename ?? null)
    ) {
      return null;
    }
    if (!approved.sha || !file.sha) return null;
    if (approved.sha !== file.sha) differing.push(file);
  }
  return differing;
}

/**
 * True when the base branch changed any path the pull request changes between
 * the approved head's merge base and the current one. A rebase that resolved
 * such a path by keeping the pull request's bytes would silently revert the
 * base branch's edit, so the same bytes no longer mean the same change.
 */
function baseTouchedChangedPaths(changedFiles, baseFiles) {
  const paths = file => [file.filename, file.previous_filename].filter(Boolean);
  const changed = new Set(changedFiles.flatMap(paths));
  return baseFiles.some(file => paths(file).some(name => changed.has(name)));
}

function unquote(value) {
  return value.replace(/^(['"])(.*)\1$/, '$2');
}

function approvalDates(approvedAt) {
  const time = Date.parse(approvedAt);
  if (Number.isNaN(time)) return new Set();
  // A record dates its approval in the decider's own day, which can sit on
  // either side of the UTC date of the command.
  return new Set(
    [-1, 0, 1].map(offset =>
      new Date(time + offset * DAY_MS).toISOString().slice(0, 10),
    ),
  );
}

function frontmatterEnd(lines) {
  if (lines[0] !== '---') return -1;
  return lines.indexOf('---', 1);
}

function isApprovalFieldChange(before, after, {approver, dates}) {
  const beforeMatch = before.match(FRONTMATTER_FIELD);
  const afterMatch = after.match(FRONTMATTER_FIELD);
  if (!beforeMatch || !afterMatch || beforeMatch[1] !== afterMatch[1]) {
    return false;
  }
  const field = beforeMatch[1];
  const from = unquote(beforeMatch[2]);
  const to = unquote(afterMatch[2]);
  switch (field) {
    case 'authority':
      return from === 'draft' && to === 'current';
    case 'phase':
      return from === 'proposed' && to === 'accepted';
    case 'approved_by':
      return to.toLowerCase() === approver;
    case 'approved_at':
      return ISO_DATE.test(to) && dates.has(to);
    default:
      return false;
  }
}

const PLACEHOLDER = /^<[^>]+>$/;

// Only an undecided Decider line that is the approver's own may gain the
// approval: a placeholder date becomes the approval date, and a placeholder
// person may become the approver. A line that already names a real date, or
// names another person, is not this approver's decision to date.
function isDeciderDateChange(before, after, {approver, dates}) {
  const beforeMatch = before.match(DECIDER_LINE);
  const afterMatch = after.match(DECIDER_LINE);
  if (!beforeMatch || !afterMatch) return false;
  const [, fromPerson, fromDate] = beforeMatch;
  const [, toPerson, toDate] = afterMatch;
  if (!PLACEHOLDER.test(fromDate)) return false;
  if (toPerson.toLowerCase() !== approver) return false;
  if (toPerson !== fromPerson && !PLACEHOLDER.test(fromPerson)) return false;
  return ISO_DATE.test(toDate) && dates.has(toDate);
}

/**
 * True when `after` differs from `before` only by recording the given owner's
 * approval: frontmatter `authority: draft` to `current`, `phase: proposed` to
 * `accepted`, `approved_by` naming that owner, `approved_at` dated on the day
 * of the approval, and undecided Decider lines gaining that date (and the
 * approver, when the line names no person yet). Lines are compared one
 * for one, so any added, removed, or other edited line is material.
 */
function isApprovalMetadataOnlyChange(before, after, {approver, approvedAt}) {
  if (typeof before !== 'string' || typeof after !== 'string') return false;
  if (before === after) return true;
  const owner = typeof approver === 'string' ? approver.toLowerCase() : '';
  const dates = approvalDates(approvedAt);
  if (!owner || dates.size === 0) return false;
  // Split on the newline alone and keep each line's carriage return as part
  // of it: a line-ending change is a byte change, and bytes are what the owner
  // read. Only the line text, never its ending, may record the approval.
  const split = text =>
    text.split('\n').map(line => ({
      text: line.replace(/\r$/, ''),
      cr: line.endsWith('\r'),
    }));
  const beforeLines = split(before);
  const afterLines = split(after);
  if (beforeLines.length !== afterLines.length) return false;
  const end = frontmatterEnd(beforeLines.map(line => line.text));
  if (end !== frontmatterEnd(afterLines.map(line => line.text))) return false;
  for (let index = 0; index < beforeLines.length; index += 1) {
    if (beforeLines[index].cr !== afterLines[index].cr) return false;
    const from = beforeLines[index].text;
    const to = afterLines[index].text;
    if (from === to) continue;
    const inFrontmatter = end > 0 && index > 0 && index < end;
    const allowed = inFrontmatter
      ? isApprovalFieldChange(from, to, {approver: owner, dates})
      : isDeciderDateChange(from, to, {approver: owner, dates});
    if (!allowed) return false;
  }
  return true;
}

module.exports = {
  MAX_CANDIDATE_HEADS,
  baseTouchedChangedPaths,
  carryCandidates,
  differingPaths,
  isApprovalMetadataOnlyChange,
};
