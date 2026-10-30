// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file next.turbopack.test.mjs
 * @input __fixtures__/next-turbopack: an app with its own Babel config, mixed
 *   `*.tsx` rule list and StyleX PostCSS plugin, Core linked from a workspace
 *   (with its own node_modules) and Lab installed
 * @output Proves Turbopack `next build` and `next dev` render Astryx with the
 *   prebuilt class names and source-built rules (spec:AST-080 FR7), keep the
 *   app's rules to its files in their order, and let a theme override win
 * @position End-to-end regression for the Turbopack half of @astryxdesign/build
 */

import {execFileSync, spawn} from 'node:child_process';
import * as fs from 'node:fs';
import * as net from 'node:net';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';

const packageDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const repoRoot = path.resolve(packageDir, '../..');
const env = {
  ...process.env,
  NEXT_TELEMETRY_DISABLED: '1',
  TURBOPACK: undefined,
  NODE_PATH: undefined,
};
const {chromium} = await import('playwright').catch(() => ({}));
const hasChromium = fs.existsSync(chromium?.executablePath() ?? '');

let root, app, html, css, ruleLog;

const nextBin = () => path.join(app, 'node_modules/next/dist/bin/next');

function symlink(target, name, into = app) {
  const at = path.join(into, 'node_modules', name);
  fs.mkdirSync(path.dirname(at), {recursive: true});
  fs.symlinkSync(target, at, 'junction');
}

/** Copy a package's published files, as a registry install lays them out. */
function install(name, to) {
  const from = path.join(repoRoot, 'packages', name);
  const {files} = JSON.parse(fs.readFileSync(`${from}/package.json`, 'utf8'));
  for (const entry of ['package.json', ...files]) {
    if (!fs.existsSync(path.join(from, entry))) continue;
    fs.cpSync(path.join(from, entry), path.join(to, entry), {
      recursive: true,
      filter: file => !/[\\/]__tests__$|\.test\.tsx?$/.test(file),
    });
  }
}

beforeAll(() => {
  // Inside the repository (an ignored scratch directory), so Turbopack's
  // workspace root covers the linked package's real path.
  root = fs.mkdtempSync(path.join(packageDir, '.astryx-next-turbopack-'));
  app = path.join(root, 'app');
  fs.cpSync(path.join(packageDir, '__fixtures__/next-turbopack'), app, {
    recursive: true,
  });
  const dependencies = {
    [packageDir]: ['next', '@babel/core', '@stylexjs/babel-plugin'],
    [repoRoot]: ['react', 'react-dom', 'typescript', '@types/react'],
    [`${repoRoot}/packages/lab`]: ['d3-array', 'd3-scale', 'd3-shape'],
  };
  dependencies[packageDir].push('@stylexjs/postcss-plugin', '@stylexjs/stylex');
  dependencies[repoRoot].push('@types/node');
  for (const [root, names] of Object.entries(dependencies)) {
    for (const name of names) {
      symlink(fs.realpathSync(path.join(root, 'node_modules', name)), name);
    }
  }
  symlink(packageDir, '@astryxdesign/build');
  // Core linked from a workspace (`file:`, `pnpm link`, a monorepo package)...
  const core = path.join(root, 'core');
  install('core', core);
  symlink(core, '@astryxdesign/core');
  const intl = `${repoRoot}/packages/core/node_modules/intl-messageformat`;
  symlink(fs.realpathSync(intl), 'intl-messageformat', core);
  // ...and Lab as a registry install: a real directory under node_modules.
  install('lab', path.join(app, 'node_modules/@astryxdesign/lab'));
  // From the parent, as `next build <dir>` runs; `next dev` below runs in the app.
  execFileSync(process.execPath, [nextBin(), 'build', 'app'], {cwd: root, env});
  ruleLog = fs.readFileSync(path.join(app, 'rules.log'), 'utf8');
  html = fs.readFileSync(path.join(app, '.next/server/app/index.html'), 'utf8');
  const chunks = path.join(app, '.next/static/chunks');
  css = fs
    .readdirSync(chunks)
    .filter(file => file.endsWith('.css'))
    .map(file => fs.readFileSync(path.join(chunks, file), 'utf8'))
    .join('\n');
}, 600_000);

afterAll(() => {
  if (root) fs.rmSync(root, {recursive: true, force: true, maxRetries: 5});
});

