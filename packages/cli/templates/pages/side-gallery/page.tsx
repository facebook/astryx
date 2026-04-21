'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSSection} from '@xds/core/Section';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSGrid} from '@xds/core/Grid';
import {XDSDivider} from '@xds/core/Divider';
import * as stylex from '@stylexjs/stylex';

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = stylex.create({
  splitLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr',
    gap: 'var(--spacing-7)',
    alignItems: 'center',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 'var(--radius-element)',
  },
});

// ─── Image Data ─────────────────────────────────────────────────────────────
// From the xds_oss asset set (colorful home + lifestyle collection)
// Source: meta assets.file list -s xds_oss -g <name>

const IMAGES = [
  // colorful-lifestyle-vertical-3 from xds_oss asset set
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-lifestyle-vertical-3.png',
    alt: 'Colorful lifestyle scene',
  },
  // colorful-lifestyle-horizontal-1 from xds_oss asset set
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-lifestyle-horizontal-1.png',
    alt: 'Colorful lifestyle horizontal',
  },
  // colorful-lifestyle-vertical-1 from xds_oss asset set
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-lifestyle-vertical-1.png',
    alt: 'Colorful lifestyle vertical',
  },
  // colorful-home-vertical-2 from xds_oss asset set
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-home-vertical-2.png',
    alt: 'Colorful home interior',
  },
  // colorful-home-vertical-3 from xds_oss asset set
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-home-vertical-3.png',
    alt: 'Colorful home scene',
  },
  // colorful-home-vertical-1 from xds_oss asset set
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-home-vertical-1.png',
    alt: 'Colorful home vertical',
  },
  // colorful-lifestyle-horizontal-2 from xds_oss asset set
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-lifestyle-horizontal-2.png',
    alt: 'Colorful lifestyle wide',
  },
  // colorful-lifestyle-vertical-2 from xds_oss asset set
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-lifestyle-vertical-2.png',
    alt: 'Colorful lifestyle detail',
  },
  // colorful-lifestyle-vertical-4 from xds_oss asset set
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
      {IMAGES.map((img, i) => (
        <XDSAspectRatio key={i} ratio={1}>
          <img src={img.src} alt={img.alt} {...stylex.props(styles.image)} />
        </XDSAspectRatio>
      ))}
    </XDSGrid>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function SideGalleryTemplate() {
  return (
    <XDSAppShell height="auto" contentPadding={0} variant="surface">
      <XDSCenter axis="horizontal">
        <XDSSection variant="transparent" maxWidth={1400} padding={6}>
          <div {...stylex.props(styles.splitLayout)}>
            {/* Left side: Text + CTA */}
            <XDSVStack gap={6} vAlign="center">
              <XDSVStack gap={3}>
                <XDSText type="supporting" color="secondary" weight="semibold">
                  DAIILY
                </XDSText>
                <XDSHeading level={1}>
                  Make every day a little more delightful, one small detail at a
                  time.
                </XDSHeading>
                <XDSText type="body" color="secondary">
                  We believe the smallest details are the ones that matter most.
                  A little color, a thoughtful touch, a moment that catches your
                  eye and makes you pause; that&apos;s what turns an ordinary
                  day into something worth remembering.
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
          </div>
        </XDSSection>
      </XDSCenter>
    </XDSAppShell>
  );
}
