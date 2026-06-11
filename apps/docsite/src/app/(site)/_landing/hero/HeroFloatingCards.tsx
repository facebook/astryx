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
import {Sparkles, Truck} from 'lucide-react';
import {XDSCard} from '@xds/core/Card';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSChatComposer} from '@xds/core/Chat';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import type {HeroThemeContent} from './heroThemeContent';

const styles = stylex.create({
  // Full-width stage; cards live in the left/right gutters beside the centered
  // text column. Hidden below ~1180px (column + two card-width gutters).
  stage: {
    position: 'absolute',
    inset: 0,
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
  // All floating cards render at 0.75x. The scale is baked into the pose
  // transforms (rest = scale(0.75); entrance = a touch smaller + nudged). Each
  // card sets transformOrigin toward its anchored gutter edge (see *Origin
  // styles) so it shrinks in place against the gutter instead of drifting
  // toward the hero center.
  hiddenPose: {
    opacity: 0,
    transform: 'translateY(14px) scale(0.72)',
  },
  shownPose: {
    opacity: 1,
    transform: 'translateY(0) scale(0.75)',
  },
  // Transform origins per gutter so the 0.75x scale keeps cards hugging their
  // edge. Left-gutter cards anchor their top-left; right-gutter cards their
  // top-right.
  originTopLeft: {
    transformOrigin: 'top left',
  },
  originTopRight: {
    transformOrigin: 'top right',
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
  fullWidth: {
    width: '100%',
  },

  // ── Left: image-led product card ──────────────────────────────────────
  // Mapped from the reference SVG (card 213×275, rx 12). Generous padding,
  // title + 2-line description on top, a large rounded product image filling
  // the lower portion, and a chat bubble that breaks out past the card's
  // right edge over the image's lower area.
  productCard: {
    left: 'var(--spacing-8)',
    top: 300,
    width: 'clamp(244px, 20vw, 280px)',
    boxShadow: 'var(--shadow-high)',
    // Drop the XDSCard default border so the card reads as a clean floating
    // surface defined only by its shadow.
    borderColor: 'transparent',
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
  chatBubble: {
    position: 'absolute',
    // Start partway across and extend past the right edge of the card.
    left: '24%',
    right: 'calc(-1 * var(--spacing-6))',
    bottom: 'var(--spacing-5)',
    borderRadius: 'var(--radius-full)',
    boxShadow: 'var(--shadow-high)',
  },
  // ── Right: feature card ───────────────────────────────────────────────
  featureCard: {
    right: 'var(--spacing-6)',
    top: 250,
    width: 'clamp(236px, 19vw, 272px)',
    boxShadow: 'var(--shadow-high)',
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  featureImageWrap: {
    position: 'relative',
  },
  // Small buy card overlapping the lower-left of the feature card.
  miniCard: {
    position: 'absolute',
    left: 'calc(-1 * var(--spacing-4))',
    bottom: 'var(--spacing-4)',
    width: 184,
    boxShadow: 'var(--shadow-high)',
    borderColor: 'transparent',
  },
  miniThumbFrame: {
    width: 28,
    height: 28,
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: 'var(--radius-inner)',
  },

  // ── Right: reward-progress card (under the feature card) ──────────────
  // Sits below the feature card; offset further from the right edge so its
  // left portion peeks out from behind the feature card / mini card cluster,
  // matching the layered look in the reference.
  rewardCard: {
    right: 'var(--spacing-10)',
    top: 540,
    width: 'clamp(224px, 18vw, 256px)',
    boxShadow: 'var(--shadow-high)',
    borderColor: 'transparent',
  },

  // ── Floating pills ────────────────────────────────────────────────────
  pillLeading: {
    left: 'var(--spacing-10)',
    top: 260,
  },
  pillTrailing: {
    right: 'var(--spacing-10)',
    top: 220,
  },
  pillSurface: {
    backgroundColor: 'var(--color-background-surface)',
    borderRadius: 'var(--radius-full)',
    boxShadow: 'var(--shadow-med)',
    padding: 'var(--spacing-1)',
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
        <div {...stylex.props(styles.pillSurface)}>
          <XDSBadge
            variant="green"
            label={content.pills.leading}
            icon={<Sparkles size={12} />}
          />
        </div>
      </div>

      {/* Trailing pill */}
      <div
        {...stylex.props(
          styles.floater,
          styles.pillTrailing,
          styles.originTopRight,
          pose,
        )}>
        <div {...stylex.props(styles.pillSurface)}>
          <XDSBadge
            variant="blue"
            label={content.pills.trailing}
            icon={<Truck size={12} />}
          />
        </div>
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
        <XDSVStack gap={3}>
          <XDSVStack gap={1}>
            <XDSHeading level={3}>{content.product.title}</XDSHeading>
            <XDSText type="supporting" color="secondary">
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
              />
            </div>
          </div>
        </XDSVStack>
      </XDSCard>

      {/* Right — tall feature card with an overlapping mini buy card */}
      <XDSCard
        padding={0}
        xstyle={[
          styles.floater,
          styles.featureCard,
          styles.originTopRight,
          pose,
        ]}>
        <div {...stylex.props(styles.featureImageWrap)}>
          <XDSAspectRatio ratio={1}>
            <img
              src={content.feature.image}
              alt=""
              {...stylex.props(styles.image)}
            />
          </XDSAspectRatio>

          {/* Mini buy card — thumbnail + name + description + Add to cart */}
          <XDSCard padding={2} xstyle={styles.miniCard}>
            <XDSVStack gap={2}>
              <XDSHStack gap={2} vAlign="center">
                <div {...stylex.props(styles.miniThumbFrame)}>
                  <img
                    src={content.mini.image}
                    alt=""
                    {...stylex.props(styles.image)}
                  />
                </div>
                <XDSVStack gap={0} xstyle={styles.fullWidth}>
                  <XDSText type="supporting" weight="semibold">
                    {content.mini.title}
                  </XDSText>
                  <XDSText type="supporting" color="secondary">
                    {content.mini.description}
                  </XDSText>
                </XDSVStack>
              </XDSHStack>
              <XDSButton
                variant="primary"
                size="sm"
                label="Add to cart"
                xstyle={styles.fullWidth}
              />
            </XDSVStack>
          </XDSCard>
        </div>
      </XDSCard>

      {/* Right — reward-progress card beneath the feature card */}
      <XDSCard
        padding={3}
        xstyle={[
          styles.floater,
          styles.rewardCard,
          styles.originTopRight,
          pose,
        ]}>
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
            variant="success"
          />
          <XDSHStack gap={2} vAlign="center">
            <XDSAvatar name={content.reward.member} size="xsmall" />
            <XDSText type="supporting" color="secondary">
              {content.reward.member}
            </XDSText>
          </XDSHStack>
        </XDSVStack>
      </XDSCard>
    </div>
  );
}
