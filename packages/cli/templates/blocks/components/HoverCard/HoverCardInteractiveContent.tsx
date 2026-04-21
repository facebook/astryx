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

export default function HoverCardInteractiveContent() {
  return (
    <XDSHoverCard
      placement="below"
      content={
        <XDSVStack gap={3} xstyle={styles.content}>
          <XDSHStack gap={3} vAlign="start">
            <XDSAvatar name="John Smith" size={48} xstyle={styles.avatar} />
            <XDSVStack gap={1}>
              <XDSHeading level={3}>@johnsmith</XDSHeading>
              <XDSText type="body" color="secondary">
                Leading the design systems team. Open to collaboration.
              </XDSText>
              <XDSHStack gap={1} vAlign="center">
                <XDSIcon icon={CalendarIcon} size="xsm" color="secondary" />
                <XDSText type="supporting" color="secondary">
                  January 2025
                </XDSText>
              </XDSHStack>
            </XDSVStack>
          </XDSHStack>
          <XDSVStack gap={2} hAlign="stretch">
            <XDSButton label="Follow" variant="primary" size="sm" />
            <XDSButton label="Message" variant="secondary" size="sm" />
          </XDSVStack>
        </XDSVStack>
      }>
      <XDSButton label="@johnsmith" variant="ghost" />
    </XDSHoverCard>
  );
}
