'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSHoverCard} from '@xds/core/HoverCard';
import {XDSIcon} from '@xds/core/Icon';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {LinkIcon} from '@heroicons/react/24/outline';

const styles = stylex.create({
  content: {maxWidth: 280},
});

export default function HoverCardInteractiveContent() {
  return (
    <XDSText type="body">
      Read more in the{' '}
      <XDSHoverCard
        placement="below"
        content={
          <XDSVStack gap={2} xstyle={styles.content}>
            <XDSHStack gap={2} vAlign="start">
              <XDSIcon icon={LinkIcon} size="sm" color="secondary" />
              <XDSVStack gap={1}>
                <XDSText type="label">Getting Started Guide</XDSText>
                <XDSText type="body" color="secondary">
                  Learn how to set up your first project, invite team members,
                  and configure your workspace.
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  docs.example.com/getting-started
                </XDSText>
              </XDSVStack>
            </XDSHStack>
          </XDSVStack>
        }>
        Getting Started Guide
      </XDSHoverCard>
      .
    </XDSText>
  );
}
