// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Pure icon records, ranking, and lookups for the `icon` leaves
 * (AST-084 FR6, FR7). No environment access: the leaves pass in the sets the
 * adapter read.
 *
 * The ranking itself lives in foundation/discovery/icon-ranking.mjs, which
 * the icon-set checks' suggestions read too; this module re-exports it.
 *
 * @position api/icon — shared by the search, detail, and list leaves
 */

import {levenshteinDistance} from '../../foundation/text/string-utils.mjs';
export {
  iconRecord,
  importLine,
  leadingReading,
  matchIcon,
  rankIcons,
  scoreIcon,
} from './_adapter.mjs';

/** @typedef {import('../../foundation/discovery/icon-set-discovery.mjs').DiscoveredIconSet} DiscoveredIconSet */
/** @typedef {import('../../authoring/doctypes/icon-set/type').IconSetIcon} IconSetIcon */
/** @typedef {import('./icon.type.mjs').IconRecord} IconRecord */
/** @typedef {import('./icon.type.mjs').IconMatchEntry} IconMatchEntry */

/**
 * The installed sets a selector names: `<package>/<set>`, else a set name.
 * @template {{name: string, package: string}} T
 * @param {T[]} sets
 * @param {string} selector
 * @returns {T[]}
 */
export function setsNamed(sets, selector) {
  const exact = sets.filter(set => `${set.package}/${set.name}` === selector);
  return exact.length > 0 ? exact : sets.filter(set => set.name === selector);
}

/**
 * Why a selector that names no valid set names nothing usable, when it names
 * an installed set that was withdrawn (invalid, or its module does not
 * resolve); null when it names no installed set at all (FR17).
 * @param {Array<{name: string, package: string, reason: string}>} withdrawn
 * @param {string} selector
 * @returns {string | null}
 */
export function withdrawnReason(withdrawn, selector) {
  const named = setsNamed(withdrawn, selector);
  return named.length > 0
    ? `Icon set "${selector}" is installed but withdrawn: ${named.map(each => each.reason).join(' ')}`
    : null;
}

/**
 * Suggestions for a name that matched nothing: the closest candidates first.
 * @param {string} wanted
 * @param {string[]} candidates
 * @param {string} reason
 * @param {number} [max]
 */
export function closest(wanted, candidates, reason, max = 5) {
  return [...new Set(candidates)]
    .map(name => ({name, distance: levenshteinDistance(wanted, name)}))
    .sort((a, b) => a.distance - b.distance || a.name.localeCompare(b.name))
    .slice(0, max)
    .map(({name}) => ({name, reason}));
}
