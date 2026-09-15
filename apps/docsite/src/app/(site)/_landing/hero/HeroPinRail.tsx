// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file HeroPinRail.tsx
 * @input one pinned hero layer as children
 * @output a hero-scope-sized containing block for it (≥1024px only)
 * @position Home hero — the box that lets the pinned layers be `sticky`
 *           rather than `fixed`.
 *
 * The desktop hero pins its art behind the showcase surface, which then scrolls
 * up over it (pin-and-cover). `fixed` is the obvious way to pin, but a fixed
 * layer is glued to the viewport and is NOT part of the document: when the
 * document rubber-bands past its own bottom edge, the layer does not lift with
 * it and paints in the exposed gap. That is what forced
 * `overscroll-behavior-y: none` onto `html` (#3032) and, until #5415 scoped it,
 * cost mobile its pull-to-refresh (#5392).
 *
 * `position: sticky` pins the same way but stays in the document, so it lifts
 * with the page and cannot paint below the document's own bottom edge — no
 * suppression rule needed. The catch is that sticky is clamped to its
 * containing block, and the pinned layers live inside the 760px hero band, so
 * on their own they would unpin the moment the band scrolls past.
 *
 * This rail is that containing block: `absolute; inset: 0` against `heroScope`
 * (hero + showcase), so a sticky child stays pinned for exactly as long as the
 * pin-and-cover effect runs, and releases where the opaque showcase already
 * covers it. Being absolute, the rail contributes no height — the document is
 * the same size with it as without, and `heroSpacer` goes on reserving the band.
 *
 * Below 1024px the rail is `display: contents`: it generates no box at all, so
 * the narrow hero lays out exactly as if it were not in the tree. Nothing pins
 * there — the mobile hero is taller than the viewport and scrolls away.
 *
 * ⚠️ Sticky dies silently if any ancestor becomes a scroll container. `fixed`
 * only broke on an ancestor `transform`/`filter`; `sticky` additionally breaks
 * on `overflow: hidden|auto|scroll`. `.astryx-layout-content` (AppShell) already
 * carries `overflow: clip`, which is safe — clip creates no scroll container —
 * but it is one property *value* away from un-pinning the whole landing page.
 */

import * as stylex from '@stylexjs/stylex';
import type {ReactNode} from 'react';

const styles = stylex.create({
  rail: {
    // <1024px: no box, so the narrow layout is untouched by the rail existing.
    display: {
      default: 'contents',
      '@media (min-width: 1024px)': 'block',
    },
    // heroScope is the nearest positioned ancestor, so inset:0 sizes the rail
    // to hero + showcase. Ignored while display is contents.
    position: {
      default: 'static',
      '@media (min-width: 1024px)': 'absolute',
    },
    inset: 0,
    // Purely a containing block — it must not swallow hover/clicks over the
    // hero gutters (which would pause the reel's auto-advance) or over the
    // showcase's rounded top corners. Layers that need input opt back in.
    pointerEvents: 'none',
  },
});

/** Bounds one pinned hero layer to `heroScope` so it can be `sticky`. */
export function HeroPinRail({children}: {children: ReactNode}) {
  return <div {...stylex.props(styles.rail)}>{children}</div>;
}
