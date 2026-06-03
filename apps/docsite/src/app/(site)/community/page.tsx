// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Astryx community page — channels + contribution paths + live
 * contributors.
 *
 * Three roles in one page (modeled after how Astro, Svelte, and
 * GitHub Primer balance the same trio):
 *
 *   1. Channels   — where the community talks (GitHub Discussions,
 *      Issues, Wiki). Above the fold.
 *   2. Contribute — how to land code (visual stepper for the RFC
 *      process, plus "Start Here" no-RFC paths with effort
 *      estimates so first-timers can pick a small win).
 *   3. People     — live contributors grid pulled from GitHub.
 *
 * Resources (long-form guides, conventions, dev setup) live as a
 * compact link list near the end. Code of Conduct + License sit
 * in a small footer row so they don't compete with contribution
 * paths for visual weight.
 *
 * Note: "XDS" still appears in component names (XDSCard, XDSText,
 * etc.) and package paths (@xds/core, @xds/lab) — those are
 * identifiers, not the product name. The product brand in copy
 * is Astryx.
 */

import {FileText, Scale} from 'lucide-react';
import {NavSurfaceMode} from './NavSurfaceMode';
import * as stylex from '@stylexjs/stylex';
import {XDSCard} from '@xds/core/Card';
import {XDSClickableCard} from '@xds/core/ClickableCard';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSLink} from '@xds/core/Link';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSSection} from '@xds/core/Section';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {GITHUB_REPO} from '../../../constants';

const WIKI_BASE = `${GITHUB_REPO}/wiki`;

// =============================================================================
// Styles
// =============================================================================

// Page max-width. Sized for the 3-card grids (channels, start-
// here paths, contributors) to read comfortably without going
// edge-to-edge on wide viewports. Matches the dedicated theme
// page width so the two sibling pages feel visually aligned.
const PAGE_MAX_WIDTH = 1200;

