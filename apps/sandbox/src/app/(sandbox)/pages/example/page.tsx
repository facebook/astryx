'use client';

import {useState} from 'react';

import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSBadge} from '@xds/core/Badge';
import {XDSCard} from '@xds/core/Card';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSDivider} from '@xds/core';
import * as stylex from '@stylexjs/stylex';

/**
 * Use stylex.create() for all custom layout and styling.
 * Pass styles to XDS components via the `xstyle` prop.
 * This keeps styles type-safe, deduped, and layer-aware
 * (product styles always override XDS base styles).
 */
const styles = stylex.create({
  container: {
    maxWidth: 640,
  },
  fullWidth: {
    width: '100%',
  },
  highlightCard: {
    backgroundColor: 'var(--color-background-accent)',
  },
});

/**
 * Example sandbox page.
 *
 * Copy this file to create a new page:
 * 1. Create `src/app/pages/<name>/page.tsx`
 * 2. Add an entry to the `pages` array in `src/app/Sidebar.tsx`
 *
 * Styling guide:
 * - Use `stylex.create()` for any custom styles
 * - Pass styles to XDS components via the `xstyle` prop
 * - Never use inline `style={{}}` for layout — use stylex instead
 */
export default function ExamplePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState(false);
  const [updates, setUpdates] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div {...stylex.props(styles.container)}>
      <XDSVStack gap={6}>
        <XDSVStack gap={2}>
          <XDSHeading level={1}>Example Page</XDSHeading>
          <XDSText type="body" color="secondary">
            A scaffold showing common XDS components. Copy this file to create
            new pages.
          </XDSText>
        </XDSVStack>

        <XDSDivider />

        {/* Tabs */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>Tabs</XDSHeading>
          <XDSTabList value={activeTab} onChange={setActiveTab} hasDivider>
            <XDSTab value="overview" label="Overview" />
            <XDSTab value="details" label="Details" />
            <XDSTab value="settings" label="Settings" />
          </XDSTabList>
          <XDSText type="body">
            Active tab:{' '}
            <XDSText type="body" weight="bold">
              {activeTab}
            </XDSText>
          </XDSText>
        </XDSVStack>

        <XDSDivider />

        {/* Buttons */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>Buttons</XDSHeading>
          <XDSHStack gap={3} vAlign="center">
            <XDSButton label="Primary" variant="primary" />
            <XDSButton label="Secondary" variant="secondary" />
            <XDSButton label="Ghost" variant="ghost" />
          </XDSHStack>
          <XDSHStack gap={3} vAlign="center">
            <XDSButton label="Small" size="sm" />
            <XDSButton label="Medium" size="md" />
            <XDSButton label="Large" size="lg" />
          </XDSHStack>
        </XDSVStack>

        <XDSDivider />

        {/* Badges */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>Badges</XDSHeading>
          <XDSHStack gap={3} vAlign="center">
            <XDSBadge variant="info" label="Info" />
            <XDSBadge variant="success" label="Success" />
            <XDSBadge variant="warning" label="Warning" />
            <XDSBadge variant="error" label="Error" />
          </XDSHStack>
        </XDSVStack>

        <XDSDivider />

        {/* xstyle on components */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>Styling with xstyle</XDSHeading>
          <XDSText type="supporting" color="secondary">
            Use the xstyle prop to pass StyleX overrides to any XDS component.
          </XDSText>
          <XDSCard xstyle={styles.highlightCard} padding={4}>
            <XDSText type="body">
              This card uses xstyle for a custom background.
            </XDSText>
          </XDSCard>
          <XDSButton label="Full Width" xstyle={styles.fullWidth} />
        </XDSVStack>

        <XDSDivider />

        {/* Typography */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>Typography</XDSHeading>
          <XDSHeading level={3}>Heading 3</XDSHeading>
          <XDSText type="large" weight="bold">
            Large bold text
          </XDSText>
          <XDSText type="body">Default body text</XDSText>
          <XDSText type="supporting" color="secondary">
            Supporting text in secondary color
          </XDSText>
        </XDSVStack>

        <XDSDivider />

        {/* Form Controls */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>Form Controls</XDSHeading>
          <XDSTextInput
            label="Name"
            placeholder="Enter your name"
            value={name}
            onChange={setName}
          />
          <XDSTextInput
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
          />
          <XDSCheckboxInput
            label="Enable notifications"
            value={notifications}
            onChange={setNotifications}
          />
          <XDSCheckboxInput
            label="Subscribe to updates"
            value={updates}
            onChange={setUpdates}
          />
        </XDSVStack>
      </XDSVStack>
    </div>
  );
}
