// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {afterEach, describe, expect, it} from 'vitest';

import {
  assertLatestCompletedCI,
  expandCIHistory,
  promotionFailure,
  promotionStatusProjection,
  recoveryComplete,
  recoveryOperationResult,
  resolveAcceptanceIdentity,
  resolveCIState,
  resolvePullRequestIdentity,
} from './promotion-identity.mjs';

const HEAD = 'a'.repeat(40);
const MERGE = 'b'.repeat(40);
const RECORD_REL = '123/2/acceptance.json';
const roots = [];

afterEach(() => {
  for (const root of roots.splice(0)) {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

function pull(overrides = {}) {
  const value = {
    number: 42,
    state: 'closed',
    merged: true,
    merged_at: '2026-08-27T07:50:43Z',
    base: {ref: 'main', repo: {full_name: 'facebook/astryx'}},
    head: {sha: HEAD, ref: 'feature', repo: {id: 99}},
    merge_commit_sha: MERGE,
  };
  return {
    ...value,
    ...overrides,
    base: {...value.base, ...overrides.base},
    head: {...value.head, ...overrides.head},
  };
}

function resolvePull(value = pull(), overrides = {}) {
  return resolvePullRequestIdentity({
    pull: value,
    requestedPr: 42,
    repository: 'facebook/astryx',
    baseRef: 'main',
    compareStatus: 'ahead',
    ...overrides,
  });
}

function acceptanceFixture() {
  const pages = fs.mkdtempSync(path.join(os.tmpdir(), 'promotion-identity-'));
  roots.push(pages);
  const root = path.join(pages, 'visual-gate', 'acceptances', '42', HEAD);
  fs.mkdirSync(path.join(root, '123', '2'), {recursive: true});
  fs.writeFileSync(
    path.join(root, 'current.json'),
    `${JSON.stringify({
      version: 1,
      run: 123,
      attempt: 2,
      record: RECORD_REL,
    })}\n`,
  );
  fs.writeFileSync(
    path.join(root, RECORD_REL),
    `${JSON.stringify({
      version: 1,
      repo: 'facebook/astryx',
      pr: 42,
      headSha: HEAD,
      run: {id: 123, attempt: 2},
    })}\n`,
  );
  return {pages, root};
}

describe('promotion PR identity', () => {
  it('returns only server-resolved identity for a merge reachable from main', () => {
    expect(resolvePull()).toEqual({
      pr: 42,
      headSha: HEAD,
      mergeSha: MERGE,
    });
  });

  it('does not depend on a merged PR head branch still existing', () => {
    expect(resolvePull(pull({head: {repo: null, ref: null}}))).toMatchObject({
      pr: 42,
      headSha: HEAD,
      mergeSha: MERGE,
    });
  });

  it.each([
    [
      'an invalid PR number',
      pull(),
      {requestedPr: 'not-a-number'},
      /invalid PR number/,
    ],
    ['the wrong PR response', pull({number: 43}), {}, /wrong PR/],
    [
      'an open PR',
      pull({state: 'open', merged: false, merged_at: null}),
      {},
      /not merged/,
    ],
    [
      'an unmerged closed PR',
      pull({merged: false, merged_at: null}),
      {},
      /not merged/,
    ],
    ['a non-main base', pull({base: {ref: 'release'}}), {}, /not merged into/],
    [
      'a different base repository',
      pull({base: {repo: {full_name: 'fork/astryx'}}}),
      {},
      /not merged into/,
    ],
    [
      'an invalid head SHA',
      pull({head: {sha: 'bad'}}),
      {},
      /head SHA is invalid/,
    ],
    [
      'an invalid merge SHA',
      pull({merge_commit_sha: 'bad'}),
      {},
      /merge SHA is invalid/,
    ],
    [
      'a merge not in main',
      pull(),
      {compareStatus: 'diverged'},
      /not reachable from main/,
    ],
  ])('fails closed for %s', (_name, value, overrides, error) => {
    expect(() => resolvePull(value, overrides)).toThrow(error);
  });
});

describe('promotion acceptance identity', () => {
  it('binds the current pointer to its immutable record', () => {
    const {pages} = acceptanceFixture();
    expect(
      resolveAcceptanceIdentity({pages, pr: 42, head: HEAD}),
    ).toMatchObject({
      found: true,
      recordRel: RECORD_REL,
      runId: 123,
      runAttempt: 2,
    });
  });

  it('allows no acceptance only for normal closed-PR promotion', () => {
    const pages = fs.mkdtempSync(path.join(os.tmpdir(), 'promotion-identity-'));
    roots.push(pages);
    expect(
      resolveAcceptanceIdentity({pages, pr: 42, head: HEAD, missingOk: true}),
    ).toEqual({found: false});
    expect(() =>
      resolveAcceptanceIdentity({pages, pr: 42, head: HEAD}),
    ).toThrow(/pointer is missing/);
  });

  it('rejects a stale current pointer', () => {
    const {pages} = acceptanceFixture();
    expect(() =>
      resolveAcceptanceIdentity({
        pages,
        pr: 42,
        head: HEAD,
        expectedRecordRel: '124/1/acceptance.json',
      }),
    ).toThrow(/superseded/);
  });

  it('rejects a malformed current pointer', () => {
    const {pages, root} = acceptanceFixture();
    fs.writeFileSync(
      path.join(root, 'current.json'),
      `${JSON.stringify({
        version: 1,
        run: 123,
        attempt: 2,
        record: '../acceptance.json',
      })}\n`,
    );
    expect(() =>
      resolveAcceptanceIdentity({pages, pr: 42, head: HEAD}),
    ).toThrow(/pointer is invalid/);
  });

  it('rejects a missing immutable record', () => {
    const {pages, root} = acceptanceFixture();
    fs.rmSync(path.join(root, RECORD_REL));
    expect(() =>
      resolveAcceptanceIdentity({pages, pr: 42, head: HEAD}),
    ).toThrow(/record is missing/);
  });

  it.each([
    ['repository', record => (record.repo = 'fork/astryx')],
    ['PR', record => (record.pr = 43)],
    ['head', record => (record.headSha = 'c'.repeat(40))],
    ['run', record => (record.run.id = 124)],
    ['attempt', record => (record.run.attempt = 1)],
  ])('rejects a record %s mismatch', (_name, mutate) => {
    const {pages, root} = acceptanceFixture();
    const file = path.join(root, RECORD_REL);
    const record = JSON.parse(fs.readFileSync(file, 'utf8'));
    mutate(record);
    fs.writeFileSync(file, `${JSON.stringify(record)}\n`);
    expect(() =>
      resolveAcceptanceIdentity({pages, pr: 42, head: HEAD}),
    ).toThrow(/record identity does not match/);
  });

  describe('CI attempt resolution', () => {
    const ci = (id, attempt, status, conclusion = null) => ({
      name: 'CI',
      id,
      run_attempt: attempt,
      status,
      conclusion,
    });

    it('loads prior attempts when the list exposes only active R/3', () => {
      const loaded = [];
      const history = expandCIHistory(
        [ci(123, 3, 'in_progress')],
        (runId, attempt) => {
          loaded.push([runId, attempt]);
          return ci(runId, attempt, 'completed', 'success');
        },
      );
      expect(loaded).toEqual([[123, 2]]);
      expect(resolveCIState(history, {runId: 123, runAttempt: 2})).toEqual({
        latestCompleted: {id: 123, attempt: 2},
        newerActive: {id: 123, attempt: 3, status: 'in_progress'},
      });
    });

    it('keeps completed R/2 eligible while active R/3 defers mutation', () => {
      expect(
        resolveCIState(
          [ci(123, 3, 'in_progress'), ci(123, 2, 'completed', 'success')],
          {runId: 123, runAttempt: 2},
        ),
      ).toEqual({
        latestCompleted: {id: 123, attempt: 2},
        newerActive: {id: 123, attempt: 3, status: 'in_progress'},
      });
    });

    it('supersedes R/2 after R/3 completes', () => {
      expect(() =>
        resolveCIState(
          [
            ci(123, 2, 'completed', 'success'),
            ci(123, 3, 'completed', 'success'),
          ],
          {runId: 123, runAttempt: 2},
        ),
      ).toThrow(/latest completed CI attempt/);
    });

    it('keeps R/2 eligible after R/3 is cancelled', () => {
      expect(
        resolveCIState(
          [
            ci(123, 3, 'completed', 'cancelled'),
            ci(123, 2, 'completed', 'success'),
          ],
          {runId: 123, runAttempt: 2},
        ),
      ).toEqual({
        latestCompleted: {id: 123, attempt: 2},
        newerActive: null,
      });
    });

    it('orders different run ids and attempts independently of API order', () => {
      const runs = [
        ci(125, 1, 'queued'),
        ci(123, 2, 'completed', 'success'),
        ci(124, 1, 'completed', 'cancelled'),
        ci(122, 9, 'completed', 'success'),
        ci(999, 1, 'completed', 'success'),
      ];
      // A non-CI workflow with a larger id must not participate.
      runs.at(-1).name = 'Lint';
      expect(
        resolveCIState(runs.reverse(), {runId: 123, runAttempt: 2}),
      ).toEqual({
        latestCompleted: {id: 123, attempt: 2},
        newerActive: {id: 125, attempt: 1, status: 'queued'},
      });
    });

    it('does not use the first API element as latest completed evidence', () => {
      expect(
        assertLatestCompletedCI(
          [
            ci(120, 1, 'completed', 'success'),
            ci(123, 2, 'completed', 'success'),
            ci(121, 8, 'completed', 'success'),
          ],
          {runId: 123, runAttempt: 2},
        ),
      ).toEqual({
        latestCompleted: {id: 123, attempt: 2},
        newerActive: null,
      });
    });
  });
});

function projectedFailure(run) {
  try {
    run();
    throw new Error('expected resolver refusal');
  } catch (error) {
    const failure = promotionFailure(error);
    return {
      failure,
      projection: promotionStatusProjection({
        headKnown: true,
        validationOk: false,
        acceptanceFound: false,
        promotionResult: 'skipped',
        failureDescription: failure.description,
      }),
    };
  }
}

describe('promotion status projection', () => {
  it.each([
    ['wrong PR response', () => resolvePull(pull({number: 43}))],
    [
      'open or unmerged PR',
      () => resolvePull(pull({state: 'open', merged: false, merged_at: null})),
    ],
    ['non-main PR', () => resolvePull(pull({base: {ref: 'release'}}))],
    [
      'merge outside main',
      () => resolvePull(pull(), {compareStatus: 'diverged'}),
    ],
  ])('keeps %s status-silent while the workflow fails', (_name, run) => {
    let failure;
    try {
      run();
    } catch (error) {
      failure = promotionFailure(error);
    }
    expect(failure).toBeDefined();
    expect(
      promotionStatusProjection({
        headKnown: false,
        validationOk: false,
        acceptanceFound: false,
        promotionResult: 'skipped',
        failureDescription: failure.description,
      }),
    ).toBeNull();
  });

  it.each([
    [
      'missing pointer',
      () => {
        const pages = fs.mkdtempSync(
          path.join(os.tmpdir(), 'promotion-identity-'),
        );
        roots.push(pages);
        return resolveAcceptanceIdentity({pages, pr: 42, head: HEAD});
      },
    ],
    [
      'stale pointer',
      () => {
        const {pages} = acceptanceFixture();
        return resolveAcceptanceIdentity({
          pages,
          pr: 42,
          head: HEAD,
          expectedRecordRel: '124/1/acceptance.json',
        });
      },
    ],
    [
      'missing record',
      () => {
        const {pages, root} = acceptanceFixture();
        fs.rmSync(path.join(root, RECORD_REL));
        return resolveAcceptanceIdentity({pages, pr: 42, head: HEAD});
      },
    ],
    [
      'record mismatch',
      () => {
        const {pages, root} = acceptanceFixture();
        const file = path.join(root, RECORD_REL);
        const record = JSON.parse(fs.readFileSync(file, 'utf8'));
        record.pr = 43;
        fs.writeFileSync(file, `${JSON.stringify(record)}\n`);
        return resolveAcceptanceIdentity({pages, pr: 42, head: HEAD});
      },
    ],
    [
      'latest CI mismatch',
      () =>
        assertLatestCompletedCI(
          [{name: 'CI', id: 124, run_attempt: 1, status: 'completed'}],
          {runId: 123, runAttempt: 2},
        ),
    ],
  ])('writes a precise failure for %s', (_name, run) => {
    const {failure, projection} = projectedFailure(run);
    expect(failure.code).not.toBe('infrastructure-failure');
    expect(projection).toEqual({
      state: 'failure',
      description: failure.description,
    });
    expect(projection.description.length).toBeLessThanOrEqual(140);
  });

  it.each([
    ['deferred plus lock release failure', 'failure', 'Lock release failed.'],
    ['deferred plus gate dispatch failure', 'failure', 'Gate dispatch failed.'],
    ['deferred plus publication failure', 'failure', 'Publication failed.'],
    ['deferred plus failed job', 'failure', 'Trusted operation failed.'],
    [
      'deferred plus cancelled job',
      'cancelled',
      'Trusted operation cancelled.',
    ],
  ])(
    'projects %s as failure, never pending',
    (_name, promotionResult, failureDescription) => {
      expect(
        promotionStatusProjection({
          headKnown: true,
          validationOk: true,
          acceptanceFound: true,
          mutationDeferred: true,
          deferredDescription:
            'Visual promotion deferred: a newer CI retry is still active.',
          promotionResult,
          failureDescription,
        }),
      ).toEqual({state: 'failure', description: failureDescription});
    },
  );

  it('composes a clean successful defer job into pending', () => {
    const promotionResult = recoveryOperationResult({
      jobResult: 'success',
      recoveryComplete: false,
      mutationDeferred: true,
      failureDescription: '',
    });
    expect(promotionResult).toBe('deferred');
    expect(
      promotionStatusProjection({
        headKnown: true,
        validationOk: true,
        acceptanceFound: true,
        mutationDeferred: true,
        deferredDescription:
          'Visual promotion deferred: a newer CI retry is still active.',
        promotionResult,
        failureDescription: '',
      }),
    ).toEqual({
      state: 'pending',
      description:
        'Visual promotion deferred: a newer CI retry is still active.',
    });
  });

  it('projects active CI retries as pending only after trusted defer succeeds', () => {
    expect(
      promotionStatusProjection({
        headKnown: true,
        validationOk: true,
        acceptanceFound: true,
        mutationDeferred: true,
        deferredDescription:
          'Visual promotion deferred: a newer CI retry is still active.',
        promotionResult: 'deferred',
        failureDescription: '',
      }),
    ).toEqual({
      state: 'pending',
      description:
        'Visual promotion deferred: a newer CI retry is still active.',
    });
  });

  it('treats an unexpected skipped promote job with acceptance as failure', () => {
    expect(
      promotionStatusProjection({
        headKnown: true,
        validationOk: true,
        acceptanceFound: true,
        mutationDeferred: true,
        deferredDescription:
          'Visual promotion deferred: a newer CI retry is still active.',
        promotionResult: 'skipped',
        failureDescription: '',
      }),
    ).toEqual({
      state: 'failure',
      description: 'Visual promotion failed; inspect the linked workflow run.',
    });
  });

  it('requires the entire trusted operation before returning success', () => {
    const scenarios = [
      {
        name: 'push succeeds but gate dispatch fails',
        publicationConfirmed: true,
        gateOutcome: 'failure',
        releaseOutcome: 'success',
        jobResult: 'failure',
        expected: 'failure',
      },
      {
        name: 'push succeeds but lock release fails',
        publicationConfirmed: true,
        gateOutcome: 'success',
        releaseOutcome: 'failure',
        jobResult: 'failure',
        expected: 'failure',
      },
      {
        name: 'clean deferred operation',
        publicationConfirmed: false,
        gateOutcome: 'skipped',
        releaseOutcome: 'skipped',
        jobResult: 'success',
        mutationDeferred: true,
        expected: 'deferred',
      },
      {
        name: 'unexpected skipped promote job with accepted record',
        publicationConfirmed: false,
        gateOutcome: 'skipped',
        releaseOutcome: 'skipped',
        jobResult: 'skipped',
        mutationDeferred: true,
        expected: 'failure',
      },
      {
        name: 'deferred flag cannot hide an operational failure',
        publicationConfirmed: false,
        gateOutcome: 'failure',
        releaseOutcome: 'success',
        jobResult: 'failure',
        mutationDeferred: true,
        failureDescription: 'Gate dispatch failed.',
        expected: 'failure',
      },
      {
        name: 'push or no-op and finalization succeed',
        publicationConfirmed: true,
        gateOutcome: 'success',
        releaseOutcome: 'success',
        jobResult: 'success',
        expected: 'success',
      },
      {
        name: 'job is cancelled after push',
        publicationConfirmed: true,
        gateOutcome: 'success',
        releaseOutcome: 'success',
        jobResult: 'cancelled',
        expected: 'failure',
      },
    ];
    for (const scenario of scenarios) {
      const complete = recoveryComplete(scenario);
      const operation = recoveryOperationResult({
        jobResult: scenario.jobResult,
        recoveryComplete: complete,
        mutationDeferred: scenario.mutationDeferred ?? false,
        failureDescription: scenario.failureDescription ?? null,
      });
      expect(operation, scenario.name).toBe(scenario.expected);
    }
  });

  it('writes success only after publication succeeds', () => {
    const base = {
      headKnown: true,
      validationOk: true,
      acceptanceFound: true,
      failureDescription: '',
    };
    expect(
      promotionStatusProjection({...base, promotionResult: 'failure'}),
    ).toEqual({
      state: 'failure',
      description: 'Visual promotion failed; inspect the linked workflow run.',
    });
    expect(
      promotionStatusProjection({...base, promotionResult: 'cancelled'}),
    ).toMatchObject({state: 'failure'});
    expect(
      promotionStatusProjection({...base, promotionResult: 'success'}),
    ).toEqual({
      state: 'success',
      description: 'Accepted pixels promoted to the visual baseline.',
    });
  });

  it('preserves normal close behavior when no acceptance exists', () => {
    expect(
      promotionStatusProjection({
        headKnown: true,
        validationOk: true,
        acceptanceFound: false,
        promotionResult: 'skipped',
        failureDescription: '',
      }),
    ).toBeNull();
  });

  it('cannot project a status without a server-resolved head', () => {
    expect(
      promotionStatusProjection({
        headKnown: false,
        validationOk: false,
        acceptanceFound: false,
        promotionResult: 'skipped',
        failureDescription: 'Recovery refused: PR was not found.',
      }),
    ).toBeNull();
  });
});
