// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {Fragment} from 'react';
import {
  SVGIcon,
  type SVGIconVariation,
  type SVGIconDef,
  type IconShape,
} from '@xds/lab';
import {Stack, Text, Divider} from '@xds/core';
import {Heading} from '@xds/core/Text';
import type {
  XIFIcon,
  XIFPath,
} from '../../../packages/lab/src/SVGIcon/xif-types';
import {
  xifHome,
  xifFile,
  xifShield,
  xifBell,
  xifStar,
  xifExamples,
} from '../../../packages/lab/src/SVGIcon/xif-examples';

// =============================================================================
// Adapter: XIFIcon → SVGIconDef (until SVGIcon natively reads XIF)
// =============================================================================

function xifToSvgIconDef(xif: XIFIcon): SVGIconDef {
  const toPaths = (paths: XIFPath[]): IconShape[] =>
    paths
      .filter(p => (p.type ?? 'path') !== 'ellipse')
      .map(p => ({
        type: (p.type ?? 'path') as IconShape['type'],
        attrs: Object.fromEntries(
          Object.entries(p.attrs).map(([k, v]) => [k, String(v)]),
        ),
        role: p.role,
      }));

  const primary = toPaths(
    xif.paths.filter(p => (p.layer ?? 'primary') === 'primary'),
  );
  const secondary = toPaths(xif.paths.filter(p => p.layer === 'secondary'));

  return {
    name: xif.name,
    viewBox: xif.viewBox,
    primary,
    secondary: secondary.length > 0 ? secondary : undefined,
  };
}

// =============================================================================
// Story
// =============================================================================

const meta: Meta = {
  title: 'Lab/XIFSpec',
};
export default meta;

const VARIATIONS: SVGIconVariation[] = [
  'linear',
  'bold',
  'twotone',
  'bulk',
  'broken',
];

// ---------------------------------------------------------------------------
// Variation Matrix
// ---------------------------------------------------------------------------

export const SpecExamples: StoryObj = {
  render: () => (
    <Stack direction="vertical" gap={3}>
      <Heading level={3}>XIF Spec Examples</Heading>
      <Text type="supporting">
        Icons defined using the XDS Icon Format specification. Each demonstrates
        a different capability: stroke-only, two-layer knockout, composable
        slots, animation declarations, personality overrides, and bold geometry
        overrides.
      </Text>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `140px repeat(${VARIATIONS.length}, 1fr)`,
          gap: '8px 4px',
          alignItems: 'center',
        }}>
        <div />
        {VARIATIONS.map(v => (
          <Text
            key={v}
            type="label"
            style={{textAlign: 'center', fontSize: 10}}>
            {v}
          </Text>
        ))}

        {xifExamples.map(xif => {
          const def = xifToSvgIconDef(xif);
          const features: string[] = [];
          if (xif.slots?.length) {
            features.push('🔌 slots');
          }
          if (xif.paths.some(p => p.animate)) {
            features.push('✨ animated');
          }
          if (xif.paths.some(p => p.personality)) {
            features.push('🎨 personality');
          }
          if (xif.overrides) {
            features.push('🔀 overrides');
          }
          if (xif.paths.some(p => p.layer === 'secondary')) {
            features.push('📐 two-layer');
          }

          return (
            <Fragment key={xif.name}>
              <div>
                <Text type="label" style={{fontSize: 11}}>
                  {xif.name}
                </Text>
                {features.length > 0 && (
                  <Text
                    type="supporting"
                    style={{fontSize: 9, marginTop: 2}}>
                    {features.join(' ')}
                  </Text>
                )}
              </div>
              {VARIATIONS.map(v => (
                <div
                  key={`${xif.name}-${v}`}
                  style={{display: 'flex', justifyContent: 'center'}}>
                  <SVGIcon icon={def} variation={v} size="lg" />
                </div>
              ))}
            </Fragment>
          );
        })}
      </div>
    </Stack>
  ),
};

// ---------------------------------------------------------------------------
// Composition Demo
// ---------------------------------------------------------------------------

