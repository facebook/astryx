import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSField} from '@xds/core/Field';

const meta: Meta<typeof XDSField> = {
  title: 'Core/XDSField',
  component: XDSField,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text (required)',
    },
    isLabelHidden: {
      control: 'boolean',
      description:
        'Visually hide the label (still accessible to screen readers)',
    },
    description: {
      control: 'text',
      description: 'Description text displayed between the label and input',
    },
    inputID: {
      control: 'text',
      description:
        'ID for the input element (used for label htmlFor attribute)',
    },
    descriptionID: {
      control: 'text',
      description: 'ID for the description element (use for aria-describedby)',
    },
    isOptional: {
      control: 'boolean',
      description:
        'Whether the field is optional (mutually exclusive with isRequired)',
    },
    isRequired: {
      control: 'boolean',
      description:
        'Whether the field is required (mutually exclusive with isOptional)',
    },
    labelTooltip: {
      control: 'text',
      description:
        'Tooltip text to display in an info icon at the end of the label',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSField>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState('');
    return (
      <XDSField {...args} inputID="email-input">
        <input
          id="email-input"
          value={value}
          onChange={e => setValue(e.target.value)}
          style={{
            padding: '8px',
            fontSize: '14px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </XDSField>
    );
  },
  args: {
    label: 'Email',
  },
};

export const WithDescription: Story = {
  render: args => {
    const [value, setValue] = useState('');
    return (
      <XDSField {...args} inputID="email-input" descriptionID="email-desc">
        <input
          id="email-input"
          aria-describedby="email-desc"
          value={value}
          onChange={e => setValue(e.target.value)}
          style={{
            padding: '8px',
            fontSize: '14px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </XDSField>
    );
  },
  args: {
    label: 'Email',
    description: "We'll never share your email with anyone.",
  },
};

export const WithHiddenLabel: Story = {
  render: args => {
    const [value, setValue] = useState('');
    return (
      <XDSField {...args} inputID="search-input">
        <input
          id="search-input"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Search..."
          style={{
            padding: '8px',
            fontSize: '14px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </XDSField>
    );
  },
  args: {
    label: 'Search',
    isLabelHidden: true,
  },
};

export const AllVariations: Story = {
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    const [value3, setValue3] = useState('');
    const [value4, setValue4] = useState('');
    const [value5, setValue5] = useState('');
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          maxWidth: '300px',
        }}>
        <XDSField label="Default field" inputID="default-input">
          <input
            id="default-input"
            value={value1}
            onChange={e => setValue1(e.target.value)}
            style={{
              padding: '8px',
              fontSize: '14px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </XDSField>
        <XDSField
          label="With description"
          description="This is helpful information"
          inputID="desc-input"
          descriptionID="desc-text">
          <input
            id="desc-input"
            aria-describedby="desc-text"
            value={value2}
            onChange={e => setValue2(e.target.value)}
            style={{
              padding: '8px',
              fontSize: '14px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </XDSField>
        <XDSField label="Optional field" isOptional inputID="optional-input">
          <input
            id="optional-input"
            value={value3}
            onChange={e => setValue3(e.target.value)}
            style={{
              padding: '8px',
              fontSize: '14px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </XDSField>
        <XDSField label="Required field" isRequired inputID="required-input">
          <input
            id="required-input"
            value={value4}
            onChange={e => setValue4(e.target.value)}
            style={{
              padding: '8px',
              fontSize: '14px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </XDSField>
        <XDSField
          label="With description and optional"
          description="Enter your nickname"
          isOptional
          inputID="desc-optional-input"
          descriptionID="desc-optional-text">
          <input
            id="desc-optional-input"
            aria-describedby="desc-optional-text"
            value={value5}
            onChange={e => setValue5(e.target.value)}
            style={{
              padding: '8px',
              fontSize: '14px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </XDSField>
      </div>
    );
  },
};

export const OptionalField: Story = {
  render: args => {
    const [value, setValue] = useState('');
    return (
      <XDSField {...args} inputID="nickname-input">
        <input
          id="nickname-input"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Enter your nickname"
          style={{
            padding: '8px',
            fontSize: '14px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </XDSField>
    );
  },
  args: {
    label: 'Nickname',
    isOptional: true,
  },
};

export const RequiredField: Story = {
  render: args => {
    const [value, setValue] = useState('');
    return (
      <XDSField {...args} inputID="username-input">
        <input
          id="username-input"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Enter your username"
          style={{
            padding: '8px',
            fontSize: '14px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </XDSField>
    );
  },
  args: {
    label: 'Username',
    isRequired: true,
  },
};

export const DescriptionWithOptional: Story = {
  render: args => {
    const [value, setValue] = useState('');
    return (
      <XDSField {...args} inputID="bio-input" descriptionID="bio-desc">
        <input
          id="bio-input"
          aria-describedby="bio-desc"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Tell us about yourself"
          style={{
            padding: '8px',
            fontSize: '14px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </XDSField>
    );
  },
  args: {
    label: 'Bio',
    description: 'A short description about yourself',
    isOptional: true,
  },
};

export const WithTooltip: Story = {
  render: args => {
    const [value, setValue] = useState('');
    return (
      <XDSField {...args} inputID="tooltip-input">
        <input
          id="tooltip-input"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Enter value"
          style={{
            padding: '8px',
            fontSize: '14px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </XDSField>
    );
  },
  args: {
    label: 'API Key',
    labelTooltip: 'Your unique API key for authentication. Keep this secret!',
  },
};

export const TooltipWithOptional: Story = {
  render: args => {
    const [value, setValue] = useState('');
    return (
      <XDSField {...args} inputID="tooltip-optional-input">
        <input
          id="tooltip-optional-input"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Enter value"
          style={{
            padding: '8px',
            fontSize: '14px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </XDSField>
    );
  },
  args: {
    label: 'Webhook URL',
    labelTooltip: 'The URL where we will send event notifications.',
    isOptional: true,
  },
};
