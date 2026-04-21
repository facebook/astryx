'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSHoverCard} from '@xds/core/HoverCard';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {CalendarIcon} from '@heroicons/react/24/outline';

const styles = stylex.create({
  avatar: {flexShrink: 0},
});

export default function HoverCardInteractiveContent() {
  return (
    <XDSHoverCard
      placement="below"
      content={
        <XDSVStack gap={2}>
          <XDSHStack gap={2} vAlign="center">
            <XDSAvatar name="John Smith" size={40} xstyle={styles.avatar} />
            <XDSVStack gap={0}>
              <XDSText type="label">@johnsmith</XDSText>
              <XDSText type="supporting" color="secondary">
                Leading the design systems team. Open to collaboration.
              </XDSText>
            </XDSVStack>
          </XDSHStack>
          <XDSHStack gap={1} vAlign="center">
            <XDSIcon icon={CalendarIcon} size="xsm" color="secondary" />
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
