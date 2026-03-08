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
} from 'lucide-react';

const iconProps = {
  size: '1em',
  'aria-hidden': true as const,
};

export const neutralIconRegistry: XDSIconRegistry = {
  close: <X {...iconProps} />,
  'selector.chevron': <ChevronDown {...iconProps} />,
  'nav.prev': <ChevronLeft {...iconProps} />,
  'nav.next': <ChevronRight {...iconProps} />,
  'selector.check': <Check {...iconProps} />,
  'status.success': <CheckCircle {...iconProps} />,
  'status.error': <XCircle {...iconProps} />,
  'status.warning': <AlertTriangle {...iconProps} />,
  'field.info': <Info {...iconProps} />,
  'dateInput.calendar': <Calendar {...iconProps} />,
  'timeInput.clock': <Clock {...iconProps} />,
  'link.external': <ExternalLink {...iconProps} />,
  'nav.menu': <Menu {...iconProps} />,
  'moreMenu.trigger': <MoreHorizontal {...iconProps} />,
  'search.icon': <Search {...iconProps} />,
};
