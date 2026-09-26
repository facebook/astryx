// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file forcedColors.ts
 * @input Uses the jsdom document (StyleX dev runtime injects rules into it)
 * @output Exports getForcedColorsRules, getAllInjectedCss test helpers
 * @position Shared test utility for asserting forced-colors style output
 *
 * jsdom cannot emulate `@media (forced-colors: active)` rendering, so
 * component tests assert the next-best thing: that the StyleX dev runtime
 * (runtimeInjection in vitest.config.ts) actually injected the forced-colors
 * rules a component relies on for Windows High Contrast support (WCAG 1.4.11).
 * Visual behavior needs manual verification in a forced-colors environment.
 */

/**
 * Collects the cssText of every injected CSS rule scoped to
 * `@media (forced-colors: active)`, including rules nested in other
 * conditions. Returns one string for substring assertions.
 */
export function getForcedColorsRules(): string {
  const chunks: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRule[];
    try {
      rules = Array.from(sheet.cssRules);
    } catch {
      continue;
    }
    for (const rule of rules) {
      if (rule.cssText.includes('forced-colors: active')) {
        chunks.push(rule.cssText);
      }
    }
  }
  return chunks.join('\n');
}

/**
 * Collects the cssText of every injected CSS rule, regardless of condition.
 * Use to assert declarations that live OUTSIDE `@media (forced-colors: active)`
 * yet still exist for forced-colors support — e.g. `forced-color-adjust: none`
 * (an unconditional declaration) or a hover tint gated behind
 * `(forced-colors: none)` so it cannot override the forced-colors state.
 */
export function getAllInjectedCss(): string {
  const chunks: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRule[];
    try {
      rules = Array.from(sheet.cssRules);
    } catch {
      continue;
    }
    for (const rule of rules) {
      chunks.push(rule.cssText);
    }
  }
  return chunks.join('\n');
}
