// Copyright (c) Meta Platforms, Inc. and affiliates.

'use strict';
/* global module, require */

/**
 * @input Changed knowledge-record and design-asset contents read from a pull
 *   request, owner command comments, and the gate's own commit statuses
 * @output The spec-content fingerprint an owner approval binds, the content
 *   clock that dates it, owner-command parsing, and the gate's status text
 * @position Pure helpers for `architecture:knowledge-contracts` DEC-14; the
 *   reconciler owns every GitHub read and write
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
/* eslint-enable @typescript-eslint/no-require-imports */

const CONTENT_STATUS_CONTEXT = 'spec-owner-content';
const TRUSTED_STATUS_CREATOR = 'github-actions[bot]';

// Recording an approval writes these values, so they never take part in the
// content an approval binds (DEC-14).
const BOOKKEEPING_KEYS = new Set(['authority', 'approved_by', 'approved_at']);

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * A Markdown record's text without the front-matter values that approval
 * bookkeeping rewrites. Everything else, body and other keys, stays.
 */
function normalizeRecordText(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) return normalized;
  const end = normalized.indexOf('\n---', 4);
  if (end === -1) return normalized;
  const frontMatter = normalized
    .slice(4, end)
    .split('\n')
    .filter(line => {
      const key = line.match(/^([A-Za-z_][\w-]*)\s*:/)?.[1];
      return key == null || !BOOKKEEPING_KEYS.has(key);
    })
    .join('\n');
  return `---\n${frontMatter}${normalized.slice(end)}`;
}

/**
 * One fingerprint over every changed spec path. Each entry is
 * `{path, content}`, where `content` is the text at the head (`null` when the
 * path is absent there). Markdown is normalized; other files hash as read.
 */
function fingerprintSpecContent(entries) {
  const files = {};
  for (const {path, content} of entries) {
    files[path] =
      content == null
        ? 'absent'
        : sha256(path.endsWith('.md') ? normalizeRecordText(content) : content);
  }
  const fingerprint = sha256(
    Object.keys(files)
      .sort()
      .map(filePath => `${filePath}\0${files[filePath]}\n`)
      .join(''),
  );
  return {fingerprint, files};
}

/**
 * Read an owner command. `/spec ok` and a bare `/approve-spec` approve the
 * spec content current when the comment was posted (`sha: null`);
 * `/approve-spec <sha>` approves that commit's spec content. `/revoke-spec`
 * withdraws, with or without a commit.
 */
function parseOwnerCommandTarget(body) {
  if (typeof body !== 'string') return null;
  const text = body.trim();
  if (/^\/spec ok$/i.test(text)) return {approved: true, sha: null};
  const match = text.match(
    /^\/(approve|revoke)-spec(?:\s+([0-9a-fA-F]{40}))?$/,
  );
  if (!match) return null;
  return {
    approved: match[1] === 'approve',
    sha: match[2] ? match[2].toLowerCase() : null,
  };
}

function contentStatusDescription(fingerprint, since) {
  return `Spec content ${fingerprint.slice(0, 12)} since ${since}`;
}

/**
 * The content clock a trusted gate status recorded for `fingerprint`, or null.
 * Only the workflow's own statuses count; a person cannot set the clock.
 */
function readContentClock(statuses, fingerprint) {
  const prefix = `Spec content ${fingerprint.slice(0, 12)} since `;
  for (const status of statuses) {
    if (
      status.context !== CONTENT_STATUS_CONTEXT ||
      status.creator?.login !== TRUSTED_STATUS_CREATOR ||
      typeof status.description !== 'string'
    ) {
      continue;
    }
    if (!status.description.startsWith(prefix)) return null;
    const since = status.description.slice(prefix.length);
    return Number.isNaN(Date.parse(since)) ? null : since;
  }
  return null;
}

/** The fingerprint prefix the newest trusted content status names, or null. */
function readContentFingerprintPrefix(statuses) {
  for (const status of statuses) {
    if (
      status.context === CONTENT_STATUS_CONTEXT &&
      status.creator?.login === TRUSTED_STATUS_CREATOR
    ) {
      return (
        status.description?.match(/^Spec content ([0-9a-f]{12}) /)?.[1] ?? null
      );
    }
  }
  return null;
}

const WAITING_PREFIX = '⏳ Waiting for human spec approval: ';

/**
 * Pending status text naming who can still approve. An engineering owner
 * satisfies every group, so a missing engineering group is named alone.
 */
function waitingDescription(missing) {
  if (missing.spec) return `${WAITING_PREFIX}an eng owner can reply /spec ok`;
  return `${WAITING_PREFIX}a design or eng owner can reply /spec ok`;
}

function approvedDescription(owners) {
  const names = owners.map(name => `@${name}`);
  const list =
    names.length <= 1
      ? (names[0] ?? 'an owner')
      : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
  return `✅ Spec approved by ${list}`;
}

module.exports = {
  CONTENT_STATUS_CONTEXT,
  WAITING_PREFIX,
  approvedDescription,
  contentStatusDescription,
  fingerprintSpecContent,
  normalizeRecordText,
  parseOwnerCommandTarget,
  readContentClock,
  readContentFingerprintPrefix,
  waitingDescription,
};
