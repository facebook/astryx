'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSHoverCard} from '@xds/core/HoverCard';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';

const styles = stylex.create({
  avatar: {flexShrink: 0},
});

export default function HoverCardProfileHoverCard() {
  return (
    <XDSHoverCard
      placement="below"
      content={
        <XDSHStack gap={3} vAlign="start">
          <XDSAvatar name="Jane Doe" size="large" xstyle={styles.avatar} />
          <XDSVStack gap={1}>
            <XDSHeading level={2}>Jane Doe</XDSHeading>
            <XDSText type="supporting" color="secondary">
              Software Engineer · San Francisco
            </XDSText>
            <XDSText type="body">
              Building great products with great people.
            </XDSText>
          </XDSVStack>
        </XDSHStack>
      }>
      <XDSButton label="Jane Doe" variant="ghost" />
    </XDSHoverCard>
  );
}
