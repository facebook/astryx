#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.


/**
 * @description Analyzes PR changes to detect new/modified components and gather stats
 * @input --base <branch> --head <ref> --output <file>
 * @output JSON file with component analysis; exits non-zero if the base...head diff fails (e.g. shallow clone without a merge base)
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const baseBranch = getArg('base') || 'main';
const headRef = getArg('head') || 'HEAD';
const outputFile = getArg('output') || 'analysis.json';

const STORYBOOK_STORIES = 'apps/storybook/stories';

// The publishable component packages the report covers. Each PR is attributed
// to the package(s) it actually touches — the report is no longer hardcoded to
// `core` (which silently mislabelled every lab/charts PR).
//
// layout:
//   'nested' — components live in per-component dirs: src/<Name>/... (core, lab)
//   'flat'   — components live as single files:       src/<Name>.tsx (charts,
//              richtext). The score-ledger's canonical predicate narrows a flat
//              package to its documented component(s) downstream, so listing
//              the internal helpers here is harmless — they get filtered out.
const PACKAGES = [
  { name: '@astryxdesign/core', dir: 'packages/core', layout: 'nested' },
  { name: '@astryxdesign/lab', dir: 'packages/lab', layout: 'nested' },
  { name: '@astryxdesign/charts', dir: 'packages/charts', layout: 'flat' },
  { name: '@astryxdesign/richtext', dir: 'packages/richtext', layout: 'flat' },
];

const pkgSrc = (pkg) => `${pkg.dir}/src`;
const pkgDist = (pkg) => `${pkg.dir}/dist`;

// Directories under a package's src that are not components.
const EXCLUDED_DIRS = ['hooks', 'theme', 'utils', 'i18n', '__tests__'];

// Get list of component names for a package, honoring its src layout.
function getComponentNames(pkg) {
  const srcPath = path.join(process.cwd(), pkgSrc(pkg));
  try {
    const entries = fs.readdirSync(srcPath, { withFileTypes: true });
    if (pkg.layout === 'flat') {
      // Flat: each PascalCase *.tsx (not a test/story/context) is a component.
      return entries
        .filter(
          (e) =>
            e.isFile() &&
            /^[A-Z]\w+\.tsx$/.test(e.name) &&
            !e.name.includes('.test.') &&
            !e.name.includes('.stories.') &&
            !e.name.endsWith('Context.tsx'),
        )
        .map((e) => e.name.replace(/\.tsx$/, ''));
    }
    // Nested: each non-excluded directory is a component.
    return entries
      .filter((e) => e.isDirectory() && !EXCLUDED_DIRS.includes(e.name))
      .map((e) => e.name);
  } catch {
    return [];
  }
}

// The source path of a component (dir for nested, file for flat).
function componentSrcPath(pkg, componentName) {
  return pkg.layout === 'flat'
    ? path.join(process.cwd(), pkgSrc(pkg), `${componentName}.tsx`)
    : path.join(process.cwd(), pkgSrc(pkg), componentName);
}

// The index file used to read exports (dir/index.ts for nested, the file itself for flat).
function componentIndexRef(pkg, componentName) {
  return pkg.layout === 'flat'
    ? `${pkgSrc(pkg)}/${componentName}.tsx`
    : `${pkgSrc(pkg)}/${componentName}/index.ts`;
}

// Get changed files between base and head.
//
// Prefers a three-dot diff (base...head), which only reports files changed on
// the PR branch and excludes commits already merged to base. But a three-dot
// diff needs a merge base, which a shallow clone (fetch-depth: 50) may not
// have once the PR has been open long enough for base to advance past that
// window — the diff then fails with "no merge base" and the whole job dies.
//
// On that failure we first try to deepen the shallow clone and retry the
// three-dot diff — the real fix for "base advanced past the fetch window" is
// to fetch more history, not to degrade. Only if that still cannot find a
// merge base do we fall back to a two-dot diff (base..head), which needs no
// merge base and never hard-fails the CI.
//
// The two-dot fallback is inherently lossy: it compares two trees, so a file
// whose change also exists on base (a cherry-picked/duplicated fix, or the
// same codegen output landing from another PR) vanishes from the diff
// entirely. That means two-dot can UNDER-report a PR's own changes, not just
// over-report base churn. Because downstream gates (pr-a11y) derive their
// component list from this file list, under-reporting silently skips the
// audit for a component the PR did change. The caller records the diff mode
// in the analysis output so consumers know when the file list is approximate.
// Returns { files, diffMode: 'three-dot' | 'two-dot' }.
function getChangedFiles() {
  const threeDot = `${baseBranch}...${headRef}`;
  const tryThreeDot = () => {
    const output = execSync(`git diff --name-only ${threeDot}`, { encoding: 'utf8' });
    return output.trim().split('\n').filter(Boolean);
  };
  try {
    return { files: tryThreeDot(), diffMode: 'three-dot' };
  } catch (e) {
    console.warn(
      `::warning::three-dot diff ${threeDot} failed - attempting to deepen the clone and retry`
    );
    console.warn(diffErrorDetail(e));
  }

  // The three-dot diff failed, almost certainly because the shallow clone is
  // too shallow to contain the merge base. Deepen before giving up on the
  // accurate path; a deepened clone makes three-dot correct again. The base
  // arg arrives as "origin/main" (see ci.yml) but the fetch refspec needs the
  // bare branch name and must update the origin/<base> ref explicitly —
  // `--deepen` alone only updates FETCH_HEAD, which the three-dot ref
  // (origin/main...HEAD) needs to actually exist.
  try {
    const baseName = baseBranch.replace(/^origin\//, '');
    execSync(
      `git fetch --deepen=200 origin ${baseName}:refs/remotes/origin/${baseName}`,
      { encoding: 'utf8', stdio: 'pipe' },
    );
    return { files: tryThreeDot(), diffMode: 'three-dot' };
  } catch (e) {
    console.warn(
      `::warning::deepen failed (${diffErrorDetail(e)}) - falling back to two-dot diff`
    );
  }

  // Last resort: a two-dot diff needs no merge base. Its file list is
  // approximate (may over-report base churn and, worse, under-report the PR's
  // own changes when they also exist on base), so the caller marks the output
  // with diffMode: 'two-dot' for any consumer to caveat.
  const twoDot = `${baseBranch}..${headRef}`;
  try {
    const output = execSync(`git diff --name-only ${twoDot}`, { encoding: 'utf8' });
    return { files: output.trim().split('\n').filter(Boolean), diffMode: 'two-dot' };
  } catch (e) {
    // A failed diff (e.g. base ref missing on a too-shallow clone) is not the
    // same as "no changes" — fail loudly instead of publishing an empty
    // analysis report that looks legitimate.
    console.error(`::error::git diff ${twoDot} failed: ${e.message}`);
    console.error('The clone is likely too shallow to contain the base ref (see fetch-depth in ci.yml).');
    process.exit(1);
  }
}

// Human-readable reason for a failed diff/deepen, preferring the fatal stderr
// line (e.g. "fatal: origin/main...HEAD: no merge base") over execSync's
// boilerplate "Command failed: ..." first line.
function diffErrorDetail(e) {
  return (e.stderr && e.stderr.toString().trim()) || e.message.split('\n')[0];
}

// Check if a component exists in the base branch.
function componentExistsInBase(pkg, componentName) {
  try {
    execSync(`git show ${baseBranch}:${componentIndexRef(pkg, componentName)}`, {
      encoding: 'utf8',
      stdio: 'pipe',
    });
    return true;
  } catch {
    return false;
  }
}

function parseExportsFromSource(content) {
  const exportMatches = content.match(/export\s+{\s*([^}]+)\s*}/g) || [];
  const exports = [];
  for (const match of exportMatches) {
    const inner = match.replace(/export\s*{\s*/, '').replace(/\s*}/, '');
    exports.push(...inner.split(',').map((e) => e.trim().split(' ')[0]));
  }
  if (content.includes('export default')) {
    exports.push('default');
  }
  return exports.filter(Boolean);
}

