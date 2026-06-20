// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PaginationPlugin.tsx
 * @input Schedule date navigation callbacks from Schedule context
 * @output Hook and default plugin that render previous, today, and next controls
 * @position Built-in Schedule plugin; re-exported from plugins.tsx
 */

import {useMemo, type ReactNode} from 'react';
import {Button} from '@xds/core/Button';
import {ButtonGroup} from '@xds/core/ButtonGroup';
import {Icon} from '@xds/core/Icon';
import {IconButton} from '@xds/core/IconButton';
import {useScheduleContext} from '../context';
import type {
  ScheduleHeaderContent,
  SchedulePlugin,
  SchedulePluginPosition,
} from '../types';

export interface SchedulePaginationPluginOptions {
  position?: SchedulePluginPosition;
}

function SchedulePaginationControls() {
  const {
    onPreviousDate,
    previousDateLabel,
    onToday,
    onNextDate,
    nextDateLabel,
  } = useScheduleContext();
  return (
    <ButtonGroup label="Schedule pagination" size="sm">
      <IconButton
        label={previousDateLabel}
        icon={<Icon icon="chevronLeft" size="sm" color="inherit" />}
        onClick={onPreviousDate}
      />
      <Button label="Today" size="sm" onClick={onToday} />
      <IconButton
        label={nextDateLabel}
        icon={<Icon icon="chevronRight" size="sm" color="inherit" />}
        onClick={onNextDate}
      />
    </ButtonGroup>
  );
}

function createSchedulePaginationPlugin({
  position = 'start',
}: SchedulePaginationPluginOptions = {}): SchedulePlugin {
  return {
    renderHeader(
      startContent: ReactNode,
      centerContent: ReactNode,
      endContent: ReactNode,
    ): ScheduleHeaderContent {
      const controls = <SchedulePaginationControls />;
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

export const defaultSchedulePaginationPlugin =
  createSchedulePaginationPlugin();

export function useSchedulePaginationPlugin({
  position = 'start',
}: SchedulePaginationPluginOptions = {}): SchedulePlugin {
  return useMemo(
    () => createSchedulePaginationPlugin({position}),
    [position],
  );
}
