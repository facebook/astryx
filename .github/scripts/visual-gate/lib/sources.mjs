// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Where the gate gets its facts: the theming targets components declare,
 *       and the component overrides themes actually author.
 *
 * @input  the repo
 * @output the two enumerations the plan and the targeting analysis are built
 *         from
 *
 * Both come from the same places the product does — `collectThemingTargets`
 * is the CLI's own enumeration (the one `astryx theme targets` prints and
 * `astryx theme build` validates against), and theme overrides are read out of
 * the built theme packages rather than parsed out of their source. Nothing
 * here is a second registry: if the gate and the compiler ever disagree about
 * what is themeable, that is a bug in one shared function, not a drift between
 * two lists.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';

/**
 * @param {string} repoRoot
 * @returns {Promise<import('../../../../packages/cli/foundation/discovery/theming-targets.mjs').ThemingTarget[]>}
 */
export async function loadThemingTargets(repoRoot) {
  const module = await import(
    pathToFileURL(
      path.join(repoRoot, 'packages/cli/foundation/discovery/theming-targets.mjs'),
    ).href
  );
  return module.collectThemingTargets(path.join(repoRoot, 'packages/core/src'));
}

/**
 * Every shipped theme's component overrides, as theme name → target key →
 * the selectors it styles (`base`, `variant:primary`, `selected`, …).
 *
 * Reads the built packages: a theme's `components` map is the product of
 * `defineTheme`, not a literal in its source, so the built artifact is the
 * only honest answer.
 *
 * @param {string} repoRoot
 * @returns {Promise<Record<string, Record<string, string[]>>>}
 */
export async function loadThemeOverrides(repoRoot) {
  const themesDir = path.join(repoRoot, 'packages/themes');
  /** @type {Record<string, Record<string, string[]>>} */
  const overrides = {};

  for (const entry of fs.readdirSync(themesDir, {withFileTypes: true}).sort()) {
    if (!entry.isDirectory()) continue;
    const built = path.join(themesDir, entry.name, 'dist/source.mjs');
    if (!fs.existsSync(built)) {
      throw new Error(
        `Theme ${entry.name} is not built (${built} missing) — run pnpm build before the visual gate.`,
      );
    }
    const module = await import(pathToFileURL(built).href);
    const theme = Object.values(module).find(value => value?.name && value?.components);
    if (!theme) continue;
    overrides[theme.name] = Object.fromEntries(
      Object.entries(theme.components).map(([key, styles]) => [key, Object.keys(styles ?? {})]),
    );
  }

  return overrides;
}

/**
 * @param {string} repoRoot
 * @returns {{excludeStories: Record<string, string>, viewport: {width: number, height: number}, settleMs: number, threshold: number, maxDiffPixels: number, defaultTheme: string, tiers: string[]}}
 */
export function loadConfig(repoRoot) {
  const defaults = {
    excludeStories: {},
    viewport: {width: 1024, height: 768},
    settleMs: 50,
    threshold: 0.1,
    maxDiffPixels: 0,
    defaultTheme: 'neutral',
    tiers: ['surface', 'theme-matrix'],
  };
  const configPath = path.join(repoRoot, '.github/scripts/visual-gate/visual-gate.config.json');
  if (!fs.existsSync(configPath)) return defaults;
  return {...defaults, ...JSON.parse(fs.readFileSync(configPath, 'utf8'))};
}
