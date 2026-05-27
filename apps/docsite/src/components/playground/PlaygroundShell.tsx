// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useXDSResizable, XDSResizeHandle} from '@xds/core/Resizable';
import {XDSDivider} from '@xds/core/Divider';

const s = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  main: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    flexDirection: {
      default: 'row',
      '@media (max-width: 768px)': 'column',
    },
  },
  leftPane: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    minWidth: 0,
    minHeight: {
      default: 0,
      '@media (max-width: 768px)': 300,
    },
  },
  rightPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: {
      default: 0,
      '@media (max-width: 768px)': 300,
    },
  },
});

interface PlaygroundShellProps {
  toolbar?: ReactNode;
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export function PlaygroundShell({
  toolbar,
  leftPanel,
  rightPanel,
}: PlaygroundShellProps) {
  const editorPanel = useXDSResizable({
    defaultSize: '50%',
    minSizePx: 200,
    collapsible: true,
    snaps: [400, 600],
    autoSaveId: 'xds-playground-editor-width',
  });

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <div {...stylex.props(s.root)}>
      {toolbar}
      <XDSDivider />
      <div {...stylex.props(s.main)}>
        <div
          {...stylex.props(s.leftPane)}
          style={
            isMobile ? {height: editorPanel.size} : {width: editorPanel.size}
          }>
          {leftPanel}
        </div>
        <XDSResizeHandle
          label="Resize editor panel"
          direction={isMobile ? 'vertical' : 'horizontal'}
          hasDivider
          pillPlacement={isMobile ? 'end' : 'auto'}
          resizable={editorPanel.props}
        />
        <div {...stylex.props(s.rightPane)}>{rightPanel}</div>
      </div>
    </div>
  );
}