export const CompositionSlots: StoryObj = {
  render: () => {
    const shieldDef = xifToSvgIconDef(xifShield);
    const fileDef = xifToSvgIconDef(xifFile);
    // Manually demonstrate what slot composition would produce
    // (Until the component natively supports slots)
    const composedShieldCheck: SVGIconDef = {
      name: 'shield-check',
      primary: [...shieldDef.primary],
      secondary: [
        {
          type: 'path' as const,
          attrs: {d: 'M9 13l2 2 4-4'},
          role: 'stroke' as const,
        },
      ],
    };

    const composedShieldX: SVGIconDef = {
      name: 'shield-x',
      primary: [...shieldDef.primary],
      secondary: [
        {
          type: 'path' as const,
          attrs: {d: 'M9 9l6 6M15 9l-6 6'},
          role: 'stroke' as const,
        },
      ],
    };

    const composedFileText: SVGIconDef = {
      name: 'file-text',
      primary: [...fileDef.primary],
      secondary: [
        ...(fileDef.secondary ?? []),
        {
          type: 'line' as const,
          attrs: {x1: '9', y1: '13', x2: '15', y2: '13'},
          role: 'stroke' as const,
        },
        {
          type: 'line' as const,
          attrs: {x1: '9', y1: '17', x2: '13', y2: '17'},
          role: 'stroke' as const,
        },
      ],
    };

    return (
      <Stack direction="vertical" gap={3}>
        <Heading level={3}>Composition via Slots</Heading>
        <Text type="supporting">
          Icons with <code>slots</code> accept sub-icons. One shield base +
          different badges = many composed icons without extra path data.
        </Text>

        <Stack direction="horizontal" gap={4}>
          {[
            {label: 'shield (base)', def: shieldDef},
            {label: 'shield-check', def: composedShieldCheck},
            {label: 'shield-x', def: composedShieldX},
            {label: 'file (base)', def: fileDef},
            {label: 'file-text', def: composedFileText},
          ].map(({label, def}) => (
            <Stack key={label} direction="vertical" gap={1} hAlign="center">
              <Stack direction="horizontal" gap={2}>
                <SVGIcon icon={def} variation="linear" size="lg" />
                <SVGIcon icon={def} variation="bold" size="lg" />
              </Stack>
              <Text type="supporting" style={{fontSize: 10}}>
                {label}
              </Text>
            </Stack>
          ))}
        </Stack>

        <Divider />

        <Heading level={4}>Slot Definition</Heading>
        <Text type="supporting">
          The shield icon defines:{' '}
          <code>
            slots: [&#123; name: &apos;badge&apos;, position:
            &apos;center&apos;, size: 0.42 &#125;]
          </code>
          . At render time, the component scales and positions the badge icon
          into the slot. The badge inherits the parent&apos;s variation and
          color.
        </Text>
      </Stack>
    );
  },
};

// ---------------------------------------------------------------------------
// Personality Axes Demo
// ---------------------------------------------------------------------------

export const PersonalityAxes: StoryObj = {
  render: () => {
    const starDef = xifToSvgIconDef(xifStar);
    const homeDef = xifToSvgIconDef(xifHome);
    const bellDef = xifToSvgIconDef(xifBell);

    const presets = [
      {name: 'Brutalist', desc: 'Sharp corners, straight lines, tight curves'},
      {name: 'Technical', desc: 'Minimal rounding, precise geometry'},
      {name: 'Default', desc: 'Balanced — slight softening'},
      {name: 'Friendly', desc: 'Rounded corners, subtle curves'},
      {name: 'Playful', desc: 'Very rounded, bowed segments'},
    ];

    return (
      <Stack direction="vertical" gap={3}>
        <Heading level={3}>Personality Axes (Conceptual)</Heading>
        <Text type="supporting">
          Shape personality parameters adjust the <em>feel</em> of icons without
          changing their structure. All adjustments are relative, preserving the
          artist&apos;s hierarchy of sharp vs soft. These icons show the
          concept; path manipulation is not yet implemented.
        </Text>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '120px repeat(5, 1fr)',
            gap: '12px 8px',
            alignItems: 'center',
          }}>
          <div />
          {presets.map(p => (
            <Stack key={p.name} direction="vertical" gap={0} hAlign="center">
              <Text type="label" style={{fontSize: 10}}>
                {p.name}
              </Text>
              <Text type="supporting" style={{fontSize: 8}}>
                {p.desc}
              </Text>
            </Stack>
          ))}

          {[
            {name: 'star', def: starDef},
            {name: 'home', def: homeDef},
            {name: 'bell', def: bellDef},
          ].map(({name, def}) => (
            <Fragment key={name}>
              <Text type="label" style={{fontSize: 11}}>
                {name}
              </Text>
              {presets.map((p, i) => (
                <div
                  key={p.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    opacity: 0.3 + i * 0.175,
                  }}>
                  <SVGIcon
                    icon={def}
                    variation="linear"
                    size="lg"
                    strokeWidth={1.5 - i * 0.1}
                  />
                </div>
              ))}
            </Fragment>
          ))}
        </div>

        <Text type="supporting">
          Note: opacity/stroke-width are used as visual placeholders here. The
          real implementation will modify path geometry, rounding corners,
          bowing segments, adjusting curve tension, all at build time via the
          theme pipeline.
        </Text>
      </Stack>
    );
  },
};

