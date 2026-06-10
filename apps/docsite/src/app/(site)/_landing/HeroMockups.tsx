// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @input  none — purely decorative marketing surface.
 * @output Two independent sticker compositions exported via the
 *         single `<HeroMockups />` component: one anchored to the
 *         LEFT edge of the hero, one to the RIGHT edge. Each group
 *         clips part of itself past the viewport edge for the
 *         "peeking in from off-screen" effect.
 * @position Rendered as a sibling of <Hero /> and heroContent inside
 *           heroScope on the home page. Must appear AFTER the aurora
 *           gradient but BEFORE heroContent in source order so the
 *           stickers layer behind the sticky hero copy without
 *           breaking the pin-and-cover scroll reveal.
 *
 * Composition mirrors the reference design:
 *   • Left group  — a tall portrait photo card with a "2:01"
 *     timestamp pill, an overlapping HOT SLOTH pink product card
 *     ("Add to cart" CTA), a ★★★★★ rating pill, and an "Add tags
 *     to your video" card with green chips below the photo.
 *   • Right group — a tall portrait photo card with a "2:01"
 *     timestamp pill, two stacked check pills ("Increase Sales",
 *     "Add to cart from video"), a green "—UP TO / 20X / Jump in
 *     product discovery" tile, and a SABINE Backless Maxi Dress
 *     card with avatar + "Shop Now" CTA overlapping the photo's
 *     bottom edge.
 *
 * Critically, the central horizontal band (~600px wide where the
 * wordmark + headline + CTAs sit) is left COMPLETELY CLEAR — the
 * two groups stay in the outer thirds of the hero canvas, so no
 * sticker is positioned behind the hero copy.
 *
 * Real XDS components do all the chrome (XDSCard, XDSBadge,
 * XDSButton, XDSText, XDSAvatar, XDSIcon, XDSVStack, XDSHStack).
 * Only marketing-composition coordinates + per-sticker rotations
 * live as literals in this file.
 *
 * Hidden below 1024px (desktop-only decoration) so the stickers
 * never compete with the hero copy on phones and tablets.
 */

'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSAvatar} from '@xds/core/Avatar';
import {spacingVars} from '@xds/core/theme/tokens.stylex';

