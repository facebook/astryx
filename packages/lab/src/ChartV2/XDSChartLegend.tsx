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
  if (items.length === 0) return null;

  const isVertical = position === 'start' || position === 'end';

  if (isVertical) {
    return (
      <XDSVStack gap={2} hAlign={alignment}>
        {items.map(item => (
          <XDSHStack key={item.label} gap={2} vAlign="center">
            <LegendSwatch color={item.color} type={item.type} />
            <XDSText type="supporting">{item.label}</XDSText>
          </XDSHStack>
        ))}
      </XDSVStack>
    );
  }

  return (
    <XDSHStack gap={4} justify={alignment} vAlign="center" wrap="wrap">
      {items.map(item => (
        <XDSHStack key={item.label} gap={2} vAlign="center">
          <LegendSwatch color={item.color} type={item.type} />
          <XDSText type="supporting">{item.label}</XDSText>
        </XDSHStack>
      ))}
    </XDSHStack>
  );
}

function LegendSwatch({color, type}: {color: string; type?: string}) {
  if (type === 'line') {
    return (
      <div
        style={{
          width: 10,
          height: 3,
          borderRadius: 1.5,
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: 2,
        backgroundColor: color,
        flexShrink: 0,
        marginInline: 1,
      }}
    />
  );
}
