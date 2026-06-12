// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSMediaTheme} from '@xds/core/theme';
import {XDSSection} from '@xds/core/Section';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSBadge} from '@xds/core/Badge';
import {XDSIcon} from '@xds/core/Icon';

// light-scene-horizontal-1 from xds_oss asset set
const SHOWCASE_IMAGE_URL =
  'https://lookaside.facebook.com/assets/xds_oss/light-scene-horizontal-1.png';

export default function MediaThemeShowcase() {
  return (
    <XDSSection
      variant="transparent"
      padding={4}
      style={{
        width: 360,
        maxWidth: '100%',
        minHeight: 230,
        display: 'flex',
        alignItems: 'flex-end',
        backgroundImage: `linear-gradient(180deg, rgba(10,19,23,0.05) 0%, rgba(10,19,23,0.82) 100%), url(${SHOWCASE_IMAGE_URL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: 'var(--radius-container)',
        boxShadow: 'var(--shadow-med)',
      }}>
      <XDSMediaTheme mode="dark">
        <XDSStack direction="vertical" gap={3}>
          <XDSStack direction="horizontal" gap={2} vAlign="center">
            <XDSIcon icon="info" size="md" />
            <XDSText type="body" weight="bold">
              Media overlay
            </XDSText>
            <XDSBadge label="Live" />
          </XDSStack>
          <XDSText type="supporting" color="secondary">
            Text, icons, badges, and button variants inherit legible colors on
            top of the dark image treatment.
          </XDSText>
          <XDSStack direction="horizontal" gap={2} wrap="wrap">
            <XDSButton label="Primary" variant="primary" size="sm" />
            <XDSButton label="Secondary" variant="secondary" size="sm" />
            <XDSButton label="Ghost" variant="ghost" size="sm" />
          </XDSStack>
        </XDSStack>
      </XDSMediaTheme>
    </XDSSection>
  );
}
