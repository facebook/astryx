// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useCallback, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {List, ListItem} from '@astryxdesign/core/List';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Selector} from '@astryxdesign/core/Selector';
import {HStack, VStack, StackItem} from '@astryxdesign/core/Stack';
import {Layout, LayoutContent, LayoutPanel} from '@astryxdesign/core/Layout';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Outline, type OutlineItem} from '@astryxdesign/core/Outline';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  SparklesIcon,
  ClipboardDocumentIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const OUTLINE_ITEMS: OutlineItem[] = [
  {id: 'prerequisites', label: 'Prerequisites', level: 2},
  {id: 'install-package', label: 'Install the package', level: 2},
  {id: 'configure-theming', label: 'Configure theming', level: 2},
  {id: 'next-steps', label: 'Next steps', level: 2},
];

const OUTLINE_OPTIONS = OUTLINE_ITEMS.map(item => ({
  value: item.id,
  label: item.label,
}));

const styles = stylex.create({
  outlinePanel: {
    position: 'sticky',
    top: 24,
    alignSelf: 'start',
    paddingBlockStart: 120,
  },
});

export default function TechnicalDocumentationPage() {
  const [activeId, setActiveId] = useState<string | undefined>(
    OUTLINE_ITEMS[0]?.id,
  );
  const isMobile = useMediaQuery('(max-width: 768px)');

  const scrollToId = useCallback((id: string) => {
    setActiveId(id);
    const target = document.getElementById(id);
    if (target != null) {
      target.scrollIntoView({behavior: 'smooth', block: 'start'});
      window.history.pushState(null, '', `#${id}`);
    }
  }, []);

  return (
    <Layout
      height="auto"
      contentWidth={960}
      end={
        isMobile ? undefined : (
          <LayoutPanel
            isScrollable={false}
            label="On this page"
            role="complementary"
            xstyle={styles.outlinePanel}>
            <Outline items={OUTLINE_ITEMS} onActiveIdChange={setActiveId} />
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent isScrollable={false} padding={8}>
          <VStack gap={8}>
            <VStack gap={2}>
              <Text type="display-1">Getting started with Product Name</Text>
              <Text type="supporting" color="secondary">
                Last updated March 30, 2026
              </Text>
              {isMobile && (
                <Selector
                  label="On this page"
                  isLabelHidden
                  options={OUTLINE_OPTIONS}
                  value={activeId}
                  onChange={scrollToId}
                  width="100%"
                />
              )}
            </VStack>

            <Card>
              <VStack gap={3}>
                <HStack gap={2} vAlign="center">
                  <StackItem size="fill">
                    <HStack gap={2} vAlign="center">
                      <Icon icon={SparklesIcon} size="sm" color="secondary" />
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
                        'Help me get set up with Product Name. Based on my project, do the following: 1. Install @astryxdesign/core and the StyleX compiler. 2. Wrap my app in ThemeProvider. 3. Replace one existing component with an Astryx equivalent. After setup, suggest relevant next steps based on my project.',
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
                  component with an Astryx equivalent.
                </Text>
              </VStack>
            </Card>

            <VStack gap={4}>
              <Heading id="prerequisites" level={2}>
                Prerequisites
              </Heading>
              <List density="compact" listStyle="disc">
                <ListItem label="Node.js 18+" />
                <ListItem label="React 18 or 19" />
                <ListItem label="A package manager (npm, yarn, or pnpm)" />
              </List>
            </VStack>

            <Divider />

            <VStack gap={4}>
              <Heading id="install-package" level={2}>
                Install the package
              </Heading>
              <Text type="body">
                Every project starts with installing the core package. This
                gives you access to all components, tokens, and utilities.
              </Text>
              <VStack gap={2}>
                <Text type="body" weight="bold">
                  Step 1: Install the core package
                </Text>
                <CodeBlock
                  code="npm install @astryxdesign/core"
                  language="bash"
                  width="100%"
                />
              </VStack>
              <VStack gap={2}>
                <Text type="body" weight="bold">
                  Step 2: Add the StyleX compiler
                </Text>
                <Text type="body" color="secondary">
                  Astryx uses StyleX for styling. Add the compiler plugin to your
                  build configuration.
                </Text>
                <CodeBlock
                  code="npm install @stylexjs/babel-plugin"
                  language="bash"
                  width="100%"
                />
              </VStack>
              <VStack gap={2}>
                <Text type="body" weight="bold">
                  Step 3: Import your first component
                </Text>
                <CodeBlock
                  code={`import { Button } from '@astryxdesign/core/Button';

export default function App() {
  return <Button label="Hello Astryx" variant="primary" />;
}`}
                  language="tsx"
                  width="100%"
                />
              </VStack>
            </VStack>

            <Divider />

            <VStack gap={4}>
              <Heading id="configure-theming" level={2}>
                Configure theming
              </Heading>
              <Text type="body">
                Astryx ships with a default theme that works out of the box. To
                customize colors, typography, and spacing, wrap your app in a
                theme provider.
              </Text>
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
                width="100%"
              />
              <Text type="body" color="secondary">
                See the theming guide for the full list of customizable tokens.
              </Text>
            </VStack>

            <Divider />

            <VStack gap={4}>
              <Heading id="next-steps" level={2}>
                Next steps
              </Heading>
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
