// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack} from '@xds/core/Layout';
import {XDSGrid} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {spacingVars} from '@xds/core/theme/tokens.stylex';
import {components} from '../../../generated/componentRegistry';

// Count of public @xds/core components (excluding hooks and hidden entries),
// rounded down to the nearest 10 for marketing copy. Sourced from the
// generated registry so the number stays accurate as the library grows.
const CORE_COMPONENT_COUNT_ROUNDED =
  Math.floor(
    (components['@xds/core'] ?? []).filter(
      c => !c.hidden && !c.name.startsWith('use'),
    ).length / 10,
  ) * 10;

const styles = stylex.create({
  section: {
    width: '100%',
    overflowX: 'clip',
  },
  // The "stage" hosts the absolutely-positioned floating preview
  // images + the centered CTA card. maxWidth: 1200 matches the
  // shared marketing-section cap used by FeaturesShowcase and
  // AboutShowcase so all three sections line up vertically inside
  // showcaseOverlay; the value isn't on the spacing scale, it's a
  // marketing page measure intentionally kept as a literal.
  stage: {
    position: 'relative',
    width: '100%',
    maxWidth: 1200,
    overflow: 'hidden',
    borderRadius: 'var(--radius-container)',
  },
  card: {
    position: 'relative',
    width: '100%',
    zIndex: 1,
    // 96px / 80px — beyond --spacing-12 (48px), so expressed as
    // calc() over spacing tokens (2× spacing-12, 2× spacing-10)
    // rather than as literals so the rhythm scales with any
    // future spacing-scale theme override.
    paddingBlock: `calc(${spacingVars['--spacing-12']} * 2)`,
    paddingInline: `calc(${spacingVars['--spacing-10']} * 2)`,
  },
  // Each floating image is positioned absolutely against the stage,
  // anchored to one of the four card corners (slightly outside them).
  // The transform is animated from a centered "clumped" pose to the
  // resting pose with rotation when the section scrolls into view.
  //
  // width: 260 is a literal preview card size — these are decorative
  // marketing thumbnails tuned for the desktop composition, not a
  // size scale value. The 960px desktop-on breakpoint is a one-off
  // marketing cutoff (the spread-out poses overflow tighter
  // viewports awkwardly), not the standard 1024px breakpoint used
  // by FeaturesShowcase/AboutShowcase.
  floatingImage: {
    position: 'absolute',
    width: 260,
    height: 'auto',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-high)',
    pointerEvents: 'none',
    transitionProperty: 'transform, top, left, right, bottom',
    transitionDuration: 'var(--duration-slow-max)',
    transitionTimingFunction: 'var(--ease-standard)',
    zIndex: 2,
    display: {
      default: 'none',
      '@media (min-width: 960px)': 'block',
    },
  },
  // Starting "clumped" pose — all four images near the center of the
  // card but with slight offsets and rotations so they fan out as an
  // overlapping rosette (rather than perfectly stacked) before the
  // spread animation. The translate offsets (60-80px) and small
  // rotations (5-8deg) are visual composition values picked to read
  // as a single tight cluster; literal because they're tied to
  // image dimensions, not to the spacing scale.
  floatTopLeftStart: {
    top: '50%',
    left: '50%',
    transform: 'translate(calc(-50% - 80px), calc(-50% - 24px)) rotate(-8deg)',
  },
  floatTopRightStart: {
    top: '50%',
    left: '50%',
    transform: 'translate(calc(-50% + 80px), calc(-50% - 32px)) rotate(6deg)',
  },
  floatBottomLeftStart: {
    top: '50%',
    left: '50%',
    transform: 'translate(calc(-50% - 60px), calc(-50% + 40px)) rotate(7deg)',
  },
  floatBottomRightStart: {
    top: '50%',
    left: '50%',
    transform: 'translate(calc(-50% + 60px), calc(-50% + 32px)) rotate(-5deg)',
  },
  // Resting "spread" poses — each image hugs a corner of the card
  // with a slight outward offset so it overlaps just a little. The
  // negative inset values (-64 / -32) are intentional bleed past the
  // stage edge so the floating images read as "popping out of" the
  // central card rather than being fully contained by it; literal
  // because they're spatial overhangs tied to image dimensions, not
  // spacing-scale values. Negative spacing tokens don't exist in
  // the scale, so even non-bleed offsets here would be literals.
  floatTopLeftEnd: {
    top: -64,
    left: -64,
    transform: 'rotate(-7deg)',
  },
  floatTopRightEnd: {
    top: -64,
    right: -64,
    transform: 'rotate(7deg)',
  },
  floatBottomLeftEnd: {
    bottom: -64,
    left: -32,
    transform: 'rotate(6deg)',
  },
  floatBottomRightEnd: {
    bottom: -64,
    right: -32,
    transform: 'rotate(-6deg)',
  },
  // Inline wordmark glyph baked into the heading text. Sized by
  // `em` (.625em) so the wordmark scales with the heading's font
  // size automatically. marginInline: 16 is a literal because it
  // anchors to the heading glyph metrics, not the spacing scale —
  // the wordmark needs a precise visual gap before and after it
  // (slightly tighter than --spacing-5/20px, slightly wider than
  // --spacing-3/12px) so it reads as a single inline word.
  inlineWordmark: {
    display: 'inline-block',
    verticalAlign: 'baseline',
    height: '.625em',
    width: 'auto',
    marginInline: spacingVars['--spacing-4'],
  },
  // CTA body copy + buttons cap. maxWidth: 560 is a reading
  // measure for the body paragraph, not a spacing-scale value.
  cardContent: {
    maxWidth: 560,
    textAlign: 'center',
    marginInline: 'auto',
  },
  // Two-up button row cap. maxWidth: 360 is a thumb-reachable
  // ergonomic value, not a spacing-scale step.
  buttonGrid: {
    width: '100%',
    maxWidth: 360,
  },
  // Reading-measure cap for the supporting text paragraph. Kept as
  // a stylex rule (instead of inline style) so it composes cleanly
  // with XDSText's xstyle pipeline. 480 is a body-copy reading
  // measure, not a spacing-scale value.
  supportingText: {
    maxWidth: 480,
  },
});

