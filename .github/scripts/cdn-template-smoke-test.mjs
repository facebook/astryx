#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * CDN starter-page smoke test — scaffolds `astryx template --cdn` into a temp
 * directory, serves it, and opens it in headless Chromium. Fails on any console
 * error, page error, or failed request, and on a page that loaded without
 * rendering anything.
 *
 * This is the one recipe we ship that runs entirely outside the repo: no
 * bundler resolves its imports, no test double stands in for jsDelivr or
 * esm.sh, and the failure modes it is annotated against (a missing
 * react/jsx-runtime entry, a second React copy) are silent until a browser
 * executes it. Reading the file proves nothing; this does.
 *
 * Needs network access and `npx playwright install chromium`.
 *
 * Usage:
 *   node .github/scripts/cdn-template-smoke-test.mjs
 *
 * Exit code 0 = the page rendered clean
 * Exit code 1 = it did not
 */

import {spawnSync} from 'node:child_process';
import {chromium} from 'playwright';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CLI = path.join(ROOT, 'packages/cli/clients/cli/bin/astryx.mjs');
const PAGE = 'cdn.template.html';
const ATTEMPTS = 2;

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-cdn-smoke-'));
const pagePath = path.join(tmpDir, PAGE);

function fail(message, detail) {
  console.log(`  FAIL  ${message}`);
  if (detail) console.log(detail);
  process.exitCode = 1;
}

// ── 1. Scaffold the page with the real CLI ───────────────────────────────────
fs.writeFileSync(
  path.join(tmpDir, 'package.json'),
  JSON.stringify({name: 'cdn-smoke', private: true}),
);
const scaffold = spawnSync(process.execPath, [CLI, '--json', 'template', '--cdn'], {
  cwd: tmpDir,
  encoding: 'utf8',
  timeout: 60_000,
});
if (scaffold.status !== 0 || !fs.existsSync(pagePath)) {
  fail(`astryx template --cdn (exit ${scaffold.status})`, scaffold.stderr);
  process.exit(1);
}
const pinned = JSON.parse(scaffold.stdout).data.version;
console.log(`scaffolded ${PAGE} pinned to ${pinned}`);

// ── 2. Point the page at a version that is actually on the CDN ───────────────
// The pin is the version in this checkout, which is unpublished for the whole
// life of a release PR (`changeset version` bumps package.json before npm has
// the tarball). Gating every PR on that would make the release PR unmergeable,
// so on an unpublished pin we re-point the page at the newest published version
// and still assert the recipe.
const published = await fetch('https://registry.npmjs.org/@astryxdesign/core')
  .then(r => r.json())
  .then(j => Object.keys(j.versions ?? {}))
  .catch(() => []);
if (published.length === 0) {
  fail('could not reach the npm registry to resolve a published version');
  process.exit(1);
}
let rendered = pinned;
if (!published.includes(pinned)) {
  rendered = published[published.length - 1];
  console.log(`  note  ${pinned} is not published yet — rendering against ${rendered}`);
  fs.writeFileSync(
    pagePath,
    fs.readFileSync(pagePath, 'utf8').replaceAll(`@${pinned}`, `@${rendered}`),
  );
}

// ── 3. Serve it, so the page loads the way a deployed one would ──────────────
const server = http.createServer((req, res) => {
  const body = fs.readFileSync(pagePath);
  res.writeHead(200, {'content-type': 'text/html; charset=utf-8'});
  res.end(body);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/`;

/** Load the page once and report everything that went wrong. */
async function render() {
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    page.on('console', m => {
      if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300));
    });
    page.on('pageerror', e => pageErrors.push(String(e).slice(0, 300)));
    page.on('requestfailed', r =>
      failedRequests.push(`${r.url()} :: ${r.failure()?.errorText}`),
    );
    page.on('response', r => {
      if (r.status() >= 400) failedRequests.push(`${r.status()} ${r.url()}`);
    });

    await page.goto(url, {waitUntil: 'networkidle', timeout: 90_000});
    // A page that throws during render still reaches networkidle with an empty
    // root, so the render itself has to be asserted, not just the error streams.
    const button = await page
      .getByRole('button')
      .first()
      .textContent({timeout: 15_000})
      .catch(() => null);

    return {consoleErrors, pageErrors, failedRequests, button};
  } finally {
    await browser.close();
  }
}

// ── 4. Render, retrying once so a blip at a CDN is not a red build ───────────
let result;
for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
  result = await render();
  const clean =
    result.consoleErrors.length === 0 &&
    result.pageErrors.length === 0 &&
    result.failedRequests.length === 0 &&
    result.button;
  if (clean) break;
  if (attempt < ATTEMPTS) console.log(`  retry ${attempt} of ${ATTEMPTS - 1}`);
}
server.close();

// ── 5. Report ────────────────────────────────────────────────────────────────
console.log(`\n${PAGE} @ ${rendered}`);
for (const [label, entries] of [
  ['console error', result.consoleErrors],
  ['page error', result.pageErrors],
  ['failed request', result.failedRequests],
]) {
  if (entries.length === 0) {
    console.log(`  ok    no ${label}s`);
  } else {
    fail(`${entries.length} ${label}(s)`, entries.map(e => `        ${e}`).join('\n'));
  }
}
if (result.button) {
  console.log(`  ok    rendered a button: "${result.button.trim()}"`);
} else {
  fail('the page loaded but rendered no button');
}

fs.rmSync(tmpDir, {recursive: true, force: true});
if (process.exitCode) {
  console.log('\nCDN starter page is broken.');
} else {
  console.log('\nCDN starter page renders clean.');
}
