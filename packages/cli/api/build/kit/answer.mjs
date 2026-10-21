// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The build.kit response, from a request's signals (signals.mjs) and the
 * blocks to name. With build's own blocks it is the kit build has always
 * given; another list changes only the blocks, never their count.
 * @input {@link import('./signals.mjs').KitSignals} and block names
 * @output the build.kit response
 * @position api/build/kit, beside signals.mjs; the main searcher in tree.mjs
 *   calls it with the block picker's list.
 */

import {firstSentence} from '../../../foundation/text/string-utils.mjs';
import {FOUNDATION, FRAME} from './signals.mjs';

/**
 * Fewer offerable results than this and the kit says how to look further.
 *
 * Three is the point below which a kit stops being a starting point. An agent
 * that reads a near-empty kit does not conclude "my wording was wrong" — it
 * concludes the package has nothing and falls back on its own memory of what
 * Astryx contains, which is exactly the failure `build` exists to prevent.
 */
const THIN_KIT = 3;

/**
 * The kit for a request. `blocks` names the blocks to list, best first: a
 * block build names itself keeps build's entry, another keeps search's own
 * entry (its real score and reason), a name search did not return is
 * dropped, and the kit never lists more blocks than build's own. Blocks of
 * the same name from two packages are both kept.
 *
 * @param {import('./signals.mjs').KitSignals} signals
 * @param {string[]} [blocks] block names; build's own when omitted
 * @returns {import('../build.type.mjs').BuildKitResponse}
 */
export function kitAnswer(signals, blocks = signals.kitBlocks) {
  // Entries by name, in build's order: two packages can ship a block with the
  // same name, and each name in `blocks` takes the next entry of that name, so
  // both stay listed.
  /** @type {Map<string, import('../build.type.mjs').BuildKitResponse['data']['blocks']>} */
  const own = new Map();
  for (const b of signals.blocks)
    own.set(b.name, [...(own.get(b.name) ?? []), b]);
  /** @type {Set<string>} */
  const added = new Set();
  const named = blocks
    .flatMap(name => {
      const entry = own.get(name)?.shift();
      if (entry) return [entry];
      // A block build does not name itself keeps search's own entry, once.
      const found =
        own.has(name) || added.has(name)
          ? undefined
          : signals.searchedEntries.get(name);
      if (!found) return [];
      added.add(name);
      return [found];
    })
    .slice(0, signals.blocks.length);

  // What to try when the kit comes back thin. Keyword search over a design
  // system misses in a predictable way — the reader's words and the package's
  // often do not overlap — so name the two commands that browse rather than
  // search, and say plainly that this is not semantic matching.
  //
  // STRUCTURED, not prose: `commands` are bare subcommands, because the API
  // cannot know how the caller invokes the CLI. Baking `astryx component
  // --list` into the text hands a pnpm-workspace reader a command that does
  // not resolve — the same defect `getCliInvocation` exists to prevent, and
  // the renderer applies it. A JSON caller gets the parts, not a sentence.
  const hint =
    signals.pages.length + named.length + signals.domain.length < THIN_KIT
      ? {
          reason:
            'Few matches. This is keyword search, not semantic — try other wordings.',
          commands: ['component --list', 'template --list'],
        }
      : undefined;

  const answer = (/** @type {typeof named} */ list) => ({
    type: /** @type {const} */ ('build.kit'),
    data: {
      query: signals.query,
      // Distinguishes "search found nothing" from a weak-but-non-empty result
      // set. Either way the kit still names a template to start from.
      hasResults: signals.matchCount > 0,
      matchCount: signals.matchCount,
      directMatch: signals.directMatch,
      start: signals.start,
      pages: signals.pages,
      blocks: list,
      domain: signals.domain,
      frame: FRAME,
      foundation: FOUNDATION,
      hint,
    },
  });

  // An added block must not make the answer longer than build's own, as JSON
  // or as text: trim the added blocks' descriptions, never which blocks are
  // listed.
  const fitted = fitDescriptions(named, signals.blocks, {
    json: list => bytes(answer(list)),
    text: textSize,
  });
  return answer(fitted);
}

/** @param {unknown} value */
const bytes = value => Buffer.byteLength(JSON.stringify(value));

/**
 * What the blocks add to the text answer, which prints each block's name,
 * package, and the first sentence of its description.
 * @param {{name: string, package?: string, description?: string}[]} list
 */
const textSize = list =>
  list.reduce(
    (n, b) =>
      n +
      Buffer.byteLength(
        `${b.name}${b.package ?? ''}${firstSentence(b.description ?? '')}`,
      ),
    0,
  );

/**
 * A description cut to at most `keep` characters at a word boundary, with an
 * ellipsis; empty when nothing fits.
 * @param {string} description
 * @param {number} keep
 */
function cutTo(description, keep) {
  if (keep <= 0) return '';
  const cut = description.slice(0, keep);
  const at = cut.lastIndexOf(' ');
  return `${(at > 0 ? cut.slice(0, at) : cut).trimEnd()}…`;
}

/**
 * The listed blocks with the added blocks' descriptions shortened, last block
 * first, until neither the JSON nor the text answer is longer than with
 * build's own blocks. Build's own entries are never changed.
 * @template {{name: string, package?: string, description?: string}} B
 * @param {B[]} list
 * @param {B[]} own build's own entries
 * @param {{json: (list: B[]) => number, text: (list: B[]) => number}} size
 * @returns {B[]}
 */
function fitDescriptions(list, own, size) {
  const limit = {json: size.json(own), text: size.text(own)};
  let out = list;
  /** The bytes over each limit; 0 when within. */
  const over = (/** @type {B[]} */ l) => ({
    text: Math.max(0, size.text(l) - limit.text),
    json: Math.max(0, size.json(l) - limit.json),
  });
  for (let k = out.length - 1; k >= 0; k--) {
    const b = out[k];
    if (own.includes(b) || !b.description) continue;
    let o = over(out);
    // Cut the description until both answers fit, or it is gone. A byte count
    // can exceed a character count (the ellipsis, other non-ASCII), so cut
    // again by whatever is left over.
    let description = b.description;
    while ((o.text > 0 || o.json > 0) && description) {
      const first = firstSentence(description);
      const keep = Math.min(
        o.text > 0 ? first.length - o.text - 1 : description.length,
        o.json > 0 ? description.length - o.json - 1 : description.length,
        description.length - 1,
      );
      const cut = cutTo(description, keep);
      // Each pass must shorten it; a cut that cannot is the end of it.
      description = cut.length < description.length ? cut : '';
      const d = description;
      out = out.map((x, i) => (i === k ? {...x, description: d} : x));
      o = over(out);
    }
  }
  return out;
}
