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
    paddingBlock: spacingVars['--spacing-12'],
    paddingInline: spacingVars['--spacing-6'],
    backgroundColor: 'var(--color-background-surface)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacingVars['--spacing-10'],
    overflowX: 'clip',
  },
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
    // 96px / 80px — beyond --spacing-12 (48px), so expressed as 2x token values.
    paddingBlock: `calc(${spacingVars['--spacing-12']} * 2)`,
    paddingInline: `calc(${spacingVars['--spacing-10']} * 2)`,
  },
  // Each floating image is positioned absolutely against the stage,
  // anchored to one of the four card corners (slightly outside them).
  // The transform is animated from a centered "clumped" pose to the
  // resting pose with rotation when the section scrolls into view.
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
  // Starting "clumped" pose — all four images near the center of the card
  // but with slight offsets and rotations so they fan out as an overlapping
  // rosette (rather than perfectly stacked) before the spread animation.
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
  // Resting "spread" poses — each image hugs a corner of the card with
  // a slight offset outward so it overlaps just a little.
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
  content: {
    textAlign: 'center',
    maxWidth: 680,
  },
  headlineRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    columnGap: spacingVars['--spacing-3'],
    rowGap: spacingVars['--spacing-2'],
  },
  inlineWordmark: {
    display: 'inline-block',
    height: '0.6em',
    width: 'auto',
    verticalAlign: '0.06em',
    marginTop: 8,
  },
  buttons: {
    width: '100%',
    maxWidth: 360,
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
    <section {...stylex.props(styles.section)}>
      <div ref={stageRef} {...stylex.props(styles.stage)}>
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
        <XDSCard variant="blue" padding={0} xstyle={styles.card}>
          <XDSVStack
            gap={4}
            align="center"
            xstyle={styles.content}
            style={{textAlign: 'center', marginInline: 'auto'}}>
            <XDSHeading level={2} type="display-1" color="primary">
              <span {...stylex.props(styles.headlineRow)}>
                <span>Discover the full</span>
                <img
                  src="/astryx-logo.svg"
                  alt="Astryx"
                  {...stylex.props(styles.inlineWordmark)}
                />
                <span>design system.</span>
              </span>
            </XDSHeading>
            <XDSText type="body" color="secondary">
              Browse {CORE_COMPONENT_COUNT_ROUNDED}+ components, explore
              production-ready templates, and tune themes to match your brand —
              pick a starting point and go.
            </XDSText>
            <XDSGrid columns={2} gap={3} xstyle={styles.buttons}>
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
    </section>
  );
}
