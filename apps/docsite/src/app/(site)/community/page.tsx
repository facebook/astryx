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
 * Note: "XDS" still appears in component names (Card, Text,
 * etc.) and package paths (@xds/core, @xds/lab) — those are
 * identifiers, not the product name. The product brand in copy
 * is Astryx.
 */

import {FileText, Scale} from 'lucide-react';
import {NavSurfaceMode} from './NavSurfaceMode';
import * as stylex from '@stylexjs/stylex';
import {Card} from '@xds/core/Card';
import {ClickableCard} from '@xds/core/ClickableCard';
import {HStack, VStack} from '@xds/core/Layout';
import {Link} from '@xds/core/Link';
import {List, ListItem} from '@xds/core/List';
import {Section} from '@xds/core/Section';
import {Heading, Text} from '@xds/core/Text';
import {Button} from '@xds/core/Button';
import {getKey} from '@xds/core/utils';
import {AstryxLogo} from '../../../components/logos';
import {GITHUB_REPO} from '../../../constants';
import {layout} from '../../../layout.stylex';

const WIKI_BASE = `${GITHUB_REPO}/wiki`;

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  // Wrap the section so it caps at the shared content width and
  // centers in the viewport. Done on a plain wrapper instead of via
  // the section's maxWidth prop because Section's negative-inline-
  // margin styles (used to break out of container padding elsewhere)
  // beat any margin-inline:auto we try to set on the section itself.
  // Same pattern used on /themes.
  pageWrap: {
    maxWidth: layout.contentMaxWidth,
    marginInline: 'auto',
    width: '100%',
  },
  // Vertical stack of top-level page sections. VStack's gap
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
    // own width. Matches the 1200px max-width used by the home
    // page's section grids (FeaturesShowcase, AboutShowcase,
    // DiscoverShowcase) so the two pages feel visually aligned.
    maxWidth: layout.contentMaxWidth,
    width: '100%',
    marginInline: 'auto',
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
  // Step number column ("01", "02", …) — kept in the secondary
  // text color via Text props; tabular-nums keeps the
  // two-digit numbers vertically aligned across rows. Min-width
  // reserves space for two digits + a hairline of breathing room
  // so the column doesn't shift between "01" and "10".
  processStepNumber: {
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
    minWidth: 28,
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
    // instead of staying inside the wall card. Card's root
    // doesn't set position by default, so we set it here.
    //
    // isolation:isolate establishes a NEW stacking context here
    // so the inner z-indexed children (wordmark, avatars, link)
    // stack ONLY against each other inside this card, never
    // against ancestors. Without it the children compete with
    // the AppShell's sticky top nav (also at zIndex:1) when
    // scrolled, causing the wordmark to render above the nav.
    isolation: 'isolate',
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
    // AstryxLogo paints with currentColor, so the brand mark renders
    // in the brand blue.
    color: 'var(--color-brand)',
  },
  // The "See contributors" anchor link below the wordmark.
  // Only positioning lives here (zIndex:1 keeps the link above
  // the scattered avatar layer); typography + color come from
  // the Link type="supporting" + color="secondary" props.
  wallSeeContributors: {
    position: 'relative',
    zIndex: 1,
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
    borderRadius: 'var(--radius-element)',
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
  // VStack gap, so every section has the same breathing room.
  // No overflow:hidden so the hover backdrop on each resource
  // row can paint into its negative-margin bleed zone without
  // getting clipped.
  endBlock: {
    position: 'relative',
  },
  // Top editorial row — headline + paragraph on the left,
  // brand-shape composition on the right. 1:1 split at wide
  // widths; stacks vertically at <760px.
  // Editorial header text styles — applied to the heading + intro
  // paragraph stack at the top of the Resources block.
  endBlockHeaderText: {
    maxWidth: 680,
  },
  // Resources block — editorial header + categorized resource
  // grid, stacked vertically.
  endBlockResources: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-8)',
  },
  // Each resource category wraps its eyebrow label + items in a
  // small vertical stack so the label optically aligns with the
  // list's leading icon glyph below.
  resourceColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    minWidth: 0,
  },
  // List wrapper inside each category — turned into a 3-column
  // grid so items render as a balanced row instead of a tall
  // vertical strip. <ul> + <li> grid directly (the <li> children
  // become grid cells). Collapses to 2 cols on tablet, 1 on mobile.
  // The optical alignment shift pulls items left by the ListItem's
  // internal start padding (≈ 12px = --spacing-3) so the row icons
  // sit flush with the page's left reading rail and the category
  // eyebrow label above.
  resourceList: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(3, minmax(0, 1fr))',
      '@media (max-width: 900px)': 'repeat(2, minmax(0, 1fr))',
      '@media (max-width: 600px)': '1fr',
    },
    gap: 'var(--spacing-2) var(--spacing-6)',
    marginInlineStart: 'calc(-1 * var(--spacing-3))',
    width: 'calc(100% + var(--spacing-3))',
  },
  // Icon tile — wraps each resource row's leading glyph in a
  // square rounded background so the icon reads as a deliberately
  // anchored element rather than a floating glyph next to the
  // text. Uses the subtle "muted" surface so the tile recedes
  // and the icon itself stays the focal point. Sized to match the
  // height of a 2-line description so the tile vertically centers
  // against the label/description block.
  iconTile: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 'var(--radius-element)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-primary)',
    flexShrink: 0,
  },
  // Resource description text — clamped to 2 lines so short
  // descriptions render naturally on 1 line and longer ones wrap
  // to 2 lines (anything beyond gets a "…" ellipsis). Prevents
  // both the mid-character single-line truncation that Item
  // defaults to on string descriptions AND prevents long
  // descriptions from running 4+ lines and breaking the visual
  // rhythm of the grid.
  resourceDescription: {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Vertical stack of resource categories. Each category fills
  // the full reading column width with its eyebrow label + list
  // of items, and categories stack one after the other so the
  // reading order is unambiguous (instead of wrapping into 3 grid
  // columns that left awkward empty cells when categories had
  // different item counts). The List inside still gets the
  // optical-alignment shift so list items sit flush with the
  // page's left reading rail.
  endBlockResourcesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-8)',
    width: '100%',
  },
  // -------------------------------------------------------------------------
  // BlockCard — feature-card-style contribution paths
  // -------------------------------------------------------------------------
  // Mirrors the home page's FeaturesShowcase cards (see
  // apps/docsite/src/app/(site)/_landing/FeaturesShowcase.tsx).
  // Each card is independent (no fused quadrant block), with
  // text + Explore link at the top and an optional image
  // bottom-anchored with bleed margins so the artwork renders
  // at natural aspect ratio without cropping.

  // 2-column grid. Independent cards size to their own content;
  // grid uses auto rows so cards never get stretched to absurd
  // heights to match a tall neighbor.
  blockGrid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(2, 1fr)',
      '@media (max-width: 720px)': '1fr',
    },
    gap: 'var(--spacing-4)',
    width: '100%',
  },

  // Individual card chrome — overflow:hidden lets the bleeding
  // image (negative margin) clip cleanly at the rounded corners.
  // height:100% so cards in the same grid row stretch to the
  // tallest one (grid default), keeping the row visually aligned.
  blockCard: {
    height: '100%',
    overflow: 'hidden',
  },
  // Inner VStack of the card — height:100% so the auto margins
  // on the image wrapper below have a known parent height to
  // push against, anchoring images to the card's bottom.
  blockCardStack: {
    height: '100%',
  },
  // Explore link spacing — adds the extra +12px past the 4px
  // stack gap to land at 16px between the description and the
  // link (same treatment as the home page feature cards).
  blockCardExplore: {
    marginTop: 'calc(var(--spacing-3))',
  },
  // Image wrapper — bottom-anchored via marginTop:auto so text
  // stays at the top of the card and the image floats to the
  // bottom. paddingTop:16 guarantees a 16px gap between the
  // Explore link and the image content above. Negative margins
  // (start/end/bottom) bleed the image to within 16px of the
  // card's outer edges, matching the home page's bleed treatment.
  blockCardImage: {
    marginTop: 'auto',
    paddingTop: 16,
    marginBottom: 'calc(var(--spacing-5) * -1)',
    marginInlineStart: 'calc(var(--spacing-5) * -1)',
    marginInlineEnd: 'calc(var(--spacing-5) * -1)',
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  // Image element — full container width, natural height so each
  // composition renders at its own proportions (no cropping, no
  // distortion). Same approach the home page uses.
  blockCardImageImg: {
    width: '100%',
    height: 'auto',
    display: 'block',
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
    key: getKey(contributors[i]?.login, i),
    slot,
  }));

  return (
    <Card padding={0} xstyle={styles.wallCard}>
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
        <AstryxLogo
          role="img"
          aria-label="Astryx"
          {...stylex.props(styles.wallWordmark)}
        />
        <Text type="body" color="primary" xstyle={styles.wallDescription}>
          A growing community of designers and engineers ship Astryx together.
          <br />
          Your name could be next.
        </Text>
        <Link
          label="See contributors"
          href={`${GITHUB_REPO}/graphs/contributors`}
          target="_blank"
          type="supporting"
          color="secondary"
          hasUnderline
          xstyle={styles.wallSeeContributors}>
          See contributors
        </Link>
      </div>
    </Card>
  );
}

