// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useXDSResizable, XDSResizeHandle} from '@xds/core/Resizable';
import {
  XDSCard,
  XDSLayout,
  XDSLayoutContent,
  XDSLayoutPanel,
  XDSVStack,
} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';

export default function ResizableShowcase() {
  const sidebar = useXDSResizable({
    defaultSize: 200,
    minSizePx: 120,
    maxSizePx: 400,
  });

  return (
    <XDSCard variant="muted" height={280} width={600}>
      <XDSLayout
        height="fill"
        start={
          <>
            <XDSLayoutPanel width={sidebar.size} hasDivider={false}>
              <XDSVStack gap={2}>
                <XDSHeading level={4}>Sidebar</XDSHeading>
                <XDSText color="secondary">
                  {Math.round(sidebar.size)}px wide
                </XDSText>
              </XDSVStack>
            </XDSLayoutPanel>
            <XDSResizeHandle
              direction="horizontal"
              hasDivider
              resizable={sidebar.props}
              label="Resize sidebar"
            />
          </>
        }
        content={
          <XDSLayoutContent>
            <XDSVStack gap={2}>
              <XDSHeading level={4}>Content</XDSHeading>
              <XDSText color="secondary">
                Drag the handle to resize the sidebar.
              </XDSText>
            </XDSVStack>
          </XDSLayoutContent>
        }
      />
    </XDSCard>
  );
}
