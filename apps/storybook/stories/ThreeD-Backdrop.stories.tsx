// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useMemo} from 'react';
import {ThreeDChart, use3D} from '@xds/lab';

const meta: Meta = {title: 'Lab/3DChart/Backdrop'};
export default meta;

/** Scatter that colors each point based on its projected screen position */
function AdaptiveScatter({
  splitX,
  leftColor,
  rightColor,
  radius = 1.2,
  opacity = 0.65,
}: {
  splitX: number;
  leftColor: string;
  rightColor: string;
  radius?: number;
  opacity?: number;
}) {
  const {
    data,
    xKey,
    yKey,
    zKey,
    project,
    xDomain,
    yDomain,
    zDomain,
    normalize,
  } = use3D();

  const points = useMemo(() => {
    return data
      .map((d, i) => {
        const nx = normalize(d[xKey] as number, xDomain);
        const ny = normalize(d[yKey] as number, yDomain);
        const nz = normalize(d[zKey] as number, zDomain);
        const {px, py, depth} = project(nx, ny, nz);
        return {px, py, depth, index: i};
      })
      .sort((a, b) => a.depth - b.depth);
  }, [data, xKey, yKey, zKey, project, xDomain, yDomain, zDomain, normalize]);

  return (
    <g>
      {points.map(p => {
        const depthFactor = 0.5 + (p.depth + 0.5) * 0.5;
        const color = p.px < splitX ? leftColor : rightColor;
        return (
          <circle
            key={p.index}
            cx={p.px}
            cy={p.py}
            r={radius * depthFactor}
            fill={color}
            fillOpacity={opacity * depthFactor}
          />
        );
      })}
    </g>
  );
}

/** Split backdrop — half dark, half light with adaptive point colors */
function SplitBackdrop({
  width,
  height,
  leftBg,
  rightBg,
}: {
  width: number;
  height: number;
  leftBg: string;
  rightBg: string;
}) {
  return (
    <g>
      <rect x={0} y={0} width={width / 2} height={height} fill={leftBg} />
      <rect
        x={width / 2}
        y={0}
        width={width / 2}
        height={height}
        fill={rightBg}
      />
    </g>
  );
}

function BackdropInner({
  leftBg,
  rightBg,
  leftDot,
  rightDot,
}: {
  leftBg: string;
  rightBg: string;
  leftDot: string;
  rightDot: string;
}) {
  const {width, height} = use3D();
  return (
    <>
      <SplitBackdrop
        width={width}
        height={height}
        leftBg={leftBg}
        rightBg={rightBg}
      />
      <AdaptiveScatter
        splitX={width / 2}
        leftColor={leftDot}
        rightColor={rightDot}
      />
    </>
  );
}

function sphere(n: number) {
  const phi = (1 + Math.sqrt(5)) / 2;
  return Array.from({length: n}, (_, i) => {
    const theta = Math.acos(1 - (2 * (i + 0.5)) / n);
    const p = (2 * Math.PI * i) / phi;
    return {
      x: Math.sin(theta) * Math.cos(p),
      y: Math.sin(theta) * Math.sin(p),
      z: Math.cos(theta),
    };
  });
}

function torusKnot(n: number) {
  return Array.from({length: n}, (_, i) => {
    const t = (i / n) * Math.PI * 2;
    const r = Math.cos(3 * t) + 2;
    return {x: r * Math.cos(2 * t), y: r * Math.sin(2 * t), z: Math.sin(3 * t)};
  });
}

/** Dark/light split — points adapt color based on which half they project onto */
export const SplitDarkLight: StoryObj = {
  render: () => {
    const data = useMemo(() => sphere(2000), []);
    return (
      <div style={{borderRadius: 16, overflow: 'hidden', maxWidth: 600}}>
        <ThreeDChart
          data={data}
          xKey="x"
          yKey="y"
          zKey="z"
          height={400}
          interactive
          autoRotate={0.15}>
          <BackdropInner
            leftBg="#0A1317"
            rightBg="#F1F4F7"
            leftDot="#DFE2E5"
            rightDot="#0A1317"
          />
        </ThreeDChart>
      </div>
    );
  },
};

/** Color split — two bold colors */
export const SplitBoldColors: StoryObj = {
  render: () => {
    const data = useMemo(() => torusKnot(2500), []);
    return (
      <div style={{borderRadius: 16, overflow: 'hidden', maxWidth: 600}}>
        <ThreeDChart
          data={data}
          xKey="x"
          yKey="y"
          zKey="z"
          height={400}
          interactive
          autoRotate={0.2}>
          <BackdropInner
            leftBg="#0064E0"
            rightBg="#E3193B"
            leftDot="#FFFFFF"
            rightDot="#FFFFFF"
          />
        </ThreeDChart>
      </div>
    );
  },
};

/** Quad split — four colored quadrants */
function QuadBackdropInner() {
  const {
    width,
    height,
    data,
    xKey,
    yKey,
    zKey,
    project,
    xDomain,
    yDomain,
    zDomain,
    normalize,
  } = use3D();

  const colors = [
    {bg: '#0064E0', dot: '#FFFFFF'}, // top-left
    {bg: '#E3193B', dot: '#FFFFFF'}, // top-right
    {bg: '#FBCE03', dot: '#0A1317'}, // bottom-left
    {bg: '#0B991F', dot: '#FFFFFF'}, // bottom-right
  ];

  const points = useMemo(() => {
    return data
      .map((d, i) => {
        const nx = normalize(d[xKey] as number, xDomain);
        const ny = normalize(d[yKey] as number, yDomain);
        const nz = normalize(d[zKey] as number, zDomain);
        const {px, py, depth} = project(nx, ny, nz);
        return {px, py, depth, index: i};
      })
      .sort((a, b) => a.depth - b.depth);
  }, [data, xKey, yKey, zKey, project, xDomain, yDomain, zDomain, normalize]);

  const hw = width / 2,
    hh = height / 2;

  return (
    <>
      <rect x={0} y={0} width={hw} height={hh} fill={colors[0].bg} />
      <rect x={hw} y={0} width={hw} height={hh} fill={colors[1].bg} />
      <rect x={0} y={hh} width={hw} height={hh} fill={colors[2].bg} />
      <rect x={hw} y={hh} width={hw} height={hh} fill={colors[3].bg} />
      <g>
        {points.map(p => {
          const depthFactor = 0.5 + (p.depth + 0.5) * 0.5;
          const quadIdx = (p.px < hw ? 0 : 1) + (p.py < hh ? 0 : 2);
          return (
            <circle
              key={p.index}
              cx={p.px}
              cy={p.py}
              r={1.2 * depthFactor}
              fill={colors[quadIdx].dot}
              fillOpacity={0.65 * depthFactor}
            />
          );
        })}
      </g>
    </>
  );
}

export const QuadSplit: StoryObj = {
  render: () => {
    const data = useMemo(() => sphere(2500), []);
    return (
      <div style={{borderRadius: 16, overflow: 'hidden', maxWidth: 600}}>
        <ThreeDChart
          data={data}
          xKey="x"
          yKey="y"
          zKey="z"
          height={400}
          interactive
          autoRotate={0.15}>
          <QuadBackdropInner />
        </ThreeDChart>
      </div>
    );
  },
};
