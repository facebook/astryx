import type {Meta, StoryObj} from '@storybook/react';
import {Fragment} from 'react';
import {XDSSVGIcon, type SVGIconVariation, type SVGIconDef} from '@xds/lab';
import {XDSStack, XDSText, XDSDivider} from '@xds/core';
import type {
  XIFIcon,
  XIFPath,
} from '../../../packages/lab/src/SVGIcon/xif-types';
import {
  xifCheck,
  xifHome,
  xifFile,
  xifShield,
  xifBell,
  xifStar,
  xifBellOverride,
  xifExamples,
} from '../../../packages/lab/src/SVGIcon/xif-examples';

// =============================================================================
// Adapter: XIFIcon → SVGIconDef (until XDSSVGIcon natively reads XIF)
// =============================================================================

function xifToSvgIconDef(xif: XIFIcon): SVGIconDef {
  const toPaths = (paths: XIFPath[]) =>
    paths.map(p => ({
      type: p.type ?? ('path' as const),
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
  title: 'Lab/XDSSVGIcon/XIF Spec',
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
    <XDSStack direction="vertical" gap={3}>
      <XDSText type="heading-3">XIF Spec Examples</XDSText>
      <XDSText type="supporting">
        Icons defined using the XDS Icon Format specification. Each demonstrates
        a different capability: stroke-only, two-layer knockout, composable
        slots, animation declarations, personality overrides, and bold geometry
        overrides.
      </XDSText>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `140px repeat(${VARIATIONS.length}, 1fr)`,
          gap: '8px 4px',
          alignItems: 'center',
        }}>
        <div />
        {VARIATIONS.map(v => (
          <XDSText
            key={v}
            type="label"
            style={{textAlign: 'center', fontSize: 10}}>
            {v}
          </XDSText>
        ))}

        {xifExamples.map(xif => {
          const def = xifToSvgIconDef(xif);
          const features: string[] = [];
          if (xif.slots?.length) features.push('🔌 slots');
          if (xif.paths.some(p => p.animate)) features.push('✨ animated');
          if (xif.paths.some(p => p.personality))
            features.push('🎨 personality');
          if (xif.overrides) features.push('🔀 overrides');
          if (xif.paths.some(p => p.layer === 'secondary'))
            features.push('📐 two-layer');

          return (
            <Fragment key={xif.name}>
              <div>
                <XDSText type="label" style={{fontSize: 11}}>
                  {xif.name}
                </XDSText>
                {features.length > 0 && (
                  <XDSText
                    type="supporting"
                    style={{fontSize: 9, marginTop: 2}}>
                    {features.join(' ')}
                  </XDSText>
                )}
              </div>
              {VARIATIONS.map(v => (
                <div
                  key={`${xif.name}-${v}`}
                  style={{display: 'flex', justifyContent: 'center'}}>
                  <XDSSVGIcon icon={def} variation={v} size="lg" />
                </div>
              ))}
            </Fragment>
          );
        })}
      </div>
    </XDSStack>
  ),
};

// ---------------------------------------------------------------------------
// Composition Demo
// ---------------------------------------------------------------------------

