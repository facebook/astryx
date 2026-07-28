// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file tooltip-icon-button.tsx
 * @input Uses Astryx IconButton
 * @output Exports TooltipIconButton and TooltipIconButtonProps
 * @position Shared action adapter used by assistant-ui ready compositions
 */

import type {ReactNode} from 'react';
import {IconButton, type IconButtonProps} from '@astryxdesign/core/IconButton';

export interface TooltipIconButtonProps extends Omit<
  IconButtonProps,
  'icon' | 'label' | 'tooltip'
> {
  children: ReactNode;
  tooltip: string;
  label?: string;
}

/**
 * Astryx icon action with a required accessible label and tooltip.
 */
export function TooltipIconButton({
  children,
  tooltip,
  label = tooltip,
  variant = 'ghost',
  ...props
}: TooltipIconButtonProps) {
  return (
    <IconButton
      {...props}
      icon={children}
      label={label}
      tooltip={tooltip}
      variant={variant}
    />
  );
}
