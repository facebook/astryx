#!/usr/bin/env node
/**
 * @file Build pipeline: eval → Vite build → inject data into HTML
 *
 * Builds the report app, then injects evaluation data directly into
 * the HTML as a <script> tag. This guarantees the data is available
 * before React renders — no module import race conditions.
 *
 * Usage:
 *   tsx src/build-report.ts --iteration <id>
 *   tsx src/build-report.ts --iteration <id> --baseline <id>
 *   tsx src/build-report.ts --iteration <id> --baseline <id> --with-screenshots
 *   tsx src/build-report.ts --iteration <id> --dev
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {execSync} from 'node:child_process';
import {getResultsDir, readJson, ensureDir} from './utils.js';
import type {UniversalAggregate, UniversalComparison} from './types.js';

const APP_DIR = path.join(import.meta.dirname, '..', 'app');

function parseArgs(): {
  iteration: string;
  baseline?: string;
  withScreenshots: boolean;
  dev: boolean;
} {
  const args = process.argv.slice(2);
  let iteration = '';
  let baseline: string | undefined;
  let withScreenshots = false;
  let dev = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--iteration' && args[i + 1]) {
      iteration = args[i + 1];
      i++;
    } else if (args[i] === '--baseline' && args[i + 1]) {
      baseline = args[i + 1];
      i++;
    } else if (args[i] === '--with-screenshots') {
      withScreenshots = true;
    } else if (args[i] === '--dev') {
      dev = true;
    }
  }

  if (!iteration) {
    console.error(
      'Usage: tsx src/build-report.ts --iteration <id> [--baseline <id>] [--with-screenshots] [--dev]',
    );
    process.exit(1);
  }

  return {iteration, baseline, withScreenshots, dev};
}

function ensureUniversalJson(iteration: string): UniversalAggregate {
  const resultsDir = getResultsDir();
  const universalPath = path.join(resultsDir, iteration, 'universal.json');

  if (!fs.existsSync(universalPath)) {
    console.log(`Generating universal.json for ${iteration}...`);
    execSync(
      `tsx ${path.join(import.meta.dirname, 'universal-aggregate.ts')} --iteration ${iteration}`,
      {cwd: path.join(import.meta.dirname, '..'), stdio: 'inherit'},
    );
  }

  return readJson<UniversalAggregate>(universalPath);
}

function ensureComparison(
  xdsId: string,
  baselineId: string,
): UniversalComparison {
  const resultsDir = getResultsDir();
  const comparisonPath = path.join(
    resultsDir,
    `comparison-${xdsId}-${baselineId}.json`,
  );

  if (!fs.existsSync(comparisonPath)) {
    console.log(`Generating comparison for ${xdsId} vs ${baselineId}...`);
    execSync(
      `tsx ${path.join(import.meta.dirname, 'universal-compare.ts')} --xds ${xdsId} --baseline ${baselineId}`,
      {cwd: path.join(import.meta.dirname, '..'), stdio: 'inherit'},
    );
  }

  return readJson<UniversalComparison>(comparisonPath);
}

/**
 * Build the report data as a <script> tag to inject into the HTML.
 * This runs before the app bundle, so window.__REPORT_DATA__ is
 * guaranteed to exist when React renders.
 */
function buildDataScript(opts: {
  iteration: string;
  iterationData: UniversalAggregate;
  baseline?: string;
  comparison?: UniversalComparison;
  manifest: unknown;
}): string {
  const reportData = {
    universal: opts.iterationData,
    comparison: opts.comparison ?? undefined,
    iterationId: opts.iteration,
    target: (opts.manifest as {config?: {target?: string}})?.config?.target,
  };

  return `<script>window.__REPORT_DATA__=${JSON.stringify(reportData)};</script>`;
}

/**
 * Inject the data script into the built HTML, before the first <script> tag
 * so it runs before the app bundle.
 */
