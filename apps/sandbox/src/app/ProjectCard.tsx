'use client';

import Link from 'next/link';
import * as stylex from '@stylexjs/stylex';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Stack';
import {shadowVars} from '@xds/core/theme/tokens.stylex';
import type {SandboxPage} from './sandboxPages';

const styles = stylex.create({
  link: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
  },
  cardStyles: {
    width: '100%',
    cursor: 'pointer',
    boxShadow: {
      default: 'none',
      ':hover': shadowVars['--shadow-med'],
    },
  },
});

export function ProjectCard({page}: {page: SandboxPage}) {
  return (
    <Link href={page.href} {...stylex.props(styles.link)}>
      <XDSCard xstyle={styles.cardStyles}>
        <XDSVStack gap={1}>
          <XDSHeading level={3} maxLines={1}>
            {page.name}
          </XDSHeading>
          <XDSText type="body" size="sm" color="secondary" maxLines={2}>
            {page.description}
          </XDSText>
        </XDSVStack>
      </XDSCard>
    </Link>
  );
}
