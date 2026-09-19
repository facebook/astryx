// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx layout grammar` leaf — the agent cheatsheet, with the alias
 * table generated from this branch's registry (never hand-maintained). Reads
 * only the registry; shares nothing with expand/check, so it has no adapter.
 *
 * @output {type:'layout.grammar', data}
 * @position api — leaf over lib/xle/registry
 */

import {buildRegistry} from '../../../foundation/xle/registry.mjs';

/**
 * `astryx layout grammar` — the agent cheatsheet, with the alias table
 * generated from this branch's registry (never hand-maintained).
 *
 * @param {{cwd?: string}} [options]
 * @returns {Promise<import('../layout.type.mjs').LayoutGrammarResponse>}
 */
export async function layoutGrammar(options = {}) {
  const {cwd = process.cwd()} = options;
  const registry = await buildRegistry({cwd});

  /** @type {string[]} */
  const aliasLines = [];
  /** @type {Map<string, string[]>} */
  const byTarget = new Map();
  for (const [alias, target] of registry.aliases) {
    if (!byTarget.has(target)) byTarget.set(target, []);
    byTarget.get(target)?.push(alias);
  }
  for (const [target, aliases] of [...byTarget.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    aliasLines.push(`${aliases.join('/')}=${target}`);
  }

  const text = `XLE/XLO — XDS layout expressions (branch-generated; aliases reflect this install)

WORKFLOW
  astryx layout check "<expr>"           validate; echoes canonical compact + outline forms
  astryx layout expand "<expr>" [path]   emit validated TSX (path optional; --name <Pascal>)
  Errors carry line/col + suggestions. Fix and resubmit; nothing is guessed.

TWO SURFACES, ONE LANGUAGE (autodetected; --form to force)
  compact: A[cp6 @topNav=TN] > L > LC > S[p6] > (C{card-callout}*4) + T
  outline: indentation = nesting · same-indent = siblings · "repeat N:" block = (...)*N
           slot lines:  topNav: TN     (or a block:  topNav:\\n    TN ...)

NODE ANATOMY   Name#id.enum"payload"[attrs]{hint}*N > children
  .enum        unique enum value of any prop:  Bd.success  Tx.lg  B.primary
  "payload"    primary text prop (label/title/heading) or text child:  TI"Email"  B"Save"
  {hint}       kebab-case template/component reference (see TEMPLATE REFERENCING) — NEVER text
  *N / xN      repeat (use $ for the counter:  Tk"item-$"*3)
  trailing !   initial selection for scaffolded state:  Tab"Overview"!

ATTRS [...] (outline: bare tokens after the name, no brackets)
  fused        p6 g4 c4 w240 h2 cp2 mw960 rg2 cg2  (per-component: padding lives on Card/Section/AppShell.cp — p6 on AppShell/Layout/VStack errors with a correction)
  key=value    t=email href='/x' c{min:340} dv=[top,bottom] — keys validated per component
  flags        req opt dis striped hover divider … (isX/hasX props) · negate: !scroll
  align        j= main axis, a= cross axis — expander picks hAlign/vAlign per stack direction
  slots        @slotName=Node | @slotName=(sub > expr) | @slotName='text' | @slotName=#id
  trigger      opens=#id  (a plain attr, no @ — binds an onClick that opens the overlay)
  fill         on a stack child → wraps in <StackItem size="fill">

TEMPLATE REFERENCING  ({hint} pulls in real content — this is how XLE reaches past the @astryxdesign/core shell)
  C{card-callout}              splice a template block (astryx template --list --type block):
                              the block is co-defined once in the file, referenced, imports merged
  {kpi-card}                   standalone reference (no wrapper element) — place a component directly
  {kpi-card}*4                 repeat a reference; the definition/import is emitted once
  app components               register local ones in astryx.config.mjs to import them by name:
                                 export default {experimental: {xle: {components: {KpiCard: {from: '@/components/KpiCard'}}}}}
                               then {kpi-card} → import {KpiCard} + <KpiCard /> (kebab ↔ Pascal)

STRUCTURE THE EXPANDER HANDLES
  Layout > LH + LC + LF + LP   children auto-route into header/content/footer/start slots
  T > (TR>THC*4) + (TR>TC*4)*6 rows partition into TableHeader/TableBody automatically
  TabList/inputs               required value+onChange scaffold typed useState automatically
  overlays                     compact: tree ;; Dlg#confirm[...] · outline: overlays: section
                               trigger: B"Delete"[opens=#confirm]

ALIASES (full component names always valid; XDS prefix optional)
  ${aliasLines.join('  ')}
`;

  return {type: 'layout.grammar', data: {text, aliases: Object.fromEntries(registry.aliases)}};
}
