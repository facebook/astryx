'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSVStack, XDSStackItem} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSButton} from '@xds/core/Button';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSIcon} from '@xds/core/Icon';
import {XDSMediaTheme} from '@xds/core/theme';
import {ArrowRightIcon} from '@heroicons/react/24/outline';
import * as stylex from '@stylexjs/stylex';

// ─── Styles ────────────────────────────────────────────────────────────────

const layoutStyles = stylex.create({
  fullHeight: {
    height: '100%',
  },
  minHeightZero: {
    minHeight: 0,
  },
  textCenter: {
    textAlign: 'center',
  },
  desktopOnly: {
    display: {
      default: 'flex',
      '@media (max-width: 767px)': 'none',
    },
  },
  mobileOnly: {
    display: {
      default: 'none',
      '@media (max-width: 767px)': 'flex',
    },
  },
  mobileGap: {
    gap: {
      default: null,
      '@media (max-width: 767px)': 'var(--spacing-3)',
    },
  },
});

const overlayStyles = stylex.create({
  card: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'clip',
    borderRadius: 'var(--radius-element)',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'var(--color-overlay)',
    opacity: {
      default: 0,
      ':hover': 1,
    },
    transition: 'opacity 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: 'var(--spacing-6)',
  },
});

// ─── Gallery Data ───────────────────────────────────────────────────────────

interface GalleryImage {
  src: string;
  title: string;
  description: string;
}

const IMAGES: GalleryImage[] = [
  {
    // illustrative-horizontal-1 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/illustrative-horizontal-1.jpg',
    title: 'Going places',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
  },
  {
    // light-home-horizontal-1 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/light-home-horizontal-1.png',
    title: 'Making memories',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
  },
  {
    // light-lifestyle-vertical-3 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/light-lifestyle-vertical-3.png',
    title: 'Seeing things',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
  },
  {
    // light-lifestyle-vertical-1 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/light-lifestyle-vertical-1.png',
    title: 'Sharing ideas',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
  },
  {
    // light-lifestyle-horizontal-1 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/light-lifestyle-horizontal-1.png',
    title: 'Being free',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
  },
];

const imgStyles = stylex.create({
  cover: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    minHeight: 0,
  },
});

// ─── Gallery Card with Hover Overlay ────────────────────────────────────────

function GalleryCard({image}: {image: GalleryImage}) {
  return (
    <div {...stylex.props(overlayStyles.card)}>
      <img
        src={image.src}
        alt={image.title}
        {...stylex.props(imgStyles.cover)}
      />
      <div {...stylex.props(overlayStyles.overlay)}>
        <XDSMediaTheme mode="dark">
          <XDSVStack gap={3}>
            <XDSHeading level={2}>{image.title}</XDSHeading>
            <XDSText type="body">{image.description}</XDSText>
            <XDSButton
              label="Read more"
              variant="secondary"
              endContent={<XDSIcon icon={ArrowRightIcon} />}
            />
          </XDSVStack>
        </XDSMediaTheme>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MixedGalleryTemplate() {
  return (
    <XDSAppShell height="fill" contentPadding={6} variant="surface">
      <XDSCenter axis="horizontal" height="100%">
        <XDSSection
          variant="transparent"
          maxWidth={1400}
          width="100%"
          height="100%"
          padding={0}>
          <XDSVStack
            gap={6}
            xstyle={[layoutStyles.fullHeight, layoutStyles.mobileGap]}>
            {/* Header — capped with XDSSection maxWidth */}
            <XDSCenter axis="horizontal">
              <XDSSection variant="transparent" maxWidth={680}>
                <XDSVStack gap={2} xstyle={layoutStyles.textCenter}>
                  <XDSHeading level={1}>
                    Make every day a little more delightful, one detail at a
                    time.
                  </XDSHeading>
                  <XDSText type="body">
                    We believe the smallest details are the ones that matter
                    most. A little color, a thoughtful touch, a moment that
                    catches your eye and makes you pause; that's what turns an
                    ordinary day into something worth remembering.
                  </XDSText>
                </XDSVStack>
              </XDSSection>
            </XDSCenter>

            {/* Gallery — desktop: 3-col masonry, mobile: single column */}

            {/* Desktop layout (hidden on mobile) */}
            <XDSStackItem size="fill" xstyle={layoutStyles.desktopOnly}>
              <XDSGrid columns={3} gap={4} height="100%">
                <XDSVStack gap={4} xstyle={layoutStyles.minHeightZero}>
                  <XDSStackItem size="fill">
                    <GalleryCard image={IMAGES[0]} />
                  </XDSStackItem>
                  <XDSStackItem size="fill">
                    <GalleryCard image={IMAGES[1]} />
                  </XDSStackItem>
                </XDSVStack>

                <GalleryCard image={IMAGES[2]} />

                <XDSVStack gap={4} xstyle={layoutStyles.minHeightZero}>
                  <XDSStackItem size="fill">
                    <GalleryCard image={IMAGES[3]} />
                  </XDSStackItem>
                  <XDSStackItem size="fill">
                    <GalleryCard image={IMAGES[4]} />
                  </XDSStackItem>
                </XDSVStack>
              </XDSGrid>
            </XDSStackItem>

            {/* Mobile layout (hidden on desktop) */}
            <XDSVStack gap={4} xstyle={layoutStyles.mobileOnly}>
              {IMAGES.map((image, i) => (
                <XDSAspectRatio key={i} ratio={16 / 9}>
                  <GalleryCard image={image} />
                </XDSAspectRatio>
              ))}
            </XDSVStack>
          </XDSVStack>
        </XDSSection>
      </XDSCenter>
    </XDSAppShell>
  );
}