const styles = stylex.create({
  // Wrap the section so it caps at PAGE_MAX_WIDTH and centers in
  // the viewport. Done on a plain wrapper instead of via the
  // section's maxWidth prop because XDSSection's negative-inline-
  // margin styles (used to break out of container padding
  // elsewhere) beat any margin-inline:auto we try to set on the
  // section itself. Same pattern used on /themes.
  pageWrap: {
    maxWidth: PAGE_MAX_WIDTH,
    marginInline: 'auto',
    width: '100%',
  },
  // Vertical stack of top-level page sections. XDSVStack's gap
  // prop tops out at step 10 (= --spacing-10 = 40px), which is
  // too tight for this editorial page. Roll our own flex column
  // with calc(var(--spacing-12) * 2) = 96px — same pattern the
  // home page uses for its major-section gaps (see
  // apps/docsite/src/app/(site)/page.tsx showcaseOverlay rule)
  // so the two pages share consistent editorial pacing.
  sectionStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing-12) * 2)',
    // Cap all top-level sections at a centered reading column
    // so every section (Hero, Wall, How we build, Engage,
    // Resources) shares one consistent visual column down the
    // middle of the page instead of each section finding its
    // own width.
    maxWidth: 920,
    width: '100%',
    marginInline: 'auto',
    // Add the same section gap as bottom padding so the
    // Resources → footer break feels like another section gap
    // (96px) rather than abruptly hitting the footer with only
    // the XDSSection's 24px padding underneath.
    paddingBlockEnd: 'calc(var(--spacing-12) * 2)',
  },
  // Hero group — wraps the "Build with us" hero row + the wall
  // card below it as one unit inside the section stack. Tight
  // internal gap (spacing-4) so they read as one cohesive
  // hero/intro chapter rather than two separate sections; the
  // parent sectionStack's larger 96px gap then separates this
  // group from the rest of the page.
  heroGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },

  // Hero row — title + tagline on the left, two CTAs on the
  // right, all on a single line at wide widths. Stacks
  // vertically (and the CTAs left-align under the text) on
  // narrow viewports so neither side gets squished.
  //
  // alignItems flips between modes: `flex-end` at wide widths
  // so the CTAs sit on the same baseline as the bottom of the
  // tagline (instead of vertically centered against the full
  // title+tagline block), and `flex-start` when stacked so the
  // CTAs left-align under the text in the standard top-down
  // flow.
  heroRow: {
    display: 'flex',
    flexDirection: {
      default: 'row',
      '@media (max-width: 760px)': 'column',
    },
    alignItems: {
      default: 'flex-end',
      '@media (max-width: 760px)': 'flex-start',
    },
    justifyContent: 'space-between',
    gap: 'var(--spacing-6)',
  },
  // Left side of the hero row: tight title + tagline stack.
  // Capped at 480px so the tagline wraps before reaching the
  // CTA column on the right.
  heroText: {
    maxWidth: 480,
    minWidth: 0,
  },

  // -------------------------------------------------------------------------
  // ContributingSection — combined process + types layout
  // -------------------------------------------------------------------------
  // Two-column section: vertical numbered process list on the left
  // (1/3 width), 2×2 grid of contribution-type cards on the right
  // (2/3 width). Stacks vertically on narrow viewports.

  contribRow: {
    display: 'flex',
    flexDirection: {
      default: 'row',
      '@media (max-width: 900px)': 'column',
    },
    gap: 'var(--spacing-6)',
    alignItems: 'flex-start',
  },
  // Left column: process list. flex 1 ratio combined with right
  // column's flex 2 yields the 1:2 split.
  contribProcess: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  // Right column: 2×2 card grid wrapper. Same 2-of-3 share at
  // wide widths; collapses to a single column on the same
  // breakpoint where the section stacks.
  contribTypes: {
    flex: '2 1 0',
    minWidth: 0,
    width: '100%',
  },

  // Individual process row: number + content side-by-side.
  // Compact gap; gap={5} between rows in the parent column gives
  // each row plenty of separation without needing dividers.
  processStep: {
    display: 'flex',
    flexDirection: 'row',
    gap: 'var(--spacing-3)',
    alignItems: 'flex-start',
  },
  // Big monospace step number ("01", "02", …) — sized large
  // enough to anchor the row visually, but kept in the secondary
  // text color so it reads as metadata, not as a primary number.
  processStepNumber: {
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--text-body-size, 14px)',
    fontWeight: 'var(--font-weight-semibold, 600)',
    flexShrink: 0,
    minWidth: 28,
    paddingTop: 2,
  },

  // -------------------------------------------------------------------------
  // WallCard — the big wordmark + scattered contributor faces card
  // -------------------------------------------------------------------------
  // Sits directly below the hero row. Multicolored Astryx wordmark
  // floats in the center; contributor avatars are scattered
  // (overlapping circles) above and below it like a community
  // "wall". The "See contributors" link below opens the full
  // GitHub contributors page in a new tab.

  wallCard: {
    // position:relative is load-bearing — without it, the inner
    // wallAvatarLayer (which uses position:absolute + inset:0
    // to fill the card area) escapes to the nearest positioned
    // ancestor and the avatars scatter across the whole page
    // instead of staying inside the wall card. XDSCard's root
    // doesn't set position by default, so we set it here.
    position: 'relative',
    backgroundColor: 'var(--color-background-body)',
    borderColor: 'transparent',
    paddingBlock: 'var(--spacing-12)',
    paddingInline: 'var(--spacing-6)',
    overflow: 'hidden',
    minHeight: 280,
  },
  // Inner column inside the wall card — centers the wordmark +
  // "See contributors" link inside the card's full content
  // width AND full content height, with avatars overlaid
  // absolutely on the surrounding empty space.
  //
  // width:100% + height:100% are both load-bearing:
  //   width:100% so the flex column spans the card's full width
  //     (without it the column shrinks to the wordmark's width
  //     and the children look "locally centered" but the whole
  //     column hugs the left edge of the card).
  //   height:100% so justifyContent:center has a tall column to
  //     center inside (without it the column shrinks to the
  //     content's natural height and content sits at the top of
  //     the card with empty space below).
  wallCardCenter: {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-3)',
  },
  // Multicolor Astryx wordmark — sized large so it's clearly
  // the centerpiece. Height controls the SVG; width auto
  // preserves the natural ~6.5:1 aspect ratio.
  wallWordmark: {
    height: 56,
    width: 'auto',
    display: 'block',
    position: 'relative',
    zIndex: 1,
  },
  // The "See contributors" anchor link below the wordmark.
  // Plain text styling so the wordmark stays dominant; sits
  // above the scattered avatars in z-order via zIndex 1.
  wallSeeContributors: {
    position: 'relative',
    zIndex: 1,
    color: 'var(--color-text-secondary)',
    textDecoration: 'underline',
    textUnderlineOffset: '4px',
    fontSize: 'var(--text-supporting-size, 13px)',
  },
  // Description line between the wordmark and the "See
  // contributors" link. Capped at ~440px so the line wraps to
  // two comfortable lines centered against the wordmark above.
  // Same z-index as the wordmark so the surrounding scattered
  // avatars don't cover the copy.
  wallDescription: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 480,
    textAlign: 'center' as const,
  },
  // Scattered avatar grid layer — absolutely positioned to
  // occupy the wall card's full area. pointer-events:none so
  // hover/click pass through to the underlying card surface.
  wallAvatarLayer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
  },
  // Individual scattered avatar — circular, fixed size, with
  // a slight border so it reads as a distinct face against the
  // muted card background regardless of avatar tone.
  //
  // transform: translate(-50%, -50%) shifts the avatar so its
  // CENTER sits at the inline (top, left) coordinates, not its
  // top-left corner. Lets us position avatars by where their
  // middle should be — combined with safe-range percentages in
  // AVATAR_SLOTS, this guarantees every avatar stays fully
  // contained inside the card with no clipping at the edges.
  wallAvatar: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 12,
    objectFit: 'cover' as const,
    // Rotation is applied per-tile inline (see AVATAR_SLOTS
    // below) so each face has its own slight tilt. Combine
    // with translate(-50%, -50%) so the slot coordinates still
    // refer to the avatar's center.
  },

  // -------------------------------------------------------------------------
  // EndBlock — Poliform-style "end of page" block
  // -------------------------------------------------------------------------
  // Fuses Channels + References + Legal links into one cohesive
  // bottom-of-page treatment. Two visual rows: an editorial
  // header (headline + paragraph on the left, brand-shape
  // composition on the right) on top, then a 3-column link list
  // below it (Channels / References / Legal). A big "astryx"
  // wordmark anchors the bottom-right corner.

  // Outer block — generous vertical padding so the end-of-page
  // moment reads as a deliberate visual chapter, not just more
  // content. position:relative kept in case any descendant needs
  // a positioning ancestor. No paddingBlock here — vertical
  // spacing between sections is owned uniformly by the parent
  // XDSVStack gap, so every section has the same breathing room.
  // No overflow:hidden so the hover backdrop on each resource
  // row can paint into its negative-margin bleed zone without
  // getting clipped.
  endBlock: {
    position: 'relative',
  },
  // Top editorial row — headline + paragraph on the left,
  // brand-shape composition on the right. 1:1 split at wide
  // widths; stacks vertically at <760px.
  // Editorial header — centered headline + description on top
  // (spans full width); the 3-column channel-card grid sits
  // below it. Centered text contrasts with the rest of the page's
  // left-aligned section headings and frames the channel grid
  // like the reference's "Newest Collection" product layout.
  endBlockHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-8)',
  },
  endBlockHeaderText: {
    textAlign: 'center' as const,
    maxWidth: 680,
  },

  // 3-column channel grid below the centered editorial header.
  // Auto-fit with a generous minWidth so columns stay readable
  // and reflow gracefully to 2 / 1 columns on narrower viewports.
  channelGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 'var(--spacing-6)',
    width: '100%',
    '@media (max-width: 760px)': {
      gridTemplateColumns: '1fr',
    },
  },

  // Single channel card — tall pastel-filled block with title
  // anchored to the top-left and description anchored to the
  // bottom-left, leaving a generous open middle. The whole card
  // is the click target via XDSClickableCard with its default
  // border zeroed (the pastel fill carries the visual identity).
  channelCard: {
    overflow: 'hidden',
    borderColor: 'transparent',
    // Each card gets its color via inline style based on the
    // channel data (see CHANNELS.bgColor). Done inline so the
    // shared style here stays color-agnostic.
  },
  // Tall portrait inner stack — XDSVStack handles direction +
  // gap + vAlign:between (so title pins to top and description
  // pins to bottom). aspectRatio drives the portrait shape.
  channelCardInner: {
    aspectRatio: '4 / 5',
  },
  // Resources section below the editorial header — two XDSList
  // groups (Documentation + Legal) side-by-side under one shared
  // section heading. Sub-stacks reflow to a single column under
  // 760px.
  endBlockResources: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
    // Match the parent sectionStack's calc(var(--spacing-12) * 2)
    // = 96px so the Engage → Resources gap inside the end block
    // reads the same as the gaps between all the other top-level
    // sections on the page.
    paddingBlockStart: 'calc(var(--spacing-12) * 2)',
  },
  endBlockResourcesGrid: {
    display: 'grid',
    // minmax(0, 1fr) is load-bearing — without it, columns
    // refuse to shrink below their content's min-content width
    // (long resource titles like "How we settle design
    // disagreements..."), which forces the whole grid to
    // overflow its parent. minmax(0, 1fr) lets columns shrink
    // to whatever the parent allows, so the grid stays within
    // the parent's bounds and descriptions wrap normally.
    gridTemplateColumns: {
      default: 'repeat(3, minmax(0, 1fr))',
      '@media (max-width: 900px)': 'repeat(2, minmax(0, 1fr))',
      '@media (max-width: 600px)': '1fr',
    },
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    // Optical alignment shift: pull the grid left by the
    // XDSListItem's internal start padding (~12px = --spacing-3)
    // so the leading icon glyph of each row optically aligns
    // with the "Resources" section heading's left edge above.
    // Same width compensation as the wall-card alignment trick
    // earlier — content shifts left, total grid width grows by
    // the same amount on the right so the rightmost column
    // doesn't lose space.
    marginInlineStart: 'calc(-1 * var(--spacing-3))',
    width: 'calc(100% + var(--spacing-3))',
  },
  // -------------------------------------------------------------------------
  // BlockCard — color-blocked contribution-type cards
  // -------------------------------------------------------------------------
  // 4 quadrants of a single grouped block (see blockGrid below).
  // Each quadrant has a soft pastel fill, a big heading anchored
  // to bottom-left, an effort badge under the heading, and a
  // small arrow chip anchored to bottom-right. Each quadrant is
  // still its own click target via XDSClickableCard, but visually
  // they read as one grouped object because the outer blockGrid
  // clips to a single rounded shape with no gap between cells.

  // Outer grid wrapper — fuses the 4 quadrants into one visual
  // block. radius + overflow:hidden on the wrapper means each
  // quadrant's individual sharp corners get clipped to the
  // wrapper's rounded outer shape. No gap so the 4 pastel fills
  // touch directly at the inner seams.
  blockGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: 0,
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
  },

  // Outer card — no padding (the inner zones manage their own
  // spacing). overflow:hidden so the white placeholder's rounded
  // corners (set via inset spacing on blockCardImage instead of
  // a radius) clip cleanly to the card's quadrant edge.
  blockCard: {
    position: 'relative',
    overflow: 'hidden',
    borderColor: 'transparent',
    borderRadius: 0,
    color: 'var(--color-text-primary)',
    minHeight: 280,
    display: 'flex',
    flexDirection: 'column',
  },
  // White placeholder image area above the title. Uses
  // --color-background-card (theme-aware lifted tone, usually
  // white) so it reads as a distinct content slot against the
  // card's body-tone fill. Inset slightly from the card edges
  // (via margin) so it reads as a contained content slot rather
  // than touching the quadrant seams.
  blockCardImage: {
    flex: '1 1 auto',
    minHeight: 100,
    backgroundColor: 'var(--color-background-card)',
    borderRadius: 'var(--radius-container)',
    margin: 'var(--spacing-5)',
    marginBottom: 0,
  },
  // Bottom-anchored title + effort badge cluster. Padding lives
  // here (not on the outer card) so the placeholder image above
  // can be inset independently from the card edges.
  blockCardBottom: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
    padding: 'var(--spacing-5)',
  },
  // Heading uses --color-text-primary — the card backgrounds
  // are alpha-tinted pastels (--color-background-{hue} resolves
  // to the hue at ~20% opacity), so the underlying body color
  // shows through enough that the standard dark text color
  // reads cleanly.
  blockCardTitle: {
    color: 'var(--color-text-primary)',
  },
  // Effort badge — a quiet inline pill under the heading.
  blockCardEffort: {
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--text-supporting-size, 13px)',
  },
});

