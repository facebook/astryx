'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSHoverCard} from '@xds/core/HoverCard';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const styles = stylex.create({
  avatar: {flexShrink: 0},
});

export default function HoverCardInlineTextHoverCard() {
  return (
    <XDSText type="body">
      The project is maintained by{' '}
      <XDSHoverCard
        content={
          <XDSHStack gap={2} vAlign="center">
            <XDSAvatar name="Jane Doe" size={32} xstyle={styles.avatar} />
            <XDSVStack gap={0}>
              <XDSText type="label">@janedoe</XDSText>
              <XDSText type="supporting" color="secondary">
                Software Engineer
              </XDSText>
            </XDSVStack>
          </XDSHStack>
        }
        placement="above">
        @janedoe
      </XDSHoverCard>
      ,{' '}
      <XDSHoverCard
        content={
          <XDSHStack gap={2} vAlign="center">
            <XDSAvatar name="John Smith" size={32} xstyle={styles.avatar} />
            <XDSVStack gap={0}>
              <XDSText type="label">@johnsmith</XDSText>
              <XDSText type="supporting" color="secondary">
                Product Manager
              </XDSText>
            </XDSVStack>
          </XDSHStack>
        }
        placement="above">
        @johnsmith
      </XDSHoverCard>
      , and others.
    </XDSText>
  );
}
