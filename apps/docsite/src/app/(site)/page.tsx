// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSLink} from '@xds/core/Link';
import {XDSBadge} from '@xds/core/Badge';
import {XDSVStack} from '@xds/core/Layout';
import {XDSGrid} from '@xds/core/Grid';
import {XDSButton} from '@xds/core/Button';
import {spacingVars} from '@xds/core/theme/tokens.stylex';
import {ThemingShowcase} from './_landing/ThemingShowcase';
import {FeaturesShowcase} from './_landing/FeaturesShowcase';
import {AboutShowcase} from './_landing/AboutShowcase';
import {DiscoverShowcase} from './_landing/DiscoverShowcase';

const styles = stylex.create({
  // Wraps hero + showcase together so the sticky hero (position: sticky)
  // bounds its sticky range to this container. Without the wrapper, the
  // hero would stay pinned through the footer (a sibling further down
  // the AppShell main content), which on mobile shows up as the hero
  // bleeding underneath the footer at the bottom of the page.
  heroScope: {
    position: 'relative',
    backgroundColor: 'var(--color-background-body)',
  },
  heroContent: {
    position: 'sticky',
    top: 'var(--appshell-header-height, 0px)',
    maxWidth: 800,
    marginInline: 'auto',
    paddingBlock: `calc(${spacingVars['--spacing-12']} * 3)`,
    paddingInline: spacingVars['--spacing-6'],
    textAlign: 'center',
    gap: spacingVars['--spacing-12'],
  },
  // Wrapper around the wordmark + floating Beta badge. Sized
  // exactly to the wordmark image (display:inline-block with no
  // explicit width, so the inline element shrinks to the image's
  // natural rendered width) and centered horizontally by the
  // parent VStack's align:stretch + the wrapper's marginInline:
  // auto. position:relative establishes the positioning context
  // for the absolutely-positioned Beta badge.
  heroWordmarkWrap: {
    position: 'relative',
    display: 'inline-block',
    alignSelf: 'center',
  },
  heroWordmark: {
    display: 'block',
    height: 42,
    width: 'auto',
  },
  // Floating Beta badge wrapper — positions the XDSBadge above
  // the wordmark (bottom anchored to the wordmark's top edge)
  // and offset right so it reads as a callout attached to the
  // brand mark without overlapping any of the glyphs. The XDS
  // Badge component carries the pill chrome (background, radius,
  // typography); only positioning + rotation lives here.
  heroWordmarkBeta: {
    position: 'absolute',
    bottom: '100%',
    right: -24,
    marginBottom: 4,
    transform: 'rotate(8deg)',
    transformOrigin: 'bottom right',
  },
  heroButtons: {
    width: '100%',
    maxWidth: 420,
  },
  showcaseOverlay: {
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 'var(--radius-page)',
    borderTopRightRadius: 'var(--radius-page)',
    backgroundColor: 'var(--color-background-surface)',
    paddingBlock: spacingVars['--spacing-12'],
    paddingInline: spacingVars['--spacing-6'],
    gap: `calc(${spacingVars['--spacing-12']} * 2)`,
  },
});

export default function HomePage() {
  const showcaseRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = showcaseRef.current;
    if (!el) {
      return;
    }

    function readNavHeight() {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(
        '--appshell-header-height',
      );
      return parseFloat(raw) || 64;
    }

    function update() {
      if (!el) {
        return;
      }
      const navHeight = readNavHeight();
      const top = el.getBoundingClientRect().top;
      const reached = top <= navHeight;
      if (reached) {
        document.body.setAttribute('data-nav-mode', 'surface');
      } else {
        document.body.removeAttribute('data-nav-mode');
      }
    }

    update();
    window.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update, {passive: true});

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      document.body.removeAttribute('data-nav-mode');
    };
  }, []);

  return (
    <div {...stylex.props(styles.heroScope)}>
      <XDSVStack
        data-home-page="true"
        align="stretch"
        xstyle={styles.heroContent}>
        <div {...stylex.props(styles.heroWordmarkWrap)}>
          <img
            src="/astryx-logo.svg"
            alt="Astryx"
            {...stylex.props(styles.heroWordmark)}
          />
          <span {...stylex.props(styles.heroWordmarkBeta)}>
            <XDSBadge label="Beta" variant="blue" />
          </span>
        </div>
        <XDSVStack gap={4} align="center">
          <XDSHeading level={1} type="display-1" color="primary">
            An open source design system that's fully customizable and agent
            ready
          </XDSHeading>
          <XDSText display="block">
            Built on{' '}
            <XDSLink
              type="body"
              color="primary"
              href="https://react.dev"
              target="_blank"
              rel="noopener noreferrer"
              hasUnderline>
              React
            </XDSLink>
          </XDSText>
        </XDSVStack>
        <XDSVStack align="center">
          <XDSGrid columns={2} gap={3} xstyle={styles.heroButtons}>
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
      </XDSVStack>
      <XDSVStack ref={showcaseRef} xstyle={styles.showcaseOverlay}>
        <ThemingShowcase />
        <FeaturesShowcase />
        <AboutShowcase />
        <DiscoverShowcase />
      </XDSVStack>
    </div>
  );
}
