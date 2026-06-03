// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {XDSLink} from '@xds/core/Link';
import {XDSText} from '@xds/core/Text';

const meta: Meta<typeof XDSLink> = {
  title: 'Core/Link',
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
    isStandalone: {
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
    isStandalone: true,
    children: 'Standalone Link',
  },
};

export const InlineWithText: Story = {
  render: () => (
    <XDSText type="body">
      Read the <XDSLink href="/docs">documentation</XDSLink> for more
      information about using XDS components.
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
        <XDSLink href="/active" isStandalone>
          Active (default)
        </XDSLink>
        <XDSLink href="/primary" color="primary" isStandalone>
          Primary
        </XDSLink>
        <XDSLink href="/secondary" color="secondary" isStandalone>
          Secondary
        </XDSLink>
        <XDSLink href="/inherit" color="inherit" isStandalone>
          Inherit
        </XDSLink>
      </div>
      <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
        <XDSLink href="/underlined" hasUnderline isStandalone>
          With underline
        </XDSLink>
        <XDSLink href="https://example.com" isExternalLink isStandalone>
          External
        </XDSLink>
        <XDSLink href="/tooltip" tooltip="Helpful info" isStandalone>
          With tooltip
        </XDSLink>
      </div>
      <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
        <XDSLink href="/disabled" isDisabled isStandalone>
          Disabled active
        </XDSLink>
        <XDSLink href="/disabled" color="secondary" isDisabled isStandalone>
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
      <XDSLink href="https://github.com" isExternalLink isStandalone>
        GitHub
      </XDSLink>
      <XDSLink href="https://developer.mozilla.org" isExternalLink isStandalone>
        MDN Web Docs
      </XDSLink>
      <XDSLink
        href="https://react.dev"
        isExternalLink
        hasUnderline
        isStandalone>
        React Documentation
      </XDSLink>
    </div>
  ),
};

export const LinksWithTooltips: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
      <XDSLink
        href="/settings"
        tooltip="Configure your account settings"
        isStandalone>
        Settings
      </XDSLink>
      <XDSLink
        href="/profile"
        tooltip="View and edit your profile"
        isStandalone>
        Profile
      </XDSLink>
      <XDSLink
        href="/help"
        tooltip="Get help and support"
        color="secondary"
        isStandalone>
        Help
      </XDSLink>
    </div>
  ),
};

export const ButtonFallback: Story = {
  args: {
    children: 'Click me (no href)',
    onClick: () => alert('Clicked!'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'When `href` is undefined, XDSLink renders a `<button>` with reset styles. ' +
          'Visually identical to a link, but semantically correct for actions that do not navigate.',
      },
    },
  },
};

export const ButtonFallbackDisabled: Story = {
  args: {
    children: 'Disabled action',
    isDisabled: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'The button fallback supports the `isDisabled` prop with native `disabled` attribute.',
      },
    },
  },
};

export const ButtonFallbackVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '600px',
      }}>
      <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
        <XDSLink onClick={() => {}} isStandalone>
          Active (default)
        </XDSLink>
        <XDSLink onClick={() => {}} color="primary" isStandalone>
          Primary
        </XDSLink>
        <XDSLink onClick={() => {}} color="secondary" isStandalone>
          Secondary
        </XDSLink>
        <XDSLink onClick={() => {}} color="inherit" isStandalone>
          Inherit
        </XDSLink>
      </div>
      <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
        <XDSLink onClick={() => {}} hasUnderline isStandalone>
          With underline
        </XDSLink>
        <XDSLink onClick={() => {}} tooltip="Action tooltip" isStandalone>
          With tooltip
        </XDSLink>
        <XDSLink onClick={() => {}} isDisabled isStandalone>
          Disabled
        </XDSLink>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Button fallback supports all visual variants (color, underline, tooltip, disabled) — ' +
          'visually indistinguishable from a regular link.',
      },
    },
  },
};

export const ButtonFallbackInline: Story = {
  render: () => (
    <XDSText type="body">
      You can <XDSLink onClick={() => alert('Undo!')}>undo this action</XDSLink>{' '}
      if you change your mind.
    </XDSText>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Button fallback works inline within text, just like a regular link. ' +
          'Inspect the DOM — it renders a `<button>` not an `<a>`.',
      },
    },
  },
};

export const LinkVsButtonComparison: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '600px',
      }}>
      <XDSText type="large" size="sm">
        Link (with href) vs Button (without href)
      </XDSText>
      <div style={{display: 'flex', gap: '24px', alignItems: 'center'}}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            alignItems: 'center',
          }}>
          <XDSLink href="/destination" isStandalone>
            I navigate
          </XDSLink>
          <XDSText type="body" size="sm" color="secondary">
            {'<a href="/destination">'}
          </XDSText>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            alignItems: 'center',
          }}>
          <XDSLink onClick={() => alert('Action!')} isStandalone>
            I act
          </XDSLink>
          <XDSText type="body" size="sm" color="secondary">
            {'<button type="button">'}
          </XDSText>
        </div>
      </div>
      <XDSText type="body" size="sm" color="secondary">
        Both look the same — but inspect the DOM to see the semantic difference.
      </XDSText>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Side-by-side comparison showing that links and button fallbacks are visually identical. ' +
          'The only difference is in the rendered DOM element.',
      },
    },
  },
};
