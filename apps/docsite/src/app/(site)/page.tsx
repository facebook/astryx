// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSLink} from '@xds/core/Link';
import {XDSDivider} from '@xds/core/Divider';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSGrid} from '@xds/core/Grid';
import {XDSButton} from '@xds/core/Button';
import {XDSMediaTheme} from '@xds/core/theme';
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
    maxWidth: 680,
    marginInline: 'auto',
    paddingBlockStart: `calc(${spacingVars['--spacing-12']} * 2.5)`,
    paddingBlockEnd: `calc(${spacingVars['--spacing-12']} * 3)`,
    paddingInline: spacingVars['--spacing-6'],
    textAlign: 'center',
  },
  showcaseOverlay: {
    position: 'relative',
    borderTopLeftRadius: 'var(--radius-page)',
    borderTopRightRadius: 'var(--radius-page)',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-surface)',
    // Pulls the rounded overlay up so it visually lifts onto the hero.
    marginTop: `calc(${spacingVars['--spacing-8']} * -1)`,
  },
  wordmark: {
    display: 'block',
    height: 42,
    width: 'auto',
  },
  captionDivider: {
    height: '1.25em',
  },
  buttons: {
    width: '100%',
    maxWidth: 480,
    marginInline: 'auto',
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
      <XDSVStack gap={10} xstyle={styles.heroContent} data-home-page="true">
        <XDSVStack gap={6}>
          <img
            src="/astryx-logo.svg"
            alt="Astryx"
            {...stylex.props(styles.wordmark)}
          />
          <XDSHeading level={1} type="display-1" color="primary">
            An open source design system built for collaboration, made for
            teams, crafted with care
          </XDSHeading>
          <XDSHStack gap={4} hAlign="center">
            <XDSText>
              Currently in{' '}
              <XDSText display="inline" weight="bold">
                Beta
              </XDSText>
            </XDSText>
            <XDSDivider orientation="vertical" xstyle={styles.captionDivider} />
            <XDSText>
              Built on{' '}
              <XDSLink
                type="body"
                color="primary"
                href="https://react.dev"
                target="_blank"
                rel="noopener noreferrer"
                hasUnderline>
                React
              </XDSLink>{' '}
              and{' '}
              <XDSLink
                type="body"
                color="primary"
                href="https://stylexjs.com"
                target="_blank"
                rel="noopener noreferrer"
                hasUnderline>
                StyleX
              </XDSLink>
            </XDSText>
          </XDSHStack>
        </XDSVStack>
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
      <div ref={showcaseRef} {...stylex.props(styles.showcaseOverlay)}>
        <ThemingShowcase />
        <FeaturesShowcase />
        <AboutShowcase />
        <DiscoverShowcase />
      </div>
    </div>
  );
}
