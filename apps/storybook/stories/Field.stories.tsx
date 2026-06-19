// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSField} from '@xds/core/Field';
import {XDSTextInput} from '@xds/core/TextInput';
import {EnvelopeIcon} from '@heroicons/react/24/outline';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typographyVars,
} from '@xds/core/theme/tokens.stylex';

// A minimal native input styled to match XDS aesthetics —
// demonstrating that XDSField wraps any custom or native input.
const inputStyles = stylex.create({
  root: {
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: typographyVars['--font-family-body'],
    fontSize: '14px',
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-background-surface'],
    color: colorVars['--color-text-primary'],
    outline: 'none',
    ':focus': {
      borderColor: colorVars['--color-accent'],
    },
  },
});

const NativeInput = ({
  id,
  describedBy,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  describedBy?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <input
    id={id}
    aria-describedby={describedBy}
    placeholder={placeholder}
    value={value}
    onChange={e => onChange(e.target.value)}
    {...stylex.props(inputStyles.root)}
  />
);

const meta: Meta<typeof XDSField> = {
  title: 'Core/Field',
  component: XDSField,
  tags: ['autodocs'],
  argTypes: {
    label: {control: 'text'},
    isLabelHidden: {control: 'boolean'},
    description: {control: 'text'},
    isOptional: {control: 'boolean'},
    isRequired: {control: 'boolean'},
    labelTooltip: {control: 'text'},
  },
};

export default meta;
type Story = StoryObj<typeof XDSField>;

export const Default: Story = {
  args: {label: 'Email'},
  render: args => {
    const [value, setValue] = useState('');
    return (
      <XDSField {...args} inputID="email-input">
        <NativeInput
          id="email-input"
          placeholder="you@example.com"
          value={value}
          onChange={setValue}
        />
      </XDSField>
    );
  },
};

export const WithDescription: Story = {
  args: {label: 'Email', description: "We'll never share your email."},
  render: args => {
    const [value, setValue] = useState('');
    return (
      <XDSField {...args} inputID="email-desc-input" descriptionID="email-desc">
        <NativeInput
          id="email-desc-input"
          describedBy="email-desc"
          placeholder="you@example.com"
          value={value}
          onChange={setValue}
        />
      </XDSField>
    );
  },
};

export const WithHiddenLabel: Story = {
  args: {label: 'Search', isLabelHidden: true},
  render: args => {
    const [value, setValue] = useState('');
    return (
      <XDSField {...args} inputID="search-input">
        <NativeInput
          id="search-input"
          placeholder="Search..."
          value={value}
          onChange={setValue}
        />
      </XDSField>
    );
  },
};

export const OptionalField: Story = {
  args: {label: 'Nickname', isOptional: true},
  render: args => {
    const [value, setValue] = useState('');
    return (
      <XDSField {...args} inputID="nickname-input">
        <NativeInput
          id="nickname-input"
          placeholder="Enter your nickname"
          value={value}
          onChange={setValue}
        />
      </XDSField>
    );
  },
};

export const RequiredField: Story = {
  args: {label: 'Username', isRequired: true},
  render: args => {
    const [value, setValue] = useState('');
    return (
      <XDSField {...args} inputID="username-input">
        <NativeInput
          id="username-input"
          placeholder="Enter your username"
          value={value}
          onChange={setValue}
        />
      </XDSField>
    );
  },
};

export const WithTooltip: Story = {
  args: {
    label: 'API Key',
    labelTooltip: 'Your unique API key. Keep this secret!',
  },
  render: args => {
    const [value, setValue] = useState('');
    return (
      <XDSField {...args} inputID="api-key-input">
        <NativeInput
          id="api-key-input"
          placeholder="sk-..."
          value={value}
          onChange={setValue}
        />
      </XDSField>
    );
  },
};

export const WithLabelIcon: Story = {
  args: {label: 'Email', labelIcon: EnvelopeIcon},
  render: args => {
    const [value, setValue] = useState('');
    return (
      <XDSField {...args} inputID="email-icon-input">
        <NativeInput
          id="email-icon-input"
          placeholder="you@example.com"
          value={value}
          onChange={setValue}
        />
      </XDSField>
    );
  },
};

export const AllVariations: Story = {
  render: () => {
    const [vals, setVals] = useState({a: '', b: '', c: '', d: '', e: ''});
    const set = (k: keyof typeof vals) => (v: string) =>
      setVals(prev => ({...prev, [k]: v}));
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          maxWidth: 320,
        }}>
        <XDSField label="Default" inputID="v-a">
          <NativeInput id="v-a" value={vals.a} onChange={set('a')} />
        </XDSField>
        <XDSField
          label="With description"
          description="Some helpful info"
          inputID="v-b"
          descriptionID="v-b-desc">
          <NativeInput
            id="v-b"
            describedBy="v-b-desc"
            value={vals.b}
            onChange={set('b')}
          />
        </XDSField>
        <XDSField label="Optional" isOptional inputID="v-c">
          <NativeInput id="v-c" value={vals.c} onChange={set('c')} />
        </XDSField>
        <XDSField label="Required" isRequired inputID="v-d">
          <NativeInput id="v-d" value={vals.d} onChange={set('d')} />
        </XDSField>
        <XDSField
          label="With tooltip"
          labelTooltip="Extra info here"
          inputID="v-e">
          <NativeInput id="v-e" value={vals.e} onChange={set('e')} />
        </XDSField>
      </div>
    );
  },
};

export const StatusVariants: Story = {
  render: () => {
    const [vals, setVals] = useState({
      error: 'bad-email',
      warning: 'admin',
      success: 'valid-user',
    });
    const set = (k: keyof typeof vals) => (v: string) =>
      setVals(prev => ({...prev, [k]: v}));
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          maxWidth: 400,
        }}>
        <XDSTextInput
          label="Email"
          description="Enter your work email"
          value={vals.error}
          onChange={set('error')}
          status={{
            type: 'error',
            message: 'Please enter a valid email address',
          }}
        />
        <XDSTextInput
          label="Username"
          description="Choose a unique username"
          value={vals.warning}
          onChange={set('warning')}
          status={{
            type: 'warning',
            message: 'This username is reserved for administrators',
          }}
        />
        <XDSTextInput
          label="API Key"
          description="Paste your API key"
          value={vals.success}
          onChange={set('success')}
          status={{type: 'success', message: 'API key is valid and active'}}
        />
      </div>
    );
  },
};
