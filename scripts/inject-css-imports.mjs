/**
 * @file inject-css-imports.mjs
 * Post-build script that adds CSS imports to each component's dist JS
 * entry point, enabling automatic CSS tree-shaking.
 *
 * Injects:
 *   import '../common.css';   // shared atomic classes
 *   import './styles.css';    // component-specific classes
 *
 * Usage: node scripts/inject-css-imports.mjs
 *
 * Runs after build-css.mjs. The common.css import is deduplicated by
 * bundlers — even though every component imports it, the bundler only
 * includes it once in the output.
 */

import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CORE_DIST = path.resolve(ROOT, 'packages/core/dist');

async function main() {
  const entries = await fs.readdir(CORE_DIST, {withFileTypes: true});
  let injected = 0;
  let skipped = 0;

  // Verify common.css exists
  try {
    await fs.access(path.join(CORE_DIST, 'common.css'));
  } catch {
    console.error('common.css not found in dist — run build-css.mjs first');
    process.exit(1);
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const cssPath = path.join(CORE_DIST, entry.name, 'styles.css');
    const mjsPath = path.join(CORE_DIST, entry.name, 'index.mjs');

    // Only inject if both styles.css and index.mjs exist
    try {
      await fs.access(cssPath);
      await fs.access(mjsPath);
    } catch {
      skipped++;
      continue;
    }

    const content = await fs.readFile(mjsPath, 'utf8');

    // Don't double-inject
    if (content.includes("import '../common.css'")) {
      skipped++;
      continue;
    }

    const imports = `import '../common.css';\nimport './styles.css';\n`;
    await fs.writeFile(mjsPath, `${imports}${content}`, 'utf8');
    injected++;
  }

  console.log(`Injected CSS imports into ${injected} component entry points (${skipped} skipped)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
