// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PaginationPlugin.tsx
 * @input Schedule date navigation callbacks from XDSSchedule context
 * @output Hook and default plugin that render previous, today, and next controls
 * @position Built-in XDSSchedule plugin; re-exported from plugins.tsx
 */

import {useMemo, type ReactNode} from 'react';
import {XDSButton} from '@xds/core/Button';
import {XDSButtonGroup} from '@xds/core/ButtonGroup';
import {XDSIcon} from '@xds/core/Icon';
import {XDSIconButton} from '@xds/core/IconButton';
import {useXDSScheduleContext} from '../context';
import type {
  XDSScheduleHeaderContent,
  XDSSchedulePlugin,
  XDSSchedulePluginPosition,
} from '../types';

export interface XDSSchedulePaginationPluginOptions {
  position?: XDSSchedulePluginPosition;
}

function XDSSchedulePaginationControls() {
  const {
    onPreviousDate,
    previousDateLabel,
    onToday,
    onNextDate,
    nextDateLabel,
  } = useXDSScheduleContext();
  return (
    <XDSButtonGroup label="Schedule pagination" size="sm">
      <XDSIconButton
        label={previousDateLabel}
        icon={<XDSIcon icon="chevronLeft" size="sm" color="inherit" />}
        onClick={onPreviousDate}
      />
      <XDSButton label="Today" size="sm" onClick={onToday} />
      <XDSIconButton
        label={nextDateLabel}
        icon={<XDSIcon icon="chevronRight" size="sm" color="inherit" />}
        onClick={onNextDate}
      />
    </XDSButtonGroup>
  );
}

function createXDSSchedulePaginationPlugin({
  position = 'start',
}: XDSSchedulePaginationPluginOptions = {}): XDSSchedulePlugin {
  return {
    renderHeader(
      startContent: ReactNode,
      centerContent: ReactNode,
      endContent: ReactNode,
    ): XDSScheduleHeaderContent {
      const controls = <XDSSchedulePaginationControls />;
      return position === 'start'
        ? {
            startContent: (
              <>
                {controls}
                {startContent}
              </>
            ),
            centerContent,
            endContent,
          }
        : {
            startContent,
            centerContent,
            endContent: (
              <>
                {endContent}
                {controls}
              </>
            ),
          };
    },
  };
}

export const defaultXDSSchedulePaginationPlugin =
  createXDSSchedulePaginationPlugin();

export function useXDSSchedulePaginationPlugin({
  position = 'start',
}: XDSSchedulePaginationPluginOptions = {}): XDSSchedulePlugin {
  return useMemo(
    () => createXDSSchedulePaginationPlugin({position}),
    [position],
  );
}
