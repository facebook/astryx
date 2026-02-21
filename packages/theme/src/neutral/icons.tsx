/**
 * @file icons.tsx
 * @input Uses @heroicons/react outline and solid icon components, XDSIconRegistry type
 * @output Exports neutralIconRegistry for the neutral theme
 * @position Icon configuration for the neutral theme; consumed by index.ts
 *
 * Maps semantic icon names to Heroicons components.
 * These icons are bundled with the theme, not with @xds/core.
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

export const neutralIconRegistry: XDSIconRegistry = {
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
};
