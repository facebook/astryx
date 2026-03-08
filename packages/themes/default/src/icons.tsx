/**
 * @file icons.tsx
 * @input Uses @heroicons/react outline and solid icon components, XDSIconRegistry type
 * @output Exports defaultIconRegistry for the default theme
 * @position Icon configuration for the default theme; consumed by index.ts
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

export const defaultIconRegistry: XDSIconRegistry = {
  close: <XMarkIcon {...iconProps} />,
  'selector.chevron': <ChevronDownIcon {...iconProps} />,
  'nav.prev': <ChevronLeftIcon {...iconProps} />,
  'nav.next': <ChevronRightIcon {...iconProps} />,
  'selector.check': <CheckIcon {...iconProps} />,
  'status.success': <CheckCircleIcon {...iconProps} />,
  'status.error': <XCircleIcon {...iconProps} />,
  'status.warning': <ExclamationTriangleIcon {...iconProps} />,
  'field.info': <InformationCircleIcon {...iconProps} />,
  'dateInput.calendar': <CalendarDaysIcon {...iconProps} />,
  'timeInput.clock': <ClockIcon {...iconProps} />,
  'link.external': <ArrowTopRightOnSquareIcon {...iconProps} />,
  'nav.menu': <Bars3Icon {...iconProps} />,
  'moreMenu.trigger': <EllipsisHorizontalIcon {...iconProps} />,
  'search.icon': <MagnifyingGlassIcon {...iconProps} />,
};
