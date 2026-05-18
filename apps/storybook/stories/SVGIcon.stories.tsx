// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {Fragment} from 'react';
import {
  XDSSVGIcon,
  type SVGIconVariation,
  type SVGIconSize,
  type SVGIconColor,
  starterIcons,
  bellIcon,
  settingsIcon,
  homeIcon,
  menuIcon,
  eyeIcon,
  searchIcon,
  mailIcon,
  lockIcon,
} from '@xds/lab';
import {XDSStack, XDSText, XDSDivider} from '@xds/core';

const meta: Meta<typeof XDSSVGIcon> = {
  title: 'Lab/SVGIcon',
  component: XDSSVGIcon,
  argTypes: {
    variation: {
      control: 'select',
      options: [
        'linear',
        'bold',
        'twotone',
        'bulk',
        'broken',
      ] as SVGIconVariation[],
    },
    size: {
      control: 'select',
      options: ['xsm', 'sm', 'md', 'lg'] as SVGIconSize[],
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'disabled',
        'accent',
        'positive',
        'negative',
        'warning',
        'inherit',
      ] as SVGIconColor[],
    },
    strokeWidth: {control: {type: 'range', min: 0.5, max: 4, step: 0.25}},
  },
};

export default meta;
type Story = StoryObj<typeof XDSSVGIcon>;

// =============================================================================
// Basic
// =============================================================================

export const Default: Story = {
  args: {
    icon: bellIcon,
    variation: 'linear',
    size: 'lg',
    color: 'primary',
  },
};

// =============================================================================
// All Icons x All Variations
// =============================================================================

const VARIATIONS: SVGIconVariation[] = [
  'linear',
  'bold',
  'twotone',
  'bulk',
  'broken',
];

