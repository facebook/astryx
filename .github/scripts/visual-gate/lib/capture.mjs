// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Capture: turn a shot plan into PNGs, plus the theming evidence needed
 *       to explain a diff.
 *
 * @input  a built Storybook directory and a shot plan
 * @output one PNG per shot under <out>/shots, a capture manifest, and the set
 *         of theming targets actually observed in the DOM
 *
 * Two things here are load-bearing and easy to get wrong:
 *
 * Determinism. A visual gate that flickers is worse than no gate — every
 * false diff costs a human judgement and teaches everyone to ignore it. So
 * the page is pinned: no external network (nothing that renders may depend on
 * a CDN being up), animations and transitions forced to their end state,
 * carets hidden, a fixed viewport and device scale factor, and a wait on
 * `document.fonts.ready` before the shutter. Even so, a baseline is only
 * comparable against a capture from the same OS and browser build, which is
 * why the manifest records the platform and the comparison refuses to cross it.
 *
 * Speed. Storybook applies the theme through a global, so a theme change is a
 * re-render, not a reload: the plan is walked grouped by story, and the theme
 * and color mode are switched over Storybook's own channel while the page
 * stays put (~130ms per shot against ~1s for a reload). `--no-fast-globals`
 * forces a reload per shot for the case where a story's own state would
 * survive the re-render and make the shot depend on the one before it.
 */

import * as fs from 'node:fs';
import * as http from 'node:http';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

const CONTENT_TYPES = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.map': 'application/json',
  '.mjs': 'application/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/** Injected before every shot: hold animation at its end state, hide carets. */
const FREEZE_CSS = `
*, *::before, *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
  caret-color: transparent !important;
}
html { scrollbar-width: none !important; }
::-webkit-scrollbar { display: none !important; }
`;

/** Injected before every story script: a seeded PRNG in place of Math.random.
 *
 * Most of the stories that could not reproduce themselves were charts built on
 * random sample data — nothing about them is unstable except the numbers. A
 * fixed seed turns them back into ordinary regression subjects instead of
 * entries on an exclusion list. Stories whose instability is real (GPU
 * rasterisation, streaming animation) stay unstable and belong in
 * `excludeStories`.
 */
const SEEDED_RANDOM = `(() => {
  let state = 0x2f6e2b1 >>> 0;
  Math.random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();`;

/**
 * Serve a directory over loopback. The gate never talks to the network, so
 * this is the only origin the browser can reach.
 * @param {string} dir
 * @returns {Promise<{port: number, close: () => Promise<void>}>}
 */
