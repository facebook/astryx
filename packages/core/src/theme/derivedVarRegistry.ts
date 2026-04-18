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
  /** What this derived mapping controls. */
  description?: string;
  /** Default value as a CSS expression. */
  default?: string;
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
    {property: 'borderRadius', description: 'Border radius of the banner', default: 'var(--radius-container)', vars: ['--banner-radius']},
  ],
  button: [
    {property: 'borderRadius', description: 'Border radius of buttons', default: 'var(--radius-element)', vars: ['--button-radius']},
  ],
  card: [
    {property: 'borderRadius', description: 'Border radius of the card', default: 'var(--radius-container)', vars: ['--card-radius']},
    {property: 'padding', description: 'Container padding of the card', default: 'var(--spacing-4)', expand: 'container'},
  ],
  chat: [
    {property: 'borderRadius', description: 'Border radius of the composer. Inner elements derive their radius concentrically.', default: 'var(--radius-page)', vars: ['--composer-radius']},
    {property: 'padding', description: 'Padding of the composer. Used in the concentric radius calculation.', default: 'var(--spacing-3)', vars: ['--composer-padding']},
  ],
  dialog: [
    {property: 'borderRadius', description: 'Border radius of the dialog', default: 'var(--radius-container)', vars: ['--dialog-radius']},
    {property: 'padding', description: 'Container padding of the dialog', default: 'var(--spacing-4)', expand: 'container'},
  ],
  'dropdown-menu': [
    {property: 'borderRadius', description: 'Border radius of the menu popup', default: 'var(--radius-element)', vars: ['--dropdown-radius']},
    {property: 'padding', description: 'Inner padding of the menu popup', default: 'var(--spacing-1)', vars: ['--dropdown-padding']},
  ],
  field: [
    {property: 'borderRadius', description: 'Border radius of input fields', default: 'var(--radius-element)', vars: ['--input-radius']},
  ],
  hovercard: [
    {property: 'borderRadius', description: 'Border radius of the hover card', default: 'var(--radius-container)', vars: ['--hovercard-radius']},
  ],
  popover: [
    {property: 'borderRadius', description: 'Border radius of the popover', default: 'var(--radius-element)', vars: ['--popover-radius']},
  ],
  section: [
    {property: 'padding', description: 'Container padding of the section', default: 'var(--spacing-4)', expand: 'container'},
  ],
  'segmented-control': [
    {property: 'borderRadius', description: 'Border radius of the segmented control', default: 'var(--radius-element)', vars: ['--segmented-radius']},
    {property: 'padding', description: 'Inner padding of the segmented control', default: 'var(--spacing-0-5)', vars: ['--segmented-padding']},
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
