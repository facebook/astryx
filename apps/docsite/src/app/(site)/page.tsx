// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSLink} from '@xds/core/Link';
import {XDSVStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSMediaTheme} from '@xds/core/theme';
import {ThemingShowcase} from './_landing/ThemingShowcase';

const styles = stylex.create({
  hero: {
    position: 'sticky',
    top: 'var(--appshell-header-height, 0px)',
    zIndex: 0,
    backgroundColor: 'var(--color-background-body)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    paddingBlock: 96,
    paddingInline: 48,
  },
  showcaseOverlay: {
    position: 'relative',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-surface)',
    marginTop: -32,
  },
  wordmark: {
    display: 'block',
    height: 42,
    width: 'auto',
    marginBottom: 16,
  },
  headline: {
    maxWidth: 680,
  },
  caption: {
    marginTop: 8,
    maxWidth: 560,
  },
  buttons: {
    marginTop: 32,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    width: '100%',
    maxWidth: 360,
  },
});

export default function HomePage() {
  const showcaseRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = showcaseRef.current;
    if (!el) {return;}

    function readNavHeight() {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(
        '--appshell-header-height',
      );
      return parseFloat(raw) || 64;
    }

    function update() {
      if (!el) {return;}
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
    <>
      <div {...stylex.props(styles.hero)} data-home-page="true">
        <XDSMediaTheme mode="light">
          <XDSVStack gap={2} style={{alignItems: 'center'}}>
            <img
              src="/astryx-logo.svg"
              alt="Astryx"
              {...stylex.props(styles.wordmark)}
            />
            <XDSHeading
              level={1}
              type="display-1"
              color="primary"
              xstyle={styles.headline}>
              A open source design system
              <br />
              built for collaboration, made for teams, crafted with care
            </XDSHeading>
            <XDSText
              type="body"
              size="base"
              color="primary"
              xstyle={styles.caption}>
              Currently in <strong>Beta</strong>, built on{' '}
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
            <div {...stylex.props(styles.buttons)}>
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
            </div>
          </XDSVStack>
        </XDSMediaTheme>
      </div>
      <div ref={showcaseRef} {...stylex.props(styles.showcaseOverlay)}>
        <XDSMediaTheme mode="light">
          <ThemingShowcase />
        </XDSMediaTheme>
      </div>
    </>
  );
}
