'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSHoverCard} from '@xds/core/HoverCard';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSIcon} from '@xds/core/Icon';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {CalendarIcon} from '@heroicons/react/24/outline';

const styles = stylex.create({
  avatar: {flexShrink: 0},
});

export default function HoverCardInlineTextHoverCard() {
  return (
    <XDSText type="body">
      The project is maintained by{' '}
      <XDSHoverCard
        content={
          <XDSVStack gap={2}>
            <XDSHStack gap={3} vAlign="start">
              <XDSAvatar name="Jane Doe" size="medium" xstyle={styles.avatar} />
              <XDSVStack gap={1}>
                <XDSHeading level={3}>@janedoe</XDSHeading>
                <XDSText type="supporting" color="secondary">
                  Software Engineer
                </XDSText>
              </XDSVStack>
            </XDSHStack>
            <XDSHStack gap={1} vAlign="center">
              <XDSIcon icon={CalendarIcon} size="xsm" color="secondary" />
              <XDSText type="supporting" color="secondary">
                Joined March 2024
              </XDSText>
            </XDSHStack>
          </XDSVStack>
        }
        placement="above">
        @janedoe
      </XDSHoverCard>
      ,{' '}
      <XDSHoverCard
        content={
          <XDSVStack gap={2}>
            <XDSHStack gap={3} vAlign="start">
              <XDSAvatar
                name="John Smith"
                size="medium"
                xstyle={styles.avatar}
              />
              <XDSVStack gap={1}>
                <XDSHeading level={3}>@johnsmith</XDSHeading>
                <XDSText type="supporting" color="secondary">
                  Product Manager
                </XDSText>
              </XDSVStack>
            </XDSHStack>
            <XDSHStack gap={1} vAlign="center">
              <XDSIcon icon={CalendarIcon} size="xsm" color="secondary" />
              <XDSText type="supporting" color="secondary">
                Joined January 2025
              </XDSText>
            </XDSHStack>
          </XDSVStack>
        }
        placement="above">
        @johnsmith
      </XDSHoverCard>
      , and others.
    </XDSText>
  );
}
