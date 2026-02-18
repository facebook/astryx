import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {
  MagnifyingGlassIcon,
  EnvelopeIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof XDSTextInput> = {
  title: 'Core/XDSTextInput',
  component: XDSTextInput,
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
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    description: {
      control: 'text',
      description: 'Description text displayed between the label and input',
    },
    value: {
      control: 'text',
      description: 'Current input value (required)',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
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
    isDisabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    status: {
      control: 'object',
      description:
        'Status indicator with type (warning/error/success) and optional message',
    },
    labelTooltip: {
      control: 'text',
      description:
        'Tooltip text to display in an info icon at the end of the label',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSTextInput>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Name',
    placeholder: 'Enter your name',
  },
};

export const WithDescription: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Email',
    description: "We'll never share your email with anyone.",
    placeholder: 'Enter your email',
  },
};

export const WithHiddenLabel: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Search',
    isLabelHidden: true,
    placeholder: 'Search...',
  },
};

export const WithValue: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? 'Hello, world!');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Greeting',
    value: 'Hello, world!',
  },
};

export const AllVariations: Story = {
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    const [value3, setValue3] = useState('Pre-filled value');
    const [value4, setValue4] = useState('');
    const [value5, setValue5] = useState('');
    const [value6, setValue6] = useState('');
    const [value7, setValue7] = useState('');
    const [value8, setValue8] = useState('Disabled input');
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '300px',
        }}>
        <XDSTextInput
          label="Visible label"
          value={value1}
          onChange={setValue1}
          placeholder="Enter text..."
        />
        <XDSTextInput
          label="With description"
          description="Helpful description text"
          value={value4}
          onChange={setValue4}
          placeholder="Enter text..."
        />
        <XDSTextInput
          label="Hidden label"
          isLabelHidden
          value={value2}
          onChange={setValue2}
          placeholder="Hidden label input"
        />
        <XDSTextInput label="With value" value={value3} onChange={setValue3} />
        <XDSTextInput
          label="Optional field"
          isOptional
          value={value5}
          onChange={setValue5}
          placeholder="Optional..."
        />
        <XDSTextInput
          label="Required field"
          isRequired
          value={value6}
          onChange={setValue6}
          placeholder="Required..."
        />
        <XDSTextInput
          label="Description with optional"
          description="Enter your nickname"
          isOptional
          value={value7}
          onChange={setValue7}
          placeholder="Nickname..."
        />
        <XDSTextInput
          label="Disabled field"
          isDisabled
          value={value8}
          onChange={setValue8}
        />
      </div>
    );
  },
};

export const OptionalField: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Nickname',
    isOptional: true,
    placeholder: 'Enter your nickname',
  },
};

export const RequiredField: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Username',
    isRequired: true,
    placeholder: 'Enter your username',
  },
};

export const DescriptionWithOptional: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Bio',
    description: 'Tell us about yourself',
    isOptional: true,
    placeholder: 'Your bio here...',
  },
};

export const Disabled: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? 'Cannot edit this');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Locked Field',
    isDisabled: true,
    value: 'Cannot edit this',
  },
};

export const WithStartIcon: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Search',
    placeholder: 'Search...',
    startIcon: MagnifyingGlassIcon,
  },
};

export const WithStartIconAndSmallSize: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Search',
    placeholder: 'Search...',
    startIcon: MagnifyingGlassIcon,
    size: 'sm',
  },
};

export const SizeVariants: Story = {
  render: () => {
    const [sm, setSm] = useState('');
    const [md, setMd] = useState('');
    const [lg, setLg] = useState('');
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '300px',
        }}>
        <XDSTextInput
          label="Small (28px)"
          value={sm}
          onChange={setSm}
          placeholder="Small size"
          size="sm"
        />
        <XDSTextInput
          label="Medium (32px)"
          value={md}
          onChange={setMd}
          placeholder="Medium size (default)"
          size="md"
        />
        <XDSTextInput
          label="Large (36px)"
          value={lg}
          onChange={setLg}
          placeholder="Large size"
          size="lg"
        />
      </div>
    );
  },
};

