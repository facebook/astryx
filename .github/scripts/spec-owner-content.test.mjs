// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {
  fingerprintSpecContent,
  parseOwnerCommandTarget,
} = require('./spec-owner-content.cjs');
const {readCodeGate} = require('./review-signal-decision.cjs');

const head = 'abcdef1234567890abcdef1234567890abcdef12';
const record = [
  '---',
  'kind: architecture',
  'authority: draft',
  'approved_by: null',
  'approved_at: null',
  'owners: [cixzhang]',
  '---',
  '',
  '# Example',
  '',
  'The contract.',
  '',
].join('\n');
const fingerprint = content =>
  fingerprintSpecContent([{path: 'docs/a.md', content}]).fingerprint;

describe('spec content fingerprint (DEC-14)', () => {
  it('ignores only the values approval bookkeeping writes', () => {
    const flipped = record
      .replace('authority: draft', 'authority: current')
      .replace('approved_by: null', 'approved_by: cixzhang')
      .replace('approved_at: null', 'approved_at: 2026-10-28');
    expect(fingerprint(flipped)).toBe(fingerprint(record));
    for (const edited of [
      record.replace('The contract.', 'Another contract.'),
      record.replace('owners: [cixzhang]', 'owners: [someone]'),
      `${record}authority: current\n`,
    ]) {
      expect(fingerprint(edited)).not.toBe(fingerprint(record));
    }
  });

  it('covers every path, an absent one included, in any order', () => {
    const one = [{path: 'docs/a.md', content: record}];
    const two = [...one, {path: 'docs/b.md', content: null}];
    expect(fingerprintSpecContent(two).fingerprint).not.toBe(
      fingerprintSpecContent(one).fingerprint,
    );
    expect(fingerprintSpecContent([...two].reverse()).fingerprint).toBe(
      fingerprintSpecContent(two).fingerprint,
    );
  });
});

describe('owner commands', () => {
  it.each([
    [`/approve-spec ${head}`, {approved: true, sha: head}],
    [`/approve-spec ${head.toUpperCase()}`, {approved: true, sha: head}],
    ['/revoke-spec', {approved: false, sha: null}],
    [`/revoke-spec ${head}`, {approved: false, sha: head}],
    ['/approve-spec', null],
    ['/spec ok', null],
    ['/approve-spec abc1234', null],
    [`/approve-spec ${head} please`, null],
  ])('reads %s', (body, expected) => {
    expect(parseOwnerCommandTarget(body)).toEqual(expected);
  });
});

describe('one review gate', () => {
  const noCode = 'No code review required.';
  const codeWait = 'Waiting on code review: core change';

  it('reads the code half back out of a composed gate', () => {
    const gate = (state, description) => [
      {
        context: 'review-required',
        state,
        description,
        creator: {login: 'github-actions[bot]'},
      },
    ];
    expect(
      readCodeGate(gate('pending', `${codeWait} (+ spec approval)`)),
    ).toEqual({
      gated: true,
      description: codeWait,
    });
    expect(
      readCodeGate(
        gate('success', `✅ Spec approved by @cixzhang · ${noCode}`),
      ),
    ).toEqual({gated: false, description: noCode});
  });
});
