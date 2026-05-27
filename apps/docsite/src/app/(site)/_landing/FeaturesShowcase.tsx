// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSLink} from '@xds/core/Link';
import {XDSBadge} from '@xds/core/Badge';
import {XDSTheme} from '@xds/core/theme';
import {neutralTheme} from '@xds/theme-neutral/built';
import {spacingVars} from '@xds/core/theme/tokens.stylex';

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
  },
  headingBlock: {
    textAlign: 'center',
    maxWidth: 720,
  },
  grid: {
    width: '100%',
    maxWidth: 1200,
    display: 'grid',
    gridTemplateColumns: {
      default: '1fr',
      '@media (min-width: 720px)': 'repeat(3, 1fr)',
    },
    gridAutoRows: '1fr',
    gap: spacingVars['--spacing-4'],
  },
  cardTall: {
    height: '100%',
    gridRow: {
      default: 'auto',
      '@media (min-width: 720px)': 'span 2',
    },
  },
  card: {
    height: '100%',
  },
});

type Feature = {
  title: string;
  description: string;
  href: string;
};

const features: Feature[] = [
  {
    title: 'Measured and tested',
    description:
      'Every API choice is measured against real usage by people and LLMs before it ships.',
    href: '/docs',
  },
  {
    title: 'Over 82 Components',
    description:
      'Accessible and themeable React components with built-in spacing, dark mode, and StyleX styling.',
    href: '/components',
  },
  {
    title: 'Themes That Fit Your Brand',
    description:
      'Fully customizable themes ready for use. Make it yours without starting from scratch.',
    href: '/themes',
  },
  {
    title: 'Ready to Ship Templates',
    description:
      'Production-ready templates for common pages, just plug in your content.',
    href: '/templates',
  },
  {
    title: 'Your design system on the command line',
    description:
      'Scaffold projects, browse templates, generate themes, and get agent-ready docs from the command line.',
    href: '/docs/cli',
  },
];

function FeatureCard({feature, isTall}: {feature: Feature; isTall?: boolean}) {
  return (
    <XDSCard
      variant="default"
      padding={5}
      xstyle={isTall ? styles.cardTall : styles.card}>
      <XDSVStack gap={3} align="start">
        <XDSHeading level={3} color="primary">
          {feature.title}
        </XDSHeading>
        <XDSText type="body" color="secondary">
          {feature.description}
        </XDSText>
        <XDSLink
          type="body"
          color="active"
          href={feature.href}
          hasUnderline={false}>
          Explore →
        </XDSLink>
      </XDSVStack>
    </XDSCard>
  );
}

function FeaturesHeading() {
  return (
    <XDSVStack
      gap={2}
      align="center"
      xstyle={styles.headingBlock}
      style={{textAlign: 'center'}}>
      <XDSBadge variant="blue" label="Key features" />
      <XDSHeading level={2} type="display-2" color="primary">
        Start anywhere, change
        <br />
        anything, ship faster.
      </XDSHeading>
      <XDSText type="body" color="secondary">
        A design system that adapts to your workflow, not the other way around.
        <br />
        Built for speed, clarity, and creative freedom.
      </XDSText>
    </XDSVStack>
  );
}

export function FeaturesShowcase() {
  return (
    <section {...stylex.props(styles.section)}>
      <FeaturesHeading />
      <XDSTheme theme={neutralTheme} mode="light">
        <div {...stylex.props(styles.grid)}>
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              isTall={i === 0}
            />
          ))}
        </div>
      </XDSTheme>
    </section>
  );
}
