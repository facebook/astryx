import type {Meta, StoryObj} from '@storybook/react';
import {XDSChartColors, type SequentialHue} from '@xds/lab';
import {XDSStack, XDSText} from '@xds/core';
import {XDSHeading} from '@xds/core/Text';

const meta: Meta = {
  title: 'Lab/XDSChartColors',
};

export default meta;

function Swatches({colors, label}: {colors: string[]; label: string}) {
  return (
    <XDSStack direction="vertical" gap={1}>
      <XDSText type="label">{label}</XDSText>
      <XDSStack direction="horizontal" gap={0.5}>
        {colors.map((color, i) => (
          <div
            key={i}
            title={color}
            style={{
              width: 48,
              height: 32,
              borderRadius: 4,
              backgroundColor: color,
            }}
          />
        ))}
      </XDSStack>
    </XDSStack>
  );
}

export const Categorical: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={6}>
      <XDSHeading level={3}>Categorical Palettes</XDSHeading>
      <XDSStack direction="vertical" gap={4}>
        <Swatches
          colors={XDSChartColors.categorical(5)}
          label="categorical(5)"
        />
        <Swatches
          colors={XDSChartColors.categorical(10)}
          label="categorical(10)"
        />
      </XDSStack>
    </XDSStack>
  ),
};

export const Sequential: StoryObj = {
  render: () => {
    const hues: SequentialHue[] = [
      'blue',
      'shamrock',
      'orange',
      'pink',
      'purple',
      'red',
      'teal',
      'yellow',
      'gray',
    ];
    return (
      <XDSStack direction="vertical" gap={6}>
        <XDSHeading level={3}>Sequential Ramps</XDSHeading>
        <XDSStack direction="vertical" gap={4}>
          {hues.map(hue => (
            <Swatches
              key={hue}
              colors={XDSChartColors.sequential[hue](5)}
              label={`sequential.${hue}(5)`}
            />
          ))}
        </XDSStack>
      </XDSStack>
    );
  },
};

export const Diverging: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={6}>
      <XDSHeading level={3}>Diverging Palettes</XDSHeading>
      <XDSStack direction="vertical" gap={4}>
        <Swatches
          colors={XDSChartColors.diverging.positiveNegative(5)}
          label="diverging.positiveNegative(5)"
        />
        <Swatches
          colors={XDSChartColors.diverging.positiveNegative(11)}
          label="diverging.positiveNegative(11)"
        />
        <Swatches
          colors={XDSChartColors.diverging.coldHot(7)}
          label="diverging.coldHot(7)"
        />
        <Swatches
          colors={XDSChartColors.diverging.custom('blue', 'orange', 7)}
          label="diverging.custom('blue', 'orange', 7)"
        />
      </XDSStack>
    </XDSStack>
  ),
};

export const Semantic: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={6}>
      <XDSHeading level={3}>Semantic Colors</XDSHeading>
      <Swatches
        colors={[
          XDSChartColors.semantic.positive,
          XDSChartColors.semantic.negative,
          XDSChartColors.semantic.warning,
          XDSChartColors.semantic.neutral,
        ]}
        label="positive, negative, warning, neutral"
      />
    </XDSStack>
  ),
};
