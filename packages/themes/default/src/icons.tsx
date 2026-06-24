// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file icons.tsx
 * @input Uses @heroicons/react outline and solid icon components, IconRegistry type
 * @output Exports defaultIconRegistry for the default theme
 * @position Icon configuration for the default theme; consumed by index.ts
 *
 * Maps semantic icon names to Heroicons components.
 * These icons are bundled with the theme, not with @astryxdesign/core.
 */

import React from 'react';
import type {IconRegistry} from '@astryxdesign/core/Icon';

import {
  XMarkIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  CalendarDaysIcon,
  ClockIcon,
  InformationCircleIcon,
  Bars3Icon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsUpDownIcon,
  FunnelIcon,
  EyeSlashIcon,
  ViewColumnsIcon,
  ClipboardDocumentIcon,
  WrenchIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/outline';

import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  StopIcon,
} from '@heroicons/react/24/solid';

const iconProps = {
  width: '1em',
  height: '1em',
  'aria-hidden': true as const,
};

export const defaultIconRegistry: IconRegistry = {
  close: <XMarkIcon {...iconProps} />,
  chevronDown: <ChevronDownIcon {...iconProps} />,
  chevronLeft: <ChevronLeftIcon {...iconProps} />,
  chevronRight: <ChevronRightIcon {...iconProps} />,
  check: <CheckIcon {...iconProps} />,
  success: <CheckCircleIcon {...iconProps} />,
  error: <XCircleIcon {...iconProps} />,
  warning: <ExclamationTriangleIcon {...iconProps} />,
  info: <InformationCircleIcon {...iconProps} />,
  calendar: <CalendarDaysIcon {...iconProps} />,
  clock: <ClockIcon {...iconProps} />,
  externalLink: <ArrowTopRightOnSquareIcon {...iconProps} />,
  menu: <Bars3Icon {...iconProps} />,
  moreHorizontal: <EllipsisHorizontalIcon {...iconProps} />,
  search: <MagnifyingGlassIcon {...iconProps} />,
  arrowUp: <ArrowUpIcon {...iconProps} />,
  arrowDown: <ArrowDownIcon {...iconProps} />,
  arrowsUpDown: <ArrowsUpDownIcon {...iconProps} />,
  funnel: <FunnelIcon {...iconProps} />,
  eyeSlash: <EyeSlashIcon {...iconProps} />,
  viewColumns: <ViewColumnsIcon {...iconProps} />,
  copy: <ClipboardDocumentIcon {...iconProps} />,
  checkDouble: <CheckIcon {...iconProps} />,
  wrench: <WrenchIcon {...iconProps} />,
  stop: <StopIcon {...iconProps} />,
  microphone: <MicrophoneIcon {...iconProps} />,
};
