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

// Hardcoded exact-size overrides.
//
// By default the *visible* checkbox/radio glyph is inset 2px inside its
// hit-target wrapper (18px inside a 20px wrapper at `sm`, 22px inside 24px at
// `md`). This override removes that buffer so the visible control fills the
// wrapper exactly — 20px at `sm`, 24px at `md` — and scales the inner
// checkmark/dot by the same factor so the glyph stays proportional.
//
// Storybook compiles component StyleX into a CSS layer, so this unlayered
// block wins without needing high specificity. Scoped to `EXACT_SCOPE` so it
// only affects this story.
const EXACT_SCOPE = 'control-size-exact';
const exactSizeCSS = `
.${EXACT_SCOPE} .astryx-checkbox[data-size='sm'],
.${EXACT_SCOPE} .astryx-radio[data-size='sm'] {
  width: 20px;
  height: 20px;
}
.${EXACT_SCOPE} .astryx-checkbox[data-size='md'],
.${EXACT_SCOPE} .astryx-radio[data-size='md'] {
  width: 24px;
  height: 24px;
}
/* Scale inner marks by the box growth factor (sm 20/18, md 24/22). */
.${EXACT_SCOPE} .astryx-checkbox[data-size='sm'] svg { width: 13.3px; height: 13.3px; }
.${EXACT_SCOPE} .astryx-checkbox[data-size='md'] svg { width: 15.3px; height: 15.3px; }
.${EXACT_SCOPE} .astryx-radio[data-size='sm'] .astryx-radio-dot { width: 8.9px; height: 8.9px; }
.${EXACT_SCOPE} .astryx-radio[data-size='md'] .astryx-radio-dot { width: 10.9px; height: 10.9px; }
`;

function ExactRow({size}: {size: Size}) {
  const [checked, setChecked] = useState(true);
  const [radio, setRadio] = useState('a');

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
    </Stack>
  );
}

/**
 * Hardcoded variant where the visible checkbox and radio controls hit exactly
 * 20px (`sm`) and 24px (`md`) — the 2px hit-target buffer is removed so the
 * glyph size equals the wrapper size. Switch is omitted here since its track
 * already fills its wrapper.
 */
export const ExactSizes: Story = {
  render: () => (
    <div className={EXACT_SCOPE}>
      <style dangerouslySetInnerHTML={{__html: exactSizeCSS}} />
      <Stack direction="vertical" gap={8}>
        {(['sm', 'md'] as const).map(size => (
          <Stack key={size} direction="vertical" gap={3}>
            <Text type="label" weight="bold">
              size="{size}" — exact {size === 'sm' ? 20 : 24}px
            </Text>
            <ExactRow size={size} />
          </Stack>
        ))}
      </Stack>
    </div>
  ),
};