export function serveDirectory(dir) {
  const server = http.createServer((req, res) => {
    const requested = path.join(dir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    if (!path.resolve(requested).startsWith(path.resolve(dir))) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    fs.readFile(requested, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, {
        'Content-Type': CONTENT_TYPES[path.extname(requested)] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(data);
    });
  });
  return new Promise(resolve => {
    server.listen(0, () => {
      resolve({
        port: server.address().port,
        close: () => new Promise(done => server.close(done)),
      });
    });
  });
}

/**
 * Every `astryx-*` class present in the document, with the theming data each
 * one carries. This is what turns "these pixels moved" into "the `selected`
 * state stopped reaching `astryx-top-nav-item`", and what proves a theme
 * override had something to bind to at all.
 * @param {import('playwright').Page} page
 * @returns {Promise<Record<string, string[]>>}
 */
async function observeTargets(page) {
  return page.evaluate(() => {
    /** @type {Record<string, Set<string>>} */
    const observed = {};
    for (const element of document.querySelectorAll('[class*="astryx-"]')) {
      for (const className of element.classList) {
        if (!className.startsWith('astryx-')) continue;
        const key = className.slice('astryx-'.length);
        observed[key] ??= new Set();
        for (const attribute of element.attributes) {
          if (!attribute.name.startsWith('data-')) continue;
          const name = attribute.name.slice('data-'.length);
          // themeProps emits bare names for states and name/value for props.
          observed[key].add(attribute.value === '' || attribute.value === 'true' ? name : `${name}:${attribute.value}`);
        }
      }
    }
    return Object.fromEntries(Object.entries(observed).map(([key, values]) => [key, [...values]]));
  });
}

/**
 * @param {import('playwright').Page} page
 * @param {{astryxTheme: string, colorMode: string}} globals
 */
async function applyGlobals(page, globals) {
  await page.evaluate(async next => {
    const channel = globalThis.__STORYBOOK_ADDONS_CHANNEL__;
    if (!channel) throw new Error('Storybook preview channel unavailable');
    await new Promise((resolve, reject) => {
      const settle = () => {
        channel.off('storyRendered', settle);
        resolve(undefined);
      };
      channel.on('storyRendered', settle);
      channel.emit('updateGlobals', {globals: next});
      setTimeout(() => {
        channel.off('storyRendered', settle);
        reject(new Error('timed out waiting for storyRendered'));
      }, 15000);
    });
  }, globals);
}

/**
 * A theme Storybook does not know about silently renders as the default one,
 * which would quietly compare the wrong picture against the baseline forever.
 * `<Theme>` reflects what it actually applied, so ask the DOM.
 * @param {import('playwright').Page} page
 * @param {{theme: string, mode: string}} expected
 */
async function verifyApplied(page, expected) {
  const applied = await page.evaluate(() => {
    const themed = document.querySelector('[data-astryx-theme]');
    return {
      theme: themed?.getAttribute('data-astryx-theme') ?? null,
      mode: document.documentElement.getAttribute('data-theme'),
    };
  });
  if (applied.theme !== expected.theme) {
    throw new Error(
      `requested theme "${expected.theme}" but the story rendered "${applied.theme}" — register it in apps/storybook/.storybook/preview.tsx`,
    );
  }
  if (applied.mode !== expected.mode) {
    throw new Error(`requested mode "${expected.mode}" but the story rendered "${applied.mode}"`);
  }
}

/**
 * Wait until the page has stopped moving.
 *
 * Fonts and CSS transitions are the easy half; the half that actually bites is
 * layout a component computes in an effect — a selection indicator that
 * measures its target and then positions itself. Under load that lands after
 * the shutter, and the shot differs from the same shot on a quieter run. So
 * the geometry of every themed element is sampled until two consecutive
 * frames agree.
 *
 * @param {import('playwright').Page} page
 * @param {number} settleMs
 */
async function settle(page, settleMs) {
  await page.evaluate(
    ms =>
      new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, ms)));
      }),
    settleMs,
  );
  await page.evaluate(() => document.fonts.ready);

  let previous = null;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const geometry = await page.evaluate(() =>
      [...document.querySelectorAll('[class*="astryx-"]')]
        .map(element => {
          const box = element.getBoundingClientRect();
          return `${Math.round(box.x)},${Math.round(box.y)},${Math.round(box.width)},${Math.round(box.height)}`;
        })
        .join('|'),
    );
    if (geometry === previous) return;
    previous = geometry;
    await page.waitForTimeout(25);
  }
}

/**
 * Load stories without photographing them, and report what each one rendered.
 *
 * A screenshot is expensive; a page load and a DOM read are not. Scouting is
 * how the theme matrix finds a story that actually renders `badge` in its
 * `warning` variant, instead of assuming the component's default story covers
 * every state a theme styles. Without it the matrix photographs the same
 * default over and over and leaves most overrides unverified.
 *
 * @param {object} options
 * @param {string[]} options.storyIds
 * @param {string} options.storybookDir
 * @param {string} options.theme - any theme; observed targets do not depend on it
 * @param {{width: number, height: number}} options.viewport
 * @param {(progress: {done: number, total: number}) => void} [options.onProgress]
 * @returns {Promise<Record<string, Record<string, string[]>>>} story id → observed targets
 */
export async function scout({storyIds, storybookDir, theme, viewport, onProgress}) {
  const {chromium} = await import('playwright');
  const server = await serveDirectory(storybookDir);
  const origin = `http://127.0.0.1:${server.port}`;
  const browser = await chromium.launch();
  const context = await browser.newContext({viewport, deviceScaleFactor: 1});
  await context.addInitScript(SEEDED_RANDOM);
  await context.route('**', route =>
    route.request().url().startsWith(origin) ? route.continue() : route.abort(),
  );
  const page = await context.newPage();

  /** @type {Record<string, Record<string, string[]>>} */
  const observations = {};
  let done = 0;
  for (const storyId of storyIds) {
    try {
      await page.goto(
        `${origin}/iframe.html?id=${encodeURIComponent(storyId)}&viewMode=story&globals=astryxTheme:${theme};colorMode:light`,
        {waitUntil: 'load', timeout: 30000},
      );
      await page.waitForSelector('#storybook-root > *', {timeout: 20000});
      observations[storyId] = await observeTargets(page);
    } catch {
      // A story that will not render is the capture's problem to report, not
      // the scout's; it simply contributes no observations.
      observations[storyId] = {};
    }
    onProgress?.({done: ++done, total: storyIds.length});
  }

  await browser.close();
  await server.close();
  return observations;
}

