// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file HeroFloatingCards.tsx
 * @input HeroThemeContent for the active theme + a `mounted` flag for entrance
 * @output The decorative themed UI cards that flank the hero wordmark
 * @position Home hero — themed "mini storefront" surfaces that re-skin per theme.
 *
 * Layout mirrors the marketing reference:
 *   • Left gutter  — a "Limited edition" pill + an image-led product card with
 *                    an assistant prompt bubble overlapping the photo.
 *   • Right gutter — a "Fast shipping" pill + a tall feature product card with a
 *                    small buy card overlapping its lower-left corner, plus a
 *                    separate reward-progress card beneath it.
 *
 * Every card is composed from real @xds/core components so wrapping the set in
 * <XDSTheme> re-skins color, type, radius, and motion automatically. The whole
 * layer is decorative: aria-hidden, pointer-events disabled, and inert so none
 * of the fake controls land in the tab order or a11y tree. Below the desktop
 * breakpoint the layer hides and the wordmark + CTAs carry the hero alone.
 */

import * as stylex from '@stylexjs/stylex';
import {Plus, Sparkles} from 'lucide-react';
import {XDSCard} from '@xds/core/Card';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSChatComposer, XDSChatSendButton} from '@xds/core/Chat';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import type {HeroThemeContent} from './heroThemeContent';

