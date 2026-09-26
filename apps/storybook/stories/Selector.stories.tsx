// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {expect, waitFor} from 'storybook/test';
import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {InputGroup} from '@astryxdesign/core/InputGroup';
import {Selector, SelectorOption} from '@astryxdesign/core/Selector';
import {Theme, defineTheme} from '@astryxdesign/core/theme';
import {RadioIndicator} from '@astryxdesign/core/Indicator';
import {
  UserIcon,
  CogIcon,
  BellIcon,
  LockClosedIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof Selector> = {
  title: 'Core/Selector',
  component: Selector,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div style={{width: 250}}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text for the selector',
    },
    isLabelHidden: {
      control: 'boolean',
      description: 'Whether to visually hide the label',
    },
    description: {
      control: 'text',
      description: 'Description text displayed between label and selector',
    },
    options: {
      control: 'object',
      description:
        'Array of options to display. Can be strings, objects, dividers, or sections.',
    },
    value: {
      control: 'text',
      description: 'The currently selected value',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no value is selected',
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant of the selector',
    },
    variant: {
      control: 'radio',
      options: ['input', 'ghost'],
      description: 'Visual trigger style',
    },
    placement: {
      control: 'select',
      options: ['overlay', 'offset', 'above', 'below', 'start', 'end'],
      description:
        "Where the open menu sits relative to the trigger. 'overlay' (the default) pulls the menu up so the selected option sits over the trigger; 'offset' clears it by the standard menu gap instead (currently the same position as 'below').",
    },
    presentation: {
      control: 'radio',
      options: ['popover', 'bottom-sheet', 'adaptive'],
      description: 'Popover, bottom sheet, or responsive presentation.',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Whether the selector is disabled',
    },
    isReadOnly: {
      control: 'boolean',
      description:
        'Whether the selected value is visible and submittable without selection controls',
    },
    disabledMessage: {
      control: 'text',
      description:
        'Explains why the selector is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the trigger focusable via aria-disabled (activation stays blocked). Use this instead of wrapping a disabled Selector in Tooltip.',
    },
    isOptional: {
      control: 'boolean',
      description: 'Whether the field is optional',
    },
    isRequired: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    renderOption: {
      description: 'Optional render function for custom option rendering',
      table: {
        type: {summary: '(option: SelectorOptionData) => ReactNode'},
      },
    },
    'data-testid': {
      control: 'text',
      description: 'Test ID for testing frameworks',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Selector>;

// Basic with strings
export const Default: Story = {
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return (
      <Selector
        {...rest}
        label={args.label ?? 'Fruit'}
        options={
          args.options ?? ['Apple', 'Banana', 'Orange', 'Mango', 'Pineapple']
        }
        value={value}
        onChange={v => setValue(v)}
      />
    );
  },
  args: {
    placeholder: 'Select a fruit...',
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Assigned owner',
    options: ['Alice', 'Bob', 'Charlie'],
    value: 'Alice',
    onChange: () => {},
    hasClear: true,
    hasSearch: true,
    htmlName: 'owner',
    isReadOnly: true,
  },
};

export const BottomSheetPresentation: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    return (
      <Selector
        label="Team"
        options={['Design', 'Engineering', 'Marketing', 'Operations']}
        value={value}
        onChange={setValue}
        presentation="bottom-sheet"
      />
    );
  },
};

// With hidden label
export const HiddenLabel: Story = {
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return (
      <Selector
        {...rest}
        label="Fruit"
        isLabelHidden
        options={['Apple', 'Banana', 'Orange', 'Mango', 'Pineapple']}
        value={value}
        onChange={v => setValue(v)}
        placeholder="Select a fruit..."
      />
    );
  },
};

// With description
export const WithDescription: Story = {
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return (
      <Selector
        {...rest}
        label="Fruit"
        description="Choose your favorite fruit from the list"
        options={['Apple', 'Banana', 'Orange', 'Mango', 'Pineapple']}
        value={value}
        onChange={v => setValue(v)}
        placeholder="Select a fruit..."
      />
    );
  },
};