// ---------------------------------------------------------------------------
// Animation Intent Demo
// ---------------------------------------------------------------------------

export const AnimationIntent: StoryObj = {
  render: () => {
    const animStyles = `
      @keyframes xif-draw { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
      @keyframes xif-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes xif-scale { from { transform: scale(0); } to { transform: scale(1); } }
      @keyframes xif-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .xif-draw path { stroke-dasharray: 100; stroke-dashoffset: 100; animation: xif-draw 1.2s ease-out forwards; }
      .xif-draw path:nth-child(2) { animation-delay: 0.4s; }
      .xif-fade path { opacity: 0; animation: xif-fade 0.6s ease-out forwards; }
      .xif-fade path:nth-child(2) { animation-delay: 0.3s; }
      .xif-scale path { transform-origin: center; transform: scale(0); animation: xif-scale 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      .xif-scale path:nth-child(2) { animation-delay: 0.2s; }
      .xif-rotate { transform-origin: center; animation: xif-rotate 2s linear infinite; }
    `;

    const demos = [
      {
        name: 'draw',
        desc: 'Stroke reveals along path',
        cls: 'xif-draw',
        paths: [
          'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9',
          'M10.3 21a1.94 1.94 0 0 0 3.4 0',
        ],
      },
      {
        name: 'fade',
        desc: 'Opacity entrance per layer',
        cls: 'xif-fade',
        paths: [
          'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
          'M9 12l2 2 4-4',
        ],
      },
      {
        name: 'scale',
        desc: 'Grow from center',
        cls: 'xif-scale',
        paths: [
          'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z',
        ],
      },
      {
        name: 'rotate',
        desc: 'Continuous spin',
        cls: 'xif-rotate',
        paths: [
          'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z',
        ],
      },
    ];

    return (
      <Stack direction="vertical" gap={3}>
        <style dangerouslySetInnerHTML={{__html: animStyles}} />
        <Heading level={3}>Animation Types (Live)</Heading>
        <Text type="supporting">
          Icons declare animation intent per path. The theme resolves timing.
          Each demo loops on page load.
        </Text>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
          }}>
          {demos.map(demo => (
            <Stack
              key={demo.name}
              direction="vertical"
              gap={1}
              hAlign="center"
              style={{padding: 16}}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="48"
                height="48"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={demo.cls}>
                {demo.paths.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </svg>
              <Text type="label" style={{fontSize: 12, marginTop: 8}}>
                {demo.name}
              </Text>
              <Text
                type="supporting"
                style={{fontSize: 10, textAlign: 'center'}}>
                {demo.desc}
              </Text>
            </Stack>
          ))}
        </div>
      </Stack>
    );
  },
};

// ---------------------------------------------------------------------------
// Path Transform Playground
// ---------------------------------------------------------------------------

// Import path transforms
import {
  applyPersonality,
  roundCorners,
  addCurvature,
} from '../../../packages/lab/src/SVGIcon/pathTransforms';

/** Simple test shapes for demonstrating transforms */
const testShapes = {
  square: 'M4 4 L20 4 L20 20 L4 20 Z',
  diamond: 'M12 2 L22 12 L12 22 L2 12 Z',
  arrow: 'M12 2 L20 10 L16 10 L16 22 L8 22 L8 10 L4 10 Z',
  star: 'M12 2 L14.5 8.5 L21.5 9.5 L16.3 14.5 L17.6 21.5 L12 18 L6.4 21.5 L7.7 14.5 L2.5 9.5 L9.5 8.5 Z',
  bell: 'M4 17 L4 9 L8 5 L12 3 L16 5 L20 9 L20 17 Z',
  envelope: 'M2 6 L12 13 L22 6 L22 18 L2 18 Z',
  chat: 'M3 4 L21 4 L21 16 L13 16 L8 21 L8 16 L3 16 Z',
  shield: 'M4 5 L12 2 L20 5 L20 13 L12 22 L4 13 Z',
  hexagon: 'M12 2 L20.5 6.5 L20.5 15.5 L12 20 L3.5 15.5 L3.5 6.5 Z',
  bookmark: 'M6 2 L18 2 L18 22 L12 17 L6 22 Z',
};

/**
 * Interactive path transform playground.
 * Demonstrates corner rounding, segment curvature, and tension
 * with live SVG rendering.
 */
