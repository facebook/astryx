// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it, vi} from 'vitest';

import {
  previewOrigin,
  resolveVercelDeploymentEvent,
  resolveVercelPreview,
} from './vercel-preview.mjs';

const SHA = 'a'.repeat(40);
const OLD_SHA = 'b'.repeat(40);
const ORIGIN = 'https://astryx-3s4xgbci4-fbopensource.vercel.app';

function fixture({
  head = SHA,
  draft = false,
  state = 'open',
  deployments,
  statuses,
  candidates = [
    {
      number: 123,
      state: 'open',
      draft: false,
      head: {sha: SHA, repo: {full_name: 'contributor/astryx'}},
      base: {repo: {full_name: 'facebook/astryx'}},
    },
  ],
} = {}) {
  const github = {
    rest: {
      pulls: {
        get: vi.fn(async () => ({data: {state, draft, head: {sha: head}}})),
        list: vi.fn(async () => ({data: candidates})),
      },
      repos: {
        listDeployments: vi.fn(async () => ({
          data: deployments ?? [
            {
              id: 7,
              sha: SHA,
              environment: 'Preview',
              creator: {login: 'vercel[bot]'},
            },
          ],
        })),
        listDeploymentStatuses: vi.fn(async () => ({
          data: statuses ?? [{state: 'success', environment_url: ORIGIN}],
        })),
      },
    },
    paginate: vi.fn(async (method, request) => (await method(request)).data),
  };
  return github;
}

function resolve(github, options = {}) {
  return resolveVercelPreview({
    github,
    owner: 'facebook',
    repo: 'astryx',
    prNumber: 123,
    headSha: SHA,
    waitMs: 0,
    ...options,
  });
}

