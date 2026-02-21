'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSBadge} from '@xds/core/Badge';
import {XDSDivider} from '@xds/core';

const styles = stylex.create({
  container: {
    maxWidth: 640,
  },
});

/**
 * Example sandbox page.
 *
 * Copy this file to create a new page:
 * 1. Create `src/app/pages/<name>/page.tsx`
 * 2. Add an entry to the `pages` array in `src/app/Sidebar.tsx`
 */
export default function ExamplePage() {
  return (
    <div {...stylex.props(styles.container)}>
      <XDSVStack gap="space6">
        <XDSVStack gap="space2">
          <XDSHeading level={1}>Example Page</XDSHeading>
          <XDSText color="secondary">
            A scaffold showing common XDS components. Copy this file to create
            new pages.
          </XDSText>
        </XDSVStack>

        <XDSDivider />

        {/* Buttons */}
        <XDSVStack gap="space3">
          <XDSHeading level={2}>Buttons</XDSHeading>
          <XDSHStack gap="space3" align="center">
            <XDSButton variant="primary">Primary</XDSButton>
            <XDSButton variant="secondary">Secondary</XDSButton>
            <XDSButton variant="ghost">Ghost</XDSButton>
          </XDSHStack>
          <XDSHStack gap="space3" align="center">
            <XDSButton size="small">Small</XDSButton>
            <XDSButton size="medium">Medium</XDSButton>
            <XDSButton size="large">Large</XDSButton>
          </XDSHStack>
        </XDSVStack>

        <XDSDivider />

        {/* Badges */}
        <XDSVStack gap="space3">
          <XDSHeading level={2}>Badges</XDSHeading>
          <XDSHStack gap="space3" align="center">
            <XDSBadge variant="info">Info</XDSBadge>
            <XDSBadge variant="success">Success</XDSBadge>
            <XDSBadge variant="warning">Warning</XDSBadge>
            <XDSBadge variant="error">Error</XDSBadge>
          </XDSHStack>
        </XDSVStack>

        <XDSDivider />

        {/* Typography */}
        <XDSVStack gap="space3">
          <XDSHeading level={2}>Typography</XDSHeading>
          <XDSHeading level={3}>Heading 3</XDSHeading>
          <XDSText type="large" weight="bold">
            Large bold text
          </XDSText>
          <XDSText>Default body text</XDSText>
          <XDSText type="detail" color="secondary">
            Detail text in secondary color
          </XDSText>
        </XDSVStack>

        <XDSDivider />

        {/* Form Controls */}
        <XDSVStack gap="space3">
          <XDSHeading level={2}>Form Controls</XDSHeading>
          <XDSTextInput label="Name" placeholder="Enter your name" />
          <XDSTextInput
            label="Email"
            placeholder="you@example.com"
            type="email"
          />
          <XDSCheckboxInput label="Enable notifications" />
          <XDSCheckboxInput label="Subscribe to updates" />
        </XDSVStack>
      </XDSVStack>
    </div>
  );
}
