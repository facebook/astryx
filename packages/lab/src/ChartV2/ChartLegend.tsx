// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartLegend.tsx
 * @output Standalone chart legend component
 * @position Can be used inside Chart via the `legend` prop, or independently
 *
 * @example
 * // Via Chart
 * <Chart legend={{position: 'top', alignment: 'start'}} ... />
 *
 * // Standalone
 * <ChartLegend items={[{label: 'Revenue', color: '#3b82f6'}]} />
 */

import {Text} from '@xds/core';
import {VStack, HStack} from '@xds/core';
import {ChartSwatch, swatchVariantForType} from './ChartSwatch';
import type {LegendItem} from './legend';

export type {LegendItem};

export type LegendPosition = 'top' | 'bottom' | 'start' | 'end';
export type LegendAlignment = 'start' | 'center' | 'end';

export interface ChartLegendProps {
  /** Legend items to display */
  items?: LegendItem[];
  /** Position of the legend relative to the chart. Default: 'bottom' */
  position?: LegendPosition;
  /** Alignment of the legend within its position. Default: 'start' */
  alignment?: LegendAlignment;
}

export function ChartLegend({
  items = [],
  position = 'bottom',
  alignment = 'start',
}: ChartLegendProps) {
  if (items.length === 0) {
    return null;
  }

  const isVertical = position === 'start' || position === 'end';

  const legendItems = items.map(item => (
    <HStack key={item.label} gap={2} vAlign="center">
      <ChartSwatch
        color={item.color}
        variant={swatchVariantForType(item.type)}
      />
      <Text type="supporting">{item.label}</Text>
    </HStack>
  ));

  if (isVertical) {
    return (
      <VStack gap={2} hAlign={alignment}>
        {legendItems}
      </VStack>
    );
  }

  return (
    <HStack gap={4} justify={alignment} vAlign="center" wrap="wrap">
      {legendItems}
    </HStack>
  );
}