function injectDataIntoHtml(htmlPath: string, dataScript: string): void {
  let html = fs.readFileSync(htmlPath, 'utf-8');
  const firstScript = html.indexOf('<script');
  if (firstScript === -1) {
    html = html.replace('</body>', `${dataScript}\n</body>`);
  } else {
    html =
      html.slice(0, firstScript) + dataScript + '\n' + html.slice(firstScript);
  }
  fs.writeFileSync(htmlPath, html);
}

/**
 * Inline any CSS files from dist/assets/ that vite-plugin-singlefile
 * didn't handle (e.g. StyleX extracted CSS).
 */
function inlineCss(htmlPath: string, distDir: string): void {
  const assetsDir = path.join(distDir, 'assets');
  if (!fs.existsSync(assetsDir)) return;

  const cssFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.css'));
  if (cssFiles.length === 0) return;

  console.log(`   Inlining ${cssFiles.length} CSS file(s)...`);
  let html = fs.readFileSync(htmlPath, 'utf-8');
  for (const cssFile of cssFiles) {
    const css = fs.readFileSync(path.join(assetsDir, cssFile), 'utf-8');
    html = html.replace('</head>', `<style>${css}</style>\n</head>`);
  }
  fs.writeFileSync(htmlPath, html);
}

async function main() {
  const {iteration, baseline, withScreenshots, dev} = parseArgs();
  const resultsDir = getResultsDir();
  const iterDir = path.join(resultsDir, iteration);
  const manifestPath = path.join(iterDir, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.error(`No manifest.json found at ${manifestPath}`);
    process.exit(1);
  }

  const manifest = readJson(manifestPath);

  // Step 1: Ensure universal.json exists
  console.log('📊 Step 1: Ensuring evaluation data...');
  const iterationData = ensureUniversalJson(iteration);

  // Step 2: If baseline provided, ensure comparison
  let comparison: UniversalComparison | undefined;
  if (baseline) {
    console.log('📊 Step 2: Ensuring comparison data...');
    ensureUniversalJson(baseline);
    comparison = ensureComparison(iteration, baseline);
  }

  // Step 3: Build the data script
  console.log('📝 Step 3: Preparing report data...');
  const dataScript = buildDataScript({
    iteration,
    iterationData,
    baseline,
    comparison,
    manifest,
  });
  console.log(`  ✓ ${(dataScript.length / 1024).toFixed(0)} KB of report data`);

  // Step 4: Dev mode or build
  if (dev) {
    // For dev mode, write data to a module file so Vite can serve it
    const dataDir = path.join(APP_DIR, 'src', 'data');
    ensureDir(dataDir);
    const reportData = {
      universal: iterationData,
      comparison: comparison ?? undefined,
      iterationId: iteration,
      target: (manifest as {config?: {target?: string}})?.config?.target,
    };
    fs.writeFileSync(
      path.join(dataDir, 'report-data.ts'),
      `// AUTO-GENERATED for dev mode\n(window as any).__REPORT_DATA__ = ${JSON.stringify(reportData, null, 2)};\n`,
    );

    console.log('\n🚀 Starting Vite dev server...');
    const {createServer} = await import('vite');
    const server = await createServer({
      root: APP_DIR,
      server: {port: 5173, strictPort: true},
    });
    await server.listen();
    server.printUrls();
    console.log('\nOpen http://localhost:5173?mode=report to view the report.');
    console.log('Press Ctrl+C to stop.\n');
  } else {
    console.log('\n🏗️  Step 4: Building static report...');
    execSync('npx vite build', {
      cwd: APP_DIR,
      stdio: 'inherit',
    });

    // Step 5: Inject data and styles into the built HTML
    const distDir = path.join(APP_DIR, 'dist');
    const reportHtml = path.join(distDir, 'index.html');
    if (fs.existsSync(reportHtml)) {
      console.log('💉 Step 5: Injecting report data and styles...');
      injectDataIntoHtml(reportHtml, dataScript);
      inlineCss(reportHtml, distDir);

      const destPath = path.join(iterDir, 'report.html');
      fs.copyFileSync(reportHtml, destPath);
      console.log(`\n✅ Report saved to: ${destPath}`);
    } else {
      console.error('Build succeeded but no index.html found in dist/');
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
