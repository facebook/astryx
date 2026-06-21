// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {Fragment} from 'react';
import {
  SVGIcon,
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
import {Stack, Text, Divider} from '@xds/core';
import {Heading} from '@xds/core/Text';

const meta: Meta<typeof SVGIcon> = {
  title: 'Lab/SVGIcon',
  component: SVGIcon,
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
type Story = StoryObj<typeof SVGIcon>;

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
    <Stack direction="vertical" gap={3}>
      <Heading level={3}>Variation Matrix</Heading>
      <Text type="supporting" color="secondary">
        Same SVG paths, different visual treatments via CSS custom properties.
        Note how stroke-role elements (menu lines, calendar pegs, bell clapper)
        stay as strokes even in bold/bulk mode.
      </Text>
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
          <Text
            key={v}
            type="label"
            color="secondary"
            style={{textAlign: 'center'}}>
            {v}
          </Text>
        ))}

        {/* Icon rows */}
        {starterIcons.map(icon => (
          <Fragment key={icon.name}>
            <Text type="label">{icon.name}</Text>
            {VARIATIONS.map(v => (
              <div
                key={`${icon.name}-${v}`}
                style={{display: 'flex', justifyContent: 'center'}}>
                <SVGIcon icon={icon} variation={v} size="lg" />
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </Stack>
  ),
};

// =============================================================================
// Role Behavior Demo
// =============================================================================

export const RoleBehavior: Story = {
  render: () => (
    <Stack direction="vertical" gap={3}>
      <Heading level={3}>Path Roles: Fill vs Stroke</Heading>
      <Text type="supporting" color="secondary">
        Stroke-role elements always stay as strokes. Fill-role elements switch
        between stroke (linear) and fill (bold). Compare Menu (all stroke-role)
        vs Home (fill-role body + fill-role door with mask knockout).
      </Text>

      <Stack direction="vertical" gap={2}>
        <Text type="label" color="secondary">
          Menu — all stroke-role (lines never become fills)
        </Text>
        <Stack direction="horizontal" gap={3}>
          {VARIATIONS.map(v => (
            <Stack direction="vertical" key={v} gap={0.5} hAlign="center">
              <SVGIcon icon={menuIcon} variation={v} size="lg" />
              <Text type="label" color="secondary">
                {v}
              </Text>
            </Stack>
          ))}
        </Stack>

        <Divider />

        <Text type="label" color="secondary">
          Home — fill-role body + door (mask gap in bold)
        </Text>
        <Stack direction="horizontal" gap={3}>
          {VARIATIONS.map(v => (
            <Stack direction="vertical" key={v} gap={0.5} hAlign="center">
              <SVGIcon icon={homeIcon} variation={v} size="lg" />
              <Text type="label" color="secondary">
                {v}
              </Text>
            </Stack>
          ))}
        </Stack>

        <Divider />

        <Text type="label" color="secondary">
          Settings — fill-role gear + circle (mask gap in bold)
        </Text>
        <Stack direction="horizontal" gap={3}>
          {VARIATIONS.map(v => (
            <Stack direction="vertical" key={v} gap={0.5} hAlign="center">
              <SVGIcon icon={settingsIcon} variation={v} size="lg" />
              <Text type="label" color="secondary">
                {v}
              </Text>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  ),
};

// =============================================================================
// Size Scale
// =============================================================================

const SIZES: SVGIconSize[] = ['xsm', 'sm', 'md', 'lg'];

export const SizeScale: Story = {
  render: () => (
    <Stack direction="vertical" gap={2}>
      <Heading level={3}>Size Scale with Optical Compensation</Heading>
      <Text type="supporting" color="secondary">
        Stroke width auto-adjusts at smaller sizes for legibility.
      </Text>
      <Stack direction="horizontal" gap={3} vAlign="end">
        {SIZES.map(size => (
          <Stack direction="vertical" key={size} gap={1} hAlign="center">
            <SVGIcon icon={settingsIcon} variation="linear" size={size} />
            <Text type="label" color="secondary">
              {size}
            </Text>
          </Stack>
        ))}
      </Stack>
    </Stack>
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
    <Stack direction="vertical" gap={2}>
      <Heading level={3}>Semantic Colors</Heading>
      <Stack direction="horizontal" gap={3}>
        {COLORS.map(c => (
          <Stack direction="vertical" key={c} gap={1} hAlign="center">
            <SVGIcon
              icon={bellIcon}
              variation="linear"
              size="lg"
              color={c}
            />
            <Text type="label" color="secondary">
              {c}
            </Text>
          </Stack>
        ))}
      </Stack>
    </Stack>
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
    <Stack direction="vertical" gap={3}>
      <Heading level={3}>Mask Gaps on Different Backgrounds</Heading>
      <Text type="supporting" color="secondary">
        Bold mode uses mask-based knockout gaps. Because the gap is transparent
        (not white), it works on any background: solid colors, surfaces, and
        gradients alike.
      </Text>

      {[
        {label: 'White', bg: '#ffffff'},
        {label: 'Surface', bg: '#f5f5f5'},
        {label: 'Accent', bg: '#0066ff'},
        {
          label: 'Gradient',
          bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
      ].map(({label, bg}) => (
        <Stack direction="vertical" key={label} gap={1}>
          <Text type="label" color="secondary">
            {label}
          </Text>
          <div
            style={{
              background: bg,
              padding: 16,
              borderRadius: 8,
              display: 'flex',
              gap: 16,
            }}>
            {MASK_GAP_ICONS.map(icon => (
              <SVGIcon
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
        </Stack>
      ))}
    </Stack>
  ),
};

// =============================================================================
// Stroke Width Range
// =============================================================================

const STROKE_WIDTHS = [1, 1.5, 2, 2.5, 3];

export const StrokeWidthRange: Story = {
  render: () => (
    <Stack direction="vertical" gap={3}>
      <Heading level={3}>Stroke Width Range</Heading>
      <Text type="supporting" color="secondary">
        Linear mode at stroke widths from 1 to 3. Thinner strokes feel lighter
        and more refined; thicker strokes add visual weight.
      </Text>
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
          <Text
            key={w}
            type="label"
            color="secondary"
            style={{textAlign: 'center'}}>
            {w}
          </Text>
        ))}

        {/* Icon rows — first 8 starterIcons */}
        {starterIcons.slice(0, 8).map(icon => (
          <Fragment key={icon.name}>
            <Text type="label">{icon.name}</Text>
            {STROKE_WIDTHS.map(w => (
              <div
                key={`${icon.name}-${w}`}
                style={{display: 'flex', justifyContent: 'center'}}>
                <SVGIcon
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
    </Stack>
  ),
};

// =============================================================================
// Structural Diversity
// =============================================================================

export const StructuralDiversity: Story = {
  render: () => (
    <Stack direction="vertical" gap={3}>
      <Heading level={3}>Structural Diversity</Heading>
      <Text type="supporting" color="secondary">
        New icons with diverse structures: organic curves, complex single paths,
        nested overlapping fills, and mixed fill+stroke roles, across all five
        variations.
      </Text>
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
          <Text
            key={v}
            type="label"
            color="secondary"
            style={{textAlign: 'center'}}>
            {v}
          </Text>
        ))}

        {/* Icon rows — new icons only */}
        {starterIcons.slice(7).map(icon => (
          <Fragment key={icon.name}>
            <Text type="label">{icon.name}</Text>
            {VARIATIONS.map(v => (
              <div
                key={`${icon.name}-${v}`}
                style={{display: 'flex', justifyContent: 'center'}}>
                <SVGIcon icon={icon} variation={v} size="lg" />
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </Stack>
  ),
};
