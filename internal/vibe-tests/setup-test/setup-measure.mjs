#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file setup-measure.mjs
 * @input --app <dir> (a sandbox, or the pristine fixture) --out <file.json>
 * @output One measurement JSON: build result, per-probe computed styles in both
 *         color schemes, root variables, console/page/request errors, screenshots
 * @position internal/vibe-tests/setup-test — the observation half of the scorer
 *
 * Why this exists: the failures a setup produces are INVISIBLE to a diff and to
 * a build. Installing a design system into an app that already has one can leave
 * `tsc` clean, the bundler happy, the console silent, and the page wrong. So the
 * measurement is the rendered page, not the source.
 *
 * Two color schemes on purpose. Astryx paints through `light-dark()`, and an
 * existing app whose dark look is just CSS variables has no `data-theme` for the
 * system to read — so the SAME sandbox can look correct on a dark-mode laptop and
 * be illegible in headless CI. A measurement that picked one scheme would inherit
 * the reviewer's machine.
 *
 * Usage:
 *   node setup-measure.mjs --app fixture-app --out results/baseline.json
 *   node setup-measure.mjs --app /tmp/sandbox-a1 --out results/a1.json --screenshot-dir results/shots
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as http from 'node:http';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── args ─────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      out[key] = next;
      i += 1;
    } else out[key] = true;
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const appDir = path.resolve(args.app ?? path.join(__dirname, 'fixture-app'));
const outFile = path.resolve(
  args.out ?? path.join(__dirname, 'results', 'measurement.json'),
);
const shotDir = args['screenshot-dir']
  ? path.resolve(args['screenshot-dir'])
  : null;
const label = args.label ?? path.basename(outFile, '.json');

const probeSpec = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'probes.json'), 'utf8'),
);

// ── build ────────────────────────────────────────────────────────────

function build() {
  const started = Date.now();
  const r = spawnSync('npm', ['run', 'build'], {cwd: appDir, encoding: 'utf8'});
  return {
    ok: r.status === 0,
    status: r.status ?? -1,
    ms: Date.now() - started,
    stdout: (r.stdout ?? '').slice(-4000),
    stderr: (r.stderr ?? '').slice(-4000),
  };
}

// ── the emitted cascade ──────────────────────────────────────────────

/**
 * The order the browser will apply cascade layers in, read off the emitted CSS.
 *
 * This is measured rather than inferred because the ORDER IS POSITIONAL and the
 * mistake is invisible: a `@layer a, b, c;` statement only orders names that are
 * not already registered, so the same statement produces a different cascade
 * depending on whether it sits above or below the app's own Tailwind import —
 * and below it, the system's reset outranks every utility the app already uses.
 */
function emittedLayerOrder(distDir) {
  const assets = path.join(distDir, 'assets');
  if (!fs.existsSync(assets)) return [];
  const order = [];
  for (const file of fs.readdirSync(assets).filter(f => f.endsWith('.css'))) {
    const css = fs.readFileSync(path.join(assets, file), 'utf8');
    for (const m of css.matchAll(/@layer\s+([a-zA-Z0-9_-]+)\s*\{/g)) {
      if (!order.includes(m[1])) order.push(m[1]);
    }
  }
  return order;
}

// ── serve dist + the fixture API ─────────────────────────────────────

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function serve(distDir, fixtures) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (url.pathname.startsWith('/api/')) {
      const json = body => {
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify(body));
      };
      if (url.pathname === '/api/runs') {
        const env = url.searchParams.get('env');
        return json(fixtures.runs.filter(r => !env || r.env === env));
      }
      const build = url.pathname.match(/^\/api\/builds\/(.+)$/);
      if (build)
        return json(
          fixtures.builds[decodeURIComponent(build[1])] ??
            fixtures.builds.default,
        );
      const ticket = url.pathname.match(/^\/api\/tickets\/(.+)$/);
      if (ticket)
        return json(
          fixtures.tickets[decodeURIComponent(ticket[1])] ??
            fixtures.tickets.default,
        );
      res.statusCode = 404;
      return res.end();
    }
    const rel = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = path.join(distDir, rel);
    if (
      !file.startsWith(distDir) ||
      !fs.existsSync(file) ||
      fs.statSync(file).isDirectory()
    ) {
      res.statusCode = 404;
      return res.end();
    }
    res.setHeader(
      'content-type',
      MIME[path.extname(file)] ?? 'application/octet-stream',
    );
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve =>
    server.listen(0, () => resolve({server, port: server.address().port})),
  );
}

