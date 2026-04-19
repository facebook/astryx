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
  banner: [
    {property: 'borderRadius', vars: ['--banner-radius']},
  ],
  button: [
    {property: 'borderRadius', vars: ['--button-radius']},
  ],
  card: [
    {property: 'borderRadius', vars: ['--card-radius']},
    {property: 'padding', expand: 'container'},
  ],
  chat: [
    {property: 'borderRadius', vars: ['--composer-radius']},
    {property: 'padding', vars: ['--composer-padding']},
  ],
  dialog: [
    {property: 'borderRadius', vars: ['--dialog-radius']},
    {property: 'padding', expand: 'container'},
  ],
  'dropdown-menu': [
    {property: 'borderRadius', vars: ['--dropdown-radius']},
    {property: 'padding', vars: ['--dropdown-padding']},
  ],
  field: [
    {property: 'borderRadius', vars: ['--input-radius']},
  ],
  hovercard: [
    {property: 'borderRadius', vars: ['--hovercard-radius']},
  ],
  popover: [
    {property: 'borderRadius', vars: ['--popover-radius']},
  ],
  section: [
    {property: 'padding', expand: 'container'},
  ],
  'segmented-control': [
    {property: 'borderRadius', vars: ['--segmented-radius']},
    {property: 'padding', vars: ['--segmented-padding']},
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
  if (!entries) return [];
  return entries.filter(e => e.property === property);
}
