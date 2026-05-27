// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSBadge} from '@xds/core/Badge';
import {XDSDivider} from '@xds/core/Divider';
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
    maxWidth: 760,
  },
  subhead: {
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
  },
  column: {
    paddingBlock: spacingVars['--spacing-8'],
    paddingInline: spacingVars['--spacing-6'],
    borderLeftWidth: {
      default: 0,
      '@media (min-width: 720px)': 1,
    },
    borderLeftStyle: 'solid',
    borderLeftColor: 'var(--color-border)',
  },
  firstColumn: {
    borderLeftWidth: 0,
  },
  topDivider: {
    width: '100%',
    maxWidth: 1200,
  },
  iconSlot: {
    height: 48,
    marginBottom: spacingVars['--spacing-4'],
  },
});

type AboutItem = {
  title: string;
  description: string;
  icon: ReactNode;
};

function BlobIcon() {
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" aria-hidden="true">
      <path
        fill="var(--color-background-orange)"
        d="M20 0c5 0 9 2 12 6s8 5 8 10-5 5-7 9-3 11-9 12-9-5-13-7-11-1-11-7 6-7 7-12 4-10 9-11 4 0 4 0Z"
      />
    </svg>
  );
}

function SquareIcon() {
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" aria-hidden="true">
      <rect
        x={6}
        y={6}
        width={28}
        height={28}
        rx={8}
        fill="var(--color-background-purple)"
        transform="rotate(8 20 20)"
      />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" aria-hidden="true">
      <rect
        x={9}
        y={9}
        width={22}
        height={22}
        rx={4}
        fill="var(--color-background-yellow)"
        transform="rotate(45 20 20)"
      />
    </svg>
  );
}

const items: AboutItem[] = [
  {
    title: 'Built by the people who use it',
    description:
      'The system gets sharper when more people can see it, use it, and shape it.',
    icon: <BlobIcon />,
  },
  {
    title: 'The bar keeps moving',
    description:
      "The quality bar isn't fixed – it's accelerating. AI is rewriting how we design, build, and review code, and Astryx is built to evolve with it. Opinionated foundations, flexible patterns, and a system that keeps pace with where craft is going next.",
    icon: <SquareIcon />,
  },
  {
    title: 'Designed for speed',
    description:
      "Speed isn't a feature, it's the foundation. Astryx exists so makers can focus on what they're building, not how to build it.",
    icon: <DiamondIcon />,
  },
];

function AboutHeading() {
  return (
    <XDSVStack
      gap={2}
      align="center"
      xstyle={styles.headingBlock}
      style={{textAlign: 'center'}}>
      <XDSBadge variant="orange" label="About us" />
      <XDSHeading level={2} type="display-2" color="primary">
        astryx is used
        <br />
        to build over 13,000 tools
      </XDSHeading>
      <XDSText type="body" color="secondary" xstyle={styles.subhead}>
        We want to help builders like us to create better things as fast as
        possible. We value ease for builders and cohesive experiences for
        consumers. We also believe in collaborating to build a system that works
        for us, together.
      </XDSText>
    </XDSVStack>
  );
}

function AboutColumn({item, isFirst}: {item: AboutItem; isFirst: boolean}) {
  return (
    <div
      {...stylex.props(styles.column, isFirst && styles.firstColumn)}
      style={{textAlign: 'left'}}>
      <div {...stylex.props(styles.iconSlot)}>{item.icon}</div>
      <XDSVStack gap={2} align="start">
        <XDSHeading level={3} color="primary">
          {item.title}
        </XDSHeading>
        <XDSText type="body" color="secondary">
          {item.description}
        </XDSText>
      </XDSVStack>
    </div>
  );
}

export function AboutShowcase() {
  return (
    <section {...stylex.props(styles.section)}>
      <AboutHeading />
      <XDSTheme theme={neutralTheme} mode="light">
        <XDSDivider variant="subtle" xstyle={styles.topDivider} />
        <div {...stylex.props(styles.grid)}>
          {items.map((item, i) => (
            <AboutColumn key={item.title} item={item} isFirst={i === 0} />
          ))}
        </div>
        <XDSDivider variant="subtle" xstyle={styles.topDivider} />
      </XDSTheme>
    </section>
  );
}
