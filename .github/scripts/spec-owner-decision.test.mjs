// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {
  OWNER_COMMAND_PREFIXES,
  canonicalRunUrl,
  describeOwnerCommandProblem,
  isDispatchableOwnerCommand,
  newestGateRun,
  parseCanonicalRunId,
  parseOwnerCommand,
  parseOwnerCommandIntent,
  parseOwnerFile,
  parseReadyAttestations,
  requiredApprovalGroups,
  resolveOwnerDecision,
} = require('./spec-owner-decision.cjs');

const head = 'abcdef1234567890abcdef1234567890abcdef12';
const owner = {login: 'cixzhang'};

describe('spec owner decision', () => {
  it('binds approval commands to the current head', () => {
    expect(parseOwnerCommand(`/approve-spec ${head}`, head)).toBe(true);
    expect(
      parseOwnerCommand(
        '/approve-spec 1111111111111111111111111111111111111111',
        head,
      ),
    ).toBe(null);
  });

  it('accepts an owner review only for the current head', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang', 'imdreamrunner'],
      headSha: head,
      comments: [],
      reviews: [
        {
          user: owner,
          state: 'APPROVED',
          commit_id: head,
          submitted_at: '2026-08-30T10:00:00Z',
        },
      ],
    });
    expect(decision.approved).toBe(true);
    expect(decision.source).toBe('review');
  });

  it('requires approval only when current authority is involved', () => {
    const {requiresOwnerApproval} = require('./spec-owner-decision.cjs');
    expect(
      requiresOwnerApproval([
        {baseContent: null, headContent: 'authority: draft'},
      ]),
    ).toBe(false);
    expect(
      requiresOwnerApproval([
        {baseContent: 'authority: draft', headContent: 'authority: "current"'},
      ]),
    ).toBe(true);
    expect(
      requiresOwnerApproval([
        {baseContent: 'authority: current', headContent: 'authority: archived'},
      ]),
    ).toBe(true);
    expect(requiresOwnerApproval([], {complete: false})).toBe(true);
  });

  it('parses DESIGNOWNERS without comment examples', () => {
    expect(
      parseOwnerFile(`
# Uses @handle format and does not grant merge rights.
@rubyycheung @ernestt
# @not-an-owner
@kentonquatman @cvkxx
`),
    ).toEqual(['rubyycheung', 'ernestt', 'kentonquatman', 'cvkxx']);
  });

  it('routes current design and non-design records to separate owner groups', () => {
    expect(
      requiredApprovalGroups([
        {
          path: 'docs/design/selection.md',
          baseContent: null,
          headContent: 'kind: design\nauthority: current',
        },
      ]),
    ).toEqual({spec: false, design: true, theme: false});
    expect(
      requiredApprovalGroups([
        {
          path: 'packages/themes/neutral/neutral.spec.md',
          baseContent: null,
          headContent: 'kind: theme\nauthority: current',
        },
      ]),
    ).toEqual({spec: false, design: false, theme: true});
    expect(
      requiredApprovalGroups([
        {
          path: 'packages/core/src/Button/Button.spec.md',
          baseContent: 'kind: component\nauthority: current',
          headContent: 'kind: component\nauthority: current',
        },
      ]),
    ).toEqual({spec: true, design: false, theme: false});
    expect(
      requiredApprovalGroups(
        [
          {
            path: 'docs/design/selection.md',
            baseContent: 'kind: design\nauthority: current',
            headContent: 'kind: design\nauthority: current',
          },
          {
            path: 'docs/architecture/themes.md',
            baseContent: 'kind: architecture\nauthority: current',
            headContent: 'kind: architecture\nauthority: current',
          },
        ],
        {touchesDesignAssets: true},
      ),
    ).toEqual({spec: true, design: true, theme: false});
    expect(
      requiredApprovalGroups([
        {
          path: 'docs/design/not-a-design-record.md',
          baseContent: null,
          headContent: 'kind: architecture\nauthority: current',
        },
      ]),
    ).toEqual({spec: true, design: false, theme: false});
    expect(
      requiredApprovalGroups([
        {
          path: 'docs/design/themes.md',
          previousPath: 'docs/architecture/themes.md',
          baseContent: 'kind: architecture\nauthority: current',
          headContent: 'kind: design\nauthority: current',
        },
      ]),
    ).toEqual({spec: true, design: true, theme: false});
  });

  it('owner-gates design assets even without a text record', () => {
    expect(requiredApprovalGroups([], {touchesDesignAssets: true})).toEqual({
      spec: false,
      design: true,
      theme: false,
    });
    expect(requiredApprovalGroups([], {complete: false})).toEqual({
      spec: true,
      design: true,
      theme: true,
    });
  });

  it('accepts an exact-head repo-owner review for the theme group', () => {
    const groups = requiredApprovalGroups([
      {
        path: 'packages/themes/neutral/neutral.spec.md',
        baseContent: null,
        headContent: 'kind: theme\nauthority: current',
      },
    ]);
    const decision = resolveOwnerDecision({
      owners: ['cixzhang', 'rubyycheung', 'imdreamrunner'],
      headSha: head,
      comments: [],
      reviews: [
        {
          user: {login: 'rubyycheung'},
          state: 'APPROVED',
          commit_id: head,
          submitted_at: '2026-08-30T10:00:00Z',
        },
      ],
    });

    expect(groups).toEqual({spec: false, design: false, theme: true});
    expect(decision).toMatchObject({
      approved: true,
      owner: 'rubyycheung',
      source: 'review',
    });
  });

  it('does not make a self-declared record owner an approver', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang', 'rubyycheung', 'imdreamrunner'],
      headSha: head,
      comments: [],
      reviews: [
        {
          user: {login: 'self-declared-owner'},
          state: 'APPROVED',
          commit_id: head,
          submitted_at: '2026-08-30T10:00:00Z',
        },
      ],
    });

    expect(decision.approved).toBe(false);
  });

  it('accepts either configured owner', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang', 'imdreamrunner'],
      headSha: head,
      comments: [],
      reviews: [
        {
          user: {login: 'imdreamrunner'},
          state: 'APPROVED',
          commit_id: head,
          submitted_at: '2026-08-30T10:00:00Z',
        },
      ],
    });
    expect(decision.approved).toBe(true);
    expect(decision.owner).toBe('imdreamrunner');
  });

  it('ignores a dismissed owner review', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang', 'imdreamrunner'],
      headSha: head,
      comments: [],
      reviews: [
        {
          user: owner,
          state: 'DISMISSED',
          commit_id: head,
          submitted_at: '2026-08-30T10:01:00Z',
        },
        {
          user: {login: 'imdreamrunner'},
          state: 'APPROVED',
          commit_id: head,
          submitted_at: '2026-08-30T10:00:00Z',
        },
      ],
    });
    expect(decision.approved).toBe(true);
    expect(decision.owner).toBe('imdreamrunner');
  });

  it('keeps the gate blocked when either owner has a current-head objection', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang', 'imdreamrunner'],
      headSha: head,
      comments: [],
      reviews: [
        {
          user: owner,
          state: 'APPROVED',
          commit_id: head,
          submitted_at: '2026-08-30T10:00:00Z',
        },
        {
          user: {login: 'imdreamrunner'},
          state: 'CHANGES_REQUESTED',
          commit_id: head,
          submitted_at: '2026-08-30T10:01:00Z',
        },
      ],
    });
    expect(decision.approved).toBe(false);
    expect(decision.owner).toBe('imdreamrunner');
  });

  it('rejects an approval attached to an older head', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang', 'imdreamrunner'],
      headSha: head,
      comments: [],
      reviews: [
        {
          user: owner,
          state: 'APPROVED',
          commit_id: '1111111111111111111111111111111111111111',
          submitted_at: '2026-08-30T10:00:00Z',
        },
      ],
    });
    expect(decision.approved).toBe(false);
  });

  it('lets the latest owner action revoke an approval', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang', 'imdreamrunner'],
      headSha: head,
      reviews: [
        {
          user: owner,
          state: 'APPROVED',
          commit_id: head,
          submitted_at: '2026-08-30T10:00:00Z',
        },
      ],
      comments: [
        {
          user: owner,
          body: `/revoke-spec ${head}`,
          created_at: '2026-08-30T10:01:00Z',
        },
      ],
    });
    expect(decision.approved).toBe(false);
    expect(decision.source).toBe('command');
  });

  it('ignores commands from other users', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang', 'imdreamrunner'],
      headSha: head,
      reviews: [],
      comments: [
        {
          user: {login: 'someone-else'},
          body: `/approve-spec ${head}`,
          created_at: '2026-08-30T10:00:00Z',
        },
      ],
    });
    expect(decision.approved).toBe(false);
  });

  it('accepts only trusted workflow ready attestations', () => {
    const repository = 'facebook/astryx';
    const trusted = {
      context: 'spec-owner-ready/cixzhang',
      state: 'success',
      description: 'Owner ready at 2026-08-30T10:00:00.000Z.',
      target_url: canonicalRunUrl(repository, '9007199254740993', '2'),
      creator: {login: 'github-actions[bot]'},
    };
    const attestations = parseReadyAttestations(
      [
        trusted,
        {...trusted, creator: {login: 'cixzhang'}},
        {...trusted, target_url: 'https://example.com/forged'},
        {...trusted, description: 'owner says ready'},
      ],
      {repository, headSha: head, owners: ['cixzhang']},
    );

    expect(attestations).toEqual([
      {
        approved: true,
        at: '2026-08-30T10:00:00.000Z',
        headSha: head,
        owner: 'cixzhang',
        source: 'ready',
      },
    ]);
    expect(
      resolveOwnerDecision({
        owners: ['cixzhang'],
        headSha: head,
        reviews: [],
        comments: [],
        readyAttestations: attestations,
      }),
    ).toMatchObject({approved: true, owner: 'cixzhang', source: 'ready'});
  });

  it('invalidates a ready attestation on a new head', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang'],
      headSha: '1111111111111111111111111111111111111111',
      reviews: [],
      comments: [],
      readyAttestations: [
        {
          owner: 'cixzhang',
          headSha: head,
          at: '2026-08-30T10:00:00Z',
        },
      ],
    });

    expect(decision.approved).toBe(false);
  });

  it('lets a newer exact-head revoke override owner-ready', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang'],
      headSha: head,
      reviews: [],
      readyAttestations: [
        {
          owner: 'cixzhang',
          headSha: head,
          at: '2026-08-30T10:00:00Z',
        },
      ],
      comments: [
        {
          user: owner,
          body: `/revoke-spec ${head}`,
          created_at: '2026-08-30T10:01:00Z',
        },
      ],
    });

    expect(decision).toMatchObject({
      approved: false,
      owner: 'cixzhang',
      source: 'command',
    });
  });

  it('orders dismissal by updated_at instead of the original submission', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang'],
      headSha: head,
      comments: [],
      readyAttestations: [
        {
          owner: 'cixzhang',
          headSha: head,
          at: '2026-08-30T10:01:00Z',
        },
      ],
      reviews: [
        {
          id: 17,
          user: owner,
          state: 'DISMISSED',
          commit_id: head,
          submitted_at: '2026-08-30T09:00:00Z',
          updated_at: '2026-08-30T10:02:00Z',
        },
      ],
    });

    expect(decision.approved).toBe(false);
    expect(decision.source).toBe(null);
  });

  it('uses review_dismissed timeline time when it is newer', () => {
    const decision = resolveOwnerDecision({
      owners: ['cixzhang'],
      headSha: head,
      comments: [],
      readyAttestations: [
        {
          owner: 'cixzhang',
          headSha: head,
          at: '2026-08-30T10:01:00Z',
        },
      ],
      reviews: [
        {
          id: 17,
          user: owner,
          state: 'DISMISSED',
          commit_id: head,
          submitted_at: '2026-08-30T09:00:00Z',
          updated_at: '2026-08-30T09:30:00Z',
        },
      ],
      dismissalEvents: [
        {
          event: 'review_dismissed',
          created_at: '2026-08-30T10:02:00Z',
          dismissed_review: {review_id: 17},
        },
      ],
    });

    expect(decision.approved).toBe(false);
  });

  it('compares workflow run ids without losing integer precision', () => {
    const repository = 'facebook/astryx';
    const statuses = ['9007199254740992', '9007199254740993'].map(runId => ({
      context: 'spec-owner-approval',
      state: 'pending',
      description: `Run ${runId}`,
      target_url: canonicalRunUrl(repository, runId, '1'),
      creator: {login: 'github-actions[bot]'},
    }));

    expect(parseCanonicalRunId(statuses[1].target_url, repository)).toBe(
      9007199254740993n,
    );
    expect(newestGateRun(statuses, repository)?.runId).toBe(9007199254740993n);
  });

  it('accepts a ready marker only from a current design owner', () => {
    const repository = 'facebook/astryx';
    const marker = login => ({
      context: `spec-owner-ready/${login}`,
      state: 'success',
      description: 'Owner ready at 2026-08-30T10:00:00.000Z.',
      target_url: canonicalRunUrl(repository, '42', '1'),
      creator: {login: 'github-actions[bot]'},
    });
    const statuses = [marker('ernestt'), marker('imdreamrunner')];

    // imdreamrunner is a spec owner and a design *approver*, but not a design
    // owner. A marker they published — including one predating the rule that
    // only design owners self-attest — is not evidence for any group.
    expect(
      parseReadyAttestations(statuses, {
        repository,
        headSha: head,
        owners: ['ernestt', 'rubyycheung'],
      }).map(attestation => attestation.owner),
    ).toEqual(['ernestt']);

    // A handle removed from DESIGNOWNERS stops counting immediately.
    expect(
      parseReadyAttestations(statuses, {
        repository,
        headSha: head,
        owners: ['rubyycheung'],
      }),
    ).toEqual([]);
    expect(
      parseReadyAttestations(statuses, {repository, headSha: head}),
    ).toEqual([]);
  });

  it('does not let a stale ready marker approve the design group', () => {
    const repository = 'facebook/astryx';
    const designApprovers = ['cixzhang', 'imdreamrunner', 'ernestt'];
    const stale = [
      {
        context: 'spec-owner-ready/imdreamrunner',
        state: 'success',
        description: 'Owner ready at 2026-09-04T05:54:18.000Z.',
        target_url: canonicalRunUrl(repository, '42', '1'),
        creator: {login: 'github-actions[bot]'},
      },
    ];

    expect(
      resolveOwnerDecision({
        owners: designApprovers,
        headSha: head,
        reviews: [],
        comments: [],
        readyAttestations: parseReadyAttestations(stale, {
          repository,
          headSha: head,
          owners: ['ernestt', 'rubyycheung'],
        }),
      }).approved,
    ).toBe(false);
  });

  describe('recognizing a command that does not decide the gate', () => {
    it('recognizes the owner-command shape whatever it names', () => {
      expect(parseOwnerCommandIntent('/approve-spec')).toEqual({
        verb: 'approve',
        argument: '',
      });
      expect(parseOwnerCommandIntent(`/revoke-spec ${head}  `)).toEqual({
        verb: 'revoke',
        argument: head,
      });
      expect(parseOwnerCommandIntent('/approve-spec abc1234 thanks')).toEqual({
        verb: 'approve',
        argument: 'abc1234 thanks',
      });
    });

    it.each([
      undefined,
      '',
      'Looks good to me',
      '/approve-specs abc',
      '/approve-spec-now',
      `Please run /approve-spec ${head}`,
      `  /approve-spec ${head}`,
      `\t/approve-spec ${head}`,
      `/APPROVE-SPEC ${head}`,
      `> /approve-spec ${head}`,
    ])('does not read %s as an owner command', body => {
      expect(parseOwnerCommandIntent(body)).toBe(null);
    });

    it('refuses to decide on a comment the workflow trigger would drop', () => {
      // resolveOwnerDecision reads every comment on the pull request, not just
      // the one that started the run. A comment GitHub's `startsWith` filter
      // never dispatches must not become approval evidence either.
      for (const body of [
        `  /approve-spec ${head}`,
        `/APPROVE-SPEC ${head}`,
        `> /approve-spec ${head}`,
      ]) {
        expect(isDispatchableOwnerCommand(body)).toBe(false);
        expect(parseOwnerCommand(body, head)).toBe(null);
        expect(
          resolveOwnerDecision({
            reviews: [],
            comments: [{user: owner, body, created_at: '2026-08-30T10:00:00Z'}],
            owners: ['cixzhang'],
            headSha: head,
          }).approved,
        ).toBe(false);
      }
    });

    it('admits exactly what the workflow trigger admits', () => {
      // The trigger is `startsWith(github.event.comment.body, '<prefix>')`:
      // the raw body, untrimmed and case-sensitive.
      const triggerAdmits = body =>
        OWNER_COMMAND_PREFIXES.some(prefix => String(body).startsWith(prefix));

      for (const body of [
        `/approve-spec ${head}`,
        '/approve-spec',
        '/revoke-spec',
        `/revoke-spec ${head}`,
        '/approve-spec abc1234',
        '/approve-spec-now',
        `  /approve-spec ${head}`,
        `/APPROVE-SPEC ${head}`,
        'Looks good to me',
        '',
      ]) {
        expect(isDispatchableOwnerCommand(body), body).toBe(
          triggerAdmits(body),
        );
      }
    });

    it('explains each way a recognized command misses the head', () => {
      const stale = '1111111111111111111111111111111111111111';
      expect(
        describeOwnerCommandProblem(
          parseOwnerCommandIntent('/approve-spec'),
          head,
        ),
      ).toContain('did not name a commit');
      expect(
        describeOwnerCommandProblem(
          parseOwnerCommandIntent('/approve-spec abc1234'),
          head,
        ),
      ).toContain('full 40-character commit SHA');
      expect(
        describeOwnerCommandProblem(
          parseOwnerCommandIntent(`/approve-spec ${stale}`),
          head,
        ),
      ).toContain('1111111');
    });

    it('accepts a commit SHA in either casing', () => {
      const upper = head.toUpperCase();

      // A SHA copied from a UI that renders it uppercase is the same commit.
      // The validator and the parser must agree, or the gate reports no
      // problem while silently ignoring the command.
      expect(parseOwnerCommand(`/approve-spec ${upper}`, head)).toBe(true);
      expect(parseOwnerCommand(`/revoke-spec ${upper}`, head)).toBe(false);
      expect(
        describeOwnerCommandProblem(
          parseOwnerCommandIntent(`/approve-spec ${upper}`),
          head,
        ),
      ).toBe(null);
      expect(parseOwnerCommand(`/approve-spec ${head}`, upper)).toBe(true);
    });

    it('agrees with the help validator on every recognized command', () => {
      const stale = '1111111111111111111111111111111111111111';

      for (const body of [
        `/approve-spec ${head}`,
        `/approve-spec ${head.toUpperCase()}`,
        `/revoke-spec ${head}`,
        '/approve-spec',
        '/approve-spec abc1234',
        `/approve-spec ${stale}`,
        `/approve-spec ${stale.toUpperCase()}`,
        `/approve-spec ${head} please`,
      ]) {
        const intent = parseOwnerCommandIntent(body);
        const decided = parseOwnerCommand(body, head) !== null;
        const problem = describeOwnerCommandProblem(intent, head);
        // Exactly one of the two is true: the command decides the gate, or
        // the gate can say why it did not.
        expect(decided, body).toBe(problem === null);
      }
    });

    it('reports no problem for the exact form the gate accepts', () => {
      const intent = parseOwnerCommandIntent(`/approve-spec ${head}`);

      expect(describeOwnerCommandProblem(intent, head)).toBe(null);
      expect(parseOwnerCommand(`/approve-spec ${head}`, head)).toBe(true);
      expect(describeOwnerCommandProblem(null, head)).toBe(null);
    });
  });
});
