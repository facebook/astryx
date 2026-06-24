// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file HeroFloatingCards.tsx
 * @input HeroThemeContent for the active theme + a `mounted` flag for entrance
 * @output The decorative themed UI cards that flank the hero wordmark
 * @position Home hero — themed "mini storefront" surfaces that re-skin per theme.
 *
 * Cards are real @astryxdesign/core components, so wrapping the set in <Theme> re-skins
 * them per theme. The whole layer is decorative: aria-hidden + inert + no pointer
 * events. layout="overlap" is the desktop art composition; layout="stack" is the
 * narrow-screen grid collage.
 */

import * as stylex from '@stylexjs/stylex';
import {Plus, Sparkles} from 'lucide-react';
import {Card} from '@astryxdesign/core/Card';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Text, Heading} from '@astryxdesign/core/Text';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {ChatComposer, ChatSendButton} from '@astryxdesign/core/Chat';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {Avatar} from '@astryxdesign/core/Avatar';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import type {HeroThemeContent} from './heroThemeContent';

// The reward card's member is kept consistent across every theme slide (the
// per-theme `member` copy is intentionally not used here) so the avatar reads
// as one recurring person. A local public asset keeps it offline-safe for
// screenshots; `name` is retained for the accessible alt text + initials
// fallback if the image ever fails to load.
const REWARD_MEMBER_NAME = 'Alex Rivera';
const REWARD_MEMBER_AVATAR = '/avatar-astryx.png';

