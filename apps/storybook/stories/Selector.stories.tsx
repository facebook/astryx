import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {XDSSelector, XDSSelectorItem} from '@xds/core/Selector';
import {UserIcon, CogIcon, BellIcon} from '@heroicons/react/24/outline';

const meta: Meta<typeof XDSSelector> = {
  title: 'Core/XDSSelector',
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
    items: {
      control: 'object',
      description:
        'Array of items to display. Can be strings, objects, dividers, or sections.',
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
      options: ['sm', 'md'],
      description: 'Size variant of the selector',
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
      description: 'Optional render function for custom item rendering',
      table: {
        type: {summary: '(item: XDSSelectorItemData) => ReactNode'},
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
    const [value, setValue] = useState<string | undefined>(args.value);
    return (
      <XDSSelector
        {...args}
        label={args.label ?? 'Fruit'}
        items={
          args.items ?? ['Apple', 'Banana', 'Orange', 'Mango', 'Pineapple']
        }
        value={value}
        onChange={setValue}
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
    const [value, setValue] = useState<string | undefined>(args.value);
    return (
      <XDSSelector
        {...args}
        label="Fruit"
        isLabelHidden
        items={['Apple', 'Banana', 'Orange', 'Mango', 'Pineapple']}
        value={value}
        onChange={setValue}
        placeholder="Select a fruit..."
      />
    );
  },
};

// With description
export const WithDescription: Story = {
  render: args => {
    const [value, setValue] = useState<string | undefined>(args.value);
    return (
      <XDSSelector
        {...args}
        label="Fruit"
        description="Choose your favorite fruit from the list"
        items={['Apple', 'Banana', 'Orange', 'Mango', 'Pineapple']}
        value={value}
        onChange={setValue}
        placeholder="Select a fruit..."
      />
    );
  },
};

// With objects
export const WithObjects: Story = {
  render: args => {
    const [value, setValue] = useState<string | undefined>(args.value);
    return (
      <XDSSelector
        {...args}
        label="Fruit"
        items={[
          {value: 'apple', label: 'Apple'},
          {value: 'banana', label: 'Banana'},
          {value: 'orange', label: 'Orange', disabled: true},
          {value: 'mango', label: 'Mango'},
        ]}
        value={value}
        onChange={setValue}
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
    const [value, setValue] = useState<string | undefined>(args.value);
    return (
      <XDSSelector
        {...args}
        label="Settings"
        items={[
          {value: 'profile', label: 'Profile', icon: UserIcon},
          {value: 'settings', label: 'Settings', icon: CogIcon},
          {value: 'notifications', label: 'Notifications', icon: BellIcon},
        ]}
        value={value}
        onChange={setValue}
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
    const [value, setValue] = useState<string | undefined>(args.value);
    return (
      <XDSSelector
        {...args}
        label="Fruit"
        items={[
          {value: 'apple', label: 'Apple'},
          {value: 'banana', label: 'Banana'},
          {
            type: 'section',
            title: 'Citrus',
            items: [
              {value: 'orange', label: 'Orange'},
              {value: 'lemon', label: 'Lemon'},
              {value: 'lime', label: 'Lime'},
            ],
          },
          {
            type: 'section',
            title: 'Tropical',
            items: [
              {value: 'mango', label: 'Mango'},
              {value: 'pineapple', label: 'Pineapple'},
            ],
          },
        ]}
        value={value}
        onChange={setValue}
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
    const [value, setValue] = useState<string | undefined>(args.value);
    const users = [
      {value: 'user1', label: 'Alice Johnson', email: 'alice@example.com'},
      {value: 'user2', label: 'Bob Smith', email: 'bob@example.com'},
      {value: 'user3', label: 'Carol White', email: 'carol@example.com'},
    ];
    return (
      <XDSSelector
        {...args}
        label="User"
        items={users}
        value={value}
        onChange={setValue}
        placeholder="Select a user...">
        {user => (
          <XDSSelectorItem
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
    return (
      <div
        style={{display: 'flex', flexDirection: 'column', gap: 16, width: 250}}>
        <XDSSelector
          label="Small"
          size="sm"
          items={['Apple', 'Banana', 'Orange']}
          value={value1}
          onChange={setValue1}
          placeholder="Small size"
        />
        <XDSSelector
          label="Medium"
          size="md"
          items={['Apple', 'Banana', 'Orange']}
          value={value2}
          onChange={setValue2}
          placeholder="Medium size (default)"
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
          items={[
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
          items={[
            {value: 'apple', label: 'Apple'},
            {value: 'banana', label: 'Banana'},
          ]}
          value={value2}
          onChange={setValue2}
          status={{type: 'warning', message: 'Banana is out of season'}}
        />
        <XDSSelector
          label="Success status"
          items={[
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
          items={['Apple', 'Banana', 'Orange']}
          value={value1}
          onChange={setValue1}
          placeholder="Select a fruit..."
        />
        <XDSSelector
          label="Required field"
          isRequired
          items={['Apple', 'Banana', 'Orange']}
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
    items: ['Apple', 'Banana', 'Orange'],
    value: 'Apple',
    isDisabled: true,
    placeholder: 'Select a fruit...',
  },
};

// Pre-selected
export const PreSelected: Story = {
  render: args => {
    const [value, setValue] = useState('Banana');
    return (
      <XDSSelector
        {...args}
        label="Fruit"
        items={['Apple', 'Banana', 'Orange', 'Mango']}
        value={value}
        onChange={setValue}
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
          items={['Apple', 'Banana', 'Orange']}
          value={value1}
          onChange={setValue1}
          placeholder="Select..."
        />
        <XDSSelector
          label="Pre-selected"
          items={[
            {value: 'apple', label: 'Apple'},
            {value: 'banana', label: 'Banana'},
          ]}
          value={value2}
          onChange={setValue2}
        />
        <XDSSelector
          label="With disabled option"
          items={[
            {value: 'apple', label: 'Apple', disabled: true},
            {value: 'banana', label: 'Banana'},
          ]}
          value={value3}
          onChange={setValue3}
          placeholder="Select..."
        />
        <XDSSelector
          label="Disabled selector"
          items={['Apple', 'Banana']}
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