// =============================================================================
// BlockCard — color-blocked contribution-type card
// =============================================================================

interface BlockCardProps {
  label: string;
  description: string;
  href: string;
  badge?: string;
  /** Optional preview image rendered in the image slot. */
  image?: {src: string; alt: string};
}

function BlockCard({label, description, href, badge, image}: BlockCardProps) {
  const showImage = image != null;
  return (
    <ClickableCard
      label={`Open ${label}`}
      href={href}
      variant="gray"
      padding={5}
      xstyle={styles.blockCard}>
      <VStack
        gap={1}
        align="start"
        xstyle={showImage ? styles.blockCardStack : undefined}>
        <Heading level={3} color="primary">
          {label}
        </Heading>
        <Text type="body" color="primary">
          {description}
        </Text>
        {badge && (
          <Text type="supporting" color="secondary">
            {badge}
          </Text>
        )}
        {showImage && image && (
          <div {...stylex.props(styles.blockCardImage)}>
            <img
              src={image.src}
              alt={image.alt}
              {...stylex.props(styles.blockCardImageImg)}
            />
          </div>
        )}
      </VStack>
    </ClickableCard>
  );
}

// =============================================================================
// Data
// =============================================================================

// Brand glyphs for the Communications section's channel rows.
// Each icon matches the ListItem startContent slot's expected
// size (~20px). Inline SVGs keep the bundle lean and avoid
// pulling in a brand-icon package for just three glyphs.

