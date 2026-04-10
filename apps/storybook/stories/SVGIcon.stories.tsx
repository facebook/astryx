import type {Meta, StoryObj} from '@storybook/react';
import {Fragment, useState, useCallback, useRef} from 'react';
import {
  XDSSVGIcon,
  type SVGIconVariation,
  type SVGIconSize,
  type SVGIconColor,
  type SVGIconDef,
  starterIcons,
  bellIcon,
  settingsIcon,
  homeIcon,
  menuIcon,
  convertSVG,
  iconDefToTSX,
  iconDefToSVG,
} from '@xds/lab';
import {XDSStack, XDSText, XDSButton, XDSDivider} from '@xds/core';

const meta: Meta<typeof XDSSVGIcon> = {
  title: 'Lab/XDSSVGIcon',
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
// SVG Upload & Convert
// =============================================================================

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
  <path d="M2 17l10 5 10-5"/>
  <path d="M2 12l10 5 10-5"/>
</svg>`;

function SVGConverterStory() {
  const [svgInput, setSvgInput] = useState(DEFAULT_SVG);
  const [iconDef, setIconDef] = useState<SVGIconDef | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConvert = useCallback(() => {
    try {
      const result = convertSVG(svgInput, 'Uploaded');
      setIconDef(result);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setIconDef(null);
    }
  }, [svgInput]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const text = ev.target?.result as string;
        setSvgInput(text);
      };
      reader.readAsText(file);
    },
    [],
  );

  const handleCopyTSX = useCallback(() => {
    if (iconDef) {
      navigator.clipboard.writeText(iconDefToTSX(iconDef));
    }
  }, [iconDef]);

  const handleCopySVG = useCallback(() => {
    if (iconDef) {
      navigator.clipboard.writeText(iconDefToSVG(iconDef));
    }
  }, [iconDef]);

  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSText variant="heading-3">SVG Upload & Convert</XDSText>
      <XDSText variant="body-sm" color="secondary">
        Drop any SVG icon and convert it to the XDS icon format. The converter
        strips hardcoded styles, classifies layers and roles, and outputs a
        ready-to-use icon definition.
      </XDSText>

      <XDSStack direction="vertical" gap={1}>
        <XDSStack direction="row" gap={1}>
          <XDSButton
            size="sm"
            variant="neutral"
            label="Upload SVG"
            onPress={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg"
            style={{display: 'none'}}
            onChange={handleFileUpload}
          />
          <XDSButton size="sm" label="Convert" onPress={handleConvert} />
        </XDSStack>
        <textarea
          value={svgInput}
          onChange={e => setSvgInput(e.target.value)}
          style={{
            width: '100%',
            height: 150,
            fontFamily: 'monospace',
            fontSize: 12,
            padding: 8,
            borderRadius: 8,
            border: '1px solid var(--color-neutral)',
            background: 'var(--color-background-body)',
            color: 'var(--color-text-primary)',
            resize: 'vertical',
          }}
        />
      </XDSStack>

      {error && (
        <XDSText variant="body-sm" color="negative">
          Error: {error}
        </XDSText>
      )}

      {iconDef && (
        <>
          <XDSDivider />
          <XDSText variant="heading-4">Preview</XDSText>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${VARIATIONS.length}, 1fr)`,
              gap: 16,
              alignItems: 'center',
            }}>
            {VARIATIONS.map(v => (
              <XDSStack direction="vertical" key={v} gap={1} hAlign="center">
                <XDSSVGIcon icon={iconDef} variation={v} size="lg" />
                <XDSText variant="label-sm" color="secondary">
                  {v}
                </XDSText>
              </XDSStack>
            ))}
          </div>

          <XDSDivider />
          <XDSText variant="heading-4">Export</XDSText>
          <XDSStack direction="row" gap={1}>
            <XDSButton
              size="sm"
              variant="neutral"
              label="Copy TSX"
              onPress={handleCopyTSX}
            />
            <XDSButton
              size="sm"
              variant="neutral"
              label="Copy SVG"
              onPress={handleCopySVG}
            />
          </XDSStack>
          <pre
            style={{
              fontSize: 11,
              fontFamily: 'monospace',
              padding: 12,
              borderRadius: 8,
              background: 'var(--color-background-body)',
              overflow: 'auto',
              maxHeight: 200,
            }}>
            {iconDefToTSX(iconDef)}
          </pre>
        </>
      )}
    </XDSStack>
  );
}

export const SVGConverter: Story = {
  render: () => <SVGConverterStory />,
};
