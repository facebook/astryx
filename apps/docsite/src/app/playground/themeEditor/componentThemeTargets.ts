// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file componentThemeTargets.ts
 * @input A JSX component module name (e.g. `Button`, `TextInput`)
 * @output The theme component key + curated theming controls for it
 * @position Playground — backs the Theme-mode targeting popover.
 *
 * Maps the JSX identifier the preview reports (the `data-pg-id` prefix) to the
 * semantic component key `defineTheme().components` uses (e.g. `Button` →
 * `button`, `TextInput` → `text-input`). The key is the component's stable
 * `.xds-*` class minus the `xds-` prefix (from the generated registry's theming
 * targets), so it stays correct as components are added.
 */

import {getComponentByModule} from '../propertyEditor/componentLookup';
import {COMPONENT_VARS, COMPONENT_VAR_TO_OVERRIDE} from './constants';

/** PascalCase / camelCase → kebab-case, as a fallback theme key. */
function kebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * The semantic theme key for a component module name. Prefers the registry's
 * stable `.xds-*` class (minus prefix); falls back to kebab-case of the name.
 */
export function themeKeyForComponent(moduleName: string): string {
  const entry = getComponentByModule(moduleName);
  const className = entry?.theming?.targets?.[0]?.className;
  if (className) {
    return className.replace(/^xds-/, '');
  }
  return kebab(moduleName);
}

export interface CuratedControl {
  /** The component CSS property the control writes (e.g. `borderRadius`). */
  cssProperty: string;
  /** Human label (e.g. "Border radius"). */
  description: string;
  /** Curated value options for a Selector control. */
  options: Array<{value: string; label: string; token?: string}>;
}

/**
 * Curated theming controls for a component key, derived from the existing
 * COMPONENT_VARS catalog (radius/padding presets) but expressed as the
 * component CSS property the override writes — so the popover edits
 * `components[key].base[cssProperty]` directly.
 */
export function curatedControlsForKey(key: string): CuratedControl[] {
  const group = COMPONENT_VARS[key];
  if (!group) {
    return [];
  }
  const controls: CuratedControl[] = [];
  for (const v of group.vars) {
    const mapping = COMPONENT_VAR_TO_OVERRIDE[v.name]?.find(
      m => m.component === key,
    );
    if (!mapping) {
      continue;
    }
    controls.push({
      cssProperty: mapping.cssProperty,
      description: v.description,
      options: v.options,
    });
  }
  return controls;
}

/** Human-friendly display name for a component module (for the popover header). */
export function componentDisplayName(moduleName: string): string {
  return getComponentByModule(moduleName)?.displayName ?? moduleName;
}
