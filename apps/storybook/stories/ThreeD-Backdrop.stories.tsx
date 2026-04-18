import type {Meta, StoryObj} from '@storybook/react';
import {useMemo} from 'react';
import {XDS3DChart, XDS3DBackdropScatterGL} from '@xds/lab';

const meta: Meta = {title: 'Lab/XDS3DChart/Backdrop'};
export default meta;

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

/** Solid dark — dots resolve to on-dark theme token */
export const SolidDark: StoryObj = {
  render: () => {
    const data = useMemo(() => sphere(2500), []);
    return (
      <div style={{borderRadius: 16, overflow: 'hidden', maxWidth: 600}}>
        <XDS3DChart
          data={data}
          xKey="x"
          yKey="y"
          zKey="z"
          height={400}
          interactive
          autoRotate={0.2}>
          <XDS3DBackdropScatterGL background="#0A1317" size={2} />
        </XDS3DChart>
      </div>
    );
  },
};

/** Solid accent blue */
export const SolidAccent: StoryObj = {
  render: () => {
    const data = useMemo(() => torusKnot(3000), []);
    return (
      <div style={{borderRadius: 16, overflow: 'hidden', maxWidth: 600}}>
        <XDS3DChart
          data={data}
          xKey="x"
          yKey="y"
          zKey="z"
          height={400}
          interactive
          autoRotate={0.2}>
          <XDS3DBackdropScatterGL background="#0064E0" size={1.5} />
        </XDS3DChart>
      </div>
    );
  },
};

/** Hard split — dark left, light right. Dots flip at the boundary. */
export const HardSplit: StoryObj = {
  render: () => {
    const data = useMemo(() => sphere(2500), []);
    return (
      <div style={{borderRadius: 16, overflow: 'hidden', maxWidth: 600}}>
        <XDS3DChart
          data={data}
          xKey="x"
          yKey="y"
          zKey="z"
          height={400}
          interactive
          autoRotate={0.2}>
          <XDS3DBackdropScatterGL
            background="linear-gradient(to right, #0A1317 50%, #F1F4F7 50%)"
            size={2}
          />
        </XDS3DChart>
      </div>
    );
  },
};

/** Smooth gradient — dots transition from light to dark */
export const SmoothGradient: StoryObj = {
  render: () => {
    const data = useMemo(() => sphere(2500), []);
    return (
      <div style={{borderRadius: 16, overflow: 'hidden', maxWidth: 600}}>
        <XDS3DChart
          data={data}
          xKey="x"
          yKey="y"
          zKey="z"
          height={400}
          interactive
          autoRotate={0.15}>
          <XDS3DBackdropScatterGL
            background="linear-gradient(135deg, #0A1317, #F1F4F7)"
            size={2}
          />
        </XDS3DChart>
      </div>
    );
  },
};

/** Bold gradient — blue to red */
export const BoldGradient: StoryObj = {
  render: () => {
    const data = useMemo(() => torusKnot(3000), []);
    return (
      <div style={{borderRadius: 16, overflow: 'hidden', maxWidth: 600}}>
        <XDS3DChart
          data={data}
          xKey="x"
          yKey="y"
          zKey="z"
          height={400}
          interactive
          autoRotate={0.2}>
          <XDS3DBackdropScatterGL
            background="linear-gradient(to right, #0064E0, #E3193B)"
            size={1.5}
          />
        </XDS3DChart>
      </div>
    );
  },
};

/** Debug: shows resolved theme colors and luminance at center + edges */
export const DebugColors: StoryObj = {
  render: () => {
    const data = useMemo(
      () => [
        {x: -1, y: 0, z: 0},
        {x: 0, y: 0, z: 0},
        {x: 1, y: 0, z: 0},
      ],
      [],
    );
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          maxWidth: 600,
        }}>
        <div style={{fontSize: 11}}>
          Three points: left edge, center, right edge. Dark/light split at
          center.
        </div>
        <div style={{borderRadius: 12, overflow: 'hidden'}}>
          <XDS3DChart
            data={data}
            xKey="x"
            yKey="y"
            zKey="z"
            height={200}
            azimuth={0}
            elevation={0}>
            <XDS3DBackdropScatterGL
              background="linear-gradient(to right, #0A1317 50%, #F1F4F7 50%)"
              size={20}
              opacity={1}
            />
          </XDS3DChart>
        </div>
        <div style={{fontSize: 11}}>
          Left dot should be white (on dark). Right dot should be dark (on
          light). Center at boundary.
        </div>
      </div>
    );
  },
};