export function DiscoverShowcase() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [spread, setSpread] = useState(false);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) {
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setSpread(true);
            observer.disconnect();
            break;
          }
        }
      },
      {threshold: 0.4},
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <XDSVStack as="section" gap={10} align="center" xstyle={styles.section}>
      {/* "stage" is kept as a raw <div> because its sole job is to
          act as the position:relative anchor for four
          absolutely-positioned floating preview <img>s + the
          centered XDSCard. XDSVStack / XDSHStack would impose flex
          semantics that fight the absolute positioning model and
          would also stack the floating images instead of layering
          them. */}
      <div ref={stageRef} {...stylex.props(styles.stage)}>
        {/* Floating decorative preview images. Kept as raw <img>s
            because @xds/core does not export a general-purpose
            image component (XDSThumbnail is chat-attachment chrome
            with built-in remove buttons; XDSIcon is a glyph
            registry). aria-hidden + empty alt keep them out of the
            accessibility tree — they're pure decoration that
            animates from a clumped pose to a spread pose when the
            section scrolls into view. */}
        <img
          src="/discover-card-1.png"
          alt=""
          aria-hidden="true"
          {...stylex.props(
            styles.floatingImage,
            spread ? styles.floatTopLeftEnd : styles.floatTopLeftStart,
          )}
        />
        <img
          src="/discover-card-3.png"
          alt=""
          aria-hidden="true"
          {...stylex.props(
            styles.floatingImage,
            spread ? styles.floatTopRightEnd : styles.floatTopRightStart,
          )}
        />
        <img
          src="/discover-card-2.png"
          alt=""
          aria-hidden="true"
          {...stylex.props(
            styles.floatingImage,
            spread ? styles.floatBottomLeftEnd : styles.floatBottomLeftStart,
          )}
        />
        <img
          src="/discover-card-4.png"
          alt=""
          aria-hidden="true"
          {...stylex.props(
            styles.floatingImage,
            spread ? styles.floatBottomRightEnd : styles.floatBottomRightStart,
          )}
        />
        <XDSCard variant="gray" padding={0} xstyle={styles.card}>
          <XDSVStack gap={6} align="center" xstyle={styles.cardContent}>
            <XDSVStack gap={6} align="center">
              <XDSHeading level={2} type="display-1" color="primary">
                Discover the full
                {/* Inline wordmark <img> baked into the heading as
                    a visual word substitute. Raw <img> because no
                    XDS Image primitive exists, and we need the
                    image to inherit the heading's font-size
                    cadence (sized in `em` via inlineWordmark
                    xstyle) so it scales with the heading. */}
                <img
                  src="/astryx-logo.svg"
                  alt="Astryx"
                  {...stylex.props(styles.inlineWordmark)}
                />
                design system
              </XDSHeading>
              <XDSText
                type="body"
                color="secondary"
                xstyle={styles.supportingText}>
                Browse {CORE_COMPONENT_COUNT_ROUNDED}+ components, explore
                production-ready templates, and tune themes to match your brand
                — pick a starting point and go.
              </XDSText>
            </XDSVStack>
            <XDSGrid columns={2} gap={3} xstyle={styles.buttonGrid}>
              <XDSButton
                variant="primary"
                size="lg"
                label="Get started"
                href="/docs/getting-started"
              />
              <XDSButton
                variant="secondary"
                size="lg"
                label="Browse components"
                href="/components"
              />
            </XDSGrid>
          </XDSVStack>
        </XDSCard>
      </div>
    </XDSVStack>
  );
}