const styles = stylex.create({
  // Cards live in a FIXED-WIDTH, viewport-centered box (the same box the aurora
  // blobs use) so every card's `left %` is a percentage of a stable width — the
  // whole composition just re-centers on resize instead of the cards drifting
  // apart or away from the blobs. Hidden below ~1024px, where the collage layout
  // takes over.
  stage: {
    position: 'fixed',
    top: 'var(--appshell-header-height, 0px)',
    left: '50%',
    transform: 'translateX(-50%)',
    // Cap to the viewport so the fixed stage never forces horizontal scroll on
    // widths just above the 1024px breakpoint. Card bleed past the gutters is
    // clipped by heroScope's overflow-x; on wide screens there's room so it
    // stays visible.
    width: 'min(1200px, 100vw)',
    height: 1050,
    pointerEvents: 'none',
    display: {
      default: 'none',
      '@media (min-width: 1024px)': 'block',
    },
  },
  // Narrow-screen collage (<1024px): a 3-column arrangement of the same cards
  // pinned to the bottom of the hero band (the desktop overlap `stage` hides
  // here). position:fixed so it stays put while the showcase scrolls UP over it,
  // matching the desktop pin-and-cover behavior instead of scrolling away.
  // Col 1 = product, Col 2 = reward, Col 3 = buy card + composer + badge + radio.
  collage: {
    // Hidden at ≥1024px (desktop uses the overlap `stage`); a CSS grid below.
    display: {
      default: 'grid',
      '@media (min-width: 1024px)': 'none',
    },
    // Pinned (fixed) a consistent gap below the hero text. The top offset =
    // nav height + the hero content's top padding (the nav→wordmark gap) + the
    // measured hero text height (--hero-text-height, set in page.tsx) + the same
    // gap again — so the nav→wordmark and text→cards gaps stay equal across
    // breakpoints. The showcase scrolls UP and paints over it (pin-and-cover).
    position: 'fixed',
    top: 'calc(var(--appshell-header-height, 0px) + var(--hero-gap, 96px) + var(--hero-text-height, 345px) + var(--hero-gap, 96px))',
    left: '50%',
    transform: 'translateX(-50%)',
    // <560px: 2 balanced columns. 560–1024px: 3 columns (product | reward |
    // stacked group). Grid areas (below) place the items per layout.
    gridTemplateColumns: {
      default: '1fr 1fr',
      '@media (min-width: 560px)': '1fr 1fr minmax(0, 240px)',
    },
    gridTemplateAreas: {
      default: '"product reward" "buy composer" "badge radio"',
      '@media (min-width: 560px)':
        '"product reward buy" "product reward composer" "product reward badge" "product reward radio"',
    },
    alignItems: 'start',
    justifyContent: 'center',
    columnGap: 'var(--spacing-4)',
    rowGap: 'var(--spacing-3)',
    width: '100%',
    maxWidth: {
      default: 560,
      '@media (min-width: 560px)': 900,
    },
    paddingInline: 'var(--spacing-4)',
    boxSizing: 'border-box',
    zIndex: 0,
    pointerEvents: 'none',
  },
  // Grid-area placements. The product/reward cards span the full column height
  // (their images fill) so the two tall columns read as equal height.
  gaProduct: {gridArea: 'product', display: 'flex', minWidth: 0},
  gaReward: {gridArea: 'reward', display: 'flex', minWidth: 0},
  gaBuy: {gridArea: 'buy', minWidth: 0},
  gaComposer: {gridArea: 'composer', minWidth: 0},
  gaBadge: {gridArea: 'badge', minWidth: 0},
  gaRadio: {gridArea: 'radio', minWidth: 0},
  // Badge sits left-aligned in its cell (not full width).
  collageBadge: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  // Per-card reset in the collage: drop absolute positioning + the scaled pose
  // so each card sits full-width in its column.
  stackCard: {
    position: 'static',
    width: '100%',
    transform: 'none',
    opacity: 1,
  },
  // Collage product card: make the body a full-height column and let the image
  // grow to fill the leftover space (so the card image fills its stretched
  // height rather than leaving a gap under a fixed-ratio square).
  collageProductBody: {
    height: '100%',
  },
  collageImageFill: {
    flexGrow: 1,
    minHeight: 0,
    overflow: 'hidden',
    borderRadius: 'var(--radius-element)',
  },
  // Collage reward card: full-height flex column so its image can grow to fill
  // the stretched card height with the footer pinned to the bottom.
  collageRewardCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  // The reward image grows to fill the space above the footer in collage mode.
  collageRewardImage: {
    flexGrow: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  // Shared base for floating elements: absolute placement + a soft theme-timed
  // entrance transition.
  floater: {
    position: 'absolute',
    transitionProperty: 'transform, opacity',
    transitionDuration: 'var(--duration-slow, 600ms)',
    transitionTimingFunction: 'var(--ease-standard, ease)',
    willChange: 'transform, opacity',
  },
  // All floating cards render at 0.85x. The scale is baked into the pose
  // transforms (rest = scale(0.85); entrance = a touch smaller + nudged). Each
  // card sets transformOrigin toward its anchored gutter edge (see *Origin
  // styles) so it shrinks in place against the gutter instead of drifting
  // toward the hero center.
  hiddenPose: {
    opacity: 0,
    transform: 'translateY(14px) scale(0.82)',
  },
  shownPose: {
    opacity: 1,
    transform: 'translateY(0) scale(0.85)',
  },
  // All cards anchor from their top-left (% left coordinate) so the 0.85x scale
  // shrinks them in place against that anchor instead of drifting.
  originTopLeft: {
    transformOrigin: 'top left',
  },

  // Shared image helpers.
  imageFrame: {
    overflow: 'hidden',
    borderRadius: 'var(--radius-element)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  // Product description capped at two lines (longer copy truncates with an
  // ellipsis). No minHeight reservation, so the gap from the description to the
  // image equals the card's padding regardless of copy length.
  productDescription: {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
  },

  // ── Left: image-led product card ──────────────────────────────────────
  // Mapped from the reference SVG (card 213×275, rx 12). Generous padding,
  // title + 2-line description on top, a large rounded product image filling
  // the lower portion, and a chat bubble that breaks out past the card's
  // right edge over the image's lower area.
  productCard: {
    // Left edge near the left aurora blob (visually ~14% of the viewport) so
    // the card sits over that blob.
    left: '-8%',
    top: 340,
    width: 312,
    boxShadow: 'var(--shadow-high)',
    // Drop the XDSCard default border so the card reads as a clean floating
    // surface defined only by its shadow.
    borderWidth: 0,
    // overflow visible so the chat bubble can break past the right + bottom.
    overflow: 'visible',
  },
  // The image area; relative so the chat bubble can anchor to it. Grows to a
  // prominent square-ish photo like the SVG.
  productImageWrap: {
    position: 'relative',
  },
  // Chat bubble wrapper — positions a real XDSChatComposer so it breaks out
  // past the card's right edge over the lower part of the product image
  // (matches the SVG). The composer supplies its own surface, radius, and
  // send button; this wrapper only handles placement + the lift shadow.
  // Positioning wrapper for the composer; breaks out past the product card's
  // right edge over the lower part of the photo.
  chatBubble: {
    position: 'absolute',
    left: '5%',
    right: 'calc(-1 * var(--spacing-12))',
    bottom: 'var(--spacing-5)',
    transform: 'translateX(var(--spacing-12))',
    // Decorative only: no pointer interaction or text cursor (the whole layer
    // is also `inert`, but this keeps the composer from showing affordances).
    pointerEvents: 'none',
    cursor: 'default',
  },
  // Match the composer surface to the themed body background (like the cards)
  // so it blends with the hero scene instead of defaulting to the tinted
  // --color-background-popover (e.g. pink on Y2K).
  composerSurface: {
    backgroundColor: 'var(--color-background-card)',
  },
  // ── Right: feature card ───────────────────────────────────────────────
  featureCard: {
    // Left edge near the right aurora blob (visually ~80% of the viewport) so
    // the card sits over that blob.
    left: '88%',
    top: 380,
    width: 304,
    boxShadow: 'var(--shadow-high)',
    // No border at all — a transparent border still leaves a border-width gap
    // that reveals the card's white background as a thin frame around the
    // flush image. borderWidth:0 removes that frame.
    borderWidth: 0,
    overflow: 'hidden',
  },

  // ── Right: reward footer (attached below the feature image) ───────────
  // The feature card is padding={0} so the image sits flush to the edges;
  // this wrapper re-adds the card's inner padding around the reward footer.
  rewardFooter: {
    padding: 'var(--spacing-4)',
  },
  // Extra breathing room above the profile row so it sits clearly apart from
  // the progress bar (beyond the VStack's base gap).
  profileRow: {
    marginBlockStart: 'var(--spacing-2)',
  },

  // ── Floating pills ────────────────────────────────────────────────────
  pillLeading: {
    left: '-11%',
    top: 304,
  },
  pillTrailing: {
    // Sits above the feature card's top edge with a small gap (card at top:380).
    left: '104%',
    top: 326,
  },
  // Pill-shaped card wrapping the trailing radio option. Fully rounded with a
  // soft lift; the XDSCard default border is dropped so only the shadow defines
  // the floating surface. nowrap keeps the label on one line.
  radioPillCard: {
    borderRadius: 'var(--radius-full)',
    boxShadow: 'var(--shadow-med)',
    borderWidth: 0,
    whiteSpace: 'nowrap',
  },
  // Buy card overlapping the lower-left of the feature/reward card: thumbnail +
  // title + 2-line description and a full-width "Add to cart" button. Anchored
  // further left (large right offset) and high enough to sit over the card's
  // lower-left, breaking past its left edge like the reference.
  buyCard: {
    // Overlaps the lower-left of the feature card's image, breaking past its
    // left edge but kept clear of the hero text.
    left: '80%',
    top: 480,
    width: 248,
    boxShadow: 'var(--shadow-high)',
    borderWidth: 0,
  },
  buyThumbFrame: {
    width: 'var(--spacing-12)',
    height: 'var(--spacing-12)',
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: 'var(--radius-element)',
  },
  fullWidth: {
    width: '100%',
  },
  buyDescription: {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 1,
    overflow: 'hidden',
  },
});

export function HeroFloatingCards({
  content,
  mounted,
  layout = 'overlap',
}: {
  content: HeroThemeContent;
  mounted: boolean;
  /** 'overlap' = desktop fixed art layout; 'stack' = mobile flow column. */
  layout?: 'overlap' | 'stack';
}) {
  const stack = layout === 'stack';
  // In the stacked layout cards render full-size in flow (no entrance pose).
  const pose = stack
    ? styles.stackCard
    : mounted
      ? styles.shownPose
      : styles.hiddenPose;

  // ── Card bodies (shared by both layouts) ──────────────────────────────
  const badgeEl = (
    <XDSBadge
      variant="green"
      label={content.pills.leading}
      icon={<Sparkles size={12} />}
    />
  );

  const radioEl = (
    <XDSCard padding={2} xstyle={styles.radioPillCard}>
      <XDSRadioList
        label={content.pills.trailing}
        isLabelHidden
        value="selected"
        onChange={() => {}}
        size="sm">
        <XDSRadioListItem label={content.pills.trailing} value="selected" />
      </XDSRadioList>
    </XDSCard>
  );

  const composerEl = (
    <XDSChatComposer
      value=""
      onChange={() => {}}
      onSubmit={() => {}}
      placeholder={content.chatPrompt}
      xstyle={styles.composerSurface}
      footerActions={
        <XDSButton
          variant="secondary"
          size="md"
          isIconOnly
          icon={<Plus size={16} />}
          label="Add attachment"
        />
      }
      sendButton={<XDSChatSendButton isDisabled={false} />}
    />
  );

  // Product card body. In overlap mode the composer breaks out over the image;
  // in collage mode the composer is a separate column item, so it's omitted.
  const productCardEl = (
    <XDSCard
      padding={4}
      xstyle={
        stack
          ? [styles.stackCard]
          : [styles.floater, styles.productCard, styles.originTopLeft, pose]
      }>
      <XDSVStack gap={4} xstyle={stack ? styles.collageProductBody : undefined}>
        <XDSVStack gap={1}>
          <XDSHeading level={2}>{content.product.title}</XDSHeading>
          <XDSText
            type="body"
            color="secondary"
            xstyle={styles.productDescription}>
            {content.product.description}
          </XDSText>
        </XDSVStack>
        {stack ? (
          // Collage: image grows to fill the card's stretched height.
          <div {...stylex.props(styles.collageImageFill)}>
            <img
              src={content.product.image}
              alt=""
              {...stylex.props(styles.image)}
            />
          </div>
        ) : (
          <div {...stylex.props(styles.productImageWrap)}>
            <div {...stylex.props(styles.imageFrame)}>
              <XDSAspectRatio ratio={1}>
                <img
                  src={content.product.image}
                  alt=""
                  {...stylex.props(styles.image)}
                />
              </XDSAspectRatio>
            </div>
            {/* Overlap-only: composer breaks out past the card edge over the
                photo. In collage mode the composer is its own column item. */}
            <div {...stylex.props(styles.chatBubble)}>{composerEl}</div>
          </div>
        )}
      </XDSVStack>
    </XDSCard>
  );

  const rewardCardEl = (
    <XDSCard
      padding={0}
      xstyle={
        stack
          ? [styles.stackCard, styles.collageRewardCard]
          : [styles.floater, styles.featureCard, styles.originTopLeft, pose]
      }>
      {stack ? (
        // Collage: image grows to fill the card's stretched height.
        <div {...stylex.props(styles.collageRewardImage)}>
          <img
            src={content.feature.image}
            alt=""
            {...stylex.props(styles.image)}
          />
        </div>
      ) : (
        <XDSAspectRatio ratio={1}>
          <img
            src={content.feature.image}
            alt=""
            {...stylex.props(styles.image)}
          />
        </XDSAspectRatio>
      )}
      <div {...stylex.props(styles.rewardFooter)}>
        <XDSVStack gap={2}>
          <XDSHStack gap={2} hAlign="between" vAlign="center">
            <XDSText type="body" weight="semibold">
              {content.reward.label}
            </XDSText>
            <XDSText type="supporting" color="secondary">
              {content.reward.value}/{content.reward.total}
            </XDSText>
          </XDSHStack>
          <XDSProgressBar
            label={content.reward.label}
            isLabelHidden
            value={content.reward.value}
            max={content.reward.total}
            variant="accent"
          />
          <XDSHStack gap={2} vAlign="center" xstyle={styles.profileRow}>
            <XDSAvatar name={content.reward.member} size="xsmall" />
            <XDSText type="supporting" color="secondary">
              {content.reward.member}
            </XDSText>
          </XDSHStack>
        </XDSVStack>
      </div>
    </XDSCard>
  );

  const buyCardEl = (
    <XDSCard
      padding={3}
      xstyle={
        stack
          ? [styles.stackCard]
          : [styles.floater, styles.buyCard, styles.originTopLeft, pose]
      }>
      <XDSVStack gap={3}>
        <XDSHStack gap={3} vAlign="center">
          <div {...stylex.props(styles.buyThumbFrame)}>
            <img
              src={content.mini.image}
              alt=""
              {...stylex.props(styles.image)}
            />
          </div>
          <XDSVStack gap={1} xstyle={styles.fullWidth}>
            <XDSHeading level={3}>{content.mini.title}</XDSHeading>
            <XDSText
              type="supporting"
              color="secondary"
              xstyle={styles.buyDescription}>
              {content.mini.description}
            </XDSText>
          </XDSVStack>
        </XDSHStack>
        <XDSButton
          variant="secondary"
          size="md"
          label="Add to cart"
          xstyle={styles.fullWidth}
        />
      </XDSVStack>
    </XDSCard>
  );

  // ── Collage layout (narrow screens): CSS grid ─────────────────────────
  // Grid areas reflow the same items: 560–1024px → 3 columns (product, reward,
  // and buy/composer/badge/radio stacked in col 3); <560px → 2 balanced columns
  // (left: product, buy, badge · right: reward, composer, radio).
  if (stack) {
    return (
      <div {...stylex.props(styles.collage)} aria-hidden="true" inert>
        <div {...stylex.props(styles.gaProduct)}>{productCardEl}</div>
        <div {...stylex.props(styles.gaReward)}>{rewardCardEl}</div>
        <div {...stylex.props(styles.gaBuy)}>{buyCardEl}</div>
        <div {...stylex.props(styles.gaComposer)}>{composerEl}</div>
        <div {...stylex.props(styles.gaBadge, styles.collageBadge)}>
          {badgeEl}
        </div>
        <div {...stylex.props(styles.gaRadio)}>{radioEl}</div>
      </div>
    );
  }

  // ── Overlap layout (desktop): fixed art composition ───────────────────
  return (
    <div {...stylex.props(styles.stage)} aria-hidden="true" inert>
      {/* Leading pill */}
      <div
        {...stylex.props(
          styles.floater,
          styles.pillLeading,
          styles.originTopLeft,
          pose,
        )}>
        {badgeEl}
      </div>
      {/* Trailing pill — a selected radio option wrapped in a pill card */}
      <div
        {...stylex.props(
          styles.floater,
          styles.pillTrailing,
          styles.originTopLeft,
          pose,
        )}>
        {radioEl}
      </div>
      {productCardEl}
      {rewardCardEl}
      {buyCardEl}
    </div>
  );
}
