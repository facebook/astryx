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
import {ensureCoreBuilt} from '../packages/cli/clients/cli/commands/ensure-core-built.mjs';

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

/** Remove one functional pseudo-class, including nested parentheses. */
function removeFunctionalPseudo(selector, name) {
  let result = selector;
  const needle = `:${name}(`;
  for (;;) {
    const start = result.indexOf(needle);
    if (start === -1) return result;
    let depth = 1;
    let end = start + needle.length;
    while (end < result.length && depth > 0) {
      if (result[end] === '(') depth++;
      else if (result[end] === ')') depth--;
      end++;
    }
    result = result.slice(0, start) + result.slice(end);
  }
}

/** Specificity tuple for the generated selectors used by the state guard. */
function specificity(selector) {
  const withoutWhere = removeFunctionalPseudo(selector, 'where');
  const ids = (withoutWhere.match(/#/g) ?? []).length;
  const classes = (withoutWhere.match(/\.[a-zA-Z0-9_-]+/g) ?? []).length;
  const attributes = (withoutWhere.match(/\[[^\]]+\]/g) ?? []).length;
  const pseudos = (
    withoutWhere.match(/:(?!:|not\(|is\(|has\()[a-zA-Z-]+/g) ?? []
  ).length;
  return [ids, classes + attributes + pseudos, 0];
}

function stateRule(css, {property, token, state, media}) {
  const lines = css.split('\n');
  return lines.find(line => {
    const inHoverMedia = line.includes('@media (hover: hover)');
    return (
      inHoverMedia === media &&
      line.includes(`:${state}:where(`) &&
      !line.includes('::') &&
      line.includes(`${property}:`) &&
      line.includes(`var(--color-overlay-${token})`)
    );
  });
}

function selectorFromRule(rule) {
  const declaration = rule.lastIndexOf('{');
  const mediaBody = rule.indexOf('{');
  return rule
    .slice(rule.includes('@media') ? mediaBody + 1 : 0, declaration)
    .trim();
}

describe('build-css astryx.css', () => {
  let astryxCss;

  beforeAll(async () => {
    // Core — including its `build:css` step that emits astryx.css — is built
    // ONCE by the node project's globalSetup (vitest.global-setup.node.mjs →
    // ensureCoreBuilt). This call is an idempotent, race-safe no-op that just
    // guarantees dist is present. Do NOT run a full `pnpm build` here: it
    // launched a whole-monorepo build (all cores, ~2min) concurrently with the
    // rest of the suite, starving other tests into nondeterministic timeouts.
    ensureCoreBuilt();
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
    console.log(
      `astryx.css has ${motionRules.length} prefers-reduced-motion rules`,
    );
  });

  it.each(['background-color', 'background-image'])(
    'emits %s pressed after hover at equal specificity',
    property => {
      const hover = stateRule(astryxCss, {
        property,
        token: 'hover',
        state: 'hover',
        media: true,
      });
      const pressed = stateRule(astryxCss, {
        property,
        token: 'pressed',
        state: 'active',
        media: true,
      });

      expect(hover).toBeDefined();
      expect(pressed).toBeDefined();
      expect(specificity(selectorFromRule(pressed))).toEqual(
        specificity(selectorFromRule(hover)),
      );
      expect(astryxCss.indexOf(pressed)).toBeGreaterThan(
        astryxCss.indexOf(hover),
      );
    },
  );

  it.each(['background-color', 'background-image'])(
    'keeps the bare %s pressed rule for touch input',
    property => {
      expect(
        stateRule(astryxCss, {
          property,
          token: 'pressed',
          state: 'active',
          media: false,
        }),
      ).toBeDefined();
    },
  );

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

  it('does not produce per-component CSS files', async () => {
    // Verify the cleanup — no common.css or per-component styles.css
    await expect(
      fs.access(path.join(CORE_DIST, 'common.css')).then(
        () => true,
        () => false,
      ),
    ).resolves.toBe(false);
  });
});