// All literal pixel values in this file are intentional marketing-
// composition coordinates tied to the photo card's portrait
// geometry (300 × 440) and the reference design's sticker layout.
// They are NOT spacing-scale values and would not benefit from
// being expressed as calc() over spacing tokens — they encode
// "this sticker sits 40px left and 80px down from the photo
// card's top-left corner at -6° rotation", which is photo-anchored,
// not rhythm-anchored.
//
// Rotation values (±3° to ±8°) are picked to read as "hand-placed
// on a moodboard" — small enough to feel intentional, varied
// enough to break out of a mechanical grid.
//
// All colors / radii / shadows / typography resolve to theme
// tokens (via the XDS components consumed below + the few token
// references in this rule).
const styles = stylex.create({
  // Group wrapper — both groups share this base. Anchors a group
  // to heroScope via position:absolute, sized to a single photo-
  // card-wide column (320px) so the absolutely-positioned stickers
  // inside layer correctly around the photo. The group itself
  // doesn't carry the edge offset (left:-X / right:-X) — that lives
  // on the per-group leftGroup / rightGroup styles below — so this
  // base can stay symmetric.
  //
  // pointerEvents:none so the decorative stickers never intercept
  // clicks on the hero CTAs even when their bounding boxes overlap
  // the sticky heroContent (the headline + buttons sit ~280px from
  // the central axis, well outside the 320px-wide groups, so
  // overlap is rare — but pointer-events:none is the belt to the
  // edge-clip suspenders).
  //
  // No z-index — relies on source order in heroScope (rendered
  // before heroContent) to layer behind the sticky hero copy.
  // Adding z-index here would establish a stacking context that
  // breaks the sticky pin-and-cover scroll reveal.
  //
  // Hidden below 1024px: at narrower widths the central hero
  // column collapses toward the edges where the groups sit, and
  // they would crash into the wordmark + headline. Desktop-only
  // decoration is the simplest correct rule.
  // Sticky wrapper that holds BOTH mockup groups. Sticks to the
  // top of the viewport (just below the top nav) so the mockups
  // pin in place as the user scrolls past the hero — same pin
  // behavior as the heroContent sibling. The wrapper itself has
  // 0 height (it's just a positioning context); the two groups
  // inside are absolutely positioned against it.
  //
  // Hidden below 1024px since the mockups are desktop-only
  // decoration.
  mockupsSticky: {
    position: 'sticky',
    top: 'calc(var(--appshell-header-height, 0px) + 60px)',
    width: '100%',
    height: 0,
    pointerEvents: 'none',
    display: {
      default: 'none',
      '@media (min-width: 1024px)': 'block',
    },
  },
  // Each group is absolutely positioned against the sticky
  // wrapper above. Same 320×540 box as before; the wrapper
  // controls when the box sticks vs. scrolls.
  group: {
    position: 'absolute',
    width: 320,
    top: 0,
    height: 540,
    pointerEvents: 'none',
  },
  // Left group offset. left:-120 clips ~120px (≈38% of the 320px
  // group width) past the viewport's left edge for the "peeking
  // in" effect.
  leftGroup: {
    left: -120,
  },
  // Right group offset — mirror of leftGroup.
  rightGroup: {
    right: -120,
  },
  // Every sticker inside a group is position:absolute against the
  // group wrapper. This base only carries the absolute-positioning
  // primitive; individual sticker rules below set top/left/right
  // + transform (rotation).
  sticker: {
    position: 'absolute',
  },
  // Photo card — the anchor of each group. Portrait phone-shape
  // (300 × 440). Rounded with shadow-high to read as the primary
  // "lifted" surface. opacity bumped to 0.95 (vs. the prior 0.6)
  // because the groups no longer sit behind the sticky hero copy,
  // so the photo can read more boldly without competing with text.
  photoSticker: {
    top: 0,
    left: 10,
    width: 300,
  },
  photoCard: {
    width: '100%',
    height: 400,
    objectFit: 'cover',
    display: 'block',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-high)',
    backgroundColor: 'var(--color-background-muted)',
    opacity: 0.95,
  },
  // "2:01" timestamp pill, anchored to the photo's top-center.
  photoTimestamp: {
    position: 'absolute',
    top: spacingVars['--spacing-3'],
    left: '50%',
    transform: 'translateX(-50%)',
  },
  // ============================================================
  // LEFT GROUP stickers
  // ============================================================
  // ★★★★★ rating pill, floats above-right of the left photo.
  // Slight counter-clockwise tilt.
  ratingSticker: {
    top: 60,
    right: -10,
    transform: 'rotate(-6deg)',
  },
  // HOT SLOTH pink product card, overlaps the photo's bottom-right
  // corner. Negative rotation so it tilts away from the photo.
  hotSlothSticker: {
    top: 240,
    right: -30,
    transform: 'rotate(-5deg)',
    width: 180,
  },
  hotSlothImage: {
    width: '100%',
    height: 120,
    objectFit: 'cover',
    display: 'block',
    borderRadius: 'var(--radius-element)',
    backgroundColor: 'var(--color-background-pink)',
  },
  hotSlothTimestamp: {
    position: 'absolute',
    top: spacingVars['--spacing-2'],
    left: spacingVars['--spacing-2'],
  },
  // "Add tags to your video" card, below the photo. Slight counter-
  // clockwise tilt. top:420 places it just past the photo's bottom
  // edge (photo ends at top:400) so the chips peek out below.
  addTagsSticker: {
    top: 420,
    left: 30,
    transform: 'rotate(-4deg)',
    width: 220,
  },
  // ============================================================
  // RIGHT GROUP stickers
  // ============================================================
  // "Increase Sales" check pill, top-left of the right photo.
  // Slight clockwise tilt.
  increaseSalesSticker: {
    top: 70,
    left: -40,
    transform: 'rotate(-3deg)',
  },
  // "Add to cart from video" check pill, directly below Increase
  // Sales, slightly more counter-clockwise tilt for variety.
  addToCartSticker: {
    top: 140,
    left: -30,
    transform: 'rotate(-4deg)',
  },
  // Green 20X jump tile, mid-left of the right photo. Slight
  // clockwise tilt.
  twentyXSticker: {
    top: 220,
    left: -50,
    transform: 'rotate(3deg)',
    width: 170,
  },
  // SABINE product card, overlaps the photo's bottom edge,
  // anchored slightly left of center so it bleeds past the photo's
  // left side. Slight clockwise tilt.
  sabineSticker: {
    top: 340,
    left: -60,
    transform: 'rotate(2deg)',
    width: 260,
  },
  // ============================================================
  // SHARED inner styles
  // ============================================================
  // Small filled-circle check icon used inside the "Increase Sales"
  // and "Add to cart from video" pills. The reference shows a
  // black circle with a white check — XDSAvatar doesn't render a
  // glyph (only photos / initials / silhouette), and XDSBadge with
  // a check icon doesn't give us the filled-circle background. So
  // a small styled wrapper carries the circle chrome and an
  // XDSIcon carries the glyph itself — only ~12 lines of literal
  // chrome live in this file.
  //
  // Hardcoded inverted-surface background + on-dark icon color are
  // both theme tokens (--color-background-inverted resolves to
  // light's #0A1317 / dark's #FFFFFF, --color-on-dark resolves to
  // white), so this small primitive cleanly adapts to dark mode
  // without further work.
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-background-inverted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-on-dark)',
    flexShrink: 0,
  },
  // Star row inside the rating pill — extra letter-spacing so the
  // five glyphs read as a row, not a clump.
  stars: {
    letterSpacing: spacingVars['--spacing-0-5'],
  },
  // Copy column inside the SABINE card flexes to fill remaining
  // horizontal space so the copy left-aligns against the avatar.
  sabineCopy: {
    flex: 1,
  },
  // Full-width button override for the "Shop Now" and "Add to
  // cart" CTAs inside the SABINE and HOT SLOTH cards. XDSButton
  // has no `width` prop, but it does accept an xstyle override,
  // so a direct width:100% on the button element fills the parent
  // XDSCard's content column.
  fullWidthButton: {
    width: '100%',
  },
});

