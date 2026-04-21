'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSVStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSMediaTheme} from '@xds/core/theme';
import {ArrowRightIcon} from '@heroicons/react/24/outline';
import * as stylex from '@stylexjs/stylex';

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = stylex.create({
  textCenter: {
    textAlign: 'center',
  },
  card: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'clip',
    borderRadius: 'var(--radius-element)',
  },
  img: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
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

// ─── Gallery Card with Hover Overlay ────────────────────────────────────────

function GalleryCard({image}: {image: GalleryImage}) {
  return (
    <div {...stylex.props(styles.card)}>
      <img
        src={image.src}
        alt={image.title}
        {...stylex.props(styles.img)}
      />
      <div {...stylex.props(styles.overlay)}>
        <XDSMediaTheme mode="dark">
          <XDSVStack gap={2}>
            <XDSHeading level={3}>{image.title}</XDSHeading>
            <XDSText type="body">
              One small thing to turn your day around.
            </XDSText>
            <XDSButton
              label="Read more"
              variant="secondary"
              size="sm"
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
    <XDSAppShell height="auto" contentPadding={6} variant="surface">
      <XDSCenter axis="horizontal">
        <XDSSection variant="transparent" maxWidth={1400} width="100%" padding={0}>
          <XDSVStack gap={6}>
            {/* Header — capped with XDSSection maxWidth */}
            <XDSCenter axis="horizontal">
              <XDSSection variant="transparent" maxWidth={680}>
                <XDSVStack gap={2} xstyle={styles.textCenter}>
                  <XDSHeading level={1}>
                    Make every day a little more delightful, one detail at a
                    time.
                  </XDSHeading>
                  <XDSText type="body">
                    We believe the smallest details are the ones that matter
                    most. A little color, a thoughtful touch, a moment that
                    catches your eye and makes you pause; that&apos;s what turns
                    an ordinary day into something worth remembering.
                  </XDSText>
                </XDSVStack>
              </XDSSection>
            </XDSCenter>

            {/* Featured masonry — hero + sidebar + bottom row */}
            <XDSGrid columns={3} rowHeight={70} gap={3}>
              {/* Hero — 2 cols × 5 rows */}
              <XDSGridSpan columns={2} rows={5}>
                <GalleryCard image={IMAGES[0]} />
              </XDSGridSpan>

              {/* Sidebar — full height */}
              <XDSGridSpan rows={5}>
                <GalleryCard image={IMAGES[2]} />
              </XDSGridSpan>

              {/* Bottom row */}
              <XDSGridSpan rows={3}>
                <GalleryCard image={IMAGES[3]} />
              </XDSGridSpan>
              <XDSGridSpan rows={3}>
                <GalleryCard image={IMAGES[4]} />
              </XDSGridSpan>
              <XDSGridSpan rows={3}>
                <GalleryCard image={IMAGES[1]} />
              </XDSGridSpan>
            </XDSGrid>
          </XDSVStack>
        </XDSSection>
      </XDSCenter>
    </XDSAppShell>
  );
}
