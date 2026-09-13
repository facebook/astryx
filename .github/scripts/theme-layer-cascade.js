#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @description Asserts production builds preserve the Astryx/theme/product cascade and keyed theme families
 * @input [--port <n>]
 * @output One line per cascade/family case; exit 1 if any browser-observable contract fails
 *
 * `packages/build/src/vite.build.test.ts` reads the built stylesheet and proves
 * each rule landed in the layer it belongs to. It cannot prove what that means:
 * which declaration actually paints is a cascade fact, and jsdom resolves no
 * cascade. This builds the same fixture and looks.
 *
 * Three origins compete on one element, and the order between them is the whole
 * contract:
 *
 *   Astryx's own rule   @layer astryx-base    loses to both
 *   a theme override    @layer astryx-theme   beats Astryx, loses to the app
 *   the app's StyleX    @layer product        beats both
 *
 * The middle row is what shipped broken — the build never split, so everything
 * StyleX emitted outranked `astryx-theme`. The fix for that then inverted the
 * bottom row for a while: wrapping instead of splitting put the app's own
 * styles in `astryx-base`, where a theme could silently restyle them. Both
 * failures are one assertion apart, which is why this checks both directions.
 */

const {execFileSync} = require('node:child_process');
const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const os = require('node:os');
const {pathToFileURL} = require('node:url');

const args = process.argv.slice(2);
const getArg = name => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const port = Number(getArg('port') || 6012);
const REPO_ROOT = process.cwd();
const FIXTURE = path.join(REPO_ROOT, 'packages/build/__fixtures__/layer-split');
const FAMILY_FIXTURE = path.join(
  REPO_ROOT,
  'packages/cli/test/fixtures/theme-family',
);
const FAMILY_FILES = [
  'ocean.mjs',
  'ocean-calm.mjs',
  'ocean-calm-deep.mjs',
  'ocean-midnight.mjs',
];
const CLI_BIN = path.join(REPO_ROOT, 'packages/cli/clients/cli/bin/astryx.mjs');
const CORE_SRC = path.join(REPO_ROOT, 'packages/core/src');

/** Kept in step with the fixture; a mismatch here reads as a cascade failure. */
const THEME_COLOR = 'rgb(0, 120, 255)';
const PRODUCT_COLOR = 'rgb(255, 140, 0)';

/** The fixture theme's `--color-data-categorical-blue`, light and dark side. */
const DATA_OVERRIDE_LIGHT = 'rgb(1, 2, 3)';
const DATA_OVERRIDE_DARK = 'rgb(4, 5, 6)';
/** Untouched defaults: --color-data-categorical-orange, --color-data-neutral. */
const DATA_DEFAULT = 'rgb(235, 110, 0)';
const DATA_DEFAULT_DARK_SIDE = 'rgb(140, 147, 155)';

const CONTENT_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
};

function createServer(dir, listenPort) {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const rel = (req.url === '/' ? '/index.html' : req.url).split('?')[0];
      const resolved = path.resolve(path.join(dir, rel));
      if (!resolved.startsWith(path.resolve(dir))) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      fs.readFile(resolved, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, {
          'Content-Type': CONTENT_TYPES[path.extname(resolved)] || 'text/plain',
        });
        res.end(data);
      });
    });
    server.listen(listenPort, () => resolve(server));
  });
}

async function buildFixture(outDir) {
  const {build} = await import('vite');
  const react = (await import('@vitejs/plugin-react')).default;

  // .github/scripts is outside the workspace, so a bare specifier does not
  // resolve here. The Vite plugin ships as a build artifact.
  const pluginPath = path.join(REPO_ROOT, 'packages/build/dist/vite.mjs');
  if (!fs.existsSync(pluginPath)) {
    throw new Error(
      `${pluginPath} is missing — run \`pnpm -F @astryxdesign/build build\` first.`,
    );
  }
  const {astryxStylex} = await import(pathToFileURL(pluginPath).href);
  await build({
    root: FIXTURE,
    logLevel: 'error',
    build: {outDir, emptyOutDir: true},
    resolve: {alias: {'@astryxdesign/core': CORE_SRC}},
    plugins: [
      react(),
      ...astryxStylex({
        stylexOptions: {
          dev: false,
          unstable_moduleResolution: {type: 'commonJS', rootDir: REPO_ROOT},
          aliases: {
            '@astryxdesign/core/*': [path.join(CORE_SRC, '*')],
            '@astryxdesign/core': [CORE_SRC],
          },
        },
        libraryPattern: 'packages/core/',
      }),
    ],
  });
}

