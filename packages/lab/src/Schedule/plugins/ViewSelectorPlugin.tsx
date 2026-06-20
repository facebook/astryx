// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ViewSelectorPlugin.tsx
 * @input Schedule view options and caller-provided view change callback
 * @output Hook that renders an DropdownMenu plugin for caller-provided views
 * @position Built-in Schedule plugin; re-exported from plugins.tsx
 */

import {useMemo, type ReactNode} from 'react';
import {DropdownMenu, DropdownMenuItem} from '@xds/core/DropdownMenu';
import {Icon} from '@xds/core/Icon';
import {useScheduleContext} from '../context';
import type {
  ScheduleHeaderContent,
  SchedulePlugin,
  SchedulePluginPosition,
  ScheduleView,
  ScheduleViewBase,
} from '../types';

export interface ScheduleViewSelectorOption<
  View extends ScheduleViewBase = ScheduleView,
> {
  view: View;
  label: string;
}

export interface ScheduleViewSelectorPluginOptions<
  View extends ScheduleViewBase = ScheduleView,
> {
  onChangeView?: (view: View) => void;
  position?: SchedulePluginPosition;
}

function ScheduleViewSelectorControl<View extends ScheduleViewBase>({
  onChangeView,
  options,
}: {
  onChangeView?: (view: View) => void;
  options: ReadonlyArray<ScheduleViewSelectorOption<View>>;
}) {
  const {view} = useScheduleContext();
  const selectedIndex = options.findIndex(option => option.view === view);
  const selectedLabel = options[selectedIndex]?.label ?? 'View';
  return (
    <DropdownMenu
      button={{
        label: selectedLabel,
        size: 'sm',
        isDisabled: onChangeView == null,
      }}
      menuWidth={160}>
      {options.map((option, index) => (
        <DropdownMenuItem
          key={option.label}
          label={option.label}
          onClick={() => onChangeView?.(option.view)}
          endContent={
            index === selectedIndex ? (
              <Icon icon="check" size="sm" color="primary" />
            ) : null
          }
        />
      ))}
    </DropdownMenu>
  );
}

function createScheduleViewSelectorPlugin<View extends ScheduleViewBase>(
  options: ReadonlyArray<ScheduleViewSelectorOption<View>>,
  {
    onChangeView,
    position = 'end',
  }: ScheduleViewSelectorPluginOptions<View> = {},
): SchedulePlugin {
  return {
    renderHeader(
      startContent: ReactNode,
      centerContent: ReactNode,
      endContent: ReactNode,
    ): ScheduleHeaderContent {
      const control = (
        <ScheduleViewSelectorControl
          onChangeView={onChangeView}
          options={options}
        />
      );
      return position === 'start'
        ? {
            startContent: (
              <>
                {startContent}
                {control}
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
                {control}
              </>
            ),
          };
    },
  };
}

export function useScheduleViewSelectorPlugin<
  View extends ScheduleViewBase,
>(
  options: ReadonlyArray<ScheduleViewSelectorOption<View>>,
  pluginOptions: ScheduleViewSelectorPluginOptions<View> = {},
): SchedulePlugin {
  const {onChangeView, position = 'end'} = pluginOptions;
  return useMemo(
    () =>
      createScheduleViewSelectorPlugin(options, {onChangeView, position}),
    [onChangeView, options, position],
  );
}