// With objects
export const WithObjects: Story = {
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return (
      <Selector
        {...rest}
        label="Fruit"
        options={[
          {value: 'apple', label: 'Apple'},
          {value: 'banana', label: 'Banana'},
          {value: 'orange', label: 'Orange', disabled: true},
          {value: 'mango', label: 'Mango'},
        ]}
        value={value}
        onChange={v => setValue(v)}
      />
    );
  },
  args: {
    placeholder: 'Select a fruit...',
  },
};

// With icons
export const WithIcons: Story = {
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return (
      <Selector
        {...rest}
        label="Settings"
        options={[
          {value: 'profile', label: 'Profile', icon: UserIcon},
          {value: 'settings', label: 'Settings', icon: CogIcon},
          {value: 'notifications', label: 'Notifications', icon: BellIcon},
        ]}
        value={value}
        onChange={v => setValue(v)}
      />
    );
  },
  args: {
    placeholder: 'Select an option...',
  },
};

// With sections and dividers
export const WithSections: Story = {
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return (
      <Selector
        {...rest}
        label="Fruit"
        options={[
          {value: 'apple', label: 'Apple'},
          {value: 'banana', label: 'Banana'},
          {
            type: 'section',
            title: 'Citrus',
            options: [
              {value: 'orange', label: 'Orange'},
              {value: 'lemon', label: 'Lemon'},
              {value: 'lime', label: 'Lime'},
            ],
          },
          {
            type: 'section',
            title: 'Tropical',
            options: [
              {value: 'mango', label: 'Mango'},
              {value: 'pineapple', label: 'Pineapple'},
            ],
          },
        ]}
        value={value}
        onChange={v => setValue(v)}
      />
    );
  },
  args: {
    placeholder: 'Select a fruit...',
  },
};

// Searchable with sections: filtering keeps group headers and drops empty groups
export const SearchableWithSections: Story = {
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return (
      <Selector
        {...rest}
        label="Fruit"
        hasSearch
        options={[
          {
            type: 'section',
            title: 'Citrus',
            options: [
              {value: 'orange', label: 'Orange'},
              {value: 'lemon', label: 'Lemon'},
              {value: 'lime', label: 'Lime'},
              {value: 'grapefruit', label: 'Grapefruit'},
            ],
          },
          {
            type: 'section',
            title: 'Tropical',
            options: [
              {value: 'mango', label: 'Mango'},
              {value: 'pineapple', label: 'Pineapple'},
              {value: 'papaya', label: 'Papaya'},
              {value: 'guava', label: 'Guava'},
            ],
          },
        ]}
        value={value}
        onChange={v => setValue(v)}
      />
    );
  },
  args: {
    placeholder: 'Select a fruit...',
  },
};

// Searchable: the dropdown search field has a built-in leading magnifier icon
// and a trailing clear (✕) button that appears once a query is typed.
export const Searchable: Story = {
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return (
      <Selector
        {...rest}
        label="Fruit"
        hasSearch
        options={[
          'Apple',
          'Apricot',
          'Banana',
          'Blueberry',
          'Cherry',
          'Grapefruit',
          'Mango',
          'Orange',
        ]}
        value={value}
        onChange={v => setValue(v)}
      />
    );
  },
  args: {
    placeholder: 'Select a fruit...',
  },
};

