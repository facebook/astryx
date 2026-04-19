/**
 * @file XDSChartCrosshair.tsx
 * @output Cursor-tracking lines with value readouts. Uses chart context.
 */

import {useState, useCallback, useRef} from 'react';
import {useChart} from './ChartContext';
import type {DataPoint} from './types';

export interface XDSChartCrosshairProps {
  vertical?: boolean;
  horizontal?: boolean;
  labels?: boolean;
  xFormat?: (value: number | string | null) => string;
  yFormat?: (value: number) => string;
  color?: string;
}

export function XDSChartCrosshair({
  vertical = true, horizontal = true, labels = true,
  xFormat, yFormat, color = 'var(--color-border-emphasized)',
}: XDSChartCrosshairProps) {
  const {width, height, pointerToData} = useChart();
  const [point, setPoint] = useState<DataPoint | null>(null);
  const active = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent<SVGRectElement>) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    active.current = true;
    setPoint(pointerToData(e));
  }, [pointerToData]);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGRectElement>) => {
    if (e.pointerType === 'mouse' || active.current) {
      setPoint(pointerToData(e));
    }
  }, [pointerToData]);

  const onPointerUp = useCallback(() => {
    active.current = false;
    setPoint(null);
  }, []);

  const fmtX = xFormat ?? ((v: number | string | null) => v != null ? (typeof v === 'number' ? v.toFixed(1) : v) : '');
  const fmtY = yFormat ?? ((v: number) => v.toFixed(1));

  return (
    <g>
      <rect x={0} y={0} width={width} height={height} fill="transparent"
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        onPointerLeave={() => { if (!active.current) setPoint(null); }} />
      {point && (<>
        {vertical && <line x1={point.px} x2={point.px} y1={0} y2={height}
          stroke={color} strokeWidth={1} strokeDasharray="3 3" pointerEvents="none" />}
        {horizontal && <line x1={0} x2={width} y1={point.py} y2={point.py}
          stroke={color} strokeWidth={1} strokeDasharray="3 3" pointerEvents="none" />}
        {labels && point.x != null && (
          <g transform={`translate(${point.px},${height})`} pointerEvents="none">
            <rect x={-24} y={2} width={48} height={14} rx={3}
              fill="var(--color-background-popover)" fillOpacity={0.85} stroke={color} strokeWidth={0.5} />
            <text y={13} textAnchor="middle" fontSize={10} fill="var(--color-text-primary)">{fmtX(point.x)}</text>
          </g>
        )}
        {labels && (
          <g transform={`translate(0,${point.py})`} pointerEvents="none">
            <rect x={-48} y={-7} width={44} height={14} rx={3}
              fill="var(--color-background-popover)" fillOpacity={0.85} stroke={color} strokeWidth={0.5} />
            <text x={-26} dy="0.35em" textAnchor="middle" fontSize={10} fill="var(--color-text-primary)">{fmtY(point.y)}</text>
          </g>
        )}
      </>)}
    </g>
  );
}
