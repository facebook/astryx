/**
 * @file XDS3DAxis.tsx
 * @output 3D axis lines with labels at each end
 */

import {use3D} from './ThreeDContext';

export interface XDS3DAxisProps {
  /** Show axis labels (default: true) */
  labels?: boolean;
}

export function XDS3DAxis({labels = true}: XDS3DAxisProps) {
  const {project, xKey, yKey, zKey, xDomain, yDomain, zDomain} = use3D();

  const origin = project(0, 0, 0);
  const xEnd = project(1, 0, 0);
  const yEnd = project(0, 1, 0);
  const zEnd = project(0, 0, 1);

  const lineColor = 'var(--color-border-emphasized)';
  const labelColor = 'var(--color-text-secondary)';

  return (
    <g>
      {/* X axis */}
      <line
        x1={origin.px}
        y1={origin.py}
        x2={xEnd.px}
        y2={xEnd.py}
        stroke={lineColor}
        strokeWidth={1.5}
      />
      {/* Y axis */}
      <line
        x1={origin.px}
        y1={origin.py}
        x2={yEnd.px}
        y2={yEnd.py}
        stroke={lineColor}
        strokeWidth={1.5}
      />
      {/* Z axis */}
      <line
        x1={origin.px}
        y1={origin.py}
        x2={zEnd.px}
        y2={zEnd.py}
        stroke={lineColor}
        strokeWidth={1.5}
      />

      {labels && (
        <>
          <text
            x={xEnd.px + 8}
            y={xEnd.py}
            fill={labelColor}
            fontSize={11}
            dominantBaseline="central">
            {xKey} [{xDomain[0]}-{xDomain[1]}]
          </text>
          <text
            x={yEnd.px + 8}
            y={yEnd.py}
            fill={labelColor}
            fontSize={11}
            dominantBaseline="central">
            {yKey} [{yDomain[0]}-{yDomain[1]}]
          </text>
          <text
            x={zEnd.px + 8}
            y={zEnd.py}
            fill={labelColor}
            fontSize={11}
            dominantBaseline="central">
            {zKey} [{zDomain[0]}-{zDomain[1]}]
          </text>
        </>
      )}
    </g>
  );
}
