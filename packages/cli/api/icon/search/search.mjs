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

/** The lowest score of a whole-word or word-start match. */
const WORD_SCORE = 60;

/**
 * Every icon of one set, by id: `--set <name> --all-icons`, so an author can read
 * a whole library's ids, words, and the definitions each icon draws.
 * @param {{cwd: string, set: string}} options
 * @returns {Promise<import('../icon.type.mjs').IconSetIconsResponse>}
 */
export async function iconSetIcons({cwd, set}) {
  const {sets} = await loadIconSets(cwd);
  const named = setsNamed(sets, set);
  if (named.length !== 1) {
    throw new AstryxError(
      named.length === 0
        ? `No installed icon set named "${set}"`
        : `"${set}" names ${named.length} sets; name one as <package>/<set>`,
      closest(
        set,
        sets.flatMap(each => [each.name, `${each.package}/${each.name}`]),
        'installed icon set',
      ),
      named.length === 0
        ? ERROR_CODES.ERR_NOT_FOUND
        : ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  const [only] = named;
  /** @type {Map<string, string[]>} */
  const drawn = new Map();
  for (const [definition, id] of Object.entries(only.data.map ?? {})) {
    drawn.set(id, [...(drawn.get(id) ?? []), definition]);
  }
  return {
    type: 'icon.setIcons',
    data: {
      set: only.name,
      package: only.package,
      iconCount: only.data.icons.length,
      icons: [...only.data.icons]
        .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
        .map(icon => ({
          id: icon.id,
          export: icon.export,
          words: icon.words,
          definitions: (drawn.get(icon.id) ?? []).sort(),
        })),
    },
  };
}

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
  const ranked = rankIcons(searched, query);
  // A partial match (`pin` inside `shopping`) answers only when nothing
  // matches a whole word or a word start.
  const matches = ranked.some(each => each.score >= WORD_SCORE)
    ? ranked.filter(each => each.score >= WORD_SCORE)
    : ranked;
  return {
    type: 'icon.search',
    data: {
      query: query.trim(),
      matchCount: matches.length,
      matches: matches.slice(0, limit),
    },
  };
}
