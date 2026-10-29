// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Storybook's static build, taken from the exact-head Vercel preview.
 * @input A pull request's head SHA, GitHub's Vercel deployment records for
 *   it, and the preview's `/storybook/` tree with the file manifest the
 *   docsite build stages beside it (apps/docsite/scripts/build-previews.mjs).
 * @output `apps/storybook/dist` byte for byte as Storybook built it on Vercel,
 *   or `false` when this head has no usable preview in time, so the caller
 *   builds Storybook itself.
 * @position build-packages-and-storybook.mjs, in CI's build-storybook job on
 *   pull requests: Vercel already builds Storybook for every pushed head, so
 *   CI reuses that build instead of making a second one.
 */

import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {previewOrigin, waitForPreviewRoutes} from './vercel-preview.mjs';

/** Where the docsite build stages Storybook in a deployment. */
export const STORYBOOK_ROUTE = '/storybook/';
/** The manifest the docsite build writes beside the staged Storybook. */
export const MANIFEST_FILE = 'astryx-dist-manifest.json';
/** Every deployed HTML file gets this tag; Storybook's own build has none. */
export const ROBOTS_TAG = '<meta name="robots" content="noindex, nofollow" />';

const VERCEL_CREATOR = 'vercel[bot]';
const PREVIEW_ENVIRONMENT = 'Preview';
const FAILED_STATES = new Set(['failure', 'error', 'inactive']);

/**
 * The manifest of a Storybook build: every file under `dir`, with its size
 * and SHA-256, and the commit it was built from.
 */
export function distManifest(dir, commit) {
  const files = [];
  const walk = relative => {
    for (const entry of fs.readdirSync(path.join(dir, relative), {
      withFileTypes: true,
    })) {
      const child = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(child);
      } else if (entry.isFile() && child !== MANIFEST_FILE) {
        const bytes = fs.readFileSync(path.join(dir, child));
        files.push({
          path: child,
          size: bytes.length,
          sha256: createHash('sha256').update(bytes).digest('hex'),
        });
      }
    }
  };
  walk('');
  files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return {commit, files};
}

/**
 * The HTML Storybook built, from the deployed copy: the docsite build only
 * inserts its tags right after `<head>` (stageStorybook), so removing exactly
 * that insertion restores the original bytes.
 */
export function unstageHtml(html, relative) {
  const head = html.match(/<head(?:\s[^>]*)?>/i)?.[0];
  if (!head) return null;
  const at = html.indexOf(head) + head.length;
  const after = html.slice(at);
  // The entry carries the base element and either the preview's robots tag
  // or production's canonical link; every other page only the robots tag.
  const inserted =
    relative === 'index.html'
      ? after.match(
          /^\n {4}<base href="\/storybook\/" \/>\n {4}(?:<meta name="robots" content="noindex, nofollow" \/>|<link rel="canonical" href="https:\/\/astryx\.atmeta\.com\/storybook\/" \/>)/,
        )?.[0]
      : after.startsWith(`\n    ${ROBOTS_TAG}`)
        ? `\n    ${ROBOTS_TAG}`
        : null;
  if (inserted == null) return null;
  return html.slice(0, at) + after.slice(inserted.length);
}

/** A manifest path that stays inside the output directory. */
function safeRelative(relative) {
  return (
    typeof relative === 'string' &&
    relative.length > 0 &&
    !relative.startsWith('/') &&
    !relative.includes('\\') &&
    relative.split('/').every(part => part && part !== '.' && part !== '..')
  );
}

/** Whether a manifest is well formed and names this head. */
export function validManifest(manifest, headSha) {
  return (
    manifest?.commit === headSha &&
    Array.isArray(manifest.files) &&
    manifest.files.length > 0 &&
    manifest.files.some(file => file?.path === 'iframe.html') &&
    manifest.files.every(
      file =>
        safeRelative(file?.path) &&
        Number.isInteger(file.size) &&
        /^[0-9a-f]{64}$/.test(file.sha256 ?? ''),
    )
  );
}

