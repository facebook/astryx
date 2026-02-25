/**
 * @file icons.tsx
 * @input Uses lucide-react icon components, XDSIconRegistry type
 * @output Exports brutalistIconRegistry for the brutalist theme
 * @position Icon configuration for the brutalist theme; consumed by index.ts
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
} from 'lucide-react';

const iconProps = {
  size: '1em',
  'aria-hidden': true as const,
};

export const brutalistIconRegistry: XDSIconRegistry = {
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
};
