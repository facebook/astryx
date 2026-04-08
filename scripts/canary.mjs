#!/usr/bin/env node

/**
 * scripts/canary.mjs — On-demand canary publish
 *
 * Builds all publishable packages from the current checkout,
 * stamps them with a canary prerelease version tied to the git SHA,
 * and publishes to the internal npm registry under the @canary dist-tag.
 *
 * Usage:
 *   node scripts/canary.mjs              # uses current HEAD
 *   node scripts/canary.mjs --sha abc123 # override SHA (for CI)
 *   node scripts/canary.mjs --dry-run    # skip publish, just show what would happen
 *   node scripts/canary.mjs --tag next   # use a different dist-tag (default: canary)
 *
 * Version format:
 *   <current-version>-canary.<short-sha>
 *   e.g. 0.0.12-canary.fd7c751
 *
 * What it does:
 *   1. Reads the current version from packages/core/package.json
 *   2. Computes the canary version using the git SHA
 *   3. Temporarily updates all publishable package.json versions
 *   4. Runs `yarn build`
 *   5. Publishes each package with --tag <tag>
 *   6. Restores original package.json files (even on failure)
 *
 * The @latest dist-tag is never touched. Consumers on `npm install @xds/core`
 * will never see canary versions.
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ─── Parse args ──────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const tagIdx = args.indexOf('--tag');
const distTag = tagIdx !== -1 ? args[tagIdx + 1] : 'canary';
const shaIdx = args.indexOf('--sha');

let shortSha;
if (shaIdx !== -1) {
  shortSha = args[shaIdx + 1].slice(0, 7);
} else {
  shortSha = execSync('git rev-parse --short=7 HEAD', { cwd: ROOT })
    .toString()
    .trim();
}

// ─── Registry ───────────────────────────────────────────────

const REGISTRY = 'https://npm-internal.thefacebook.com';

// ─── Discover publishable packages ──────────────────────────

// Scan workspace package dirs for all non-private packages
const PACKAGE_DIRS = ['packages', 'packages/themes'];

const publishable = [];
for (const parentDir of PACKAGE_DIRS) {
  const absParent = join(ROOT, parentDir);
  if (!existsSync(absParent)) continue;

  for (const entry of readdirSync(absParent, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const pkgPath = join(absParent, entry.name, 'package.json');
    if (!existsSync(pkgPath)) continue;

    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    if (pkg.private) {
      console.log(`⏭  Skipping ${pkg.name} (private)`);
      continue;
    }
    if (!pkg.name?.startsWith('@xds/')) continue;

    publishable.push({ path: pkgPath, dir: dirname(pkgPath), pkg });
  }
}

if (publishable.length === 0) {
  console.error('❌ No publishable packages found');
  process.exit(1);
}

// ─── Compute canary version ─────────────────────────────────

// Base version: use --base-version flag, or try to read from npm registry,
// or fall back to package.json
const baseVersionIdx = args.indexOf('--base-version');
let baseVersion;

if (baseVersionIdx !== -1) {
  baseVersion = args[baseVersionIdx + 1];
} else {
  // Try to get the latest published version from the internal registry
  try {
    const npmVersion = execSync(
      `npm view @xds/core version --registry ${REGISTRY} 2>/dev/null`,
      { cwd: ROOT }
    )
      .toString()
      .trim();
    if (npmVersion) {
      baseVersion = npmVersion;
      console.log(`   📦 Using published version: ${npmVersion}`);
    }
  } catch {
    // npm view failed — probably offline or package not published
  }

  if (!baseVersion) {
    const corePkg = JSON.parse(
      readFileSync(join(ROOT, 'packages/core/package.json'), 'utf-8')
    );
    baseVersion = corePkg.version;
    console.log(`   📦 Using local version: ${baseVersion}`);
  }
}

const canaryVersion = `${baseVersion}-canary.${shortSha}`;

console.log();
console.log('🐤 Canary build');
console.log(`   Base version:   ${baseVersion}`);
console.log(`   Canary version: ${canaryVersion}`);
console.log(`   Git SHA:        ${shortSha}`);
console.log(`   Dist-tag:       @${distTag}`);
console.log(`   Packages:       ${publishable.map((p) => p.pkg.name).join(', ')}`);
if (dryRun) console.log('   Mode:           DRY RUN');
console.log();

// ─── Save originals & stamp canary version ──────────────────

const originals = new Map();

function stampVersions() {
  for (const { path, pkg } of publishable) {
    originals.set(path, readFileSync(path, 'utf-8'));

    pkg.version = canaryVersion;

    // Update internal dependency versions too
    for (const depType of [
      'dependencies',
      'peerDependencies',
      'devDependencies',
    ]) {
      if (!pkg[depType]) continue;
      for (const depName of Object.keys(pkg[depType])) {
        if (publishable.some((p) => p.pkg.name === depName)) {
          pkg[depType][depName] = canaryVersion;
        }
      }
    }

    writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`   ✏️  ${pkg.name} → ${canaryVersion}`);
  }
}

function restoreVersions() {
  for (const [path, content] of originals) {
    writeFileSync(path, content);
  }
  if (originals.size > 0) {
    console.log(`   🔄 Restored ${originals.size} package.json files`);
  }
}

// ─── Build ──────────────────────────────────────────────────

function build() {
  console.log('\n📦 Building...');
  execSync('yarn build', { cwd: ROOT, stdio: 'inherit' });
  console.log('   ✅ Build complete');
}

// ─── Publish ────────────────────────────────────────────────

function publish() {
  console.log('\n🚀 Publishing...');
  for (const { dir, pkg } of publishable) {
    const cmd = `npm publish --tag ${distTag} --registry ${REGISTRY}`;
    console.log(`   ${pkg.name}@${canaryVersion} → @${distTag}`);
    if (!dryRun) {
      try {
        execSync(cmd, { cwd: dir, stdio: 'inherit' });
        console.log(`   ✅ ${pkg.name} published`);
      } catch (err) {
        console.error(`   ❌ ${pkg.name} failed to publish`);
        throw err;
      }
    }
  }
}

// ─── Main ───────────────────────────────────────────────────

let exitCode = 0;
try {
  stampVersions();
  build();
  publish();

  console.log('\n🐤 Canary published!');
  console.log(`   Install with: npm install @xds/core@${distTag}`);
  console.log(`   Or pin:       npm install @xds/core@${canaryVersion}`);
  console.log();
} catch (err) {
  console.error('\n💥 Canary failed:', err.message);
  exitCode = 1;
} finally {
  restoreVersions();
}

process.exit(exitCode);
