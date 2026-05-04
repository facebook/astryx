'use client';

import {XDSMediaTheme} from '@xds/core/theme';
import {XDSSection} from '@xds/core/Section';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';

export default function MediaThemeShowcase() {
  return (
    <XDSStack direction="horizontal" gap={4} vAlign="stretch">
      <XDSSection
        variant="transparent"
        padding={4}
        style={{
          flex: 1,
          backgroundColor: 'var(--color-background-inverted)',
          borderRadius: 'var(--radius-container)',
        }}>
        <XDSMediaTheme mode="dark">
          <XDSStack direction="vertical" gap={2}>
            <XDSText type="body" weight="bold">
              Dark surface
            </XDSText>
            <XDSText type="supporting" color="secondary">
              Content over media, overlays, or inverted backgrounds like toasts
              and tooltips.
            </XDSText>
            <XDSButton label="Action" variant="ghost" />
          </XDSStack>
        </XDSMediaTheme>
      </XDSSection>
      <XDSSection variant="muted" padding={4} style={{flex: 1}}>
        <XDSMediaTheme mode="light">
          <XDSStack direction="vertical" gap={2}>
            <XDSText type="body" weight="bold">
              Light surface
            </XDSText>
            <XDSText type="supporting" color="secondary">
              Content on light overlays or scrims where the background is
              bright.
            </XDSText>
            <XDSButton label="Action" variant="ghost" />
          </XDSStack>
        </XDSMediaTheme>
      </XDSSection>
    </XDSStack>
  );
}
