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
  content: {maxWidth: 280},
});

export default function HoverCardProfileHoverCard() {
  return (
    <XDSHoverCard
      placement="below"
      content={
        <XDSHStack gap={3} vAlign="start" xstyle={styles.content}>
          <XDSAvatar name="Jane Doe" size={48} xstyle={styles.avatar} />
          <XDSVStack gap={1}>
            <XDSHeading level={3}>@janedoe</XDSHeading>
            <XDSText type="body" color="secondary">
              Crafting accessible, scalable design systems for modern teams.
            </XDSText>
            <XDSHStack gap={1} vAlign="center">
              <XDSIcon icon={CalendarIcon} size="xsm" color="secondary" />
              <XDSText type="supporting" color="secondary">
                March 2024
              </XDSText>
            </XDSHStack>
          </XDSVStack>
        </XDSHStack>
      }>
      <XDSButton label="@janedoe" variant="ghost" />
    </XDSHoverCard>
  );
}