/**
 * @param {object} options
 * @param {import('./plan.mjs').Shot[]} options.plan
 * @param {string} options.storybookDir
 * @param {string} options.outDir
 * @param {{width: number, height: number}} options.viewport
 * @param {number} options.settleMs
 * @param {boolean} options.fastGlobals
 * @param {(progress: {done: number, total: number, key: string}) => void} [options.onProgress]
 * @returns {Promise<{manifest: object, failures: Array<{key: string, error: string}>}>}
 */
export async function capture({
  plan,
  storybookDir,
  outDir,
  viewport,
  settleMs,
  fastGlobals,
  onProgress,
}) {
  const {chromium} = await import('playwright');
  const shotsDir = path.join(outDir, 'shots');
  fs.mkdirSync(shotsDir, {recursive: true});

  const server = await serveDirectory(storybookDir);
  const origin = `http://127.0.0.1:${server.port}`;
  const browser = await chromium.launch();
  const browserVersion = browser.version();
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    colorScheme: 'light',
  });
  await context.addInitScript(SEEDED_RANDOM);
  // Anything off-origin is a determinism hazard, and nothing in a component
  // story legitimately needs it.
  await context.route('**', route =>
    route.request().url().startsWith(origin) ? route.continue() : route.abort(),
  );
  const page = await context.newPage();
  await page.addStyleTag({content: FREEZE_CSS}).catch(() => {});

  /** @type {Record<string, {sha256: string, width: number, height: number, storyId: string, theme: string, mode: string, reasons: string[]}>} */
  const shots = {};
  /** @type {Record<string, Set<string>>} */
  const observed = {};
  /** @type {Array<{key: string, error: string}>} */
  const failures = [];

  let currentStory = null;
  let done = 0;

  for (const shot of plan) {
    try {
      const globals = {astryxTheme: shot.theme, colorMode: shot.mode};
      const needsLoad = !fastGlobals || currentStory !== shot.storyId;
      if (needsLoad) {
        const globalsParam = `astryxTheme:${shot.theme};colorMode:${shot.mode}`;
        await page.goto(
          `${origin}/iframe.html?id=${encodeURIComponent(shot.storyId)}&viewMode=story&globals=${globalsParam}`,
          {waitUntil: 'load', timeout: 30000},
        );
        await page.waitForSelector('#storybook-root > *', {timeout: 30000});
        currentStory = shot.storyId;
      } else {
        await applyGlobals(page, globals);
      }
      await page.addStyleTag({content: FREEZE_CSS});
      await settle(page, settleMs);
      await verifyApplied(page, {theme: shot.theme, mode: shot.mode});

      const png = await page.screenshot({fullPage: true, animations: 'disabled'});
      fs.writeFileSync(path.join(shotsDir, `${shot.key}.png`), png);
      const size = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      }));
      shots[shot.key] = {
        sha256: crypto.createHash('sha256').update(png).digest('hex'),
        width: size.width,
        height: size.height,
        storyId: shot.storyId,
        title: shot.title,
        name: shot.name,
        component: shot.component,
        theme: shot.theme,
        mode: shot.mode,
        reasons: shot.reasons,
      };

      for (const [key, values] of Object.entries(await observeTargets(page))) {
        observed[key] ??= new Set();
        for (const value of values) observed[key].add(value);
      }
    } catch (error) {
      failures.push({key: shot.key, error: String(error?.message ?? error).slice(0, 400)});
      // A story that will not render poisons the page for the next shot in the
      // same story group.
      currentStory = null;
    }
    done += 1;
    onProgress?.({done, total: plan.length, key: shot.key});
  }

  await browser.close();
  await server.close();

  return {
    manifest: {
      version: 1,
      platform: `${process.platform}-${process.arch}`,
      browser: `chromium-${browserVersion}`,
      viewport,
      settleMs,
      capturedAt: new Date().toISOString(),
      shots,
      observedTargets: Object.fromEntries(
        Object.entries(observed).map(([key, values]) => [key, [...values].sort()]),
      ),
    },
    failures,
  };
}