export const CompositionSlots: StoryObj = {
  render: () => {
    const shieldDef = xifToSvgIconDef(xifShield);
    const fileDef = xifToSvgIconDef(xifFile);
    const checkDef = xifToSvgIconDef(xifCheck);

    // Manually demonstrate what slot composition would produce
    // (Until the component natively supports slots)
    const composedShieldCheck: SVGIconDef = {
      name: 'shield-check',
      primary: [
        ...shieldDef.primary,
        // Injected badge: check scaled to 42% and centered
        {
          type: 'path' as const,
          attrs: {
            d: 'M9 13l2 2 4-4', // simplified check at shield center
          },
          role: 'stroke' as const,
        },
      ],
    };

    const composedShieldX: SVGIconDef = {
      name: 'shield-x',
      primary: [
        ...shieldDef.primary,
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
      <XDSStack direction="vertical" gap={3}>
        <XDSText type="heading-3">Composition via Slots</XDSText>
        <XDSText type="supporting">
          Icons with <code>slots</code> accept sub-icons. One shield base +
          different badges = many composed icons without extra path data.
        </XDSText>

        <XDSStack direction="horizontal" gap={4}>
          {[
            {label: 'shield (base)', def: shieldDef},
            {label: 'shield-check', def: composedShieldCheck},
            {label: 'shield-x', def: composedShieldX},
            {label: 'file (base)', def: fileDef},
            {label: 'file-text', def: composedFileText},
          ].map(({label, def}) => (
            <XDSStack key={label} direction="vertical" gap={1} hAlign="center">
              <XDSStack direction="horizontal" gap={2}>
                <XDSSVGIcon icon={def} variation="linear" size="lg" />
                <XDSSVGIcon icon={def} variation="bold" size="lg" />
              </XDSStack>
              <XDSText type="supporting" style={{fontSize: 10}}>
                {label}
              </XDSText>
            </XDSStack>
          ))}
        </XDSStack>

        <XDSDivider />

        <XDSText type="heading-4">Slot Definition</XDSText>
        <XDSText type="supporting">
          The shield icon defines:{' '}
          <code>
            slots: [&#123; name: &apos;badge&apos;, position:
            &apos;center&apos;, size: 0.42 &#125;]
          </code>
          . At render time, the component scales and positions the badge icon
          into the slot. The badge inherits the parent&apos;s variation and
          color.
        </XDSText>
      </XDSStack>
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
      <XDSStack direction="vertical" gap={3}>
        <XDSText type="heading-3">Personality Axes (Conceptual)</XDSText>
        <XDSText type="supporting">
          Shape personality parameters adjust the <em>feel</em> of icons without
          changing their structure. All adjustments are relative — preserving
          the artist&apos;s hierarchy of sharp vs soft. These icons show the
          concept; path manipulation is not yet implemented.
        </XDSText>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '120px repeat(5, 1fr)',
            gap: '12px 8px',
            alignItems: 'center',
          }}>
          <div />
          {presets.map(p => (
            <XDSStack key={p.name} direction="vertical" gap={0} hAlign="center">
              <XDSText type="label" style={{fontSize: 10}}>
                {p.name}
              </XDSText>
              <XDSText type="supporting" style={{fontSize: 8}}>
                {p.desc}
              </XDSText>
            </XDSStack>
          ))}

          {[
            {name: 'star', def: starDef},
            {name: 'home', def: homeDef},
            {name: 'bell', def: bellDef},
          ].map(({name, def}) => (
            <Fragment key={name}>
              <XDSText type="label" style={{fontSize: 11}}>
                {name}
              </XDSText>
              {presets.map((p, i) => (
                <div
                  key={p.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    opacity: 0.3 + i * 0.175,
                  }}>
                  <XDSSVGIcon
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

        <XDSText type="supporting">
          Note: opacity/stroke-width are used as visual placeholders here. The
          real implementation will modify path geometry — rounding corners,
          bowing segments, adjusting curve tension — all at build time via the
          theme pipeline.
        </XDSText>
      </XDSStack>
    );
  },
};

// ---------------------------------------------------------------------------
// Animation Intent Demo
// ---------------------------------------------------------------------------

export const AnimationIntent: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={3}>
      <XDSText type="heading-3">Animation Declarations</XDSText>
      <XDSText type="supporting">
        Icons declare animation <em>intent</em> per path — what type of motion
        and in what sequence order. The theme resolves all timing (duration,
        easing, stagger delay). No durations in the icon data.
      </XDSText>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '100px 1fr 1fr',
          gap: 12,
          alignItems: 'start',
        }}>
        <XDSText type="label" style={{fontSize: 10}}>
          Icon
        </XDSText>
        <XDSText type="label" style={{fontSize: 10}}>
          Preview
        </XDSText>
        <XDSText type="label" style={{fontSize: 10}}>
          Animation Data
        </XDSText>

        <XDSText type="label" style={{fontSize: 11}}>
          bell
        </XDSText>
        <XDSSVGIcon
          icon={xifToSvgIconDef(xifBell)}
          variation="linear"
          size="lg"
        />
        <div style={{fontSize: 11, fontFamily: 'monospace', lineHeight: 1.5}}>
          <div>
            path[0]: <strong>scale</strong> seq:1
          </div>
          <div>
            path[1]: <strong>draw</strong> seq:2
          </div>
          <div style={{color: '#888', marginTop: 4}}>
            Theme resolves: duration, easing, stagger
          </div>
        </div>
      </div>

      <XDSText type="heading-4">Animation Types</XDSText>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '80px 1fr',
          gap: '4px 12px',
          fontSize: 12,
        }}>
        <strong>draw</strong>
        <span>Stroke reveals along path (dasharray/dashoffset)</span>
        <strong>fade</strong>
        <span>Opacity entrance</span>
        <strong>scale</strong>
        <span>Grow from center</span>
        <strong>rotate</strong>
        <span>Continuous spin (loaders)</span>
        <strong>morph</strong>
        <span>Interpolate between variation states (linear → bold)</span>
      </div>
    </XDSStack>
  ),
};

