// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {
  parseOwnerCommand,
  parseOwnerFile,
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
    ).toEqual({spec: false, design: true});
    expect(
      requiredApprovalGroups([
        {
          path: 'packages/core/src/Button/Button.spec.md',
          baseContent: 'kind: component\nauthority: current',
          headContent: 'kind: component\nauthority: current',
        },
      ]),
    ).toEqual({spec: true, design: false});
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
    ).toEqual({spec: true, design: true});
    expect(
      requiredApprovalGroups([
        {
          path: 'docs/design/not-a-design-record.md',
          baseContent: null,
          headContent: 'kind: architecture\nauthority: current',
        },
      ]),
    ).toEqual({spec: true, design: false});
    expect(
      requiredApprovalGroups([
        {
          path: 'docs/design/themes.md',
          previousPath: 'docs/architecture/themes.md',
          baseContent: 'kind: architecture\nauthority: current',
          headContent: 'kind: design\nauthority: current',
        },
      ]),
    ).toEqual({spec: true, design: true});
  });

  it('owner-gates design assets even without a text record', () => {
    expect(requiredApprovalGroups([], {touchesDesignAssets: true})).toEqual({
      spec: false,
      design: true,
    });
    expect(requiredApprovalGroups([], {complete: false})).toEqual({
      spec: true,
      design: true,
    });
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
});
