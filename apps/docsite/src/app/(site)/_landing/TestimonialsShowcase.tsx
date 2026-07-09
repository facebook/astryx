// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TestimonialsShowcase.tsx
 *
 * Home-page "Testimonials" section. A two-row marquee of real launch reception
 * (see ./testimonials.ts). Each row uses the Magic UI / beui.dev marquee: two
 * identical side-by-side groups, each animating translateX(0 → -100% - gap), so
 * the loop is seamless (no half-gap drift) and never shows a blank gap.
 *
 * Cards with a public source are ClickableCard (whole-surface navigation with
 * built-in hover/focus/active states, opening the post in a new tab); community
 * quotes with no permalink render as an inert Card. Named public figures show a
 * real profile photo + @handle; everyone else falls back to Avatar initials.
 *
 * Motion rules (per repo StyleX guidance):
 *   - Pause on hover via stylex.when.ancestor(':hover', marqueeScope), guarded
 *     by @media (hover: hover) so touch devices never "stick" paused. The scope
 *     is a component-scoped marker (not defaultMarker) so only hovering the
 *     marquee viewport pauses it — not the surrounding showcase/nav.
 *   - @media (prefers-reduced-motion: reduce): the animation is dropped and the
 *     viewport becomes horizontally scrollable so the content stays reachable.
 *
 * The viewport breaks out of the showcase overlay's inline padding so the strip
 * runs edge-to-edge, with a gradient mask fading both ends.
 *
 * @input  MARQUEE_ROWS (curated testimonials)
 * @output A marketing social-proof section for the home page
 * @position Rendered inside the home page showcase overlay (app/(site)/page.tsx),
 *           after AboutShowcase and before BlogShowcase.
 */

