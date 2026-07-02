// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useResizable, ResizeHandle} from '@astryxdesign/core/Resizable';
import {
  Card,
  Layout,
  LayoutContent,
  LayoutPanel,
} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

export default function ResizableSidebar() {
  const sidebar = useResizable({
    defaultSize: 180,
    minSizePx: 120,
    maxSizePx: 320,
  });

  return (
    <Card variant="muted" height={240} width={500}>
      <Layout
        height="fill"
        start={
          <>
            <LayoutPanel width={sidebar.size} hasDivider={false}>
              <Text color="secondary">{Math.round(sidebar.size)}px wide</Text>
            </LayoutPanel>
            <ResizeHandle
              direction="horizontal"
              hasDivider
              resizable={sidebar.props}
              label="Resize sidebar"
            />
          </>
        }
        content={
          <LayoutContent>
            <Text color="secondary">Drag the handle to resize.</Text>
          </LayoutContent>
        }
      />
    </Card>
  );
}
