// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useMemo} from 'react';
import {
  ThreeDChart,
  ThreeDScatter,
  ThreeDScatterGL,
} from '@xds/lab';
import {MediaTheme} from '@xds/core/theme';

const meta: Meta = {title: 'Lab/3DChart/PopArt'};
export default meta;

// =============================================================================
// Shapes
// =============================================================================

function teapot(n: number) {
  const pts: Record<string, unknown>[] = [];
  // Body — wider, less tall
  for (let i = 0; i < n * 0.45; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI;
    const profile = Math.sin(v) * (1.2 + 0.2 * Math.sin(2 * v));
    pts.push({
      x: profile * Math.cos(u),
      z: profile * Math.sin(u),
      y: Math.cos(v) * 0.7,
    });
  }
  // Spout — curved tube
  for (let i = 0; i < n * 0.18; i++) {
    const t = Math.random();
    const a = Math.random() * Math.PI * 2;
    const r = 0.09 * (1 - t * 0.4);
    pts.push({
      x: 1.1 + t * 0.6 + t * t * 0.2,
      z: r * Math.cos(a),
      y: -0.1 + t * 0.6 + t * t * 0.2,
    });
  }
  // Handle — arch
  for (let i = 0; i < n * 0.17; i++) {
    const t = Math.random() * Math.PI;
    const a = Math.random() * Math.PI * 2;
    const r = 0.07;
    pts.push({
      x: -1.1 - 0.5 * Math.sin(t),
      z: r * Math.cos(a),
      y: -0.35 + 0.7 * Math.sin(t),
    });
  }
  // Lid
  for (let i = 0; i < n * 0.15; i++) {
    const r = Math.random() * 0.6;
    const a = Math.random() * Math.PI * 2;
    pts.push({x: r * Math.cos(a), z: r * Math.sin(a), y: 0.72});
  }
  // Knob
  for (let i = 0; i < n * 0.05; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI;
    const r = 0.1;
    pts.push({
      x: r * Math.sin(v) * Math.cos(u),
      z: r * Math.sin(v) * Math.sin(u),
      y: 0.82 + r * Math.cos(v),
    });
  }
  return pts;
}

function heart(n: number) {
  return Array.from({length: n}, () => {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI;
    const x = Math.sin(v) * (15 * Math.sin(u) - 4 * Math.sin(3 * u));
    const y = 8 * Math.cos(v);
    const z =
      Math.sin(v) *
      (15 * Math.cos(u) -
        5 * Math.cos(2 * u) -
        2 * Math.cos(3 * u) -
        Math.cos(4 * u));
    return {x: x / 16, y: y / 16, z: z / 16};
  });
}

function seashell(n: number) {
  return Array.from({length: n}, () => {
    const u = Math.random() * 4 * Math.PI;
    const v = Math.random() * Math.PI * 2;
    const r = Math.exp(0.15 * u);
    const opening = 0.3 + 0.3 * Math.cos(v);
    const x = r * Math.cos(u) * opening;
    const z = r * Math.sin(u) * opening;
    const y = r * (0.08 * u + 0.2 * Math.sin(v));
    const s = 0.1;
    return {x: x * s, z: z * s, y: y * s - 0.5};
  });
}

function kleinBottle(n: number) {
  return Array.from({length: n}, () => {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 2;
    const r = 4 * (1 - Math.cos(u) / 2);
    let x: number, z: number;
    if (u < Math.PI) {
      x = 6 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(u) * Math.cos(v);
      z = r * Math.sin(u) * Math.cos(v);
    } else {
      x = 6 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(v + Math.PI);
      z = r * Math.sin(u) * Math.cos(v);
    }
    const y = -16 * Math.sin(u) + r * Math.sin(v);
    return {x: x / 22, y: y / 22, z: z / 22};
  });
}

function star(n: number) {
  const pts: Record<string, unknown>[] = [];
  const spikes = 5;
  for (let i = 0; i < n; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.acos(2 * Math.random() - 1);
    const spike = 0.6 + 0.6 * Math.pow(Math.abs(Math.cos((spikes * u) / 2)), 8);
    const r = spike;
    pts.push({
      x: r * Math.sin(v) * Math.cos(u),
      y: r * Math.cos(v),
      z: r * Math.sin(v) * Math.sin(u),
    });
  }
  return pts;
}