describe('exact-head Vercel preview', () => {
  it('only accepts a successful Vercel Preview deployment for the exact SHA', () => {
    const deployment = {
      sha: SHA,
      environment: 'Preview',
      creator: {login: 'vercel[bot]'},
    };
    const status = {state: 'success', environment_url: ORIGIN};
    expect(previewOrigin(deployment, status, SHA)).toBe(ORIGIN);
    expect(
      previewOrigin(
        deployment,
        {
          ...status,
          environment_url: 'https://astryx-git-main-fbopensource.vercel.app',
        },
        SHA,
      ),
    ).toBeNull();
    expect(
      previewOrigin({...deployment, sha: OLD_SHA}, status, SHA),
    ).toBeNull();
    expect(
      previewOrigin({...deployment, environment: 'canary'}, status, SHA),
    ).toBeNull();
    expect(
      previewOrigin({...deployment, creator: {login: 'attacker'}}, status, SHA),
    ).toBeNull();
    expect(
      previewOrigin(deployment, {...status, state: 'pending'}, SHA),
    ).toBeNull();
    expect(
      previewOrigin(
        deployment,
        {...status, environment_url: 'https://evil.example/'},
        SHA,
      ),
    ).toBeNull();
    expect(
      previewOrigin(
        deployment,
        {...status, environment_url: `${ORIGIN}.evil.example`},
        SHA,
      ),
    ).toBeNull();
    expect(
      previewOrigin(
        deployment,
        {...status, environment_url: `${ORIGIN}/other`},
        SHA,
      ),
    ).toBeNull();
  });

  it('returns only the exact-head deployment origin and checks the head twice', async () => {
    const github = fixture();
    expect(await resolve(github)).toBe(ORIGIN);
    expect(github.rest.repos.listDeployments).toHaveBeenCalledWith({
      owner: 'facebook',
      repo: 'astryx',
      sha: SHA,
      environment: 'Preview',
      per_page: 100,
    });
    expect(github.rest.pulls.get).toHaveBeenCalledTimes(2);
  });

  it('refuses old-head, draft, and closed PRs without querying deployments', async () => {
    for (const options of [{head: OLD_SHA}, {draft: true}, {state: 'closed'}]) {
      const github = fixture(options);
      expect(await resolve(github)).toBeNull();
      expect(github.rest.repos.listDeployments).not.toHaveBeenCalled();
    }
  });

  it('does not reuse an older head or an older successful deployment while the newest deploy is pending', async () => {
    const old = {
      id: 6,
      sha: OLD_SHA,
      environment: 'Preview',
      creator: {login: 'vercel[bot]'},
    };
    const current = {
      id: 8,
      sha: SHA,
      environment: 'Preview',
      creator: {login: 'vercel[bot]'},
    };
    const github = fixture({
      deployments: [old, current],
      statuses: [{state: 'pending', environment_url: ORIGIN}],
    });
    expect(await resolve(github)).toBeNull();
    expect(github.rest.repos.listDeploymentStatuses).toHaveBeenCalledWith({
      owner: 'facebook',
      repo: 'astryx',
      deployment_id: 8,
      per_page: 1,
    });
  });

  it('waits for readiness within a bounded window and stops on a new head', async () => {
    const github = fixture({statuses: [{state: 'pending'}]});
    let time = 0;
    const sleep = vi.fn(async ms => {
      time += ms;
      github.rest.repos.listDeploymentStatuses.mockResolvedValue({
        data: [{state: 'success', environment_url: ORIGIN}],
      });
    });
    expect(
      await resolve(github, {waitMs: 20, pollMs: 10, now: () => time, sleep}),
    ).toBe(ORIGIN);
    expect(sleep).toHaveBeenCalledTimes(1);

    github.rest.pulls.get
      .mockResolvedValueOnce({
        data: {state: 'open', draft: false, head: {sha: SHA}},
      })
      .mockResolvedValueOnce({
        data: {state: 'open', draft: false, head: {sha: OLD_SHA}},
      });
    expect(await resolve(github)).toBeNull();
  });

  it('resolves fork and same-repository deployment events without source CI', async () => {
    const deployment = {
      id: 7,
      sha: SHA,
      environment: 'Preview',
      creator: {login: 'vercel[bot]'},
    };
    const status = {state: 'success', environment_url: ORIGIN};
    for (const headRepository of ['contributor/astryx', 'facebook/astryx']) {
      const github = fixture({
        candidates: [
          {
            number: 123,
            state: 'open',
            draft: false,
            head: {sha: SHA, repo: {full_name: headRepository}},
            base: {repo: {full_name: 'facebook/astryx'}},
          },
        ],
      });
      expect(
        await resolveVercelDeploymentEvent({
          github,
          owner: 'facebook',
          repo: 'astryx',
          deployment,
          status,
        }),
      ).toEqual({prNumber: 123, headSha: SHA, origin: ORIGIN});
      expect(github.paginate).toHaveBeenCalledWith(github.rest.pulls.list, {
        owner: 'facebook',
        repo: 'astryx',
        state: 'open',
        per_page: 100,
      });
    }
  });

  it('ignores unrelated deployments and refuses ambiguous or stale PR associations', async () => {
    const deployment = {
      id: 7,
      sha: SHA,
      environment: 'Preview',
      creator: {login: 'vercel[bot]'},
    };
    const status = {state: 'success', environment_url: ORIGIN};
    for (const invalid of [
      {deployment: {...deployment, environment: 'Production'}, status},
      {deployment, status: {...status, state: 'pending'}},
      {deployment: {...deployment, creator: {login: 'other'}}, status},
    ]) {
      const github = fixture();
      expect(
        await resolveVercelDeploymentEvent({
          github,
          owner: 'facebook',
          repo: 'astryx',
          ...invalid,
        }),
      ).toBeNull();
      expect(github.paginate).not.toHaveBeenCalled();
    }
    const candidate = {
      number: 123,
      state: 'open',
      draft: false,
      head: {sha: SHA},
      base: {repo: {full_name: 'facebook/astryx'}},
    };
    for (const candidates of [
      [{...candidate, draft: true}],
      [{...candidate, head: {sha: OLD_SHA}}],
      [candidate, {...candidate, number: 124}],
    ]) {
      const github = fixture({candidates});
      expect(
        await resolveVercelDeploymentEvent({
          github,
          owner: 'facebook',
          repo: 'astryx',
          deployment,
          status,
        }),
      ).toBeNull();
    }
  });
});