// Get exports from the base branch for a component (to detect new exports in modified dirs)
function getBaseExports(pkg, componentName) {
  try {
    const content = execSync(
      `git show ${baseBranch}:${componentIndexRef(pkg, componentName)}`,
      { encoding: 'utf8', stdio: 'pipe' }
    );
    return parseExportsFromSource(content);
  } catch {
    return [];
  }
}

// Get file size in human readable format
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const bytes = stats.size;
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  } catch {
    return null;
  }
}

function getFileSizeBytes(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return null;
  }
}

// Get gzipped size of a file. Returns null (→ "N/A") when the file is absent,
// instead of the old behavior of gzipping a nonexistent path and reporting a
// bogus "0B".
function getGzipSize(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  try {
    const output = execSync(`gzip -c "${filePath}" | wc -c`, { encoding: 'utf8' });
    const bytes = parseInt(output.trim(), 10);
    if (!Number.isFinite(bytes) || bytes <= 0) return null;
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  } catch {
    return null;
  }
}

// Resolve a package/component's dist entry files. The build emits CJS-style
// `.js` today (no `.mjs`); we probe for both so the report stays correct if an
// ESM artifact is added later, and never measures a file that isn't there.
function resolveEntries(distDir) {
  const esm = path.join(distDir, 'index.mjs');
  const cjs = path.join(distDir, 'index.js');
  return {
    esmPath: fs.existsSync(esm) ? esm : null,
    cjsPath: fs.existsSync(cjs) ? cjs : null,
  };
}

