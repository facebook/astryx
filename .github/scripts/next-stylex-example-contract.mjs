#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Production + development browser contract for the standalone Next/StyleX examples.
 * The app must provide /, /details, and src/app/HmrProbe.tsx.
 */

import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const appDir = path.resolve(repoRoot, process.argv[2] ?? '');
const appName = path.basename(appDir);
const artifacts = path.join(repoRoot, 'test-results', 'next-stylex', appName);
const hmrProbe = path.join(appDir, 'src/app/HmrProbe.tsx');
const port = Number(process.env.NEXT_STYLEX_PORT ?? 4317);

function invariant(value, message) {
  if (!value) {
    throw new Error(message);
  }
}

function run(command, args, cwd, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: {...process.env, ...options.env},
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', chunk => {
      output += chunk;
      if (options.echo) process.stdout.write(chunk);
    });
    child.stderr.on('data', chunk => {
      output += chunk;
      if (options.echo) process.stderr.write(chunk);
    });
    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) resolve(output);
      else
        reject(
          new Error(`${command} ${args.join(' ')} exited ${code}\n${output}`),
        );
    });
  });
}

function start(command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    detached: true,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', chunk => process.stdout.write(chunk));
  child.stderr.on('data', chunk => process.stderr.write(chunk));
  return child;
}

function stop(child) {
  if (child == null || child.exitCode != null) return;
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch (error) {
    if (error.code !== 'ESRCH') throw error;
  }
}

async function waitForHttp(url, child) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (child.exitCode != null) {
      throw new Error(
        `Server exited ${child.exitCode} before ${url} became ready`,
      );
    }
    const ready = await new Promise(resolve => {
      const request = http.get(url, response => {
        response.resume();
        resolve(response.statusCode >= 200 && response.statusCode < 500);
      });
      request.on('error', () => resolve(false));
      request.setTimeout(1_000, () => {
        request.destroy();
        resolve(false);
      });
    });
    if (ready) return;
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function allCss(page) {
  return page.evaluate(async () => {
    const hrefs = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]'),
    ).map(link => link.href);
    return (
      await Promise.all(
        hrefs.map(href => fetch(href).then(response => response.text())),
      )
    ).join('\n');
  });
}

async function staticContract() {
  const requireFromApp = createRequire(path.join(appDir, 'package.json'));
  const manifest = requireFromApp('./package.json');
  const nextConfig = readFileSync(path.join(appDir, 'next.config.mjs'), 'utf8');
  const babel = requireFromApp('./babel.config.js');
  const postcss = requireFromApp('./postcss.config.js');

  invariant(
    manifest.scripts.dev === 'next dev',
    'dev must use ordinary Turbopack command',
  );
  invariant(
    manifest.scripts.build === 'next build',
    'build must use ordinary Turbopack command',
  );
  invariant(
    manifest.dependencies.next === '16.3.6',
    'example must pin compatible Next 16.3.6',
  );
  invariant(
    !/(webpack|withAstryx|transpilePackages)/i.test(nextConfig),
    'next.config must not compile, transpile, or alias Astryx source',
  );
  invariant(
    babel.plugins?.length === 1,
    'Babel must transform product StyleX only',
  );
  invariant(
    manifest.dependencies['@stylexjs/stylex'] === '0.19.1' &&
      manifest.devDependencies['@stylexjs/babel-plugin'] === '0.19.1' &&
      manifest.devDependencies['@stylexjs/postcss-plugin'] === '0.19.1',
    'StyleX runtime and compilers must pin 0.19.1',
  );

  const options = postcss.plugins['@stylexjs/postcss-plugin'];
  invariant(options.cwd === appDir, 'PostCSS cwd must be the app root');
  invariant(
    JSON.stringify(options.include) ===
      JSON.stringify(['src/app/**/*.{js,jsx,ts,tsx}']),
    'PostCSS include must be the strict product source glob',
  );
  invariant(
    options.exclude.includes('**/node_modules/**') &&
      options.exclude.includes('../../packages/**/*'),
    'PostCSS must explicitly exclude installed and repository Astryx packages',
  );
  invariant(
    options.useCSSLayers.prefix === 'product',
    'product CSS layers need a namespace',
  );
  invariant(
    JSON.stringify(options.useCSSLayers.before) ===
      JSON.stringify(['reset', 'astryx-base', 'astryx-theme']),
    'Astryx layer order must precede product CSS',
  );

  invariant(
    !readFileSync(path.join(appDir, 'src/app/page.tsx'), 'utf8').includes(
      "'use client'",
    ),
    'home route must remain a server component',
  );
  invariant(
    !readFileSync(
      path.join(appDir, 'src/app/details/page.tsx'),
      'utf8',
    ).includes("'use client'"),
    'details route must remain a server component',
  );
  const globals = readFileSync(
    path.join(appDir, 'src/app/globals.css'),
    'utf8',
  );
  const layerImport = "@import './layers.css'";
  const resetImport = "@import '@astryxdesign/core/reset.css'";
  invariant(
    globals.includes(layerImport) &&
      globals.includes(resetImport) &&
      globals.indexOf(layerImport) < globals.indexOf(resetImport),
    'the canonical layer order must be imported before Astryx CSS',
  );
}

