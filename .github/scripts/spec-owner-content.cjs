// Copyright (c) Meta Platforms, Inc. and affiliates.

'use strict';
/* global module, require */

/**
 * @input Changed knowledge-record and design-asset contents read from a pull
 *   request, and owner command comments
 * @output The spec-content fingerprint an owner approval binds, owner-command
 *   parsing, and the gate's status text
 * @position Pure helpers for `architecture:knowledge-contracts` DEC-14; the
 *   reconciler owns every GitHub read and write
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const {SPEC_MIRROR_PREFIX} = require('./review-signal-decision.cjs');
/* eslint-enable @typescript-eslint/no-require-imports */

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
 * Read an owner command. `/approve-spec <sha>` approves the spec content at
 * that commit; the SHA says which content the owner reviewed. `/revoke-spec`
 * withdraws the owner's approval, with or without a commit.
 */
function parseOwnerCommandTarget(body) {
  if (typeof body !== 'string') return null;
  const match = body
    .trim()
    .match(/^\/(approve|revoke)-spec(?:\s+([0-9a-fA-F]{40}))?$/);
  if (!match) return null;
  if (match[1] === 'approve' && !match[2]) return null;
  return {
    approved: match[1] === 'approve',
    sha: match[2] ? match[2].toLowerCase() : null,
  };
}

function approvedDescription(owners) {
  const names = owners.map(name => `@${name}`).join(', ');
  return `✅ Spec approved by ${names || 'an owner'}`;
}

/**
 * The `spec-owner-approval` description. That context only mirrors the spec
 * half of `review-required` until branch protection stops requiring it; the
 * review gate reads the state from this text.
 */
function mirrorDescription({state, missing, approvers = []}) {
  if (state === 'success') {
    return approvers.length
      ? `${SPEC_MIRROR_PREFIX}ok (${approvers.map(name => `@${name}`).join(', ')})`
      : `${SPEC_MIRROR_PREFIX}ok`;
  }
  return `${SPEC_MIRROR_PREFIX}waiting (${missing?.spec ? 'eng' : 'design'})`;
}

module.exports = {
  approvedDescription,
  fingerprintSpecContent,
  mirrorDescription,
  parseOwnerCommandTarget,
};
