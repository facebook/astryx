// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from '@astryxdesign/core/SideNav';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {List, ListItem} from '@astryxdesign/core/List';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {HStack, VStack, StackItem} from '@astryxdesign/core/Stack';
import {Layout, LayoutContent, LayoutPanel} from '@astryxdesign/core/Layout';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
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
    <Layout
      height="fill"
      contentWidth={960}
      start={
        <LayoutPanel hasDivider padding={0}>
          <SideNav header={<SideNavHeading heading="Product Name" />}>
            <SideNavSection title="Navigation" isHeaderHidden>
              <SideNavItem label="Home" />
              <SideNavItem label="Getting started" isSelected />
            </SideNavSection>
          </SideNav>
        </LayoutPanel>
      }
      content={
        <LayoutContent padding={8}>
          <VStack gap={8}>
            <VStack gap={2}>
              <Text type="display-1">
                Getting started with Product Name
              </Text>
              <Text type="supporting" color="secondary">
                Last updated March 30, 2026
              </Text>
              <Text type="body">
                Install the package, configure your theme, and build your first
                component in three steps.
              </Text>
            </VStack>

            <Card>
              <VStack gap={3}>
                <HStack gap={2} vAlign="center">
                  <StackItem size="fill">
                    <HStack gap={2} vAlign="center">
                      <Icon
                        icon={SparklesIcon}
                        size="sm"
                        color="secondary"
                      />
                      <Text type="body" weight="semibold">
                        AI Assistance
                      </Text>
                    </HStack>
                  </StackItem>
                  <Button
                    label="Copy prompt"
                    variant="ghost"
                    size="sm"
                    icon={<Icon icon={ClipboardDocumentIcon} />}
                    onClick={() => {
                      void navigator.clipboard.writeText(
                        'Help me get set up with Product Name. Based on my project, do the following: 1. Install @astryxdesign/core and the StyleX compiler. 2. Wrap my app in ThemeProvider. 3. Replace one existing component with an XDS equivalent. After setup, suggest relevant next steps based on my project.',
                      );
                    }}
                  />
                  <DropdownMenu
                    button={{
                      label: 'More options',
                      variant: 'ghost',
                      size: 'sm',
                      isIconOnly: true,
                      icon: <Icon icon={ChevronDownIcon} />,
                    }}
                    items={[
                      {label: 'Open in v0', onClick: () => {}},
                      {label: 'Open in Claude', onClick: () => {}},
                      {label: 'Open in ChatGPT', onClick: () => {}},
                      {label: 'Open in Cursor', onClick: () => {}},
                    ]}
                  />
                </HStack>
                <Text type="body" color="secondary">
                  Help me get set up with Product Name. Based on my project, do
                  the following: 1. Install @astryxdesign/core and the StyleX compiler.
                  2. Wrap my app in ThemeProvider. 3. Replace one existing
                  component with an XDS equivalent.
                </Text>
              </VStack>
            </Card>

            <VStack gap={4}>
              <Heading level={2}>Prerequisites</Heading>
              <List density="compact" listStyle="disc">
                <ListItem label="Node.js 18+" />
                <ListItem label="React 18 or 19" />
                <ListItem label="A package manager (npm, yarn, or pnpm)" />
              </List>
            </VStack>

            <Divider />

            <VStack gap={4}>
              <Heading level={2}>Install the package</Heading>
              <Text type="body">
                Every project starts with installing the core package. This
                gives you access to all components, tokens, and utilities.
              </Text>
              <VStack gap={2}>
                <Text type="body" weight="bold">
                  Step 1: Install the core package
                </Text>
                <Card padding={0}>
                  <CodeBlock code="npm install @astryxdesign/core" language="bash" />
                </Card>
              </VStack>
              <VStack gap={2}>
                <Text type="body" weight="bold">
                  Step 2: Add the StyleX compiler
                </Text>
                <Text type="body" color="secondary">
                  XDS uses StyleX for styling. Add the compiler plugin to your
                  build configuration.
                </Text>
                <Card padding={0}>
                  <CodeBlock
                    code="npm install @stylexjs/babel-plugin"
                    language="bash"
                  />
                </Card>
              </VStack>
              <VStack gap={2}>
                <Text type="body" weight="bold">
                  Step 3: Import your first component
                </Text>
                <Card padding={0}>
                  <CodeBlock
                    code={`import { Button } from '@astryxdesign/core/Button';

export default function App() {
  return <Button label="Hello XDS" variant="primary" />;
}`}
                    language="tsx"
                  />
                </Card>
              </VStack>
            </VStack>

            <Divider />

            <VStack gap={4}>
              <Heading level={2}>Configure theming</Heading>
              <Text type="body">
                XDS ships with a default theme that works out of the box. To
                customize colors, typography, and spacing, wrap your app in a
                theme provider.
              </Text>
              <Card padding={0}>
                <CodeBlock
                  code={`import { ThemeProvider } from '@astryxdesign/core/Theme';

export default function App({ children }) {
  return (
    <ThemeProvider theme="default">
      {children}
    </ThemeProvider>
  );
}`}
                  language="tsx"
                />
              </Card>
              <Text type="body" color="secondary">
                See the theming guide for the full list of customizable tokens.
              </Text>
            </VStack>

            <Divider />

            <VStack gap={4}>
              <Heading level={2}>Next steps</Heading>
              <List density="compact" listStyle="disc">
                <ListItem label="Fundamental concepts — How theming, layout, and composition work" />
                <ListItem label="Component API reference — Props, variants, and examples for every component" />
                <ListItem label="Accessibility — Built-in a11y features and ARIA patterns" />
                <ListItem label="CLI tools — Scaffold projects and manage templates" />
                <ListItem label="Design tokens — Colors, spacing, typography, and sizing" />
              </List>
            </VStack>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
