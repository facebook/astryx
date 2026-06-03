// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSLink} from '@xds/core/Link';
import {XDSDivider} from '@xds/core/Divider';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
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
  heroWordmark: {
    display: 'block',
    height: 42,
    width: 'auto',
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
        <img
          src="/astryx-logo.svg"
          alt="Astryx"
          {...stylex.props(styles.heroWordmark)}
        />
        <XDSHeading level={1} type="display-1" color="primary">
          An open source design system that's fully customizable and agent ready
        </XDSHeading>
        <XDSVStack gap={8} align="center">
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
          <XDSHStack gap={2} align="center">
            <XDSText display="block" type="supporting">
              Currently in{' '}
              <XDSText type="inherit" weight="bold">
                Beta
              </XDSText>
            </XDSText>
            <XDSDivider
              orientation="vertical"
              variant="strong"
              style={{height: '0.75em'}}
            />
            <XDSText display="block" type="supporting">
              Built on{' '}
              <XDSLink
                type="inherit"
                color="inherit"
                href="https://react.dev/"
                hasUnderline>
                React
              </XDSLink>
            </XDSText>
          </XDSHStack>
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