// Get exports from a component (from the working tree / head).
function getExports(pkg, componentName) {
  const indexPath =
    pkg.layout === 'flat'
      ? componentSrcPath(pkg, componentName)
      : path.join(componentSrcPath(pkg, componentName), 'index.ts');
  try {
    const content = fs.readFileSync(indexPath, 'utf8');
    return parseExportsFromSource(content);
  } catch {
    return [];
  }
}

// Resolve the main component source file(s) to inspect for props/complexity.
function componentSourceFiles(pkg, componentName) {
  if (pkg.layout === 'flat') {
    const file = componentSrcPath(pkg, componentName);
    return fs.existsSync(file) ? [{ dir: path.dirname(file), name: path.basename(file) }] : [];
  }
  const dir = componentSrcPath(pkg, componentName);
  try {
    return fs.readdirSync(dir).map((name) => ({ dir, name }));
  } catch {
    return [];
  }
}

// Count props for main component
function getPropsCount(pkg, componentName) {
  const files = componentSourceFiles(pkg, componentName);
  if (files.length === 0) return null;
  // Prefer the file named after the component (bare or XDS-prefixed).
  const names = files.map((f) => f.name);
  const mainName =
    [`XDS${componentName}.tsx`, `${componentName}.tsx`].find((f) => names.includes(f)) ||
    names.find(
      (f) =>
        (/^XDS[A-Z]\w+\.tsx$/.test(f) || /^[A-Z]\w+\.tsx$/.test(f)) &&
        !f.includes('.test.') &&
        !f.includes('Context.'),
    );
  if (!mainName) return null;
  try {
    const content = fs.readFileSync(path.join(files[0].dir, mainName), 'utf8');
    const propsMatch = content.match(/(?:type|interface)\s+\w*Props\w*\s*=?\s*{([^}]+)}/);
    if (propsMatch) {
      return propsMatch[1]
        .split('\n')
        .filter(
          (line) =>
            line.trim() &&
            !line.trim().startsWith('//') &&
            !line.trim().startsWith('*') &&
            line.includes(':'),
        ).length;
    }
    return null;
  } catch {
    return null;
  }
}

// Check if component has tests
function hasTests(pkg, componentName) {
  return componentSourceFiles(pkg, componentName).some(
    (f) => f.name.endsWith('.test.ts') || f.name.endsWith('.test.tsx'),
  );
}

// Check if component has stories (checks both directory name and exported component names)
function hasStories(pkg, componentName) {
  const storiesDir = path.join(process.cwd(), STORYBOOK_STORIES);
  try {
    const files = fs.readdirSync(storiesDir);
    if (
      files.some(
        (f) =>
          f.toLowerCase().includes(componentName.toLowerCase()) && f.endsWith('.stories.tsx'),
      )
    )
      return true;
    const exports = getExports(pkg, componentName);
    const xdsComponents = exports.filter((e) => e.startsWith('XDS'));
    return xdsComponents.some((comp) => {
      const name = comp.replace(/^XDS/, '');
      return files.some(
        (f) => f.toLowerCase().includes(name.toLowerCase()) && f.endsWith('.stories.tsx'),
      );
    });
  } catch {
    return false;
  }
}

// Get the Storybook story title for a component (e.g., "Core/Button").
function getStoryTitle(pkg, componentName) {
  const storiesDir = path.join(process.cwd(), STORYBOOK_STORIES);
  try {
    const files = fs.readdirSync(storiesDir);
    const exports = getExports(pkg, componentName);
    const searchNames = [
      componentName,
      ...exports.filter((e) => e.startsWith('XDS')).map((e) => e.replace(/^XDS/, '')),
    ];
    const storyFiles = files.filter(
      (f) =>
        f.endsWith('.stories.tsx') &&
        searchNames.some((name) => f.toLowerCase().includes(name.toLowerCase())),
    );
    if (storyFiles.length === 0) return null;
    const exactMatch = storyFiles.find((f) =>
      searchNames.some((name) => f.toLowerCase() === `${name.toLowerCase()}.stories.tsx`),
    );
    const orderedFiles = exactMatch
      ? [exactMatch, ...storyFiles.filter((f) => f !== exactMatch)]
      : storyFiles;
    const titles = orderedFiles
      .map((storyFile) => {
        const content = fs.readFileSync(path.join(storiesDir, storyFile), 'utf8');
        const titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
        return titleMatch ? titleMatch[1] : null;
      })
      .filter(Boolean);
    return titles.length > 0 ? titles[0] : null;
  } catch {
    return null;
  }
}

