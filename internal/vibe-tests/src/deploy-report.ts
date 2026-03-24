#!/usr/bin/env node
/**
 * @file Deploy report to GitHub Pages
 *
 * Builds a static report HTML and pushes it to the gh-pages branch
 * under reports/{iteration-id}/. The path is always the iteration hash —
 * no overrides, no custom slugs.
 *
 * Usage:
 *   tsx src/deploy-report.ts --iteration <id>
 *   tsx src/deploy-report.ts --iteration <id> --baseline <id>
 *   tsx src/deploy-report.ts --iteration <id> --dry-run
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {execSync} from 'node:child_process';

const REPO_ROOT = path.resolve(import.meta.dirname, '../../..');
const VIBE_DIR = path.resolve(import.meta.dirname, '..');

function parseArgs(): {
  iteration: string;
  baseline?: string;
  html?: string;
  dryRun: boolean;
  skipPreviews: boolean;
} {
  const args = process.argv.slice(2);
  let iteration = '';
  let baseline: string | undefined;
  let html: string | undefined;
  let dryRun = false;
  let skipPreviews = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--iteration' && args[i + 1]) {
      iteration = args[++i];
    } else if (args[i] === '--baseline' && args[i + 1]) {
      baseline = args[++i];
    } else if (args[i] === '--html' && args[i + 1]) {
      html = args[++i];
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    } else if (args[i] === '--skip-previews') {
      skipPreviews = true;
    }
  }

  if (!iteration) {
    console.error(
      'Usage: tsx src/deploy-report.ts --iteration <id> [--baseline <id>] [--html <id>] [--dry-run] [--skip-previews]',
    );
    process.exit(1);
  }

  return {iteration, baseline, html, dryRun, skipPreviews};
}

function run(cmd: string, opts?: {cwd?: string; silent?: boolean}): string {
  const cwd = opts?.cwd ?? REPO_ROOT;
  const stdio = opts?.silent ? 'pipe' : 'inherit';
  return execSync(cmd, {cwd, stdio, encoding: 'utf-8'}) ?? '';
}

function runSilent(cmd: string, opts?: {cwd?: string}): string {
  return run(cmd, {...opts, silent: true}).trim();
}

async function main() {
  const {iteration, baseline, html, dryRun, skipPreviews} = parseArgs();

  const deployPath = `reports/${iteration}`;

  console.log(`\n📦 Deploy Report Pipeline`);
  console.log(`   Iteration: ${iteration}`);
  if (baseline) console.log(`   Baseline:  ${baseline}`);
  console.log(`   Deploy to: ${deployPath}`);
  if (dryRun) console.log(`   ⚠️  DRY RUN — will build but not push`);
  console.log('');

  // Step 1: Build previews if .tsx result files exist
  if (!skipPreviews) {
    const iterationsWithCode: string[] = [];
    for (const id of [iteration, baseline, html].filter(Boolean) as string[]) {
      const codeDir = path.join(VIBE_DIR, 'results', id, 'results');
      if (
        fs.existsSync(codeDir) &&
        fs.readdirSync(codeDir).some(f => f.endsWith('.tsx'))
      ) {
        iterationsWithCode.push(id);
      }
    }

    if (iterationsWithCode.length > 0) {
      const previewsOut = path.join(VIBE_DIR, 'results', iteration, 'previews');
      console.log('🖼️  Step 1: Building preview pages...');
      try {
        run(
          `npx tsx src/build-previews.ts --iterations ${iterationsWithCode.join(',')} --out ${previewsOut}`,
          {cwd: VIBE_DIR},
        );
      } catch {
        console.warn(
          '   ⚠️  Preview build had errors (continuing without some previews)',
        );
      }
      console.log('');
    }
  }

  // Step 2: Build the report
  console.log('🏗️  Step 2: Building report...');
  const buildArgs = [`--iteration ${iteration}`];
  if (baseline) buildArgs.push(`--baseline ${baseline}`);
  if (html) buildArgs.push(`--html ${html}`);

  run(`npx tsx src/build-report.ts ${buildArgs.join(' ')}`, {cwd: VIBE_DIR});

  const reportHtml = path.join(VIBE_DIR, 'results', iteration, 'report.html');
  if (!fs.existsSync(reportHtml)) {
    console.error('❌ Report build failed — no report.html found');
    process.exit(1);
  }

  const reportSize = fs.statSync(reportHtml).size;
  console.log(`   ✓ report.html (${(reportSize / 1024).toFixed(0)} KB)\n`);

  if (dryRun) {
    console.log('✅ Dry run complete. Report built but not deployed.');
    console.log(`   File: ${reportHtml}`);
    return;
  }

  // Step 3: Deploy to gh-pages
  console.log('🚀 Step 3: Deploying to gh-pages...');

  const tmpDir = path.join(REPO_ROOT, '.deploy-tmp');
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, {recursive: true});
  }
  fs.mkdirSync(tmpDir, {recursive: true});

  try {
    const remoteUrl = runSilent('git remote get-url origin', {cwd: REPO_ROOT});

    run(
      `git clone --depth 1 --branch gh-pages --single-branch ${remoteUrl} ${tmpDir}`,
      {cwd: REPO_ROOT},
    );

    const targetDir = path.join(tmpDir, deployPath);
    fs.mkdirSync(targetDir, {recursive: true});
    fs.copyFileSync(reportHtml, path.join(targetDir, 'index.html'));

    // Deploy previews if they exist
    const previewsDir = path.join(VIBE_DIR, 'results', iteration, 'previews');
    if (fs.existsSync(previewsDir)) {
      const targetPreviewsDir = path.join(targetDir, 'previews');
      copyDirRecursive(previewsDir, targetPreviewsDir);
      const previewCount = countFiles(targetPreviewsDir, '.html');
      console.log(`   ✓ ${previewCount} preview pages copied`);
    }

    // Deploy screenshots if they exist (from GHA vibe-screenshots workflow)
    // Check all iterations for screenshots and merge into one directory
    const targetScreenshotsDir = path.join(targetDir, 'screenshots');
    let totalScreenshots = 0;
    for (const id of [iteration, baseline, html].filter(Boolean) as string[]) {
      const screenshotsDir = path.join(VIBE_DIR, 'results', id, 'screenshots');
      if (fs.existsSync(screenshotsDir)) {
        copyDirRecursive(screenshotsDir, targetScreenshotsDir);
        totalScreenshots += countFiles(screenshotsDir, '.png');
      }
    }
    if (totalScreenshots > 0) {
      console.log(`   ✓ ${totalScreenshots} screenshots copied`);
    }

    updateReportsIndex(tmpDir);

    run('git add .', {cwd: tmpDir});

    const status = runSilent('git status --porcelain', {cwd: tmpDir});
    if (!status) {
      console.log('   ℹ️  No changes to deploy (report already exists)');
      return;
    }

    const commitMsg = baseline
      ? `report: ${iteration} (vs ${baseline})`
      : `report: ${iteration}`;

    run(`git commit -m "${commitMsg}"`, {cwd: tmpDir});
    run('git push origin gh-pages', {cwd: tmpDir});

    const repoUrl = getRepoUrl();
    const reportUrl = repoUrl
      ? `${repoUrl}/${deployPath}/`
      : `(gh-pages)/${deployPath}/`;

    console.log(`\n✅ Deployed!`);
    console.log(`   📊 ${reportUrl}`);
  } finally {
    fs.rmSync(tmpDir, {recursive: true, force: true});
  }
}

function copyDirRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, {recursive: true});
  for (const entry of fs.readdirSync(src, {withFileTypes: true})) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function countFiles(dir: string, ext: string): number {
  let count = 0;
  if (!fs.existsSync(dir)) return 0;
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name), ext);
    } else if (entry.name.endsWith(ext)) {
      count++;
    }
  }
  return count;
}

function updateReportsIndex(ghPagesDir: string): void {
  const reportsDir = path.join(ghPagesDir, 'reports');
  if (!fs.existsSync(reportsDir)) return;

  const entries = fs
    .readdirSync(reportsDir, {withFileTypes: true})
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort()
    .reverse();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>XDS Vibe Test Reports</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 600px;
      margin: 40px auto;
      padding: 0 20px;
      color: #1a1a1a;
    }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #666; margin-bottom: 2rem; }
    ul { list-style: none; padding: 0; }
    li { margin-bottom: 0.5rem; }
    a {
      color: #0969da;
      text-decoration: none;
      padding: 8px 12px;
      display: inline-block;
      border-radius: 6px;
      transition: background 0.15s;
    }
    a:hover { background: #f0f4f8; }
  </style>
</head>
<body>
  <h1>📊 XDS Vibe Test Reports</h1>
  <p>Evaluation reports comparing XDS, baseline, and raw HTML targets.</p>
  <ul>
    ${entries.map(name => `<li><a href="${name}/">${name}</a></li>`).join('\n    ')}
  </ul>
</body>
</html>`;

  fs.writeFileSync(path.join(reportsDir, 'index.html'), html);
}

function getRepoUrl(): string | null {
  try {
    const remote = runSilent('git remote get-url origin', {cwd: REPO_ROOT});
    const match = remote.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
    if (match) {
      return `https://${match[1]}.github.io/${match[2]}`;
    }
  } catch {
    // ignore
  }
  return null;
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
