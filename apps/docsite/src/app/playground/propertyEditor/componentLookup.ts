// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file componentLookup.ts
 * @input Generated component registry
 * @output Module-name → ComponentEntry lookup
 * @position Playground Properties popover support.
 */

import {
  components,
  type ComponentEntry,
} from '../../../generated/componentRegistry';

const byModuleName: Map<string, ComponentEntry> = (() => {
  const map = new Map<string, ComponentEntry>();
  for (const entries of Object.values(components)) {
    for (const entry of entries) {
      // moduleName is the JSX identifier authored in code, e.g. `XDSButton`.
      if (entry.moduleName && !map.has(entry.moduleName)) {
        map.set(entry.moduleName, entry);
      }
    }
  }
  return map;
})();

export function getComponentByModule(
  moduleName: string,
): ComponentEntry | undefined {
  return byModuleName.get(moduleName);
}
