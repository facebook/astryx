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

export default function HoverCardInteractiveContent() {
  return (
    <XDSHoverCard
      placement="below"
      content={
        <XDSVStack gap={3}>
          <XDSHStack gap={3} vAlign="start">
            <XDSAvatar name="John Smith" size="lg" xstyle={styles.avatar} />
            <XDSVStack gap={1}>
              <XDSHeading level={2}>John Smith</XDSHeading>
              <XDSText type="supporting" color="secondary">
                Product Manager · New York
              </XDSText>
            </XDSVStack>
          </XDSHStack>
          <XDSText type="body">
            Leading the design systems team. Open to collaboration on component
            libraries.
          </XDSText>
          <XDSHStack gap={2}>
            <XDSButton label="Follow" variant="primary" size="sm" />
            <XDSButton label="Message" variant="secondary" size="sm" />
          </XDSHStack>
        </XDSVStack>
      }>
      <XDSButton label="John Smith" variant="ghost" />
    </XDSHoverCard>
  );
}
