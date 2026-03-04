import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSFormLayout} from '@xds/core/FormLayout';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSelector} from '@xds/core/Selector';
import {XDSField} from '@xds/core/Field';
import {XDSText} from '@xds/core/Text';
import * as stylex from '@stylexjs/stylex';

const meta: Meta<typeof XDSFormLayout> = {
  title: 'Form/XDSFormLayout',
  component: XDSFormLayout,
  tags: ['autodocs'],
  args: {
    direction: 'vertical',
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['vertical', 'horizontal', 'horizontal-labels'],
      description: 'Direction of field arrangement',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSFormLayout>;

// Helper component that uses args so Storybook controls work
function FormLayoutDemo({
  direction,
}: {
  direction?: 'vertical' | 'horizontal' | 'horizontal-labels';
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  return (
    <XDSFormLayout direction={direction}>
      <XDSTextInput label="Name" value={name} onChange={setName} />
      <XDSTextInput label="Email" value={email} onChange={setEmail} />
      <XDSTextInput label="Bio" value={bio} onChange={setBio} />
    </XDSFormLayout>
  );
}

// ─── Vertical (default) ───────────────────────────────────────────────────

export const Vertical: Story = {
  name: 'Vertical (Default)',
  render: args => <FormLayoutDemo direction={args.direction} />,
};

// ─── Horizontal ───────────────────────────────────────────────────────────

export const Horizontal: Story = {
  name: 'Horizontal',
  args: {
    direction: 'horizontal',
  },
  render: args => {
    const [first, setFirst] = useState('');
    const [last, setLast] = useState('');
    return (
      <XDSFormLayout direction={args.direction}>
        <XDSTextInput label="First Name" value={first} onChange={setFirst} />
        <XDSTextInput label="Last Name" value={last} onChange={setLast} />
      </XDSFormLayout>
    );
  },
};

// ─── Horizontal Labels ────────────────────────────────────────────────────

export const HorizontalLabels: Story = {
  name: 'Horizontal Labels (Settings)',
  args: {
    direction: 'horizontal-labels',
  },
  render: args => {
    const [displayName, setDisplayName] = useState('Jane Doe');
    const [email, setEmail] = useState('jane@example.com');
    const [timezone, setTimezone] = useState('America/Los_Angeles');
    return (
      <XDSFormLayout direction={args.direction}>
        <XDSTextInput
          label="Display Name"
          value={displayName}
          onChange={setDisplayName}
        />
        <XDSTextInput label="Email" value={email} onChange={setEmail} />
        <XDSSelector
          label="Timezone"
          value={timezone}
          onChange={v => setTimezone(v as string)}
          items={[
            {label: 'Pacific Time', value: 'America/Los_Angeles'},
            {label: 'Eastern Time', value: 'America/New_York'},
            {label: 'UTC', value: 'UTC'},
          ]}
        />
      </XDSFormLayout>
    );
  },
};

// ─── Mixed: XDS inputs + XDSField-wrapped custom controls ─────────────────

const checkboxStyles = stylex.create({
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
});

export const MixedControls: Story = {
  name: 'Mixed Controls',
  render: () => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('viewer');
    return (
      <XDSFormLayout>
        <XDSTextInput label="Name" value={name} onChange={setName} />
        <XDSSelector
          label="Role"
          value={role}
          onChange={v => setRole(v as string)}
          items={[
            {label: 'Viewer', value: 'viewer'},
            {label: 'Editor', value: 'editor'},
            {label: 'Admin', value: 'admin'},
          ]}
        />
        <XDSField label="Notifications" inputID="notif-group">
          <div {...stylex.props(checkboxStyles.group)} id="notif-group">
            <label {...stylex.props(checkboxStyles.label)}>
              <input type="checkbox" defaultChecked /> Email
            </label>
            <label {...stylex.props(checkboxStyles.label)}>
              <input type="checkbox" /> SMS
            </label>
            <label {...stylex.props(checkboxStyles.label)}>
              <input type="checkbox" defaultChecked /> Push
            </label>
          </div>
        </XDSField>
      </XDSFormLayout>
    );
  },
};

// ─── Nested Layouts ───────────────────────────────────────────────────────

export const Nested: Story = {
  name: 'Nested Layouts',
  render: () => {
    const [first, setFirst] = useState('');
    const [last, setLast] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');
    return (
      <XDSFormLayout>
        <XDSFormLayout direction="horizontal">
          <XDSTextInput label="First Name" value={first} onChange={setFirst} />
          <XDSTextInput label="Last Name" value={last} onChange={setLast} />
        </XDSFormLayout>
        <XDSTextInput label="Email" value={email} onChange={setEmail} />
        <XDSFormLayout direction="horizontal">
          <XDSTextInput label="City" value={city} onChange={setCity} />
          <XDSTextInput label="State" value={state} onChange={setState} />
          <XDSTextInput label="ZIP" value={zip} onChange={setZip} />
        </XDSFormLayout>
      </XDSFormLayout>
    );
  },
};

// ─── In a Dialog (form attribute pattern) ─────────────────────────────────

const dialogStyles = stylex.create({
  container: {
    border: '1px solid #ddd',
    borderRadius: 8,
    maxWidth: 480,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottom: '1px solid #eee',
  },
  body: {
    padding: 16,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
    padding: 16,
    borderTop: '1px solid #eee',
  },
  button: {
    padding: '8px 16px',
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
  },
  primary: {
    backgroundColor: '#0064E0',
    color: '#fff',
  },
  secondary: {
    backgroundColor: '#F1F4F7',
    color: '#0A1317',
  },
});

export const InDialog: Story = {
  name: 'In a Dialog',
  render: () => {
    const [name, setName] = useState('Jane Doe');
    const [email, setEmail] = useState('jane@example.com');
    return (
      <div {...stylex.props(dialogStyles.container)}>
        <div {...stylex.props(dialogStyles.header)}>
          <XDSText variant="subtitle">Edit Profile</XDSText>
        </div>
        <div {...stylex.props(dialogStyles.body)}>
          <form
            id="edit-profile"
            onSubmit={e => {
              e.preventDefault();
              alert(`Saved: ${name}, ${email}`);
            }}>
            <XDSFormLayout>
              <XDSTextInput label="Name" value={name} onChange={setName} />
              <XDSTextInput label="Email" value={email} onChange={setEmail} />
            </XDSFormLayout>
          </form>
        </div>
        <div {...stylex.props(dialogStyles.footer)}>
          <button
            {...stylex.props(dialogStyles.button, dialogStyles.secondary)}
            type="button">
            Cancel
          </button>
          <button
            {...stylex.props(dialogStyles.button, dialogStyles.primary)}
            type="submit"
            form="edit-profile">
            Save
          </button>
        </div>
      </div>
    );
  },
};
