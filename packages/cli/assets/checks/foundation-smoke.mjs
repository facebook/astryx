#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Browser guard for the adoption foundation smoke screen (#3755).
 * @input --url <screen-url>, --sandbox-dir <dir>, or --storybook-dir <dir>;
 *   --self-test injects correctly layered and deliberately broken resets.
 * @output Computed Button padding; exit 1 for missing UI or collapsed padding.
 * @position Checks real consumer CSS in Chromium, never a mocked component.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import console from 'node:console';
import {URL, pathToFileURL} from 'node:url';
import {parseArgs} from 'node:util';
import {createRequire} from 'node:module';

/** @typedef {{inlineStart: string, inlineEnd: string, blockStart: string, blockEnd: string}} Padding */
/** @type {typeof import('playwright')} */
const playwright = createRequire(path.join(process.cwd(), 'package.json'))(
  'playwright',
);
const {chromium} = playwright;
/** @type {Array<keyof Padding>} */
const SIDES = ['inlineStart', 'inlineEnd', 'blockStart', 'blockEnd'];

/** @param {Padding} padding */
function assertPositivePadding(padding) {
  for (const side of SIDES) {
    assert.match(
      padding[side],
      /^\d+(?:\.\d+)?px$/,
      `${side}: unresolved padding`,
    );
    assert.ok(
      Number.parseFloat(padding[side]) > 0,
      `${side}: ${padding[side]} — check for unlayered resets or resets above astryx-base`,
    );
  }
}

/**
 * @param {string} dir
 * @param {string} basePath
 */
async function serve(dir, basePath) {
  const root = path.resolve(dir);
  assert.ok(
    fs.existsSync(path.join(root, 'index.html')),
    `Build missing: ${root}`,
  );
  /** @type {Record<string, string>} */
  const types = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
  };
  const server = http.createServer((request, response) => {
    const requested = new URL(request.url || '/', 'http://localhost').pathname;
    if (!requested.startsWith(`${basePath}/`)) {
      response.writeHead(404).end();
      return;
    }
    const pathname = requested.slice(basePath.length);
    const file = path.resolve(
      root,
      `.${decodeURIComponent(pathname)}${pathname.endsWith('/') ? 'index.html' : ''}`,
    );
    if (!file.startsWith(`${root}${path.sep}`)) {
      response.writeHead(403).end();
      return;
    }
    fs.readFile(file, (error, data) => {
      response.writeHead(error ? 404 : 200, {
        'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      });
      response.end(error ? 'Not found' : data);
    });
  });
  await new Promise(resolve =>
    server.listen(0, '127.0.0.1', () => resolve(undefined)),
  );
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  return {server, origin: `http://127.0.0.1:${address.port}`};
}

/**
 * @param {import('playwright').Browser} browser
 * @param {string} url
 * @param {string | undefined} css
 * @param {string | undefined} screenshot
 * @returns {Promise<Padding>}
 */
async function measure(browser, url, css, screenshot) {
  const page = await browser.newPage({viewport: {width: 1100, height: 900}});
  /** @type {string[]} */
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    const response = await page.goto(url, {waitUntil: 'domcontentloaded'});
    assert.ok(response?.ok(), 'Smoke screen request failed');
    const screen = page.getByTestId('foundation-smoke');
    await screen.waitFor({state: 'visible'});
    await screen
      .getByTestId('foundation-smoke-button')
      .waitFor({state: 'visible'});
    await screen
      .getByLabel('Workspace name', {exact: true})
      .waitFor({state: 'visible'});
    await screen
      .getByTestId('foundation-smoke-card')
      .waitFor({state: 'visible'});
    await screen.getByRole('table').waitFor({state: 'visible'});
    assert.equal(
      await screen.getByRole('row').count(),
      5,
      'Expected a header and four smoke rows',
    );
    if (css) await page.addStyleTag({content: css});
    const padding = await screen
      .getByTestId('foundation-smoke-button')
      .evaluate(element => {
        const view = element.ownerDocument.defaultView;
        if (!view) throw new Error('Smoke element has no browser window');
        const style = view.getComputedStyle(element);
        return {
          inlineStart: style.paddingInlineStart,
          inlineEnd: style.paddingInlineEnd,
          blockStart: style.paddingBlockStart,
          blockEnd: style.paddingBlockEnd,
        };
      });
    if (screenshot) await screen.screenshot({path: screenshot});
    assert.deepEqual(errors, [], 'Smoke screen browser errors');
    return padding;
  } finally {
    await page.close();
  }
}