// Empty states
export const EmptyStates: Story = {
  render: () => {
    const [a, setA] = useState<string | undefined>(undefined);
    const [b, setB] = useState<string | undefined>(undefined);
    const [c, setC] = useState<string | undefined>(undefined);
    const [d, setD] = useState<string | undefined>(undefined);
    return (
      <div
        style={{display: 'flex', flexDirection: 'column', gap: 16, width: 300}}>
        <Selector
          label="No options (default)"
          options={[]}
          value={a}
          onChange={v => setA(v)}
        />
        <Selector
          label="No options (custom)"
          options={[]}
          value={b}
          onChange={v => setB(v)}
          emptyText="No fruit in season yet"
        />
        <Selector
          label="Search for xyz (custom)"
          options={['Apple', 'Banana', 'Cherry']}
          value={c}
          onChange={v => setC(v)}
          hasSearch
          emptySearchText="Nothing matches that fruit"
        />
        <Selector
          label="Loading (no message)"
          options={[]}
          value={d}
          onChange={v => setD(v)}
          isLoading
        />
      </div>
    );
  },
  decorators: [Story => <Story />],
};

// Custom render
export const CustomRender: Story = {
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    const users = [
      {value: 'user1', label: 'Alice Johnson', email: 'alice@example.com'},
      {value: 'user2', label: 'Bob Smith', email: 'bob@example.com'},
      {value: 'user3', label: 'Carol White', email: 'carol@example.com'},
    ];
    return (
      <Selector
        {...rest}
        label="User"
        options={users}
        value={value}
        onChange={v => setValue(v)}
        placeholder="Select a user..."
        renderOption={user => (
          <SelectorOption
            icon={UserIcon}
            label={user.label}
            description={(user as (typeof users)[number]).email}
          />
        )}
      />
    );
  },
};

// Two-line options: description on the data, and the trigger seam
export const OptionDescriptions: Story = {
  render: () => {
    const visibility = [
      {
        value: 'private',
        label: 'Private',
        icon: LockClosedIcon,
        description: 'Only members can access this space and its content.',
      },
      {
        value: 'public',
        label: 'Public',
        icon: GlobeAltIcon,
        description: 'Anyone at the company can find and join this space.',
      },
    ];
    const [condensed, setCondensed] = useState<string | undefined>('private');
    const [oneLine, setOneLine] = useState<string | undefined>('private');
    const [full, setFull] = useState<string | undefined>('private');
    const [grouped, setGrouped] = useState<string | undefined>('private');
    return (
      <div style={{display: 'grid', gap: 24}}>
        <Selector
          label="Visibility (default trigger)"
          options={visibility}
          value={condensed}
          onChange={setCondensed}
          data-testid="condensed"
        />
        <Selector
          label="Visibility (renderValue, one line)"
          options={visibility}
          value={oneLine}
          onChange={setOneLine}
          data-testid="one-line"
          renderValue={option => (
            <SelectorOption
              icon={option.icon}
              label={option.label ?? option.value}
            />
          )}
        />
        <Selector
          label="Visibility (renderValue)"
          options={visibility}
          value={full}
          onChange={setFull}
          data-testid="full"
          renderValue={option => (
            <SelectorOption
              icon={option.icon}
              label={option.label ?? option.value}
              description={option.description}
            />
          )}
        />
        <InputGroup label="Visibility">
          <Selector
            label="Visibility (in a group)"
            isLabelHidden
            options={visibility}
            value={grouped}
            onChange={setGrouped}
            renderValue={option => (
              <SelectorOption
                icon={option.icon}
                label={option.label ?? option.value}
                description={option.description}
              />
            )}
          />
          <Button label="Save" />
        </InputGroup>
      </div>
    );
  },
};

// Size variants
export const SizeVariants: Story = {
  render: () => {
    const [value1, setValue1] = useState<string | undefined>();
    const [value2, setValue2] = useState<string | undefined>();
    const [value3, setValue3] = useState<string | undefined>();
    return (
      <div
        style={{display: 'flex', flexDirection: 'column', gap: 16, width: 250}}>
        <Selector
          label="Small"
          size="sm"
          options={['Apple', 'Banana', 'Orange']}
          value={value1}
          onChange={setValue1}
          placeholder="Small size (28px)"
        />
        <Selector
          label="Medium"
          size="md"
          options={['Apple', 'Banana', 'Orange']}
          value={value2}
          onChange={setValue2}
          placeholder="Medium size (32px)"
        />
        <Selector
          label="Large"
          size="lg"
          options={['Apple', 'Banana', 'Orange']}
          value={value3}
          onChange={setValue3}
          placeholder="Large size (36px)"
        />
      </div>
    );
  },
  decorators: [Story => <Story />],
};

