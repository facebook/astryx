// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {
  approvedDescription,
  fingerprintSpecContent,
  mirrorDescription,
  normalizeRecordText,
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
  'id: architecture:example',
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

function trusted(description, context = 'spec-owner-content') {
  return {context, description, creator: {login: 'github-actions[bot]'}};
}

describe('spec content fingerprint', () => {
  it('ignores the values approval bookkeeping writes', () => {
    const flipped = record
      .replace('authority: draft', 'authority: current')
      .replace('approved_by: null', 'approved_by: cixzhang')
      .replace('approved_at: null', 'approved_at: 2026-10-28');

    expect(normalizeRecordText(flipped)).toBe(normalizeRecordText(record));
    expect(
      fingerprintSpecContent([{path: 'docs/a.md', content: flipped}])
        .fingerprint,
    ).toBe(
      fingerprintSpecContent([{path: 'docs/a.md', content: record}])
        .fingerprint,
    );
  });

  it('changes with any other front-matter value or body text', () => {
    const base = fingerprintSpecContent([{path: 'docs/a.md', content: record}]);
    for (const edited of [
      record.replace('The contract.', 'Another contract.'),
      record.replace('owners: [cixzhang]', 'owners: [someone]'),
      record.replace('# Example', '# Renamed'),
    ]) {
      expect(
        fingerprintSpecContent([{path: 'docs/a.md', content: edited}])
          .fingerprint,
      ).not.toBe(base.fingerprint);
    }
  });

  it('ignores body lines that only look like bookkeeping keys', () => {
    const body = `${record}authority: current\n`;
    expect(normalizeRecordText(body)).toContain('authority: current\n');
  });

  it('covers every path, including one absent at the head', () => {
    const one = fingerprintSpecContent([{path: 'docs/a.md', content: record}]);
    const two = fingerprintSpecContent([
      {path: 'docs/a.md', content: record},
      {path: 'docs/b.md', content: null},
    ]);
    expect(two.fingerprint).not.toBe(one.fingerprint);
    expect(two.files['docs/b.md']).toBe('absent');
  });

  it('does not depend on path order', () => {
    const entries = [
      {path: 'docs/a.md', content: record},
      {path: 'docs/b.md', content: 'b'},
    ];
    expect(fingerprintSpecContent(entries).fingerprint).toBe(
      fingerprintSpecContent([...entries].reverse()).fingerprint,
    );
  });
});

describe('owner commands', () => {
  it.each([
    [`/approve-spec ${head}`, {approved: true, sha: head}],
    [`/approve-spec ${head.toUpperCase()}`, {approved: true, sha: head}],
    ['/revoke-spec', {approved: false, sha: null}],
    [`/revoke-spec ${head}`, {approved: false, sha: head}],
  ])('reads %s', (body, expected) => {
    expect(parseOwnerCommandTarget(body)).toEqual(expected);
  });

  it.each([
    undefined,
    'LGTM',
    '/approve-spec',
    '/spec ok',
    '/approve-spec abc1234',
    `/approve-spec ${head} please`,
    '/approve-specs',
  ])('does not read %s as a decision', body => {
    expect(parseOwnerCommandTarget(body)).toBe(null);
  });
});

describe('one review gate', () => {
  const trusted = (context, state, description) => ({
    context,
    state,
    description,
    creator: {login: 'github-actions[bot]'},
  });

  it('shows the spec wait when code review is satisfied', () => {
    const spec = readSpecGate([
      trusted(
        'spec-owner-approval',
        'pending',
        mirrorDescription({state: 'pending', missing: {spec: true}}),
      ),
    ]);
    expect(
      composeReviewGate({
        codeGated: false,
        codeDescription: 'No code review required.',
        spec,
      }),
    ).toEqual({
      state: 'pending',
      description:
        '⏳ Waiting for human spec approval: an eng owner can reply /approve-spec <sha>',
    });
  });

  it('leads with code review when both are missing', () => {
    const spec = readSpecGate([
      trusted(
        'spec-owner-approval',
        'pending',
        mirrorDescription({state: 'pending', missing: {spec: false}}),
      ),
    ]);
    expect(
      composeReviewGate({
        codeGated: true,
        codeDescription: 'Waiting on code review: core change',
        spec,
      }),
    ).toEqual({
      state: 'pending',
      description: 'Waiting on code review: core change (+ spec approval)',
    });
  });

  it('succeeds only when both are satisfied, naming the spec approver', () => {
    const spec = readSpecGate([
      trusted(
        'spec-owner-approval',
        'success',
        mirrorDescription({state: 'success', approvers: ['cixzhang']}),
      ),
    ]);
    expect(
      composeReviewGate({
        codeGated: false,
        codeDescription: 'No code review required.',
        spec,
      }),
    ).toEqual({
      state: 'success',
      description: '✅ Spec approved by @cixzhang · No code review required.',
    });
  });

  it('keeps the code half when no spec decision is published yet', () => {
    expect(
      composeReviewGate({
        codeGated: false,
        codeDescription: 'No code review required.',
        spec: readSpecGate([]),
      }),
    ).toEqual({state: 'success', description: 'No code review required.'});
  });

  it('reads the code half back out of a composed gate', () => {
    expect(
      readCodeGate([
        trusted(
          'review-required',
          'pending',
          'Waiting on code review: core change (+ spec approval)',
        ),
      ]),
    ).toEqual({
      gated: true,
      description: 'Waiting on code review: core change',
    });
    expect(
      readCodeGate([
        trusted(
          'review-required',
          'success',
          '✅ Spec approved by @cixzhang · Cleared by code-owner approval.',
        ),
      ]),
    ).toEqual({gated: false, description: 'Cleared by code-owner approval.'});
  });

  it('never reports a missing approval as a failure', () => {
    for (const missing of [{spec: true}, {spec: false, design: true}]) {
      const gate = composeReviewGate({
        codeGated: false,
        codeDescription: 'No code review required.',
        spec: readSpecGate([
          trusted(
            'spec-owner-approval',
            'pending',
            mirrorDescription({state: 'pending', missing}),
          ),
        ]),
      });
      expect(gate.state).toBe('pending');
    }
  });
});

describe('status text', () => {
  it('names an eng owner whenever engineering approval is missing', () => {
    expect(waitingDescription({spec: true, design: true, theme: false})).toBe(
      '⏳ Waiting for human spec approval: an eng owner can reply /approve-spec <sha>',
    );
  });

  it('names a design or eng owner when only design approval is missing', () => {
    expect(waitingDescription({spec: false, design: true, theme: false})).toBe(
      '⏳ Waiting for human spec approval: a design or eng owner can reply /approve-spec <sha>',
    );
  });

  it('names who approved', () => {
    expect(approvedDescription(['cixzhang'])).toBe(
      '✅ Spec approved by @cixzhang',
    );
    expect(approvedDescription(['cixzhang', 'ernestt'])).toBe(
      '✅ Spec approved by @cixzhang and @ernestt',
    );
  });

  it('fits a commit status description', () => {
    for (const text of [
      waitingDescription({spec: true}),
      waitingDescription({spec: false, design: true}),
    ]) {
      expect(text.length).toBeLessThanOrEqual(140);
    }
  });
});
