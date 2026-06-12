// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {XDSSelector, XDSSelectorOption} from '@xds/core/Selector';
import {UserIcon, CogIcon, BellIcon} from '@heroicons/react/24/outline';

const meta: Meta<typeof XDSSelector> = {
  title: 'Core/Selector',
  component: XDSSelector,
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
    placement: {
      control: 'select',
      options: ['above', 'below', 'start', 'end'],
      description:
        'Explicit menu placement. Leave unset for selected-item overlay behavior.',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Whether the selector is disabled',
    },
    isOptional: {
      control: 'boolean',
      description: 'Whether the field is optional',
    },
    isRequired: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    children: {
      description: 'Optional render function for custom option rendering',
      table: {
        type: {summary: '(item: XDSSelectorOptionData) => ReactNode'},
      },
    },
    'data-testid': {
      control: 'text',
      description: 'Test ID for testing frameworks',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSSelector>;

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
      <XDSSelector
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
      <XDSSelector
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
      <XDSSelector
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
      <XDSSelector
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
      <XDSSelector
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
      <XDSSelector
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
      <XDSSelector
        {...rest}
        label="User"
        options={users}
        value={value}
        onChange={v => setValue(v)}
        placeholder="Select a user...">
        {user => (
          <XDSSelectorOption
            icon={UserIcon}
            label={user.label}
            description={(user as (typeof users)[number]).email}
          />
        )}
      </XDSSelector>
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
        <XDSSelector
          label="Small"
          size="sm"
          options={['Apple', 'Banana', 'Orange']}
          value={value1}
          onChange={setValue1}
          placeholder="Small size (28px)"
        />
        <XDSSelector
          label="Medium"
          size="md"
          options={['Apple', 'Banana', 'Orange']}
          value={value2}
          onChange={setValue2}
          placeholder="Medium size (32px)"
        />
        <XDSSelector
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

// With status
export const WithStatus: Story = {
  render: () => {
    const [value1, setValue1] = useState<string | undefined>();
    const [value2, setValue2] = useState<string | undefined>('banana');
    const [value3, setValue3] = useState<string | undefined>('apple');
    return (
      <div
        style={{display: 'flex', flexDirection: 'column', gap: 16, width: 250}}>
        <XDSSelector
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
        <XDSSelector
          label="Warning status"
          options={[
            {value: 'apple', label: 'Apple'},
            {value: 'banana', label: 'Banana'},
          ]}
          value={value2}
          onChange={setValue2}
          status={{type: 'warning', message: 'Banana is out of season'}}
        />
        <XDSSelector
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
        <XDSSelector
          label="Optional field"
          isOptional
          options={['Apple', 'Banana', 'Orange']}
          value={value1}
          onChange={setValue1}
          placeholder="Select a fruit..."
        />
        <XDSSelector
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
      <XDSSelector
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
        <XDSSelector
          label="Default"
          options={['Apple', 'Banana', 'Orange']}
          value={value1}
          onChange={setValue1}
          placeholder="Select..."
        />
        <XDSSelector
          label="Pre-selected"
          options={[
            {value: 'apple', label: 'Apple'},
            {value: 'banana', label: 'Banana'},
          ]}
          value={value2}
          onChange={setValue2}
        />
        <XDSSelector
          label="With disabled option"
          options={[
            {value: 'apple', label: 'Apple', disabled: true},
            {value: 'banana', label: 'Banana'},
          ]}
          value={value3}
          onChange={setValue3}
          placeholder="Select..."
        />
        <XDSSelector
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
      <XDSSelector
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
      <XDSSelector
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
      <XDSSelector
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