// Ghost variant for toolbar composition
export const GhostVariant: Story = {
  render: () => {
    const [view, setView] = useState<string | undefined>('week');
    const [density, setDensity] = useState<string | undefined>('comfortable');
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: 'max-content',
        }}>
        <Button label="Today" variant="ghost" />
        <Selector
          label="View"
          isLabelHidden
          variant="ghost"
          size="md"
          options={[
            {value: 'day', label: 'Day'},
            {value: 'week', label: 'Week'},
            {value: 'month', label: 'Month'},
          ]}
          value={view}
          onChange={setView}
        />
        <Selector
          label="Density"
          isLabelHidden
          variant="ghost"
          size="md"
          options={[
            {value: 'compact', label: 'Compact'},
            {value: 'comfortable', label: 'Comfortable'},
            {value: 'spacious', label: 'Spacious'},
          ]}
          value={density}
          onChange={setDensity}
          status={{type: 'warning', message: 'This setting affects all users'}}
          statusVariant="tooltip"
        />
        <Button label="Export" variant="ghost" />
      </div>
    );
  },
  decorators: [Story => <Story />],
};

// With status
export const WithStatus: Story = {
  render: () => {
    const [value1, setValue1] = useState<string | undefined>();
    const [value2, setValue2] = useState<string | undefined>('banana');
    const [value3, setValue3] = useState<string | undefined>('apple');
    return (
      <div
        style={{display: 'flex', flexDirection: 'column', gap: 16, width: 250}}>
        <Selector
          label="Error status"
          options={[
            {value: 'apple', label: 'Apple'},
            {value: 'banana', label: 'Banana'},
          ]}
          value={value1}
          onChange={setValue1}
          placeholder="Select a fruit..."
          status={{type: 'error', message: 'Please select a fruit'}}
        />
        <Selector
          label="Warning status"
          options={[
            {value: 'apple', label: 'Apple'},
            {value: 'banana', label: 'Banana'},
          ]}
          value={value2}
          onChange={setValue2}
          status={{type: 'warning', message: 'Banana is out of season'}}
        />
        <Selector
          label="Success status"
          options={[
            {value: 'apple', label: 'Apple'},
            {value: 'banana', label: 'Banana'},
          ]}
          value={value3}
          onChange={setValue3}
          status={{type: 'success'}}
        />
      </div>
    );
  },
  decorators: [Story => <Story />],
};

// Optional and Required
export const OptionalRequired: Story = {
  render: () => {
    const [value1, setValue1] = useState<string | undefined>();
    const [value2, setValue2] = useState<string | undefined>();
    return (
      <div
        style={{display: 'flex', flexDirection: 'column', gap: 16, width: 250}}>
        <Selector
          label="Optional field"
          isOptional
          options={['Apple', 'Banana', 'Orange']}
          value={value1}
          onChange={setValue1}
          placeholder="Select a fruit..."
        />
        <Selector
          label="Required field"
          isRequired
          options={['Apple', 'Banana', 'Orange']}
          value={value2}
          onChange={setValue2}
          placeholder="Select a fruit..."
        />
      </div>
    );
  },
  decorators: [Story => <Story />],
};

// Disabled
export const Disabled: Story = {
  args: {
    label: 'Fruit',
    options: ['Apple', 'Banana', 'Orange'],
    value: 'Apple',
    isDisabled: true,
    placeholder: 'Select a fruit...',
  },
};

