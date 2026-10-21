// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {
  MAX_CANDIDATE_HEADS,
  baseTouchedChangedPaths,
  carryCandidates,
  differingPaths,
  isApprovalMetadataOnlyChange,
} = require('./spec-approval-carry.cjs');

const owners = ['cixzhang', 'czarandy'];
const current = '1111111111111111111111111111111111111111';
const earlier = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const older = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

function command(verb, sha, at, login = 'cixzhang') {
  return {user: {login}, body: `/${verb}-spec ${sha}`, created_at: at};
}

// The shape of a real draft record before and after its author recorded the
// owner's approval of an earlier head.
function record({
  authority = 'draft',
  approvedBy = 'null',
  approvedAt = 'null',
  phase = 'proposed',
  decided = '<pending>',
  body = 'Prebuilt CSS provides every data variable default.',
} = {}) {
  return [
    '---',
    'schema_version: 4',
    'template_version: 1',
    'kind: system-spec',
    'id: spec:AST-066',
    `authority: ${authority}`,
    'archive_reason: null',
    'superseded_by: null',
    `approved_by: ${approvedBy}`,
    `approved_at: ${approvedAt}`,
    `phase: ${phase}`,
    'owners: [cixzhang]',
    '---',
    '',
    body,
    '',
    '### DEC-9 — Data defaults ship with prebuilt CSS',
    '',
    `**Decider:** \`cixzhang\`, \`${decided}\``,
    '',
  ].join('\n');
}

const recorded = {
  authority: 'current',
  approvedBy: 'cixzhang',
  approvedAt: '2026-10-20',
  phase: 'accepted',
  decided: '2026-10-20',
};
const approval = {approver: 'cixzhang', approvedAt: '2026-10-20T18:31:30Z'};

describe('isApprovalMetadataOnlyChange', () => {
  it('accepts recording the approval in the record', () => {
    expect(
      isApprovalMetadataOnlyChange(record(), record(recorded), approval),
    ).toBe(true);
  });

  it('accepts identical bytes', () => {
    expect(isApprovalMetadataOnlyChange(record(), record(), approval)).toBe(
      true,
    );
  });

  it('accepts the approval day on either side of the UTC date', () => {
    for (const day of ['2026-10-19', '2026-10-21']) {
      expect(
        isApprovalMetadataOnlyChange(
          record(),
          record({...recorded, approvedAt: day, decided: day}),
          approval,
        ),
      ).toBe(true);
    }
  });

  it('accepts redating an already-current record to the new approval', () => {
    const before = record({...recorded, approvedAt: '2026-08-30'});
    expect(
      isApprovalMetadataOnlyChange(before, record(recorded), approval),
    ).toBe(true);
  });

  it('rejects any edit to the record text', () => {
    expect(
      isApprovalMetadataOnlyChange(
        record(),
        record({...recorded, body: 'Prebuilt CSS provides some defaults.'}),
        approval,
      ),
    ).toBe(false);
  });

  it('rejects an added or removed line', () => {
    expect(
      isApprovalMetadataOnlyChange(
        record(),
        `${record(recorded)}\nA new paragraph.\n`,
        approval,
      ),
    ).toBe(false);
  });

  it('rejects approved_by naming anyone but the approver', () => {
    expect(
      isApprovalMetadataOnlyChange(
        record(),
        record({...recorded, approvedBy: 'czarandy'}),
        approval,
      ),
    ).toBe(false);
  });

  it('rejects a date far from the approval', () => {
    expect(
      isApprovalMetadataOnlyChange(
        record(),
        record({...recorded, approvedAt: '2026-10-25'}),
        approval,
      ),
    ).toBe(false);
  });

  it('rejects authority or phase moving anywhere but to approved', () => {
    expect(
      isApprovalMetadataOnlyChange(
        record(),
        record({authority: 'archived'}),
        approval,
      ),
    ).toBe(false);
    expect(
      isApprovalMetadataOnlyChange(
        record(),
        record({phase: 'shipped'}),
        approval,
      ),
    ).toBe(false);
  });

  it('rejects other frontmatter fields', () => {
    expect(
      isApprovalMetadataOnlyChange(
        record(),
        record().replace('owners: [cixzhang]', 'owners: [czarandy]'),
        approval,
      ),
    ).toBe(false);
  });

  it('rejects approval fields outside the frontmatter', () => {
    const before = `${record()}authority: draft\n`;
    const after = `${record()}authority: current\n`;
    expect(isApprovalMetadataOnlyChange(before, after, approval)).toBe(false);
  });

  it('rejects a Decider that moves to someone other than the approver', () => {
    expect(
      isApprovalMetadataOnlyChange(
        record(),
        record(recorded).replace('`cixzhang`, `2026', '`czarandy`, `2026'),
        approval,
      ),
    ).toBe(false);
  });

  it('rejects redating a Decider line that already has a date', () => {
    const before = record({decided: '2026-09-01'});
    expect(
      isApprovalMetadataOnlyChange(before, record(recorded), approval),
    ).toBe(false);
  });

  it('rejects reassigning a Decider line that names a person', () => {
    const before = record().replace(
      '`cixzhang`, `<pending>`',
      '`czarandy`, `<pending>`',
    );
    expect(
      isApprovalMetadataOnlyChange(before, record(recorded), approval),
    ).toBe(false);
  });

  it('accepts a placeholder Decider gaining the approver and date', () => {
    const before = record().replace(
      '`cixzhang`, `<pending>`',
      '`<person>`, `<YYYY-MM-DD>`',
    );
    expect(
      isApprovalMetadataOnlyChange(before, record(recorded), approval),
    ).toBe(true);
  });

  it('rejects unreadable content or an unknown approval', () => {
    expect(isApprovalMetadataOnlyChange(null, record(), approval)).toBe(false);
    expect(
      isApprovalMetadataOnlyChange(record(), record(recorded), {
        approver: 'cixzhang',
        approvedAt: 'not a date',
      }),
    ).toBe(false);
  });
});

