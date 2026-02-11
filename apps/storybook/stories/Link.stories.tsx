import type {Meta, StoryObj} from '@storybook/react';
import {XDSLink} from '@xds/core/Link';
import {XDSText} from '@xds/core/Text';

const meta: Meta<typeof XDSLink> = {
  title: 'Core/XDSLink',
  component: XDSLink,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible label (required)',
    },
    href: {
      control: 'text',
      description: 'Link destination URL',
    },
    color: {
      control: 'select',
      options: [
        'active',
        'primary',
        'secondary',
        'disabled',
        'placeholder',
        'inherit',
      ],
      description: 'Text color',
    },
    hasUnderline: {
      control: 'boolean',
      description: 'Always show underline',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    isExternalLink: {
      control: 'boolean',
      description: 'Opens in new tab with external icon',
    },
    tooltip: {
      control: 'text',
      description: 'Tooltip text on hover',
    },
    standalone: {
      control: 'boolean',
      description: 'Standalone (applies base font sizing)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSLink>;

export const Default: Story = {
  args: {
    label: 'Documentation',
    href: '/docs',
    children: 'Documentation',
  },
};

export const Secondary: Story = {
  args: {
    label: 'Privacy Policy',
    href: '/privacy',
    color: 'secondary',
    children: 'Privacy Policy',
  },
};

export const Primary: Story = {
  args: {
    label: 'Learn more',
    href: '/learn',
    color: 'primary',
    children: 'Learn more',
  },
};

export const WithUnderline: Story = {
  args: {
    label: 'Always underlined',
    href: '/underlined',
    hasUnderline: true,
    children: 'Always underlined',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled link',
    href: '/disabled',
    isDisabled: true,
    children: 'Disabled link',
  },
};

export const ExternalLink: Story = {
  args: {
    label: 'GitHub',
    href: 'https://github.com',
    isExternalLink: true,
    children: 'GitHub',
  },
};

export const WithTooltip: Story = {
  args: {
    label: 'Settings',
    href: '/settings',
    tooltip: 'Configure your preferences',
    children: 'Settings',
  },
};

export const Standalone: Story = {
  args: {
    label: 'Standalone Link',
    href: '/standalone',
    standalone: true,
    children: 'Standalone Link',
  },
};

export const InlineWithText: Story = {
  render: () => (
    <XDSText type="body">
      Read the{' '}
      <XDSLink label="documentation" href="/docs">
        documentation
      </XDSLink>{' '}
      for more information about using XDS components.
    </XDSText>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '600px',
      }}>
      <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
        <XDSLink label="Active (default)" href="/active" standalone>
          Active (default)
        </XDSLink>
        <XDSLink label="Primary" href="/primary" color="primary" standalone>
          Primary
        </XDSLink>
        <XDSLink
          label="Secondary"
          href="/secondary"
          color="secondary"
          standalone>
          Secondary
        </XDSLink>
        <XDSLink label="Inherit" href="/inherit" color="inherit" standalone>
          Inherit
        </XDSLink>
      </div>
      <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
        <XDSLink
          label="With underline"
          href="/underlined"
          hasUnderline
          standalone>
          With underline
        </XDSLink>
        <XDSLink
          label="External"
          href="https://example.com"
          isExternalLink
          standalone>
          External
        </XDSLink>
        <XDSLink
          label="With tooltip"
          href="/tooltip"
          tooltip="Helpful info"
          standalone>
          With tooltip
        </XDSLink>
      </div>
      <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
        <XDSLink label="Disabled active" href="/disabled" isDisabled standalone>
          Disabled active
        </XDSLink>
        <XDSLink
          label="Disabled secondary"
          href="/disabled"
          color="secondary"
          isDisabled
          standalone>
          Disabled secondary
        </XDSLink>
      </div>
    </div>
  ),
};

export const ExternalLinks: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
      <XDSLink
        label="GitHub"
        href="https://github.com"
        isExternalLink
        standalone>
        GitHub
      </XDSLink>
      <XDSLink
        label="MDN Web Docs"
        href="https://developer.mozilla.org"
        isExternalLink
        standalone>
        MDN Web Docs
      </XDSLink>
      <XDSLink
        label="React Documentation"
        href="https://react.dev"
        isExternalLink
        hasUnderline
        standalone>
        React Documentation
      </XDSLink>
    </div>
  ),
};

export const LinksWithTooltips: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
      <XDSLink
        label="Settings"
        href="/settings"
        tooltip="Configure your account settings"
        standalone>
        Settings
      </XDSLink>
      <XDSLink
        label="Profile"
        href="/profile"
        tooltip="View and edit your profile"
        standalone>
        Profile
      </XDSLink>
      <XDSLink
        label="Help"
        href="/help"
        tooltip="Get help and support"
        color="secondary"
        standalone>
        Help
      </XDSLink>
    </div>
  ),
};