export const PathTransformPlayground: StoryObj = {
  render: () => {
    // We can't use hooks in stories without a wrapper,
    // so we render multiple preset rows instead
    const roundingLevels = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    const curvatureLevels = [0, 0.2, 0.5, 0.8, 1.0];
    const shapes = Object.entries(testShapes);

    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Path Transform Playground</Heading>
        <Text type="supporting">
          Live path manipulation with sagitta-corrected corner rounding. Sharp
          corners (like star tips) round less aggressively than gentle corners,
          achieving equal <em>perceived</em> roundness at all angles.
        </Text>

        {/* Corner Rounding */}
        <Heading level={4}>Corner Rounding (sagitta-corrected)</Heading>
        <Text type="supporting">
          Same cornerRounding value across all shapes. Sharp corners get less
          radius, gentle corners get more, visually balanced.
        </Text>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `80px repeat(${roundingLevels.length}, 1fr)`,
            gap: '8px 4px',
            alignItems: 'center',
          }}>
          <div />
          {roundingLevels.map(r => (
            <Text
              key={r}
              type="label"
              style={{textAlign: 'center', fontSize: 10}}>
              {r}
            </Text>
          ))}
          {shapes.map(([name, d]) => (
            <Fragment key={name}>
              <Text type="label" style={{fontSize: 11}}>
                {name}
              </Text>
              {roundingLevels.map(r => (
                <div
                  key={r}
                  style={{display: 'flex', justifyContent: 'center'}}>
                  <svg
                    viewBox="0 0 24 24"
                    width="40"
                    height="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d={roundCorners(d, r)} />
                  </svg>
                </div>
              ))}
            </Fragment>
          ))}
        </div>

        <Divider />

        {/* Segment Curvature */}
        <Heading level={4}>Segment Curvature</Heading>
        <Text type="supporting">
          Straight line segments gain a perpendicular bow. Subtle at low values,
          pronounced at high.
        </Text>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `80px repeat(${curvatureLevels.length}, 1fr)`,
            gap: '8px 4px',
            alignItems: 'center',
          }}>
          <div />
          {curvatureLevels.map(c => (
            <Text
              key={c}
              type="label"
              style={{textAlign: 'center', fontSize: 10}}>
              {c}
            </Text>
          ))}
          {shapes.slice(0, 5).map(([name, d]) => (
            <Fragment key={name}>
              <Text type="label" style={{fontSize: 11}}>
                {name}
              </Text>
              {curvatureLevels.map(c => (
                <div
                  key={c}
                  style={{display: 'flex', justifyContent: 'center'}}>
                  <svg
                    viewBox="0 0 24 24"
                    width="40"
                    height="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d={addCurvature(d, c)} />
                  </svg>
                </div>
              ))}
            </Fragment>
          ))}
        </div>

        <Divider />

        {/* Combined: Rounding + Curvature presets */}
        <Heading level={4}>
          Personality Presets (combined transforms)
        </Heading>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `80px repeat(5, 1fr)`,
            gap: '8px 4px',
            alignItems: 'center',
          }}>
          <div />
          {[
            {label: 'Brutalist', r: 0, c: 0},
            {label: 'Technical', r: 0.1, c: 0},
            {label: 'Default', r: 0.25, c: 0.05},
            {label: 'Friendly', r: 0.5, c: 0.15},
            {label: 'Playful', r: 0.8, c: 0.3},
          ].map(p => (
            <Stack
              key={p.label}
              direction="vertical"
              hAlign="center"
              gap={0}>
              <Text type="label" style={{fontSize: 10}}>
                {p.label}
              </Text>
              <Text type="supporting" style={{fontSize: 8}}>
                r:{p.r} c:{p.c}
              </Text>
            </Stack>
          ))}
          {shapes.map(([name, d]) => (
            <Fragment key={name}>
              <Text type="label" style={{fontSize: 11}}>
                {name}
              </Text>
              {[
                {r: 0, c: 0},
                {r: 0.1, c: 0},
                {r: 0.25, c: 0.05},
                {r: 0.5, c: 0.15},
                {r: 0.8, c: 0.3},
              ].map((p, i) => {
                const transformed = applyPersonality(d, {
                  cornerRounding: p.r,
                  segmentCurvature: p.c,
                });
                return (
                  <div
                    key={i}
                    style={{display: 'flex', justifyContent: 'center'}}>
                    <svg
                      viewBox="0 0 24 24"
                      width="40"
                      height="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d={transformed} />
                    </svg>
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </Stack>
    );
  },
};
