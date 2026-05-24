// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSChartLegend.tsx
 * @output Standalone chart legend component
 * @position Can be used inside XDSChart via the `legend` prop, or independently
 *
 * @example
 * // Via XDSChart
 * <XDSChart legend={{position: 'top', alignment: 'start'}} ... />
 *
 * // Standalone
 * <XDSChartLegend items={[{label: 'Revenue', color: '#3b82f6'}]} />
 */

import {XDSText} from '@xds/core';
import {XDSVStack, XDSHStack} from '@xds/core';
import {XDSChartSwatch, swatchVariantForType} from './XDSChartSwatch';
import type {LegendItem} from './legend';

export type {LegendItem};

export type LegendPosition = 'top' | 'bottom' | 'start' | 'end';
export type LegendAlignment = 'start' | 'center' | 'end';

export interface XDSChartLegendProps {
  /** Legend items to display */
  items?: LegendItem[];
  /** Position of the legend relative to the chart. Default: 'bottom' */
  position?: LegendPosition;
  /** Alignment of the legend within its position. Default: 'start' */
  alignment?: LegendAlignment;
}

export function XDSChartLegend({
  items = [],
  position = 'bottom',
  alignment = 'start',
}: XDSChartLegendProps) {
  if (items.length === 0) {
    return null;
  }

  const isVertical = position === 'start' || position === 'end';

  const legendItems = items.map(item => (
    <XDSHStack key={item.label} gap={2} vAlign="center">
      <XDSChartSwatch
        color={item.color}
        variant={swatchVariantForType(item.type)}
      />
      <XDSText type="supporting">{item.label}</XDSText>
    </XDSHStack>
  ));

  if (isVertical) {
    return (
      <XDSVStack gap={2} hAlign={alignment}>
        {legendItems}
      </XDSVStack>
    );
  }

  return (
    <XDSHStack gap={4} justify={alignment} vAlign="center" wrap="wrap">
      {legendItems}
    </XDSHStack>
  );
}
