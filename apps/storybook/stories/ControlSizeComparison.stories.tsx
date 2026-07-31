// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {Switch} from '@astryxdesign/core/Switch';
import {Stack, Text} from '@astryxdesign/core';

/**
 * Side-by-side comparison of the selection controls — `CheckboxInput`,
 * `RadioList`, and `Switch` — at matching sizes, so their proportions can be
 * observed together.
 *
 * Use this view to spot-check size consistency: the control glyphs and their
 * hit-target wrappers should feel visually aligned across all three at a given
 * size.
 */
const meta: Meta = {
  title: 'Core/Control Size Comparison',
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj;

type Size = 'sm' | 'md';

function ControlRow({size}: {size: Size}) {
  const [checked, setChecked] = useState(true);
  const [radio, setRadio] = useState('a');
  const [on, setOn] = useState(true);

  return (
    <Stack direction="horizontal" gap={8} align="center">
      <CheckboxInput
        label="Checkbox"
        size={size}
        value={checked}
        onChange={setChecked}
      />
      <RadioList
        label="Radio"
        isLabelHidden
        size={size}
        value={radio}
        onChange={setRadio}>
        <RadioListItem label="Radio" value="a" />
      </RadioList>
      <Switch label="Switch" size={size} value={on} onChange={setOn} />
    </Stack>
  );
}

/**
 * All three controls rendered at each size, grouped by size so the controls can
 * be compared directly against each other.
 */
export const AllSizes: Story = {
  render: () => (
    <Stack direction="vertical" gap={8}>
      {(['sm', 'md'] as const).map(size => (
        <Stack key={size} direction="vertical" gap={3}>
          <Text type="label" weight="bold">
            size="{size}"
          </Text>
          <ControlRow size={size} />
        </Stack>
      ))}
    </Stack>
  ),
};

/**
 * Small (`sm`) controls only.
 */
export const Small: Story = {
  render: () => <ControlRow size="sm" />,
};

/**
 * Medium (`md`, default) controls only.
 */
export const Medium: Story = {
  render: () => <ControlRow size="md" />,
};