// =============================================================================
// WallCard — multicolored Astryx wordmark + scattered contributor faces
// =============================================================================
//
// Sits between the hero row and the channels grid. Plays the
// social-proof role: shows real contributor faces scattered around
// a centerpiece wordmark, with a quiet link to the full
// contributors section below.
//
// Avatars are positioned via fixed percentage offsets (not
// randomized) so SSR markup is deterministic — same positions on
// the server and the client, no hydration mismatch.

// Avatar slot positions inside the wall card. Coordinates are
// the CENTER of each avatar (the inline transform combines
// translate(-50%, -50%) with the per-slot rotation), so every
// value pair represents "where should the middle of this avatar
// sit, as a % of the card area". Values stay within 8%-92% on
// each axis so the 48px avatar never reaches the card edge.
//
// Each slot carries its own rotation (~±3-6°) so the row of
// tiles reads as a hand-scattered grid rather than a perfectly
// aligned strip — matches the Pallet Ross-style scattered
// avatar pattern. Rotations alternate sign per tile (left, right,
// left, right…) so adjacent tiles balance each other visually.
//
// Layout: two horizontal bands (top + bottom) with a clear
// channel through the middle where the wordmark sits.
const AVATAR_SLOTS: ReadonlyArray<{
  top: string;
  left: string;
  rotate: number;
}> = [
  // Top band — pushed up to ~6-12% from the top edge so the
  // tiles sit clearly above the logo's cap height with room to
  // breathe, not crowding the headline.
  {top: '10%', left: '8%', rotate: -5},
  {top: '6%', left: '24%', rotate: 3},
  {top: '12%', left: '40%', rotate: -4},
  {top: '8%', left: '60%', rotate: 5},
  {top: '11%', left: '76%', rotate: -3},
  {top: '6%', left: '92%', rotate: 6},
  // Bottom band — symmetric inset (~6-12% from the bottom
  // edge) so the two bands balance visually.
  {top: '88%', left: '8%', rotate: 4},
  {top: '92%', left: '24%', rotate: -6},
  {top: '86%', left: '40%', rotate: 3},
  {top: '90%', left: '60%', rotate: -4},
  {top: '88%', left: '76%', rotate: 5},
  {top: '94%', left: '92%', rotate: -3},
];

