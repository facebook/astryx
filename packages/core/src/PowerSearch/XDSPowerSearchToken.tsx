'use client';

/**
 * @file XDSPowerSearchToken.tsx
 * @input PowerSearchTokenProps
 * @output Default token pill for PowerSearch filters
 * @position Public component; used internally by XDSPowerSearch and available for consumer composition
 */

import React from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSToken} from '../Token';
import {fontWeightVars} from '../theme/tokens.stylex';
import {formatFilterValue} from './formatFilterValue';
import {useInternalConfig} from './useInternalConfig';
import type {PowerSearchTokenProps} from './types';

const tokenValueStyles = stylex.create({
  value: {
    fontWeight: fontWeightVars['--font-weight-bold'],
  },
});

/**
 * Default token pill for PowerSearch filters.
 *
 * Renders a field label, operator label, and formatted value inside an XDSToken.
 * This is the built-in implementation used by XDSPowerSearch — exported so consumers
 * can use it as a base when providing custom `components.Token` overrides.
 */
export function XDSPowerSearchToken({
  config: configProp,
  filter,
  field,
  operator,
  maxLength,
  onClick,
  onRemove,
  isDisabled,
}: PowerSearchTokenProps) {
  const config = useInternalConfig(configProp);

  const fieldLabel = field.label;
  const operatorLabel = operator.label ? `: ${operator.label}` : '';
  const tokenLabel = `${fieldLabel}${operatorLabel}`;

  const adjustedMaxLength = Math.max(
    maxLength - fieldLabel.length - (operator.label?.length ?? 0),
    10,
  );

  const valueStr = formatFilterValue(
    config,
    operator.value,
    filter.value,
    adjustedMaxLength,
  );

  const valueContent = valueStr ? (
    <span {...stylex.props(tokenValueStyles.value)}>{valueStr}</span>
  ) : undefined;

  return (
    <XDSToken
      label={tokenLabel}
      endContent={valueContent}
      onClick={onClick ? (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick();
      } : undefined}
      onRemove={onRemove}
      isDisabled={isDisabled}
    />
  );
}

XDSPowerSearchToken.displayName = 'XDSPowerSearchToken';
