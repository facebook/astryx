// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  XDSVStack,
  XDSHStack,
  XDSLayout,
  XDSLayoutContent,
} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSGrid} from '@xds/core/Grid';
import {XDSDivider} from '@xds/core/Divider';
import * as stylex from '@stylexjs/stylex';

// Image fill is a plain inline style (not stylex) so it survives the playground
// preview's runtime TS compile, which doesn't run the StyleX babel plugin.
const imageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const,
};

const styles = stylex.create({
  imageClip: {
    borderRadius: 'var(--radius-element)',
  },
});

// ─── Image Data ─────────────────────────────────────────────────────────────
// From the xds_oss asset set (colorful home + lifestyle collection)
// Source: meta assets.file list -s xds_oss -g <name>

const IMAGES = [
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-lifestyle-vertical-3.png',
    alt: 'Colorful lifestyle scene',
  },
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-lifestyle-horizontal-1.png',
    alt: 'Colorful lifestyle horizontal',
  },
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-lifestyle-vertical-1.png',
    alt: 'Colorful lifestyle vertical',
  },
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-home-vertical-2.png',
    alt: 'Colorful home interior',
  },
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-home-vertical-3.png',
    alt: 'Colorful home scene',
  },
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-home-vertical-1.png',
    alt: 'Colorful home vertical',
  },
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-lifestyle-horizontal-2.png',
    alt: 'Colorful lifestyle wide',
  },
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-lifestyle-vertical-2.png',
    alt: 'Colorful lifestyle detail',
  },
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-lifestyle-vertical-4.png',
    alt: 'Colorful lifestyle portrait',
  },
];

// ─── Stat Block ─────────────────────────────────────────────────────────────

function StatBlock({value, label}: {value: string; label: string}) {
  return (
    <XDSVStack gap={0}>
      <XDSText type="large" weight="bold">
        {value}
      </XDSText>
      <XDSText type="supporting" color="secondary">
        {label}
      </XDSText>
    </XDSVStack>
  );
}

// ─── Image Grid ─────────────────────────────────────────────────────────────

function ImageGrid() {
  return (
    <XDSGrid columns={3} gap={3}>
      {IMAGES.map(img => (
        <XDSAspectRatio key={img.src} ratio={1} xstyle={styles.imageClip}>
          <img src={img.src} alt={img.alt} style={imageStyle} />
        </XDSAspectRatio>
      ))}
    </XDSGrid>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function SideGalleryTemplate() {
  return (
    <XDSLayout
      height="auto"
      contentWidth={1400}
      content={
        <XDSLayoutContent padding={6}>
          <XDSGrid
            columns={{minWidth: 360, repeat: 'fit'}}
            gap={8}
            align="center">
            {/* Left side: Text + CTA */}
            <XDSVStack gap={6} vAlign="center">
              <XDSVStack gap={3}>
                <XDSText type="supporting" color="secondary" weight="semibold">
                  COLORFUL
                </XDSText>
                <XDSHeading level={1}>
                  Make every day a little more delightful, one small detail at a
                  time.
                </XDSHeading>
                <XDSText type="body" color="secondary">
                  The smallest details are the ones that matter most. A little
                  color that catches your eye and makes you pause; that&apos;s
                  what turns an ordinary day into something worth remembering.
                </XDSText>
              </XDSVStack>

              <XDSHStack gap={3} vAlign="center">
                <XDSButton label="Explore" variant="primary" />
              </XDSHStack>

              <XDSVStack gap={4}>
                <XDSDivider />
                <XDSHStack gap={6}>
                  <StatBlock value="12k+" label="Photos" />
                  <StatBlock value="350+" label="Projects" />
                  <StatBlock value="8yrs" label="Experience" />
                </XDSHStack>
              </XDSVStack>
            </XDSVStack>

            {/* Right side: Image Grid */}
            <ImageGrid />
          </XDSGrid>
        </XDSLayoutContent>
      }
    />
  );
}