/** The rendered class lists, split by whether Astryx or the app made them. */
function classLists(page) {
  const lists = [...page.matchAll(/<\w+([^>]*?) class="([^"]*)"/g)].map(
    ([, attrs, classes]) => ({attrs, classes: classes.split(/\s+/)}),
  );
  const isHook = name => name.startsWith('astryx-');
  return {
    hooks: lists.flatMap(list => list.classes.filter(isHook)),
    astryx: lists
      .filter(list => list.classes.some(isHook))
      .flatMap(list => list.classes.filter(name => name && !isHook(name))),
    app: lists
      .filter(list => list.attrs.includes('id="card"'))
      .flatMap(list => list.classes),
  };
}

/** Astryx and app classes alike render with the classes their rules use. */
function expectStyled(page, stylesheet) {
  const {hooks, astryx, app: own} = classLists(page);
  expect(hooks).toEqual(
    expect.arrayContaining(['astryx-button', 'astryx-stat']),
  );
  expect(astryx.length).toBeGreaterThan(20);
  expect(own.length).toBeGreaterThan(0);
  for (const name of astryx) expect(name).toMatch(/^x[a-z0-9]+$/);
  for (const name of own) expect(name).toMatch(/^p[a-z0-9]+$/);
  for (const name of [...astryx, ...own]) {
    expect(stylesheet, name).toContain(`.${name}`);
  }
}

describe('withAstryx() under Turbopack', () => {
  it('builds a linked Core and an installed Lab with their prebuilt class names', () => {
    expectStyled(html, css);
  });

  it("runs the app's mixed rule list in order, on the app's files only", () => {
    // The app loader also throws on Astryx source, failing the build.
    const runs = [...ruleLog.matchAll(/^(\S+) (.*)$/gm)];
    const page = path.join(app, 'src/app/page.tsx');
    const names = runs.filter(([, , file]) => file === page).map(run => run[1]);
    expect([...new Set(names)]).toEqual(['a', 'stylex', 'b']);
    expect(runs.every(run => run[2].startsWith(path.dirname(page)))).toBe(true);
  });

  it('emits Astryx rules in astryx-base layers, without a priority layer', () => {
    expect(css).toContain('@layer astryx-base');
    expect(css).not.toMatch(/@layer priority|\.astryx[a-z0-9]{5,}/);
  });

  it('serves the same in next dev', async () => {
    const port = await new Promise(resolve => {
      const server = net.createServer().listen(0, () => {
        const {port: free} = server.address();
        server.close(() => resolve(free));
      });
    });
    const child = spawn(
      process.execPath,
      [nextBin(), 'dev', '-p', String(port)],
      {cwd: app, env, detached: true, stdio: 'ignore'},
    );
    try {
      const origin = `http://localhost:${port}`;
      let page;
      for (let i = 0; i < 300 && page == null; i++) {
        const response = await fetch(origin).catch(() => null);
        if (response?.ok) page = await response.text();
        else await new Promise(resolve => setTimeout(resolve, 1000));
      }
      const hrefs = [...page.matchAll(/href="([^"]+\.css[^"]*)"/g)];
      const sheets = await Promise.all(
        hrefs.map(async ([, href]) => (await fetch(origin + href)).text()),
      );
      expectStyled(page, sheets.join('\n'));
    } finally {
      process.kill(-child.pid, 'SIGKILL');
    }
  }, 600_000);

  it.skipIf(!hasChromium && !process.env.ASTRYX_REQUIRE_CHROMIUM)(
    'lets a theme override win in either load order',
    async () => {
      // A theme stylesheet registers the layer order itself (spec:AST-080 FR3).
      const theme =
        '@layer reset, astryx-base, astryx-theme;\n' +
        '@layer astryx-theme { .astryx-button { background-color: rgb(0, 120, 255); } }';
      const body = html.replace(/<link[^>]*>|<script[\s\S]*?<\/script>/g, '');
      const browser = await chromium.launch();
      try {
        const page = await browser.newPage();
        const colors = [];
        for (const sheets of [[css], [theme, css], [css, theme]]) {
          const styles = sheets
            .map(sheet => `<style>${sheet}</style>`)
            .join('');
          await page.setContent(body.replace('</head>', `${styles}</head>`));
          colors.push(
            await page.$eval('.astryx-button', button =>
              getComputedStyle(button).getPropertyValue('background-color'),
            ),
          );
        }
        // The destructive Button's source-built `--color-error`, then the override.
        expect(colors).toEqual([
          'rgb(227, 25, 59)',
          'rgb(0, 120, 255)',
          'rgb(0, 120, 255)',
        ]);
      } finally {
        await browser.close();
      }
    },
  );
});