'use client';

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Heading, Text} from '@astryxdesign/core/Text';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Card} from '@astryxdesign/core/Card';
import {Link} from '@astryxdesign/core/Link';
import {Avatar} from '@astryxdesign/core/Avatar';
import {spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
import {MARQUEE_ROWS, type Testimonial} from './testimonials';
import {marqueeScope} from './testimonialsMarquee.stylex';

// Magic UI / beui.dev technique: each group translates by its OWN full width
// PLUS one gap (`-100% - gap`). Two identical groups sit side by side, so at
// loop reset the second group lands exactly where the first began — seamless,
// with no half-gap drift (the bug you get translating a single gapped flex row
// by -50%, since N cards have only N-1 internal gaps but a period needs N).
const marquee = stylex.keyframes({
  '0%': {transform: 'translateX(0)'},
  '100%': {transform: 'translateX(calc(-100% - var(--spacing-4)))'},
});

const CARD_WIDTH = 340;
const CARD_HEIGHT = 180;
const ROW_DURATIONS = ['62s', '52s'] as const;

// Each looping copy is padded (by repeating the row's cards) to at least this
// many cards so one copy is always wider than the viewport. That guarantees the
// translateX(-50%) loop is seamless AND that the strip is full at every frame —
// no blank gap even for short rows or on ultra-wide screens.
const MIN_CARDS_PER_COPY = 10;

function repeatToMin<T>(items: readonly T[], min: number): readonly T[] {
  if (items.length === 0) {
    return items;
  }
  const out: T[] = [];
  while (out.length < min) {
    out.push(...items);
  }
  return out;
}

// "@handle · Role" (either part optional) shown under the author name.
function metaLine(testimonial: Testimonial): string {
  return [
    testimonial.handle ? `@${testimonial.handle}` : null,
    testimonial.role,
  ]
    .filter(Boolean)
    .join(' · ');
}

const styles = stylex.create({
  section: {
    width: '100%',
    alignItems: 'center',
  },
  // Header matches the other showcase sections: capped at the 1200 marketing
  // measure and centered within the overlay's padded content box.
  header: {
    width: '100%',
    maxWidth: 1200,
    textAlign: 'start',
  },
  // Full-bleed strip: cancel the showcase overlay's inline padding so the rows
  // run to the viewport edges, then fade both ends with a gradient mask.
  // alignSelf:stretch is REQUIRED — the section is align-items:center (to center
  // the header), which would otherwise shrink-wrap this element to its 8500px+
  // content width, so overflow-x:hidden would clip nothing and the scroll window
  // would land on empty track (the "blank" gap).
  viewport: {
    alignSelf: 'stretch',
    width: 'auto',
    marginInline: 'calc(var(--spacing-6) * -1)',
    overflowX: {
      default: 'hidden',
      '@media (prefers-reduced-motion: reduce)': 'auto',
    },
    overflowY: 'hidden',
    paddingBlock: spacingVars['--spacing-2'],
    // Prevent a press on a moving card from becoming a text drag-selection —
    // ClickableCard bails navigation when there's a selection, which made the
    // cards feel "unclickable" while scrolling.
    userSelect: 'none',
    WebkitUserSelect: 'none',
    // Fade the full-bleed strip in the gutters so the solid region lines up with
    // the ~1200px content column used by the other showcase sections. Each fade
    // spans the gutter (min 56px so narrow screens still soften the edges).
    maskImage:
      'linear-gradient(to right, transparent, #000 max(56px, calc((100% - 1200px) / 2)), #000 calc(100% - max(56px, calc((100% - 1200px) / 2))), transparent)',
    WebkitMaskImage:
      'linear-gradient(to right, transparent, #000 max(56px, calc((100% - 1200px) / 2)), #000 calc(100% - max(56px, calc((100% - 1200px) / 2))), transparent)',
  },
  // Track holds two identical groups side by side. The gap here (between the
  // two groups) must equal the gap inside each group AND the gap baked into the
  // keyframe, or the seam drifts.
  track: {
    display: 'flex',
    flexWrap: 'nowrap',
    width: 'max-content',
    gap: 'var(--spacing-4)',
    marginBlockStart: spacingVars['--spacing-4'],
  },
  trackFirst: {
    marginBlockStart: 0,
  },
  // Each group scrolls itself by (100% + gap); the two groups chase each other
  // for a seamless infinite loop.
  group: {
    display: 'flex',
    flexWrap: 'nowrap',
    flexShrink: 0,
    gap: 'var(--spacing-4)',
    animationName: {
      default: marquee,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    // Pause whenever the pointer is over the strip so cards are easy to click.
    // No @media (hover: hover) guard here — the guard could leave the row moving
    // (and thus hard to click) on setups that don't report hover capability.
    animationPlayState: {
      default: 'running',
      [stylex.when.ancestor(':hover', marqueeScope)]: 'paused',
    },
    willChange: 'transform',
  },
  // Second row travels the opposite direction.
  groupReverse: {
    animationDirection: 'reverse',
  },
});

// Runtime per-row cadence — StyleX dynamic style (the sanctioned alternative to
// an inline style on a raw element).
const dynamic = stylex.create({
  duration: (value: string) => ({animationDuration: value}),
});

const cardStyles = stylex.create({
  card: {
    flexShrink: 0,
    whiteSpace: 'normal',
    transitionProperty: 'border-color',
    transitionDuration: '150ms',
    borderColor: {
      default: 'var(--color-border)',
      ':hover': 'var(--color-border-emphasized)',
    },
  },
  // The link wraps the whole card so the entire surface is a click target.
  // Pin the width so the anchor (a flex item) can't collapse narrower than the
  // card — otherwise all-link rows shrink and expose a gap.
  cardLink: {
    display: 'block',
    width: CARD_WIDTH,
    flexShrink: 0,
    cursor: 'pointer',
    color: 'inherit',
    textDecoration: {
      default: 'none',
      ':hover': 'none',
    },
  },
  // minWidth:0 lets the name/handle truncate instead of forcing the card wider.
  identity: {
    minWidth: 0,
  },
  oneLine: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  quote: {
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
});

// Card inner content — quote on top, author identity pinned to the bottom.
// Link-free so it can be reused by ClickableCard, inert Card, and the
// aria-hidden loop duplicates.
function CardContent({testimonial}: {testimonial: Testimonial}) {
  return (
    <VStack gap={4} align="stretch" height="100%" vAlign="between">
      <Text type="body" color="primary" xstyle={cardStyles.quote}>
        &ldquo;{testimonial.quote}&rdquo;
      </Text>
      <HStack gap={3} align="center">
        <Avatar
          name={testimonial.author}
          src={testimonial.avatar}
          size="small"
        />
        <VStack gap={0} align="stretch" xstyle={cardStyles.identity}>
          <Text
            type="body"
            weight="semibold"
            color="primary"
            xstyle={cardStyles.oneLine}>
            {testimonial.author}
          </Text>
          <Text type="supporting" color="secondary" xstyle={cardStyles.oneLine}>
            {metaLine(testimonial)}
          </Text>
        </VStack>
      </HStack>
    </VStack>
  );
}

// A testimonial card. When it has a public source the WHOLE card is a link
// (so every visible instance is clickable — critical because the marquee shows
// the padding repeats and the second looping copy just as often as the first).
// `decorative` copies stay mouse-clickable but are removed from the keyboard
// tab order and hidden from assistive tech, so the loop duplicates don't create
// repeat announcements or extra tab stops.
function TestimonialCard({
  testimonial,
  decorative = false,
}: {
  testimonial: Testimonial;
  decorative?: boolean;
}) {
  const card = (
    <Card
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      padding={5}
      xstyle={cardStyles.card}>
      <CardContent testimonial={testimonial} />
    </Card>
  );

  if (!testimonial.href) {
    // No public source → not a link. Hide decorative duplicates from AT.
    return decorative ? <div aria-hidden="true">{card}</div> : card;
  }

  return (
    <Link
      href={testimonial.href}
      target="_blank"
      rel="noopener noreferrer"
      color="inherit"
      display="block"
      hasUnderline={false}
      label={
        decorative ? undefined : `${testimonial.author}: ${testimonial.quote}`
      }
      aria-hidden={decorative || undefined}
      tabIndex={decorative ? -1 : undefined}
      xstyle={cardStyles.cardLink}>
      {card}
    </Link>
  );
}

function MarqueeRow({
  testimonials,
  index,
}: {
  testimonials: readonly Testimonial[];
  index: number;
}): ReactNode {
  // Each group is padded to at least MIN_CARDS_PER_COPY so it alone fills the
  // viewport (required for the two-group loop to never expose a gap).
  const copy = repeatToMin(testimonials, MIN_CARDS_PER_COPY);
  const reversed = index % 2 === 1;
  const duration = dynamic.duration(
    ROW_DURATIONS[index % ROW_DURATIONS.length],
  );
  const groupProps = stylex.props(
    styles.group,
    reversed && styles.groupReverse,
    duration,
  );
  return (
    <div {...stylex.props(styles.track, index === 0 && styles.trackFirst)}>
      {/* Group 1 — the first pass of the unique cards is the keyboard/AT copy;
          padding repeats are decorative (clickable, but not focusable). */}
      <div {...groupProps}>
        {copy.map((testimonial, i) => (
          <TestimonialCard
            key={i}
            testimonial={testimonial}
            decorative={i >= testimonials.length}
          />
        ))}
      </div>
      {/* Group 2 — the chasing duplicate. Every card is decorative but still
          mouse-clickable so the loop has no dead (unclickable) cards. */}
      <div {...groupProps}>
        {copy.map((testimonial, i) => (
          <TestimonialCard key={i} testimonial={testimonial} decorative />
        ))}
      </div>
    </div>
  );
}

export function TestimonialsShowcase() {
  return (
    <VStack as="section" gap={8} xstyle={styles.section}>
      <VStack gap={2} align="start" xstyle={styles.header}>
        <Heading level={2} type="display-2" color="primary">
          Testimonials
        </Heading>
      </VStack>
      <div {...stylex.props(styles.viewport, marqueeScope)}>
        {MARQUEE_ROWS.map((testimonials, index) => (
          <MarqueeRow key={index} testimonials={testimonials} index={index} />
        ))}
      </div>
    </VStack>
  );
}
