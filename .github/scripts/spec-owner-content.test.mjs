// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {
  approvedDescription,
  contentStatusDescription,
  fingerprintSpecContent,
  normalizeRecordText,
  parseOwnerCommandTarget,
  readContentClock,
  waitingDescription,
} = require('./spec-owner-content.cjs');

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
    ['/spec ok', {approved: true, sha: null}],
    ['/spec OK', {approved: true, sha: null}],
    ['/approve-spec', {approved: true, sha: null}],
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
    '/spec okay',
    '/spec ok please',
    '/approve-spec abc1234',
    '/approve-specs',
  ])('does not read %s as a command', body => {
    expect(parseOwnerCommandTarget(body)).toBe(null);
  });
});

describe('content clock', () => {
  const {fingerprint} = fingerprintSpecContent([
    {path: 'docs/a.md', content: record},
  ]);
  const since = '2026-10-28T23:00:00.000Z';

  it('reads the time the workflow recorded for this content', () => {
    expect(
      readContentClock(
        [trusted(contentStatusDescription(fingerprint, since))],
        fingerprint,
      ),
    ).toBe(since);
  });

  it('ignores a clock for other content or from another author', () => {
    const other = '0'.repeat(64);
    expect(
      readContentClock(
        [trusted(contentStatusDescription(other, since))],
        fingerprint,
      ),
    ).toBe(null);
    expect(
      readContentClock(
        [
          {
            ...trusted(contentStatusDescription(fingerprint, since)),
            creator: {login: 'someone'},
          },
        ],
        fingerprint,
      ),
    ).toBe(null);
  });
});

describe('status text', () => {
  it('names an eng owner whenever engineering approval is missing', () => {
    expect(waitingDescription({spec: true, design: true, theme: false})).toBe(
      '⏳ Waiting for human spec approval: an eng owner can reply /spec ok',
    );
  });

  it('names a design or eng owner when only design approval is missing', () => {
    expect(waitingDescription({spec: false, design: true, theme: false})).toBe(
      '⏳ Waiting for human spec approval: a design or eng owner can reply /spec ok',
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