function tree(n: number) {
  const pts: Record<string, unknown>[] = [];
  // Trunk — tapered cylinder
  for (let i = 0; i < n * 0.15; i++) {
    const h = Math.random() * 1.0;
    const a = Math.random() * Math.PI * 2;
    const r = 0.1 * (1 - h * 0.4);
    pts.push({x: r * Math.cos(a), y: h, z: r * Math.sin(a)});
  }
  // Canopy — cone-ish layers of points
  for (let i = 0; i < n * 0.85; i++) {
    const layer = Math.random();
    const h = 0.8 + layer * 1.4;
    const maxR = 0.8 * (1 - layer * 0.7);
    const r = Math.sqrt(Math.random()) * maxR;
    const a = Math.random() * Math.PI * 2;
    pts.push({
      x: r * Math.cos(a) + (Math.random() - 0.5) * 0.05,
      y: h + (Math.random() - 0.5) * 0.15,
      z: r * Math.sin(a) + (Math.random() - 0.5) * 0.05,
    });
  }
  return pts;
}

// =============================================================================
// Cell
// =============================================================================

interface CellProps {
  bg: string;
  mediaMode: 'dark' | 'light';
  data: Record<string, unknown>[];
  label: string;
  azimuth?: number;
  elevation?: number;
}

function Cell({
  bg,
  mediaMode,
  data,
  label,
  azimuth = 30,
  elevation = 20,
}: CellProps) {
  return (
    <MediaTheme mode={mediaMode}>
      <div
        style={{
          background: bg,
          borderRadius: 16,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
        <div style={{flex: 1, padding: 4}}>
          <ThreeDChart
            data={data}
            xKey="x"
            yKey="y"
            zKey="z"
            height={220}
            azimuth={azimuth}
            elevation={elevation}
            interactive
            autoRotate={0.3}>
            <ThreeDScatterGL
              color={mediaMode === 'dark' ? '#DFE2E5' : '#0A1317'}
              size={1.5}
              opacity={0.6}
            />
          </ThreeDChart>
        </div>
        <div
          style={{
            padding: '6px 12px',
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            textAlign: 'center',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
          {label}
        </div>
      </div>
    </MediaTheme>
  );
}

// =============================================================================
// Stories
// =============================================================================

export const Gallery: StoryObj = {
  render: () => {
    const shapes = useMemo(
      () => [
        {data: teapot(3000), label: 'Teapot', az: 30, el: 25},
        {data: heart(2500), label: 'Heart', az: 0, el: 15},
        {data: seashell(3000), label: 'Seashell', az: 45, el: 30},
        {data: kleinBottle(2500), label: 'Klein Bottle', az: 50, el: 25},
        {data: star(2500), label: 'Star', az: 30, el: 35},
        {data: tree(3000), label: 'Tree', az: 35, el: 15},
      ],
      [],
    );

    const palettes: {bg: string; mode: 'dark' | 'light'}[] = [
      {bg: '#0064E0', mode: 'dark'},
      {bg: '#E3193B', mode: 'dark'},
      {bg: '#FBCE03', mode: 'light'},
      {bg: '#6B1EFD', mode: 'dark'},
      {bg: '#0B991F', mode: 'dark'},
      {bg: '#EB6E00', mode: 'dark'},
    ];

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          maxWidth: 780,
        }}>
        {shapes.map((s, i) => (
          <Cell
            key={i}
            bg={palettes[i].bg}
            mediaMode={palettes[i].mode}
            data={s.data}
            label={s.label}
            azimuth={s.az}
            elevation={s.el}
          />
        ))}
      </div>
    );
  },
};

export const DarkGallery: StoryObj = {
  render: () => {
    const shapes = useMemo(
      () => [
        {data: teapot(3000), label: 'Teapot', az: 30, el: 25},
        {data: heart(2500), label: 'Heart', az: 0, el: 15},
        {data: seashell(3000), label: 'Seashell', az: 45, el: 30},
        {data: kleinBottle(2500), label: 'Klein Bottle', az: 50, el: 25},
        {data: star(2500), label: 'Star', az: 30, el: 35},
        {data: tree(3000), label: 'Tree', az: 35, el: 15},
      ],
      [],
    );

    const bgs = [
      '#1a1a2e',
      '#16213e',
      '#0f3460',
      '#1b1b2f',
      '#162447',
      '#1f1f38',
    ];

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          maxWidth: 780,
        }}>
        {shapes.map((s, i) => (
          <Cell
            key={i}
            bg={bgs[i]}
            mediaMode="dark"
            data={s.data}
            label={s.label}
            azimuth={s.az}
            elevation={s.el}
          />
        ))}
      </div>
    );
  },
};

