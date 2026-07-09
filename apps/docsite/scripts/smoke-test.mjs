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

// Browser console.error lines that are environmental noise rather than a real
// page runtime error. Keep this list tight and justified — every entry is a
// blind spot, so it is scoped to specific third-party hosts, not a blanket
// "ignore all network errors". Matched as substrings against the console text.
const IGNORED_CONSOLE_PATTERNS = [
  // Vercel analytics/speed-insights beacons have no backend outside prod.
  '/_vercel/insights',
  '/_vercel/speed-insights',
  // Off-origin assets (Google Fonts, the lookaside social banner) may be
  // unreachable from a sandboxed CI network — not a page bug.
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'lookaside.facebook.com',
];

function shouldIgnore(text) {
  return IGNORED_CONSOLE_PATTERNS.some(p => text.includes(p));
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
        if (!shouldIgnore(text)) errors.push(`console.error: ${text}`);
      }
    });

    let status = null;
    try {
      const response = await page.goto(new URL(route, BASE).toString(), {
        waitUntil: 'networkidle',
        timeout: NAV_TIMEOUT,
      });
      status = response ? response.status() : null;
      // Let client effects/hydration run so client-side throws surface.
      await page.waitForTimeout(500);
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
