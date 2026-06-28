// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {VStack} from '@astryxdesign/core/Layout';
import {Grid} from '@astryxdesign/core/Grid';
import {Card} from '@astryxdesign/core/Card';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
import {AstryxLogo} from '../../../components/logos';
import {components} from '../../../generated/componentRegistry';
import {layout} from '../../../layout.stylex';

// Count of public @astryxdesign/core components (excluding hooks and hidden entries),
// rounded down to the nearest 10 for marketing copy. Sourced from the
// generated registry so the number stays accurate as the library grows.
const CORE_COMPONENT_COUNT_ROUNDED =
  Math.floor(
    (components['@astryxdesign/core'] ?? []).filter(
      c => !c.hidden && !c.name.startsWith('use'),
    ).length / 10,
  ) * 10;

const styles = stylex.create({
  section: {
    width: '100%',
    overflowX: 'clip',
  },
  // The "stage" hosts the absolutely-positioned floating preview
  // images + the centered CTA card, capped so all three home
  // showcases line up vertically inside showcaseOverlay.
  stage: {
    position: 'relative',
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    overflow: 'hidden',
    borderRadius: 'var(--radius-container)',
    isolation: 'isolate',
  },
  card: {
    position: 'relative',
    width: '100%',
    zIndex: 1,
    marginInline: 'auto',
    maxWidth: {
      default: 'calc(100% - var(--spacing-8))',
      '@media (min-width: 960px)': '100%',
    },
    // Locally retint the `muted` surface to the page body color so this CTA
    // card blends into the body (reads as a content group shaped by padding +
    // corners, not a colored surface). Scoped to this card only — overriding
    // --color-background-muted theme-wide would also recolor code blocks,
    // table rows, sliders, etc. that rely on the default subtle muted tint.
    '--color-background-muted': 'var(--color-background-body)',
    // Roomy on desktop (96px / 80px — beyond --spacing-12, so expressed as
    // calc() over spacing tokens so the rhythm scales with any future
    // spacing-scale theme override), but tightened on narrow screens where
    // the doubled inline padding (160px total) crushed the content into a
    // thin column. Mobile uses the standard spacing scale; the generous
    // composition padding only kicks in once there's room for it.
    paddingBlock: {
      default: spacingVars['--spacing-10'],
      '@media (min-width: 768px)': `calc(${spacingVars['--spacing-12']} * 2)`,
    },
    paddingInline: {
      default: spacingVars['--spacing-6'],
      '@media (min-width: 768px)': `calc(${spacingVars['--spacing-10']} * 2)`,
    },
  },
  // Each floating image is positioned against the stage. Mobile keeps the
  // cards visible as a small collage tucked behind the CTA card; desktop spreads
  // them to the stage corners. width:260 is the desktop art-directed thumbnail
  // size; mobile uses viewport clamps so the stack stays inside the rounded
  // stage instead of forcing horizontal overflow.
  floatingImage: {
    position: 'absolute',
    width: {
      default: 'clamp(132px, 43vw, 188px)',
      '@media (min-width: 768px)': 'clamp(176px, 28vw, 236px)',
      '@media (min-width: 960px)': 260,
    },
    height: 'auto',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-high)',
    pointerEvents: 'none',
    transitionProperty: 'transform, top, left, right, bottom',
    transitionDuration: 'var(--duration-slow-max)',
    transitionTimingFunction: 'var(--ease-standard)',
    zIndex: 2,
    display: 'block',
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
    top: {
      default: spacingVars['--spacing-3'],
      '@media (min-width: 960px)': -64,
    },
    left: {
      default: `calc(-1 * ${spacingVars['--spacing-8']})`,
      '@media (min-width: 960px)': -64,
    },
    transform: {
      default: 'rotate(-8deg)',
      '@media (min-width: 960px)': 'rotate(-7deg)',
    },
  },
  floatTopRightEnd: {
    top: {
      default: spacingVars['--spacing-3'],
      '@media (min-width: 960px)': -64,
    },
    right: {
      default: `calc(-1 * ${spacingVars['--spacing-8']})`,
      '@media (min-width: 960px)': -64,
    },
    transform: {
      default: 'rotate(8deg)',
      '@media (min-width: 960px)': 'rotate(7deg)',
    },
  },
  floatBottomLeftEnd: {
    bottom: {
      default: spacingVars['--spacing-3'],
      '@media (min-width: 960px)': -64,
    },
    left: {
      default: `calc(-1 * ${spacingVars['--spacing-10']})`,
      '@media (min-width: 960px)': -32,
    },
    transform: 'rotate(6deg)',
  },
  floatBottomRightEnd: {
    bottom: {
      default: spacingVars['--spacing-3'],
      '@media (min-width: 960px)': -64,
    },
    right: {
      default: `calc(-1 * ${spacingVars['--spacing-10']})`,
      '@media (min-width: 960px)': -32,
    },
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
    height: '.75em',
    width: 'auto',
    marginInline: spacingVars['--spacing-4'],
    color: 'var(--color-brand)',
  },
  // CTA body copy + buttons cap. maxWidth: 560 is a reading
  // measure for the body paragraph, not a spacing-scale value.
  cardContent: {
    maxWidth: 560,
    textAlign: 'center',
    marginInline: 'auto',
  },
  // Two-up button row cap. maxWidth: 360 is a thumb-reachable
  // ergonomic value. The grid uses auto-fit 160px tracks in markup
  // so narrow phones collapse to one centered column instead of
  // forcing the buttons into undersized cells. Literals are button
  // ergonomics values, not spacing-scale steps.
  buttonGrid: {
    width: '100%',
    maxWidth: 360,
    marginInline: 'auto',
  },
  // Reading-measure cap for the supporting text paragraph. Kept as
  // a stylex rule (instead of inline style) so it composes cleanly
  // with Text's xstyle pipeline. 480 is a body-copy reading
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
    <VStack as="section" gap={10} align="center" xstyle={styles.section}>
      {/* "stage" is kept as a raw <div> because its sole job is to
          act as the position:relative anchor for four
          absolutely-positioned floating preview <img>s + the
          centered Card. VStack / HStack would impose flex
          semantics that fight the absolute positioning model and
          would also stack the floating images instead of layering
          them. */}
      <div ref={stageRef} {...stylex.props(styles.stage)}>
        {/* Floating decorative preview images. Kept as raw <img>s
            because @astryxdesign/core does not export a general-purpose
            image component (Thumbnail is chat-attachment chrome
            with built-in remove buttons; Icon is a glyph
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
        <Card variant="muted" padding={0} xstyle={styles.card}>
          <VStack gap={6} align="center" xstyle={styles.cardContent}>
            <VStack gap={6} align="center">
              <Heading level={2} type="display-1" color="primary">
                Discover the full
                <AstryxLogo
                  role="img"
                  aria-label="Astryx"
                  {...stylex.props(styles.inlineWordmark)}
                />
                design system
              </Heading>
              <Text
                type="body"
                color="secondary"
                xstyle={styles.supportingText}>
                Browse {CORE_COMPONENT_COUNT_ROUNDED}+ components, explore
                production-ready templates, and tune themes to match your brand;
                pick a starting point and go.
              </Text>
            </VStack>
            <Grid
              columns={{minWidth: 160, repeat: 'fit'}}
              gap={3}
              xstyle={styles.buttonGrid}>
              <Button
                variant="primary"
                size="lg"
                label="Get started"
                href="/docs/getting-started"
              />
              <Button
                variant="secondary"
                size="lg"
                label="Browse components"
                href="/components"
              />
            </Grid>
          </VStack>
        </Card>
      </div>
    </VStack>
  );
}
