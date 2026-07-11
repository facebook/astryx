#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file smoke-test.mjs
 *
 * Page-load smoke test for the docsite. Boots the production server
 * (`next start`), enumerates every route from the site's own /sitemap.xml
 * (the same generated registries that drive the routes — components, docs,
 * templates, blog posts — so new pages are covered with no edits here), then
 * visits each URL in a headless browser and fails if a page:
 *
 *   - returns a non-OK HTTP status for its document, or
 *   - throws an uncaught exception (`pageerror`), or
 *   - logs a browser `console.error`.
 *
 * This catches the broad class of "the page white-screens / throws at runtime"
 * regressions that build-time type/lint checks and the data-extraction unit
 * tests can't see, because it exercises the real rendered pages end to end.
 *
 * Usage:
 *   node scripts/smoke-test.mjs                 # build must already exist
 *   node scripts/smoke-test.mjs --base http://localhost:3000   # reuse a server
 *   node scripts/smoke-test.mjs --routes /,/components          # override list
 *
 * Requires a Chromium browser (`pnpm exec playwright install chromium`).
 *
 * @output Exit 0 when every route loads clean; exit 1 with a per-route report
 *         listing the offending errors otherwise.
 */

import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {chromium} from 'playwright';

const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 ? args[i + 1] : null;
}

const PORT = Number(getArg('port') ?? process.env.PORT ?? 3100);
const providedBase = getArg('base');
const BASE = providedBase ?? `http://localhost:${PORT}`;
const routesOverride = getArg('routes');
const NAV_TIMEOUT = Number(getArg('timeout') ?? 30_000);

// Failed-request URLs that are environmental noise rather than a real page
// runtime error. Kept tight and justified — every entry is a blind spot — and
// matched against the request URL (where we actually have it; the browser's
// generic "Failed to load resource" console line carries no URL). Substring
// match.
const IGNORED_REQUEST_PATTERNS = [
  // Vercel analytics/speed-insights scripts are served by Vercel's edge and
  // 404 anywhere else (local `next start`, CI). Not a page bug.
  '/_vercel/insights',
  '/_vercel/speed-insights',
  // Off-origin assets (Google Fonts, the lookaside social banner) may be
  // unreachable from a sandboxed CI network — not a page bug.
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'lookaside.facebook.com',
];

function ignoredRequest(url) {
  return IGNORED_REQUEST_PATTERNS.some(p => url.includes(p));
}

// The urlless "Failed to load resource" console line is emitted for every
// failed request, including the ignored ones above; we detect real resource
// failures at the request level instead, so drop it here to avoid double- and
// false-counting. CORS/network console.errors for the ignored off-origin hosts
// are environmental too. Real in-page console.error output is still captured.
function ignoredConsole(text) {
  if (text.includes('Failed to load resource')) return true;
  return IGNORED_REQUEST_PATTERNS.some(p => text.includes(p));
}

/** Wait until the server answers, or throw after the deadline. */
async function waitForServer(base, deadlineMs = 90_000) {
  const start = Date.now();
  while (Date.now() - start < deadlineMs) {
    try {
      const res = await fetch(base, {method: 'HEAD'});
      if (res.ok || res.status === 405 || res.status === 404) return;
    } catch {
      // not up yet
    }
    await sleep(1000);
  }
  throw new Error(`Server at ${base} did not become ready in ${deadlineMs}ms`);
}

/** Pull the route paths from the site's own sitemap so we test what ships. */
async function routesFromSitemap(base) {
  const res = await fetch(new URL('/sitemap.xml', base));
  if (!res.ok) {
    throw new Error(`Could not fetch /sitemap.xml (status ${res.status})`);
  }
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const paths = locs.map(u => {
    try {
      return new URL(u).pathname;
    } catch {
      return u;
    }
  });
  // Always include a couple of routes the sitemap intentionally omits but that
  // must still render: the 404 page and the playground preview frame.
  const extras = ['/playground/preview', '/this-page-does-not-exist-404-probe'];
  return [...new Set([...paths, ...extras])];
}

