// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build-css.test.mjs
 * Integration test for build-css.mjs
 *
 * Validates that astryx.css contains expected @media wrappers and
 * prefers-reduced-motion rules.
 */

import {describe, it, expect, beforeAll} from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execSync} from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CORE_DIST = path.resolve(ROOT, 'packages/core/dist');

/**
 * Extract all @media blocks from a CSS string.
 */
function extractMediaRules(css) {
  const rules = [];
  let i = 0;
  while (i < css.length) {
    const idx = css.indexOf('@media', i);
    if (idx === -1) break;

    const braceStart = css.indexOf('{', idx);
    if (braceStart === -1) break;

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

describe('build-css astryx.css', () => {
  let astryxCss;

  beforeAll(async () => {
    console.log('Running pnpm build...');
    execSync('pnpm build', {cwd: ROOT, stdio: 'pipe', timeout: 120_000});
    astryxCss = await fs.readFile(path.join(CORE_DIST, 'astryx.css'), 'utf8');
  }, 180_000);

  it('contains @media rules', () => {
    const mediaRules = extractMediaRules(astryxCss);
    expect(mediaRules.length).toBeGreaterThan(0);
    console.log(`astryx.css has ${mediaRules.length} @media rules`);
  });

  it('contains prefers-reduced-motion rules', () => {
    const mediaRules = extractMediaRules(astryxCss);
    const motionRules = mediaRules.filter(r =>
      r.includes('prefers-reduced-motion'),
    );
    expect(motionRules.length).toBeGreaterThan(0);
    console.log(`astryx.css has ${motionRules.length} prefers-reduced-motion rules`);
  });

  it('no transition-duration:0s rules appear outside @media blocks', () => {
    const zeroTransitionRegex =
      /\.[a-z][a-z0-9_-]+[^{}]*\{[^}]*transition-duration:\s*0s[^}]*\}/g;
    const matches = [...astryxCss.matchAll(zeroTransitionRegex)];

    for (const match of matches) {
      const position = match.index;
      const before = astryxCss.slice(0, position);
      const mediaStarts = [...before.matchAll(/@media[^{]*\{/g)];
      const isWrapped = mediaStarts.some(m => {
        const mediaStart = m.index;
        const afterMedia = astryxCss.slice(mediaStart);
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

  it('does not produce per-component CSS files', () => {
    // Verify the cleanup — no common.css or per-component styles.css
    expect(
      fs.access(path.join(CORE_DIST, 'common.css')).then(() => true, () => false),
    ).resolves.toBe(false);
  });
});
