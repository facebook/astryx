// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSMediaTheme} from '@xds/core/theme';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSButton} from '@xds/core/Button';
import {XDSSection} from '@xds/core/Section';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

// light-home-square-1 from xds_oss asset set
const BRIGHT_ROOM_IMAGE_URL =
  'https://lookaside.facebook.com/assets/xds_oss/light-home-square-1.png';

export default function MediaThemeLightScrim() {
  return (
    <XDSAspectRatio
      ratio={16 / 9}
      style={{
        width: 360,
        maxWidth: '100%',
        borderRadius: 'var(--radius-container)',
      }}>
      <img
        src={BRIGHT_ROOM_IMAGE_URL}
        alt="Bright room"
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />
      <XDSSection
        variant="transparent"
        padding={4}
        style={{
          position: 'absolute',
          insetBlockStart: 16,
          insetInlineStart: 16,
          maxWidth: 250,
          background: 'rgba(255,255,255,0.82)',
          borderRadius: 'var(--radius-container)',
          boxShadow: 'var(--shadow-med)',
        }}>
        <XDSMediaTheme mode="light">
          <XDSStack direction="vertical" gap={2}>
            <XDSText type="body" weight="bold">
              Bright media surface
            </XDSText>
            <XDSText type="supporting" color="secondary">
              Use mode="light" when content sits on a light card or scrim.
            </XDSText>
            <XDSButton label="Open" variant="ghost" size="sm" />
          </XDSStack>
        </XDSMediaTheme>
      </XDSSection>
    </XDSAspectRatio>
  );
}
