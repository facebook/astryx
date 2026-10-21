// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `icon.map` leaf (AST-084 FR3): register which icon of the set being
 * authored draws one icon definition, or remove that entry.
 *
 * @output the `icon.map` envelope
 * @position api/icon/map — dispatched by the `experimental icon map` command
 */

import * as path from 'node:path';
import {AstryxError} from '../../error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {
  authoring,
  closestNames,
  findLocalIconSet,
  mappableDefinitions,
  refuseOutsideProject,
  writeGeneratedIcons,
  writeIconSetData,
} from '../_adapter.mjs';

/**
 * Set `map[definition] = icon` in the set's data file, or remove the entry.
 * Experimental (spec:AST-017 FR27): may change or be removed in a patch
 * release.
 * @experimental
 * @param {string} definition
 * @param {string | undefined} icon an icon id in the set; omit with `remove`
 * @param {import('../icon.type.mjs').IconMapOptions} [options]
 * @returns {Promise<import('../icon.type.mjs').IconMapResponse>}
 */
export function iconMap(definition, icon, options = {}) {
  const {cwd = process.cwd(), set: selector, remove = false} = options;
  refuseOutsideProject(cwd, 'experimental icon map', 'the icon-set package');
  return authoring(async () => {
    if (typeof definition !== 'string' || definition.trim() === '') {
      throw new AstryxError(
        'Name the icon definition to map',
        [
          {
            name: 'astryx docs cli/experimental/icon-definitions',
            reason: 'every icon definition',
          },
        ],
        ERROR_CODES.ERR_MISSING_ARGUMENT,
      );
    }
    if (!remove && (typeof icon !== 'string' || icon.trim() === '')) {
      throw new AstryxError(
        'Name the icon id to map it to, or pass --remove',
        undefined,
        ERROR_CODES.ERR_MISSING_ARGUMENT,
      );
    }
    const {packageDir, set} = await findLocalIconSet(cwd, selector);
    const map = {...(set.data.map ?? {})};
    const previous = map[definition] ?? null;
    if (remove) {
      delete map[definition];
    } else {
      if (!mappableDefinitions(set).has(definition)) {
        throw new AstryxError(
          `"${definition}" is not an icon definition.`,
          [
            ...closestNames(definition, [...mappableDefinitions(set)]).map(
              name => ({name, reason: 'a known icon definition'}),
            ),
            {
              name: `astryx experimental icon new-definition ${definition} --set ${set.name}`,
              reason: 'add it as your own definition',
            },
          ],
          ERROR_CODES.ERR_NOT_FOUND,
        );
      }
      const ids = set.data.icons.map(each => each.id);
      if (!ids.includes(/** @type {string} */ (icon))) {
        throw new AstryxError(
          `Icon set "${set.name}" has no icon "${icon}".`,
          closestNames(/** @type {string} */ (icon), ids).map(name => ({
            name,
            reason: 'an icon in this set',
          })),
          ERROR_CODES.ERR_NOT_FOUND,
        );
      }
      map[definition] = /** @type {string} */ (icon);
    }
    const changed = remove ? previous != null : previous !== icon;
    /** @type {string[]} */
    const files = [];
    if (changed) {
      const next = {...set.data, map};
      // A set with a generated module gets its theme map rewritten too.
      const written = set.data.generated
        ? writeGeneratedIcons(packageDir, set.data.generated, next, [])
        : null;
      try {
        writeIconSetData(set, next);
      } catch (error) {
        written?.undo();
        throw error;
      }
      files.push(...(written?.files ?? []));
    }
    return {
      type: /** @type {const} */ ('icon.map'),
      data: {
        set: set.name,
        package: set.package,
        file: path.relative(packageDir, set.dataPath).split(path.sep).join('/'),
        definition,
        icon: remove ? null : /** @type {string} */ (icon),
        previous,
        changed,
        ...(files.length > 0 ? {files} : {}),
      },
    };
  });
}
