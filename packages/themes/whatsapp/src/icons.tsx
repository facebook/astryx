/**
 * WhatsApp theme icon registry
 *
 * Reuses Heroicons (same as the default theme). WhatsApp internally uses
 * Material Design-style icons (WDS icons), but those aren't open source.
 * Heroicons provide a clean, consistent alternative.
 */

import React from 'react';
import type {XDSIconRegistry} from '@xds/core/Icon';

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
} from '@heroicons/react/24/outline';

import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/solid';

const iconProps = {
  width: '1em',
  height: '1em',
  'aria-hidden': true as const,
};

export const whatsappIconRegistry: XDSIconRegistry = {
  close: <XMarkIcon {...iconProps} />,
  chevronDown: <ChevronDownIcon {...iconProps} />,
  chevronLeft: <ChevronLeftIcon {...iconProps} />,
  chevronRight: <ChevronRightIcon {...iconProps} />,
  check: <CheckIcon {...iconProps} />,
  checkCircle: <CheckCircleIcon {...iconProps} />,
  xCircle: <XCircleIcon {...iconProps} />,
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
};
