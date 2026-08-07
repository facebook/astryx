// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  CheckboxIndicator,
  RadioIndicator,
  type IndicatorProps,
} from '@astryxdesign/core/Indicator';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {Selector} from '@astryxdesign/core/Selector';
import {Text} from '@astryxdesign/core/Text';
import {Theme, defineTheme} from '@astryxdesign/core/theme';

/**
 * Indicators are the componentized selection visuals — the box a checkbox
 * draws, the circle a radio draws. They are decorative: the owning component
 * keeps the input, role, accessible name, focus, and keyboard behavior, while
 * the indicator turns state into a picture.
 *
 * That split is what makes them themeable. An indicator renders stable
 * `astryx-*` class targets like any other component, so a theme can restyle it
 * with `components`, replace the component outright with `indicators`, or point
 * a component's selection slot at one with `componentIcons`.
 */
const meta: Meta<typeof CheckboxIndicator> = {
  title: 'Core/Indicator',
  component: CheckboxIndicator,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Decorative, themeable selection visuals shared by CheckboxInput, RadioList, menu selection rows, and any selection slot mapped to one.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CheckboxIndicator>;

const row = {display: 'flex', gap: 16, alignItems: 'center'} as const;
const column = {display: 'grid', gap: 16} as const;
const panel = {
  display: 'grid',
  gap: 12,
  padding: 16,
  borderRadius: 8,
  border: '1px solid var(--color-border)',
} as const;

function Legend({children}: {children: string}) {
  return (
    <Text type="supporting" color="secondary">
      {children}
    </Text>
  );
}

/** Every state each built-in indicator draws, at both control sizes. */
export const States: Story = {
  render: () => (
    <div style={column}>
      <Legend>
        Checkbox — unchecked / checked / indeterminate, then disabled
      </Legend>
      <div style={row}>
        <CheckboxIndicator state="unchecked" />
        <CheckboxIndicator state="checked" />
        <CheckboxIndicator state="indeterminate" />
        <CheckboxIndicator state="unchecked" isDisabled />
        <CheckboxIndicator state="checked" isDisabled />
        <CheckboxIndicator state="indeterminate" isDisabled />
      </div>
      <Legend>Checkbox — sm and md</Legend>
      <div style={row}>
        <CheckboxIndicator state="checked" size="sm" />
        <CheckboxIndicator state="checked" size="md" />
      </div>
      <Legend>
        Radio — unchecked / checked, then disabled. A radio draws in BOTH
        states; that is what lets it act as a selection indicator where an icon
        would render nothing.
      </Legend>
      <div style={row}>
        <RadioIndicator state="unchecked" />
        <RadioIndicator state="checked" />
        <RadioIndicator state="unchecked" isDisabled />
        <RadioIndicator state="checked" isDisabled />
      </div>
      <Legend>Radio — sm and md</Legend>
      <div style={row}>
        <RadioIndicator state="checked" size="sm" />
        <RadioIndicator state="checked" size="md" />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 1. Restyle — the indicator renders `checkbox` / `radio` / `radio-dot`
//    targets, so ordinary component overrides reach it. No new API.
// ---------------------------------------------------------------------------

const restyledTheme = defineTheme({
  name: 'indicator-restyle-demo',
  components: {
    checkbox: {
      base: {borderRadius: 'var(--radius-full)', borderWidth: '2px'},
      checked: {
        backgroundColor: 'var(--color-positive)',
        borderColor: 'var(--color-positive)',
      },
    },
    radio: {
      base: {borderWidth: '2px'},
      checked: {
        backgroundColor: 'var(--color-positive)',
        borderColor: 'var(--color-positive)',
      },
    },
    'radio-dot': {base: {borderRadius: '2px'}},
  },
});

/**
 * Theming an indicator like any other component: `components: {checkbox, radio,
 * radio-dot}`. One rule reaches every place the visual appears — the form
 * control, the menu row, and a themed selection slot.
 */
export const ThemedByTarget: Story = {
  render: () => (
    <div style={{display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr'}}>
      <div style={panel}>
        <Legend>Default</Legend>
        <CheckboxInput label="Notifications" value={true} />
        <CheckboxInput label="Partial selection" value="indeterminate" />
        <RadioList label="Delivery" value="email" onChange={() => {}}>
          <RadioListItem label="Email" value="email" />
          <RadioListItem label="SMS" value="sms" />
        </RadioList>
      </div>
      <Theme theme={restyledTheme} mode="light">
        <div style={panel}>
          <Legend>Restyled through component targets</Legend>
          <CheckboxInput label="Notifications" value={true} />
          <CheckboxInput label="Partial selection" value="indeterminate" />
          <RadioList label="Delivery" value="email" onChange={() => {}}>
            <RadioListItem label="Email" value="email" />
            <RadioListItem label="SMS" value="sms" />
          </RadioList>
        </div>
      </Theme>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 2. Replace — when the shape itself is wrong, hand the theme a component.
//    It receives {state, size, isDisabled} and nothing else: hover and focus
//    arrive through the owner's ancestor marker, in CSS.
// ---------------------------------------------------------------------------

function StarCheckbox({state, size = 'md', isDisabled}: IndicatorProps) {
  const px = size === 'sm' ? 20 : 24;
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: px,
        height: px,
        borderRadius: 6,
        border: '1px solid currentColor',
        color: state === 'unchecked' ? 'var(--color-border)' : '#7c3aed',
        opacity: isDisabled ? 0.5 : 1,
        fontSize: px - 10,
        lineHeight: 1,
      }}>
      {state === 'checked' ? '★' : state === 'indeterminate' ? '–' : ''}
    </span>
  );
}

function DiamondRadio({state, size = 'md', isDisabled}: IndicatorProps) {
  const px = size === 'sm' ? 20 : 24;
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: px,
        height: px,
        color: state === 'unchecked' ? 'var(--color-border)' : '#7c3aed',
        opacity: isDisabled ? 0.5 : 1,
        fontSize: px - 8,
        lineHeight: 1,
      }}>
      {state === 'unchecked' ? '◇' : '◆'}
    </span>
  );
}

const replacedTheme = defineTheme({
  name: 'indicator-replace-demo',
  indicators: {checkbox: StarCheckbox, radio: DiamondRadio},
});

/**
 * Replacing the indicator component through `defineTheme({indicators})`. The
 * CheckboxInput and RadioList around it are unchanged — they still own the
 * input, label, focus ring, and disabled behavior.
 */
export const ThemedByReplacement: Story = {
  render: () => (
    <div style={{display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr'}}>
      <div style={panel}>
        <Legend>Default</Legend>
        <CheckboxInput label="Notifications" value={true} />
        <CheckboxInput label="Partial selection" value="indeterminate" />
        <CheckboxInput label="Disabled" value={true} isDisabled />
        <RadioList label="Delivery" value="email" onChange={() => {}}>
          <RadioListItem label="Email" value="email" />
          <RadioListItem label="SMS" value="sms" />
        </RadioList>
      </div>
      <Theme theme={replacedTheme} mode="light">
        <div style={panel}>
          <Legend>Theme-provided indicator components</Legend>
          <CheckboxInput label="Notifications" value={true} />
          <CheckboxInput label="Partial selection" value="indeterminate" />
          <CheckboxInput label="Disabled" value={true} isDisabled />
          <RadioList label="Delivery" value="email" onChange={() => {}}>
            <RadioListItem label="Email" value="email" />
            <RadioListItem label="SMS" value="sms" />
          </RadioList>
        </div>
      </Theme>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 3. Swap the selection indicator — the use case. Selector's selected-option
//    slot defaults to a check glyph shown only while selected; a theme can
//    point it at the radio indicator, which draws in every state.
// ---------------------------------------------------------------------------

const radioSlotTheme = defineTheme({
  name: 'indicator-slot-radio-demo',
  componentIcons: {'selector-selected-option': {indicator: 'radio'}},
});

const customSlotTheme = defineTheme({
  name: 'indicator-slot-custom-demo',
  indicators: {radio: DiamondRadio},
  componentIcons: {'selector-selected-option': {indicator: 'radio'}},
});

function DemoSelector({label}: {label: string}) {
  const [value, setValue] = useState<string | undefined>('Banana');
  return (
    <Selector
      label={label}
      options={['Apple', 'Banana', 'Cherry']}
      value={value}
      onChange={setValue}
    />
  );
}

/**
 * The same Selector under three themes — open each listbox to compare. Note
 * what changes in the UNSELECTED rows: the default marks only the selected
 * option, while an indicator draws an empty circle on every option — the
 * behavior an icon slot cannot express.
 */
export const SelectionSlotThemes: Story = {
  parameters: {layout: 'padded'},
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 24,
        gridTemplateColumns: 'repeat(3, 1fr)',
        minHeight: 320,
      }}>
      <div style={column}>
        <Legend>Default — check icon on the selected option only</Legend>
        <DemoSelector label="Fruit" />
      </div>
      <Theme theme={radioSlotTheme} mode="light">
        <div style={column}>
          <Legend>{"componentIcons: {'…': {indicator: 'radio'}}"}</Legend>
          <DemoSelector label="Fruit" />
        </div>
      </Theme>
      <Theme theme={customSlotTheme} mode="light">
        <div style={column}>
          <Legend>Same slot, with the radio indicator replaced too</Legend>
          <DemoSelector label="Fruit" />
        </div>
      </Theme>
    </div>
  ),
};