function prepareFamilyFixture() {
  const dir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'astryx-theme-family-src-'),
  );
  fs.cpSync(FAMILY_FIXTURE, dir, {recursive: true});
  const scope = path.join(dir, 'node_modules/@astryxdesign');
  fs.mkdirSync(scope, {recursive: true});
  fs.symlinkSync(path.dirname(CORE_SRC), path.join(scope, 'core'), 'dir');
  const run = args =>
    execFileSync(process.execPath, [CLI_BIN, 'theme', 'build', ...args], {
      cwd: dir,
      stdio: 'pipe',
    });
  run(['--family', ...FAMILY_FILES, '--family-key', 'ocean-family']);
  run(FAMILY_FILES);
  return fs.realpathSync(dir);
}
async function buildFamilyFixture(root, outDir) {
  const {build} = await import('vite');
  await build({
    root,
    logLevel: 'error',
    build: {outDir: path.relative(root, outDir), emptyOutDir: true},
  });
}
const nextFrame = page =>
  page.evaluate(
    () =>
      new Promise(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
async function familySnapshot(page, name) {
  await page.evaluate(
    value =>
      document
        .querySelector('[data-switch-root]')
        .setAttribute('data-astryx-theme', value),
    name,
  );
  await nextFrame(page);
  await page.hover('#hover-button');
  const hoverBackground = await page.$eval(
    '#hover-button',
    element => getComputedStyle(element).backgroundColor,
  );
  await page.mouse.move(0, 0);
  const snapshot = await page.evaluate(() => {
    const style = selector =>
      getComputedStyle(document.querySelector(selector));
    return {
      activeBackground: style('#active-button').backgroundColor,
      activeBorderWidth: style('#active-button').borderWidth,
      activeMinHeight: style('#active-button').minHeight,
      mediaBorderColor: style('#media-button').borderColor,
      proseFont: style('#prose').fontFamily,
      schemeColor: style('#scheme-probe').color,
      rootColorScheme: style('[data-switch-root]').colorScheme,
    };
  });
  return {...snapshot, hoverBackground};
}
async function loadStylesheet(page, href) {
  await page.evaluate(
    value =>
      new Promise((resolve, reject) => {
        const link = document.querySelector('#family-css');
        link.onload = resolve;
        link.onerror = reject;
        link.href = `${value}?browser-compare=${Date.now()}`;
      }),
    href,
  );
  await nextFrame(page);
}
async function verifyFamilyPage(browser, url, label, check, compareStandalone) {
  const page = await browser.newPage({viewport: {width: 920, height: 420}});
  const cssRequests = [];
  const pageErrors = [];
  page.on('request', request => {
    if (new URL(request.url()).pathname.endsWith('.css'))
      cssRequests.push(request.url());
  });
  page.on('pageerror', error => pageErrors.push(error.message));
  const checks = rows => {
    for (const [name, actual, expected, why] of rows) {
      check(`${label}: ${name}`, actual, expected, why);
    }
  };
  try {
    await page.goto(url, {waitUntil: 'networkidle', timeout: 60000});
    await page.waitForFunction(() => window.oceanFamilyReady === true);
    const names = await page.evaluate(() =>
      Object.values(window.oceanFamily).map(theme => theme.name),
    );
    const first = await page.evaluate(() => {
      const style = selector =>
        getComputedStyle(document.querySelector(selector));
      return {
        ...window.oceanFamilyFirstPaint,
        nested: `${style('#nested .astryx-button').backgroundColor}/${style('#nested .astryx-button').borderWidth}`,
        deep: `${style('#deep .astryx-button').backgroundColor}/${style('#deep .astryx-button').borderWidth}`,
        sibling: `${style('#sibling .astryx-button').backgroundColor}/${style('#sibling .astryx-button').borderWidth}`,
      };
    });
    // prettier-ignore
    checks([
      ['exports', names.join(','), 'ocean,ocean-calm,ocean-calm-deep,ocean-midnight', 'a member is missing'],
      ['raw-link first paint', first.activeBackground, 'rgb(0, 119, 182)', 'CSS was late'],
      ['nested first paint', first.nestedBackground, 'rgb(0, 150, 170)', 'outer theme leaked'],
      ['nested child', first.nested, 'rgb(0, 150, 170)/4px', 'child values are incomplete'],
      ['zero-delta descendant', first.deep, 'rgb(0, 150, 170)/4px', 'identity lost styling'],
      ['sibling isolation', first.sibling, 'rgb(3, 54, 73)/2px', 'sibling values leaked'],
      ['one eager stylesheet', cssRequests.length, 1, 'more than one CSS file loaded'],
    ]);
    await page.evaluate(() =>
      document
        .querySelector('[data-switch-root]')
        .setAttribute('data-astryx-theme', 'ocean-calm'),
    );
    const beforeOrder = await page.$eval(
      '#active-button',
      el => getComputedStyle(el).backgroundColor,
    );
    await page.evaluate(() =>
      document.head.append(document.querySelector('#unrelated-before')),
    );
    await nextFrame(page);
    check(
      `${label}: unrelated same-layer order`,
      await page.$eval(
        '#active-button',
        el => getComputedStyle(el).backgroundColor,
      ),
      beforeOrder,
      'physical order changed the scoped winner',
    );
    const familySnapshots = new Map();
    for (const name of names)
      familySnapshots.set(name, await familySnapshot(page, name));
    const calm = familySnapshots.get('ocean-calm');
    // prettier-ignore
    checks([
      ['inherited hover', calm.hoverBackground, 'rgb(220, 40, 40)', 'resting rule suppressed hover'],
      ['inherited adaptation', calm.activeMinHeight, '42px', 'resting rule suppressed adaptation'],
      ['inherited media', calm.mediaBorderColor, 'rgb(72, 202, 228)', 'resting rule suppressed media'],
    ]);
    await page.evaluate(() =>
      document
        .querySelector('[data-switch-root]')
        .setAttribute('data-astryx-theme', 'ocean'),
    );
    const requestsBeforeSwitch = cssRequests.length;
    await page.click('[data-family-switcher]');
    await nextFrame(page);
    // prettier-ignore
    checks([
      ['attribute-only switch', await page.$eval('[data-switch-root]', el => el.getAttribute('data-astryx-theme')), 'ocean-calm', 'identity did not select child'],
      ['switch performs no CSS request', cssRequests.length, requestsBeforeSwitch, 'switch fetched CSS'],
    ]);
    if (compareStandalone) {
      await page.setViewportSize({width: 800, height: 420});
      await loadStylesheet(page, './ocean-family.css');
      const familyAt800 = await familySnapshot(page, 'ocean-calm');
      for (const name of names) {
        await page.setViewportSize({width: 920, height: 420});
        await loadStylesheet(page, `./${name}.css`);
        check(
          `${label}: ${name} matches standalone`,
          JSON.stringify(await familySnapshot(page, name)),
          JSON.stringify(familySnapshots.get(name)),
          'family CSS differs from standalone',
        );
        if (name === 'ocean-calm') {
          await page.setViewportSize({width: 800, height: 420});
          check(
            `${label}: changed breakpoint matches standalone`,
            JSON.stringify(await familySnapshot(page, name)),
            JSON.stringify(familyAt800),
            'ancestor condition remained active',
          );
        }
      }
      const context = await browser.newContext({colorScheme: 'dark'});
      try {
        const darkPage = await context.newPage();
        await darkPage.goto(url, {waitUntil: 'networkidle', timeout: 60000});
        await darkPage.waitForFunction(() => window.oceanFamilyReady === true);
        // prettier-ignore
        const nestedColor = () => darkPage.$eval('#nested', element => { element.style.color = 'var(--color-accent)'; return getComputedStyle(element).color; });
        const familyNestedDark = await nestedColor();
        await loadStylesheet(darkPage, './ocean-calm.css');
        const standaloneNestedDark = await nestedColor();
        // prettier-ignore
        check(`${label}: nested system scheme matches standalone`, familyNestedDark, standaloneNestedDark, 'nested tuple member lost dark preference');
        await loadStylesheet(darkPage, './ocean-family.css');
        await darkPage.evaluate(() => {
          document.documentElement.dataset.theme = 'dark';
        });
        const familyNestedExplicit = await nestedColor();
        await loadStylesheet(darkPage, './ocean-calm.css');
        const standaloneNestedExplicit = await nestedColor();
        // prettier-ignore
        check(`${label}: nested document mode matches standalone`, familyNestedExplicit, standaloneNestedExplicit, 'nested tuple member ignored explicit document mode');
        await loadStylesheet(darkPage, './ocean-family.css');
        const familyDark = await familySnapshot(darkPage, 'ocean-calm');
        // prettier-ignore
        check(`${label}: document dark mode is inherited`, familyDark.rootColorScheme, 'dark', 'family scope overrode the document mode');
        await loadStylesheet(darkPage, './ocean-calm.css');
        const standaloneDark = await familySnapshot(darkPage, 'ocean-calm');
        // prettier-ignore
        check(`${label}: inherited dark scheme matches standalone`, `${familyDark.schemeColor}/${familyDark.rootColorScheme}`, `${standaloneDark.schemeColor}/${standaloneDark.rootColorScheme}`, 'inherited light-dark() behavior differs');
        await loadStylesheet(darkPage, './ocean-family.css');
        await darkPage.addStyleTag({
          content: '@layer astryx-base {.forced-light {color-scheme: light}}',
        });
        await darkPage.evaluate(() =>
          document
            .querySelector('[data-switch-root]')
            .classList.add('forced-light'),
        );
        const familyLight = await familySnapshot(darkPage, 'ocean-calm');
        // prettier-ignore
        check(`${label}: nested light overrides dark page`, familyLight.rootColorScheme, 'light', 'ancestor mode overrode the local mode');
        await loadStylesheet(darkPage, './ocean-calm.css');
        const standaloneLight = await familySnapshot(darkPage, 'ocean-calm');
        // prettier-ignore
        check(`${label}: explicit light scheme matches standalone`, `${familyLight.schemeColor}/${familyLight.rootColorScheme}`, `${standaloneLight.schemeColor}/${standaloneLight.rootColorScheme}`, 'scoped light-dark() behavior differs');
      } finally {
        await context.close();
      }
    }
    check(
      `${label}: ESM has no page errors`,
      pageErrors.join('\n'),
      '',
      'module import failed',
    );
  } finally {
    await page.close();
  }
}
async function run() {
  const layerOutDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-cascade-'));
  let familyFixtureDir;
  let familyOutDir;
  let server;
  let browser;
  const failures = [];

  try {
    await buildFixture(layerOutDir);
    server = await createServer(layerOutDir, port);
    browser = await chromium.launch();
    const page = await browser.newPage({viewport: {width: 420, height: 220}});
    await page.goto(`http://localhost:${port}/`, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.waitForSelector('#library-only', {timeout: 20000});
    await page.waitForSelector('#data-dark-default', {timeout: 20000});

    const seen = await page.evaluate(() => {
      const color = id => getComputedStyle(document.getElementById(id)).color;
      return {
        themed: getComputedStyle(document.getElementById('library-only'))
          .backgroundColor,
        product: getComputedStyle(document.getElementById('product-wins'))
          .backgroundColor,
        padding: getComputedStyle(document.getElementById('product-box'))
          .padding,
        dataDefault: color('data-default'),
        dataOverride: color('data-override'),
        dataNested: color('data-nested'),
        dataNestedDefault: color('data-nested-default'),
        dataDark: color('data-dark'),
        dataDarkDefault: color('data-dark-default'),
      };
    });

    const check = (label, actual, expected, why) => {
      if (actual === expected) {
        console.log(`✓ ${label} — ${actual}`);
      } else {
        failures.push(label);
        console.error(
          `✗ ${label}: got ${actual}, expected ${expected} — ${why}`,
        );
      }
    };

    check(
      "a theme's component override beats Astryx's own rule",
      seen.themed,
      THEME_COLOR,
      'StyleX is outranking @layer astryx-theme, so no theme can restyle a component',
    );
    check(
      "the app's own StyleX beats the theme",
      seen.product,
      PRODUCT_COLOR,
      'product styles landed in the library layer, so a theme silently restyles app code',
    );
    check(
      "the app's own StyleX applies at all",
      seen.padding,
      '11px',
      'the product layer is not reaching the page',
    );
    check(
      'a data token default reaches an element',
      seen.dataDefault,
      DATA_DEFAULT,
      'nothing declares --color-data-*, so var() resolves to nothing',
    );
    check(
      "a theme's data token override beats the default",
      seen.dataOverride,
      DATA_OVERRIDE_LIGHT,
      'the :root defaults are outranking @layer astryx-theme — they are ' +
        'unlayered, or in a layer that sorts above it',
    );
    check(
      "a nested theme inherits the parent's data token override",
      seen.dataNested,
      DATA_OVERRIDE_LIGHT,
      'the nested theme re-declares the default in its own scope block and ' +
        'shadows the parent override — no other token family does that',
    );
    check(
      'a nested theme still gets the untouched defaults',
      seen.dataNestedDefault,
      DATA_DEFAULT,
      'the defaults do not reach inside a nested theme',
    );
    check(
      "a nested dark theme inherits the parent's override, dark side",
      seen.dataDark,
      DATA_OVERRIDE_DARK,
      'light-dark() is not resolving against the nested theme color-scheme',
    );
    check(
      'a data token default resolves on the dark side',
      seen.dataDarkDefault,
      DATA_DEFAULT_DARK_SIDE,
      'the :root defaults resolve to their light side inside a dark theme',
    );

    await page.close();
    await new Promise(resolve => server.close(resolve));
    server = undefined;

    familyFixtureDir = prepareFamilyFixture();
    server = await createServer(familyFixtureDir, port);
    await verifyFamilyPage(
      browser,
      `http://localhost:${port}/`,
      'native family link',
      check,
      true,
    );
    await new Promise(resolve => server.close(resolve));
    server = undefined;

    familyOutDir = path.join(familyFixtureDir, 'dist-vite');
    await buildFamilyFixture(familyFixtureDir, familyOutDir);
    server = await createServer(familyOutDir, port + 1);
    await verifyFamilyPage(
      browser,
      `http://localhost:${port + 1}/`,
      'Vite family build',
      check,
      false,
    );
  } finally {
    if (browser) await browser.close();
    if (server) server.close();
    fs.rmSync(layerOutDir, {recursive: true, force: true});
    if (familyFixtureDir) {
      fs.rmSync(familyFixtureDir, {recursive: true, force: true});
    }
  }

  if (failures.length > 0) {
    console.error(
      `\nFailing: ${failures.length} cascade rule(s) broken in a production ` +
        `build — ${failures.join('; ')}.`,
    );
    return 1;
  }
  console.log(
    '\nAstryx < theme < product holds, and the native/Vite family paths ' +
      'share one complete attribute-switchable artifact set.',
  );
  return 0;
}

run()
  .then(code => {
    process.exitCode = code;
  })
  .catch(e => {
    console.error('Theme layer cascade guard failed:', e);
    process.exit(1);
  });