// ---------------------------------------------------------------------------
// Path Transform Playground
// ---------------------------------------------------------------------------

// Import path transforms
import {
  applyPersonality,
  roundCorners,
  addCurvature,
  adjustTension,
} from '../../../packages/lab/src/SVGIcon/pathTransforms';

/** Simple test shapes for demonstrating transforms */
const testShapes = {
  // Square (all 90° corners)
  square: 'M4 4 L20 4 L20 20 L4 20 Z',
  // Diamond (45° corners at top/bottom, 135° at sides)
  diamond: 'M12 2 L22 12 L12 22 L2 12 Z',
  // Pentagon (108° corners)
  pentagon: 'M12 2 L21.5 9.5 L18.5 20 L5.5 20 L2.5 9.5 Z',
  // Arrow (mixed angles: sharp tip, 90° shoulders)
  arrow: 'M12 2 L20 10 L16 10 L16 22 L8 22 L8 10 L4 10 Z',
  // House (mixed: 45° roof peak, 90° body corners)
  house: 'M3 12 L12 3 L21 12 L21 21 L3 21 Z',
  // Star 5-point (36° tips, 252° inner angles)
  star: 'M12 2 L14.5 8.5 L21.5 9.5 L16.3 14.5 L17.6 21.5 L12 18 L6.4 21.5 L7.7 14.5 L2.5 9.5 L9.5 8.5 Z',
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
    const tensionLevels = [0, 0.25, 0.5, 0.75, 1.0];

    const shapes = Object.entries(testShapes);

    return (
      <XDSStack direction="vertical" gap={4}>
        <XDSText type="heading-3">Path Transform Playground</XDSText>
        <XDSText type="supporting">
          Live path manipulation with sagitta-corrected corner rounding. Sharp
          corners (like star tips) round less aggressively than gentle corners —
          achieving equal <em>perceived</em> roundness at all angles.
        </XDSText>

        {/* Corner Rounding */}
        <XDSText type="heading-4">Corner Rounding (sagitta-corrected)</XDSText>
        <XDSText type="supporting">
          Same cornerRounding value across all shapes. Sharp corners get less
          radius, gentle corners get more — visually balanced.
        </XDSText>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `80px repeat(${roundingLevels.length}, 1fr)`,
            gap: '8px 4px',
            alignItems: 'center',
          }}>
          <div />
          {roundingLevels.map(r => (
            <XDSText
              key={r}
              type="label"
              style={{textAlign: 'center', fontSize: 10}}>
              {r}
            </XDSText>
          ))}
          {shapes.map(([name, d]) => (
            <Fragment key={name}>
              <XDSText type="label" style={{fontSize: 11}}>
                {name}
              </XDSText>
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

        <XDSDivider />

        {/* Segment Curvature */}
        <XDSText type="heading-4">Segment Curvature</XDSText>
        <XDSText type="supporting">
          Straight line segments gain a perpendicular bow. Subtle at low values,
          pronounced at high.
        </XDSText>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `80px repeat(${curvatureLevels.length}, 1fr)`,
            gap: '8px 4px',
            alignItems: 'center',
          }}>
          <div />
          {curvatureLevels.map(c => (
            <XDSText
              key={c}
              type="label"
              style={{textAlign: 'center', fontSize: 10}}>
              {c}
            </XDSText>
          ))}
          {shapes.slice(0, 4).map(([name, d]) => (
            <Fragment key={name}>
              <XDSText type="label" style={{fontSize: 11}}>
                {name}
              </XDSText>
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

        <XDSDivider />

        {/* Combined: Rounding + Curvature presets */}
        <XDSText type="heading-4">
          Personality Presets (combined transforms)
        </XDSText>
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
            <XDSStack
              key={p.label}
              direction="vertical"
              hAlign="center"
              gap={0}>
              <XDSText type="label" style={{fontSize: 10}}>
                {p.label}
              </XDSText>
              <XDSText type="supporting" style={{fontSize: 8}}>
                r:{p.r} c:{p.c}
              </XDSText>
            </XDSStack>
          ))}
          {shapes.map(([name, d]) => (
            <Fragment key={name}>
              <XDSText type="label" style={{fontSize: 11}}>
                {name}
              </XDSText>
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
      </XDSStack>
    );
  },
};