// Inline asset paths — single source of truth so each group's
// placeholder portrait can be swapped to a real person photo by
// replacing one constant. preview-headphones is a tall, dark
// product shot that anchors the LEFT group; preview-backpack is a
// neutral gray product shot that anchors the RIGHT group; the two
// different subjects keep the groups feeling varied rather than
// mirror-identical. preview-watch fills the HOT SLOTH pink card
// (left group); preview-mug fills the SABINE card's circular
// avatar (right group).
const LEFT_PHOTO_SRC = '/neutral/preview-headphones.png';
const RIGHT_PHOTO_SRC = '/neutral/preview-backpack.png';
const HOT_SLOTH_SRC = '/neutral/preview-watch.png';
const SABINE_AVATAR_SRC = '/neutral/preview-mug.png';

/**
 * Decorative LEFT-edge sticker group. Tall photo card with HOT
 * SLOTH product overlay, ★★★★★ rating pill above-right, and an
 * "Add tags to your video" card below. The whole group sits at
 * `left: -120px` so part of it clips past the viewport edge for
 * the "peeking in" effect.
 */
function LeftMockupGroup(): React.ReactElement {
  return (
    // Raw <div> because this wrapper has no semantics — it's a
    // purely decorative absolutely-positioned visual layer.
    // aria-hidden keeps the entire group out of the accessibility
    // tree.
    <div {...stylex.props(styles.group, styles.leftGroup)} aria-hidden="true">
      {/* Central photo + its inline timestamp pill. */}
      <div {...stylex.props(styles.sticker, styles.photoSticker)}>
        {/* Raw <img> — @xds/core does not export a general-purpose
            image component. Stand-in portrait photo; the visual
            anchors the group regardless of subject. */}
        <img src={LEFT_PHOTO_SRC} alt="" {...stylex.props(styles.photoCard)} />
        <span {...stylex.props(styles.photoTimestamp)}>
          <XDSBadge label="2:01" variant="neutral" />
        </span>
      </div>

      {/* ★★★★★ rating pill, above-right of the photo. */}
      <div {...stylex.props(styles.sticker, styles.ratingSticker)}>
        <XDSCard variant="pink" padding={2}>
          <XDSText
            type="body"
            weight="bold"
            color="primary"
            xstyle={styles.stars}>
            ★★★★★
          </XDSText>
        </XDSCard>
      </div>

      {/* HOT SLOTH pink product card overlapping the photo's
          bottom-right corner. */}
      <div {...stylex.props(styles.sticker, styles.hotSlothSticker)}>
        <XDSCard variant="pink" padding={2}>
          <XDSVStack gap={2}>
            <div style={{position: 'relative'}}>
              <img
                src={HOT_SLOTH_SRC}
                alt=""
                {...stylex.props(styles.hotSlothImage)}
              />
              <span {...stylex.props(styles.hotSlothTimestamp)}>
                <XDSBadge label="2:01" variant="neutral" />
              </span>
            </div>
            <XDSButton
              variant="primary"
              size="md"
              label="Add to cart"
              xstyle={styles.fullWidthButton}
            />
          </XDSVStack>
        </XDSCard>
      </div>

      {/* "Add tags to your video" card, below the photo. */}
      <div {...stylex.props(styles.sticker, styles.addTagsSticker)}>
        <XDSCard variant="default" padding={3}>
          <XDSVStack gap={2}>
            <XDSText type="body" color="primary" weight="medium">
              Add tags to your video
            </XDSText>
            <XDSHStack gap={2} wrap="wrap">
              <XDSBadge label="+ Black" variant="green" />
              <XDSBadge label="+ Trouser" variant="green" />
              <XDSBadge label="+ Fashion" variant="green" />
            </XDSHStack>
          </XDSVStack>
        </XDSCard>
      </div>
    </div>
  );
}

