// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {StatusDot} from '@astryxdesign/core/StatusDot';

const meta: Meta<typeof StatusDot> = {
  title: 'Core/StatusDot',
  component: StatusDot,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'warning', 'error', 'accent', 'neutral'],
      description:
        'Semantic variant pairing colour with a distinct built-in shape (success check, warning exclamation, error cross, neutral ring, accent filled)',
    },
    label: {
      control: 'text',
      description: 'Accessible label',
    },
    isPulsing: {
      control: 'boolean',
      description: 'Pulse animation',
    },
    tooltip: {
      control: 'text',
      description: 'Tooltip text on hover',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusDot>;

export const Default: Story = {
  args: {
    variant: 'success',
    label: 'Online',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <StatusDot variant="success" label="Positive" />
      <StatusDot variant="warning" label="Warning" />
      <StatusDot variant="error" label="Negative" />
      <StatusDot variant="accent" label="Info" />
      <StatusDot variant="neutral" label="Neutral" />
    </div>
  ),
};

export const Pulsing: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <StatusDot variant="success" label="Live" isPulsing />
      <StatusDot variant="warning" label="Processing" isPulsing />
      <StatusDot variant="error" label="Error" isPulsing />
    </div>
  ),
};

export const StatusIndicators: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <StatusDot variant="success" label="Online" />
        <span>Online</span>
      </div>
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <StatusDot variant="warning" label="Away" />
        <span>Away</span>
      </div>
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <StatusDot variant="error" label="Offline" />
        <span>Offline</span>
      </div>
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <StatusDot variant="neutral" label="Unknown" />
        <span>Unknown</span>
      </div>
    </div>
  ),
};

export const WithTooltip: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
      <StatusDot variant="success" label="Online" tooltip="Online" />
      <StatusDot variant="warning" label="Away" tooltip="Away" />
      <StatusDot variant="error" label="Offline" tooltip="Offline" />
      <StatusDot variant="neutral" label="Unknown" tooltip="Unknown" />
    </div>
  ),
};

/**
 * A distinct custom glyph, to show `icon` overriding the built-in shape.
 * Paints from `currentColor`, so it inherits the dot's ink like the built-ins.
 */
function DiamondIcon() {
  return (
    <svg viewBox="0 0 8 8" width={8} height={8} aria-hidden="true">
      <rect
        x={2.4}
        y={2.4}
        width={3.2}
        height={3.2}
        fill="currentColor"
        transform="rotate(45 4 4)"
      />
    </svg>
  );
}

const LEGIBILITY_VARIANTS = [
  {variant: 'success', label: 'Success (check)'},
  {variant: 'warning', label: 'Warning (exclamation)'},
  {variant: 'error', label: 'Error (cross)'},
  {variant: 'neutral', label: 'Neutral (ring)'},
  {variant: 'accent', label: 'Accent (filled)'},
] as const;

/** How much the magnified row scales the native 8px dot. */
const MAGNIFY = 8;

/**
 * Glyph legibility reference. StatusDot is a fixed 8px dot, so 8px IS its
 * smallest (and only) size. The top row is the native 1x rendering — the
 * artifact to eyeball and to run a colour-blind sim against on the deployed
 * Storybook. The middle row magnifies each dot so the glyph geometry is
 * inspectable (check vs cross in particular). The bottom row shows the `icon`
 * prop overriding the built-in glyph.
 */
export const GlyphLegibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All variants at native 8px (1x) for colour-blind verification, a magnified row to inspect glyph geometry, and the `icon` override.',
      },
    },
  },
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>
      <section>
        <h4 style={{margin: '0 0 12px'}}>Actual size (1x, 8px)</h4>
        <div style={{display: 'flex', gap: '24px', alignItems: 'center'}}>
          {LEGIBILITY_VARIANTS.map(({variant, label}) => (
            <div
              key={variant}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}>
              <StatusDot variant={variant} label={label} />
              <span style={{fontSize: '11px'}}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h4 style={{margin: '0 0 12px'}}>Magnified {MAGNIFY}x (geometry)</h4>
        <div style={{display: 'flex', gap: '24px', alignItems: 'center'}}>
          {LEGIBILITY_VARIANTS.map(({variant, label}) => (
            <div
              key={variant}
              style={{
                width: 8 * MAGNIFY,
                height: 8 * MAGNIFY,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(128,128,128,0.4)',
                borderRadius: '8px',
              }}>
              <div style={{transform: `scale(${MAGNIFY})`}}>
                <StatusDot variant={variant} label={label} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h4 style={{margin: '0 0 12px'}}>Icon override</h4>
        <div style={{display: 'flex', gap: '24px', alignItems: 'center'}}>
          <StatusDot
            variant="success"
            label="Verified"
            icon={<DiamondIcon />}
          />
          <StatusDot variant="accent" label="Featured" icon={<DiamondIcon />} />
          <span style={{fontSize: '11px'}}>
            icon replaces the built-in glyph
          </span>
        </div>
      </section>
    </div>
  ),
};