// Count lines of code in a file (excluding blank lines and comments)
function countLOC(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let loc = 0;
    let inBlockComment = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('/*')) inBlockComment = true;
      if (trimmed.endsWith('*/')) {
        inBlockComment = false;
        continue;
      }
      if (inBlockComment) continue;
      if (!trimmed) continue;
      if (trimmed.startsWith('//')) continue;
      if (trimmed.startsWith('*')) continue;
      loc++;
    }
    return loc;
  } catch {
    return 0;
  }
}

// Get total LOC for a component
function getComponentLOC(pkg, componentName) {
  const files = componentSourceFiles(pkg, componentName);
  let totalLOC = 0;
  let fileCount = 0;
  for (const f of files) {
    if (!(f.name.endsWith('.ts') || f.name.endsWith('.tsx'))) continue;
    if (f.name.includes('.test.')) continue;
    totalLOC += countLOC(path.join(f.dir, f.name));
    fileCount++;
  }
  return { totalLOC, fileCount };
}

// Calculate cyclomatic complexity (simplified - counts decision points)
function getComplexity(pkg, componentName) {
  const files = componentSourceFiles(pkg, componentName);
  let complexity = 1; // Base complexity
  try {
    for (const f of files) {
      if (!f.name.endsWith('.tsx')) continue;
      if (f.name.includes('.test.')) continue;
      const content = fs.readFileSync(path.join(f.dir, f.name), 'utf8');
      const patterns = [
        /\bif\s*\(/g,
        /\belse\s+if\s*\(/g,
        /\bswitch\s*\(/g,
        /\bcase\s+/g,
        /\?\s*[^:]/g,
        /\|\|/g,
        /&&/g,
        /\.map\s*\(/g,
        /\.filter\s*\(/g,
        /\.reduce\s*\(/g,
        /\.forEach\s*\(/g,
      ];
      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) complexity += matches.length;
      }
    }
    let rating;
    if (complexity <= 5) rating = 'Low';
    else if (complexity <= 15) rating = 'Medium';
    else if (complexity <= 30) rating = 'High';
    else rating = 'Very High';
    return { score: complexity, rating };
  } catch {
    return { score: 0, rating: 'Unknown' };
  }
}

// Get component stats
function getComponentStats(pkg, componentName) {
  // Per-component dist sizing only applies to nested packages that emit a
  // per-component subdir. Flat packages (charts) have no per-component dist, so
  // those sizes are legitimately null (package total still reported below).
  const distDir =
    pkg.layout === 'flat'
      ? null
      : path.join(process.cwd(), pkgDist(pkg), componentName);
  const entries = distDir ? resolveEntries(distDir) : { esmPath: null, cjsPath: null };
  const loc = getComponentLOC(pkg, componentName);
  const complexity = getComplexity(pkg, componentName);

  return {
    package: pkg.name,
    esmSize: getFileSize(entries.esmPath),
    esmBytes: getFileSizeBytes(entries.esmPath),
    cjsSize: getFileSize(entries.cjsPath),
    cjsBytes: getFileSizeBytes(entries.cjsPath),
    exports: getExports(pkg, componentName),
    propsCount: getPropsCount(pkg, componentName),
    hasTests: hasTests(pkg, componentName),
    hasStories: hasStories(pkg, componentName),
    storyTitle: getStoryTitle(pkg, componentName),
    linesOfCode: loc.totalLOC,
    fileCount: loc.fileCount,
    complexity: complexity.score,
    complexityRating: complexity.rating,
  };
}

// Get total bundle stats for a package's published entry.
function getPackageBundleStats(pkg) {
  const distDir = path.join(process.cwd(), pkgDist(pkg));
  const { esmPath, cjsPath } = resolveEntries(distDir);
  // Gzip the primary published entry — prefer ESM if it exists, else the CJS
  // `.js` the build actually emits today. Never gzip a missing path.
  const primary = esmPath || cjsPath;
  return {
    package: pkg.name,
    esmSize: getFileSize(esmPath),
    esmBytes: getFileSizeBytes(esmPath),
    cjsSize: getFileSize(cjsPath),
    cjsBytes: getFileSizeBytes(cjsPath),
    gzipSize: getGzipSize(primary),
  };
}

// Main analysis
function analyze() {
  console.log(`Analyzing changes from ${baseBranch} to ${headRef}...`);
  const { files: changedFiles, diffMode } = getChangedFiles();
  console.log(`Found ${changedFiles.length} changed files (diff mode: ${diffMode})`);
  if (diffMode === 'two-dot') {
    console.warn(
      '::warning::using approximate two-dot diff - the file list may include base-only churn and may miss the PR\'s own changes when they also exist on base'
    );
  }

  const newComponents = [];
  const modifiedComponents = [];
  const componentStats = {};
  const changedPackages = new Set();

  // Stable theme packages are a visual surface of their own. They do not own
  // component source dirs, so the component loop below cannot discover them;
  // without this, changing a published theme silently skips pr-visual.
  const changedStableThemes = [...new Set(
    changedFiles.flatMap((file) => {
      const match = file.match(/^packages\/themes\/([^/]+)\/src\//);
      if (!match) return [];
      const manifest = path.join(process.cwd(), 'packages', 'themes', match[1], 'package.json');
      if (!fs.existsSync(manifest)) return [];
      const pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'));
      return pkg.private === true || pkg.astryx?.canaryOnly === true ? [] : [match[1]];
    }),
  )].sort();

  for (const pkg of PACKAGES) {
    const allComponents = getComponentNames(pkg);
    const prefix = pkgSrc(pkg) + '/';

    for (const file of changedFiles) {
      if (!file.startsWith(prefix)) continue;
      changedPackages.add(pkg.name);

      const relativePath = file.replace(prefix, '');
      const componentName =
        pkg.layout === 'flat'
          ? relativePath.replace(/\.tsx?$/, '').split('/')[0]
          : relativePath.split('/')[0];

      if (!allComponents.includes(componentName)) continue;
      const key = componentName;
      if (componentStats[key]) continue;

      const stats = getComponentStats(pkg, componentName);
      componentStats[key] = stats;
      if (componentExistsInBase(pkg, componentName)) {
        modifiedComponents.push(key);
      } else {
        newComponents.push(key);
      }
    }
  }

  console.log(`Changed packages: ${[...changedPackages].join(', ') || 'none'}`);
  console.log(`New components: ${newComponents.join(', ') || 'none'}`);
  console.log(`Modified components: ${modifiedComponents.join(', ') || 'none'}`);

  // Detect new exports in modified components (a dir may be "modified" yet add
  // brand-new exports alongside existing ones).
  const newExports = [];
  for (const key of modifiedComponents) {
    const pkg = PACKAGES.find((p) => p.name === componentStats[key].package);
    const headExports = componentStats[key]?.exports || [];
    const baseExports = getBaseExports(pkg, key);
    newExports.push(...headExports.filter((e) => e.startsWith('XDS') && !baseExports.includes(e)));
  }
  for (const key of newComponents) {
    newExports.push(...(componentStats[key]?.exports || []).filter((e) => e.startsWith('XDS')));
  }
  if (newExports.length > 0) console.log(`New exports: ${newExports.join(', ')}`);

  // Bundle sizes: report every package the PR actually touched. If none of the
  // component packages changed (e.g. a docs- or tooling-only PR that still runs
  // analysis), report no bundle rows rather than a stale, misattributed core row.
  const bundlePackages = PACKAGES.filter((p) => changedPackages.has(p.name)).map((p) =>
    getPackageBundleStats(p),
  );

  const result = {
    newComponents,
    modifiedComponents,
    newExports,
    componentStats,
    changedPackages: [...changedPackages],
    changedStableThemes,
    // Records whether the file list is exact (three-dot) or approximate
    // (two-dot fallback). Consumers that gate on the component list (pr-a11y)
    // or render it in the report should caveat when this is 'two-dot'.
    diffMode,
    bundlePackages,
    // Back-compat: keep totalBundle pointed at core when core changed, so any
    // older consumer of this field still resolves.
    totalBundle: bundlePackages.find((b) => b.package === '@astryxdesign/core') || null,
    analyzedAt: new Date().toISOString(),
  };

  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
  console.log(`Analysis written to ${outputFile}`);
  return result;
}

analyze();
