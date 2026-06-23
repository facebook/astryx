// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {MediaTheme} from '@xds/core/theme';
import {AspectRatio} from '@xds/core/AspectRatio';
import {Button} from '@xds/core/Button';
import {Section} from '@xds/core/Section';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

// light-home-square-1 from astryx asset set
const BRIGHT_ROOM_IMAGE_URL =
  'https://lookaside.facebook.com/assets/astryx/light-home-square-1.png';

export default function MediaThemeLightScrim() {
  return (
    <AspectRatio
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
      <Section
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
        <MediaTheme mode="light">
          <Stack direction="vertical" gap={2}>
            <Text type="body" weight="bold">
              Bright media surface
            </Text>
            <Text type="supporting" color="secondary">
              Use mode="light" when content sits on a light card or scrim.
            </Text>
            <Button label="Open" variant="ghost" size="sm" />
          </Stack>
        </MediaTheme>
      </Section>
    </AspectRatio>
  );
}
