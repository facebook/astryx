// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `icon.search` leaf (AST-084 FR6): find icons by meaning across every
 * installed set, ranked, with each match's import line.
 *
 * @input a query, an optional set selector, and a limit
 * @output the `icon.search` envelope
 * @position api/icon/search — dispatched by ../icon.mjs
 */

import {AstryxError} from '../../error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {loadIconSets} from '../_adapter.mjs';
import {closest, rankIcons, setsNamed, withdrawnReason} from '../_records.mjs';

/**
 * Rank every installed icon against a query.
 * @param {string} query
 * @param {{cwd: string, set?: string, limit: number}} options
 * @returns {Promise<import('../icon.type.mjs').IconSearchResponse>}
 */
export async function iconSearch(query, {cwd, set, limit}) {
  const {sets, withdrawn} = await loadIconSets(cwd);
  let searched = sets;
  if (set != null) {
    searched = setsNamed(sets, set);
    if (searched.length === 0) {
      throw new AstryxError(
        withdrawnReason(withdrawn, set) ??
          `No installed icon set named "${set}"`,
        closest(
          set,
          sets.flatMap(each => [each.name, `${each.package}/${each.name}`]),
          'installed icon set',
        ),
        ERROR_CODES.ERR_NOT_FOUND,
      );
    }
  }
  const matches = rankIcons(searched, query);
  return {
    type: 'icon.search',
    data: {
      query: query.trim(),
      matchCount: matches.length,
      matches: matches.slice(0, limit),
    },
  };
}
