// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ViewSelectorPlugin.tsx
 * @input Schedule view options and caller-provided view change callback
 * @output Hook that renders an XDSDropdownMenu plugin for caller-provided views
 * @position Built-in XDSSchedule plugin; re-exported from plugins.tsx
 */

import {useMemo, type ReactNode} from 'react';
import {XDSDropdownMenu, XDSDropdownMenuItem} from '@xds/core/DropdownMenu';
import {XDSIcon} from '@xds/core/Icon';
import {useXDSScheduleContext} from '../context';
import type {
  XDSScheduleHeaderContent,
  XDSSchedulePlugin,
  XDSSchedulePluginPosition,
  XDSScheduleView,
  XDSScheduleViewBase,
} from '../types';

export interface XDSScheduleViewSelectorOption<
  View extends XDSScheduleViewBase = XDSScheduleView,
> {
  view: View;
  label: string;
}

export interface XDSScheduleViewSelectorPluginOptions<
  View extends XDSScheduleViewBase = XDSScheduleView,
> {
  onChangeView?: (view: View) => void;
  position?: XDSSchedulePluginPosition;
}

function XDSScheduleViewSelectorControl<View extends XDSScheduleViewBase>({
  onChangeView,
  options,
}: {
  onChangeView?: (view: View) => void;
  options: ReadonlyArray<XDSScheduleViewSelectorOption<View>>;
}) {
  const {view} = useXDSScheduleContext();
  const selectedIndex = options.findIndex(option => option.view === view);
  const selectedLabel = options[selectedIndex]?.label ?? 'View';
  return (
    <XDSDropdownMenu
      button={{
        label: selectedLabel,
        size: 'sm',
        isDisabled: onChangeView == null,
      }}
      menuWidth={160}>
      {options.map((option, index) => (
        <XDSDropdownMenuItem
          key={option.label}
          label={option.label}
          onClick={() => onChangeView?.(option.view)}
          endContent={
            index === selectedIndex ? (
              <XDSIcon icon="check" size="sm" color="primary" />
            ) : null
          }
        />
      ))}
    </XDSDropdownMenu>
  );
}

function createXDSScheduleViewSelectorPlugin<View extends XDSScheduleViewBase>(
  options: ReadonlyArray<XDSScheduleViewSelectorOption<View>>,
  {
    onChangeView,
    position = 'end',
  }: XDSScheduleViewSelectorPluginOptions<View> = {},
): XDSSchedulePlugin {
  return {
    renderHeader(
      startContent: ReactNode,
      centerContent: ReactNode,
      endContent: ReactNode,
    ): XDSScheduleHeaderContent {
      const control = (
        <XDSScheduleViewSelectorControl
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

export function useXDSScheduleViewSelectorPlugin<
  View extends XDSScheduleViewBase,
>(
  options: ReadonlyArray<XDSScheduleViewSelectorOption<View>>,
  pluginOptions: XDSScheduleViewSelectorPluginOptions<View> = {},
): XDSSchedulePlugin {
  const {onChangeView, position = 'end'} = pluginOptions;
  return useMemo(
    () =>
      createXDSScheduleViewSelectorPlugin(options, {onChangeView, position}),
    [onChangeView, options, position],
  );
}