// Fallback portrait images from Unsplash. Each URL is a stable
// permalink to a specific Unsplash photo cropped to 80×80, faces-
// centered. Used when the GitHub contributors API hasn't
// populated yet, fails, or returns fewer faces than there are
// avatar slots. The mix of subjects deliberately avoids reading
// as a single demographic — the goal is "a community", not "one
// team photo".
const FALLBACK_AVATARS: ReadonlyArray<string> = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=80&h=80&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&h=80&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=80&h=80&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=faces',
];

function WallCard({contributors}: {contributors: ReadonlyArray<Contributor>}) {
  // Build the visible avatar list by walking each slot and
  // pulling a real GitHub contributor avatar if available,
  // otherwise reaching for the Unsplash fallback at the same
  // index. End result: real faces appear first (most prolific
  // contributor in slot 0), then placeholders fill out the
  // remaining slots so the card always looks fully populated.
  const avatars = AVATAR_SLOTS.map((slot, i) => ({
    src: contributors[i]?.avatar_url ?? FALLBACK_AVATARS[i],
    key: contributors[i]?.login ?? `fallback-${i}`,
    slot,
  }));

  return (
    <XDSCard padding={0} xstyle={styles.wallCard}>
      <div {...stylex.props(styles.wallAvatarLayer)} aria-hidden="true">
        {avatars.map(({src, key, slot}) => (
          <img
            key={key}
            src={src}
            alt=""
            {...stylex.props(styles.wallAvatar)}
            style={{
              top: slot.top,
              left: slot.left,
              // Single transform combining centering and tilt.
              // translate runs first (positions the tile on its
              // center coordinates), rotate runs second (tilts
              // around the now-centered tile origin).
              transform: `translate(-50%, -50%) rotate(${slot.rotate}deg)`,
            }}
          />
        ))}
      </div>
      <div {...stylex.props(styles.wallCardCenter)}>
        <img
          src="/astryx-logo.svg"
          alt="Astryx"
          {...stylex.props(styles.wallWordmark)}
        />
        <XDSText type="body" color="secondary" xstyle={styles.wallDescription}>
          A growing community of designers and engineers ship Astryx together.
          <br />
          Your name could be next.
        </XDSText>
        <XDSLink
          label="See contributors"
          href={`${GITHUB_REPO}/graphs/contributors`}
          target="_blank"
          xstyle={styles.wallSeeContributors}>
          See contributors
        </XDSLink>
      </div>
    </XDSCard>
  );
}