// Disabled with an explanation tooltip. Hover or keyboard-focus the trigger to
// see why it's disabled — the reason is announced to assistive tech via
// aria-describedby, and the trigger stays focusable (activation is still
// blocked). Use disabledMessage instead of wrapping a disabled Selector in
// Tooltip: disabled controls swallow the pointer events a Tooltip wrapper needs.
export const DisabledWithMessage: Story = {
  args: {
    label: 'Owner',
    options: ['Alice', 'Bob', 'Carol'],
    isDisabled: true,
    disabledMessage: 'You need the Editor role to change this',
    placeholder: 'Select an owner...',
  },
};

// Pre-selected
export const PreSelected: Story = {
  render: args => {
    const {
      value: _value,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState('Banana');
    return (
      <Selector
        {...rest}
        label="Fruit"
        options={['Apple', 'Banana', 'Orange', 'Mango']}
        value={value}
        onChange={v => setValue(v)}
      />
    );
  },
};

// All variations
export const AllVariations: Story = {
  render: () => {
    const [value1, setValue1] = useState<string | undefined>();
    const [value2, setValue2] = useState<string | undefined>('banana');
    const [value3, setValue3] = useState<string | undefined>();
    const [value4, setValue4] = useState<string | undefined>();
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '250px',
        }}>
        <Selector
          label="Default"
          options={['Apple', 'Banana', 'Orange']}
          value={value1}
          onChange={setValue1}
          placeholder="Select..."
        />
        <Selector
          label="Pre-selected"
          options={[
            {value: 'apple', label: 'Apple'},
            {value: 'banana', label: 'Banana'},
          ]}
          value={value2}
          onChange={setValue2}
        />
        <Selector
          label="With disabled option"
          options={[
            {value: 'apple', label: 'Apple', disabled: true},
            {value: 'banana', label: 'Banana'},
          ]}
          value={value3}
          onChange={setValue3}
          placeholder="Select..."
        />
        <Selector
          label="Disabled selector"
          options={['Apple', 'Banana']}
          value={value4}
          onChange={setValue4}
          isDisabled
          placeholder="Select..."
        />
      </div>
    );
  },
  decorators: [Story => <Story />],
};

export const Clearable: Story = {
  render: args => {
    const {
      value: _value,
      onChange: _onChange,
      changeAction: _changeAction,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState<string | null>('Banana');
    return (
      <Selector
        {...rest}
        options={['Apple', 'Banana', 'Cherry', 'Date']}
        value={value}
        onChange={v => setValue(v)}
        hasClear
      />
    );
  },
  args: {
    label: 'Fruit',
    placeholder: 'Select a fruit...',
  },
};

export const ClearableWithStatus: Story = {
  render: args => {
    const {
      value: _value,
      onChange: _onChange,
      changeAction: _changeAction,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState<string | null>('Banana');
    return (
      <Selector
        {...rest}
        options={['Apple', 'Banana', 'Cherry']}
        value={value}
        onChange={v => setValue(v)}
        hasClear
      />
    );
  },
  args: {
    label: 'Required fruit',
    status: {type: 'warning', message: 'Selection is recommended'},
  },
};

export const PlacementAbove: Story = {
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _changeAction,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? 'Banana');
    return (
      <Selector
        {...rest}
        label="Bottom toolbar selector"
        options={['Apple', 'Banana', 'Cherry', 'Date']}
        value={value}
        onChange={v => setValue(v)}
        placement="above"
      />
    );
  },
};

export const Placements: Story = {
  render: () => {
    const [below, setBelow] = useState('Banana');
    const [start, setStart] = useState('Banana');
    const [end, setEnd] = useState('Banana');
    const [offset, setOffset] = useState('Banana');
    const options = ['Apple', 'Banana', 'Cherry', 'Date'];
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 32}}>
        <Selector
          label="placement=below"
          options={options}
          value={below}
          onChange={v => setBelow(v)}
          placement="below"
        />
        <Selector
          label="placement=start"
          options={options}
          value={start}
          onChange={v => setStart(v)}
          placement="start"
        />
        <Selector
          label="placement=end"
          options={options}
          value={end}
          onChange={v => setEnd(v)}
          placement="end"
        />
        <Selector
          label="placement=offset"
          options={options}
          value={offset}
          onChange={v => setOffset(v)}
          placement="offset"
        />
      </div>
    );
  },
};

