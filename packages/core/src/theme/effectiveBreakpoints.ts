// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file effectiveBreakpoints.ts
 * @input The nearest Theme (or the registered root theme) and its normalized
 *   adaptation metadata
 * @output Package-internal accessors for the effective width-breakpoint map
 * @position spec:AST-031 FR5. The ONE place a component learns what `md` is.
 *
 * Components must not read `DefinedTheme.__adaptations` themselves: that field
 * is normalized storage for theme extension, may be partial on a built theme,
 * and is absent entirely without a theme. Reading it directly spreads the
 * default-merge and the provider/root fallback across call sites. These
 * accessors resolve all three cases once — nearest Theme context, then the
 * registered root theme, then the AST-012 defaults.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/adaptationConditions.ts (default width points)
 * - /packages/core/src/theme/useComponentAdaptations.ts (resolver consumer)
 * - /packages/core/src/AppShell/AppShell.tsx (mobileNav.breakpoint consumer)
 * - /packages/core/src/theme/effectiveBreakpoints.test.tsx
 */

import {useMemo} from 'react';
import {
  DEFAULT_WIDTH_BREAKPOINTS,
  type WidthBreakpoints,
} from './adaptationConditions';
import type {DefinedTheme} from './defineTheme';
import {useThemeDefinition} from './useTheme';

/**
 * Complete the width map of one theme object.
 *
 * Every named point is resolved individually with `??`, so a stored map that is
 * partial — a built theme, or one carrying an explicit `undefined` for a name —
 * falls back per name instead of letting that name go missing. The literal is
 * spelled out rather than spread: the `WidthBreakpoints` annotation then makes
 * a newly added point a compile error here instead of a silent omission.
 *
 * @internal
 */
export function getEffectiveWidthBreakpoints(
  theme: DefinedTheme | null | undefined,
): Readonly<WidthBreakpoints> {
  const overrides = theme?.__adaptations?.widthBreakpoints;
  if (!overrides) {
    return DEFAULT_WIDTH_BREAKPOINTS;
  }

  const resolved: WidthBreakpoints = {
    sm: overrides.sm ?? DEFAULT_WIDTH_BREAKPOINTS.sm,
    md: overrides.md ?? DEFAULT_WIDTH_BREAKPOINTS.md,
    lg: overrides.lg ?? DEFAULT_WIDTH_BREAKPOINTS.lg,
    xl: overrides.xl ?? DEFAULT_WIDTH_BREAKPOINTS.xl,
    '2xl': overrides['2xl'] ?? DEFAULT_WIDTH_BREAKPOINTS['2xl'],
  };
  return resolved;
}

/**
 * The effective width points of the nearest active Theme.
 *
 * Resolution order matches `architecture:theme-application`: the nearest Theme
 * provider, then the registered root theme when there is no provider context,
 * then the AST-012 defaults. The returned map is referentially stable while the
 * active theme is unchanged, so callers may use it as a hook dependency.
 *
 * @internal
 */
export function useEffectiveWidthBreakpoints(): Readonly<WidthBreakpoints> {
  const theme = useThemeDefinition();
  // One merge implementation, exercised by the hook every render, so the
  // non-hook helper cannot drift away from what components actually resolve.
  return useMemo(() => getEffectiveWidthBreakpoints(theme), [theme]);
}
