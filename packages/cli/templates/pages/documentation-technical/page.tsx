// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSHStack, XDSVStack, XDSStackItem} from '@xds/core/Stack';
import {XDSLayout, XDSLayoutContent, XDSLayoutPanel} from '@xds/core/Layout';
import {XDSDivider} from '@xds/core/Divider';
import {XDSIcon} from '@xds/core/Icon';
import {
  SparklesIcon,
  ClipboardDocumentIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function TechnicalDocumentationPage() {
  return (
    <XDSLayout
      height="fill"
      contentWidth={960}
      start={
        <XDSLayoutPanel hasDivider padding={0}>
          <XDSSideNav header={<XDSSideNavHeading heading="Product Name" />}>
            <XDSSideNavSection title="Navigation" isHeaderHidden>
              <XDSSideNavItem label="Home" />
              <XDSSideNavItem label="Getting started" isSelected />
            </XDSSideNavSection>
          </XDSSideNav>
        </XDSLayoutPanel>
      }
      content={
        <XDSLayoutContent padding={8}>
          <XDSVStack gap={8}>
            <XDSVStack gap={2}>
              <XDSText type="display-1">
                Getting started with Product Name
              </XDSText>
              <XDSText type="supporting" color="secondary">
                Last updated March 30, 2026
              </XDSText>
              <XDSText type="body">
                Install the package, configure your theme, and build your first
                component in three steps.
              </XDSText>
            </XDSVStack>

            <XDSCard>
              <XDSVStack gap={3}>
                <XDSHStack gap={2} vAlign="center">
                  <XDSStackItem size="fill">
                    <XDSHStack gap={2} vAlign="center">
                      <XDSIcon
                        icon={SparklesIcon}
                        size="sm"
                        color="secondary"
                      />
                      <XDSText type="body" weight="semibold">
                        AI Assistance
                      </XDSText>
                    </XDSHStack>
                  </XDSStackItem>
                  <XDSButton
                    label="Copy prompt"
                    variant="ghost"
                    size="sm"
                    icon={<XDSIcon icon={ClipboardDocumentIcon} />}
                    onClick={() => {
                      void navigator.clipboard.writeText(
                        'Help me get set up with Product Name. Based on my project, do the following: 1. Install @xds/core and the StyleX compiler. 2. Wrap my app in XDSThemeProvider. 3. Replace one existing component with an XDS equivalent. After setup, suggest relevant next steps based on my project.',
                      );
                    }}
                  />
                  <XDSDropdownMenu
                    button={{
                      label: 'More options',
                      variant: 'ghost',
                      size: 'sm',
                      isIconOnly: true,
                      icon: <XDSIcon icon={ChevronDownIcon} />,
                    }}
                    items={[
                      {label: 'Open in v0', onClick: () => {}},
                      {label: 'Open in Claude', onClick: () => {}},
                      {label: 'Open in ChatGPT', onClick: () => {}},
                      {label: 'Open in Cursor', onClick: () => {}},
                    ]}
                  />
                </XDSHStack>
                <XDSText type="body" color="secondary">
                  Help me get set up with Product Name. Based on my project, do
                  the following: 1. Install @xds/core and the StyleX compiler.
                  2. Wrap my app in XDSThemeProvider. 3. Replace one existing
                  component with an XDS equivalent.
                </XDSText>
              </XDSVStack>
            </XDSCard>

            <XDSVStack gap={4}>
              <XDSHeading level={2}>Prerequisites</XDSHeading>
              <XDSList density="compact" listStyle="disc">
                <XDSListItem label="Node.js 18+" />
                <XDSListItem label="React 18 or 19" />
                <XDSListItem label="A package manager (npm, yarn, or pnpm)" />
              </XDSList>
            </XDSVStack>

            <XDSDivider />

            <XDSVStack gap={4}>
              <XDSHeading level={2}>Install the package</XDSHeading>
              <XDSText type="body">
                Every project starts with installing the core package. This
                gives you access to all components, tokens, and utilities.
              </XDSText>
              <XDSVStack gap={2}>
                <XDSText type="body" weight="bold">
                  Step 1: Install the core package
                </XDSText>
                <XDSCard padding={0}>
                  <XDSCodeBlock code="npm install @xds/core" language="bash" />
                </XDSCard>
              </XDSVStack>
              <XDSVStack gap={2}>
                <XDSText type="body" weight="bold">
                  Step 2: Add the StyleX compiler
                </XDSText>
                <XDSText type="body" color="secondary">
                  XDS uses StyleX for styling. Add the compiler plugin to your
                  build configuration.
                </XDSText>
                <XDSCard padding={0}>
                  <XDSCodeBlock
                    code="npm install @stylexjs/babel-plugin"
                    language="bash"
                  />
                </XDSCard>
              </XDSVStack>
              <XDSVStack gap={2}>
                <XDSText type="body" weight="bold">
                  Step 3: Import your first component
                </XDSText>
                <XDSCard padding={0}>
                  <XDSCodeBlock
                    code={`import { XDSButton } from '@xds/core/Button';

export default function App() {
  return <XDSButton label="Hello XDS" variant="primary" />;
}`}
                    language="tsx"
                  />
                </XDSCard>
              </XDSVStack>
            </XDSVStack>

            <XDSDivider />

            <XDSVStack gap={4}>
              <XDSHeading level={2}>Configure theming</XDSHeading>
              <XDSText type="body">
                XDS ships with a default theme that works out of the box. To
                customize colors, typography, and spacing, wrap your app in a
                theme provider.
              </XDSText>
              <XDSCard padding={0}>
                <XDSCodeBlock
                  code={`import { XDSThemeProvider } from '@xds/core/Theme';

export default function App({ children }) {
  return (
    <XDSThemeProvider theme="default">
      {children}
    </XDSThemeProvider>
  );
}`}
                  language="tsx"
                />
              </XDSCard>
              <XDSText type="body" color="secondary">
                See the theming guide for the full list of customizable tokens.
              </XDSText>
            </XDSVStack>

            <XDSDivider />

            <XDSVStack gap={4}>
              <XDSHeading level={2}>Next steps</XDSHeading>
              <XDSList density="compact" listStyle="disc">
                <XDSListItem label="Fundamental concepts — How theming, layout, and composition work" />
                <XDSListItem label="Component API reference — Props, variants, and examples for every component" />
                <XDSListItem label="Accessibility — Built-in a11y features and ARIA patterns" />
                <XDSListItem label="CLI tools — Scaffold projects and manage templates" />
                <XDSListItem label="Design tokens — Colors, spacing, typography, and sizing" />
              </XDSList>
            </XDSVStack>
          </XDSVStack>
        </XDSLayoutContent>
      }
    />
  );
}