export const StatusVariantComparison: Story = {
  render: () => {
    const [a, setA] = useState<string | undefined>();
    const [b, setB] = useState<string | undefined>();
    return (
      <div
        style={{display: 'flex', flexDirection: 'column', gap: 24, width: 280}}>
        <Selector
          label="Attached (default)"
          options={[
            {value: 'apple', label: 'Apple'},
            {value: 'banana', label: 'Banana'},
          ]}
          value={a}
          onChange={setA}
          placeholder="Select a fruit..."
          status={{type: 'error', message: 'Please select a fruit'}}
        />
        <Selector
          label="Detached"
          options={[
            {value: 'apple', label: 'Apple'},
            {value: 'banana', label: 'Banana'},
          ]}
          value={b}
          onChange={setB}
          placeholder="Select a fruit..."
          status={{type: 'error', message: 'Please select a fruit'}}
          statusVariant="detached"
        />
      </div>
    );
  },
  decorators: [Story => <Story />],
};

/**
 * Theme the clear and chevron glyphs precisely via `defineTheme`.
 *
 * - `components['input-clear-icon'].base` scopes overrides to the clear icon
 *   itself (via the shared canonical `astryx-input-clear-icon` target), so a
 *   theme can recolor it, morph its color on hover, and resize it — without a
 *   fragile descendant selector or raw CSS.
 * - `components['selector-indicator-icon']` scopes overrides to the chevron,
 *   and its `state:expanded` restyles the open state, which the icon reflects
 *   as a `data-state` attribute.
 *
 * Same-element rules in `@layer astryx-theme` win over each icon's own base
 * color/size.
 */
const iconTheme = defineTheme({
  name: 'selector-icon-demo',
  components: {
    'input-clear-icon': {
      base: {
        width: '12px',
        height: '12px',
        fontSize: '12px',
        color: 'var(--color-icon-secondary)',
        ':hover': {color: 'var(--color-accent)'},
      },
    },
    'selector-indicator-icon': {
      base: {
        width: '14px',
        height: '14px',
        fontSize: '14px',
        color: 'var(--color-icon-secondary)',
      },
      'state:expanded': {
        color: 'var(--color-accent)',
      },
    },
  },
});

export const ThemedIcons: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>('Banana');
    return (
      <Theme theme={iconTheme} mode="light">
        <Selector
          label="Icons themed (accent on hover/open)"
          options={['Apple', 'Banana', 'Cherry']}
          value={value}
          onChange={setValue}
          hasClear
        />
      </Theme>
    );
  },
};

/**
 * Swap the single-selection indicator for a radio.
 *
 * `check` is the indicator every single-selection mark draws, so replacing it
 * once in the theme reaches this Selector — and any other component that marks
 * "this one is chosen" — without touching a call site.
 *
 * Note what the default check could never do: an unselected row draws an
 * **empty circle**. The mark is rendered in every state and told which state to
 * draw, so an indicator that has an unselected form can show it.
 */
const radioSelectionTheme = defineTheme({
  name: 'radio-selection-demo',
  indicators: {check: RadioIndicator},
});

export const RadioSelectionIndicator: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>('Banana');
    return (
      <Theme theme={radioSelectionTheme} mode="light">
        <Selector
          label="Single selection drawn as a radio"
          options={['Apple', 'Banana', 'Cherry']}
          value={value}
          onChange={setValue}
          isDefaultOpen
        />
      </Theme>
    );
  },
};

/**
 * The same Selector with no theme, for comparison: a checkmark on the selected
 * row, and nothing at all on the others.
 */
export const DefaultSelectionIndicator: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>('Banana');
    return (
      <Selector
        label="Single selection drawn as a check (default)"
        options={['Apple', 'Banana', 'Cherry']}
        value={value}
        onChange={setValue}
        isDefaultOpen
      />
    );
  },
};