async function main() {
  let serverProc = null;
  let shuttingDown = false;

  if (!providedBase) {
    console.log(`Starting "next start" on port ${PORT}…`);
    serverProc = spawn(
      'pnpm',
      ['exec', 'next', 'start', '--port', String(PORT)],
      {stdio: ['ignore', 'inherit', 'inherit']},
    );
    serverProc.on('exit', code => {
      if (code && code !== 0 && !shuttingDown) {
        console.error(`next start exited early with code ${code}`);
        process.exit(1);
      }
    });
  }

  const stopServer = () => {
    shuttingDown = true;
    if (serverProc && !serverProc.killed) serverProc.kill('SIGTERM');
  };
  process.on('exit', stopServer);
  process.on('SIGINT', () => {
    stopServer();
    process.exit(130);
  });

  await waitForServer(BASE);

  const routes = routesOverride
    ? routesOverride
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    : await routesFromSitemap(BASE);

  console.log(`Smoke-testing ${routes.length} routes on ${BASE}\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const failures = [];

  for (const route of routes) {
    const page = await context.newPage();
    const errors = [];
    const pageUrl = new URL(route, BASE).toString();

    // A 404 probe route is *expected* to 404 — record its status but don't
    // treat the not-found status itself as a failure; still catch runtime
    // errors thrown while rendering the 404 page.
    const expect404 = route.includes('404-probe');

    page.on('pageerror', err => {
      errors.push(`pageerror: ${err.message}`);
    });
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!ignoredConsole(text)) errors.push(`console.error: ${text}`);
      }
    });
    // A same-origin sub-resource that 404s/500s is a real page defect (a
    // missing script/style/image the page depends on); off-origin and
    // explicitly-ignored hosts are filtered. Speculative RSC prefetches
    // (`?_rsc=` — Next preloads links the page *might* navigate to, including
    // demo/template nav that points outside the docsite) are not part of
    // rendering this page, so their status is ignored; a broken link surfaces
    // when it's actually visited as its own route. The main document's own
    // status is asserted separately below (with the 404-probe exemption).
    page.on('response', res => {
      const url = res.url();
      if (url === pageUrl || url.includes('?_rsc=')) return;
      if (res.status() >= 400 && !ignoredRequest(url)) {
        errors.push(`resource ${res.status()}: ${url}`);
      }
    });
    page.on('requestfailed', req => {
      const url = req.url();
      if (url === pageUrl || url.includes('?_rsc=')) return;
      const failure = req.failure()?.errorText ?? '';
      // ERR_ABORTED: router-cancelled navigations/prefetches.
      // ERR_BLOCKED_BY_ORB: browser Opaque-Response-Blocking of a cross-origin
      // sub-resource (e.g. an off-site favicon) — a browser security policy,
      // not a page defect.
      if (
        failure.includes('ERR_ABORTED') ||
        failure.includes('ERR_BLOCKED_BY_ORB') ||
        ignoredRequest(url)
      ) {
        return;
      }
      errors.push(`request failed (${failure}): ${url}`);
    });

    let status = null;
    try {
      const response = await page.goto(pageUrl, {
        // `domcontentloaded`, not `networkidle`: this is an RSC app whose
        // link prefetches and analytics keep the network busy, so networkidle
        // rarely settles. A fixed settle window below gives hydration and
        // client effects time to run and throw.
        waitUntil: 'domcontentloaded',
        timeout: NAV_TIMEOUT,
      });
      status = response ? response.status() : null;
      // Let client effects/hydration run so client-side throws surface.
      await page.waitForTimeout(1500);
    } catch (err) {
      errors.push(`navigation: ${err.message}`);
    }

    const badStatus =
      status != null && status >= 400 && !(expect404 && status === 404);
    if (badStatus) errors.push(`http status ${status}`);

    const ok = errors.length === 0;
    console.log(`${ok ? '✓' : '✗'} ${route}${status ? `  [${status}]` : ''}`);
    if (!ok) {
      for (const e of errors) console.log(`    ${e}`);
      failures.push({route, status, errors});
    }
    await page.close();
  }

  await browser.close();
  stopServer();

  console.log('');
  if (failures.length > 0) {
    console.error(
      `Smoke test FAILED: ${failures.length}/${routes.length} routes had runtime errors.`,
    );
    process.exit(1);
  }
  console.log(`Smoke test passed: all ${routes.length} routes loaded clean.`);
  process.exit(0);
}

main().catch(err => {
  console.error('Smoke test crashed:', err);
  process.exit(1);
});