const styles = stylex.create({
  // Desktop overlap stage: fixed, viewport-centered 1200px box (shared with the
  // aurora blobs) so cards track the blobs on resize. Capped to 100vw to avoid
  // horizontal scroll. Hidden <1024px, where the collage takes over.
  stage: {
    position: 'fixed',
    top: 'var(--appshell-header-height, 0px)',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(1200px, 100vw)',
    height: 1050,
    pointerEvents: 'none',
    display: {
      default: 'none',
      '@media (min-width: 1024px)': 'block',
    },
  },
  // Narrow-screen collage grid. <768px: 2 columns (product|reward, side below).
  // 768–1024px: 3 columns (product | reward | side group). In flow inside the
  // fixed hero content, so it's pinned and sits --hero-gap below the text.
  collage: {
    display: {
      default: 'grid',
      '@media (min-width: 1024px)': 'none',
    },
    gridTemplateColumns: {
      default: '1fr 1fr',
      '@media (min-width: 768px)': '1fr 1fr minmax(0, 240px)',
    },
    gridTemplateAreas: {
      default: '"product reward" "side side"',
      '@media (min-width: 768px)': '"product reward side"',
    },
    // Stretch so product/reward match the (taller) side column's height.
    alignItems: 'stretch',
    justifyContent: 'center',
    textAlign: 'start',
    columnGap: 'var(--spacing-4)',
    rowGap: 'var(--spacing-4)',
    width: '100%',
    maxWidth: {
      default: 520,
      '@media (min-width: 768px)': 1200,
    },
    marginInline: 'auto',
    paddingInline: 'var(--spacing-6)',
    boxSizing: 'border-box',
    zIndex: 0,
    pointerEvents: 'none',
  },
  // Breaks the collage out of the 800px hero text column to span the viewport so
  // the inner grid can center at the shared 1200px content width.
  collageBleed: {
    display: {
      default: 'block',
      '@media (min-width: 1024px)': 'none',
    },
    width: '100vw',
    marginInline: 'calc(50% - 50vw)',
    marginBlockStart: 'var(--hero-gap)',
  },
  gaProduct: {
    gridArea: 'product',
    display: 'flex',
    minWidth: 0,
    minHeight: 0,
    textAlign: 'start',
  },
  gaReward: {
    gridArea: 'reward',
    display: 'flex',
    minWidth: 0,
    minHeight: 0,
    textAlign: 'start',
  },
  // Side group: flex column of the small items with a uniform gap. alignSelf
  // start so it keeps its natural height (it's the row-height ruler).
  gaSide: {
    gridArea: 'side',
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'start',
    gap: 'var(--spacing-3)',
    minWidth: 0,
    textAlign: 'start',
  },
  // Radio + badge on one row, shrink to content.
  collagePillRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
  },
  // Per-card reset in the collage: drop the overlap positioning + scaled pose.
  stackCard: {
    position: 'static',
    width: '100%',
    transform: 'none',
    opacity: 1,
  },
  collageProductBody: {
    height: '100%',
  },
  // Image fills the card height without adding intrinsic height (flexBasis:0 +
  // absolutely-filled img), so the side group stays the row-height ruler. minH
  // gives a real height in 2-col (own row, nothing to stretch it); 0 in 3-col.
  collageImageFill: {
    position: 'relative',
    flexGrow: 1,
    flexBasis: 0,
    minHeight: {
      default: 180,
      '@media (min-width: 768px)': 0,
    },
    overflow: 'hidden',
    borderRadius: 'var(--radius-element)',
  },
  collageImageAbs: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  collageRewardCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  // See collageImageFill.
  collageRewardImage: {
    position: 'relative',
    flexGrow: 1,
    flexBasis: 0,
    minHeight: {
      default: 180,
      '@media (min-width: 768px)': 0,
    },
    overflow: 'hidden',
  },
  // Shared base for the overlap-layout floating cards.
  floater: {
    position: 'absolute',
    transitionProperty: 'transform, opacity',
    transitionDuration: 'var(--duration-slow, 600ms)',
    transitionTimingFunction: 'var(--ease-standard, ease)',
    willChange: 'transform, opacity',
  },
  // Overlap cards render at 0.85x (baked into the pose transforms).
  hiddenPose: {
    opacity: 0,
    transform: 'translateY(14px) scale(0.82)',
  },
  shownPose: {
    opacity: 1,
    transform: 'translateY(0) scale(0.85)',
  },
  // Cards scale from their top-left anchor so they don't drift on scale.
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
  // Description capped at two lines (truncates with an ellipsis).
  productDescription: {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
  },

  // ── Overlap-layout positions (desktop). left % sits each card over its aurora
  // blob; the px tops/widths are art-directed. ──────────────────────────────
  productCard: {
    left: '-8%',
    top: 340,
    width: 312,
    boxShadow: 'var(--shadow-high)',
    borderWidth: 0,
    // overflow visible so the chat bubble can break past the card edge.
    overflow: 'visible',
  },
  // Relative so the chat bubble can anchor to the image.
  productImageWrap: {
    position: 'relative',
  },
  // Positions the composer breaking out past the product card's right edge.
  chatBubble: {
    position: 'absolute',
    left: '5%',
    right: 'calc(-1 * var(--spacing-12))',
    bottom: 'var(--spacing-5)',
    transform: 'translateX(var(--spacing-12))',
    pointerEvents: 'none',
    cursor: 'default',
  },
  // Neutral card surface so the composer doesn't pick up the theme's tinted
  // --color-background-popover (e.g. pink on Y2K).
  composerSurface: {
    backgroundColor: 'var(--color-background-card)',
  },
  featureCard: {
    left: '88%',
    top: 380,
    width: 304,
    boxShadow: 'var(--shadow-high)',
    borderWidth: 0,
    overflow: 'hidden',
  },
  // padding for the reward footer (the feature card is padding={0}).
  rewardFooter: {
    padding: 'var(--spacing-4)',
  },
  profileRow: {
    marginBlockStart: 'var(--spacing-2)',
  },
  pillLeading: {
    left: '-11%',
    top: 304,
  },
  pillTrailing: {
    left: '104%',
    top: 326,
  },
  // Bare radio + label — no surface.
  radioPillCard: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    boxShadow: 'none',
    whiteSpace: 'nowrap',
  },
  buyCard: {
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
    <Badge
      variant="green"
      label={content.pills.leading}
      icon={<Sparkles size={12} />}
    />
  );

  const radioEl = (
    <Card padding={2} xstyle={styles.radioPillCard}>
      <RadioList
        label={content.pills.trailing}
        isLabelHidden
        value="selected"
        onChange={() => {}}
        size="sm">
        <RadioListItem label={content.pills.trailing} value="selected" />
      </RadioList>
    </Card>
  );

  const composerEl = (
    <ChatComposer
      value=""
      onChange={() => {}}
      onSubmit={() => {}}
      placeholder={content.chatPrompt}
      xstyle={styles.composerSurface}
      footerActions={
        <Button
          variant="secondary"
          size="md"
          isIconOnly
          icon={<Plus size={16} />}
          label="Add attachment"
        />
      }
      sendButton={<ChatSendButton isDisabled={false} />}
    />
  );

  // Product card body. In overlap mode the composer breaks out over the image;
  // in collage mode the composer is a separate column item, so it's omitted.
  const productCardEl = (
    <Card
      padding={4}
      xstyle={
        stack
          ? [styles.stackCard]
          : [styles.floater, styles.productCard, styles.originTopLeft, pose]
      }>
      <VStack gap={4} xstyle={stack ? styles.collageProductBody : undefined}>
        <VStack gap={1}>
          <Heading level={2}>{content.product.title}</Heading>
          <Text
            type="body"
            color="secondary"
            xstyle={styles.productDescription}>
            {content.product.description}
          </Text>
        </VStack>
        {stack ? (
          // Collage: image grows to fill the card's stretched height.
          <div {...stylex.props(styles.collageImageFill)}>
            <img
              src={content.product.image}
              alt=""
              {...stylex.props(styles.collageImageAbs)}
            />
          </div>
        ) : (
          <div {...stylex.props(styles.productImageWrap)}>
            <div {...stylex.props(styles.imageFrame)}>
              <AspectRatio ratio={1}>
                <img
                  src={content.product.image}
                  alt=""
                  {...stylex.props(styles.image)}
                />
              </AspectRatio>
            </div>
            {/* Overlap-only: composer breaks out past the card edge over the
                photo. In collage mode the composer is its own column item. */}
            <div {...stylex.props(styles.chatBubble)}>{composerEl}</div>
          </div>
        )}
      </VStack>
    </Card>
  );

  const rewardCardEl = (
    <Card
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
            {...stylex.props(styles.collageImageAbs)}
          />
        </div>
      ) : (
        <AspectRatio ratio={1}>
          <img
            src={content.feature.image}
            alt=""
            {...stylex.props(styles.image)}
          />
        </AspectRatio>
      )}
      <div {...stylex.props(styles.rewardFooter)}>
        <VStack gap={2}>
          <HStack gap={2} hAlign="between" vAlign="center">
            <Text type="body" weight="semibold">
              {content.reward.label}
            </Text>
            <Text type="supporting" color="secondary">
              {content.reward.value}/{content.reward.total}
            </Text>
          </HStack>
          <ProgressBar
            label={content.reward.label}
            isLabelHidden
            value={content.reward.value}
            max={content.reward.total}
            variant="accent"
          />
          <HStack gap={2} vAlign="center" xstyle={styles.profileRow}>
            <Avatar
              src={REWARD_MEMBER_AVATAR}
              name={REWARD_MEMBER_NAME}
              size="xsmall"
            />
            <Text type="supporting" color="secondary">
              {REWARD_MEMBER_NAME}
            </Text>
          </HStack>
        </VStack>
      </div>
    </Card>
  );

  const buyCardEl = (
    <Card
      padding={3}
      xstyle={
        stack
          ? [styles.stackCard]
          : [styles.floater, styles.buyCard, styles.originTopLeft, pose]
      }>
      <VStack gap={3}>
        <HStack gap={3} vAlign="center">
          <div {...stylex.props(styles.buyThumbFrame)}>
            <img
              src={content.mini.image}
              alt=""
              {...stylex.props(styles.image)}
            />
          </div>
          <VStack gap={1} xstyle={styles.fullWidth}>
            <Heading level={3}>{content.mini.title}</Heading>
            <Text
              type="supporting"
              color="secondary"
              xstyle={styles.buyDescription}>
              {content.mini.description}
            </Text>
          </VStack>
        </HStack>
        <Button
          variant="secondary"
          size="md"
          label="Add to cart"
          xstyle={styles.fullWidth}
        />
      </VStack>
    </Card>
  );

  // ── Collage layout (narrow screens): CSS grid ─────────────────────────
  // Three areas reflow per tier: 560–1024px → product | reward | side (the
  // small items stacked in col 3); <768px → product | reward on top, side full
  // width below. The side group is one flex column so its items keep a uniform
  // gap (separate grid rows would stretch to the tall cards and look uneven).
  if (stack) {
    return (
      <div {...stylex.props(styles.collageBleed)} aria-hidden="true" inert>
        <div {...stylex.props(styles.collage)}>
          <div {...stylex.props(styles.gaProduct)}>{productCardEl}</div>
          <div {...stylex.props(styles.gaReward)}>{rewardCardEl}</div>
          <div {...stylex.props(styles.gaSide)}>
            {buyCardEl}
            {composerEl}
            <div {...stylex.props(styles.collagePillRow)}>
              {radioEl}
              {badgeEl}
            </div>
          </div>
        </div>
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
