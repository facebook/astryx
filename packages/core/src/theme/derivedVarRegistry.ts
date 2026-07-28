// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Derived variable registry — maps CSS properties to internal vars.
 *
 * Used by generateThemeRules to expand standard CSS properties (borderRadius,
 * padding) into internal CSS custom properties that components read.
 *
 * This is a compiled registry — the source of truth lives in each component's
 * doc file (theming.derived). The consistency test in derivedVarRegistry.test.ts
 * verifies this file stays in sync with the docs.
 *
 * When adding a new component with derived vars:
 * 1. Add the `derived` field to the component's doc.mjs file
 * 2. Add the corresponding entry here
 * 3. The consistency test will catch any drift
 *
 * @position Core theme infrastructure — read by generateThemeRules at runtime
 */

export interface DerivedVarEntry {
  /** The standard CSS property name (camelCase) that theme authors write. */
  property: string;
  /** Internal CSS custom property names to set. Omit when using `expand`. */
  vars?: string[];
  /** Named expansion strategy. 'container' expands padding to container tokens. */
  expand?: 'container';
}

/**
 * Component → derived var mappings.
 *
 * Keys are lowercase component names (matching defineTheme component keys).
 * Values are ordered arrays — earlier entries emit first when multiple
 * entries share the same property.
 */
export const derivedVarRegistry: Record<string, DerivedVarEntry[]> = {
  avatar: [
    {property: 'fontSize', vars: ['--_avatar-fallback-font-size']},
    {property: 'fontWeight', vars: ['--_avatar-fallback-font-weight']},
    {property: 'color', vars: ['--_avatar-fallback-color']},
    {property: 'backgroundColor', vars: ['--_avatar-fallback-background']},
  ],
  banner: [{property: 'borderRadius', vars: ['--_banner-radius']}],
  button: [{property: 'borderRadius', vars: ['--_button-radius']}],
  card: [
    {property: 'borderRadius', vars: ['--_card-radius']},
    {property: 'padding', expand: 'container'},
  ],
  chat: [
    {property: 'borderRadius', vars: ['--_chat-composer-radius']},
    {property: 'padding', vars: ['--_chat-composer-padding']},
  ],
  dialog: [
    {property: 'borderRadius', vars: ['--_dialog-radius']},
    {property: 'padding', expand: 'container'},
  ],
  'dropdown-menu': [
    {property: 'borderRadius', vars: ['--_dropdown-menu-radius']},
    {property: 'padding', vars: ['--_dropdown-menu-padding']},
  ],
  field: [{property: 'borderRadius', vars: ['--_field-radius']}],
  hovercard: [{property: 'borderRadius', vars: ['--_hovercard-radius']}],
  popover: [{property: 'borderRadius', vars: ['--_popover-radius']}],
  section: [{property: 'padding', expand: 'container'}],
  'segmented-control': [
    {property: 'borderRadius', vars: ['--_segmented-control-radius']},
    {property: 'padding', vars: ['--_segmented-control-padding']},
  ],
};

/**
 * Look up derived var entries for a component + CSS property.
 * Returns matching entries in priority order, or empty array if none.
 */
export function getDerivedVars(
  component: string,
  property: string,
): DerivedVarEntry[] {
  const entries = derivedVarRegistry[component];
  if (!entries) {
    return [];
  }
  return entries.filter(e => e.property === property);
}
