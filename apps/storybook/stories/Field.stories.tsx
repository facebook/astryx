import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { XDSField } from '@xds/core/Field';

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
      description: 'Visually hide the label (still accessible to screen readers)',
    },
    description: {
      control: 'text',
      description: 'Description text displayed between the label and input',
    },
    labelID: {
      control: 'text',
      description: 'ID for the label htmlFor attribute (should match input id)',
    },
    descriptionID: {
      control: 'text',
      description: 'ID for the description element (use for aria-describedby)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSField>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <XDSField {...args} labelID="email-input">
        <input
          id="email-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ padding: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
        />
      </XDSField>
    );
  },
  args: {
    label: 'Email',
  },
};

export const WithDescription: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <XDSField {...args} labelID="email-input" descriptionID="email-desc">
        <input
          id="email-input"
          aria-describedby="email-desc"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ padding: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
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
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <XDSField {...args} labelID="search-input">
        <input
          id="search-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search..."
          style={{ padding: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
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
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '300px' }}>
        <XDSField label="Default field" labelID="default-input">
          <input
            id="default-input"
            value={value1}
            onChange={(e) => setValue1(e.target.value)}
            style={{ padding: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
          />
        </XDSField>
        <XDSField label="With description" description="This is helpful information" labelID="desc-input" descriptionID="desc-text">
          <input
            id="desc-input"
            aria-describedby="desc-text"
            value={value2}
            onChange={(e) => setValue2(e.target.value)}
            style={{ padding: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
          />
        </XDSField>
      </div>
    );
  },
};
