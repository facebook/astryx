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

  return {
    type: 'build.kit',
    data: {
      query: signals.query,
      // Distinguishes "search found nothing" from a weak-but-non-empty result
      // set. Either way the kit still names a template to start from.
      hasResults: signals.matchCount > 0,
      matchCount: signals.matchCount,
      directMatch: signals.directMatch,
      start: signals.start,
      pages: signals.pages,
      blocks: named,
      domain: signals.domain,
      frame: FRAME,
      foundation: FOUNDATION,
      hint,
    },
  };
}
