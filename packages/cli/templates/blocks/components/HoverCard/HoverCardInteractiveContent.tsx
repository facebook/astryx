'use client';

import {XDSHoverCard} from '@xds/core/HoverCard';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';

export default function HoverCardInteractiveContent() {
  return (
    <div style={{padding: 80}}>
      <XDSHoverCard
        placement="below"
        content={
          <XDSVStack gap={2}>
            <div>Interactive hover card content</div>
            <XDSHStack gap={2}>
              <XDSButton label="Follow" variant="primary">
                Follow
              </XDSButton>
              <XDSButton label="Message">Message</XDSButton>
            </XDSHStack>
          </XDSVStack>
        }>
        <XDSButton label="Hover for interactive content">
          Hover for interactive content
        </XDSButton>
      </XDSHoverCard>
    </div>
  );
}
