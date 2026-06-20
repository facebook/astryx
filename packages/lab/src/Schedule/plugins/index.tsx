// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file plugins.tsx
 * @input Built-in schedule plugin hooks and stable defaults
 * @output Default Schedule plugin list and plugin hook re-exports
 * @position Plugin barrel; plugin implementations live in separate files
 */

import {defaultSchedulePaginationPlugin} from './PaginationPlugin';
import type {SchedulePlugin} from '../types';

export {useSchedulePaginationPlugin} from './PaginationPlugin';
export {useScheduleViewSelectorPlugin} from './ViewSelectorPlugin';

export const defaultSchedulePlugins: ReadonlyArray<SchedulePlugin> = [
  defaultSchedulePaginationPlugin,
];
