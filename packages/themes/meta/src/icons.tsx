/**
 * @file icons.tsx
 * @input Uses @heroicons/react outline and solid icon components, XDSIconRegistry type
 * @output Exports metaIconRegistry for the Meta theme
 * @position Icon configuration for the Meta theme; consumed by index.ts
 *
 * Maps semantic icon names to Heroicons components.
 * Uses the same Heroicons library as the default theme —
 * Meta products use a similar clean outline icon style.
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

export const metaIconRegistry: XDSIconRegistry = {
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
};
