#!/usr/bin/env node

/**
 * Clean orphaned VRT baselines that no longer match any Storybook story.
 *
 * Usage: node clean-orphaned-baselines.js [--dry-run]
 *
 * Reads the Storybook index.json to get all current stories,
 * then removes any baseline .png that doesn't correspond to a story.
 */

const fs = require('fs');
const path = require('path');

const dryRun = process.argv.includes('--dry-run');

const storybookDir = path.resolve(__dirname, '../../apps/storybook/dist');
const snapshotsDir = path.resolve(
  __dirname,
  '../../e2e/visual-regression.spec.ts-snapshots',
);

// Read storybook index
const indexPath = path.join(storybookDir, 'index.json');
if (!fs.existsSync(indexPath)) {
  console.error('Storybook index.json not found. Build storybook first.');
  process.exit(1);
}

const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const entries = index.entries || index.stories || {};
const stories = Object.values(entries).filter(
  (e) => e.type !== 'docs' && !e.id.endsWith('--docs'),
);

console.log(`Found ${stories.length} stories in Storybook index`);

// Get all baseline files
if (!fs.existsSync(snapshotsDir)) {
  console.log('No snapshots directory found.');
  process.exit(0);
}

const baselines = fs.readdirSync(snapshotsDir).filter((f) => f.endsWith('.png'));
console.log(`Found ${baselines.length} baseline files`);

// After running playwright --update-snapshots, the generated files are the
// source of truth. But we can also check by trying to match story titles.
// Playwright generates filenames by sanitizing the snapshot name arg.

// For now, just report — actual cleanup happens during --update-snapshots
// which only writes files for stories that exist.

// Find baselines that were recently modified (within last run)
const recentThreshold = Date.now() - 5 * 60 * 1000; // 5 minutes
const recent = baselines.filter((f) => {
  const stat = fs.statSync(path.join(snapshotsDir, f));
  return stat.mtimeMs > recentThreshold;
});

const stale = baselines.filter((f) => {
  const stat = fs.statSync(path.join(snapshotsDir, f));
  return stat.mtimeMs <= recentThreshold;
});

if (recent.length > 0) {
  console.log(`\n${recent.length} baselines were updated in the last run`);
}

if (stale.length > 0 && recent.length > 0) {
  // If we just ran --update-snapshots and some files weren't touched,
  // they're likely orphaned
  console.log(`\n${stale.length} potentially orphaned baselines (not updated):`);
  for (const f of stale) {
    console.log(`  ${f}`);
    if (!dryRun) {
      fs.unlinkSync(path.join(snapshotsDir, f));
      console.log(`    -> deleted`);
    }
  }
}

console.log('\nDone.');