/**
 * Decorative RIGHT-edge sticker group. Tall photo card with two
 * stacked check pills ("Increase Sales", "Add to cart from
 * video"), a green "20X" jump tile, and a SABINE product card with
 * avatar + "Shop Now" CTA overlapping the photo's bottom. The
 * whole group sits at `right: -120px` so part of it clips past
 * the viewport edge for the "peeking in" effect.
 */
function RightMockupGroup(): React.ReactElement {
  return (
    <div {...stylex.props(styles.group, styles.rightGroup)} aria-hidden="true">
      {/* Central photo + its inline timestamp pill. */}
      <div {...stylex.props(styles.sticker, styles.photoSticker)}>
        <img src={RIGHT_PHOTO_SRC} alt="" {...stylex.props(styles.photoCard)} />
        <span {...stylex.props(styles.photoTimestamp)}>
          <XDSBadge label="2:01" variant="neutral" />
        </span>
      </div>

      {/* "Increase Sales" check pill, top-left of the photo. */}
      <div {...stylex.props(styles.sticker, styles.increaseSalesSticker)}>
        <XDSCard variant="default" padding={2}>
          <XDSHStack gap={2} align="center">
            <span {...stylex.props(styles.checkCircle)}>
              <XDSIcon icon="check" color="inherit" size="sm" />
            </span>
            <XDSText type="body" color="primary" weight="medium">
              Increase Sales
            </XDSText>
          </XDSHStack>
        </XDSCard>
      </div>

      {/* "Add to cart from video" check pill, below Increase Sales. */}
      <div {...stylex.props(styles.sticker, styles.addToCartSticker)}>
        <XDSCard variant="default" padding={2}>
          <XDSHStack gap={2} align="center">
            <span {...stylex.props(styles.checkCircle)}>
              <XDSIcon icon="check" color="inherit" size="sm" />
            </span>
            <XDSText type="body" color="primary" weight="medium">
              Add to cart from video
            </XDSText>
          </XDSHStack>
        </XDSCard>
      </div>

      {/* Green 20X jump tile, mid-left of the photo. */}
      <div {...stylex.props(styles.sticker, styles.twentyXSticker)}>
        <XDSCard variant="green" padding={4}>
          <XDSVStack gap={1}>
            <XDSText type="supporting" color="primary" weight="medium">
              — UP TO
            </XDSText>
            <XDSText type="large" color="primary" weight="bold" size="3xl">
              20X
            </XDSText>
            <XDSText type="body" color="primary">
              Jump in product discovery
            </XDSText>
          </XDSVStack>
        </XDSCard>
      </div>

      {/* SABINE product card, overlapping the photo's bottom edge. */}
      <div {...stylex.props(styles.sticker, styles.sabineSticker)}>
        <XDSCard variant="default" padding={3}>
          <XDSVStack gap={3}>
            <XDSHStack gap={3} align="center">
              <XDSAvatar src={SABINE_AVATAR_SRC} name="SABINE" size="medium" />
              <XDSVStack gap={0.5} xstyle={styles.sabineCopy}>
                <XDSText type="body" color="primary" weight="medium">
                  SABINE Backless Maxi Dress in Black
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  $159.00 USD
                </XDSText>
              </XDSVStack>
            </XDSHStack>
            <XDSButton
              variant="primary"
              size="md"
              label="Shop Now"
              xstyle={styles.fullWidthButton}
            />
          </XDSVStack>
        </XDSCard>
      </div>
    </div>
  );
}

/**
 * Both edge groups wrapped in a single component for clean import
 * at the page level. React fragment because there is no shared
 * wrapper element — each group anchors independently to its
 * viewport edge via its own position:absolute + left/right offset.
 */
export function HeroMockups(): React.ReactElement {
  return (
    <div {...stylex.props(styles.mockupsSticky)} aria-hidden="true">
      <LeftMockupGroup />
      <RightMockupGroup />
    </div>
  );
}
