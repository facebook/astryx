// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSInputClearButton.tsx
 * @input Uses React, XDSButton, XDSIcon
 * @output Exports XDSInputClearButton shared clear button for input components
 * @position Shared primitive; used by XDSTypeahead, XDSTokenizer, XDSTextInput
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSButton} from '../Button';
import {XDSIcon} from '../Icon';

const styles = stylex.create({
  button: {
    height: '20px',
    flexShrink: 0,
  },
});

export interface XDSInputClearButtonProps {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  xstyle?: stylex.StyleXStyles;
}

export function XDSInputClearButton({
  label,
  onClick,
  xstyle,
}: XDSInputClearButtonProps): ReactNode {
  return (
    <XDSButton
      variant="ghost"
      size="sm"
      label={label}
      icon={<XDSIcon icon="close" size="sm" color="inherit" />}
      onClick={onClick}
      isIconOnly
      xstyle={[styles.button, xstyle]}
    />
  );
}

XDSInputClearButton.displayName = 'XDSInputClearButton';
