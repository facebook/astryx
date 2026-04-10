/**
 * @file icons.tsx
 * @input Uses lucide-react icon components, XDSIconRegistry type
 * @output Exports neutralIconRegistry for the neutral theme
 * @position Icon configuration for the neutral theme; consumed by index.ts
 *
 * Maps semantic icon names to Lucide icon components.
 * These icons are bundled with the theme, not with @xds/core.
 */

import React from 'react';
import type {XDSIconRegistry} from '@xds/core/Icon';

import {
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Calendar,
  Clock,
  ExternalLink,
  Menu,
  MoreHorizontal,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Filter,
  EyeOff,
  Columns,
  Copy,
  CheckCheck,
  Wrench,
} from 'lucide-react';

const iconProps = {
  size: '1em',
  'aria-hidden': true as const,
};

export const neutralIconRegistry: XDSIconRegistry = {
  close: <X {...iconProps} />,
  chevronDown: <ChevronDown {...iconProps} />,
  chevronLeft: <ChevronLeft {...iconProps} />,
  chevronRight: <ChevronRight {...iconProps} />,
  check: <Check {...iconProps} />,
  checkCircle: <CheckCircle {...iconProps} />,
  xCircle: <XCircle {...iconProps} />,
  warning: <AlertTriangle {...iconProps} />,
  info: <Info {...iconProps} />,
  calendar: <Calendar {...iconProps} />,
  clock: <Clock {...iconProps} />,
  externalLink: <ExternalLink {...iconProps} />,
  menu: <Menu {...iconProps} />,
  moreHorizontal: <MoreHorizontal {...iconProps} />,
  search: <Search {...iconProps} />,
  arrowUp: <ArrowUp {...iconProps} />,
  arrowDown: <ArrowDown {...iconProps} />,
  arrowsUpDown: <ArrowUpDown {...iconProps} />,
  funnel: <Filter {...iconProps} />,
  eyeSlash: <EyeOff {...iconProps} />,
  viewColumns: <Columns {...iconProps} />,
  copy: <Copy {...iconProps} />,
  checkDouble: <CheckCheck {...iconProps} />,
  wrench: <Wrench {...iconProps} />,
};
