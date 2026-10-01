// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Resolve the docsite deployment for an exact pull-request head.
 * @input Trusted PR identity and GitHub's Vercel deployment/status records.
 * @output A validated deployment origin, or null if this head has no ready preview.
 * @position Trusted PR comment; never falls back to a branch or older PR head.
 */

const VERCEL_CREATOR = 'vercel[bot]';
const PREVIEW_ENVIRONMENT = 'Preview';

export function previewOrigin(deployment, status, headSha) {
  if (
    deployment?.sha !== headSha ||
    deployment.environment !== PREVIEW_ENVIRONMENT ||
    deployment.creator?.login !== VERCEL_CREATOR ||
    status?.state !== 'success'
  ) {
    return null;
  }
  try {
    const url = new URL(status.environment_url);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      !/^astryx-[a-z0-9]{9}-fbopensource\.vercel\.app$/.test(url.hostname) ||
      (url.pathname !== '/' && url.pathname !== '') ||
      url.search ||
      url.hash
    ) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

export async function probeVercelPreview(origin, fetchRoute = fetch) {
  // Check both static apps and a real Sandbox deep link before publishing any
  // PR link. A redirect (including an auth/login redirect) or Next's 404 page
  // cannot count as ready. The origin has already passed previewOrigin().
  const routes = [
    '/storybook/',
    '/storybook/iframe.html',
    '/sandbox/',
    '/sandbox/pages/component-scores/',
  ];
  try {
    const responses = await Promise.all(
      routes.map(route =>
        fetchRoute(`${origin}${route}`, {
          redirect: 'manual',
          signal: AbortSignal.timeout(12000),
        }),
      ),
    );
    return responses.every(
      response =>
        response.status === 200 &&
        response.headers.get('content-type')?.includes('text/html'),
    );
  } catch {
    return false;
  }
}

export async function waitForPreviewRoutes(
  origin,
  {
    probe = probeVercelPreview,
    waitMs = 90_000,
    pollMs = 5_000,
    now = Date.now,
    sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
  } = {},
) {
  // Vercel can report deployment success shortly before every static route
  // reaches the edge. Retry within this bounded window instead of dropping the
  // one deployment_status event on a transient 404.
  const deadline = now() + waitMs;
  while (true) {
    try {
      if (await probe(origin)) return true;
    } catch {
      // A failed network probe is not evidence of a ready preview.
    }
    if (now() >= deadline) return false;
    await sleep(Math.min(pollMs, deadline - now()));
  }
}

export async function resolveVercelDeploymentEvent({
  github,
  owner,
  repo,
  deployment,
  status,
  probePreview = probeVercelPreview,
  probeWaitMs = 90_000,
}) {
  const origin = previewOrigin(deployment, status, deployment?.sha);
  if (!origin) return null;

  // GitHub's commit→PR association omits fork-only heads. The open-PR list
  // includes both forks and same-repo heads, so bind an exact, unique match.
  const pulls = await github.paginate(github.rest.pulls.list, {
    owner,
    repo,
    state: 'open',
    per_page: 100,
  });
  const matches = pulls.filter(
    pull =>
      pull.state === 'open' &&
      !pull.draft &&
      pull.head?.sha === deployment.sha &&
      pull.base?.repo?.full_name === `${owner}/${repo}`,
  );
  if (matches.length !== 1) return null;
  const prNumber = matches[0].number;
  const currentOrigin = await resolveVercelPreview({
    github,
    owner,
    repo,
    prNumber,
    headSha: deployment.sha,
    waitMs: 0,
  });
  if (
    currentOrigin !== origin ||
    !(await waitForPreviewRoutes(origin, {
      probe: probePreview,
      waitMs: probeWaitMs,
    }))
  )
    return null;
  const {data: current} = await github.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });
  if (
    current.state !== 'open' ||
    current.draft ||
    current.head?.sha !== deployment.sha
  )
    return null;
  // A newer deployment for this *same head* may have started while we waited
  // for edge routes. Never promote an older successful origin over it.
  const latestOrigin = await resolveVercelPreview({
    github,
    owner,
    repo,
    prNumber,
    headSha: deployment.sha,
    waitMs: 0,
  });
  if (latestOrigin !== origin) return null;
  return {prNumber, headSha: deployment.sha, origin};
}

export async function resolveVercelPreview({
  github,
  owner,
  repo,
  prNumber,
  headSha,
  waitMs = 5 * 60 * 1000,
  pollMs = 10000,
  now = Date.now,
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
}) {
  const deadline = now() + waitMs;
  while (true) {
    const {data: pull} = await github.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });
    if (pull.state !== 'open' || pull.draft || pull.head?.sha !== headSha) {
      return null;
    }
    const {data: deployments} = await github.rest.repos.listDeployments({
      owner,
      repo,
      sha: headSha,
      environment: PREVIEW_ENVIRONMENT,
      per_page: 100,
    });
    const latest = deployments
      .filter(
        deployment =>
          deployment.sha === headSha &&
          deployment.environment === PREVIEW_ENVIRONMENT &&
          deployment.creator?.login === VERCEL_CREATOR,
      )
      .sort((a, b) => b.id - a.id)[0];
    if (latest) {
      const {data: statuses} = await github.rest.repos.listDeploymentStatuses({
        owner,
        repo,
        deployment_id: latest.id,
        per_page: 1,
      });
      const origin = previewOrigin(latest, statuses[0], headSha);
      if (origin) {
        // A head push or close during the status request must not gain links.
        const {data: current} = await github.rest.pulls.get({
          owner,
          repo,
          pull_number: prNumber,
        });
        if (
          current.state === 'open' &&
          !current.draft &&
          current.head?.sha === headSha
        ) {
          return origin;
        }
        return null;
      }
    }
    if (now() >= deadline) return null;
    await sleep(Math.min(pollMs, deadline - now()));
  }
}