async function launchBrowser() {
  const server =
    process.env.https_proxy ||
    process.env.HTTPS_PROXY ||
    process.env.http_proxy ||
    process.env.HTTP_PROXY;
  return chromium.launch(
    server ? {proxy: {server, bypass: 'localhost,127.0.0.1'}} : {},
  );
}

async function run() {
  const {values} = parseArgs({
    options: {
      url: {type: 'string'},
      'sandbox-dir': {type: 'string'},
      'storybook-dir': {type: 'string'},
      'base-path': {type: 'string', default: ''},
      'self-test': {type: 'boolean', default: false},
      'output-dir': {type: 'string'},
    },
  });
  assert.ok(
    [values.url, values['sandbox-dir'], values['storybook-dir']].filter(Boolean)
      .length === 1,
    'Choose --url, --sandbox-dir or --storybook-dir',
  );
  const output = values['output-dir'];
  if (output) fs.mkdirSync(output, {recursive: true});
  /** @type {import('node:http').Server | undefined} */
  let server;
  /** @type {import('playwright').Browser | undefined} */
  let browser;
  /** @type {Record<string, Padding>} */
  const results = {};
  try {
    let url = values.url;
    if (!url) {
      const basePath = values['base-path'].replace(/\/$/, '');
      assert.ok(
        basePath === '' || basePath.startsWith('/'),
        'Base path must start with /',
      );
      const dir = values['storybook-dir'] || values['sandbox-dir'];
      assert.ok(dir, 'Build directory is required');
      const hosted = await serve(dir, basePath);
      server = hosted.server;
      url =
        hosted.origin +
        basePath +
        (values['storybook-dir']
          ? '/iframe.html?id=core-foundationsmoke--default&viewMode=story'
          : '/pages/foundation-smoke/');
    }
    browser = await launchBrowser();
    /**
     * @param {string} name
     * @param {string} [css]
     */
    const probe = async (name, css) => {
      assert.ok(browser && url, 'Browser and screen URL are required');
      const padding = await measure(
        browser,
        url,
        css,
        output && path.join(output, `${name}.png`),
      );
      results[name] = padding;
      console.log(`${name}: ${JSON.stringify(padding)}`);
      return padding;
    };
    const baseline = await probe('foundation');
    assertPositivePadding(baseline);
    if (values['self-test']) {
      const reset = await probe(
        'reset-layer',
        '@layer reset { * { padding: 0; } }',
      );
      assertPositivePadding(reset);
      assert.deepEqual(
        reset,
        baseline,
        'A lowest-layer reset must not alter Button padding',
      );
      /** @type {Array<[string, string]>} */
      const brokenResets = [
        ['late-layer-reset', '@layer product { * { padding: 0; } }'],
        ['unlayered-reset', '* { padding: 0; }'],
      ];
      for (const [name, css] of brokenResets) {
        const broken = await probe(name, css);
        assert.deepEqual(
          Object.values(broken),
          SIDES.map(() => '0px'),
          `${name}: failure injection did not collapse real padding`,
        );
        assert.throws(
          () => assertPositivePadding(broken),
          /check for unlayered resets/,
          `${name}: guard accepted broken CSS`,
        );
        console.log(`✓ ${name} rejected by the same padding assertion`);
      }
    }
    console.log('✓ Foundation smoke check passed');
  } finally {
    if (output)
      fs.writeFileSync(
        path.join(output, 'padding.json'),
        `${JSON.stringify(results, null, 2)}\n`,
      );
    if (browser) await browser.close();
    const closingServer = server;
    if (closingServer)
      await new Promise(resolve =>
        closingServer.close(() => resolve(undefined)),
      );
  }
}

export {assertPositivePadding, launchBrowser, run};
if (
  process.argv[1] &&
  fs.existsSync(process.argv[1]) &&
  import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href
) {
  run().catch(error => {
    console.error(`Foundation smoke check failed: ${error.message}`);
    process.exitCode = 1;
  });
}