/**
 * `indicatorPosition="start"` moves a rendered mark to the leading edge, the
 * way a native menu marks its chosen row.
 *
 * The default check draws nothing when unchecked, so its empty mark wrapper
 * collapses. Unselected labels gain that space; the selected label may shift or
 * have less available width while its visible mark remains at the logical start.
 */
export const StartIndicatorPosition: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>('Banana');
    return (
      <Selector
        label="Mark at the start"
        options={['Apple', 'Banana', 'Cherry']}
        value={value}
        onChange={setValue}
        indicatorPosition="start"
        isDefaultOpen
      />
    );
  },
};

type IndicatorSpaceEvidenceConfig = {
  direction: 'ltr' | 'rtl';
  indicatorPosition: 'start' | 'end';
  name: string;
  presentation: 'popover' | 'bottom-sheet';
  usesRadioIndicator: boolean;
  width: '12rem' | '24rem';
};

const indicatorEvidenceOptions = [
  {
    value: 'selected',
    label: 'Selected option with a deliberately long readable label',
  },
  {
    value: 'unselected',
    label: 'Unselected option with a deliberately long readable label',
  },
];

function createIndicatorSpaceEvidenceStory(
  config: IndicatorSpaceEvidenceConfig,
): Story {
  const surfaceTarget =
    config.presentation === 'popover' ? 'selector-popup' : 'bottom-sheet';
  const theme = defineTheme({
    name: `selector-ast004-${config.name}`,
    components: {
      [surfaceTarget]: {
        base: {width: config.width, maxWidth: config.width},
      },
    },
    ...(config.usesRadioIndicator ? {indicators: {check: RadioIndicator}} : {}),
  });

  return {
    globals: {direction: config.direction},
    parameters: {
      docs: {
        description: {
          story:
            'AST-004 evidence: the open selection surface keeps visible marks at the configured logical edge and gives empty marks no layout width.',
        },
      },
    },
    render: (_args, context) => (
      <Theme
        theme={theme}
        mode={context.globals.colorMode === 'dark' ? 'dark' : 'light'}>
        <div
          data-ast004-indicator-space={config.name}
          style={{width: config.width}}>
          <Selector
            label="Project with long option labels"
            options={indicatorEvidenceOptions}
            value="selected"
            onChange={() => {}}
            indicatorPosition={config.indicatorPosition}
            presentation={config.presentation}
            placement="below"
            width="100%"
            isDefaultOpen
          />
        </div>
      </Theme>
    ),
    play: async ({canvasElement}) => {
      await waitFor(() => {
        expect(document.querySelector('[role="listbox"]')).not.toBeNull();
      });
      await document.fonts.ready;
      await new Promise<void>(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );

      const selector = canvasElement.querySelector<HTMLElement>(
        `[data-ast004-indicator-space="${config.name}"]`,
      );
      const listbox = document.querySelector<HTMLElement>('[role="listbox"]');
      const selectedRow = listbox?.querySelector<HTMLElement>(
        '[role="option"][aria-selected="true"]',
      );
      const unselectedRow = listbox?.querySelector<HTMLElement>(
        '[role="option"][aria-selected="false"]',
      );
      if (
        selector == null ||
        listbox == null ||
        selectedRow == null ||
        unselectedRow == null
      ) {
        throw new Error(`AST-004 evidence did not render ${config.name}`);
      }
      expect(getComputedStyle(selectedRow).direction).toBe(config.direction);

      const markColumn = (row: HTMLElement) =>
        (config.indicatorPosition === 'start'
          ? row.firstElementChild
          : row.lastElementChild) as HTMLElement;
      const contentColumn = (row: HTMLElement) =>
        (config.indicatorPosition === 'start'
          ? row.lastElementChild
          : row.firstElementChild) as HTMLElement;
      const selectedMark = markColumn(selectedRow);
      const unselectedMark = markColumn(unselectedRow);
      const selectedContent = contentColumn(selectedRow);
      const unselectedContent = contentColumn(unselectedRow);

      expect(selectedMark.getBoundingClientRect().width).toBeGreaterThan(0);
      if (config.usesRadioIndicator) {
        expect(unselectedMark.getBoundingClientRect().width).toBeGreaterThan(0);
        expect(
          Math.abs(
            selectedContent.getBoundingClientRect().width -
              unselectedContent.getBoundingClientRect().width,
          ),
        ).toBeLessThanOrEqual(1);
      } else {
        expect(getComputedStyle(unselectedMark).display).toBe('none');
        expect(unselectedMark.getBoundingClientRect().width).toBe(0);
        expect(unselectedContent.getBoundingClientRect().width).toBeGreaterThan(
          selectedContent.getBoundingClientRect().width,
        );
      }

      expect(selectedContent.textContent).toContain(
        'Selected option with a deliberately long readable label',
      );
      expect(unselectedContent.textContent).toContain(
        'Unselected option with a deliberately long readable label',
      );
      expect(selectedContent.getBoundingClientRect().width).toBeGreaterThan(0);
      expect(unselectedContent.getBoundingClientRect().width).toBeGreaterThan(
        0,
      );

      const markRect = selectedMark.getBoundingClientRect();
      const contentRect = selectedContent.getBoundingClientRect();
      const markIsAtInlineStart =
        config.direction === 'rtl'
          ? markRect.left >= contentRect.right
          : markRect.right <= contentRect.left;
      expect(markIsAtInlineStart).toBe(config.indicatorPosition === 'start');

      if (config.presentation === 'popover') {
        const popup = document.querySelector<HTMLElement>(
          '.astryx-selector-popup',
        );
        if (popup == null) {
          throw new Error(
            `AST-004 Popover evidence did not render ${config.name}`,
          );
        }
        const popoverHost = popup.closest<HTMLElement>('[popover]');
        if (popoverHost == null) {
          throw new Error(`AST-004 Popover host did not render ${config.name}`);
        }
        expect(popoverHost.matches(':popover-open')).toBe(true);
      } else {
        const dialog = document.querySelector<HTMLDialogElement>('dialog');
        if (dialog == null) {
          throw new Error(
            `AST-004 BottomSheet evidence did not render ${config.name}`,
          );
        }
        expect(dialog.matches(':modal')).toBe(true);
      }
    },
  };
}

