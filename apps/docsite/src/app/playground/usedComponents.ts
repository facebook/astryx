// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file usedComponents.ts
 * @input Generated component registry + detected JSX instances
 * @output Module-name → ComponentEntry lookup; distinct used-component list
 * @position Playground Property tab support.
 */

import {
  components,
  type ComponentEntry,
} from '../../generated/componentRegistry';
import type {InstanceInfo} from './babelParser';

const byModuleName: Map<string, ComponentEntry> = (() => {
  const map = new Map<string, ComponentEntry>();
  for (const entries of Object.values(components)) {
    for (const entry of entries) {
      // moduleName is the JSX identifier authored in code, e.g. `Button`.
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

export interface UsedComponent {
  /** JSX identifier as written, e.g. `Button`. */
  module: string;
  /** Friendly label, e.g. `Button` (falls back to the module name). */
  label: string;
  /** Number of instances of this component in the code. */
  count: number;
  /** Whether the registry knows this component (has props/docs). */
  known: boolean;
}

/** Distinct XDS components present in the code, in first-seen order. */
export function getUsedComponents(instances: InstanceInfo[]): UsedComponent[] {
  const order: string[] = [];
  const counts = new Map<string, number>();
  for (const inst of instances) {
    if (!counts.has(inst.component)) {
      order.push(inst.component);
    }
    counts.set(inst.component, (counts.get(inst.component) ?? 0) + 1);
  }
  return order.map(module => {
    const entry = byModuleName.get(module);
    return {
      module,
      label: entry?.displayName ?? module.replace(/^XDS/, ''),
      count: counts.get(module) ?? 0,
      known: entry != null,
    };
  });
}