export const StartIconVariations: Story = {
  render: () => {
    const [search, setSearch] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '300px',
        }}>
        <XDSTextInput
          label="Search"
          value={search}
          onChange={setSearch}
          placeholder="Search..."
          startIcon={MagnifyingGlassIcon}
        />
        <XDSTextInput
          label="Email"
          value={email}
          onChange={setEmail}
          placeholder="Enter your email"
          startIcon={EnvelopeIcon}
        />
        <XDSTextInput
          label="Username"
          value={username}
          onChange={setUsername}
          placeholder="Enter your username"
          startIcon={UserIcon}
        />
      </div>
    );
  },
};

export const ErrorStatus: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? 'invalid@');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    status: {type: 'error', message: 'Please enter a valid email address'},
  },
};

export const WarningStatus: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? 'user123');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
    status: {type: 'warning', message: 'This username is already taken'},
  },
};

export const SuccessStatus: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? 'validuser');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
    status: {type: 'success', message: 'Username is available'},
  },
};

export const StatusWithoutMessage: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? 'test');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Field',
    placeholder: 'Enter value',
    status: {type: 'error'},
  },
};

export const StatusVariations: Story = {
  render: () => {
    const [error, setError] = useState('invalid@');
    const [warning, setWarning] = useState('user123');
    const [success, setSuccess] = useState('validuser');
    const [errorNoMsg, setErrorNoMsg] = useState('test');
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '300px',
        }}>
        <XDSTextInput
          label="Error with message"
          value={error}
          onChange={setError}
          status={{type: 'error', message: 'Please enter a valid email'}}
        />
        <XDSTextInput
          label="Warning with message"
          value={warning}
          onChange={setWarning}
          status={{type: 'warning', message: 'This username may be taken'}}
        />
        <XDSTextInput
          label="Success with message"
          value={success}
          onChange={setSuccess}
          status={{type: 'success', message: 'Username is available'}}
        />
        <XDSTextInput
          label="Error without message"
          value={errorNoMsg}
          onChange={setErrorNoMsg}
          status={{type: 'error'}}
        />
      </div>
    );
  },
};

export const WithTooltip: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'API Key',
    placeholder: 'Enter your API key',
    labelTooltip: 'Your unique API key for authentication. Keep this secret!',
  },
};

export const TooltipWithOptional: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Webhook URL',
    placeholder: 'https://example.com/webhook',
    labelTooltip: 'The URL where we will send event notifications.',
    isOptional: true,
  },
};

/**
 * Demonstrates onChangeAction mimicking a search param update.
 * Similar to how a router would handle search — the input updates a URL
 * param asynchronously. useOptimistic shows the typed value immediately
 * while the "route transition" is pending.
 */
export const AsyncAction: Story = {
  render: () => {
    // Simulates a URL search param (e.g., ?q=...)
    const [searchParam, setSearchParam] = useState('');
    const [resultCount, setResultCount] = useState<number | null>(null);

    // Simulate a route transition that updates the search param
    const updateSearchParam = async (newValue: string) => {
      await new Promise<void>(resolve => {
        setTimeout(() => {
          setSearchParam(newValue);
          // Simulate search results
          setResultCount(
            newValue.length === 0
              ? null
              : Math.floor(Math.random() * 50) + 1,
          );
          resolve();
        }, 600);
      });
    };

    const displayUrl = searchParam
      ? `/search?q=${encodeURIComponent(searchParam)}`
      : '/search';

    return (
      <XDSVStack gap="space4">
        <XDSText type="body" color="secondary">
          Simulates a search input that updates a URL param. The input shows
          what you type immediately (optimistic), while the param updates
          after a server round-trip.
        </XDSText>
        <XDSTextInput
          label="Search"
          isLabelHidden
          placeholder="Search products..."
          value={searchParam}
          onChangeAction={updateSearchParam}
          startIcon={MagnifyingGlassIcon}
        />
        <XDSText type="code" color="secondary">
          {displayUrl}
        </XDSText>
        {resultCount !== null && (
          <XDSText type="supporting" color="secondary">
            {resultCount} results found
          </XDSText>
        )}
      </XDSVStack>
    );
  },
};