export const IndicatorSpacePopoverNarrowStart: Story = {
  ...createIndicatorSpaceEvidenceStory({
    name: 'popover-narrow-start-default-ltr',
    presentation: 'popover',
    width: '12rem',
    indicatorPosition: 'start',
    direction: 'ltr',
    usesRadioIndicator: false,
  }),
  tags: ['visual-baseline'],
};

export const IndicatorSpacePopoverWideEndRTL: Story = {
  ...createIndicatorSpaceEvidenceStory({
    name: 'popover-wide-end-radio-rtl',
    presentation: 'popover',
    width: '24rem',
    indicatorPosition: 'end',
    direction: 'rtl',
    usesRadioIndicator: true,
  }),
  tags: ['visual-baseline'],
};

export const IndicatorSpaceBottomSheetNarrowEndRTL: Story = {
  ...createIndicatorSpaceEvidenceStory({
    name: 'bottom-sheet-narrow-end-default-rtl',
    presentation: 'bottom-sheet',
    width: '12rem',
    indicatorPosition: 'end',
    direction: 'rtl',
    usesRadioIndicator: false,
  }),
  tags: ['visual-baseline'],
};

export const IndicatorSpaceBottomSheetWideStart: Story = {
  ...createIndicatorSpaceEvidenceStory({
    name: 'bottom-sheet-wide-start-radio-ltr',
    presentation: 'bottom-sheet',
    width: '24rem',
    indicatorPosition: 'start',
    direction: 'ltr',
    usesRadioIndicator: true,
  }),
  tags: ['visual-baseline'],
};
