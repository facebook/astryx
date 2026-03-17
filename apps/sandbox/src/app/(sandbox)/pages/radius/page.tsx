'use client';

import {useState, useCallback} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSSlider} from '@xds/core/Slider';
import {colorVars} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  container: {
    maxWidth: 900,
  },
  controls: {
    padding: 24,
    backgroundColor: colorVars['--color-wash'],
    borderRadius: 12,
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: colorVars['--color-text-secondary'],
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    maxWidth: 400,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: 600,
    color: colorVars['--color-text-primary'],
    minWidth: 40,
    textAlign: 'right' as const,
    fontVariantNumeric: 'tabular-nums',
  },
});

const PRESETS = [
  {name: 'Sharp', value: 0},
  {name: 'Subtle', value: 0.5},
  {name: 'Default', value: 1},
  {name: 'Rounded', value: 1.5},
  {name: 'Pill', value: 2},
] as const;

export default function RadiusPage() {
  const [multiplier, setMultiplier] = useState(1);

  const handlePreset = useCallback((v: number) => setMultiplier(v), []);

  return (
    <div {...stylex.props(styles.container)}>
      <XDSVStack gap={8}>
        {/* Header */}
        <XDSVStack gap={2}>
          <XDSHeading level={1}>Border Radius</XDSHeading>
          <XDSText type="body" color="secondary">
            Dynamic radius with semantic usage
          </XDSText>
        </XDSVStack>

        {/* Controls */}
        <div {...stylex.props(styles.controls)}>
          <XDSVStack gap={5}>
            {/* Presets */}
            <div {...stylex.props(styles.controlGroup)}>
              <span {...stylex.props(styles.label)}>Presets</span>
              <XDSHStack gap={2}>
                {PRESETS.map(p => (
                  <XDSButton
                    key={p.name}
                    label={p.name}
                    size="sm"
                    variant={
                      multiplier === p.value ? 'primary' : 'secondary'
                    }
                    onClick={() => handlePreset(p.value)}
                  />
                ))}
              </XDSHStack>
            </div>

            {/* Slider */}
            <div {...stylex.props(styles.controlGroup)}>
              <span {...stylex.props(styles.label)}>Radius Multiplier</span>
              <div {...stylex.props(styles.sliderRow)}>
                <div style={{flex: 1}}>
                  <XDSSlider
                    label="Radius Multiplier"
                    isLabelHidden
                    value={multiplier}
                    onChange={setMultiplier}
                    min={0}
                    max={2}
                    step={0.05}
                  />
                </div>
                <span {...stylex.props(styles.sliderValue)}>
                  {multiplier}×
                </span>
              </div>
            </div>
          </XDSVStack>
        </div>
      </XDSVStack>
    </div>
  );
}
