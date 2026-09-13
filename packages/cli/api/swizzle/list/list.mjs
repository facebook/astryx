// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file swizzle.list leaf — the swizzlable component names.
 *
 * Projects the replacement-aware project catalog into the `swizzle.list`
 * envelope. All human prose / usage hints live in the CLI renderer.
 */

import {Project} from '../../../foundation/config/project.mjs';
import {CORE_PACKAGE} from '../../../foundation/discovery/component-discovery.mjs';
import {resolveCore} from '../_adapter.mjs';

/**
 * List swizzlable components from Core and configured integrations. A declared
 * replacement occupies its Core target's unqualified slot.
 * @param {string} [cwd]
 * @returns {Promise<import('../swizzle.type.mjs').SwizzleListResponse>}
 */
export async function swizzleList(cwd = process.cwd()) {
  const {components} = resolveCore(cwd);
  try {
    const project = await Project.load(cwd);
    const catalog = await project.componentCatalog();
    const records = await project.components();
    const listed = components.flatMap(name => {
      const selected = catalog.resolve(name);
      if (selected && selected.package !== CORE_PACKAGE) {
        return selected?.sourcePath ? [selected.name] : [];
      }
      return [name];
    });
    for (const record of records) {
      if (
        record.package !== CORE_PACKAGE &&
        record.sourcePath &&
        !listed.includes(record.name)
      ) {
        listed.push(record.name);
      }
    }
    return {
      type: 'swizzle.list',
      data: [...new Set(listed)],
    };
  } catch {
    return {type: 'swizzle.list', data: components};
  }
}