// Brand glyphs accept the same `size` prop as Lucide icons so all
// three of them slot uniformly into the Resource.icon shape (see
// the interface comment below) and the render site can call any
// icon component with `<Icon size={n} />` regardless of source.
const GitHubGlyph = ({size = 20}: {size?: number}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
  </svg>
);

// X (formerly Twitter) glyph — the post-2023 wordmark/logo.
const TwitterGlyph = ({size = 20}: {size?: number}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const DiscordGlyph = ({size = 20}: {size?: number}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true">
    <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.548-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

// Shared shape for any titled link rendered in the bottom-of-page
// Resources grid (long-form guides, legal pages, and community
// channels all use this). title/description/href feed the
// ListItem chrome; icon renders in the startContent slot at
// ~20px (Lucide icons + the brand glyphs above are interchangeable
// since both accept the same `size` prop shape).
interface Resource {
  title: string;
  description: string;
  href: string;
  /**
   * Icon component rendered in each resource row's startContent
   * slot. Accepts `size` so Lucide icons (FileText / Scale / etc.)
   * and the hand-rolled brand glyphs below (GitHubGlyph /
   * TwitterGlyph / DiscordGlyph) can be called with the same prop
   * shape at the render site.
   */
  icon: React.ComponentType<{size?: number}>;
}

// Communications channels — where the community talks. Same
// Resource shape as the documentation/legal lists below so the
// whole bottom-of-page area renders with one consistent
// list-item treatment (small icon + title + description) instead
// of competing visual languages. Channels carry brand glyphs
// (GitHub, X, Discord) so they're instantly recognizable in the
// list.
const CHANNELS: ReadonlyArray<Resource> = [
  {
    title: 'GitHub Issues',
    description:
      'File bugs and feature requests. Triaged weekly with response within a few days.',
    href: `${GITHUB_REPO}/issues`,
    icon: GitHubGlyph,
  },
  {
    title: 'Twitter',
    description:
      'Follow along for release notes, design notes, and behind-the-scenes from the team.',
    // TODO: replace with the real Astryx Twitter URL once the
    // account is live.
    href: '#',
    icon: TwitterGlyph,
  },
  {
    title: 'Discord',
    description:
      'Hang out with the community in real time. Ask questions, share work, and trade ideas.',
    // TODO: replace with the real Astryx Discord invite URL once
    // the server is live.
    href: '#',
    icon: DiscordGlyph,
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
  /** Optional preview image rendered in the card's image slot.
   * When omitted, the card renders with text only — no image
   * placeholder, so empty cards stay visually clean. */
  image?: {src: string; alt: string};
}

const START_HERE: ReadonlyArray<StartHerePath> = [
  {
    title: 'Fix a bug',
    description:
      'Spot something broken? File an issue to confirm it, then submit a change with a clear reproduction.',
    href: `${GITHUB_REPO}/issues/new?template=bug.yml`,
    effort: '~2 hours',
    image: {
      src: '/feature-bug.png',
      alt: 'Bug report illustration with issue tracker and code snippet',
    },
  },
  {
    title: 'Improve the docs',
    description:
      'Fix typos, improve examples, and fill gaps. Reviewed for correctness and clarity.',
    href: '/docs',
    effort: '~30 min',
    image: {
      src: '/feature-docs.png',
      alt: 'Docs page preview showing the Astryx documentation site',
    },
  },
  {
    title: 'Add a template',
    description:
      'Show components in realistic context. Templates are training signal for both humans and LLMs.',
    href: `${WIKI_BASE}/Contributing-Templates`,
    effort: '~half day',
    image: {
      src: '/feature-templates.png',
      alt: 'Stacked theme preview pages cascading toward a fully designed Butter theme example',
    },
  },
  {
    title: 'Build a theme',
    description:
      'Full visual control through defineTheme(). Tokens, component overrides, and mode switching.',
    href: '/docs/theme',
    effort: '~1 day',
    image: {
      src: '/feature-brand.png',
      alt: 'Butter theme applied to a full product landing page with display script, primary CTA, and three product cards',
    },
  },
];

// Categorized resource groups — each renders as one column under
// the shared "Resources" section heading, with its own small
// uppercase eyebrow label so readers can scan by topic before
// drilling into individual items.
interface ResourceCategory {
  /** Eyebrow label shown above the column (uppercase, tracked). */
  label: string;
  items: ReadonlyArray<Resource>;
}

const RESOURCE_CATEGORIES: ReadonlyArray<ResourceCategory> = [
  {
    label: 'Communications',
    items: CHANNELS,
  },
  {
    label: 'Contributing',
    items: [
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
          'How to use AI assistants effectively within Astryx conventions.',
        href: `${WIKI_BASE}/Contributing-with-AI-Assistants`,
        icon: FileText,
      },
      {
        title: 'Dev Setup',
        description: 'Clone, install, build, and run Storybook locally.',
        href: `${GITHUB_REPO}/blob/main/CONTRIBUTING.md`,
        icon: FileText,
      },
      {
        title: 'API Conventions',
        description:
          'How components in Astryx are named, shaped, and composed.',
        href: `${WIKI_BASE}/API-Conventions`,
        icon: FileText,
      },
      {
        title: 'API Arbitration',
        description: 'How we settle design disagreements using vibe testing.',
        href: `${WIKI_BASE}/API-Arbitration`,
        icon: FileText,
      },
    ],
  },
  {
    label: 'Legal',
    items: [
      {
        title: 'Code of Conduct',
        description:
          'Our standards for respectful collaboration and how we handle reports.',
        href: `${GITHUB_REPO}/blob/main/CODE_OF_CONDUCT.md`,
        icon: Scale,
      },
      {
        title: 'MIT License',
        description:
          'Astryx is open source under the MIT License. Free to use.',
        href: `${GITHUB_REPO}/blob/main/LICENSE`,
        icon: Scale,
      },
    ],
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
      <Section padding={6}>
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
              <VStack gap={1} xstyle={styles.heroText}>
                <Heading level={1} type="display-1" color="primary">
                  Build with us
                </Heading>
                <Text type="body" size="base" color="secondary">
                  A friendly community of designers and engineers shaping the
                  system together.
                </Text>
              </VStack>
              <HStack gap={2} wrap="wrap">
                <Button
                  variant="secondary"
                  size="md"
                  label="View Discussions"
                  href={`${GITHUB_REPO}/discussions`}
                />
                <Button
                  variant="primary"
                  size="md"
                  label="Start Contributing"
                  href={`${WIKI_BASE}/Contributing`}
                />
              </HStack>
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
              <VStack gap={1}>
                <Heading level={2} type="display-3">
                  How we build together
                </Heading>
                <Text type="body" color="secondary">
                  Contributing to Astryx means contributing to the system, not
                  to a single component. Each step has a clear gate, so you
                  always know what comes next.
                </Text>
              </VStack>
              {RFC_STEPS.map(step => (
                <div key={step.number} {...stylex.props(styles.processStep)}>
                  <Text
                    type="body"
                    weight="semibold"
                    color="secondary"
                    xstyle={styles.processStepNumber}>
                    {step.number}
                  </Text>
                  <VStack gap={1}>
                    <Heading level={3}>{step.title}</Heading>
                    <Text type="supporting" color="secondary">
                      {step.description}
                    </Text>
                  </VStack>
                </div>
              ))}
            </div>
            {/* Right column: contribution-type cards as a 2-col
              grid of independent feature-style cards (mirrors
              the home page's FeaturesShowcase pattern). Each
              card has a heading, description, effort badge, an
              Explore link, and an optional bottom-anchored
              image with bleed margins. */}
            <div {...stylex.props(styles.contribTypes)}>
              <div {...stylex.props(styles.blockGrid)}>
                {START_HERE.map(path => (
                  <BlockCard
                    key={path.title}
                    label={path.title}
                    description={path.description}
                    href={path.href}
                    badge={path.effort}
                    image={path.image}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* End-of-page Resources block — unifies Communications
              (Issues, Twitter, Discord) + Contributing + Design +
              Legal into one categorized list grid. Editorial
              header sets the intent; the grid below scans by
              category. */}
          <div {...stylex.props(styles.endBlock)}>
            <div {...stylex.props(styles.endBlockResources)}>
              <Heading
                level={2}
                type="display-2"
                xstyle={styles.endBlockHeaderText}>
                Resources
              </Heading>
              {/* Categorized resource columns — each category
                  (Contributing, Design, Legal) gets its own
                  column with a small uppercase eyebrow label
                  above its List. Readers can scan by topic
                  before drilling into individual items. */}
              <div {...stylex.props(styles.endBlockResourcesGrid)}>
                {RESOURCE_CATEGORIES.map(category => (
                  <div
                    key={category.label}
                    {...stylex.props(styles.resourceColumn)}>
                    <Heading level={4} color="primary">
                      {category.label}
                    </Heading>
                    <List xstyle={styles.resourceList}>
                      {category.items.map(resource => {
                        const Icon = resource.icon;
                        return (
                          <ListItem
                            key={resource.title}
                            label={resource.title}
                            // Wrap the description string in a span
                            // (ReactNode, not plain string) so Item
                            // skips its automatic single-line truncation
                            // and the description wraps to 2 lines
                            // naturally — the resourceDescription style
                            // below clamps at 2 lines so it never grows
                            // unbounded across short columns.
                            description={
                              <span
                                {...stylex.props(styles.resourceDescription)}>
                                {resource.description}
                              </span>
                            }
                            href={resource.href}
                            target="_blank"
                            startContent={
                              <span {...stylex.props(styles.iconTile)}>
                                <Icon size={18} />
                              </span>
                            }
                          />
                        );
                      })}
                    </List>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
