// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as stylex from '@stylexjs/stylex';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSLink} from '@xds/core/Link';
import {XDSVStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSMediaTheme} from '@xds/core/theme';
import {ThemingShowcase} from './_landing/ThemingShowcase';

const styles = stylex.create({
  hero: {
    minHeight: 'calc(100vh - 64px)',
    backgroundColor: 'var(--color-background-body)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: 48,
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
    marginTop: 24,
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
      <XDSMediaTheme mode="light">
        <ThemingShowcase />
      </XDSMediaTheme>
    </>
  );
}
