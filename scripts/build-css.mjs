/**
 * @file build-css.mjs
 * Post-build script that extracts StyleX CSS from compiled source files
 * and outputs per-component CSS files, a shared common.css, and a combined xds.css,
 * all wrapped in @layer xds.base.
 *
 * Usage: node scripts/build-css.mjs
 *
 * This script:
 * 1. Runs Babel with the StyleX plugin over all source files
 * 2. Groups CSS rules by component directory
 * 3. Identifies shared rules (used by 2+ components) → common.css
 * 4. Outputs per-component CSS files with only unique rules
 * 5. Outputs a combined xds.css with all rules
 * 6. All CSS is wrapped in @layer xds.base { ... }
 *
 * Per-component CSS enables tree-shaking for dist consumers:
 *   import { Button } from '@xds/core/Button';
 *   // bundler auto-includes common.css + dist/Button/styles.css
 *
 * All-in-one CSS for consumers who prefer a single import:
 *   import '@xds/core/xds.css';
 */

import {transformAsync} from '@babel/core';
import stylexBabelPlugin from '@stylexjs/babel-plugin';
import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';
import {glob} from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CORE_SRC = path.resolve(ROOT, 'packages/core/src');
const CORE_DIST = path.resolve(ROOT, 'packages/core/dist');

/**
 * Determine which component a source file belongs to.
 * Returns the component directory name (e.g. "Button") or "_shared"
 * for files not in a component directory.
 */
function getComponentName(filePath) {
  const rel = path.relative(CORE_SRC, filePath);
  const parts = rel.split(path.sep);

  if (parts.length === 1) return '_shared';

  const dir = parts[0];
  if (dir[0] === dir[0].toUpperCase() && dir[0] !== '_') {
    return dir;
  }

  return '_shared';
}

async function collectStyleXCSS() {
  const files = await glob('**/*.{ts,tsx}', {
    cwd: CORE_SRC,
    absolute: true,
    ignore: ['**/*.test.*', '**/*.d.ts', '**/node_modules/**'],
  });

  console.log(`Processing ${files.length} source files...`);

  // Map: componentName -> StyleX rules[]
  const componentRules = new Map();
  const allRules = [];

  for (const file of files) {
    const code = await fs.readFile(file, 'utf8');

    if (!code.includes('@stylexjs/stylex')) {
      continue;
    }

    try {
      const result = await transformAsync(code, {
        babelrc: false,
        filename: file,
        presets: [
          ['@babel/preset-typescript', {isTSX: true, allExtensions: true}],
          ['@babel/preset-react', {runtime: 'automatic'}],
        ],
        plugins: [
          [
            stylexBabelPlugin,
            {
              dev: false,
              runtimeInjection: false,
              genConditionalClasses: true,
              treeshakeCompensation: true,
              unstable_moduleResolution: {
                type: 'commonJS',
                rootDir: ROOT,
              },
            },
          ],
        ],
      });

      if (result?.metadata?.stylex?.length) {
        const rules = result.metadata.stylex;
        const component = getComponentName(file);

        if (!componentRules.has(component)) {
          componentRules.set(component, []);
        }
        componentRules.get(component).push(...rules);
        allRules.push(...rules);
      }
    } catch (err) {
      console.warn(
        `  Warning: Could not process ${path.relative(ROOT, file)}: ${err.message}`,
      );
    }
  }

  console.log(`Collected ${allRules.length} StyleX rules across ${componentRules.size} groups`);

  return {componentRules, allRules};
}

/**
 * Given a list of StyleX rules, produce CSS via the official processor
 * and parse it into individual rule entries: { className, rule (full text) }
 *
 * Handles @media and other at-rule wrappers by preserving them around the
 * inner rule. For example:
 *   @media (prefers-reduced-motion: reduce){.x1{transition-duration:0s}}
 * is parsed as a single entry with the full @media wrapper intact.
 */
function parseRulesFromCSS(css) {
  const entries = [];
  let i = 0;

  while (i < css.length) {
    // Skip whitespace and newlines
    while (i < css.length && /\s/.test(css[i])) i++;
    if (i >= css.length) break;

    // Detect at-rules (@media, @keyframes, etc.)
    if (css[i] === '@') {
      // Find the opening brace of the at-rule
      const atStart = i;
      const braceIdx = css.indexOf('{', i);
      if (braceIdx === -1) break;

      const atPrelude = css.slice(atStart, braceIdx).trim();

      // Skip @keyframes entirely — they aren't component-splittable rules
      if (atPrelude.startsWith('@keyframes')) {
        // Jump past the balanced braces
        i = findClosingBrace(css, braceIdx);
        continue;
      }

      // For @media and other conditional at-rules, extract inner rules
      // and wrap each one with the at-rule prelude
      const closeIdx = findClosingBrace(css, braceIdx);
      const innerCSS = css.slice(braceIdx + 1, closeIdx - 1);
      const innerEntries = parseRulesFromCSS(innerCSS);

      for (const entry of innerEntries) {
        entries.push({
          className: entry.className,
          fullRule: `${atPrelude}{${entry.fullRule}}`,
        });
      }

      i = closeIdx;
      continue;
    }

    // Regular rule: .className...{ declarations }
    if (css[i] === '.') {
      const ruleStart = i;
      const braceIdx = css.indexOf('{', i);
      if (braceIdx === -1) break;

      const closeIdx = findClosingBrace(css, braceIdx);
      const fullRule = css.slice(ruleStart, closeIdx).trim();
      const selector = css.slice(ruleStart, braceIdx).trim();
      const className = selector.match(/^(\.[a-z][a-z0-9_-]+)/)?.[1];

      if (className) {
        entries.push({className, fullRule});
      }

      i = closeIdx;
      continue;
    }

    // Skip anything else (comments, etc.)
    i++;
  }

  return entries;
}

