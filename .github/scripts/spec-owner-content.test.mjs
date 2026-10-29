// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {
  approvedDescription,
  fingerprintSpecContent,
  mirrorDescription,
  parseOwnerCommandTarget,
  waitingDescription,
} = require('./spec-owner-content.cjs');
const {
  composeReviewGate,
  readCodeGate,
  readSpecGate,
} = require('./review-signal-decision.cjs');

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
  const mirror = (state, options) => [
    {
      context: 'spec-owner-approval',
      state,
      description: mirrorDescription({state, ...options}),
      creator: {login: 'github-actions[bot]'},
    },
  ];
  const noCode = 'No code review required.';
  const codeWait = 'Waiting on code review: core change';

  it.each([
    [
      'spec waits behind satisfied code review',
      false,
      noCode,
      mirror('pending', {missing: {spec: true}}),
      {state: 'pending', description: waitingDescription({spec: true})},
    ],
    [
      'design-only wait names a design or eng owner',
      false,
      noCode,
      mirror('pending', {missing: {spec: false, design: true}}),
      {
        state: 'pending',
        description:
          '⏳ Waiting for human spec approval: a design or eng owner can reply /approve-spec <sha>',
      },
    ],
    [
      'code review leads when both are missing',
      true,
      codeWait,
      mirror('pending', {missing: {spec: true}}),
      {state: 'pending', description: `${codeWait} (+ spec approval)`},
    ],
    [
      'success needs both and names the spec approver',
      false,
      noCode,
      mirror('success', {approvers: ['cixzhang']}),
      {
        state: 'success',
        description: `${approvedDescription(['cixzhang'])} · ${noCode}`,
      },
    ],
    [
      'no spec decision yet keeps the code half',
      false,
      noCode,
      [],
      {state: 'success', description: noCode},
    ],
  ])('%s', (_name, codeGated, codeDescription, statuses, expected) => {
    expect(
      composeReviewGate({
        codeGated,
        codeDescription,
        spec: readSpecGate(statuses),
      }),
    ).toEqual(expected);
  });

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

  it('fits every text in a commit status description', () => {
    for (const text of [
      waitingDescription({spec: true}),
      waitingDescription({spec: false, design: true}),
      `${codeWait} (+ spec approval)`,
    ]) {
      expect(text.length).toBeLessThanOrEqual(140);
    }
  });
});