// =============================================================================
// BlockCard — color-blocked contribution-type card
// =============================================================================

interface BlockCardProps {
  label: string;
  description: string;
  href: string;
  /** Soft pastel background (--color-background-{hue}). */
  bgColor: string;
  badge?: string;
}

function BlockCard({label, description, href, bgColor, badge}: BlockCardProps) {
  return (
    <XDSClickableCard
      label={`Open ${label}`}
      href={href}
      padding={0}
      xstyle={styles.blockCard}
      style={{backgroundColor: bgColor}}>
      {/* White placeholder image slot above the title — empty for
          now; later this can hold a real preview image, an
          illustration, or a contextual screenshot per card. */}
      <div {...stylex.props(styles.blockCardImage)} aria-hidden="true" />
      <div {...stylex.props(styles.blockCardBottom)}>
        <XDSHeading level={3} xstyle={styles.blockCardTitle}>
          {label}
        </XDSHeading>
        <XDSText type="supporting" xstyle={styles.blockCardEffort}>
          {description}
        </XDSText>
        {badge && (
          <XDSText type="supporting" xstyle={styles.blockCardEffort}>
            {badge}
          </XDSText>
        )}
      </div>
    </XDSClickableCard>
  );
}

// =============================================================================
// Data
// =============================================================================

// Channels — where the community talks. Each entry renders as one
// rich card in the channels grid. Tint is hand-assigned per card
// so the row has visual variety; keep this list short (3–5 max)
// so each option feels like a deliberate path, not a link dump.
interface Channel {
  name: string;
  description: string;
  href: string;
  /** XDSClickableCard color variant — uses XDS's built-in
   * categorical color variants (the XDS-correct way to color a
   * card; inline `style={{backgroundColor}}` is silently
   * dropped by XDSClickableCard, which only honors its own
   * `variant` prop for backgrounds). */
  variant: 'yellow' | 'green' | 'blue';
}

