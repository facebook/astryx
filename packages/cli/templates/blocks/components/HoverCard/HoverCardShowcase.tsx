'use client';

import {XDSHoverCard} from '@xds/core/HoverCard';
import {XDSButton} from '@xds/core/Button';
import {XDSStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSAvatar} from '@xds/core/Avatar';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  card: {
    width: 240,
  },
});

export default function HoverCardShowcase() {
  return (
    <XDSHoverCard
      placement="above"
      isDefaultOpen
      content={
        <XDSStack direction="vertical" gap={2} xstyle={styles.card}>
          <XDSStack direction="horizontal" gap={2} vAlign="center">
            <XDSAvatar name="Jane Doe" size="medium" />
            <XDSStack direction="vertical" gap={0}>
              <XDSHeading level={5}>Jane Doe</XDSHeading>
              <XDSText type="supporting" color="secondary">
                Software Engineer
              </XDSText>
            </XDSStack>
          </XDSStack>
          <XDSText type="body" color="secondary">
            Building great products with great people.
          </XDSText>
        </XDSStack>
      }>
      <XDSButton label="@janedoe" variant="ghost" />
    </XDSHoverCard>
  );
}
