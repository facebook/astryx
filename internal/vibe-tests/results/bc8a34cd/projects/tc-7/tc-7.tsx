// Copyright (c) Meta Platforms, Inc. and affiliates.

import {VStack, HStack} from '@astryxdesign/core/Stack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Theme} from '@astryxdesign/core/theme';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {SideNav, SideNavItem, SideNavSection, SideNavHeading} from '@astryxdesign/core/SideNav';
import {defineTheme} from '@astryxdesign/core/theme';

const darkTheme = defineTheme({
  color: {
    accent: '#6366f1',
    background: '#1a1a2e',
    'background-surface': '#16213e',
    foreground: '#e2e8f0',
    'foreground-secondary': '#94a3b8',
    border: '#334155',
  },
});

const lightTheme = defineTheme({
  color: {
    accent: '#4f46e5',
    background: '#ffffff',
    'background-surface': '#f8fafc',
    foreground: '#1e293b',
    'foreground-secondary': '#64748b',
    border: '#e2e8f0',
  },
});

export default function NestedThemes() {
  return (
    <div className="flex h-screen">
      <Theme theme={darkTheme} mode="dark">
        <SideNav>
          <SideNavSection>
            <SideNavHeading>Navigation</SideNavHeading>
            <SideNavItem href="#" isSelected>Dashboard</SideNavItem>
            <SideNavItem href="#">Projects</SideNavItem>
            <SideNavItem href="#">Team</SideNavItem>
            <SideNavItem href="#">Settings</SideNavItem>
          </SideNavSection>
        </SideNav>
      </Theme>

      <Theme theme={lightTheme} mode="light">
        <div className="flex-1 p-6 space-y-4">
          <Heading level={1}>Dashboard</Heading>
          <Text>Light theme content next to dark sidebar. Each Theme scopes its tokens.</Text>
          <Card padding={4}>
            <VStack gap={2}>
              <Heading level={3}>Nested Theme Demo</Heading>
              <Text type="supporting">Wrap any section in Theme for a different visual treatment.</Text>
              <Button label="Action" variant="primary" />
            </VStack>
          </Card>
        </div>
      </Theme>
    </div>
  );
}