const CHANNELS: ReadonlyArray<Channel> = [
  {
    name: 'GitHub Discussions',
    description:
      'Ask questions, share what you built, and talk through ideas with the maintainers.',
    href: `${GITHUB_REPO}/discussions`,
    variant: 'yellow',
  },
  {
    name: 'GitHub Issues',
    description:
      'File bugs and feature requests. Triaged weekly with response within a few days.',
    href: `${GITHUB_REPO}/issues`,
    variant: 'green',
  },
  {
    name: 'Wiki & Decisions',
    description:
      'Architecture decisions, API conventions, and research notes from how Astryx gets built.',
    href: WIKI_BASE,
    variant: 'blue',
  },
];

// RFC stepper steps. The 4th step ("Graduate to core") is the
// missing piece the previous 3-step grid never showed; surfacing
// it makes the "from idea to shipped" journey complete.
interface StepperStep {
  number: string;
  title: string;
  description: string;
}

const RFC_STEPS: ReadonlyArray<StepperStep> = [
  {
    number: '01',
    title: 'Share a proposal',
    description:
      'Describe the problem you ran into and what you think should change. We respond within a week.',
  },
  {
    number: '02',
    title: 'Shape it together',
    description:
      'We co-explore research, use cases, and design options until the right shape becomes obvious.',
  },
  {
    number: '03',
    title: 'Ship it experimentally',
    description:
      'New components ship in @xds/lab first, where the team and real users put them through their paces.',
  },
  {
    number: '04',
    title: 'Make it official',
    description:
      'Once battle-tested and refined, the work graduates from @xds/lab into @xds/core for everyone to use.',
  },
];

// Start Here paths — no RFC needed. Each carries an effort badge
// so first-timers can pick a small win that fits their afternoon.
// Estimates are deliberate ranges, not point values, since
// scoping varies per contribution.
interface StartHerePath {
  title: string;
  description: string;
  href: string;
  effort: string;
  /** Card fill color — the soft pastel --color-background-{hue}
   * (categorical badge backdrop). Resolves to the hue at ~20%
   * alpha, so the body color shows through. */
  bgColor: string;
}

const START_HERE: ReadonlyArray<StartHerePath> = [
  {
    title: 'Fix a bug',
    description:
      'Spot something broken? File an issue to confirm it, then submit a change with a clear reproduction.',
    href: `${GITHUB_REPO}/issues/new?template=bug.yml`,
    effort: '~2 hours',
    bgColor: 'var(--color-background-body)',
  },
  {
    title: 'Improve the docs',
    description:
      'Fix typos, improve examples, fill gaps. Reviewed for correctness — precision over comprehensiveness.',
    href: '/docs',
    effort: '~30 min',
    bgColor: 'var(--color-background-body)',
  },
  {
    title: 'Add a template',
    description:
      'Show components in realistic context. Templates are training signal for both humans and LLMs.',
    href: `${WIKI_BASE}/Contributing-Templates`,
    effort: '~half day',
    bgColor: 'var(--color-background-body)',
  },
  {
    title: 'Build a theme',
    description:
      'Full visual control through defineTheme() — tokens, component overrides, and mode switching.',
    href: '/docs/theme',
    effort: '~1 day',
    bgColor: 'var(--color-background-body)',
  },
];

// Long-form references — guides, conventions, dev setup. Rendered
// as a compact link list (not cards) because they're references,
// not action paths. Visual weight matches their navigational role.
interface Resource {
  title: string;
  description: string;
  href: string;
  /** Lucide icon component rendered in each resource row's
   * startContent slot. Docs entries use FileText; legal/policy
   * entries use Scale. */
  icon: React.ComponentType<{size?: number}>;
}

const RESOURCES: ReadonlyArray<Resource> = [
  {
    title: 'Contributing Guide',
    description:
      'The full process, what we accept, and how proposals get reviewed.',
    href: `${WIKI_BASE}/Contributing`,
    icon: FileText,
  },
  {
    title: 'Contributing with AI',
    description:
      'Using AI assistants effectively within Astryx conventions — safe zones and common pitfalls.',
    href: `${WIKI_BASE}/Contributing-with-AI-Assistants`,
    icon: FileText,
  },
  {
    title: 'API Conventions',
    description:
      'How components in Astryx are named, shaped, and composed. Worth a skim before sharing a proposal.',
    href: `${WIKI_BASE}/API-Conventions`,
    icon: FileText,
  },
  {
    title: 'API Arbitration',
    description:
      'How we settle design disagreements using vibe testing. Includes a sample prompt you can borrow.',
    href: `${WIKI_BASE}/API-Arbitration`,
    icon: FileText,
  },
  {
    title: 'Dev Setup',
    description: 'Clone, install, build, and run Storybook locally.',
    href: `${GITHUB_REPO}/blob/main/CONTRIBUTING.md`,
    icon: FileText,
  },
];

