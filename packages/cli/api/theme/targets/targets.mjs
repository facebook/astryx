// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx theme targets` leaf — the whole themeable surface, enumerated.
 *
 * @input  a cwd (to resolve the project's `@astryxdesign/core`) and an optional
 *         component/key filter
 * @output the `theme.targets` envelope: one row per theming target
 * @position api/theme/targets — projection over
 *           foundation/discovery/theming-targets.mjs, the same component docs
 *           `astryx component <Name>` prints its Theming table from.
 */

import * as path from 'node:path';
import {findCoreDir} from '../../../foundation/fs/paths.mjs';
import {collectThemingTargets} from '../../../foundation/discovery/theming-targets.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {AstryxError} from '../../error.mjs';

/**
 * Whether a target matches the caller's filter: the owning component by name
 * (case-insensitive), or any target whose key or class contains the filter —
 * so `theme targets switch` finds `switch-thumb`, and `theme targets Switch`
 * finds the component's whole set.
 * @param {import('../../../foundation/discovery/theming-targets.mjs').ThemingTarget} target
 * @param {string} filter - already lowercased
 * @returns {boolean}
 */
function matches(target, filter) {
  return (
    target.component.toLowerCase() === filter ||
    target.key.toLowerCase().includes(filter) ||
    target.className.toLowerCase().includes(filter)
  );
}

/**
 * List every component theming target — the `defineTheme` `components` keys,
 * with the props and states each one accepts.
 *
 * @param {string} [filter] - component name, or a substring of a target key
 * @param {{cwd?: string}} [ctx]
 * @returns {Promise<import('../theme.type.mjs').ThemeTargetsResponse>}
 */
export async function themeTargets(filter, {cwd = process.cwd()} = {}) {
  const coreDir = findCoreDir(cwd);
  if (!coreDir) {
    throw new AstryxError(
      'Could not find @astryxdesign/core package',
      undefined,
      ERROR_CODES.ERR_CORE_NOT_FOUND,
    );
  }

  const all = await collectThemingTargets(path.join(coreDir, 'src'));
  const needle = filter ? String(filter).toLowerCase() : null;
  const targets = needle ? all.filter(t => matches(t, needle)) : all;

  if (needle && targets.length === 0) {
    throw new AstryxError(
      `No theming target matches "${filter}"`,
      [...new Set(all.map(t => t.component))]
        .sort()
        .slice(0, 5)
        .map(name => ({name, reason: 'has theming targets'})),
      ERROR_CODES.ERR_UNKNOWN_COMPONENT,
    );
  }

  return {
    type: 'theme.targets',
    data: {
      filter: filter ?? null,
      componentCount: new Set(targets.map(t => t.component)).size,
      targets,
    },
  };
}
