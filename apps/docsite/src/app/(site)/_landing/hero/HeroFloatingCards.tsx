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
  // apart or away from the blobs. Hidden below ~1180px, where the stacked mobile
  // layout (HeroFloatingCardsStack) takes over.
  stage: {
    position: 'fixed',
    top: 'var(--appshell-header-height, 0px)',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 1200,
    height: 1050,
    pointerEvents: 'none',
    display: {
      default: 'none',
      '@media (min-width: 1180px)': 'block',
    },
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
  // Force a neutral card surface on the composer body so it reads as a clean
  // light bubble on every theme — the composer defaults to
  // --color-background-popover, which is a tinted (e.g. pink on Y2K) surface
  // that clashes with the product card behind it.
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
}: {
  content: HeroThemeContent;
  mounted: boolean;
}) {
  const pose = mounted ? styles.shownPose : styles.hiddenPose;

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
        <XDSBadge
          variant="green"
          label={content.pills.leading}
          icon={<Sparkles size={12} />}
        />
      </div>

      {/* Trailing pill — a selected radio option wrapped in a pill card */}
      <div
        {...stylex.props(
          styles.floater,
          styles.pillTrailing,
          styles.originTopLeft,
          pose,
        )}>
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
      </div>

      {/* Left — image-led product card with a chat bubble breaking out right */}
      <XDSCard
        padding={4}
        xstyle={[
          styles.floater,
          styles.productCard,
          styles.originTopLeft,
          pose,
        ]}>
        <XDSVStack gap={4}>
          <XDSVStack gap={1}>
            <XDSHeading level={2}>{content.product.title}</XDSHeading>
            <XDSText
              type="body"
              color="secondary"
              xstyle={styles.productDescription}>
              {content.product.description}
            </XDSText>
          </XDSVStack>
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
            {/* Assistant prompt bubble — a real XDSChatComposer (rounded input
                + built-in send button) breaking out past the card's right edge
                over the lower part of the photo. Decorative: the whole layer is
                inert / aria-hidden / pointer-events:none, so the no-op handlers
                never fire. */}
            <div {...stylex.props(styles.chatBubble)}>
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
            </div>
          </div>
        </XDSVStack>
      </XDSCard>

      {/* Right — feature card: product image on top, reward footer below */}
      <XDSCard
        padding={0}
        xstyle={[
          styles.floater,
          styles.featureCard,
          styles.originTopLeft,
          pose,
        ]}>
        <XDSAspectRatio ratio={1}>
          <img
            src={content.feature.image}
            alt=""
            {...stylex.props(styles.image)}
          />
        </XDSAspectRatio>

        {/* Reward-progress footer attached below the image */}
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

      {/* Right — buy card: thumbnail + title/description + Add to cart */}
      <XDSCard
        padding={3}
        xstyle={[styles.floater, styles.buyCard, styles.originTopLeft, pose]}>
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
    </div>
  );
}