// ── the page probe (runs in the browser) ─────────────────────────────

/* c8 ignore start — executed in the page, not in node */
function readPage(spec) {
  const luminance = rgb => {
    const [r, g, b] = rgb.map(v => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const parse = c => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1]
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map(Number);
    return {rgb: parts.slice(0, 3), a: parts.length > 3 ? parts[3] : 1};
  };
  /** The background actually painted behind an element, walking up past transparents. */
  const effectiveBackground = el => {
    let node = el;
    while (node) {
      const c = parse(getComputedStyle(node).backgroundColor);
      if (c && c.a > 0.5) return c.rgb;
      node = node.parentElement;
    }
    return [255, 255, 255];
  };
  const contrast = (fg, bg) => {
    const a = luminance(fg) + 0.05;
    const b = luminance(bg) + 0.05;
    return Math.round((Math.max(a, b) / Math.min(a, b)) * 100) / 100;
  };

  const probes = {};
  for (const probe of spec.probes) {
    const el = document.querySelector(probe.selector);
    if (!el) {
      probes[probe.name] = {missing: true};
      continue;
    }
    const cs = getComputedStyle(el);
    const style = {};
    for (const prop of spec.properties) style[prop] = cs[prop];
    const fg = parse(cs.color);
    probes[probe.name] = {
      style,
      text: (el.textContent ?? '').trim().slice(0, 40),
      contrast: fg ? contrast(fg.rgb, effectiveBackground(el)) : null,
    };
  }

  const rootCs = getComputedStyle(document.documentElement);
  const variables = {};
  for (const v of spec.rootVariables)
    variables[v] = rootCs.getPropertyValue(v).trim();

  return {probes, variables, colorScheme: rootCs.colorScheme};
}
/* c8 ignore stop */

// ── main ─────────────────────────────────────────────────────────────

const measurement = {
  label,
  app: appDir,
  measuredAt: new Date().toISOString(),
  build: build(),
  layerOrder: [],
  schemes: {},
};

if (measurement.build.ok) {
  measurement.layerOrder = emittedLayerOrder(path.join(appDir, 'dist'));
  const {chromium} = await import('playwright');
  const fixtures = JSON.parse(
    fs.readFileSync(path.join(appDir, 'lib', 'fixtures.json'), 'utf8'),
  );
  const {server, port} = await serve(path.join(appDir, 'dist'), fixtures);
  const browser = await chromium.launch();

  for (const colorScheme of ['light', 'dark']) {
    const page = await browser.newPage({
      viewport: {width: 1280, height: 720},
      colorScheme,
    });
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    page.on(
      'console',
      m => m.type() === 'error' && consoleErrors.push(m.text()),
    );
    page.on('pageerror', e => pageErrors.push(String(e)));
    page.on('requestfailed', r => failedRequests.push(r.url()));
    await page.goto(`http://127.0.0.1:${port}/`, {waitUntil: 'networkidle'});
    await page.waitForTimeout(150);
    const read = await page.evaluate(readPage, probeSpec);
    if (shotDir) {
      fs.mkdirSync(shotDir, {recursive: true});
      await page.screenshot({
        path: path.join(shotDir, `${label}-${colorScheme}.png`),
        fullPage: true,
      });
    }
    measurement.schemes[colorScheme] = {
      ...read,
      consoleErrors,
      pageErrors,
      failedRequests,
    };
    await page.close();
  }

  await browser.close();
  server.close();
}

fs.mkdirSync(path.dirname(outFile), {recursive: true});
fs.writeFileSync(outFile, JSON.stringify(measurement, null, 2) + '\n');
console.log(
  `${label}: build ${measurement.build.ok ? 'ok' : `FAILED (${measurement.build.status})`}` +
    (measurement.build.ok
      ? `, ${measurement.schemes.light.consoleErrors.length} console errors` +
        `, ${Object.values(measurement.schemes.light.probes).filter(p => p.missing).length} probes missing`
      : ''),
);