export const VariationMatrix: Story = {
  render: () => (
    <XDSStack direction="vertical" gap={3}>
      <XDSText variant="heading-3">Variation Matrix</XDSText>
      <XDSText variant="body-sm" color="secondary">
        Same SVG paths, different visual treatments via CSS custom properties.
        Note how stroke-role elements (menu lines, calendar pegs, bell clapper)
        stay as strokes even in bold/bulk mode.
      </XDSText>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `120px repeat(${VARIATIONS.length}, 1fr)`,
          gap: 12,
          alignItems: 'center',
        }}>
        {/* Header row */}
        <div />
        {VARIATIONS.map(v => (
          <XDSText
            key={v}
            variant="label-sm"
            color="secondary"
            style={{textAlign: 'center'}}>
            {v}
          </XDSText>
        ))}

        {/* Icon rows */}
        {starterIcons.map(icon => (
          <Fragment key={icon.name}>
            <XDSText variant="label-sm">{icon.name}</XDSText>
            {VARIATIONS.map(v => (
              <div
                key={`${icon.name}-${v}`}
                style={{display: 'flex', justifyContent: 'center'}}>
                <XDSSVGIcon icon={icon} variation={v} size="lg" />
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </XDSStack>
  ),
};

// =============================================================================
// Role Behavior Demo
// =============================================================================

export const RoleBehavior: Story = {
  render: () => (
    <XDSStack direction="vertical" gap={3}>
      <XDSText variant="heading-3">Path Roles: Fill vs Stroke</XDSText>
      <XDSText variant="body-sm" color="secondary">
        Stroke-role elements always stay as strokes. Fill-role elements switch
        between stroke (linear) and fill (bold). Compare Menu (all stroke-role)
        vs Home (fill-role body + fill-role door with mask knockout).
      </XDSText>

      <XDSStack direction="vertical" gap={2}>
        <XDSText variant="label-sm" color="secondary">
          Menu — all stroke-role (lines never become fills)
        </XDSText>
        <XDSStack direction="row" gap={3}>
          {VARIATIONS.map(v => (
            <XDSStack direction="vertical" key={v} gap={0.5} hAlign="center">
              <XDSSVGIcon icon={menuIcon} variation={v} size="lg" />
              <XDSText variant="label-sm" color="secondary">
                {v}
              </XDSText>
            </XDSStack>
          ))}
        </XDSStack>

        <XDSDivider />

        <XDSText variant="label-sm" color="secondary">
          Home — fill-role body + door (mask gap in bold)
        </XDSText>
        <XDSStack direction="row" gap={3}>
          {VARIATIONS.map(v => (
            <XDSStack direction="vertical" key={v} gap={0.5} hAlign="center">
              <XDSSVGIcon icon={homeIcon} variation={v} size="lg" />
              <XDSText variant="label-sm" color="secondary">
                {v}
              </XDSText>
            </XDSStack>
          ))}
        </XDSStack>

        <XDSDivider />

        <XDSText variant="label-sm" color="secondary">
          Settings — fill-role gear + circle (mask gap in bold)
        </XDSText>
        <XDSStack direction="row" gap={3}>
          {VARIATIONS.map(v => (
            <XDSStack direction="vertical" key={v} gap={0.5} hAlign="center">
              <XDSSVGIcon icon={settingsIcon} variation={v} size="lg" />
              <XDSText variant="label-sm" color="secondary">
                {v}
              </XDSText>
            </XDSStack>
          ))}
        </XDSStack>
      </XDSStack>
    </XDSStack>
  ),
};

// =============================================================================
// Size Scale
// =============================================================================

const SIZES: SVGIconSize[] = ['xsm', 'sm', 'md', 'lg'];

export const SizeScale: Story = {
  render: () => (
    <XDSStack direction="vertical" gap={2}>
      <XDSText variant="heading-3">
        Size Scale with Optical Compensation
      </XDSText>
      <XDSText variant="body-sm" color="secondary">
        Stroke width auto-adjusts at smaller sizes for legibility.
      </XDSText>
      <XDSStack direction="row" gap={3} vAlign="end">
        {SIZES.map(size => (
          <XDSStack direction="vertical" key={size} gap={1} hAlign="center">
            <XDSSVGIcon icon={settingsIcon} variation="linear" size={size} />
            <XDSText variant="label-sm" color="secondary">
              {size}
            </XDSText>
          </XDSStack>
        ))}
      </XDSStack>
    </XDSStack>
  ),
};

// =============================================================================
// Color Palette
// =============================================================================

const COLORS: SVGIconColor[] = [
  'primary',
  'secondary',
  'disabled',
  'accent',
  'positive',
  'negative',
  'warning',
];

export const Colors: Story = {
  render: () => (
    <XDSStack direction="vertical" gap={2}>
      <XDSText variant="heading-3">Semantic Colors</XDSText>
      <XDSStack direction="row" gap={3}>
        {COLORS.map(c => (
          <XDSStack direction="vertical" key={c} gap={1} hAlign="center">
            <XDSSVGIcon
              icon={bellIcon}
              variation="linear"
              size="lg"
              color={c}
            />
            <XDSText variant="label-sm" color="secondary">
              {c}
            </XDSText>
          </XDSStack>
        ))}
      </XDSStack>
    </XDSStack>
  ),
};

// =============================================================================
// Mask Gaps on Different Backgrounds
// =============================================================================

const MASK_GAP_ICONS = [
  homeIcon,
  settingsIcon,
  eyeIcon,
  searchIcon,
  mailIcon,
  lockIcon,
];

export const MaskGaps: Story = {
  render: () => (
    <XDSStack direction="vertical" gap={3}>
      <XDSText variant="heading-3">Mask Gaps on Different Backgrounds</XDSText>
      <XDSText variant="body-sm" color="secondary">
        Bold mode uses mask-based knockout gaps. Because the gap is transparent
        (not white), it works on any background — solid colors, surfaces, and
        gradients alike.
      </XDSText>

      {[
        {label: 'White', bg: '#ffffff'},
        {label: 'Surface', bg: '#f5f5f5'},
        {label: 'Accent', bg: '#0066ff'},
        {
          label: 'Gradient',
          bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
      ].map(({label, bg}) => (
        <XDSStack direction="vertical" key={label} gap={1}>
          <XDSText variant="label-sm" color="secondary">
            {label}
          </XDSText>
          <div
            style={{
              background: bg,
              padding: 16,
              borderRadius: 8,
              display: 'flex',
              gap: 16,
            }}>
            {MASK_GAP_ICONS.map(icon => (
              <XDSSVGIcon
                key={icon.name}
                icon={icon}
                variation="bold"
                size="lg"
                color={
                  label === 'White' || label === 'Surface'
                    ? 'primary'
                    : 'inherit'
                }
                style={
                  label === 'Accent' || label === 'Gradient'
                    ? {color: '#ffffff'}
                    : undefined
                }
              />
            ))}
          </div>
        </XDSStack>
      ))}
    </XDSStack>
  ),
};

// =============================================================================
// Stroke Width Range
// =============================================================================

const STROKE_WIDTHS = [1, 1.5, 2, 2.5, 3];

export const StrokeWidthRange: Story = {
  render: () => (
    <XDSStack direction="vertical" gap={3}>
      <XDSText variant="heading-3">Stroke Width Range</XDSText>
      <XDSText variant="body-sm" color="secondary">
        Linear mode at stroke widths from 1 to 3. Thinner strokes feel lighter
        and more refined; thicker strokes add visual weight.
      </XDSText>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `80px repeat(${STROKE_WIDTHS.length}, 1fr)`,
          gap: 12,
          alignItems: 'center',
        }}>
        {/* Header row */}
        <div />
        {STROKE_WIDTHS.map(w => (
          <XDSText
            key={w}
            variant="label-sm"
            color="secondary"
            style={{textAlign: 'center'}}>
            {w}
          </XDSText>
        ))}

        {/* Icon rows — first 8 starterIcons */}
        {starterIcons.slice(0, 8).map(icon => (
          <Fragment key={icon.name}>
            <XDSText variant="label-sm">{icon.name}</XDSText>
            {STROKE_WIDTHS.map(w => (
              <div
                key={`${icon.name}-${w}`}
                style={{display: 'flex', justifyContent: 'center'}}>
                <XDSSVGIcon
                  icon={icon}
                  variation="linear"
                  size="lg"
                  strokeWidth={w}
                />
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </XDSStack>
  ),
};

// =============================================================================
// Structural Diversity
// =============================================================================

export const StructuralDiversity: Story = {
  render: () => (
    <XDSStack direction="vertical" gap={3}>
      <XDSText variant="heading-3">Structural Diversity</XDSText>
      <XDSText variant="body-sm" color="secondary">
        New icons with diverse structures — organic curves, complex single
        paths, nested overlapping fills, and mixed fill+stroke roles — across
        all five variations.
      </XDSText>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `120px repeat(${VARIATIONS.length}, 1fr)`,
          gap: 12,
          alignItems: 'center',
        }}>
        {/* Header row */}
        <div />
        {VARIATIONS.map(v => (
          <XDSText
            key={v}
            variant="label-sm"
            color="secondary"
            style={{textAlign: 'center'}}>
            {v}
          </XDSText>
        ))}

        {/* Icon rows — new icons only */}
        {starterIcons.slice(7).map(icon => (
          <Fragment key={icon.name}>
            <XDSText variant="label-sm">{icon.name}</XDSText>
            {VARIATIONS.map(v => (
              <div
                key={`${icon.name}-${v}`}
                style={{display: 'flex', justifyContent: 'center'}}>
                <XDSSVGIcon icon={icon} variation={v} size="lg" />
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </XDSStack>
  ),
};
