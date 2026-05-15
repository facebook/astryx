/**
 * @file legend.tsx
 * @output Chart legend — renders labeled swatches with position/alignment control
 * @position Internal helper; called by XDSChart root
 */

import {XDSText} from '@xds/core';
import {XDSVStack, XDSHStack} from '@xds/core';

export type LegendPosition = 'top' | 'bottom' | 'start' | 'end';
export type LegendAlignment = 'start' | 'center' | 'end';

export interface LegendItem {
  label: string;
  color: string;
  /** Mark type — determines swatch shape (square for bar/area/dot, line for line) */
  type?: string;
}

export interface LegendConfig {
  /** Position of the legend relative to the chart */
  position?: LegendPosition;
  /** Alignment of the legend within its position */
  alignment?: LegendAlignment;
  /** Manual legend items. Auto-derived from series if not provided. */
  items?: LegendItem[];
}

export interface ChartLegendProps {
  items: LegendItem[];
  position: LegendPosition;
  alignment: LegendAlignment;
}

export function ChartLegend({items, position, alignment}: ChartLegendProps) {
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