describe('differingPaths', () => {
  const file = (filename, sha, extra = {}) => ({
    filename,
    status: 'modified',
    sha,
    ...extra,
  });

  it('lists only the paths whose bytes differ', () => {
    expect(
      differingPaths(
        [file('a.md', '1'), file('b.md', '2')],
        [file('a.md', '1'), file('b.md', '3')],
      ),
    ).toEqual([file('b.md', '3')]);
  });

  it('refuses heads that change different paths', () => {
    expect(differingPaths([file('a.md', '1')], [file('b.md', '1')])).toBe(null);
    expect(
      differingPaths(
        [file('a.md', '1')],
        [file('a.md', '1'), file('b.md', '2')],
      ),
    ).toBe(null);
  });

  it('refuses a changed status or rename source', () => {
    expect(
      differingPaths(
        [file('a.md', '1')],
        [file('a.md', '1', {status: 'added'})],
      ),
    ).toBe(null);
    expect(
      differingPaths(
        [file('a.md', '1', {status: 'renamed', previous_filename: 'x.md'})],
        [file('a.md', '1', {status: 'renamed', previous_filename: 'y.md'})],
      ),
    ).toBe(null);
  });

  it('refuses a file without a blob id', () => {
    expect(differingPaths([file('a.md', '1')], [file('a.md', undefined)])).toBe(
      null,
    );
  });
});

describe('carryCandidates', () => {
  it('offers an earlier head an owner approved', () => {
    expect(
      carryCandidates({
        reviews: [],
        comments: [command('approve', earlier, '2026-10-20T18:31:30Z')],
        owners,
        headSha: current,
      }),
    ).toEqual([
      {headSha: earlier, owner: 'cixzhang', at: '2026-10-20T18:31:30.000Z'},
    ]);
  });

  it('offers same-repository review approvals too, newest first', () => {
    const candidates = carryCandidates({
      reviews: [
        {
          user: {login: 'czarandy'},
          state: 'APPROVED',
          commit_id: older,
          submitted_at: '2026-10-20T10:00:00Z',
        },
      ],
      comments: [command('approve', earlier, '2026-10-20T18:31:30Z')],
      owners,
      headSha: current,
    });
    expect(candidates.map(candidate => candidate.headSha)).toEqual([
      earlier,
      older,
    ]);
  });

  it('never offers the current head', () => {
    expect(
      carryCandidates({
        reviews: [],
        comments: [command('approve', current, '2026-10-20T18:31:30Z')],
        owners,
        headSha: current,
      }),
    ).toEqual([]);
  });

  it('drops an approval that a later revoke or request for changes follows', () => {
    expect(
      carryCandidates({
        reviews: [],
        comments: [
          command('approve', earlier, '2026-10-20T18:31:30Z'),
          command('revoke', older, '2026-10-20T19:00:00Z', 'czarandy'),
        ],
        owners,
        headSha: current,
      }),
    ).toEqual([]);
    expect(
      carryCandidates({
        reviews: [
          {
            user: {login: 'czarandy'},
            state: 'CHANGES_REQUESTED',
            commit_id: older,
            submitted_at: '2026-10-20T19:00:00Z',
          },
        ],
        comments: [command('approve', earlier, '2026-10-20T18:31:30Z')],
        owners,
        headSha: current,
      }),
    ).toEqual([]);
  });

  it('keeps an approval given after an earlier rejection', () => {
    expect(
      carryCandidates({
        reviews: [],
        comments: [
          command('revoke', older, '2026-10-20T10:00:00Z'),
          command('approve', earlier, '2026-10-20T18:31:30Z'),
        ],
        owners,
        headSha: current,
      }),
    ).toHaveLength(1);
  });

  it('ignores commands from outside the owner group', () => {
    expect(
      carryCandidates({
        reviews: [],
        comments: [
          command('approve', earlier, '2026-10-20T18:31:30Z', 'contributor'),
        ],
        owners,
        headSha: current,
      }),
    ).toEqual([]);
  });

  it('examines only the newest approvals', () => {
    const comments = Array.from({length: MAX_CANDIDATE_HEADS + 2}, (_, i) =>
      command(
        'approve',
        String(i + 2)
          .repeat(40)
          .slice(0, 40),
        `2026-10-20T1${i}:00:00Z`,
      ),
    );
    expect(
      carryCandidates({reviews: [], comments, owners, headSha: current}),
    ).toHaveLength(MAX_CANDIDATE_HEADS);
  });
});

describe('baseTouchedChangedPaths', () => {
  const changed = [
    {filename: 'docs/specs/AST-1/spec.md'},
    {filename: 'docs/new.md', previous_filename: 'docs/old.md'},
  ];

  it('finds a base edit to a changed path', () => {
    expect(
      baseTouchedChangedPaths(changed, [
        {filename: 'docs/specs/AST-1/spec.md'},
      ]),
    ).toBe(true);
  });

  it('finds a base edit to a renamed path on either side', () => {
    expect(baseTouchedChangedPaths(changed, [{filename: 'docs/old.md'}])).toBe(
      true,
    );
    expect(
      baseTouchedChangedPaths(changed, [
        {filename: 'docs/moved.md', previous_filename: 'docs/new.md'},
      ]),
    ).toBe(true);
  });

  it('ignores base edits to other paths', () => {
    expect(baseTouchedChangedPaths(changed, [{filename: 'README.md'}])).toBe(
      false,
    );
  });
});
