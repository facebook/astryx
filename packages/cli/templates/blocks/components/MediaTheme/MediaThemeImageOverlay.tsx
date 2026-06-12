// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSMediaTheme} from '@xds/core/theme';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSButton} from '@xds/core/Button';
import {XDSSection} from '@xds/core/Section';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

// light-scene-horizontal-1 from xds_oss asset set
const LANDSCAPE_IMAGE_URL =
  'https://lookaside.facebook.com/assets/xds_oss/light-scene-horizontal-1.png';

export default function MediaThemeImageOverlay() {
  return (
    <XDSAspectRatio
      ratio={16 / 9}
      style={{
        width: 360,
        maxWidth: '100%',
        borderRadius: 'var(--radius-container)',
      }}>
      <img
        src={LANDSCAPE_IMAGE_URL}
        alt="Landscape"
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />
      <XDSSection
        variant="transparent"
        padding={4}
        style={{
          position: 'absolute',
          insetInline: 0,
          insetBlockEnd: 0,
          background:
            'linear-gradient(180deg, transparent, rgba(10,19,23,0.78))',
        }}>
        <XDSMediaTheme mode="dark">
          <XDSStack direction="vertical" gap={2}>
            <XDSText type="body" weight="bold">
              Product launch livestream
            </XDSText>
            <XDSText type="supporting" color="secondary">
              MediaTheme keeps overlay text and controls readable without
              hard-coded color overrides.
            </XDSText>
            <XDSStack direction="horizontal" gap={2} wrap="wrap">
              <XDSButton label="Watch" size="sm" />
              <XDSButton label="Details" variant="secondary" size="sm" />
            </XDSStack>
          </XDSStack>
        </XDSMediaTheme>
      </XDSSection>
    </XDSAspectRatio>
  );
}
