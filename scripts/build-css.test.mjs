/**
 * @file build-css.test.mjs
 * Integration test for build-css.mjs
 *
 * Validates that the CSS splitting pipeline (common.css + per-component styles.css)
 * preserves all @media wrappers from the combined xds.css output.
 *
 * The combined xds.css writes directly from processStylexRules and is always correct.
 * common.css and per-component styles.css go through parseRulesFromCSS, which is the
 * code under test — a regression in that parser silently stripped @media wrappers,
 * causing conditional rules (prefers-reduced-motion, hover, prefers-contrast) to apply
 * unconditionally. See #952, #957.
 */

import {describe, it, expect, beforeAll} from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';
import {execSync} from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CORE_DIST = path.resolve(ROOT, 'packages/core/dist');

/**
 * Extract all @media blocks from a CSS string.
 * Returns an array of the full @media rule strings.
 */
function extractMediaRules(css) {
  const rules = [];
  let i = 0;
  while (i < css.length) {
    // Find @media
    const idx = css.indexOf('@media', i);
    if (idx === -1) break;

    // Find the opening brace
    const braceStart = css.indexOf('{', idx);
    if (braceStart === -1) break;

    // Balance braces to find the end
    let depth = 1;
    let j = braceStart + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
      j++;
    }

    rules.push(css.slice(idx, j).trim());
    i = j;
  }
  return rules;
}

describe('build-css @media preservation', () => {
  let xdsCss;
  let commonCss;
  let componentCssFiles;

  beforeAll(async () => {
    // Build core first (build-css needs compiled source)
    console.log('Running yarn build...');
    execSync('yarn build', {cwd: ROOT, stdio: 'pipe', timeout: 120_000});

    // Read the outputs
    xdsCss = await fs.readFile(path.join(CORE_DIST, 'xds.css'), 'utf8');
    commonCss = await fs.readFile(path.join(CORE_DIST, 'common.css'), 'utf8');

    // Collect all per-component styles.css files
    componentCssFiles = {};
    const entries = await fs.readdir(CORE_DIST, {withFileTypes: true});
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const stylesPath = path.join(CORE_DIST, entry.name, 'styles.css');
        try {
          componentCssFiles[entry.name] = await fs.readFile(stylesPath, 'utf8');
        } catch {
          // No styles.css for this component — that's fine
        }
      }
    }
  }, 180_000);

  it('xds.css contains @media rules', () => {
    const mediaRules = extractMediaRules(xdsCss);
    expect(mediaRules.length).toBeGreaterThan(0);
    console.log(`xds.css has ${mediaRules.length} @media rules`);
  });

  it('combined split CSS has the same @media count as xds.css', () => {
    const xdsMedia = extractMediaRules(xdsCss);

    // Collect @media rules from common.css + all per-component files
    let splitMedia = extractMediaRules(commonCss);
    for (const [name, css] of Object.entries(componentCssFiles)) {
      splitMedia = splitMedia.concat(extractMediaRules(css));
    }

    console.log(`xds.css @media rules: ${xdsMedia.length}`);
    console.log(
      `Split CSS @media rules: ${splitMedia.length} (common: ${extractMediaRules(commonCss).length})`,
    );

    expect(splitMedia.length).toBe(xdsMedia.length);
  });

  it('common.css contains prefers-reduced-motion rules', () => {
    const mediaRules = extractMediaRules(commonCss);
    const motionRules = mediaRules.filter(r =>
      r.includes('prefers-reduced-motion'),
    );
    expect(motionRules.length).toBeGreaterThan(0);
    console.log(
      `common.css has ${motionRules.length} prefers-reduced-motion rules`,
    );
  });

  it('no transition-duration:0s rules appear outside @media blocks', () => {
    // The bug caused rules like .x12w9bfk.x12w9bfk{transition-duration:0s}
    // to appear WITHOUT their @media wrapper. Check that any rule with
    // transition-duration:0s is inside an @media block.
    const allSplitCss =
      commonCss + '\n' + Object.values(componentCssFiles).join('\n');

    // Find all transition-duration:0s rules
    const zeroTransitionRegex =
      /\.[a-z][a-z0-9_-]+[^{}]*\{[^}]*transition-duration:\s*0s[^}]*\}/g;
    const matches = [...allSplitCss.matchAll(zeroTransitionRegex)];

    for (const match of matches) {
      const position = match.index;

      // Check if this rule is inside an @media block by looking backwards
      const before = allSplitCss.slice(0, position);
      const mediaStarts = [...before.matchAll(/@media[^{]*\{/g)];
      const isWrapped = mediaStarts.some(m => {
        const mediaStart = m.index;
        const afterMedia = allSplitCss.slice(mediaStart);
        let depth = 0;
        for (let i = 0; i < afterMedia.length; i++) {
          if (afterMedia[i] === '{') depth++;
          else if (afterMedia[i] === '}') {
            depth--;
            if (depth === 0) {
              return mediaStart + i > position;
            }
          }
        }
        return false;
      });

      expect(isWrapped).toBe(true);
    }

    if (matches.length > 0) {
      console.log(
        `Verified ${matches.length} transition-duration:0s rules are all inside @media blocks`,
      );
    }
  });

  it('every @media variant from xds.css exists in split CSS', () => {
    const preludeRegex = /@media\s*\([^)]+\)/g;

    const xdsVariants = new Set(
      [...xdsCss.matchAll(preludeRegex)].map(m => m[0]),
    );
    const splitCss =
      commonCss + '\n' + Object.values(componentCssFiles).join('\n');
    const splitVariants = new Set(
      [...splitCss.matchAll(preludeRegex)].map(m => m[0]),
    );

    console.log(`xds.css @media variants: ${[...xdsVariants].join(', ')}`);
    console.log(
      `Split CSS @media variants: ${[...splitVariants].join(', ')}`,
    );

    for (const variant of xdsVariants) {
      expect(splitVariants.has(variant)).toBe(true);
    }
  });
});