// Legal resources — same Resource shape as documentation above,
// just with a different icon to visually distinguish policy
// entries from long-form guides.
const LEGAL_RESOURCES: ReadonlyArray<Resource> = [
  {
    title: 'Code of Conduct',
    description:
      'Our standards for respectful collaboration and how we handle reports.',
    href: `${GITHUB_REPO}/blob/main/CODE_OF_CONDUCT.md`,
    icon: Scale,
  },
  {
    title: 'MIT License',
    description: 'Astryx is open source under the MIT License — free to use.',
    href: `${GITHUB_REPO}/blob/main/LICENSE`,
    icon: Scale,
  },
];

// =============================================================================
// Live data
// =============================================================================

interface Contributor {
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
}

// Public-repo proxy for the real Astryx contributor list. The
// canonical repo (facebookexperimental/xds) is private, so
// GitHub's unauthenticated /contributors endpoint returns 404
// and the wall card falls back to Unsplash placeholders. Until
// Astryx open-sources, point at facebook/stylex — it's the
// public foundation Astryx is built on, shares several Meta
// engineers, and serves as a reasonable proxy for "people
// shipping the Astryx ecosystem". Swap the URL back to the
// xds repo once it goes public.
async function fetchContributors(): Promise<Contributor[]> {
  try {
    const res = await fetch(
      'https://api.github.com/repos/facebook/stylex/contributors?per_page=50',
      {next: {revalidate: 3600}},
    );
    if (!res.ok) {
      return [];
    }
    return res.json();
  } catch {
    return [];
  }
}

// =============================================================================
// Page
// =============================================================================