/** Side-by-side SVG vs WebGL — same data, same camera, same depth params */
export const SVGvsWebGL: StoryObj = {
  render: () => {
    const data = useMemo(() => {
      const phi = (1 + Math.sqrt(5)) / 2;
      return Array.from({length: 2000}, (_, i) => {
        const theta = Math.acos(1 - (2 * (i + 0.5)) / 2000);
        const p = (2 * Math.PI * i) / phi;
        return {
          x: Math.sin(theta) * Math.cos(p),
          y: Math.sin(theta) * Math.sin(p),
          z: Math.cos(theta),
        };
      });
    }, []);
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          maxWidth: 780,
        }}>
        <div
          style={{background: '#0064E0', borderRadius: 16, overflow: 'hidden'}}>
          <MediaTheme mode="dark">
            <div
              style={{
                padding: '6px 12px',
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                textAlign: 'center',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
              SVG (ThreeDScatter)
            </div>
            <ThreeDChart
              data={data}
              xKey="x"
              yKey="y"
              zKey="z"
              height={300}
              azimuth={30}
              elevation={20}
              interactive
              autoRotate={0.3}>
              <ThreeDScatter color="#DFE2E5" radius={1.5} opacity={0.85} />
            </ThreeDChart>
          </MediaTheme>
        </div>
        <div
          style={{background: '#0064E0', borderRadius: 16, overflow: 'hidden'}}>
          <MediaTheme mode="dark">
            <div
              style={{
                padding: '6px 12px',
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                textAlign: 'center',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
              WebGL (ThreeDScatterGL)
            </div>
            <ThreeDChart
              data={data}
              xKey="x"
              yKey="y"
              zKey="z"
              height={300}
              azimuth={30}
              elevation={20}
              interactive
              autoRotate={0.3}>
              <ThreeDScatterGL color="#DFE2E5" size={3} opacity={0.85} />
            </ThreeDChart>
          </MediaTheme>
        </div>
      </div>
    );
  },
};

/** Debug: 8 cube corners + center, labeled coordinates. SVG vs WebGL side by side. */
export const DebugProjection: StoryObj = {
  render: () => {
    const debugData = useMemo(
      () => [
        {x: 0, y: 0, z: 0},
        {x: 1, y: 0, z: 0},
        {x: 0, y: 1, z: 0},
        {x: 0, y: 0, z: 1},
        {x: 1, y: 1, z: 0},
        {x: 1, y: 0, z: 1},
        {x: 0, y: 1, z: 1},
        {x: 1, y: 1, z: 1},
        {x: 0.5, y: 0.5, z: 0.5},
      ],
      [],
    );

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          maxWidth: 780,
        }}>
        <div
          style={{
            border: '1px solid red',
            borderRadius: 8,
            overflow: 'hidden',
          }}>
          <div
            style={{
              padding: '4px 8px',
              fontSize: 11,
              fontWeight: 600,
              color: 'red',
            }}>
            SVG
          </div>
          <ThreeDChart
            data={debugData}
            xKey="x"
            yKey="y"
            zKey="z"
            height={300}
            azimuth={35}
            elevation={25}>
            <ThreeDScatter color="#E3193B" radius={6} opacity={1} />
          </ThreeDChart>
        </div>
        <div
          style={{
            border: '1px solid blue',
            borderRadius: 8,
            overflow: 'hidden',
          }}>
          <div
            style={{
              padding: '4px 8px',
              fontSize: 11,
              fontWeight: 600,
              color: 'blue',
            }}>
            WebGL
          </div>
          <ThreeDChart
            data={debugData}
            xKey="x"
            yKey="y"
            zKey="z"
            height={300}
            azimuth={35}
            elevation={25}>
            <ThreeDScatterGL color="#0064E0" size={12} opacity={1} />
          </ThreeDChart>
        </div>
      </div>
    );
  },
};
/** Debug: same 9 points, same color, overlaid on ONE chart — SVG circles + WebGL dots */
export const DebugOverlay: StoryObj = {
  render: () => {
    const debugData = useMemo(
      () => [
        {x: 0, y: 0, z: 0},
        {x: 1, y: 0, z: 0},
        {x: 0, y: 1, z: 0},
        {x: 0, y: 0, z: 1},
        {x: 1, y: 1, z: 0},
        {x: 1, y: 0, z: 1},
        {x: 0, y: 1, z: 1},
        {x: 1, y: 1, z: 1},
        {x: 0.5, y: 0.5, z: 0.5},
      ],
      [],
    );
    return (
      <div style={{border: '1px solid #ccc', borderRadius: 8, maxWidth: 500}}>
        <div style={{padding: '4px 8px', fontSize: 11}}>
          Red = SVG, Blue = WebGL. If Tier 1 holds, they overlap perfectly.
        </div>
        <ThreeDChart
          data={debugData}
          xKey="x"
          yKey="y"
          zKey="z"
          height={400}
          azimuth={35}
          elevation={25}>
          <ThreeDScatter color="#E3193B" radius={8} opacity={0.8} />
          <ThreeDScatterGL color="#0064E0" size={8} opacity={0.8} />
        </ThreeDChart>
      </div>
    );
  },
};