async function productionContract(browser) {
  const buildOutput = await run('pnpm', ['build'], appDir, {echo: true});
  await run('pnpm', ['check:stylex'], appDir, {echo: true});
  invariant(
    /Turbopack/i.test(buildOutput),
    'Next production build did not report Turbopack',
  );

  const server = start(
    'pnpm',
    ['exec', 'next', 'start', '-p', String(port)],
    appDir,
  );
  try {
    await waitForHttp(`http://localhost:${port}/`, server);
    const browserCases = [
      {
        name: 'desktop-light',
        viewport: {width: 1440, height: 900},
        colorScheme: 'light',
      },
      {
        name: 'desktop-dark',
        viewport: {width: 1440, height: 900},
        colorScheme: 'dark',
      },
      {
        name: 'mobile-light',
        viewport: {width: 390, height: 844},
        colorScheme: 'light',
      },
      {
        name: 'mobile-dark',
        viewport: {width: 390, height: 844},
        colorScheme: 'dark',
      },
    ];
    mkdirSync(artifacts, {recursive: true});

    let homeCss = '';
    let detailsClass = '';
    for (const browserCase of browserCases) {
      const page = await browser.newPage({
        viewport: browserCase.viewport,
        colorScheme: browserCase.colorScheme,
      });
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: 'domcontentloaded',
      });
      await page.locator('[data-server-route="home"]').waitFor();
      await page.locator('[data-hmr-probe]').waitFor();
      const home = await page
        .locator('[data-product-stylex="home"]')
        .evaluate(element => ({
          display: getComputedStyle(element).display,
          className: element.className,
        }));
      const probe = await page
        .locator('[data-hmr-probe]')
        .evaluate(element => ({
          padding: getComputedStyle(element).padding,
          className: element.className,
        }));
      invariant(home.display === 'flex', 'home product StyleX did not paint');
      invariant(
        probe.padding === '4px',
        `client StyleX padding was ${probe.padding}`,
      );
      invariant(
        [...home.className.split(/\s+/), ...probe.className.split(/\s+/)].some(
          name => /^p/.test(name),
        ),
        'product classes do not use the p prefix',
      );
      if (browserCase.name === 'desktop-light') homeCss = await allCss(page);
      await page.screenshot({
        path: path.join(artifacts, `${browserCase.name}.png`),
        fullPage: true,
      });

      await page.goto(`http://localhost:${port}/details`, {
        waitUntil: 'domcontentloaded',
      });
      await page.locator('[data-server-route="details"]').waitFor();
      detailsClass = await page
        .locator('[data-product-stylex="details"]')
        .getAttribute('class');
      invariant(
        detailsClass != null,
        'second route product StyleX element lacks a class',
      );
      invariant(
        detailsClass.split(/\s+/).some(name => /^p/.test(name)),
        'second route lacks product CSS',
      );
      await page.close();
    }

    const compactCss = homeCss.replace(/\s+/g, '');
    const layerHeader = '@layerreset,astryx-base,astryx-theme,product;';
    invariant(
      compactCss.includes(layerHeader) &&
        compactCss.indexOf('@layerproduct.priority1') >
          compactCss.indexOf(layerHeader),
      'CSS layer order is not reset → Astryx base → theme → product',
    );
    const sentinelCount = (
      homeCss.match(/@property\s+--x---_avatar-group-overlap/g) ?? []
    ).length;
    invariant(
      sentinelCount === 1,
      `precompiled Astryx CSS sentinel appeared ${sentinelCount} times`,
    );
    for (const className of detailsClass.split(/\s+/).filter(Boolean)) {
      if (/^p/.test(className)) {
        invariant(
          homeCss.includes(`.${className}`),
          'the app-wide sheet omitted second-route CSS',
        );
      }
    }
  } finally {
    stop(server);
  }
}

async function developmentContract(browser) {
  const original = readFileSync(hmrProbe, 'utf8');
  const server = start(
    'pnpm',
    ['exec', 'next', 'dev', '-p', String(port + 1)],
    appDir,
  );
  try {
    await waitForHttp(`http://localhost:${port + 1}/`, server);
    const page = await browser.newPage({viewport: {width: 1024, height: 768}});
    await page.goto(`http://localhost:${port + 1}/`, {
      waitUntil: 'domcontentloaded',
    });
    const probe = page.locator('[data-hmr-probe]');
    await probe.waitFor();
    const background = () =>
      probe.evaluate(element => getComputedStyle(element).backgroundColor);
    invariant(
      (await background()) === 'rgba(0, 0, 0, 0)',
      'HMR probe baseline is not transparent',
    );
    // The first render can finish before Turbopack's filesystem watcher is
    // subscribed. Let that watcher settle so the first mutation is observable.
    await new Promise(resolve => setTimeout(resolve, 1_000));

    writeFileSync(
      hmrProbe,
      original.replace(
        'padding: 4,',
        "padding: 4,\n    backgroundColor: 'rgb(11, 22, 33)',",
      ),
    );
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector('[data-hmr-probe]'))
          .backgroundColor === 'rgb(11, 22, 33)',
    );

    writeFileSync(
      hmrProbe,
      readFileSync(hmrProbe, 'utf8').replace(
        'rgb(11, 22, 33)',
        'rgb(44, 55, 66)',
      ),
    );
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector('[data-hmr-probe]'))
          .backgroundColor === 'rgb(44, 55, 66)',
    );

    writeFileSync(hmrProbe, original);
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector('[data-hmr-probe]'))
          .backgroundColor === 'rgba(0, 0, 0, 0)',
    );
    await page.close();
  } finally {
    writeFileSync(hmrProbe, original);
    stop(server);
  }
}

async function main() {
  invariant(
    appDir.startsWith(repoRoot),
    'app path must be inside the repository',
  );
  rmSync(artifacts, {recursive: true, force: true});
  await staticContract();
  const browser = await chromium.launch();
  try {
    await productionContract(browser);
    await developmentContract(browser);
  } finally {
    await browser.close();
  }
  console.log(
    `Next StyleX contract passed for ${path.relative(repoRoot, appDir)}`,
  );
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