export default async function CommunityPage() {
  const contributors = await fetchContributors();

  return (
    <div {...stylex.props(styles.pageWrap)}>
      <NavSurfaceMode />
      <XDSSection padding={6}>
        <div {...stylex.props(styles.sectionStack)}>
          {/* Hero group — "Build with us" header row + the Astryx
              wall card below it. Wrapped together so they read as
              one cohesive intro chapter (tight internal gap),
              while the surrounding sectionStack still gives a
              large gap between this group and the next page
              section. */}
          <div {...stylex.props(styles.heroGroup)}>
            {/* Hero row — title + tagline left, two CTAs right,
                on a single line at wide widths. */}
            <div {...stylex.props(styles.heroRow)}>
              <XDSVStack gap={1} xstyle={styles.heroText}>
                <XDSHeading level={1} type="display-1" color="primary">
                  Build with us
                </XDSHeading>
                <XDSText type="body" size="base" color="secondary">
                  A friendly community of designers and engineers shaping the
                  system together.
                </XDSText>
              </XDSVStack>
              <XDSHStack gap={2} wrap="wrap">
                <XDSButton
                  variant="secondary"
                  size="md"
                  label="View Discussions"
                  href={`${GITHUB_REPO}/discussions`}
                />
                <XDSButton
                  variant="primary"
                  size="md"
                  label="Start Contributing"
                  href={`${WIKI_BASE}/Contributing`}
                />
              </XDSHStack>
            </div>

            {/* Wall card — multicolored Astryx wordmark in the
                center, scattered contributor avatars overlaid
                across the rest of the card. Functions as the
                social-proof centerpiece of the page: shows real
                people building Astryx without forcing users to
                scroll to the full contributor grid. */}
            <WallCard contributors={contributors} />
          </div>

          {/* How we build together — combined contribution section
            with the section heading + process on the LEFT
            (vertical numbered list) and the contribution types on
            the RIGHT (2×2 card grid). 1:2 column ratio at wide
            widths; stacks vertically at <900px. */}
          <div {...stylex.props(styles.contribRow)}>
            {/* Left column: section heading + description + the
              4-step process. Putting the heading inside the left
              column (instead of spanning the full section above)
              gives the left side a clear visual anchor and lets
              the card grid on the right start at the same top
              edge as the first step. */}
            <div {...stylex.props(styles.contribProcess)}>
              <XDSVStack gap={1}>
                <XDSHeading level={2} type="display-3">
                  How we build together
                </XDSHeading>
                <XDSText type="body" color="secondary">
                  Contributing to Astryx means contributing to the system, not
                  to a single component. Each step has a clear gate, so you
                  always know what comes next.
                </XDSText>
              </XDSVStack>
              {RFC_STEPS.map(step => (
                <div key={step.number} {...stylex.props(styles.processStep)}>
                  <span {...stylex.props(styles.processStepNumber)}>
                    {step.number}
                  </span>
                  <XDSVStack gap={1}>
                    <XDSHeading level={3}>{step.title}</XDSHeading>
                    <XDSText type="supporting" color="secondary">
                      {step.description}
                    </XDSText>
                  </XDSVStack>
                </div>
              ))}
            </div>
            {/* Right column: contribution-type cards as one fused
              2×2 quadrant block. Each quadrant is still its own
              click target via XDSClickableCard, but the colors
              touch directly at the inner seams (no gap, no
              divider) and the outer wrapper clips them to a
              single rounded shape so the four quadrants read as
              one grouped object. */}
            <div {...stylex.props(styles.contribTypes)}>
              <div {...stylex.props(styles.blockGrid)}>
                {START_HERE.map(path => (
                  <BlockCard
                    key={path.title}
                    label={path.title}
                    description={path.description}
                    href={path.href}
                    bgColor={path.bgColor}
                    badge={path.effort}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* End-of-page block — Poliform-style unified treatment
              that fuses Channels + References + Legal into one
              cohesive bottom-of-page chapter. Editorial header
              on top (headline + paragraph + brand-shape art);
              3-column link list below; giant "astryx" wordmark
              anchors the bottom-right corner. */}
          <div {...stylex.props(styles.endBlock)}>
            <div {...stylex.props(styles.endBlockHeader)}>
              <XDSVStack gap={3} xstyle={styles.endBlockHeaderText}>
                <XDSHeading level={2} type="display-2">
                  Engage with us in conversation
                </XDSHeading>
                <XDSText type="body" color="secondary">
                  In a global community built on shared craft, a system gets
                  better when its users open up to new perspectives. The
                  brightest minds shape Astryx together — pick a channel, read
                  the references, or just say hi.
                </XDSText>
              </XDSVStack>

              {/* 3-column channel grid — tall portrait cards with
                  a pastel categorical fill, title anchored top-
                  left, description anchored bottom-left, and a
                  generous open middle. Whole card is the click
                  target via XDSClickableCard. */}
              <div {...stylex.props(styles.channelGrid)}>
                {CHANNELS.map(channel => (
                  <XDSClickableCard
                    key={channel.name}
                    label={`Open ${channel.name}`}
                    href={channel.href}
                    target="_blank"
                    padding={6}
                    variant={channel.variant}
                    xstyle={styles.channelCard}>
                    <XDSVStack
                      gap={2}
                      vAlign="end"
                      height="100%"
                      xstyle={styles.channelCardInner}>
                      <XDSHeading level={3}>{channel.name}</XDSHeading>
                      <XDSText type="supporting" color="secondary">
                        {channel.description}
                      </XDSText>
                    </XDSVStack>
                  </XDSClickableCard>
                ))}
              </div>
            </div>

            {/* Resources — Documentation + Legal as two Pill
                sub-stacks under one shared section heading. Each
                pill is the same XDSClickableCard chrome the
                channels above use, so the whole bottom of the
                page shares one visual language. Documentation
                takes the wider column (it has 5 items); Legal
                sits to the right (2 items). */}
            <div {...stylex.props(styles.endBlockResources)}>
              <XDSVStack gap={1}>
                <XDSHeading level={2} type="display-2">
                  Resources
                </XDSHeading>
                <XDSText type="body" color="secondary">
                  Long-form guides, conventions, and policies. Skim what's
                  relevant before sharing a proposal, or come back when you need
                  to look something up.
                </XDSText>
              </XDSVStack>
              {/* All resources (docs + legal) flattened into one
                  list, then chunked into 3 column-groups so the
                  7 items flow as a 3 / 3 / 1 layout across the
                  3-column grid. Each chunk is its own XDSList so
                  items in a column stack vertically as one
                  logical list (rather than CSS-columns breaking
                  description text mid-item). */}
              <div {...stylex.props(styles.endBlockResourcesGrid)}>
                {(() => {
                  const allResources = [...RESOURCES, ...LEGAL_RESOURCES];
                  // Split into 3 chunks as evenly as possible.
                  // ceil(N/3) per chunk fills columns left-to-right.
                  const chunkSize = Math.ceil(allResources.length / 3);
                  const chunks: Resource[][] = [];
                  for (let i = 0; i < allResources.length; i += chunkSize) {
                    chunks.push(allResources.slice(i, i + chunkSize));
                  }
                  return chunks.map((chunk, columnIndex) => (
                    <XDSList key={columnIndex}>
                      {chunk.map(resource => {
                        const Icon = resource.icon;
                        return (
                          <XDSListItem
                            key={resource.title}
                            label={resource.title}
                            description={resource.description}
                            href={resource.href}
                            target="_blank"
                            startContent={<Icon size={20} />}
                          />
                        );
                      })}
                    </XDSList>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      </XDSSection>
    </div>
  );
}
