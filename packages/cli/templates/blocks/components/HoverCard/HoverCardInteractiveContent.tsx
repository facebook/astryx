'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSHoverCard} from '@xds/core/HoverCard';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {CalendarIcon} from '@heroicons/react/24/outline';

const styles = stylex.create({
  avatar: {flexShrink: 0},
});

export default function HoverCardInteractiveContent() {
  return (
    <XDSHoverCard
      placement="below"
      content={
        <XDSVStack gap={3}>
          <XDSHStack gap={3} vAlign="start">
            <XDSAvatar name="John Smith" size="large" xstyle={styles.avatar} />
            <XDSVStack gap={1}>
              <XDSHeading level={3}>@johnsmith</XDSHeading>
              <XDSText type="body">
                Leading the design systems team. Open to collaboration on
                component libraries.
              </XDSText>
            </XDSVStack>
          </XDSHStack>
          <XDSHStack gap={1} vAlign="center">
            <XDSIcon icon={CalendarIcon} size="sm" color="secondary" />
            <XDSText type="supporting" color="secondary">
              Joined January 2025
            </XDSText>
          </XDSHStack>
          <XDSHStack gap={2}>
            <XDSButton label="Follow" variant="primary" size="sm" />
            <XDSButton label="Message" variant="secondary" size="sm" />
          </XDSHStack>
        </XDSVStack>
      }>
      <XDSButton label="@johnsmith" variant="ghost" />
    </XDSHoverCard>
  );
}
