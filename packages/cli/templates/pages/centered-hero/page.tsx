// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {
  XDSVStack,
  XDSHStack,
  XDSLayout,
  XDSLayoutContent,
} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSSection} from '@xds/core/Section';
import {ArrowRightIcon} from '@heroicons/react/20/solid';

// light-scene-horizontal-1 from the localized template-assets set
const IMAGE_URL = '/template-assets/light-scene-horizontal-1.png';

// NOTE: The only custom styling in this template is image fill/cap/radius
// below. It exists because XDS has no image primitive — XDSAspectRatio exposes
// no objectFit/maxWidth/align/radius props and there's no XDSImage. Tracked
// for eng in issue #2582; replace these with component props once it lands.
const styles = stylex.create({
  // Fills the XDSAspectRatio box. No objectFit prop on XDSAspectRatio (#2582).
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  // Caps the image width, centers it, and rounds its corners. No
  // maxWidth/align/radius props on XDSAspectRatio (#2582).
  heroFrame: {
    maxWidth: 1200,
    marginInline: 'auto',
    borderRadius: 'var(--radius-page)',
  },
});

export default function CenteredHero() {
  return (
    <XDSLayout
      content={
        <XDSLayoutContent padding={6}>
          <XDSVStack gap={10}>
            <XDSVStack gap={6} hAlign="center">
              <XDSVStack gap={3} hAlign="center">
                <XDSHeading
                  level={1}
                  type="display-2"
                  justify="center"
                  textWrap="balance">
                  Little joys, everywhere you go
                </XDSHeading>
                <XDSText
                  type="body"
                  color="secondary"
                  justify="center"
                  textWrap="balance">
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
            <XDSSection variant="transparent" padding={0}>
              <XDSAspectRatio ratio={16 / 9} xstyle={styles.heroFrame}>
                <img
                  {...stylex.props(styles.heroImage)}
                  src={IMAGE_URL}
                  alt="A bright, colorful lifestyle scene"
                />
              </XDSAspectRatio>
            </XDSSection>
          </XDSVStack>
        </XDSLayoutContent>
      }
    />
  );
}