/**
 * Find the index just past the closing brace that matches the opening brace
 * at `openIdx`. Handles nested braces.
 */
function findClosingBrace(css, openIdx) {
  let depth = 1;
  let i = openIdx + 1;
  while (i < css.length && depth > 0) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') depth--;
    i++;
  }
  return i;
}

function wrapInLayer(css, comment) {
  if (!css.trim()) return '';
  return `/* ${comment} */
/* Auto-generated. Do not edit manually. */

@layer xds.base {
${css
  .split('\n')
  .map(line => '  ' + line)
  .join('\n')}
}
`;
}

async function main() {
  const {componentRules, allRules} = await collectStyleXCSS();

  if (allRules.length === 0) {
    console.error('No StyleX rules found!');
    process.exit(1);
  }

  await fs.mkdir(CORE_DIST, {recursive: true});

  // --- Step 1: Process each component's rules to get CSS ---
  // We need to identify which CSS classes are shared across components.
  // Process each component independently, then compare.
  const componentCSS = new Map(); // component -> parsed CSS entries
  const classToComponents = new Map(); // className -> Set<component>
  const classToRule = new Map(); // className -> full rule text (first seen)

  for (const [component, rules] of componentRules) {
    if (component === '_shared' || rules.length === 0) continue;

    const css = stylexBabelPlugin.processStylexRules(rules, false);
    if (!css.trim()) continue;

    const entries = parseRulesFromCSS(css);
    componentCSS.set(component, entries);

    for (const {className, fullRule} of entries) {
      if (!classToComponents.has(className)) {
        classToComponents.set(className, new Set());
      }
      classToComponents.get(className).add(component);

      if (!classToRule.has(className)) {
        classToRule.set(className, fullRule);
      }
    }
  }

  // --- Step 2: Identify shared classes (2+ components) ---
  const sharedClasses = new Set();
  for (const [className, components] of classToComponents) {
    if (components.size >= 2) {
      sharedClasses.add(className);
    }
  }

  console.log(`\nShared classes (2+ components): ${sharedClasses.size}`);
  console.log(`Unique classes: ${classToComponents.size - sharedClasses.size}`);

  // --- Step 3: Write common.css with shared rules ---
  // Use the combined allRules processed output to get correct ordering
  const combinedCSS = stylexBabelPlugin.processStylexRules(allRules, false);
  const combinedEntries = parseRulesFromCSS(combinedCSS);

  const commonRules = combinedEntries
    .filter(e => sharedClasses.has(e.className))
    .map(e => e.fullRule);

  // Dedupe (same className can appear in multiple @media contexts)
  const seenCommon = new Set();
  const dedupedCommonRules = commonRules.filter(rule => {
    if (seenCommon.has(rule)) return false;
    seenCommon.add(rule);
    return true;
  });

  const commonCSSContent = dedupedCommonRules.join('\n');
  const commonPath = path.resolve(CORE_DIST, 'common.css');
  await fs.writeFile(
    commonPath,
    wrapInLayer(commonCSSContent, 'XDS shared styles — auto-imported by components'),
    'utf8',
  );
  console.log(`Common CSS: ${(commonCSSContent.length / 1024).toFixed(1)} KB (${dedupedCommonRules.length} rules)`);

  // --- Step 4: Write per-component CSS (unique rules only) ---
  let componentCount = 0;
  const manifest = {};

  for (const [component, entries] of componentCSS) {
    // Filter to only rules unique to this component
    const uniqueRules = entries
      .filter(e => !sharedClasses.has(e.className))
      .map(e => e.fullRule);

    const componentDir = path.resolve(CORE_DIST, component);
    await fs.mkdir(componentDir, {recursive: true});

    const outPath = path.resolve(componentDir, 'styles.css');

    if (uniqueRules.length === 0) {
      // Component only uses shared classes — still write an empty-ish file
      // so the import doesn't break
      await fs.writeFile(
        outPath,
        `/* XDS ${component} styles */\n/* All rules for this component are in common.css */\n`,
        'utf8',
      );
    } else {
      // Dedupe within component
      const seen = new Set();
      const deduped = uniqueRules.filter(rule => {
        if (seen.has(rule)) return false;
        seen.add(rule);
        return true;
      });
      await fs.writeFile(outPath, wrapInLayer(deduped.join('\n'), `XDS ${component} styles`), 'utf8');
    }

    manifest[component] = {total: entries.length, unique: uniqueRules.length};
    componentCount++;
  }

  console.log(`\nWrote ${componentCount} per-component CSS files`);

  // --- Step 5: Write combined xds.css ---
  const combinedPath = path.resolve(CORE_DIST, 'xds.css');
  await fs.writeFile(
    combinedPath,
    wrapInLayer(combinedCSS, 'XDS Pre-compiled StyleX CSS — all components'),
    'utf8',
  );
  console.log(`Combined: ${(combinedCSS.length / 1024).toFixed(1)} KB`);

  // --- Manifest ---
  const manifestLines = Object.entries(manifest)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, {total, unique}]) => `  ${name}: ${unique} unique / ${total} total`);
  console.log(`\nPer-component breakdown:\n${manifestLines.join('\n')}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