/** Whether `/storybook/` and its iframe answer as pages at `origin`. */
export async function probeStorybookRoutes(origin, fetchRoute = fetch) {
  try {
    const responses = await Promise.all(
      [STORYBOOK_ROUTE, `${STORYBOOK_ROUTE}iframe.html`].map(route =>
        fetchRoute(`${origin}${route}`, {
          redirect: 'manual',
          signal: AbortSignal.timeout(12_000),
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

/**
 * The exact-head preview origin once Vercel reports it ready. Gives up early
 * when the deployment failed, or when Vercel never started one for this head
 * (a fork it does not build), so the fallback build does not wait for nothing.
 */
export async function resolveHeadPreview({
  api,
  headSha,
  waitMs,
  unstartedMs,
  pollMs = 10_000,
  now = Date.now,
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
  log = () => {},
}) {
  const started = now();
  const deadline = started + waitMs;
  while (true) {
    const deployments = (await api.listDeployments(headSha)).filter(
      deployment =>
        deployment.sha === headSha &&
        deployment.environment === PREVIEW_ENVIRONMENT &&
        deployment.creator?.login === VERCEL_CREATOR,
    );
    const latest = deployments.sort((a, b) => b.id - a.id)[0];
    if (latest) {
      const [status] = await api.listDeploymentStatuses(latest.id);
      const origin = previewOrigin(latest, status, headSha);
      if (origin) return origin;
      if (FAILED_STATES.has(status?.state)) {
        log(`Vercel preview for ${headSha} is ${status.state}`);
        return null;
      }
    } else if (now() - started >= unstartedMs) {
      log(`Vercel started no preview for ${headSha}`);
      return null;
    }
    if (now() >= deadline) {
      log(`Vercel preview for ${headSha} was not ready in time`);
      return null;
    }
    await sleep(Math.min(pollMs, deadline - now()));
  }
}

/** Runs `task` over `items`, at most `limit` at once. */
async function eachLimited(items, limit, task) {
  let next = 0;
  const workers = Array.from({length: Math.min(limit, items.length)}, async () => {
    while (next < items.length) {
      const item = items[next++];
      await task(item);
    }
  });
  await Promise.all(workers);
}

/**
 * Write the preview's Storybook to `outDir`, every file checked against the
 * manifest. The tree lands only when every file matched, so a partial
 * download never stands in for a build.
 */
export async function downloadStorybook({
  origin,
  headSha,
  outDir,
  fetchRoute = fetch,
  concurrency = 16,
  log = () => {},
}) {
  const base = `${origin}${STORYBOOK_ROUTE}`;
  let manifest;
  try {
    const response = await fetchRoute(`${base}${MANIFEST_FILE}`, {
      redirect: 'manual',
      signal: AbortSignal.timeout(30_000),
    });
    if (response.status !== 200) {
      log(`The preview has no Storybook manifest (${response.status})`);
      return false;
    }
    manifest = await response.json();
  } catch (error) {
    log(`The preview's Storybook manifest did not load: ${error.message}`);
    return false;
  }
  if (!validManifest(manifest, headSha)) {
    log(`The preview's Storybook manifest does not describe ${headSha}`);
    return false;
  }
  const staging = `${outDir}.preview-${process.pid}`;
  fs.rmSync(staging, {recursive: true, force: true});
  try {
    await eachLimited(manifest.files, concurrency, async file => {
      const response = await fetchRoute(`${base}${file.path}`, {
        redirect: 'manual',
        signal: AbortSignal.timeout(60_000),
      });
      if (response.status !== 200) {
        throw new Error(`${file.path}: HTTP ${response.status}`);
      }
      let bytes = Buffer.from(await response.arrayBuffer());
      if (file.path.endsWith('.html')) {
        const original = unstageHtml(bytes.toString('utf8'), file.path);
        if (original == null) {
          throw new Error(`${file.path}: not the staged form of a build file`);
        }
        bytes = Buffer.from(original, 'utf8');
      }
      const sha256 = createHash('sha256').update(bytes).digest('hex');
      if (bytes.length !== file.size || sha256 !== file.sha256) {
        throw new Error(`${file.path}: does not match the manifest`);
      }
      const target = path.join(staging, file.path);
      fs.mkdirSync(path.dirname(target), {recursive: true});
      fs.writeFileSync(target, bytes);
    });
  } catch (error) {
    fs.rmSync(staging, {recursive: true, force: true});
    log(`The preview's Storybook did not download: ${error.message}`);
    return false;
  }
  fs.rmSync(outDir, {recursive: true, force: true});
  fs.mkdirSync(path.dirname(outDir), {recursive: true});
  fs.renameSync(staging, outDir);
  log(
    `Storybook for ${headSha} came from ${origin} (${manifest.files.length} files)`,
  );
  return true;
}

/** The GitHub REST calls this module needs, over `fetch`. */
export function githubApi({token, repository, fetchApi = fetch}) {
  const get = async route => {
    const response = await fetchApi(
      `https://api.github.com/repos/${repository}/${route}`,
      {
        headers: {
          accept: 'application/vnd.github+json',
          authorization: `Bearer ${token}`,
          'x-github-api-version': '2022-11-28',
        },
        signal: AbortSignal.timeout(30_000),
      },
    );
    if (!response.ok) {
      throw new Error(`GitHub ${route}: HTTP ${response.status}`);
    }
    return response.json();
  };
  return {
    listDeployments: sha =>
      get(
        `deployments?sha=${sha}&environment=${PREVIEW_ENVIRONMENT}&per_page=100`,
      ),
    listDeploymentStatuses: id => get(`deployments/${id}/statuses?per_page=1`),
  };
}

/**
 * Storybook for `headSha` from its Vercel preview, into `outDir`. Resolves
 * `true` when the tree is in place, `false` (never throws) when the caller
 * must build it: no preview, a failed or late one, or any mismatch.
 */
export async function storybookFromPreview({
  api,
  headSha,
  outDir,
  waitMs = 15 * 60_000,
  unstartedMs = 5 * 60_000,
  routeWaitMs = 90_000,
  fetchRoute = fetch,
  probe = origin => probeStorybookRoutes(origin, fetchRoute),
  now = Date.now,
  sleep,
  log = () => {},
}) {
  try {
    const origin = await resolveHeadPreview({
      api,
      headSha,
      waitMs,
      unstartedMs,
      now,
      sleep,
      log,
    });
    if (!origin) return false;
    // Vercel can report success shortly before the static routes reach the
    // edge; the shared bounded retry covers that window.
    if (
      !(await waitForPreviewRoutes(origin, {
        probe,
        waitMs: routeWaitMs,
        now,
        ...(sleep ? {sleep} : {}),
      }))
    ) {
      log(`Storybook at ${origin} never answered as a page`);
      return false;
    }
    return await downloadStorybook({origin, headSha, outDir, fetchRoute, log});
  } catch (error) {
    log(`Storybook preview lookup failed: ${error.message}`);
    return false;
  }
}
