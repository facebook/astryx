#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Builds the published foundation recipes in isolated consumer projects.
 * @input Packed Core, Neutral and CLI packages, or the current built workspace.
 * @output Browser screenshots and measurements; fails if correct recipes or
 *   theme/utility precedence break, or bad reset/preflight controls pass.
 * @position Package-to-consumer proof for the adoption workflow, not a DOM mock.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {execFileSync, execFile} from 'node:child_process';
import {parseArgs} from 'node:util';
import {launchBrowser} from '../../packages/cli/assets/checks/foundation-smoke.mjs';
const root = path.resolve(import.meta.dirname, '../..');
const {values} = parseArgs({
  options: {
    'packages-dir': {type: 'string'},
    'output-dir': {type: 'string', default: 'test-results/foundation-consumer'},
  },
});
const output = path.resolve(values['output-dir']);
fs.mkdirSync(output, {recursive: true});
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'foundation-consumer-'));
const packages = values['packages-dir']
  ? path.resolve(values['packages-dir'])
  : path.join(temp, 'packages');
const results = {};
let browser;

function run(cwd, command, args) {
  try {
    return execFileSync(command, args, {
      cwd,
      encoding: 'utf8',
      env: {...process.env, CI: 'true'},
      maxBuffer: 16 * 1024 * 1024,
    });
  } catch (error) {
    throw new Error(
      `${command} ${args.join(' ')} failed:\n${error.stdout || ''}\n${error.stderr || ''}`,
      {cause: error},
    );
  }
}
function write(dir, name, content) {
  const file = path.join(dir, name);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, content);
}
function code(doc, label) {
  const block = doc.sections
    .flatMap(section => section.content)
    .find(item => item.type === 'code' && item.label === label);
  assert.ok(block, `Published guide has no ${label} recipe`);
  return block.code;
}
async function serve(dir) {
  const server = http.createServer((request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const file = path.join(
      dir,
      pathname === '/' || pathname === '/probe/'
        ? 'index.html'
        : pathname.slice(1),
    );
    fs.readFile(file, (error, data) => {
      response.writeHead(error ? 404 : 200, {
        'Content-Type':
          {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.woff2': 'font/woff2',
          }[path.extname(file)] || 'application/octet-stream',
      });
      response.end(error ? 'Not found' : data);
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return {server, url: `http://127.0.0.1:${server.address().port}`};
}
async function guard(app, dist, name, expected = 0, selfTest = false) {
  const {server, url} = await serve(dist);
  try {
    const script = path.join(
      app,
      'node_modules/@astryxdesign/cli/assets/checks/foundation-smoke.mjs',
    );
    assert.ok(
      fs.existsSync(script),
      'Published CLI omitted the consumer guard',
    );
    const args = [
      script,
      '--url',
      `${url}/`,
      '--output-dir',
      path.join(output, name),
    ];
    if (selfTest) args.push('--self-test');
    const result = await new Promise(resolve => {
      execFile(
        process.execPath,
        args,
        {
          cwd: app,
          encoding: 'utf8',
          env: {...process.env},
          timeout: 90000,
        },
        (error, stdout, stderr) =>
          resolve({status: error ? (error.code ?? -1) : 0, stdout, stderr}),
      );
    });
    assert.equal(
      result.status,
      expected,
      `${name}: ${result.stdout}\n${result.stderr}`,
    );
    if (expected === 1)
      assert.match(
        result.stderr,
        /inlineStart: 0px/,
        `${name}: failure was not collapsed padding`,
      );
    results[name] = {
      exitCode: result.status,
      ...JSON.parse(
        fs.readFileSync(path.join(output, name, 'padding.json'), 'utf8'),
      ),
    };
    console.log(`✓ ${name}: exit ${result.status}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}
async function modesAndPrecedence(dist, name) {
  const {server, url} = await serve(dist);
  try {
    for (const mode of ['light', 'dark']) {
      const context = await browser.newContext({
        colorScheme: mode,
        viewport: {width: 1100, height: 900},
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      try {
        await page.goto(`${url}/`, {waitUntil: 'domcontentloaded'});
        const button = page.getByTestId('foundation-smoke-button');
        await button.waitFor({state: 'visible'});
        const baseline = await button.evaluate(
          element => getComputedStyle(element).paddingInlineStart,
        );
        assert.ok(
          Number.parseFloat(baseline) > 0,
          `${name}/${mode}: collapsed baseline`,
        );
        await page
          .getByTestId('foundation-smoke')
          .screenshot({path: path.join(output, `${name}-${mode}.png`)});
        await page.goto(`${url}/probe/`, {waitUntil: 'domcontentloaded'});
        await page.locator('#theme-probe').waitFor({state: 'visible'});
        const seen = await page.evaluate(() => ({
          theme: getComputedStyle(document.getElementById('theme-probe'))
            .paddingInlineStart,
          utility: getComputedStyle(document.getElementById('utility-probe'))
            .paddingInlineStart,
        }));
        assert.ok(
          Number.parseFloat(seen.theme) > Number.parseFloat(baseline),
          `${name}/${mode}: theme override did not beat the base (${JSON.stringify(seen)})`,
        );
        assert.ok(
          Number.parseFloat(seen.utility) > 0 &&
            Number.parseFloat(seen.utility) < Number.parseFloat(seen.theme),
          `${name}/${mode}: utility did not beat the theme (${JSON.stringify(seen)})`,
        );
        assert.deepEqual(errors, [], 'Consumer browser errors');
        results[`${name}-${mode}`] = {baseline, ...seen};
        console.log(
          `✓ ${name}/${mode}: base ${baseline}, theme ${seen.theme}, utility ${seen.utility}`,
        );
      } finally {
        await context.close();
      }
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

try {
  if (!values['packages-dir']) {
    fs.mkdirSync(packages, {recursive: true});
    for (const [pkg, file] of [
      ['@astryxdesign/core', 'core'],
      ['@astryxdesign/theme-neutral', 'neutral'],
      ['@astryxdesign/cli', 'cli'],
    ]) {
      run(root, 'pnpm', [
        '-F',
        pkg,
        'pack',
        '--out',
        path.join(packages, `${file}.tgz`),
      ]);
    }
  }
  browser = await launchBrowser();
  results.browser = browser.version();
  for (const kind of ['plain', 'tailwind']) {
    const app = path.join(temp, kind);
    fs.mkdirSync(app);
    write(
      app,
      'package.json',
      JSON.stringify(
        {
          name: `foundation-consumer-${kind}`,
          private: true,
          type: 'module',
          scripts: {build: 'vite build'},
          dependencies: {
            '@astryxdesign/core': `file:${path.join(packages, 'core.tgz')}`,
            '@astryxdesign/theme-neutral': `file:${path.join(packages, 'neutral.tgz')}`,
            '@astryxdesign/cli': `file:${path.join(packages, 'cli.tgz')}`,
            '@stylexjs/stylex': '0.19.0',
            react: '19.2.7',
            'react-dom': '19.2.7',
          },
          devDependencies: {
            vite: '8.1.3',
            '@vitejs/plugin-react': '5.2.0',
            playwright: '1.61.1',
            ...(kind === 'tailwind'
              ? {tailwindcss: '^4', '@tailwindcss/vite': '^4'}
              : {}),
          },
        },
        null,
        2,
      ),
    );
    write(app, '.npmrc', 'registry=https://registry.npmjs.org/\n');
    run(app, 'npm', ['install', '--no-audit', '--no-fund']);
    const cli = path.join(
      app,
      'node_modules/@astryxdesign/cli/clients/cli/bin/astryx.mjs',
    );
    const setup = JSON.parse(
      run(app, process.execPath, [
        cli,
        '--json',
        'docs',
        'migration/migration-setup',
        '--full',
      ]),
    ).data;
    const guide =
      kind === 'tailwind'
        ? JSON.parse(
            run(app, process.execPath, [
              cli,
              '--json',
              'docs',
              'styling-libraries/tailwind',
              '--full',
            ]),
          ).data
        : setup;
    const css = code(
      guide,
      kind === 'tailwind' ? 'globals.css' : 'globals.css (without Tailwind)',
    );
    write(app, 'src/layers.css', code(guide, 'layers.css (import first)'));
    write(
      app,
      'src/globals.css',
      css +
        '\n@layer utilities { .foundation-utility { padding-inline: var(--spacing-2); } }',
    );
    write(app, 'src/AppRoot.tsx', code(setup, 'AppRoot.tsx'));
    run(app, process.execPath, [
      cli,
      'template',
      'FoundationSmoke',
      'src/FoundationSmoke.tsx',
    ]);
    const scaffold = fs.readFileSync(
      path.join(app, 'src/FoundationSmoke.tsx'),
      'utf8',
    );
    assert.match(
      scaffold,
      /data-testid="foundation-smoke-button"/,
      'CLI did not scaffold the real smoke screen',
    );
    write(
      app,
      'index.html',
      '<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>',
    );
    write(
      app,
      'vite.config.mts',
      `import {defineConfig} from 'vite';\nimport react from '@vitejs/plugin-react';\n${kind === 'tailwind' ? "import tailwindcss from '@tailwindcss/vite';" : ''}\nexport default defineConfig({plugins: [${kind === 'tailwind' ? 'tailwindcss(), ' : ''}react()]});`,
    );
    write(
      app,
      'src/main.tsx',
      `import './layers.css';
import './globals.css';
import {createRoot} from 'react-dom/client';
import {Theme, defineTheme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {Button} from '@astryxdesign/core/Button';
import {VStack} from '@astryxdesign/core/Layout';
import {AppRoot} from './AppRoot';
import FoundationSmoke from './FoundationSmoke';
const probe = defineTheme({name: 'foundation-probe', extends: neutralTheme, components: {button: {base: {paddingInline: 'var(--spacing-8)'}}}});
const content = location.pathname === '/probe/'
  ? <Theme theme={probe} mode="system"><VStack gap={4}><Button id="theme-probe" label="Theme override"/><Button id="utility-probe" label="Utility override" className="${kind === 'tailwind' ? 'px-2' : 'foundation-utility'}"/></VStack></Theme>
  : <AppRoot><FoundationSmoke/></AppRoot>;
createRoot(document.getElementById('root')!).render(content);
`,
    );
    run(app, 'npx', ['--no-install', 'playwright', 'install', 'chromium']);
    run(app, 'npm', ['run', 'build']);
    const dist = path.join(app, 'dist');
    await guard(app, dist, `${kind}-correct`, 0, true);
    await modesAndPrecedence(dist, kind);
    const variants = [
      ['reset-layer', `${css}\n@layer reset { * { padding: 0; } }`, 0],
      ['late-reset', `${css}\n@layer components { * { padding: 0; } }`, 1],
      ['unlayered-reset', `${css}\n* { padding: 0; }`, 1],
      ...(kind === 'tailwind'
        ? [
            [
              'unlayered-preflight',
              css.replace(
                '"tailwindcss/preflight.css" layer(base)',
                '"tailwindcss/preflight.css"',
              ),
              1,
            ],
          ]
        : []),
    ];
    for (const [label, stylesheet, expected] of variants) {
      write(app, 'src/globals.css', stylesheet);
      run(app, 'npm', ['run', 'build']);
      await guard(app, dist, `${kind}-${label}`, expected);
    }
  }
  console.log('✓ Both packed consumer recipes and all failure controls passed');
} finally {
  fs.writeFileSync(
    path.join(output, 'results.json'),
    JSON.stringify(results, null, 2) + '\n',
  );
  if (browser) await browser.close();
  fs.rmSync(temp, {recursive: true, force: true});
}