/** Debug: size/opacity parity — reduced grid to avoid WebGL context limit */
export const DebugSizeOpacity: StoryObj = {
  render: () => {
    const pt = useMemo(() => [{x: 0.5, y: 0.5, z: 0.5}], []);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          maxWidth: 700,
        }}>
        <div style={{fontSize: 11, fontWeight: 500}}>
          Size 16, \u03b1=1.0 — SVG only | GL only | SVG on GL | GL on SVG
        </div>
        <div style={{display: 'flex', gap: 4}}>
          <div
            style={{
              border: '1px solid #eee',
              borderRadius: 6,
              width: 120,
              textAlign: 'center',
            }}>
            <div style={{fontSize: 9, color: '#ccc'}}>SVG 16</div>
            <ThreeDChart
              data={pt}
              xKey="x"
              yKey="y"
              zKey="z"
              height={120}
              azimuth={0}
              elevation={0}>
              <ThreeDScatter color="#E3193B" radius={8} opacity={1} />
            </ThreeDChart>
          </div>
          <div
            style={{
              border: '1px solid #eee',
              borderRadius: 6,
              width: 120,
              textAlign: 'center',
            }}>
            <div style={{fontSize: 9, color: '#ccc'}}>GL 16</div>
            <ThreeDChart
              data={pt}
              xKey="x"
              yKey="y"
              zKey="z"
              height={120}
              azimuth={0}
              elevation={0}>
              <ThreeDScatterGL color="#0064E0" size={16} opacity={1} />
            </ThreeDChart>
          </div>
          <div
            style={{
              border: '1px solid #eee',
              borderRadius: 6,
              width: 120,
              textAlign: 'center',
            }}>
            <div style={{fontSize: 9, color: '#ccc'}}>SVG on GL</div>
            <ThreeDChart
              data={pt}
              xKey="x"
              yKey="y"
              zKey="z"
              height={120}
              azimuth={0}
              elevation={0}>
              <ThreeDScatterGL color="#0064E0" size={16} opacity={1} />
              <ThreeDScatter color="#E3193B" radius={8} opacity={1} />
            </ThreeDChart>
          </div>
          <div
            style={{
              border: '1px solid #eee',
              borderRadius: 6,
              width: 120,
              textAlign: 'center',
            }}>
            <div style={{fontSize: 9, color: '#ccc'}}>GL on SVG</div>
            <ThreeDChart
              data={pt}
              xKey="x"
              yKey="y"
              zKey="z"
              height={120}
              azimuth={0}
              elevation={0}>
              <ThreeDScatter color="#E3193B" radius={8} opacity={1} />
              <ThreeDScatterGL color="#0064E0" size={16} opacity={1} />
            </ThreeDChart>
          </div>
        </div>
        <div style={{fontSize: 11, fontWeight: 500}}>Size 16, \u03b1=0.5</div>
        <div style={{display: 'flex', gap: 4}}>
          <div
            style={{
              border: '1px solid #eee',
              borderRadius: 6,
              width: 120,
              textAlign: 'center',
            }}>
            <div style={{fontSize: 9, color: '#ccc'}}>SVG on GL</div>
            <ThreeDChart
              data={pt}
              xKey="x"
              yKey="y"
              zKey="z"
              height={120}
              azimuth={0}
              elevation={0}>
              <ThreeDScatterGL color="#0064E0" size={16} opacity={0.5} />
              <ThreeDScatter color="#E3193B" radius={8} opacity={0.5} />
            </ThreeDChart>
          </div>
          <div
            style={{
              border: '1px solid #eee',
              borderRadius: 6,
              width: 120,
              textAlign: 'center',
            }}>
            <div style={{fontSize: 9, color: '#ccc'}}>GL on SVG</div>
            <ThreeDChart
              data={pt}
              xKey="x"
              yKey="y"
              zKey="z"
              height={120}
              azimuth={0}
              elevation={0}>
              <ThreeDScatter color="#E3193B" radius={8} opacity={0.5} />
              <ThreeDScatterGL color="#0064E0" size={16} opacity={0.5} />
            </ThreeDChart>
          </div>
        </div>
      </div>
    );
  },
};
