// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useMemo, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {Meta, StoryObj} from '@storybook/react';
import {expect, fireEvent, userEvent, waitFor, within} from 'storybook/test';
import {Button, Card, Stack, Text} from '@astryxdesign/core';
import {Theme, defineTheme, useTheme} from '@astryxdesign/core/theme';
import {
  normalizeChartCustomColor,
  projectChartColorOptions,
  resolveChartColorChoice,
  type ChartColorChoice,
  type ChartColorToken,
} from '@astryxdesign/core/theme/chartColors';
import {colorVars, radiusVars} from '@astryxdesign/core/theme/tokens.stylex';
import {Heading} from '@astryxdesign/core/Text';

const meta: Meta = {
  title: 'Lab/ChartTheming/ColorPicker',
  parameters: {
    docs: {
      description: {
        component:
          'End-user chart color workflow with Automatic, curated theme choices, an exact custom color, and Reset.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const styles = stylex.create({
  actions: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  chart: {
    alignItems: 'end',
    backgroundColor: colorVars['--color-background-muted'],
    borderRadius: radiusVars['--radius-container'],
    display: 'flex',
    gap: 16,
    height: 220,
    padding: 24,
  },
  bar: (color: string, height: number) => ({
    backgroundColor: color,
    borderRadius: `${radiusVars['--radius-element']} ${radiusVars['--radius-element']} 0 0`,
    height,
    width: 72,
  }),
  colorInput: {
    blockSize: 36,
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-element'],
    borderStyle: 'solid',
    borderWidth: 1,
    inlineSize: 48,
    padding: 2,
  },
  swatch: (color: string, selected: boolean) => ({
    backgroundColor: color,
    borderColor: selected
      ? colorVars['--color-border-emphasized']
      : colorVars['--color-border'],
    borderRadius: radiusVars['--radius-full'],
    borderStyle: 'solid',
    borderWidth: selected ? 3 : 1,
    blockSize: 36,
    cursor: 'pointer',
    inlineSize: 36,
  }),
});

const pickerTheme = defineTheme({
  name: 'chart-color-picker',
  tokens: {
    '--color-data-categorical-blue': ['#005A4E', '#72E1C1'],
    '--color-data-categorical-orange': ['#7A2E00', '#FFB280'],
    '--color-data-categorical-purple': ['#5A21A8', '#C6A7FF'],
  },
});

const automaticToken: ChartColorToken = '--color-data-categorical-blue';

function PickerContents({
  mode,
  onModeChange,
}: {
  mode: 'light' | 'dark';
  onModeChange: () => void;
}) {
  const {token} = useTheme();
  const [choice, setChoice] = useState<ChartColorChoice | undefined>();
  const [customInput, setCustomInput] = useState('#336699');
  const projected = useMemo(() => projectChartColorOptions(token), [token]);
  if (!projected.ok) {
    throw new Error(projected.diagnostic.message);
  }

  const effectiveChoice: ChartColorChoice = choice ?? {
    kind: 'theme',
    token: automaticToken,
  };
  const resolved = resolveChartColorChoice(effectiveChoice, token);
  if (!resolved.ok) {
    throw new Error(resolved.diagnostic.message);
  }

  const state = choice?.kind ?? 'automatic';
  const applyCustom = () => {
    const normalized = normalizeChartCustomColor(customInput);
    if (normalized.ok) {
      setChoice({kind: 'custom', color: normalized.value});
    }
  };

  return (
    <Card>
      <Stack direction="vertical" gap={4}>
        <Stack direction="vertical" gap={1}>
          <Heading level={3}>Series color</Heading>
          <Text type="supporting" color="secondary">
            Theme choices follow the current mode. Exact custom colors stay
            fixed.
          </Text>
        </Stack>

        <div {...stylex.props(styles.chart)}>
          <div {...stylex.props(styles.bar(resolved.value.srgb, 112))} />
          <div
            {...stylex.props(
              styles.bar(token('--color-data-categorical-orange'), 164),
            )}
          />
        </div>

        <div
          {...stylex.props(styles.actions)}
          aria-label="Theme color choices"
          role="group">
          <Button
            label="Automatic"
            onClick={() => setChoice(undefined)}
            variant={choice === undefined ? 'primary' : 'secondary'}
          />
          {projected.value.map((option, index) => (
            <button
              {...stylex.props(
                styles.swatch(
                  option.preview,
                  choice?.kind === 'theme' && choice.token === option.id,
                ),
              )}
              aria-label={`Theme color ${index + 1}`}
              data-color-token={option.id}
              key={option.id}
              onClick={() => setChoice({kind: 'theme', token: option.id})}
              type="button"
            />
          ))}
        </div>

        <div {...stylex.props(styles.actions)}>
          <input
            {...stylex.props(styles.colorInput)}
            aria-label="Exact custom color"
            onChange={event => setCustomInput(event.currentTarget.value)}
            type="color"
            value={customInput}
          />
          <Button label="Apply custom color" onClick={applyCustom} />
          <Button
            label="Reset"
            onClick={() => setChoice(undefined)}
            variant="secondary"
          />
          <Button
            label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
            onClick={onModeChange}
            variant="secondary"
          />
        </div>

        <Text>
          <span
            data-choice-state={state}
            data-preview-color={resolved.value.srgb}>
            {state === 'automatic'
              ? 'Automatic'
              : state === 'theme'
                ? 'Theme color'
                : 'Custom color'}
            : {resolved.value.srgb}
          </span>
        </Text>
      </Stack>
    </Card>
  );
}

function ColorPickerExample() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  return (
    <Theme theme={pickerTheme} mode={mode}>
      <PickerContents
        mode={mode}
        onModeChange={() =>
          setMode(current => (current === 'light' ? 'dark' : 'light'))
        }
      />
    </Theme>
  );
}

export const EndUserChoices: Story = {
  render: () => <ColorPickerExample />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const state = () =>
      canvasElement.querySelector<HTMLElement>('[data-choice-state]');
    expect(state()).toHaveAttribute('data-choice-state', 'automatic');
    expect(state()).toHaveAttribute('data-preview-color', '#005A4E');

    await userEvent.click(canvas.getByRole('button', {name: 'Theme color 2'}));
    expect(state()).toHaveAttribute('data-choice-state', 'theme');
    expect(state()).toHaveAttribute('data-preview-color', '#7A2E00');

    fireEvent.change(canvas.getByLabelText('Exact custom color'), {
      target: {value: '#336699'},
    });
    await userEvent.click(
      canvas.getByRole('button', {name: 'Apply custom color'}),
    );
    expect(state()).toHaveAttribute('data-choice-state', 'custom');
    expect(state()).toHaveAttribute('data-preview-color', '#336699');

    await userEvent.click(
      canvas.getByRole('button', {name: 'Switch to dark mode'}),
    );
    await waitFor(() =>
      expect(state()).toHaveAttribute('data-preview-color', '#336699'),
    );

    await userEvent.click(canvas.getByRole('button', {name: 'Reset'}));
    expect(state()).toHaveAttribute('data-choice-state', 'automatic');
    expect(state()).toHaveAttribute('data-preview-color', '#72E1C1');
  },
};
