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
    width: '100%',
    maxWidth: 680,
  },
  subhead: {
    width: '100%',
    maxWidth: 680,
  },
  fillWidth: {
    width: '100%',
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
    <svg
      width={40}
      height={40}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true">
      <path
        fill="var(--color-background-orange)"
        d="M17.081 1.19166C18.7027 -0.397219 21.2973 -0.397219 22.919 1.19166C23.9616 2.21324 25.4625 2.61539 26.8763 2.25201C29.0751 1.68683 31.3221 2.98415 31.9321 5.17099C32.3243 6.57703 33.423 7.67574 34.829 8.06792C37.0159 8.67788 38.3132 10.9249 37.748 13.1237C37.3846 14.5375 37.7868 16.0384 38.8083 17.081C40.3972 18.7027 40.3972 21.2973 38.8083 22.919C37.7868 23.9616 37.3846 25.4625 37.748 26.8763C38.3132 29.0751 37.0159 31.3221 34.829 31.9321C33.423 32.3243 32.3243 33.423 31.9321 34.829C31.3221 37.0159 29.0751 38.3132 26.8763 37.748C25.4625 37.3846 23.9616 37.7868 22.919 38.8083C21.2973 40.3972 18.7027 40.3972 17.081 38.8083C16.0384 37.7868 14.5375 37.3846 13.1237 37.748C10.9249 38.3132 8.67788 37.0159 8.06792 34.829C7.67574 33.423 6.57703 32.3243 5.17099 31.9321C2.98415 31.3221 1.68683 29.0751 2.25201 26.8763C2.61539 25.4625 2.21324 23.9616 1.19166 22.919C-0.397219 21.2973 -0.397219 18.7027 1.19166 17.081C2.21324 16.0384 2.61539 14.5375 2.25201 13.1237C1.68683 10.9249 2.98415 8.67788 5.17099 8.06792C6.57703 7.67574 7.67574 6.57703 8.06792 5.17099C8.67788 2.98415 10.9249 1.68683 13.1237 2.25201C14.5375 2.61539 16.0384 2.21324 17.081 1.19166Z"
      />
    </svg>
  );
}

function SquareIcon() {
  return (
    <svg
      width={40}
      height={40}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true">
      <path
        fill="var(--color-background-purple)"
        d="M33.0469 0C36.8869 0.00014921 39.9999 3.11308 40 6.95312C40 9.9458 38.109 12.4963 35.457 13.4766C38.109 14.4568 39.9999 17.0074 40 20C40 22.9927 38.109 25.5431 35.457 26.5234C38.109 27.5037 39.9999 30.0542 40 33.0469C40 36.887 36.887 39.9998 33.0469 40H6.95312C3.113 39.9999 0 36.887 0 33.0469C9.21712e-05 30.0545 1.89042 27.5039 4.54199 26.5234C1.89043 25.5429 0 22.9924 0 20C9.21712e-05 17.0077 1.89042 14.457 4.54199 13.4766C1.89043 12.496 0 9.94549 0 6.95312C0.000107288 3.11307 3.11307 0.000125546 6.95312 0H33.0469Z"
      />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" aria-hidden="true">
      <rect
        x={6}
        y={6}
        width={28}
        height={28}
        rx={6}
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
      'Foundations you can trust, speed you can feel. The system is built so teams stop reinventing the basics and start shipping the ideas that matter.',
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
      <XDSHeading
        level={2}
        type="display-2"
        color="primary"
        xstyle={styles.fillWidth}>
        Astryx powers over 13,000 apps
      </XDSHeading>
      <XDSText type="body" color="secondary" xstyle={styles.subhead}>
        Astryx has grown inside Meta over the last eight years, shaped by the
        engineers, designers, and product teams who depend on it every day.
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
