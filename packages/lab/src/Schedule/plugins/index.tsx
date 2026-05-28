// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file plugins.tsx
 * @input Built-in schedule plugin hooks and stable defaults
 * @output Default XDSSchedule plugin list and plugin hook re-exports
 * @position Plugin barrel; plugin implementations live in separate files
 */

import {defaultXDSSchedulePaginationPlugin} from './PaginationPlugin';
import type {XDSSchedulePlugin} from '../types';

export {useXDSSchedulePaginationPlugin} from './PaginationPlugin';
export {useXDSScheduleViewSelectorPlugin} from './ViewSelectorPlugin';

export const defaultXDSSchedulePlugins: ReadonlyArray<XDSSchedulePlugin> = [
  defaultXDSSchedulePaginationPlugin,
];
