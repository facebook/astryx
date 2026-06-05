// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {
  XDSVStack,
  XDSHStack,
  XDSLayout,
  XDSLayoutContent,
} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {ArrowRightIcon} from '@heroicons/react/20/solid';

// light-scene-horizontal-1 from xds_oss asset set
const IMAGE_URL =
  'https://lookaside.facebook.com/assets/xds_oss/light-scene-horizontal-1.png';

const styles = stylex.create({
  textCenter: {
    textAlign: 'center',
  },
  titleResponsive: {
    fontSize: {
      default: 'var(--text-display-2-size)',
      '@media (max-width: 640px)': 'var(--text-display-3-size)',
    },
  },
  topSpacing: {
    paddingTop: 'var(--spacing-12)',
  },
  heroImage: {
    width: 'calc(100% - var(--spacing-6) * 2)',
    marginInline: 'var(--spacing-6)',
    borderRadius: 'var(--radius-page)',
    display: 'block',
    maxHeight: 550,
    objectFit: 'cover',
  },
});

export default function CenteredHero() {
  return (
    <XDSLayout
      content={
        <XDSLayoutContent padding={0}>
          <XDSVStack gap={10}>
            <XDSVStack gap={6} hAlign="center" xstyle={styles.topSpacing}>
              <XDSVStack gap={3} hAlign="center">
                <XDSText
                  type="display-2"
                  as="h1"
                  weight="bold"
                  textWrap="balance"
                  xstyle={[styles.textCenter, styles.titleResponsive]}>
                  Little joys, everywhere you go
                </XDSText>
                <XDSText
                  type="body"
                  color="secondary"
                  textWrap="balance"
                  xstyle={styles.textCenter}>
                  Sometimes all it takes is one small thing to turn your whole
                  day around.
                </XDSText>
              </XDSVStack>
              <XDSHStack gap={3}>
                <XDSButton
                  label="Get started"
                  variant="primary"
                  endContent={
                    <XDSIcon icon={ArrowRightIcon} size="sm" color="inherit" />
                  }
                />
                <XDSButton label="Learn more" variant="secondary" />
              </XDSHStack>
            </XDSVStack>
            <img
              {...stylex.props(styles.heroImage)}
              src={IMAGE_URL}
              alt="Serene landscape with cotton fields and towering clouds"
            />
          </XDSVStack>
        </XDSLayoutContent>
      }
    />
  );
}
