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
  html?: string;
  withScreenshots: boolean;
  dev: boolean;
} {
  const args = process.argv.slice(2);
  let iteration = '';
  let baseline: string | undefined;
  let html: string | undefined;
  let withScreenshots = false;
  let dev = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--iteration' && args[i + 1]) {
      iteration = args[i + 1];
      i++;
    } else if (args[i] === '--baseline' && args[i + 1]) {
      baseline = args[i + 1];
      i++;
    } else if (args[i] === '--html' && args[i + 1]) {
      html = args[i + 1];
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

  return {iteration, baseline, html, withScreenshots, dev};
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
  htmlId?: string,
): UniversalComparison {
  const resultsDir = getResultsDir();
  const comparisonFilename = htmlId
    ? `comparison-${xdsId}-${baselineId}-${htmlId}.json`
    : `comparison-${xdsId}-${baselineId}.json`;
  const comparisonPath = path.join(resultsDir, comparisonFilename);

  if (!fs.existsSync(comparisonPath)) {
    const htmlFlag = htmlId ? ` --html ${htmlId}` : '';
    console.log(
      `Generating comparison for ${xdsId} vs ${baselineId}${htmlId ? ` vs ${htmlId}` : ''}...`,
    );
    execSync(
      `tsx ${path.join(import.meta.dirname, 'universal-compare.ts')} --xds ${xdsId} --baseline ${baselineId}${htmlFlag}`,
      {cwd: path.join(import.meta.dirname, '..'), stdio: 'inherit'},
    );
  }

  return readJson<UniversalComparison>(comparisonPath);
}

/**
 * Extract prompt text from the manifest's prompts array.
 * Returns a map of promptId → prompt text.
 */
function extractPrompts(manifest: unknown): Record<string, string> {
  const prompts: Record<string, string> = {};
  const m = manifest as {prompts?: Array<{id: string; prompt: string}>};
  if (m.prompts && Array.isArray(m.prompts)) {
    for (const p of m.prompts) {
      if (p.id && p.prompt) {
        prompts[p.id] = p.prompt;
      }
    }
  }
  return prompts;
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
  sourceCode?: Record<string, string>;
  baselineSourceCode?: Record<string, string>;
  htmlSourceCode?: Record<string, string>;
  previews?: Record<string, Record<string, string>>;
  prompts?: Record<string, string>;
}): string {
  const reportData = {
    universal: opts.iterationData,
    comparison: opts.comparison ?? undefined,
    iterationId: opts.iteration,
    target: (opts.manifest as {config?: {target?: string}})?.config?.target,
    sourceCode: opts.sourceCode,
    baselineSourceCode: opts.baselineSourceCode,
    htmlSourceCode: opts.htmlSourceCode,
    previews: opts.previews,
    prompts: opts.prompts,
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
  const {
    iteration,
    baseline,
    html,
    withScreenshots: _withScreenshots,
    dev,
  } = parseArgs();
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
    if (html) {
      ensureUniversalJson(html);
    }
    comparison = ensureComparison(iteration, baseline, html);
  }

  // Step 3: Load source code for per-prompt inspection
  console.log('📝 Step 3: Preparing report data...');
  const sourceCode: Record<string, string> = {};
  const codeDir = path.join(iterDir, 'results');
  if (fs.existsSync(codeDir)) {
    for (const file of fs
      .readdirSync(codeDir)
      .filter(f => f.endsWith('.tsx'))) {
      const promptId = path.basename(file, '.tsx');
      sourceCode[promptId] = fs.readFileSync(path.join(codeDir, file), 'utf-8');
    }
  }

  let baselineSourceCode: Record<string, string> | undefined;
  if (baseline) {
    baselineSourceCode = {};
    const baseCodeDir = path.join(resultsDir, baseline, 'results');
    if (fs.existsSync(baseCodeDir)) {
      for (const file of fs
        .readdirSync(baseCodeDir)
        .filter(f => f.endsWith('.tsx'))) {
        const promptId = path.basename(file, '.tsx');
        baselineSourceCode[promptId] = fs.readFileSync(
          path.join(baseCodeDir, file),
          'utf-8',
        );
      }
    }
  }

  let htmlSourceCode: Record<string, string> | undefined;
  if (html) {
    htmlSourceCode = {};
    const htmlCodeDir = path.join(resultsDir, html, 'results');
    if (fs.existsSync(htmlCodeDir)) {
      for (const file of fs
        .readdirSync(htmlCodeDir)
        .filter(f => f.endsWith('.tsx'))) {
        const promptId = path.basename(file, '.tsx');
        htmlSourceCode[promptId] = fs.readFileSync(
          path.join(htmlCodeDir, file),
          'utf-8',
        );
      }
    }
  }

  // Load preview manifest if available
  const previewManifestPath = path.join(iterDir, 'previews', 'manifest.json');
  let previews: Record<string, Record<string, string>> | undefined;
  if (fs.existsSync(previewManifestPath)) {
    previews = JSON.parse(fs.readFileSync(previewManifestPath, 'utf-8'));
    console.log(
      `  ✓ Preview manifest loaded (${Object.keys(previews!).length} prompts)`,
    );
  }

  // Extract prompt text from manifest
  const prompts = extractPrompts(manifest);
  if (Object.keys(prompts).length > 0) {
    console.log(
      `  ✓ Prompt text loaded (${Object.keys(prompts).length} prompts)`,
    );
  }

  // Step 4: Build the data script
  const dataScript = buildDataScript({
    iteration,
    iterationData,
    baseline,
    comparison,
    manifest,
    sourceCode,
    baselineSourceCode,
    htmlSourceCode,
    previews,
    prompts,
  });
  console.log(`  ✓ ${(dataScript.length / 1024).toFixed(0)} KB of report data`);

  // Step 5: Dev mode or build
  if (dev) {
    // For dev mode, write data to a module file so Vite can serve it
    const dataDir = path.join(APP_DIR, 'src', 'data');
    ensureDir(dataDir);
    const reportData = {
      universal: iterationData,
      comparison: comparison ?? undefined,
      iterationId: iteration,
      target: (manifest as {config?: {target?: string}})?.config?.target,
      prompts,
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
    console.log('\n🏗️  Step 5: Building static report...');
    execSync('npx vite build', {
      cwd: APP_DIR,
      stdio: 'inherit',
    });

    // Step 5: Inject data and styles into the built HTML
    const distDir = path.join(APP_DIR, 'dist');
    const reportHtml = path.join(distDir, 'index.html');
    if (fs.existsSync(reportHtml)) {
      console.log('💉 Step 6: Injecting report data and styles...');
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
